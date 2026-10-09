import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { getSecureRandomBytesSync, getUniversalCryptoSync } from '../../../js/core/isomorphic-crypto.js';
import { PolicyEngine, claimNonce, NONCE_TTL, LOCK_MS, __setClockOffsetForTesting, filterPolicyAudit, exportPolicyAudit } from '../../../js/connectors/policy-engine.js';
import { syntheticCorpus, buildVectorIndex, searchSq8, partitionNodes, reciprocalRankFusion } from '../../raget-database/hybrid-search.js';
import { HNSW_NODES, putRow, allRows } from '../../raget-database/durable-store.js';
import { withVfsLock, crashAfterPrepare, recoverOpenJournal } from '../../../js/studio/vfs-transaction.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { hunkStageModel, stageHunks } from '../../../js/studio/diff-parser.js';
import { nullOriginHandshake } from '../../../js/studio/sandbox-runner.js';
import { parseSafetensorsHeader, readArchitecture } from '../../raget-neural/llm-checkpoint.js';
import { NEURAL_CACHE } from '../../raget-neural/runtime/model-downloader.js';
import { LAYER_BUDGET, bindLayers } from '../../raget-neural/runtime/layer-binder.js';
import { accuracyGuard, adjustScale } from '../../raget-neural/runtime/quant-guard.js';
import { draftContract } from '../../raget-neural/runtime/speculative-engine.js';
import { thermalGovernor } from '../../raget-neural/runtime/thermal-governor.js';
import { createVoicePipeline } from '../../../js/voice/voice-pipeline.js';
import { numericConsistent, checkClaim } from '../../raget-template/fact-verifier.js';
import { MEMORY_BUDGET, withinBudget, packText, unpackText } from '../../../js/studio/memory-budget.js';
import { mermaidToSvg, bindSheetChart, scaffoldProject, indexSymbols, parseImports, synthesizeTool, passAt1, iwaManifest, backupManifest, verifyBackupManifest, splitAxis, hotReloadPlan, createWasmTerminal } from '../../../js/studio/canvas-tools.js';
import { selfHealLoop } from '../../../js/studio/studio-agent.js';
import { meshOffer } from '../../../js/sync/p2p-sync.js';
import { planHeartbeat } from '../../../js/connectors/mcp-bridge.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-14.01 kripto isomorfik sinkron tanpa pengenal telanjang', () => {
  const a = getSecureRandomBytesSync(16);
  const b = getSecureRandomBytesSync(16);
  assert.equal(a.length, 16);
  assert.equal(b.length, 16);
  assert.notEqual(Buffer.from(a).toString('hex'), Buffer.from(b).toString('hex'));
  const box = getUniversalCryptoSync();
  const iv = box.getRandomValues(new Uint8Array(12));
  assert.equal(iv.length, 12);
  assert.equal(typeof box.subtle.digest, 'function');
  const files = ['js/connectors/policy-engine.js', 'js/studio/sse-door.js', 'js/studio/sandbox-runner.js'];
  files.forEach((rel) => {
    const text = read(rel).replace(/globalThis\.crypto/g, '').replace(/['"][^'"]*['"]/g, '""');
    assert.equal(/\bcrypto\s*\./.test(text), false, rel);
  });
});

test('DOD-14.02 pencarian SQ8 10000x384 di bawah 9ms', () => {
  const plant = 9999;
  const rows = syntheticCorpus(10000, 384, plant);
  const index = buildVectorIndex(rows);
  assert.equal(index.quant, 'int8');
  assert.equal(index.qdata.length, 10000 * 384);
  assert.ok(index.qdata.byteLength < rows.length * 384 * 4);
  const t0 = performance.now();
  const hits = searchSq8(index, rows[plant], 1);
  const ms = performance.now() - t0;
  assert.equal(hits[0].id, plant);
  assert.equal(hits[0].distance, 0);
  assert.ok(ms < 9, 'ms ' + ms);
});

test('DOD-14.03 kunci level 5 kedaluwarsa lewat jam monoton', () => {
  __setClockOffsetForTesting(0);
  const closed = new PolicyEngine({ reauth: () => false, confirmed: () => true });
  assert.throws(() => closed.assert('revoke-slot', { q: 'x' }), /Otentikasi ulang diperlukan/);
  __setClockOffsetForTesting(LOCK_MS + 20);
  const open = new PolicyEngine({ reauth: () => true, confirmed: () => true });
  const gate = open.assert('revoke-slot', { q: 'y' });
  assert.equal(gate.level, 5);
  __setClockOffsetForTesting(0);
});

test('DOD-14.04 mutex WAL dan pemulihan PREPARE', async () => {
  const order = [];
  const first = withVfsLock(async () => {
    order.push('a');
    await new Promise((resolve) => setTimeout(resolve, 15));
    order.push('a2');
  });
  const second = withVfsLock(async () => { order.push('b'); });
  await first;
  await second;
  assert.deepEqual(order, ['a', 'a2', 'b']);
  const git = new VfsGit({ '/a.js': 'utuh' });
  crashAfterPrepare(git);
  git.stage('/a.js', 'rusak');
  assert.equal(recoverOpenJournal(git), 1);
  assert.equal(git.snapshot().get('/a.js'), 'utuh');
});

test('DOD-14.05 soket safetensors tanpa model luar dan inti tidak disunting', () => {
  const meta = { __metadata__: { hidden_size: '1536', n_layers: '28', num_key_value_heads: '8' }, 'embedding.weight': { dtype: 'F32', shape: [2, 2], data_offsets: [0, 16] } };
  const json = new TextEncoder().encode(JSON.stringify(meta));
  const buf = new Uint8Array(8 + json.length);
  new DataView(buf.buffer).setUint32(0, json.length, true);
  buf.set(json, 8);
  const parsed = parseSafetensorsHeader(buf);
  const arch = readArchitecture(parsed.header);
  assert.equal(arch.hidden, 1536);
  assert.equal(arch.layers, 28);
  assert.equal(arch.gqa, 8);
  assert.equal(NEURAL_CACHE, 'rategoan-neural-v4');
  assert.equal(LAYER_BUDGET, Math.round(26.87 * 1024 * 1024));
  assert.equal(bindLayers(2).layers[1].offset, LAYER_BUDGET);
  assert.equal(draftContract().weights, false);
  const runner = read('raget/raget-neural/runtime/webgpu-runner.js');
  const quant = read('raget/raget-neural/llm-quantization.js');
  const attn = read('raget/raget-neural/llm-attention.js');
  assert.equal(runner.includes('flash-decoding'), false);
  assert.equal(quant.includes('accuracyGuard'), false);
  assert.equal(attn.includes('forwardAttention'), false);
  const guard = accuracyGuard([1, 0], [1, 0]);
  assert.equal(guard.ok, true);
  assert.equal(adjustScale(2, { ok: false }), 1);
});

test('DOD-14.06 partisi hnsw_nodes 500 simpul', async () => {
  const rows = syntheticCorpus(1000, 8, 3);
  const index = buildVectorIndex(rows);
  const parts = partitionNodes(index, 500);
  assert.equal(parts.length, 2);
  assert.equal(parts[0].store, 'hnsw_nodes');
  assert.equal(parts[0].end - parts[0].start, 500);
  await putRow(HNSW_NODES, parts[1]);
  const saved = await allRows(HNSW_NODES);
  assert.equal(saved.find((row) => row.id === 'node-500').kind, 'hnsw');
  const fused = reciprocalRankFusion([['a', 'b'], ['b', 'c']]);
  assert.equal(fused[0].id, 'b');
});

test('DOD-14.07 suara tanpa bobot luar di bawah 300ms', () => {
  const voice = createVoicePipeline();
  assert.equal(voice.engines.stt, 'whisper-webgpu');
  assert.equal(voice.engines.tts, 'kokoro-wasm');
  assert.equal(voice.engines.weights, false);
  assert.equal(voice.engines.external, false);
  voice.start();
  assert.ok(voice.step().ms < 300);
  voice.barge();
  assert.equal(voice.step().barged, true);
  assert.equal(numericConsistent('meluber 140%').ok, false);
  assert.equal(checkClaim('Jakarta 282', 'Jakarta 282 juta').ok, true);
  assert.equal(checkClaim('meluber 140%', 'Jakarta').ok, false);
});

test('DOD-14.08 hunk, nonce, asal null, dan anggaran memori', () => {
  const patch = '@@ -1,1 +1,1 @@\n-lama\n+baru\n';
  assert.equal(stageHunks('lama', patch, ['reject']).text, 'lama');
  assert.equal(stageHunks('lama', patch, ['accept']).text, 'baru');
  assert.equal(hunkStageModel(1)[0].reject, 'Tolak');
  assert.equal(claimNonce('ttl-a', 0), true);
  assert.equal(claimNonce('ttl-a', 10), false);
  assert.equal(claimNonce('ttl-a', NONCE_TTL + 1), true);
  const hand = nullOriginHandshake();
  assert.equal(hand.origin, 'null');
  assert.equal(hand.sameOrigin, false);
  assert.equal(hand.token.length, 32);
  assert.equal(withinBudget({ '/a.js': 'kecil' }), true);
  assert.equal(withinBudget({ '/besar.txt': 'x'.repeat(MEMORY_BUDGET) }), false);
  assert.equal(unpackText(packText('aaab')), 'aaab');
});

test('DOD-14.09 namespace, kanvas, dan jejak izin', async () => {
  assert.match(read('js/core/namespace.js'), /root\.Rategoan/);
  assert.match(read('js/account/settings.js'), /policy-audit-tools/);
  assert.match(read('css/ui/studio.css'), /overflow-x:\s*auto/);
  const engine = new PolicyEngine({ confirmed: () => true, reauth: () => true });
  engine.assert('catalog', { q: 'jakarta' });
  assert.equal(filterPolicyAudit('catalog', 'INFO').length >= 1, true);
  assert.match(exportPolicyAudit('csv'), /catalog,izin,INFO/);
  assert.match(mermaidToSvg('A --> B'), /<svg/);
  const chart = bindSheetChart([1, 2]);
  chart.set(1, 5);
  assert.deepEqual(chart.bars(), [1, 5]);
  const files = scaffoldProject('delta');
  assert.match(files['/index.html'], /delta/);
  const manifest = backupManifest(files);
  assert.equal(verifyBackupManifest(files, manifest), true);
  files['/index.html'] += 'x';
  assert.equal(verifyBackupManifest(files, manifest), false);
  assert.deepEqual(indexSymbols('function alfa(){}\nclass Beta {}').map((row) => row.name), ['alfa', 'Beta']);
  assert.deepEqual(parseImports("import { a } from './a.js';"), ['./a.js']);
  const tool = synthesizeTool({ name: 'ukur' });
  assert.equal(tool({ q: 1 }).dom, false);
  assert.throws(() => tool({ document: true }), /isolasi/);
  assert.equal(passAt1().weights, false);
  assert.equal(passAt1().score, 1);
  assert.equal(iwaManifest().externalModels, false);
  assert.equal(splitAxis('vertical'), 'vertical');
  assert.equal(hotReloadPlan({ y: 1 }).fullReload, false);
  assert.equal(thermalGovernor({ tempC: 50, battery: 0.9 }).throttle, true);
  assert.equal(thermalGovernor({ tempC: 30, battery: 0.8 }).hz, 12);
  const term = await createWasmTerminal({ snapshot: () => new Map([['/a.js', '1']]) });
  assert.equal(term.wasm, true);
  assert.equal(await term.exec('add 2 3'), '5');
  assert.match(await term.exec('ls'), /\/a\.js/);
  const healed = await selfHealLoop('rusak', async (code, cycle) => (cycle === 0 ? { next: 'baik' } : { ok: true }));
  assert.equal(healed.ok, true);
  assert.ok(healed.cycles <= 3);
  assert.equal(meshOffer('ponsel').passkey, true);
  assert.equal(meshOffer('ponsel').signaling, 'serverless');
  assert.equal(planHeartbeat('rahasia', 'rahasia', 'ws://127.0.0.1:9/mcp').intervalMs, 15000);
});

test('DOD-14.10 dokumen aktif menunjuk 14.0 dan sejarah 13 tetap ada', () => {
  assert.match(read('docs/PRD/README.md'), /PRD-ANTARMUKA-14\.0\.md/);
  assert.match(read('docs/HISTORY-ANTARMUKA.md'), /14\.0/);
  assert.equal(read('docs/HISTORY-ANTARMUKA.md').includes('13.0'), true);
});
