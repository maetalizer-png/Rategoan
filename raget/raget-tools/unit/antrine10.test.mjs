import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import http from 'node:http';
import {
  downloadConcurrentChunks,
  downloadBackoffMs,
  PROGRESS_GRAIN,
  DOWNLOAD_ATTEMPTS,
} from '../../raget-neural/runtime/model-downloader.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }
function gone(rel) { return !existsSync(new URL(rel, root)); }

function concurrentSource() {
  const src = read('raget/raget-neural/runtime/model-downloader.js');
  const at = src.indexOf('export async function downloadConcurrentChunks');
  assert.ok(at > 0);
  return src.slice(at);
}

test('DOD-34.01 sampai 34.05 pipa 256 KB dan kerangka tanpa template', () => {
  const pipe = concurrentSource();
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  assert.equal(PROGRESS_GRAIN, 256 * 1024);
  assert.equal(DOWNLOAD_ATTEMPTS, 4);
  assert.match(down, /getReader/);
  assert.match(pipe, /readResponseBytes/);
  assert.equal(/keepalive:\s*true/.test(pipe), false);
  assert.match(pipe, /\[owned\.transferBuf\]/);
  assert.equal(pipe.includes('store.put'), false);
  assert.equal(pipe.includes('const copy = bytes.slice()'), false);
  assert.match(pipe, /downloadBackoffMs/);
  assert.equal(downloadBackoffMs(0, 0), 200);
  assert.equal(downloadBackoffMs(1, 0), 400);
  assert.equal(downloadBackoffMs(3, 0), 1600);
  assert.equal(downloadBackoffMs(8, 0), 2000);
  assert.ok(downloadBackoffMs(0, 0.5) > 200 && downloadBackoffMs(0, 0.5) < 350);
  assert.equal(gone('raget/raget-deterministic/llm-engine.js'), true);
  assert.equal(gone('raget/raget-deterministic/fuzzy-smalltalk.js'), true);
  assert.equal(gone('raget/raget-deterministic/deterministic-adapter.js'), true);
  assert.equal(gone('raget/raget-deterministic/fact-verifier.js'), true);
  const mesin = read('raget/raget-runtime/mesin.js');
  assert.equal(mesin.includes('otak-template'), false);
  assert.match(mesin, /id: 'otak-1\.0'/);
  for (const rel of [
    'raget/raget-agents/engine-router.js',
    'js/ai/engine.js',
    'raget/raget-agents/core/agent-loop.js',
    'raget/raget-agents/core/agent-stream.js',
  ]) {
    const src = read(rel);
    assert.equal(src.includes('raget-deterministic'), false, rel);
    assert.equal(src.includes('llmEngine'), false, rel);
  }
  assert.match(read('raget/raget-agents/core/agent-stream.js'), /neuralAdapter\.ask/);
  assert.match(read('raget/raget-neural/runtime/opfs-writer-worker.js'), /ArrayBuffer/);
  assert.equal(read('raget/raget-neural/runtime/weight-cache.js').includes('box.put'), false);
  assert.match(read('package.json'), /25\.0\.0-PRODUCTION-GA/);
});

test('retry tiga kali dengan backoff terpotong dan jitter', async () => {
  const delays = [];
  let tries = 0;
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/putus.bin',
    size: 32,
    chunk: 32,
    concurrency: 1,
    sleepImpl: async (ms) => { delays.push(ms); },
    fetchImpl: async () => {
      tries += 1;
      throw new Error('putus');
    },
  }));
  assert.equal(tries, DOWNLOAD_ATTEMPTS);
  assert.equal(delays.length, DOWNLOAD_ATTEMPTS - 1);
  assert.ok(delays[0] >= 200 && delays[0] < 350);
  assert.ok(delays[1] >= 400 && delays[1] < 550);
  assert.ok(delays[2] >= 800 && delays[2] < 950);
});

test('stream sungguhan menggerakkan progres sebelum 150 ms', async () => {
  const total = 1024 * 1024;
  const piece = 64 * 1024;
  const server = http.createServer((req, res) => {
    res.writeHead(206, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(total),
      'Content-Range': 'bytes 0-' + (total - 1) + '/' + total,
      'Accept-Ranges': 'bytes',
    });
    let sent = 0;
    const pump = () => {
      if (sent >= total) {
        res.end();
        return;
      }
      const n = Math.min(piece, total - sent);
      const ok = res.write(Buffer.alloc(n, 3));
      sent += n;
      if (sent >= total) {
        res.end();
        return;
      }
      if (ok) setTimeout(pump, 0);
      else res.once('drain', pump);
    };
    pump();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  const marks = [];
  const t0 = Date.now();
  let first = 0;
  try {
    await downloadConcurrentChunks({
      url: 'http://127.0.0.1:' + port + '/w.bin',
      size: total,
      chunk: total,
      concurrency: 1,
      diskWrite: async () => {},
      onProgress: (detail) => {
        marks.push(detail.loaded);
        if (!first && detail.loaded > 0) first = Date.now() - t0;
      },
    });
  } finally {
    server.close();
  }
  assert.ok(first > 0 && first < 150, 'progres pertama ' + first + ' ms');
  assert.ok(marks[0] > 0 && marks[0] <= PROGRESS_GRAIN, 'butir pertama ' + marks[0]);
  assert.ok(marks.some((n) => n >= PROGRESS_GRAIN && n < total));
});

test('postMessage memakai ArrayBuffer yang bisa ditransfer', async () => {
  const seen = [];
  class FakeWorker {
    constructor() { this.listeners = []; }
    postMessage(data, transfer) {
      seen.push({ data: data, transfer: transfer || [] });
      const self = this;
      queueMicrotask(() => {
        self.listeners.forEach((fn) => fn({ data: { id: data.id, ok: true, digest: 'ab' } }));
      });
    }
    addEventListener(type, fn) { if (type === 'message') this.listeners.push(fn); }
    removeEventListener(type, fn) {
      if (type !== 'message') return;
      this.listeners = this.listeners.filter((item) => item !== fn);
    }
  }
  const prev = globalThis.Worker;
  globalThis.Worker = FakeWorker;
  try {
    const out = await downloadConcurrentChunks({
      url: 'https://model.local/opfs.bin',
      size: 128,
      chunk: 128,
      concurrency: 1,
      sleepImpl: async () => {},
      fetchImpl: async (_url, init) => {
        const pair = String(init.headers.Range).replace('bytes=', '').split('-').map(Number);
        return {
          status: 206,
          headers: { get: (name) => (String(name).toLowerCase() === 'content-range' ? ('bytes ' + pair[0] + '-' + pair[1] + '/128') : '') },
          arrayBuffer: async () => new Uint8Array(128).buffer,
        };
      },
    });
    assert.equal(out.parts, 1);
    assert.equal(out.bytesHeld, 0);
    const writes = seen.filter((row) => !row.data || row.data.op !== 'close');
    assert.equal(writes.length, 1);
    assert.ok(writes[0].transfer.length === 1);
    assert.ok(writes[0].transfer[0] instanceof ArrayBuffer);
    assert.equal(writes[0].data.bytes.buffer, writes[0].transfer[0]);
    assert.equal(writes[0].data.hash, true);
    assert.ok(seen.some((row) => row.data && row.data.op === 'close'));
  } finally {
    if (prev) globalThis.Worker = prev;
    else delete globalThis.Worker;
  }
});
