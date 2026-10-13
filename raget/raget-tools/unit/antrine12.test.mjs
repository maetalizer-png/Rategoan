import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { safetensorsHeaderOk } from '../../raget-neural/runtime/weight-cache.js';
import { maskedBytes } from '../../raget-neural/runtime/model-downloader.js';
import { CONFIRM_CAP, CONFIRM_TTL_MS } from '../../../api/confirm-challenge.js';
import { readWeb } from '../../../vault/web/read-web.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

function headerSync(header) {
  const json = JSON.stringify(header);
  const head = new TextEncoder().encode(json);
  const buf = new Uint8Array(8 + head.length);
  new DataView(buf.buffer).setBigUint64(0, BigInt(head.length), true);
  buf.set(head, 8);
  return { size: buf.length, read: (offset, length) => buf.subarray(offset, offset + length) };
}

const GOOD = {
  __metadata__: { format: 'rategoan-int4-block32-affine' },
  'embedding.weight': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
  'lm_head.weight': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
  'layers.0.attention.Wq': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
  'layers.0.ln1.gamma': { dtype: 'F32', shape: [1], data_offsets: [0, 4] },
  'layers.27.ffn.Wdown': { dtype: 'U8', shape: [1], data_offsets: [0, 1] },
};

test('DOD-36 sumber: boot, lapisan 28, antrean, studio, dan watchdog', () => {
  const provider = read('raget/raget-neural/neural-provider.js');
  const cache = read('raget/raget-neural/runtime/weight-cache.js');
  const main = read('js/main.js');
  const html = read('index.html');
  const worker = read('raget/raget-neural/runtime/raget-worker.js');
  const composer = read('js/chat/composer.js');
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const studio = read('studio.html');
  assert.equal(provider.includes('createSyncAccessHandle'), false);
  assert.equal(main.includes('createSyncAccessHandle'), false);
  assert.equal(provider.includes('clearInstalled'), false);
  assert.equal(provider.includes('openSyncWeight'), false);
  assert.equal(provider.includes('maxLayers: 4'), false);
  assert.match(provider, /maxLayers: 0/);
  assert.match(provider, /Bobot sedang diunduh \(/);
  assert.equal(/loaded:\s*0/.test(provider), false);
  assert.match(cache, /handle\.getFile\(\)/);
  assert.match(cache, /slice\(0, 65536\)/);
  assert.match(cache, /JSON\.parse/);
  assert.match(cache, /embedding\.weight/);
  assert.match(cache, /lm_head\.weight/);
  assert.match(cache, /rategoan-int4-block32-affine/);
  assert.match(cache, /64 \* 1024/);
  assert.match(down, /export function maskedBytes/);
  assert.match(composer, /Bobot sedang diunduh \(0%\)\. Obrolan akan otomatis aktif setelah unduhan selesai 100%\./);
  assert.match(html, /href="studio\.html" target="_blank" rel="noopener"/);
  assert.equal(html.includes('location.href = \'studio.html\''), false);
  assert.match(worker, /function arm|const arm/);
  assert.match(read('raget/raget-tools/unit/antrine10.test.mjs'), /first < 250/);
  assert.equal(studio.includes('allow-same-origin'), false);
  assert.equal(studio.includes('unsafe-eval'), false);
  assert.match(read('js/studio/vfs-transaction.js'), /await pending/);
  assert.match(read('api/_http.js'), /publicHttpUrl\(url\)/);
  assert.equal(CONFIRM_CAP, 200);
  assert.equal(CONFIRM_TTL_MS, 60000);
});

test('header safetensors utuh lolos, yang pendek atau tanpa tensor ditolak', () => {
  assert.equal(safetensorsHeaderOk(headerSync(GOOD)), true);
  const wide = Object.assign({}, GOOD, { __metadata__: { format: 'rategoan-int4-block32-affine', pad: 'x'.repeat(2500) } });
  const wideSync = headerSync(wide);
  assert.ok(wideSync.size > 2048);
  assert.equal(safetensorsHeaderOk(wideSync), true);
  const thin = Object.assign({}, GOOD);
  delete thin['lm_head.weight'];
  assert.equal(safetensorsHeaderOk(headerSync(thin)), false);
  assert.equal(safetensorsHeaderOk(headerSync({ __metadata__: { format: 'rategoan-int4-block32-affine' } })), false);
  assert.equal(safetensorsHeaderOk(headerSync({ ok: true })), false);
});

test('bitmask resume dan alamat privat ditolak', async () => {
  const mem = new Map();
  const prev = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null; },
    setItem(key, value) { mem.set(key, String(value)); },
    removeItem(key) { mem.delete(key); },
  };
  try {
    mem.set('rategoan_chunks_mask:rev-12', '1,1,0');
    assert.equal(maskedBytes(100, 40, 'rev-12'), 80);
    assert.equal(maskedBytes(100, 40, 'rev-lain'), 0);
  } finally {
    if (prev === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = prev;
  }
  const loop = await readWeb.read('http://127.0.0.1/rahasia');
  const lan = await readWeb.read('http://192.168.1.9/rahasia');
  const pub = await readWeb.read('notaurl');
  assert.equal(loop.ok, false);
  assert.match(loop.message, /privat/);
  assert.equal(lan.ok, false);
  assert.equal(pub.ok, false);
});
