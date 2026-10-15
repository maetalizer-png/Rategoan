import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pullLora, LORA_MAX_BYTES, personaLora } from '../../../js/chat/persona.js';
import { readSyncBlock } from '../../raget-neural/runtime/weight-cache.js';
import { EARLY_PROGRESS_BYTES } from '../../raget-neural/runtime/weight-cache.js';
import { publishMeshChunk, meshHasChunk, openMeshBus, closeMeshBus } from '../../../js/sync/p2p-sync.js';
import { encodeSdp, decodeSdp, sdpQr } from '../../../js/sync/p2p-sync.js';
import { streamCode } from '../../../js/studio/studio-frontier.js';
import { hudBudget, sampleHud, noteDecode, noteVram } from '../../../js/studio/telemetry.js';
import { VAD_WORKLET_SOURCE } from '../../../js/voice/energy-vad.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('antarmuka model hanya Cepat dan Mendalam', () => {
  const sheet = read('js/sheets/model-sheet.js');
  const settings = read('js/account/settings.js');
  const composer = read('js/chat/composer.js');
  assert.equal(sheet.includes('persona-select'), false);
  assert.equal(settings.includes('persona-select'), false);
  assert.equal(settings.includes('mountPersonaSelect'), false);
  assert.equal(composer.includes('persona-select'), false);
  assert.match(sheet, /Rendah/);
  assert.match(sheet, /Tinggi/);
  assert.match(composer, /weightsInstalled/);
  assert.match(read('raget/raget-neural/neural-provider.js'), /EARLY_PROGRESS_BYTES/);
  assert.equal(EARLY_PROGRESS_BYTES, 80 * 1024 * 1024);
  assert.equal(read('js/chat/voice.js').includes('setInterval'), false);
  assert.match(read('js/chat/voice.js'), /mountEnergyVad/);
  assert.match(VAD_WORKLET_SOURCE, /voice: false/);
  assert.match(read('raget/raget-neural/runtime/opfs-writer-worker.js'), /createSyncAccessHandle/);
  assert.equal(read('raget/raget-neural/runtime/model-downloader.js').includes('digestSha256(got.bytes)'), false);
});

test('OPFS, mesh, SDP, kerja token, dan LoRA kecil', async () => {
  const sync = {
    read(buf, at) {
      buf.fill(7);
      return buf.length;
    },
  };
  const t0 = performance.now();
  const block = readSyncBlock(sync, 0, 64);
  assert.ok(performance.now() - t0 < 1);
  assert.equal(block[0], 7);
  const bus = openMeshBus();
  let other = null;
  const heard = new Promise((resolve) => {
    other = new BroadcastChannel('rategoan-mesh-sync');
    other.onmessage = (event) => resolve(event.data);
  });
  const chunk = new Uint8Array([1, 2, 3, 4]);
  const sent = publishMeshChunk(3, chunk);
  assert.equal(sent.channel, 'rategoan-mesh-sync');
  assert.equal(meshHasChunk(3), true);
  if (bus) {
    const msg = await Promise.race([
      heard,
      new Promise((resolve) => setTimeout(() => resolve(null), 400)),
    ]);
    assert.ok(msg && msg.index === 3);
    assert.equal(msg.bytes, 4);
  }
  const packed = encodeSdp({ type: 'offer', sdp: 'v=0\r\no=- 1 1 IN IP4 127.0.0.1\r\n' });
  const back = decodeSdp(packed);
  assert.equal(back.type, 'offer');
  assert.match(back.sdp, /v=0/);
  const qr = sdpQr(packed.slice(0, 80));
  assert.ok(qr.length >= 21);
  let state = { text: '' };
  const steps = [];
  'function add(){return 1}'.match(/.{1,6}/g).forEach((piece) => {
    state = streamCode(state, piece);
    steps.push(state.text);
    assert.equal(state.blanked, false);
  });
  assert.ok(steps.every((row, i) => i === 0 || row.startsWith(steps[i - 1])));
  assert.ok(state.outline.includes('add'));
  noteDecode(8, 200);
  noteVram(9 * 1024 * 1024);
  const hud = sampleHud({ tempC: 50 });
  assert.equal(hud.throttle, true);
  assert.equal(hudBudget({ tempC: 50 }), 32);
  assert.equal(hudBudget({ tempC: 30 }), 96);
  const fake = async () => ({ arrayBuffer: async () => new Uint8Array(12 * 1024 * 1024).buffer });
  const lora = await pullLora('koding', fake);
  assert.equal(lora.rank, 16);
  assert.ok(lora.bytes <= LORA_MAX_BYTES);
  assert.equal(personaLora('umum'), null);
  const huge = async () => ({ arrayBuffer: async () => new Uint8Array(16 * 1024 * 1024).buffer });
  assert.equal(await pullLora('matematika', huge), null);
  if (other) other.close();
  closeMeshBus();
});
