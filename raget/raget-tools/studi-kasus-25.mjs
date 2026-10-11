import assert from 'node:assert/strict';
import http from 'node:http';
import crypto from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bpeShell } from '../raget-neural/bpe-shell.js';
import { LLMInference } from '../raget-neural/llm-inference.js';
import { LLMSampler } from '../raget-neural/llm-sampler.js';
import { searchInt8Top1 } from '../raget-database/vector-quantizer.js';
import { buildHnsw, hybridSearch, meanReciprocalRank, partitionNodes } from '../raget-database/hybrid-search.js';
import { whatsappImporter } from '../../vault/whatsapp/importer.js';
import { parseArithmeticAST } from '../../js/connectors/local-tools.js';
import { createMcpClient } from '../../js/connectors/mcp-bridge.js';
import { createReplica, insertAt, deleteAt, syncPair, readDoc } from '../../js/artifacts/canvas-editor.js';
import { createVoicePipeline } from '../../js/voice/voice-pipeline.js';
import { crashAfterPrepare, bootRecover, WAL_PHASES } from '../../js/studio/vfs-transaction.js';
import { VfsGit } from '../../js/studio/vfs-git.js';
import { memoryAll, JOURNAL_STORE, putRow, allRows, HNSW_NODES } from '../raget-database/durable-store.js';
import { previewSrcdoc } from '../../js/studio/sandbox-runner.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const notes = [];
function note(ok, label, detail) {
  notes.push({ ok, label, detail });
  console.log((ok ? 'LULUS' : 'GAGAL') + '  ' + label + (detail ? '  ' + detail : ''));
  if (!ok) process.exitCode = 1;
}

function decodeFrame(buf) {
  if (buf.length < 6 || (buf[0] & 0x0f) !== 1) return null;
  const len = buf[1] & 0x7f;
  const maskOff = 2;
  const dataOff = maskOff + 4;
  if ((buf[1] & 0x80) === 0 || buf.length < dataOff + len) return null;
  const mask = buf.subarray(maskOff, dataOff);
  const data = Buffer.alloc(len);
  for (let i = 0; i < len; i += 1) data[i] = buf[dataOff + i] ^ mask[i % 4];
  return data.toString('utf8');
}

function encodeFrame(text) {
  const payload = Buffer.from(text);
  const header = Buffer.alloc(2);
  header[0] = 0x81;
  header[1] = payload.length;
  return Buffer.concat([header, payload]);
}

function startRpc() {
  return new Promise((resolve) => {
    const server = http.createServer();
    server.on('upgrade', (req, socket) => {
      const key = req.headers['sec-websocket-key'];
      const accept = crypto.createHash('sha1').update(String(key) + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
      socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + accept + '\r\n\r\n');
      socket.on('data', (buf) => {
        const msg = decodeFrame(buf);
        if (!msg) return;
        const rpc = JSON.parse(msg);
        const reply = JSON.stringify({ jsonrpc: '2.0', id: rpc.id, result: { method: rpc.method, params: rpc.params } });
        socket.write(encodeFrame(reply));
      });
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

const samples = ['Halo, Jakarta.', 'Apa kabar?', 'hello world'];
let round = true;
samples.forEach((text) => {
  if (bpeShell.decodeIds(bpeShell.encodeBytes(text)) !== text) round = false;
});
note(bpeShell.buildShell().idToToken.length === 32000 && round, 'BPE 32000 bolak-balik', String(bpeShell.buildShell().idToToken.length));
note(JSON.stringify(LLMSampler.SAMPLE_DEFAULTS) === JSON.stringify({ topK: 40, topP: 0.9, temperature: 0.7, repetitionPenalty: 1.12 }), 'sampler adaptif');

const shell = bpeShell.buildShell();
const eos = bpeShell.eosIds()[0];
const wanted = bpeShell.encodeBytes('Halo');
let step = 0;
const chunks = [];
for await (const part of LLMInference.generateTextStream('Pengguna: hai', {
  maxNewTokens: wanted.length + 1,
  temperature: 0,
  topK: 1,
  topP: 1,
  repetitionPenalty: 1,
  forward() {
    const row = new Float32Array(shell.idToToken.length);
    row.fill(-20);
    const next = step < wanted.length ? wanted[step] : eos;
    step += 1;
    row[next] = 5;
    return row;
  },
})) chunks.push(part);
const streamed = chunks.join('');
note(streamed === 'Halo' && chunks.every((part) => !/^\d+$/.test(part)), 'aliran UTF-8 tanpa id mentah', streamed);

const count = 10000;
const dim = 384;
const matrix = new Int8Array(count * dim);
const query = new Int8Array(dim);
query.fill(127);
matrix.set(query, 9999 * dim);
searchInt8Top1(matrix, count, dim, query);
const t0 = performance.now();
const hit = searchInt8Top1(matrix, count, dim, query);
note(hit.id === 9999 && performance.now() - t0 < 8.5, 'int8 10000x384', hit.id + ' ' + (performance.now() - t0).toFixed(2) + 'ms');

const waT = performance.now();
const wa = whatsappImporter.importWhatsApp('[01/01/2026 12:00] ' + 'A'.repeat(10 * 1024 * 1024));
note(wa.ok === false && performance.now() - waT < 50, 'whatsapp 10MB', (performance.now() - waT).toFixed(2) + 'ms');
const astT = performance.now();
let astOk = false;
try { parseArithmeticAST('1+'.repeat(5 * 1024 * 1024) + '1'); } catch (e) { astOk = /terlalu panjang/.test(e.message); }
note(astOk && performance.now() - astT < 50, 'AST 10MB', (performance.now() - astT).toFixed(2) + 'ms');

const left = createReplica('a');
const right = createReplica('b');
insertAt(left, 0, 'Halo');
insertAt(right, 0, 'Jakarta');
deleteAt(right, 0);
const synced = syncPair(left, right);
note(synced.left === synced.right && synced.left.includes('akarta') && !synced.left.includes('J'), 'CRDT dua arah', synced.left + '|' + synced.right);

const preview = previewSrcdoc({ 'index.html': '<html><head></head><body></body></html>' }, {
  fields: [],
  scrollY: 0,
  session: [{ key: 'draf', value: 'jakarta' }],
});
note(preview.includes('sessionStorage.setItem') && preview.includes('jakarta'), 'sessionStorage pratinjau');

const voice = createVoicePipeline();
voice.start();
const heard = voice.transcribe(new Float32Array(1600).fill(0.2));
const said = voice.speak('Halo');
note(voice.engines.weights === false && heard.ms < 300 && said.ms < 300 && said.weights === false, 'suara tanpa bobot', heard.ms.toFixed(2) + 'ms');

const docs = [];
for (let i = 0; i < 20; i += 1) {
  docs.push({ id: 'd' + i, text: i === 3 ? 'jakarta ibu kota' : 'catatan ' + i, vector: [i === 3 ? 1 : 0, 0.01] });
}
const index = buildHnsw(docs);
const fused = hybridSearch(index, 'jakarta', [1, 0]);
const mrr = meanReciprocalRank([fused], ['d3']);
note(mrr > 0.94, 'MRR hibrida', String(mrr));
const parts = partitionNodes({ count: 1000, dim: 384 }, 500);
note(parts.length === 2 && parts[0].end - parts[0].start === 500 && parts[0].store === 'hnsw_nodes', 'blok HNSW 500');
const nodeT = performance.now();
await putRow(HNSW_NODES, parts[0]);
const saved = await allRows(HNSW_NODES);
note(saved.some((row) => row.id === 'node-0') && performance.now() - nodeT < 50, 'pulih simpul', (performance.now() - nodeT).toFixed(2) + 'ms');

const git = new VfsGit({ '/a.js': 'utuh' });
const id = crashAfterPrepare(git);
const row = memoryAll(JOURNAL_STORE).find((item) => item.id === id);
note(WAL_PHASES[0] === 'PREPARE' && row.phase === 'PREPARE' && row.phases.includes('PREPARE'), 'jurnal WAL');
git.stage('/a.js', 'rusak');
note(await bootRecover(git) === 1 && git.snapshot().get('/a.js') === 'utuh', 'rollback PREPARE');

const rpc = await startRpc();
const port = rpc.address().port;
const client = createMcpClient('ws://127.0.0.1:' + port + '/mcp', 'rahasia');
await client.connect();
const echo = await client.request('tools/list', { lokal: true });
note(client.protocol === 'json-rpc-2.0' && echo.method === 'tools/list' && echo.params.lokal === true, 'MCP websocket nyata', echo.method);
rpc.close();

const staticServer = createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');
  const rel = decodeURIComponent(url.pathname);
  const file = path.normalize(path.join(root, rel === '/' ? '/index.html' : rel));
  if (!file.startsWith(root)) {
    res.writeHead(403);
    res.end();
    return;
  }
  const ext = path.extname(file).toLowerCase();
  const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.woff2': 'font/woff2' };
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': types[ext] || 'application/octet-stream' });
    res.end(body);
  } catch (e) {
    res.writeHead(404);
    res.end('missing');
  }
});
await new Promise((resolve) => staticServer.listen(0, '127.0.0.1', resolve));
const livePort = staticServer.address().port;
const base = 'http://127.0.0.1:' + livePort;
const playwrightMod = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const chromium = playwrightMod.chromium || playwrightMod.default.chromium;
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (err) => errors.push(String(err)));
await page.goto(base + '/', { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#login-email', { timeout: 8000 });
await page.fill('#login-email', 'uji@rategoan.local');
await page.fill('#login-password', 'rahasia');
await page.click('#login-gmail-submit');
await page.waitForSelector('#chat-input', { state: 'visible', timeout: 8000 });
await page.fill('#chat-input', 'halo');
await page.click('#btn-send');
try {
  await page.waitForFunction(() => {
    const text = document.body.innerText || '';
    return /Hai, aku di sini|Halo! Ada yang bisa saya bantu/.test(text);
  }, null, { timeout: 8000 });
} catch (err) {
  const debug = await page.innerText('body').catch(() => '');
  note(false, 'live sapaan', errors.join(' | ') + ' ' + debug.slice(0, 400));
  await browser.close();
  staticServer.close();
  process.exit(1);
}
const body = await page.innerText('#messages');
const stopLabel = await page.getAttribute('#btn-stop', 'aria-label');
note(/Hai, aku di sini|Halo! Ada yang bisa saya bantu/.test(body) && !/^\d+$/m.test(body), 'live sapaan', stopLabel);
note(stopLabel === 'Berhenti menghasilkan', 'tombol berhenti');
const live = await page.evaluate(async () => {
  const p2p = await import('/js/sync/p2p-sync.js');
  const link = p2p.createPeerLink('studio');
  const opened = await link.open({ iceServers: [] });
  const canvas = await import('/js/artifacts/canvas-editor.js');
  const a = canvas.createReplica('a');
  const b = canvas.createReplica('b');
  canvas.insertAt(a, 0, 'A');
  canvas.insertAt(b, 0, 'B');
  const both = canvas.syncPair(a, b);
  const voiceMod = await import('/js/voice/voice-pipeline.js');
  const pipe = voiceMod.createVoicePipeline();
  const t0 = performance.now();
  const heardLive = pipe.transcribe(new Float32Array(800).fill(0.01));
  return {
    webrtc: opened.ok === true && opened.encryption === 'AES-GCM' && opened.channel.readyState === 'connecting',
    crdt: both.left.includes('A') && both.left.includes('B'),
    voiceMs: performance.now() - t0,
    weights: pipe.engines.weights,
    voiceHeard: heardLive.weights === false && heardLive.ms < 300,
  };
});
note(live.webrtc && live.crdt && live.voiceHeard && live.weights === false && errors.length === 0, 'live webrtc crdt suara', JSON.stringify(live) + ' err=' + errors.length);
await browser.close();
staticServer.closeAllConnections?.();
staticServer.close();
const failed = notes.filter((item) => !item.ok);
console.log('STUDI 25 ' + (notes.length - failed.length) + '/' + notes.length);
process.exit(failed.length ? 1 : 0);
