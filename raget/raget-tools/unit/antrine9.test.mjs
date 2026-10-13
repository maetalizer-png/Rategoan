import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { neuralProvider } from '../../raget-neural/neural-provider.js';
import { EARLY_PROGRESS_BYTES } from '../../raget-neural/runtime/weight-cache.js';
import { DOWNLOAD_STREAMS } from '../../raget-neural/runtime/weight-cache.js';
import { PREFETCH_AHEAD } from '../../raget-neural/runtime/model-downloader.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

const PROMPTS = [
  'Ini yang bales siapa',
  'Selamat pagi',
  'halo apa kabar',
  'ceritakan tentang fotografi ponsel',
  'siapa namamu',
];

test('lima prompt tidak jatuh ke template atau artikel korpus', async () => {
  const provider = read('raget/raget-neural/neural-provider.js');
  const adapter = read('raget/raget-neural/neural-adapter.js');
  const settings = read('js/account/settings.js');
  const composer = read('js/chat/composer.js');
  const downloader = read('raget/raget-neural/runtime/model-downloader.js');
  const worker = read('raget/raget-neural/runtime/opfs-writer-worker.js');
  assert.equal(provider.includes('tryGreeting'), false);
  assert.equal(provider.includes('tryDailyTalk'), false);
  assert.equal(provider.includes('retrieveFact'), false);
  assert.equal(provider.includes('answerFast'), false);
  assert.equal(/hallo\+/.test(provider), false);
  assert.equal(provider.includes('raget-neural-compact'), false);
  assert.match(provider, /generateLocal/);
  assert.match(provider, /large === true/);
  assert.equal(adapter.includes('Bobot Raget 1.0 belum termuat'), false);
  assert.equal(settings.includes('mountMeshPanel'), false);
  assert.equal(settings.includes('Tukar SDP'), false);
  assert.match(settings, /row-privacy/);
  assert.match(settings, /class="side-icon"/);
  assert.match(settings, /class="set-arrow"/);
  assert.match(settings, /id="row-cache"/);
  assert.match(settings, /id="row-clear-cache"/);
  assert.match(composer, /Unduh Bobot Raget 1\.0 \(997 MB\)|sedang diunduh secara progresif/);
  assert.match(read('index.html'), /Unduh Bobot Raget 1\.0 \(997 MB\)/);
  assert.equal(EARLY_PROGRESS_BYTES, 80 * 1024 * 1024);
  assert.equal(PREFETCH_AHEAD, 4);
  assert.ok(DOWNLOAD_STREAMS >= 4 && DOWNLOAD_STREAMS <= 6);
  assert.match(downloader, /rategoan_chunks_mask/);
  assert.equal(downloader.includes('digestSha256(got.bytes)'), false);
  assert.match(worker, /SHA-256/);
  assert.match(read('package.json'), /25\.0\.0-PRODUCTION-GA/);
  const orig = globalThis.fetch;
  let hits = 0;
  globalThis.fetch = async () => {
    hits += 1;
    throw new Error('offline');
  };
  try {
    for (const prompt of PROMPTS) {
      const reply = await neuralProvider.generate([], prompt, { mode: 'mendalam' });
      assert.equal(reply, null);
      assert.equal(String(reply || '').includes('Motret Pakai Ponsel'), false);
      assert.equal(String(reply || '').includes('Mulai dari yang kecil'), false);
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
    assert.ok(hits >= 1);
  } finally {
    globalThis.fetch = orig;
  }
});

