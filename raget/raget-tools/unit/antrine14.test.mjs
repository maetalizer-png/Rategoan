import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadConcurrentChunks, MODEL_CHUNK } from '../../raget-neural/runtime/model-downloader.js';
import { DOWNLOAD_STREAMS } from '../../raget-neural/runtime/weight-cache.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

function storage() {
  const mem = new Map();
  const prev = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null; },
    setItem(key, value) { mem.set(key, String(value)); },
    removeItem(key) { mem.delete(key); },
  };
  return {
    restore() {
      if (prev === undefined) delete globalThis.localStorage;
      else globalThis.localStorage = prev;
    },
  };
}

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

test('DOD-38 bar di dalam chat, partisi 4MB, antrean FIFO, tanpa hash utas utama', () => {
  const html = read('index.html');
  const desktop = read('css/layout/desktop.css');
  const shell = read('css/layout/shell.css');
  const provider = read('raget/raget-neural/neural-provider.js');
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const writer = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  const pkg = JSON.parse(read('package.json'));
  const view = html.indexOf('id="view-chat"');
  const bar = html.indexOf('id="top-download-bar"');
  const messages = html.indexOf('id="messages"');
  const settings = html.indexOf('id="view-settings"');
  assert.ok(view > 0 && bar > view && bar < messages && messages < settings);
  assert.equal(html.includes('id="mode-cepat"'), false);
  assert.match(html, /Unduh Bobot Raget 1\.0 \(997 MB\)/);
  assert.match(desktop, /#view-chat \.top-download-bar/);
  assert.match(desktop, /max-width:\s*820px/);
  assert.match(shell, /#top-download-bar \.weight-card:has\(#weight-status\[data-busy="1"\]\) #btn-weight/);
  assert.match(shell, /max-height:\s*36px/);
  assert.match(shell, /height:\s*3px/);
  assert.equal(MODEL_CHUNK, 4 * 1024 * 1024);
  assert.equal(DOWNLOAD_STREAMS, 4);
  assert.match(provider, /pendingPrompts/);
  assert.match(provider, /request_id/);
  assert.match(provider, /message_id/);
  assert.match(provider, /maxNewTokens:\s*1/);
  assert.equal(down.includes('digestSha256(chunkBytes)'), false);
  assert.equal(down.includes('digestSha256(got.bytes)'), false);
  assert.match(down, /op:\s*'digest'/);
  assert.match(writer, /op === 'digest'/);
  assert.match(writer, /SHA-256/);
  assert.equal(pkg.version, '25.0.0-PRODUCTION-GA');
  assert.match(read('raget/raget-neural/runtime/weight-cache.js'), /raget-neural-1\.5b\.safetensors/);
});

test('resume menolak hash OPFS yang tidak cocok dengan manifest', async () => {
  const box = storage();
  try {
    box.restore();
    globalThis.localStorage = {
      getItem(key) { return key.endsWith(':rev-hash') ? '1' : null; },
      setItem() {},
      removeItem() {},
    };
    let badHits = 0;
    await assert.rejects(() => downloadConcurrentChunks({
      url: 'https://model.local/hash-salah.bin',
      size: 8,
      chunk: 8,
      concurrency: 1,
      revision: 'rev-hash',
      opfsSize: 8,
      chunkHashes: ['aa'],
      opfsDigest: async () => 'zz',
      sleepImpl: async () => {},
      fetchImpl: async () => {
        badHits += 1;
        throw new Error('unduh');
      },
    }));
    assert.ok(badHits >= 1);
    let goodHits = 0;
    const skipped = await downloadConcurrentChunks({
      url: 'https://model.local/hash-cocok.bin',
      size: 8,
      chunk: 8,
      concurrency: 1,
      revision: 'rev-hash',
      opfsSize: 8,
      chunkHashes: ['aa'],
      opfsDigest: async () => 'aa',
      sleepImpl: async () => {},
      fetchImpl: async () => {
        goodHits += 1;
        throw new Error('tidak boleh');
      },
    });
    assert.equal(goodHits, 0);
    assert.equal(skipped.parts, 1);
  } finally {
    box.restore();
  }
});

test('dua prompt tidak saling menimpa di sumber antrean', () => {
  const provider = read('raget/raget-neural/neural-provider.js');
  assert.match(provider, /pendingPrompts\.push/);
  assert.match(provider, /pendingPrompts\.shift/);
  assert.equal(/pendingPrompt\s*=\s*\{/.test(provider), false);
});
