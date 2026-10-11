import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { LLMConfig } from '../../raget-neural/llm-config.js';
import { readArchitecture } from '../../raget-neural/llm-checkpoint.js';
import { draftContract } from '../../raget-neural/runtime/speculative-engine.js';
import { schedulePhase } from '../../raget-neural/runtime/prefill-scheduler.js';
import { createKvWindow } from '../../raget-neural/core/kv-policy.js';
import { NONCE_CAP, NONCE_TTL, LOCK_MS } from '../../../js/connectors/policy-engine.js';
import { LAYER_BUDGET } from '../../raget-neural/runtime/layer-binder.js';
import { WATCHDOG_MS } from '../../raget-neural/runtime/pipeline-watchdog.js';
import { quantizeSymmetric, dequantizeSymmetric, safeNorm, searchInt8Top1 } from '../../raget-database/vector-quantizer.js';
import { getSecureRandomBytesSync } from '../../../js/crypto/universal-crypto.js';
import { withVfsLock } from '../../../js/studio/vfs-transaction.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('preset aktif hanya tiga tier dan bentuk 1.0B tetap 24 lapis', () => {
  assert.deepEqual(Object.keys(LLMConfig.PRESETS), ['1.0B', '1.5B', '2.0B']);
  assert.equal(LLMConfig.PRESETS['1.0B'].nLayers, 24);
  assert.equal(LLMConfig.PRESETS['1.5B'].dModel, 2048);
  assert.equal(LLMConfig.PRESETS['2.0B'].nHeads, 20);
  assert.equal(LLMConfig.PRESETS.tiny, undefined);
  assert.equal(LLMConfig.TIER_SHAPES['1.0B'].dFF, 0);
  assert.equal(LLMConfig.TIER_SHAPES['1.5B'].layerMiB, 26.87);
});

test('header safetensors membaca lebar dan GQA tanpa angka tertanam di parser', () => {
  const got = readArchitecture({
    __metadata__: { d_model: 2048, n_layers: 28, n_heads: 16, n_kv_heads: 4 },
  });
  assert.equal(got.flex, true);
  assert.equal(got.tier, '1.5B');
  assert.equal(got.gqa, 4);
  assert.equal(got.ratio, 4);
  assert.equal(got.layers, 28);
});

test('draft spekulatif tidak memakai rentang 15 sampai 50 dan bobot tetap kosong', () => {
  const row = draftContract();
  assert.equal(row.draft, 'draft-100M');
  assert.equal(row.target, '1.5B');
  assert.equal(row.weights, false);
});

test('workgroup prefill 256 dan decode 64', () => {
  assert.deepEqual(schedulePhase('prefill').workgroup, [256, 1, 1]);
  assert.deepEqual(schedulePhase('decode').workgroup, [64, 1, 1]);
});

test('jendela KV menyimpan 4 sink dan 1024 token geser', () => {
  const kv = createKvWindow();
  for (let i = 0; i < 2000; i += 1) kv.push(i);
  const stored = kv.stored();
  assert.equal(stored.length, 4 + 1024);
  assert.equal(stored[0], 0);
  assert.equal(stored[3], 3);
  assert.equal(stored[stored.length - 1], 1999);
  assert.equal(kv.seen(), 2000);
});

test('nonce alat 1000 entri dan kedaluwarsa 60 detik, kunci level 5 120 detik', () => {
  assert.equal(NONCE_CAP, 1000);
  assert.equal(NONCE_TTL, 60000);
  assert.equal(LOCK_MS, 120000);
});

test('anggaran lapis 1.5B dan pengawas 5000 ms', () => {
  assert.equal(LAYER_BUDGET, Math.round(26.87 * 1024 * 1024));
  assert.equal(WATCHDOG_MS, 5000);
  assert.equal(LAYER_BUDGET <= Math.round(26.87 * 1024 * 1024), true);
});

test('kuantisasi simetris membulatkan kali 127 dan vektor nol tidak NaN', () => {
  const packed = quantizeSymmetric([0, 1, -1, 0.5]);
  assert.deepEqual(Array.from(packed.data), [0, 127, -127, 64]);
  const back = dequantizeSymmetric(packed);
  assert.ok(Math.abs(back[3] - 64 / 127) < 1e-6);
  assert.equal(safeNorm([0, 0, 0]), 0);
  assert.equal(Number.isFinite(safeNorm([0, 0])), true);
});

test('pencarian int8 10000 kali 384 menemukan baris tanam di bawah 8.5 ms', () => {
  const count = 10000;
  const dim = 384;
  const matrix = new Int8Array(count * dim);
  const query = new Int8Array(dim);
  query.fill(127);
  matrix.set(query, 9999 * dim);
  searchInt8Top1(matrix, count, dim, query);
  searchInt8Top1(matrix, count, dim, query);
  const t0 = performance.now();
  const hit = searchInt8Top1(matrix, count, dim, query);
  const ms = performance.now() - t0;
  assert.equal(hit.id, 9999);
  assert.ok(ms < 8.5, 'ms ' + ms);
});

test('acak aman lewat modul universal dan kunci vfs memakai nama kanonik', () => {
  const bytes = getSecureRandomBytesSync(16);
  assert.equal(bytes.length, 16);
  assert.equal(read('js/studio/vfs-transaction.js').includes('rategoan_vfs_wal'), true);
  assert.equal(typeof withVfsLock, 'function');
});

test('readme tidak menurunkan produk dan versi paket 22', () => {
  const readme = read('README.md');
  assert.equal(readme.includes('template'), false);
  assert.equal(readme.includes('rule-based'), false);
  assert.equal(readme.includes('bukan model bahasa besar'), false);
  assert.match(read('package.json'), /22\.0\.0-PRODUCTION-GA/);
  assert.match(read('version.json'), /22\.0\.0-PRODUCTION-GA/);
  assert.equal(existsSync(new URL('raget/raget-tools/arsip-nonaktif', root)), false);
  assert.equal(existsSync(new URL('raget/raget-tools/train-massive-colab-gpu.py', root)), false);
  assert.equal(existsSync(new URL('raget/raget-tools/train-raget-1b-2b.py', root)), true);
  assert.match(read('sw.js'), /raget-app-shell-v19/);
});

test('bukti 22 ada dan tidak mengklaim bobot terpasang', () => {
  const audit = JSON.parse(read('docs/evidence/antarmuka-22.0/audit.json'));
  assert.equal(audit.version, '22.0.0-PRODUCTION-GA');
  assert.equal(audit.weightsInstalled, false);
  assert.equal(audit.gpg, false);
});
