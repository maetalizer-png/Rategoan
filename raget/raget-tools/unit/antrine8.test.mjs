import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { EARLY_PROGRESS_BYTES } from '../../raget-neural/runtime/weight-cache.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('mode cepat membalas hallo tanpa pesan bobot', async () => {
  const mem = new Map();
  globalThis.localStorage = {
    getItem(key) { return mem.has(key) ? mem.get(key) : null; },
    setItem(key, value) { mem.set(key, String(value)); },
    removeItem(key) { mem.delete(key); },
  };
  const { neuralAdapter } = await import('../../raget-neural/neural-adapter.js');
  const reply = await neuralAdapter.ask('hallo', {});
  assert.equal(reply, 'Halo! Ada yang bisa saya bantu?');
  assert.equal(String(reply).includes('Bobot Raget 1.0 belum termuat'), false);
  assert.equal(EARLY_PROGRESS_BYTES, 80 * 1024 * 1024);
  const provider = read('raget/raget-neural/neural-provider.js');
  assert.match(provider, /mode === 'cepat'/);
  assert.equal(provider.includes("mode === 'cepat' || mode === 'mendalam'"), false);
  const settings = read('js/account/settings.js');
  const modelAt = settings.indexOf("textContent = 'Model Utama: Raget 1.0'");
  const meshAt = settings.indexOf('Sinkronisasi Perangkat Lokal (P2P Mesh)');
  assert.ok(modelAt >= 0 && meshAt > modelAt);
  assert.equal(settings.slice(modelAt, meshAt).includes('Tukar SDP'), false);
  assert.equal(settings.slice(modelAt, meshAt).includes('mountMeshPanel'), false);
  assert.match(settings, /btn-unduh-mendalam/);
  assert.match(settings, /Unduh Bobot Mode Mendalam \(1\.0 GB\)/);
  assert.match(settings.slice(meshAt), /mountMeshPanel\(meshCard\)/);
  const css = read('css/ui/studio.css');
  assert.match(css, /max-width: 768px/);
  assert.match(css, /\.studio-hud \{ display: none !important; \}/);
  assert.equal(/\.studio-hud \{[^}]*position:\s*fixed/.test(css), false);
  assert.match(read('js/studio/studio-frontier.js'), /btn-inspect-dom/);
  assert.match(read('js/studio/studio-app.js'), /aria-pressed/);
  assert.equal(read('package.json').includes('25.0.0-PRODUCTION-GA'), true);
});
