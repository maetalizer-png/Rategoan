import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  downloadConcurrentChunks,
  contentRangeMatches,
  headerValue,
  OPFS_ACK_MS,
  READ_IDLE_MS,
  MODEL_REVISION,
} from '../../raget-neural/runtime/model-downloader.js';
import { safetensorsHeaderOk, WEIGHT_SPEC } from '../../raget-neural/runtime/weight-cache.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

function ranged(init, total, status) {
  const pair = String(init && init.headers && init.headers.Range).replace('bytes=', '').split('-').map(Number);
  const start = pair[0];
  const end = pair[1];
  return {
    status: status || 206,
    headers: {
      get(name) {
        if (String(name).toLowerCase() !== 'content-range') return '';
        return 'bytes ' + start + '-' + end + '/' + total;
      },
    },
    arrayBuffer: async () => new Uint8Array(end - start + 1).buffer,
  };
}

function storage() {
  const mem = new Map();
  const prev = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null; },
    setItem(key, value) { mem.set(key, String(value)); },
    removeItem(key) { mem.delete(key); },
  };
  return {
    mem,
    restore() {
      if (prev === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = prev;
    },
  };
}

test('DOD-35 header, revisi, dan batas waktu ada di sumber', () => {
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const pipe = down.slice(down.indexOf('export async function downloadConcurrentChunks'));
  const worker = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  const provider = read('raget/raget-neural/neural-provider.js');
  const adapter = read('raget/raget-neural/neural-adapter.js');
  const raget = read('raget/raget-neural/runtime/raget-worker.js');
  const composer = read('js/chat/composer.js');
  const main = read('js/main.js');
  const bench = read('raget/raget-tools/run-bench.mjs');
  const shot = [
    'raget/raget-tools/studi-kasus-23.mjs',
    'raget/raget-tools/studi-kasus-antrine5.mjs',
    'raget/raget-tools/studi-kasus-antrine6.mjs',
    'raget/raget-tools/studi-kasus-antrine7.mjs',
    'raget/raget-tools/studi-kasus-antrine8.mjs',
    'raget/raget-tools/studi-kasus-antrine9.mjs',
    'raget/raget-tools/studi-kasus-antrine10.mjs',
  ].map(read).join('\n');
  assert.equal(OPFS_ACK_MS > 6000, true);
  assert.equal(OPFS_ACK_MS, 20000);
  assert.equal(READ_IDLE_MS, 15000);
  assert.equal(MODEL_REVISION, '53c362a5d8b403d1983cf46151595c466ff8b095');
  assert.equal(WEIGHT_SPEC.revision, MODEL_REVISION);
  assert.equal(/keepalive:\s*true/.test(pipe), false);
  assert.match(pipe, /res\.status !== 206/);
  assert.match(pipe, /contentRangeMatches/);
  assert.match(pipe, /rategoan_chunks_mask:/);
  assert.match(pipe, /op:\s*'close'/);
  assert.match(pipe, /ack\.ok !== true/);
  assert.match(worker, /sync\.flush\(\)/);
  assert.match(worker, /sync\.close\(\)/);
  assert.match(worker, /written !== bytes\.byteLength/);
  assert.match(provider, /NOT_DOWNLOADED/);
  assert.match(provider, /DOWNLOADING/);
  assert.match(provider, /READY/);
  assert.match(provider, /FAILED/);
  assert.match(provider, /safetensorsHeaderOk/);
  assert.match(provider, /INFERENCE_MS = 30000/);
  assert.match(provider, /bootWeights\(\)/);
  assert.equal(provider.includes('sync.size < 8'), false);
  assert.match(adapter, /INFERENCE_MS = 30000/);
  assert.equal(/mode \? null : setTimeout/.test(adapter), false);
  assert.match(raget, /safetensorsHeaderOk/);
  assert.match(raget, /nalar timeout/);
  assert.match(raget, /30000/);
  assert.equal(composer.includes('Menjawab menggunakan partisi terunduh'), false);
  assert.match(composer, /dataset\.state = 'failed'/);
  assert.match(composer, /lastEnvelope/);
  assert.match(main, /bootWeights\(\)/);
  assert.match(main, /weightsInstalled\(\)/);
  assert.equal(bench.includes('bench1234'), false);
  assert.equal(bench.includes('/opt/'), false);
  assert.equal(bench.includes('maetalizer@gmail.com'), false);
  assert.match(bench, /from 'playwright'/);
  assert.equal(shot.includes('/workspace/screenshots'), false);
  assert.equal(read('raget/raget-tools/unit/antrine10.test.mjs').includes('setImmediate'), false);
  assert.equal(contentRangeMatches('bytes 0-31/128', { start: 0, end: 31 }), true);
  assert.equal(contentRangeMatches('bytes 1-31/128', { start: 0, end: 31 }), false);
  assert.equal(headerValue({ headers: { get: () => 'bytes 0-1/2' } }, 'content-range').startsWith('bytes'), true);
});

test('HTTP 200 dan Content-Range palsu ditolak', async () => {
  let full = 0;
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/penuh.bin',
    size: 32,
    chunk: 32,
    concurrency: 1,
    sleepImpl: async () => {},
    fetchImpl: async (_url, init) => {
      full += 1;
      return ranged(init, 32, 200);
    },
  }));
  assert.equal(full, 4);
  let bad = 0;
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/rentang.bin',
    size: 32,
    chunk: 32,
    concurrency: 1,
    sleepImpl: async () => {},
    fetchImpl: async () => {
      bad += 1;
      return {
        status: 206,
        headers: { get: () => 'bytes 4-35/32' },
        arrayBuffer: async () => new Uint8Array(32).buffer,
      };
    },
  }));
  assert.equal(bad, 4);
});

test('tulis OPFS gagal tidak menandai topeng, revisi lain tidak memakai topeng lama', async () => {
  const box = storage();
  const seen = [];
  class FakeWorker {
    constructor() { this.listeners = []; }
    postMessage(data) {
      seen.push(data);
      const self = this;
      queueMicrotask(() => {
        const ok = data.op === 'close';
        self.listeners.forEach((fn) => fn({ data: { id: data.id, ok: ok, op: data.op } }));
      });
    }
    addEventListener(type, fn) { if (type === 'message') this.listeners.push(fn); }
    removeEventListener(type, fn) {
      this.listeners = this.listeners.filter((item) => item !== fn);
    }
    terminate() {}
  }
  const prev = globalThis.Worker;
  globalThis.Worker = FakeWorker;
  try {
    await assert.rejects(() => downloadConcurrentChunks({
      url: 'https://model.local/tolak.bin',
      size: 16,
      chunk: 16,
      concurrency: 1,
      revision: 'rev-tolak',
      sleepImpl: async () => {},
      fetchImpl: async (_url, init) => ranged(init, 16),
    }));
    assert.equal(box.mem.get('rategoan_chunks_mask:rev-tolak'), undefined);
    assert.ok(seen.some((row) => row.op === 'write'));
    assert.ok(seen.some((row) => row.op === 'close'));
    box.mem.set('rategoan_chunks_mask', '1');
    box.mem.set('rategoan_chunks_mask:rev-a', '1');
    let hits = 0;
    const skipped = await downloadConcurrentChunks({
      url: 'https://model.local/lewati.bin',
      size: 16,
      chunk: 16,
      concurrency: 1,
      revision: 'rev-a',
      sleepImpl: async () => {},
      fetchImpl: async () => { hits += 1; throw new Error('tidak boleh'); },
    });
    assert.equal(hits, 0);
    assert.equal(skipped.parts, 1);
    await assert.rejects(() => downloadConcurrentChunks({
      url: 'https://model.local/beda.bin',
      size: 16,
      chunk: 16,
      concurrency: 1,
      revision: 'rev-b',
      sleepImpl: async () => {},
      fetchImpl: async () => { hits += 1; throw new Error('unduh'); },
    }));
    assert.ok(hits >= 1);
  } finally {
    if (prev) globalThis.Worker = prev;
    else delete globalThis.Worker;
    box.restore();
  }
});

test('pembaca yang diam melempar dan diulang, header safetensors wajib', async () => {
  let tries = 0;
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/diam.bin',
    size: 32,
    chunk: 32,
    concurrency: 1,
    readIdleMs: 25,
    sleepImpl: async () => {},
    fetchImpl: async (_url, init) => {
      tries += 1;
      const res = ranged(init, 32);
      res.body = { getReader: () => ({ read: () => new Promise(() => {}), cancel() {}, releaseLock() {} }) };
      return res;
    },
  }), /stream timeout/);
  assert.equal(tries, 4);
  const json = JSON.stringify({
    __metadata__: { format: 'rategoan-int4-block32-affine' },
    'embedding.weight': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
    'lm_head.weight': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
    'layers.0.attention.Wq': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
    'layers.0.ln1.gamma': { dtype: 'F32', shape: [1], data_offsets: [0, 4] },
    'layers.27.ffn.Wdown': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
  });
  const head = new TextEncoder().encode(json);
  const buf = new Uint8Array(8 + head.length);
  new DataView(buf.buffer).setBigUint64(0, BigInt(head.length), true);
  buf.set(head, 8);
  const sync = { size: buf.length, read: (offset, length) => buf.subarray(offset, offset + length) };
  assert.equal(safetensorsHeaderOk(sync), true);
  assert.equal(safetensorsHeaderOk({ size: 64, read: () => new Uint8Array(8) }), false);
  assert.equal(safetensorsHeaderOk({ size: 9 }), false);
});
