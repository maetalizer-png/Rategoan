import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { downloadConcurrentChunks, PREFETCH_AHEAD, MODEL_CHUNK, deltaChunkPlan } from '../../raget-neural/runtime/model-downloader.js';
import { createRangeReader, WEIGHT_ROOM } from '../../raget-neural/runtime/weight-cache.js';
import { chainEncoderPlan, probeShaderF16, reduceWorkgroup, WORKGROUP_REDUCTION_SHADER } from '../../raget-neural/runtime/webgpu-runner.js';
import { applyGrammarMask, applyLoraDelta, trimSinks, forkKvCache } from '../../raget-neural/runtime/int4-session.js';
import { guardWorkerTurn } from '../../raget-agents/turn-pipeline.js';
import { cachedSubgoals } from '../../../js/chat/composer.js';
import { rmsEnergy, voiceActive, VAD_WORKLET_SOURCE } from '../../../js/voice/energy-vad.js';
import { rejectUnsafeHtml } from '../../../js/system/trusted-policy.js';
import { claimModelLeader, MODEL_LOCK, createModelBus, MODEL_BUS } from '../../../js/system/tab-coordinator.js';
import { bundleStandalone, buildPwaPack, buildVirtualImportMap, importMapTag, highlightCode, quotaAllows, morphPlan } from '../../../js/studio/studio-frontier.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { relayChunk } from '../../../js/sync/p2p-sync.js';
import { sealWithPrf } from '../../../js/crypto/webauthn-enclave.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('label mode bersih tanpa lapis dan tanpa kata mode kotor', () => {
  const sheet = read('js/sheets/model-sheet.js');
  const settings = read('js/account/settings.js');
  assert.equal(sheet.includes('4 Lapis'), false);
  assert.equal(sheet.includes('28 Lapis'), false);
  assert.equal(sheet.includes('Raget Cepat'), false);
  assert.equal(sheet.includes('Raget Mendalam'), false);
  assert.match(sheet, /label: 'Cepat'/);
  assert.match(sheet, /label: 'Mendalam'/);
  assert.match(sheet, /Respons instan, efisien daya/);
  assert.equal(settings.includes("['cloud', 'Cepat']"), false);
  assert.equal(settings.includes('mountMeshPanel'), false);
  assert.equal(settings.includes('nol unduhan'), false);
  assert.match(settings, /Raget 1\.0 \(997 MB\)/);
  assert.match(settings, /Belum Terpasang/);
  assert.match(settings, /Terpasang di Perangkat \(997 MB\)/);
  assert.match(settings, /Unduh Bobot Offline/);
  assert.match(read('js/chat/chat.js'), /navigator\.vibrate\(8\)/);
});

test('prefetch partisi i+4 mulai sebelum tulis disk partisi i selesai', async () => {
  assert.equal(PREFETCH_AHEAD, 4);
  const size = MODEL_CHUNK * 6;
  const marks = [];
  const store = {
    async get() { return null; },
    async put(_cache, key) {
      marks.push({ kind: 'put-start', key, at: Date.now() });
      await new Promise((resolve) => setTimeout(resolve, 40));
      marks.push({ kind: 'put-end', key, at: Date.now() });
    },
  };
  const fetchImpl = async (_url, init) => {
    const header = init.headers.Range;
    marks.push({ kind: 'fetch', header, at: Date.now() });
    const pair = header.replace('bytes=', '').split('-').map(Number);
    const expect = pair[1] - pair[0] + 1;
    return { status: 206, arrayBuffer: async () => new Uint8Array(expect).buffer };
  };
  const out = await downloadConcurrentChunks({
    url: 'https://model.local/w.bin',
    size,
    fetchImpl,
    store,
    concurrency: 1,
  });
  assert.equal(out.parts, 6);
  assert.equal(out.bytesHeld, 0);
  const put0 = marks.find((row) => row.kind === 'put-end' && row.key.includes('#0-'));
  const later = marks.find((row) => row.kind === 'fetch' && !row.header.startsWith('bytes=0-'));
  assert.ok(put0 && later);
  assert.ok(later.at < put0.at, 'fetch lanjut harus overlap dengan tulis disk');
});

test('pembaca LRU menahan 4 slot dan membaca ulang yang tergeser', async () => {
  const chunk = 8;
  const box = new Map();
  for (let i = 0; i < 6; i += 1) {
    const start = i * chunk;
    const end = start + chunk - 1;
    box.set('c\n' + 'u#' + start + '-' + end, new Uint8Array(chunk).fill(i + 1));
  }
  let reads = 0;
  const store = {
    async get(_name, key) {
      reads += 1;
      return box.get('c\n' + key);
    },
  };
  const reader = createRangeReader(store, 'u', 48, chunk, 'c', 4);
  assert.equal(reader.slots, 4);
  for (let i = 0; i < 6; i += 1) await reader.read(i * chunk, 1);
  const before = reads;
  await reader.read(0, 1);
  assert.ok(reads > before);
});

test('rantai encoder 28 lapis memangkas 196 mikro-op menjadi 56 kiriman', () => {
  const plan = chainEncoderPlan(28);
  assert.equal(plan.micro, 196);
  assert.equal(plan.submits, 56);
  assert.match(WORKGROUP_REDUCTION_SHADER, /var<workgroup>/);
  assert.match(WORKGROUP_REDUCTION_SHADER, /workgroupBarrier/);
  assert.deepEqual(reduceWorkgroup([1, 2, 3]), [6]);
  assert.equal(probeShaderF16(null).f16, false);
  assert.equal(probeShaderF16({ features: { has: (name) => name === 'shader-f16' } }).registerScale, 0.5);
});

test('jendela sink, topeng grammar, dan delta LoRA', () => {
  const trimmed = trimSinks(Array.from({ length: 2000 }, (_, i) => i));
  assert.equal(trimmed.length, 1028);
  assert.equal(trimmed[0], 0);
  assert.equal(trimmed[3], 3);
  assert.equal(trimmed[trimmed.length - 1], 1999);
  const cache = [{ k: [1], v: [2], cow: false }];
  const fork = forkKvCache(cache);
  fork[0].k = fork[0].k.slice();
  fork[0].k.push(9);
  assert.deepEqual(cache[0].k, [1]);
  const logits = Float32Array.from([1, 2, 3, 4]);
  applyGrammarMask(logits, new Set([1, 3]));
  assert.equal(logits[0], Number.NEGATIVE_INFINITY);
  assert.equal(logits[1], 2);
  const y = Float32Array.from([1, 1]);
  const x = Float32Array.from([1, 0]);
  applyLoraDelta(y, x, { rank: 1, gamma: 2, A: Float32Array.from([3, 0]), B: Float32Array.from([4, 5]) });
  assert.equal(y[0], 1 + 2 * 3 * 4);
  assert.equal(y[1], 1 + 2 * 3 * 5);
});

test('delta hash hanya mengunduh partisi yang berubah', () => {
  const plan = deltaChunkPlan(['a', 'b', 'c', 'd'], ['a', 'x', 'c', 'd']);
  assert.deepEqual(plan.changed, [1]);
  assert.equal(plan.kept, 3);
  assert.ok(plan.ratio < 0.5);
});

test('pemulihan worker menyimpan riwayat', async () => {
  const history = [{ role: 'user', text: 'halo' }];
  const guarded = await guardWorkerTurn(() => Promise.reject(new Error('jatuh')), history);
  assert.equal(guarded.ok, false);
  assert.equal(guarded.recovered, true);
  assert.equal(guarded.history[0].text, 'halo');
  assert.match(guarded.card.text, /Riwayat/);
});

test('cache sub-goal tidak mengulang rencana yang sama', () => {
  let calls = 0;
  const plan = (text) => {
    calls += 1;
    return [{ text }];
  };
  const a = cachedSubgoals('  ulang  ', plan);
  const b = cachedSubgoals('ulang', plan);
  assert.equal(calls, 1);
  assert.equal(a, b);
});

test('VAD energi, kuota, dan kebijakan HTML', () => {
  assert.ok(rmsEnergy([0.3, 0.4]) > 0.02);
  assert.equal(voiceActive([0, 0], 0.02), false);
  assert.match(VAD_WORKLET_SOURCE, /AudioWorkletProcessor/);
  assert.match(VAD_WORKLET_SOURCE, /registerProcessor/);
  assert.equal(quotaAllows(WEIGHT_ROOM, WEIGHT_ROOM).ok, true);
  assert.equal(quotaAllows(10, WEIGHT_ROOM).ok, false);
  assert.throws(() => rejectUnsafeHtml('<script>alert(1)</script>'), /trusted_types_ditolak/);
  assert.equal(rejectUnsafeHtml('<p>aman</p>'), '<p>aman</p>');
});

test('koordinator tab, berkas studio, dan sinkron potongan', async () => {
  const leader = claimModelLeader();
  assert.equal(leader.leader, true);
  assert.equal(leader.name, MODEL_LOCK);
  const bus = createModelBus();
  assert.equal(bus.name, MODEL_BUS);
  if (bus.channel && typeof bus.channel.close === 'function') bus.channel.close();
  const page = bundleStandalone({
    'index.html': '<html><head></head><body><h1>Halo</h1></body></html>',
    'style.css': 'h1{color:navy}',
    'script.js': 'console.log(1)',
  });
  assert.match(page, /h1\{color:navy\}/);
  assert.match(page, /console\.log\(1\)/);
  const pack = buildPwaPack('Studio', { 'index.html': '<html><head></head><body></body></html>' });
  assert.equal(pack.manifest.display, 'standalone');
  assert.match(pack.sw, /studio-pwa/);
  const map = buildVirtualImportMap({ '/js/script.js': 'export const n = 1;', '/css/style.css': 'body{}' });
  assert.ok(map.imports['./js/script.js']);
  assert.match(importMapTag(map.imports), /importmap/);
  const painted = highlightCode('const a = 1;', 'js');
  assert.match(painted.html, /tok-key/);
  assert.equal(painted.html.includes('<script'), false);
  const git = new VfsGit({ '/index.html': 'awal' });
  const first = git.commit('awal');
  git.stage('/index.html', 'baru');
  git.commit('ubah');
  assert.equal(git.filesAt(first)['/index.html'], 'awal');
  assert.equal(git.checkout(first)['/index.html'], 'awal');
  const box = {};
  const sent = relayChunk({ readyState: 'open', send(body) { box.body = body; } }, 3, new Uint8Array(8));
  assert.equal(sent.ok, true);
  assert.equal(sent.index, 3);
  assert.equal(morphPlan('aaaa', 'aaaa').changed, false);
  assert.equal(morphPlan('aaaa', 'aabb').keep, 2);
  const key = await sealWithPrf(new Uint8Array(32).fill(7));
  assert.equal(key.ok, true);
  assert.equal(key.extractable, false);
  assert.equal(key.algorithm, 'AES-GCM');
});
