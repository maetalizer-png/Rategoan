import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadConcurrentChunks, MODEL_CHUNK } from '../../raget-neural/runtime/model-downloader.js';
import { silenceElapsed, SILENCE_MS } from '../../../js/voice/energy-vad.js';
import { personaLora, PERSONAS } from '../../../js/chat/persona.js';
import { meshSnapshot, noteMeshPeer } from '../../../js/sync/p2p-sync.js';
import { buildVirtualImportMap } from '../../../js/studio/studio-frontier.js';
import { sealWithPrf } from '../../../js/crypto/webauthn-enclave.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('detik nol hanya meminta partisi yang sedang ditarik', async () => {
  const marks = [];
  const store = {
    async get() { return null; },
    async put(_cache, key) {
      marks.push({ kind: 'put-start', key, at: Date.now() });
      await new Promise((resolve) => setTimeout(resolve, 30));
      marks.push({ kind: 'put-end', key, at: Date.now() });
    },
  };
  const fetchImpl = async (_url, init) => {
    const header = init.headers.Range;
    marks.push({ kind: 'fetch', header, at: Date.now() });
    const pair = header.replace('bytes=', '').split('-').map(Number);
    return { status: 206, arrayBuffer: async () => new Uint8Array(pair[1] - pair[0] + 1).buffer };
  };
  const out = await downloadConcurrentChunks({
    url: 'https://model.local/w.bin',
    size: MODEL_CHUNK * 8,
    fetchImpl,
    store,
    concurrency: 4,
  });
  assert.equal(out.bytesHeld, 0);
  const put0 = marks.find((row) => row.kind === 'put-start');
  const before = marks.filter((row) => row.kind === 'fetch' && row.at <= put0.at);
  assert.ok(before.length <= 4, 'banjir ' + before.length);
  assert.ok(before.some((row) => row.header.startsWith('bytes=0-')));
  assert.match(read('raget/raget-neural/runtime/model-downloader.js'), /primed\.delete\(i\)/);
  assert.match(read('raget/raget-neural/runtime/model-downloader.js'), /createSyncAccessHandle/);
});

test('hening 600 milidetik, persona, mesh, dan crypto universal', async () => {
  assert.equal(SILENCE_MS, 600);
  assert.equal(silenceElapsed(1000, 1599), false);
  assert.equal(silenceElapsed(1000, 1600), true);
  assert.equal(personaLora('umum'), null);
  assert.equal(personaLora('koding').rank, 16);
  assert.equal(PERSONAS.length, 4);
  const mesh = noteMeshPeer();
  assert.equal(mesh.status, 'aktif');
  assert.equal(meshSnapshot().peers >= 1, true);
  const map = buildVirtualImportMap({ '/js/script.js': 'export const n = 1;' });
  assert.equal(typeof map.imports.react, 'string');
  assert.equal(map.imports.react.includes('http'), false);
  const key = await sealWithPrf(new Uint8Array(32).fill(3));
  assert.equal(key.ok, true);
  assert.match(read('js/crypto/webauthn-enclave.js'), /getUniversalCryptoSync/);
  assert.match(read('studio.html'), /btn-inspect-dom/);
  assert.match(read('studio.html'), /btn-view-full/);
  assert.match(read('js/studio/studio-app.js'), /Perbaiki Otomatis/);
  assert.match(read('js/chat/voice.js'), /getUserMedia\(\{ audio: true \}\)/);
});
