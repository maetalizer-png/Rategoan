import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { gemvFusedInt4 } from '../../raget-neural/runtime/int4-session.js';
import { readScratchBlock } from '../../raget-neural/runtime/weight-cache.js';
import { bpeShell } from '../../raget-neural/bpe-shell.js';
import { LLMSampler } from '../../raget-neural/llm-sampler.js';
import { buildDynamicThoughts, laneOf } from '../../../js/ui/thought-card.js';
import { grepVfs, readVfsContext, applySurgicalPatch } from '../../../js/studio/studio-agent.js';
import { synthesizeCode, parseFenceFiles } from '../../../js/studio/neural-synthesizer.js';
import { resolveAutonomousConnector } from '../../../js/connectors/tool-card.js';
import { webSearch } from '../../../vault/web/web-search.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }
function gone(rel) { return !existsSync(new URL(rel, root)); }

test('DOD-40.01 sampai 40.08 carryover Antrine 15 dan 10 penguatan keamanan P0', () => {
  const indexHtml = read('index.html');
  const previewHtml = read('studio-preview.html');
  const provider = read('raget/raget-neural/neural-provider.js');
  const gpu = read('raget/raget-neural/runtime/webgpu-runner.js');
  const settings = read('js/account/settings.js');
  const shareJs = read('vault/export/share.js');
  const artifactJs = read('js/ui/artifact.js');
  const artifactsPageJs = read('js/artifacts/artifacts.js');
  const collectionJs = read('js/collection/collection.js');
  assert.doesNotMatch(indexHtml, /script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(indexHtml, /script-src[^;]*'unsafe-eval'/);
  assert.match(indexHtml, /font-src 'self'/);
  assert.match(indexHtml, /frame-src 'self' blob:/);
  assert.match(indexHtml, /worker-src 'self'/);
  assert.match(indexHtml, /https:\/\/api\.openalex\.org/);
  assert.match(indexHtml, /https:\/\/hn\.algolia\.com/);
  assert.match(previewHtml, /Content-Security-Policy/);
  assert.match(provider, /clearPendingTimers\(item\)/);
  assert.match(provider, /op:\s*'verify_session'/);
  assert.equal(gone('raget/raget-neural/neural-synthesizer-chat.js'), true);
  assert.equal(provider.includes('neural-synthesizer-chat'), false);
  assert.match(gpu, /entry\.bufA\.destroy\(\)/);
  assert.match(gpu, /function ensureWaveSlot/);
  assert.match(settings, /Rategoan version 1\.0/);
  assert.match(shareJs, /sanitizeReportBody/);
  assert.match(shareJs, /noopener,noreferrer/);
  assert.match(artifactJs, /Content-Security-Policy/);
  assert.match(artifactsPageJs, /Content-Security-Policy/);
  assert.match(collectionJs, /escapeHtml\(x\.id\)/);
  assert.match(collectionJs, /escapeHtml\(x\.kind\)/);
});

test('DOD-40.09 gemvFusedInt4 Uint32 8-nibble unrolled dan readScratchBlock 9-slot zero-GC', () => {
  const sessionSrc = read('raget/raget-neural/runtime/int4-session.js');
  assert.equal(sessionSrc.includes('generated.length >= 2'), false);
  assert.match(sessionSrc, /new Uint32Array\(packed\.buffer/);
  assert.match(sessionSrc, /SMALL_F32_CAP = 64 \* 1024 \* 1024/);
  const rows = 64;
  const cols = 1536;
  const packed = new Uint8Array((rows * cols) / 2);
  for (let i = 0; i < packed.length; i += 1) packed[i] = (i * 37 + 13) & 0xff;
  const blocks = (rows * cols) / 32;
  const scales = new Float32Array(blocks);
  const zeros = new Float32Array(blocks);
  for (let b = 0; b < blocks; b += 1) {
    scales[b] = 0.015625 * ((b % 7) + 1);
    zeros[b] = (b % 5) + 4;
  }
  const x = new Float32Array(cols);
  for (let c = 0; c < cols; c += 1) x[c] = ((c % 11) - 5) * 0.125;
  const yFast = new Float32Array(rows);
  const ok = gemvFusedInt4(packed, scales, zeros, rows, cols, x, yFast, null, null);
  assert.equal(ok, true);
  for (let r = 0; r < rows; r += 1) {
    let ref = 0;
    const rBase = r * cols;
    for (let c = 0; c < cols; c += 1) {
      const i = rBase + c;
      const byte = packed[i >> 1] || 0;
      const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
      const blk = i >> 5;
      ref += (q - zeros[blk]) * scales[blk] * x[c];
    }
    assert.ok(Math.abs(yFast[r] - ref) < 1e-3, 'baris ' + r + ' melenceng');
  }
  const slots = new Array(9).fill(null);
  const sync = {
    read(buf) {
      buf.fill(11);
      return buf.byteLength;
    },
  };
  const s0a = readScratchBlock(sync, 0, 1024, slots, 0);
  const s0b = readScratchBlock(sync, 1024, 512, slots, 0);
  const s3 = readScratchBlock(sync, 2048, 512, slots, 3);
  assert.equal(s0a.buffer, s0b.buffer);
  assert.notEqual(s0b.buffer, s3.buffer);
  assert.equal(s0b.byteLength, 512);
  assert.equal(s0b[0], 11);
});

test('DOD-40.10 opfs-writer-worker dan model-downloader bebas fsync tengah unduhan', () => {
  const worker = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  assert.match(worker, /sync\.flush\(\)/);
  assert.match(worker, /sync\.close\(\)/);
  assert.match(down, /const direct = expect > 0 \? new Uint8Array\(expect\) : null/);
  assert.match(down, /const maxPrimed = concurrency \+ PREFETCH_AHEAD/);
});

test('DOD-40.11 webSearch menggabungkan multi-sumber secara paralel', async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async (url) => {
    const u = String(url);
    if (u.includes('/api/connectors/web/search')) {
      return {
        ok: true,
        json: async () => ({
          results: [
            { title: 'Arsitektur WebGPU Modern', snippet: 'Komputasi paralel di peramban.', url: 'https://example.org/webgpu-1' },
            { title: 'Optimasi Kuantisasi INT4', snippet: 'Inferensi cepat di tepi.', url: 'https://example.org/int4-2' },
          ],
        }),
      };
    }
    if (u.includes('wikidata.org')) {
      return {
        ok: true,
        json: async () => ({
          search: [{ id: 'Q123', label: 'WebGPU', description: 'API grafis dan komputasi web modern', concepturi: 'https://www.wikidata.org/wiki/Q123' }],
        }),
      };
    }
    if (u.includes('api.openalex.org')) {
      return {
        ok: true,
        json: async () => ({
          results: [{ display_name: 'Fast Browser LLM Inference', publication_year: 2026, cited_by_count: 42, doi: 'https://doi.org/10.1000/llm2026' }],
        }),
      };
    }
    if (u.includes('hn.algolia.com')) {
      return {
        ok: true,
        json: async () => ({
          hits: [{ title: 'Show HN: Local 1.5B INT4 in Browser', points: 310, author: 'raget', url: 'https://news.ycombinator.com/item?id=999' }],
        }),
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  };
  try {
    const res = await webSearch.search('WebGPU INT4');
    assert.equal(res.ok, true);
    assert.ok(Array.isArray(res.sources));
    assert.ok(res.sources.length >= 4, 'sumber harus >= 4, dapat ' + res.sources.length);
  } finally {
    globalThis.fetch = prev;
  }
});

test('DOD-40.12 Studio Kode memiliki grepVfs, readVfsContext, applySurgicalPatch, dan neuralGenerate', async () => {
  const vfsFiles = {
    'index.html': '<!doctype html><html><body><h1>Judul Lama</h1></body></html>',
    'style.css': 'body { background: #fff; }',
    'script.js': 'function hitungTotal(a, b) { return a + b; }',
  };
  const hits = grepVfs(vfsFiles, 'hitungTotal');
  assert.equal(hits.length, 1);
  assert.equal(hits[0].file, '/script.js');
  assert.equal(hits[0].line, 1);
  const ctx = readVfsContext(vfsFiles, 'hitungTotal');
  assert.match(ctx.summary, /\/script\.js/);
  const copy = Object.assign({}, vfsFiles);
  assert.equal(applySurgicalPatch(copy, 'script.js', 'a + b', 'a * b'), true);
  assert.match(copy['script.js'], /a \* b/);
  const synth = await synthesizeCode('buat modul python analisis', vfsFiles, {
    neuralGenerate: async () => '```main.py\ndef jalan():\n    return 42\n```',
  });
  assert.equal(synth.ok, true);
  assert.match(synth.files['main.py'], /def jalan/);
  assert.ok(parseFenceFiles('```main.py\nprint(1)\n```'));
});

test('DOD-40.13 jembatan konektor otonom mengenali GitHub, Drive, Gmail, dan Kalender', () => {
  assert.equal(resolveAutonomousConnector('halo apa kabar'), null);
  assert.equal(resolveAutonomousConnector('cek repo github saya').name, 'github_list_repos');
  assert.equal(resolveAutonomousConnector('cari berkas drive laporan').name, 'drive_search');
  assert.equal(resolveAutonomousConnector('cek kotak masuk gmail terbaru').name, 'gmail_list_messages');
  assert.equal(resolveAutonomousConnector('lihat jadwal di google calendar').name, 'calendar_list_events');
});

test('DOD-40.14 visualisasi berpikir tanpa kartu ala Grok dengan titik biru zen-dot dan sampler O(V + K log K)', async () => {
  const thoughtCard = read('js/ui/thought-card.js');
  const thoughtCss = read('css/ui/thought.css');
  const connectCss = read('css/ui/connect.css');
  const chatJs = read('js/chat/chat.js');
  const attachJs = read('js/sheets/attach.js');
  assert.match(thoughtCard, /box\.open = container\.dataset\.userOpened === '1'/);
  assert.match(thoughtCard, /zen-dot thought-dot/);
  assert.match(thoughtCard, /Sedang berpikir…/);
  assert.match(thoughtCard, /Berpikir selama /);
  assert.match(thoughtCard, /buildDynamicThoughts/);
  assert.match(thoughtCss, /border:\s*none\s*!important/);
  assert.match(thoughtCss, /background:\s*transparent\s*!important/);
  assert.match(chatJs, /hasRunningThought/);
  assert.match(chatJs, /live-stream-body/);
  assert.match(connectCss, /@media \(max-width: 640px\)/);
  assert.equal(attachJs.includes('mode-chip'), false);
  const halloIds = bpeShell.encodeBytes('hallo');
  assert.deepEqual(halloIds, [109, 25201, 28020]);
  const dyn = buildDynamicThoughts('hallo', { websearch: false });
  assert.equal(dyn.length, 3);
  assert.equal(laneOf({ kind: 'CONNECT', text: 'Menghubungkan ke GitHub' }), 'connect');
  const logits = new Float32Array(32000).fill(-10);
  logits[142] = 25;
  logits[999] = 12;
  const picked = LLMSampler.sampleAdaptive(Array.from(logits), { temperature: 0.1, topK: 8, topP: 0.9, repetitionPenalty: 1.0 });
  assert.equal(picked, 142);
});
