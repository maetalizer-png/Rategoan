import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  downloadConcurrentChunks,
  contentRangeMatches,
  digestSha256,
} from '../../raget-neural/runtime/model-downloader.js';
import { safetensorsPayloadOk } from '../../raget-neural/runtime/safetensors-validator.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

function ranged(init, total) {
  const pair = String(init && init.headers && init.headers.Range).replace('bytes=', '').split('-').map(Number);
  const start = pair[0];
  const end = pair[1];
  return {
    status: 206,
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

function pack(header, extra) {
  const head = new TextEncoder().encode(JSON.stringify(header));
  const buf = new Uint8Array(8 + head.length + (extra || 0));
  new DataView(buf.buffer).setBigUint64(0, BigInt(head.length), true);
  buf.set(head, 8);
  return { size: buf.length, read: (offset, length) => buf.subarray(offset, offset + length) };
}

test('DOD-37 sumber: tanpa abort 30 detik, OPFS diulang, bar di header', () => {
  const adapter = read('raget/raget-neural/neural-adapter.js');
  const provider = read('raget/raget-neural/neural-provider.js');
  const worker = read('raget/raget-neural/runtime/raget-worker.js');
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const html = read('index.html');
  const composer = read('js/chat/composer.js');
  const pkg = JSON.parse(read('package.json'));
  assert.equal(/setTimeout\(\(\) => ctrl\.abort\(\)/.test(adapter), false);
  assert.equal(adapter.includes('INFERENCE_MS'), false);
  assert.equal(/setTimeout\(fire,\s*INFERENCE_MS\)/.test(provider), false);
  assert.equal(provider.includes('function prefetchBest'), false);
  assert.equal(provider.includes('clearInstalled'), false);
  assert.equal(provider.includes('createSyncAccessHandle'), false);
  assert.match(provider, /pendingPrompt/);
  assert.match(provider, /VERIFYING_PAYLOAD/);
  assert.match(provider, /INFERENCE_READY/);
  assert.match(provider, /TRANSFERRING/);
  assert.match(provider, /WRITING_OPFS/);
  assert.match(worker, /90000/);
  assert.match(worker, /safetensorsPayloadOk/);
  assert.match(down, /committedVerifiedBytes/);
  assert.match(down, /visibleLoaded/);
  assert.match(down, /wAttempt/);
  assert.match(down, /abortNetwork/);
  assert.match(down, /opfsSize/);
  assert.equal(down.includes('digestSha256(got.bytes)'), false);
  const top = html.indexOf('id="top-download-bar"');
  const card = html.indexOf('id="weight-card"');
  const composerAt = html.indexOf('id="composer"');
  assert.ok(top > 0 && card > top && card < composerAt);
  assert.equal(composer.includes('rategoan:model-switched') && composer.includes("card.hidden = true;\n    };\n    window.addEventListener('rategoan:model-switched'"), false);
  assert.match(composer, /MB\/s/);
  assert.match(composer, /pending-reply/);
  assert.equal(pkg.version, '25.0.0-PRODUCTION-GA');
  assert.equal(contentRangeMatches('bytes 0-31/128', { start: 0, end: 31 }, 128), true);
  assert.equal(contentRangeMatches('bytes 0-31/999', { start: 0, end: 31 }, 128), false);
  assert.equal(contentRangeMatches('bytes 0-31/*', { start: 0, end: 31 }, 128), false);
});

test('topeng tanpa ukuran OPFS tidak dihitung selesai, ukuran cocok boleh dilewati', async () => {
  const box = storage();
  try {
    box.mem.set('rategoan_chunks_mask:rev-palsu', '1');
    let fakeHits = 0;
    await assert.rejects(() => downloadConcurrentChunks({
      url: 'https://model.local/palsu.bin',
      size: 16,
      chunk: 16,
      concurrency: 1,
      revision: 'rev-palsu',
      sleepImpl: async () => {},
      fetchImpl: async () => {
        fakeHits += 1;
        throw new Error('unduh');
      },
    }));
    assert.ok(fakeHits >= 1);
    box.mem.set('rategoan_chunks_mask:rev-nyata', '1');
    let realHits = 0;
    const skipped = await downloadConcurrentChunks({
      url: 'https://model.local/nyata.bin',
      size: 16,
      chunk: 16,
      concurrency: 1,
      revision: 'rev-nyata',
      opfsSize: 16,
      sleepImpl: async () => {},
      fetchImpl: async () => {
        realHits += 1;
        throw new Error('tidak boleh');
      },
    });
    assert.equal(realHits, 0);
    assert.equal(skipped.parts, 1);
  } finally {
    box.restore();
  }
});

test('tulis OPFS gagal dua kali lalu berhasil, hash manifest dicek', async () => {
  const zeros = new Uint8Array(8);
  const good = await digestSha256(zeros);
  let writes = 0;
  const done = await downloadConcurrentChunks({
    url: 'https://model.local/ulang.bin',
    size: 8,
    chunk: 8,
    concurrency: 1,
    chunkHashes: [good],
    sleepImpl: async () => {},
    diskWrite: async () => {
      writes += 1;
      if (writes < 3) throw new Error('OPFS gagal');
      return { digest: good };
    },
    fetchImpl: async (_url, init) => ranged(init, 8),
  });
  assert.equal(writes, 3);
  assert.equal(done.parts, 1);
  let badWrites = 0;
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/hash.bin',
    size: 8,
    chunk: 8,
    concurrency: 1,
    chunkHashes: ['ab'],
    sleepImpl: async () => {},
    diskWrite: async () => {
      badWrites += 1;
      return { digest: 'zz' };
    },
    fetchImpl: async (_url, init) => ranged(init, 8),
  }), /checksum_mismatch/);
  assert.equal(badWrites, 1);
  await assert.rejects(() => downloadConcurrentChunks({
    url: 'https://model.local/rentang.bin',
    size: 8,
    chunk: 8,
    concurrency: 1,
    sleepImpl: async () => {},
    diskWrite: async () => {},
    fetchImpl: async () => ({
      status: 206,
      headers: { get: () => 'bytes 0-7/99' },
      arrayBuffer: async () => new Uint8Array(8).buffer,
    }),
  }));
});

test('batal memutus fetch yang masih berjalan', async () => {
  const control = { paused: false, cancelled: false };
  let opened;
  const started = new Promise((resolve) => { opened = resolve; });
  const job = downloadConcurrentChunks({
    url: 'https://model.local/batal.bin',
    size: 8,
    chunk: 8,
    concurrency: 1,
    control: control,
    sleepImpl: async () => {},
    fetchImpl: (_url, init) => {
      opened();
      return new Promise((_resolve, reject) => {
        const stop = () => reject(new Error('dibatalkan'));
        if (init && init.signal) {
          if (init.signal.aborted) stop();
          else init.signal.addEventListener('abort', stop, { once: true });
        }
      });
    },
  });
  await started;
  assert.equal(typeof control.abortNetwork, 'function');
  control.cancelled = true;
  control.abortNetwork();
  await assert.rejects(job, /dibatalkan/);
});

test('berkas safetensors 410 byte tanpa payload ditolak', () => {
  const dummy = {
    __metadata__: { format: 'rategoan-int4-block32-affine' },
    'embedding.weight': { dtype: 'U8', shape: [410], data_offsets: [0, 410] },
  };
  const thin = pack(dummy, 0);
  assert.ok(thin.size < 500);
  assert.equal(safetensorsPayloadOk(thin), false);
  const overlapped = pack({
    a: { dtype: 'U8', shape: [4], data_offsets: [0, 4] },
    b: { dtype: 'U8', shape: [4], data_offsets: [2, 6] },
  }, 8);
  assert.equal(safetensorsPayloadOk(overlapped), false);
  const sound = pack({
    a: { dtype: 'U8', shape: [4], data_offsets: [0, 4] },
    b: { dtype: 'F32', shape: [1], data_offsets: [4, 8] },
  }, 8);
  assert.equal(safetensorsPayloadOk(sound), true);
});
