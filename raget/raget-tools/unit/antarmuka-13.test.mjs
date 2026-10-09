import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { createSyncKey, meshOffer } from '../../../js/sync/p2p-sync.js';
import { signPlugin, verifyPlugin } from '../../../js/connectors/plugin-verifier.js';
import { planHeartbeat } from '../../../js/connectors/mcp-bridge.js';
import { JOURNAL_STORE, memoryAll } from '../../raget-database/durable-store.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { crashAfterPrepare, bootRecover } from '../../../js/studio/vfs-transaction.js';
import { stageHunks, hunkStageModel } from '../../../js/studio/diff-parser.js';
import { parseImpactMatrix, selectImpactedTests } from '../../../js/studio/studio-agent.js';
import { nullOriginHandshake } from '../../../js/studio/sandbox-runner.js';
import { parseSafetensorsHeader, decoupleWeightTie } from '../../raget-neural/llm-checkpoint.js';
import { planRanges, downloadModel, digestSha256, MODEL_CHUNK } from '../../raget-neural/runtime/model-downloader.js';
import { forwardAttention } from '../../raget-neural/runtime/forward-attention.js';
import { standardAttention } from '../../raget-neural/runtime/flash-decoding.js';
import { bindLayers, LAYER_BUDGET } from '../../raget-neural/runtime/layer-binder.js';
import { armWatchdog, WATCHDOG_MS } from '../../raget-neural/runtime/pipeline-watchdog.js';
import { accuracyGuard } from '../../raget-neural/runtime/quant-guard.js';
import { draftContract } from '../../raget-neural/runtime/speculative-engine.js';
import { syntheticCorpus, buildVectorIndex, searchKnn, partitionIndex } from '../../raget-database/hybrid-search.js';
import { putRow, allRows, HNSW_STORE } from '../../raget-database/durable-store.js';
import { createVoicePipeline } from '../../../js/voice/voice-pipeline.js';
import { numericConsistent } from '../../raget-template/fact-verifier.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-13.05 namespace tunggal dan alias RG', () => {
  const ns = read('js/core/namespace.js');
  assert.match(ns, /root\.Rategoan/);
  assert.match(ns, /root\.RG = root\.Rategoan/);
  assert.match(read('js/main.js'), /mountNamespace\('mesin'/);
  assert.match(read('js/studio/studio-app.js'), /mountNamespace\('stream'/);
  assert.equal(read('js/main.js').includes('window.' + '__rategoanMesin'), false);
  assert.equal(read('js/studio/studio-app.js').includes('window.' + 'RagetStream'), false);
});

test('DOD-13.06 kriptografi tidak memakai crypto tak terikat', async () => {
  const files = ['js/sync/p2p-sync.js', 'js/connectors/plugin-verifier.js', 'js/studio/sse-door.js', 'js/connectors/policy-engine.js'];
  files.forEach((rel) => {
    const text = read(rel)
      .replace(/globalThis\.crypto/g, '')
      .replace(/['"][^'"]*['"]/g, '""');
    assert.equal(/\bcrypto\s*\./.test(text), false, rel);
  });
  const key = await createSyncKey();
  assert.equal(key.extractable, false);
  const signed = await signPlugin('plug-13');
  assert.equal(await verifyPlugin(signed), true);
});

test('DOD-13.07 jurnal PREPARE tersimpan di vfs_tx_journal', async () => {
  const git = new VfsGit({ '/a.js': 'utuh' });
  const id = crashAfterPrepare(git);
  const stored = memoryAll(JOURNAL_STORE).find((row) => row.id === id);
  assert.equal(stored.status, 'PREPARE');
  assert.equal(stored.files['/a.js'], 'utuh');
  git.stage('/a.js', 'rusak');
  const n = await bootRecover(git);
  assert.equal(n, 1);
  assert.equal(git.snapshot().get('/a.js'), 'utuh');
});

test('DOD-13.08 tombol terima dan tolak per hunk', () => {
  const html = read('studio.html');
  assert.match(html, /class="hunk-accept"/);
  assert.match(html, />Terima</);
  assert.match(html, />Tolak</);
  const model = hunkStageModel(2);
  assert.deepEqual(model.map((row) => row.accept + '/' + row.reject), ['Terima/Tolak', 'Terima/Tolak']);
  const patch = '@@ -1,1 +1,1 @@\n-lama\n+baru\n';
  assert.equal(stageHunks('lama', patch, ['reject']).text, 'lama');
  assert.equal(stageHunks('lama', patch, ['accept']).text, 'baru');
});

test('DOD-13.09 header safetensors dan unduhan 20MB berhash', async () => {
  const meta = JSON.stringify({
    'embedding.weight': { dtype: 'F32', shape: [2], data_offsets: [0, 8] },
    'lm_head.weight': { dtype: 'F32', shape: [2], data_offsets: [0, 8] },
  });
  const body = new TextEncoder().encode(meta);
  const bytes = new Uint8Array(8 + body.length);
  new DataView(bytes.buffer).setUint32(0, body.length, true);
  bytes.set(body, 8);
  const parsed = parseSafetensorsHeader(bytes);
  assert.ok(parsed.names.includes('embedding.weight'));
  assert.equal(decoupleWeightTie(parsed.header).tied, true);
  assert.equal(decoupleWeightTie(parsed.header).shared, 'embedding.weight');
  const ranges = planRanges(40 * 1024 * 1024, MODEL_CHUNK);
  assert.equal(ranges.length, 2);
  const payload = new Uint8Array([1, 2, 3, 4]);
  const hash = await digestSha256(payload);
  const got = await downloadModel({
    url: 'https://example.test/bobot',
    size: 4,
    chunk: 4,
    chunkHashes: [hash],
    fetchImpl: async () => ({ arrayBuffer: async () => payload.buffer }),
  });
  assert.equal(got.digests[0], hash);
  assert.equal(got.fetched, 1);
});

test('DOD-13.10 atensi maju lewat kernel samping, inti tidak disunting', () => {
  const q = [0.2, -0.4, 0.8, 0.1];
  const keys = [[0.2, 0.1, 0.0, -0.2], [0.5, -0.3, 0.4, 0.2], [-0.1, 0.6, 0.2, 0.0], [0.3, 0.3, -0.5, 0.4]];
  const values = [[1, 0], [0, 1], [0.5, 0.5], [0.2, 0.8]];
  const got = forwardAttention(q, keys, values);
  const standard = standardAttention(q, keys, values);
  got.y.forEach((value, index) => assert.ok(Math.abs(value - standard[index]) < 1.25e-8));
  assert.equal(got.materialized, false);
  const runner = read('raget/raget-neural/runtime/webgpu-runner.js');
  const quant = read('raget/raget-neural/llm-quantization.js');
  const attn = read('raget/raget-neural/llm-attention.js');
  assert.equal(runner.includes('flash-decoding'), false);
  assert.equal(quant.includes('accuracyGuard'), false);
  assert.equal(attn.includes('forwardAttention'), false);
  const bound = bindLayers(2);
  assert.equal(bound.layers[1].offset, LAYER_BUDGET);
  const dog = armWatchdog(0, WATCHDOG_MS);
  assert.equal(dog.expired(4999), false);
  assert.equal(dog.expired(5000), true);
  assert.equal(dog.recreate, true);
  assert.equal(accuracyGuard([1, 0], [1, 0]).ok, true);
  assert.equal(draftContract().weights, false);
});

test('DOD-13.11 graf HNSW 384 dimensi di bawah 12ms', async () => {
  const plant = 9999;
  const rows = syntheticCorpus(10000, 384, plant);
  const index = buildVectorIndex(rows);
  assert.equal(index.kind, 'hnsw');
  assert.equal(index.dim, 384);
  const parts = partitionIndex(index, 1000);
  assert.equal(parts.length, 10);
  await putRow(HNSW_STORE, parts[3]);
  const saved = await allRows(HNSW_STORE);
  assert.equal(saved.find((row) => row.id === 'shard-3000').dim, 384);
  const t0 = performance.now();
  const hits = searchKnn(index, rows[plant], 1);
  const ms = performance.now() - t0;
  assert.equal(hits[0].id, plant);
  assert.equal(hits[0].distance, 0);
  assert.ok(ms < 12, 'ms ' + ms);
});

test('DOD-13.12 suara dan angka tanpa bobot model', () => {
  const voice = createVoicePipeline();
  assert.equal(voice.engines.stt, 'whisper-webgpu');
  assert.equal(voice.engines.tts, 'kokoro-wasm');
  assert.equal(voice.engines.weights, false);
  voice.start();
  assert.ok(voice.step().ms < 300);
  voice.barge();
  assert.equal(voice.step().barged, true);
  assert.equal(numericConsistent('terisi 40% dan 80%').ok, true);
  assert.equal(numericConsistent('meluber 140%').ok, false);
});

test('jantung MCP lokal, mesh, matriks tes, dan asal null', () => {
  const beat = planHeartbeat('rahasia', 'rahasia', 'ws://127.0.0.1:9/mcp');
  assert.equal(beat.ok, true);
  assert.equal(beat.intervalMs, 15000);
  assert.equal(beat.reconnect, true);
  assert.equal(planHeartbeat('rahasia', 'rahasia', 'wss://example.test/mcp').reason, 'host');
  assert.equal(meshOffer('ponsel').signaling, 'serverless');
  const graph = parseImpactMatrix('js/studio/vfs.js -> raget/raget-tools/unit/vfs.test.mjs\n');
  assert.deepEqual(selectImpactedTests(['js/studio/vfs.js'], graph), ['raget/raget-tools/unit/vfs.test.mjs']);
  const hand = nullOriginHandshake();
  assert.equal(hand.sameOrigin, false);
  assert.equal(hand.origin, 'null');
  assert.match(read('studio.html'), /sandbox="allow-scripts allow-forms"/);
});

test('jejak izin tampil di pengaturan', () => {
  const js = read('js/account/settings.js');
  assert.match(js, /id="row-policy-audit"/);
  assert.match(js, /readPolicyAudit\(\)/);
  assert.match(read('css/account/settings.css'), /\.policy-audit-log/);
});

test('DOD-13.13 shell v19 dan penyimpanan terisolasi', () => {
  assert.match(read('sw.js'), /raget-app-shell-v19/);
  const manifest = JSON.parse(read('manifest.webmanifest'));
  assert.equal(manifest.isolated_storage, true);
  assert.equal(manifest.prefer_related_applications, false);
  assert.match(read('docs/HISTORY-ANTARMUKA.md'), /13\.0/);
});
