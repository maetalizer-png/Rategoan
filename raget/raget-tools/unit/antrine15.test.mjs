import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadConcurrentChunks } from '../../raget-neural/runtime/model-downloader.js';
import { WEIGHT_SPEC } from '../../raget-neural/runtime/weight-cache.js';
import { meshBufferCount, meshHasChunk, publishMeshChunk, takeMeshChunk, closeMeshBus } from '../../../js/sync/p2p-sync.js';
import { GPU_WEIGHT_CACHE_CAP, gpuCacheSize, trackGpuWeight } from '../../raget-neural/runtime/webgpu-runner.js';
import { neuralProvider } from '../../raget-neural/neural-provider.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-39 sumber: tombol, celah, antrean, mesh, OPFS, konteks, worker', () => {
  const html = read('index.html');
  const composer = read('js/chat/composer.js');
  const desktop = read('css/layout/desktop.css');
  const shell = read('css/layout/shell.css');
  const provider = read('raget/raget-neural/neural-provider.js');
  const adapter = read('raget/raget-neural/neural-adapter.js');
  const down = read('raget/raget-neural/runtime/model-downloader.js');
  const worker = read('raget/raget-neural/runtime/raget-worker.js');
  const settings = read('js/account/settings.js');
  const chat = read('js/chat/chat.js');
  const gpu = read('raget/raget-neural/runtime/webgpu-runner.js');
  const pkg = JSON.parse(read('package.json'));
  assert.match(html, /<p id="weight-status">Belum Terpasang<\/p>/);
  assert.equal(html.includes('Bobot belum di perangkat.'), false);
  assert.match(composer, /delete status\.dataset\.busy/);
  assert.match(composer, /pauseBtn\.hidden = false/);
  assert.match(composer, /cancelBtn\.hidden = false/);
  assert.match(composer, /s\.messages\.splice\(i \+ 1, 0, item\)/);
  assert.match(composer, /request_id: detail\.request_id/);
  assert.match(composer, /dataset\.messageId = env\.message_id/);
  assert.match(composer, /\/api\/connectors\/web\/search\?q=/);
  assert.equal(desktop.includes('padding-top: 43px'), false);
  assert.match(desktop, /padding-top:\s*0/);
  assert.match(desktop, /#view-chat \.top-download-bar \.weight-card:has\(#weight-status\[data-busy="1"\]\)/);
  assert.match(desktop, /height:\s*50px/);
  assert.match(shell, /height:\s*44px/);
  assert.match(shell, /#top-download-bar \.weight-card:not\(:has\(#weight-status\[data-busy="1"\]\)\) \.weight-bar/);
  assert.equal(Array.isArray(WEIGHT_SPEC.chunkHashes), true);
  assert.equal(WEIGHT_SPEC.chunkHashes.length, 0);
  assert.match(down, /meshSnapshot\(\)\.peers > 0/);
  assert.match(down, /rategoan_chunks_hashes:/);
  assert.match(down, /return mirrorOpfs\(offset, src\)/);
  assert.match(settings, /removeEntry\('raget-neural-1\.5b\.safetensors'\)/);
  assert.match(settings, /rategoan_chunks_mask:/);
  assert.match(settings, /Rategoan version 1\.0/);
  assert.match(adapter, /context\.messages/);
  assert.match(adapter, /context\.modelPrefix/);
  assert.match(adapter, /context\.recent/);
  assert.match(adapter, /context\.facts/);
  assert.match(provider, /function composeNeuralInput/);
  assert.match(provider, /parts \|\| 250/);
  assert.match(provider, /op: 'verify_session'/);
  assert.match(provider, /maxNewTokens: 1/);
  assert.match(provider, /maxLayers: 0/);
  assert.match(provider, /activeWorkerJobs/);
  assert.match(provider, /data\.type === 'verified'/);
  assert.match(provider, /queuedAt/);
  assert.match(provider, /< 2000/);
  assert.match(provider, /modelStatus !== MODEL_STATUS\.DOWNLOADING/);
  const smoked = provider.indexOf('const smoked = await markInferenceReady()');
  const sealed = provider.indexOf('sealInstalled(packed.parts)');
  assert.ok(smoked > 0 && sealed > smoked);
  assert.match(worker, /function closeActiveSync/);
  assert.match(worker, /activeSync\.close\(\)/);
  assert.match(worker, /op === 'verify_session'/);
  assert.match(worker, /type: 'verified'/);
  assert.match(worker, /90000/);
  assert.match(chat, /if \(reply == null\) break;/);
  assert.match(gpu, /lastPackedRef/);
  assert.match(gpu, /GPU_WEIGHT_CACHE_CAP = 16/);
  assert.equal(pkg.version, '25.0.0-PRODUCTION-GA');
});

test('meshBytes menahan paling banyak 2 buffer', () => {
  publishMeshChunk(910, new Uint8Array([9]));
  publishMeshChunk(911, new Uint8Array([8]));
  publishMeshChunk(912, new Uint8Array([7]));
  assert.ok(meshBufferCount() <= 2);
  assert.equal(meshHasChunk(910), true);
  assert.equal(meshHasChunk(912), true);
  const hit = takeMeshChunk(912);
  assert.ok(hit && hit[0] === 7);
  closeMeshBus();
});

test('cache bobot GPU tidak melebihi 16 referensi', () => {
  const keys = [];
  for (let i = 0; i < GPU_WEIGHT_CACHE_CAP + 1; i += 1) keys.push({ n: i });
  keys.forEach((key) => trackGpuWeight(key, key, key));
  assert.ok(gpuCacheSize() <= GPU_WEIGHT_CACHE_CAP);
  assert.equal(trackGpuWeight(keys[keys.length - 1], keys[keys.length - 1], keys[keys.length - 1]), true);
});

test('satu prompt unduhan tidak menggandakan antrean dalam 2 detik', async () => {
  const prev = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const first = await neuralProvider.generate([], 'antrine15-idem-unik', {});
    const id1 = neuralProvider.lastEnvelope().message_id;
    const second = await neuralProvider.generate([], 'antrine15-idem-unik', {});
    const id2 = neuralProvider.lastEnvelope().message_id;
    assert.equal(first, null);
    assert.equal(second, null);
    assert.equal(id1, id2);
    assert.match(String(id1), /^msg-/);
    await neuralProvider.generate([], 'antrine15-idem-lain', {});
    const id3 = neuralProvider.lastEnvelope().message_id;
    assert.notEqual(id3, id1);
  } finally {
    neuralProvider.cancelWeights();
    neuralProvider.haltInference();
    globalThis.fetch = prev;
  }
});

test('ledger hash partisi menolak resume kalau byte OPFS berubah', async () => {
  const mem = new Map();
  const prev = globalThis.localStorage;
  globalThis.localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null; },
    setItem(key, value) { mem.set(key, String(value)); },
    removeItem(key) { mem.delete(key); },
    get length() { return mem.size; },
    key(index) { return Array.from(mem.keys())[index] || null; },
  };
  const ranged = () => ({
    status: 206,
    headers: { get: () => 'bytes 0-7/8' },
    arrayBuffer: async () => new Uint8Array(8).buffer,
  });
  try {
    await downloadConcurrentChunks({
      url: 'https://model.local/segel-15.bin',
      size: 8,
      chunk: 8,
      concurrency: 1,
      revision: 'rev-segel-15',
      sleepImpl: async () => {},
      diskWrite: async () => ({ digest: 'abc123' }),
      fetchImpl: async () => ranged(),
    });
    assert.match(mem.get('rategoan_chunks_hashes:rev-segel-15') || '', /abc123/);
    let skipHits = 0;
    const skipped = await downloadConcurrentChunks({
      url: 'https://model.local/segel-15.bin',
      size: 8,
      chunk: 8,
      concurrency: 1,
      revision: 'rev-segel-15',
      opfsSize: 8,
      opfsDigest: async () => 'abc123',
      sleepImpl: async () => {},
      fetchImpl: async () => {
        skipHits += 1;
        throw new Error('tidak boleh');
      },
    });
    assert.equal(skipHits, 0);
    assert.equal(skipped.parts, 1);
    let badHits = 0;
    await downloadConcurrentChunks({
      url: 'https://model.local/segel-15.bin',
      size: 8,
      chunk: 8,
      concurrency: 1,
      revision: 'rev-segel-15',
      opfsSize: 8,
      opfsDigest: async () => 'salah',
      sleepImpl: async () => {},
      diskWrite: async () => ({ digest: 'abc123' }),
      fetchImpl: async () => {
        badHits += 1;
        return ranged();
      },
    });
    assert.ok(badHits >= 1);
  } finally {
    if (prev === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = prev;
  }
});
