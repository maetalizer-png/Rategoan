import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  safeNormEps, rmsNorm, ropeTheta, swigluScalar, affineScale, quantizeAffine4,
  dequantizeAffine4, mseBound, packNibbles, unpackNibbles, attentionParams, mlpParams,
  layerBufferBytes, gqaKvBytes, rrfScore,
} from '../../raget-neural/runtime/affine-int4.js';
import { enginePreference } from '../../../js/state/engine-preference.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }
function gone(rel) { return !existsSync(new URL(rel, root)); }

test('PRD rilis ada di dua jalur dan README menyebutkannya', () => {
  assert.equal(existsSync(new URL('docs/PRD/PRD-RELEASE.md', root)), true);
  assert.equal(existsSync(new URL('docs/PRD-RELEASE.md', root)), true);
  const readme = read('README.md');
  assert.match(readme, /PRD-RELEASE\.md/);
  assert.equal(readme.includes('template'), false);
  assert.match(read('docs/PRD/PRD-RELEASE.md'), /Pagar Lisensi/);
});

test('warisan skrip dan studi kasus lama sudah tidak ada', () => {
  assert.equal(gone('raget/raget-tools/migrasi-domain-selesai'), true);
  assert.equal(gone('raget/raget-tools/studi-kasus-21.mjs'), true);
  assert.equal(gone('raget/raget-tools/studi-kasus-22.mjs'), true);
  assert.equal(gone('raget/raget-tools/colab-train-gpu.ipynb'), true);
  assert.equal(gone('raget/raget-tools/bench.json'), true);
  assert.equal(gone('raget/raget-tools/build-neural-checkpoint.mjs'), true);
  assert.equal(existsSync(new URL('raget/raget-tools/studi-kasus-23.mjs', root)), true);
  assert.equal(existsSync(new URL('raget/raget-data/jsonl/kode/code-pack.jsonl', root)), true);
  assert.equal(existsSync(new URL('raget/raget-tools/train-raget-1b-2b.py', root)), true);
});

test('devlog dan pengetahuan tidak memakai frasa yang dilarang', () => {
  const sejarah = read('raget/raget-devlog/sejarah.js');
  const tematik = read('raget/raget-devlog/jsonl/devlog-tematik.jsonl');
  for (const phrase of ['rule-based', 'bukan LLM', 'template chatbot', 'massive200m round 8', 'fragmen kata acak']) {
    assert.equal(sejarah.includes(phrase), false, phrase);
    assert.equal(tematik.includes(phrase), false, phrase);
  }
  for (const rel of [
    'raget/raget-data/json/pengetahuan/raget-diri.json',
    'raget/raget-data/json/pengetahuan/riwayat-proyek.json',
    'raget/raget-data/json/pengetahuan/teknik-ai.json',
    'raget/raget-data/json/pengetahuan/produk-bisnis.json',
    'raget/raget-data/jsonl/raget_own_corpus.jsonl',
  ]) {
    assert.equal(read(rel).includes('template'), false, rel);
  }
});

test('rumus int4 dan ukuran lapis cocok dengan spesifikasi', () => {
  assert.equal(attentionParams(1536, 384), 5898240);
  assert.equal(mlpParams(1536, 4096), 18874368);
  assert.equal(attentionParams(1536, 384) + mlpParams(1536, 4096), 24772608);
  assert.equal(layerBufferBytes(45088768), 28180480);
  assert.equal(layerBufferBytes(69468160), 43417600);
  assert.equal(gqaKvBytes(28, 2048, 4, 128), 117440512);
  const scale = affineScale(0, 15);
  assert.equal(scale, 1);
  assert.equal(quantizeAffine4(7.4, scale, 0), 7);
  assert.equal(dequantizeAffine4(7, scale, 0), 7);
  assert.ok(Math.abs(mseBound(0, 15) - (1 / 12)) < 1e-12);
  assert.equal(packNibbles(1, 2), 0x21);
  assert.deepEqual(unpackNibbles(0x21), [1, 2]);
  assert.equal(Number.isFinite(safeNormEps([0, 0, 0])), true);
  assert.ok(safeNormEps([0, 0]) > 0);
  const norm = rmsNorm([3, 4], 1);
  assert.equal(norm.length, 2);
  assert.ok(Math.abs(ropeTheta(1, 128) - 1) < 1e-12);
  assert.ok(swigluScalar(0, 2) === 0);
  assert.ok(Math.abs(rrfScore([1, 1]) - (1 / 61 + 1 / 61)) < 1e-12);
});

test('preferensi panel hanya neural atau cloud dan bobot tetap kosong', () => {
  const src = read('js/state/engine-preference.js');
  assert.equal(src.includes("'template'"), false);
  assert.match(src, /saved === 'cloud' \? 'cloud' : 'neural'/);
  assert.equal(enginePreference.weightsInstalled(), false);
  assert.match(read('studio.html'), /data-tab="preview"/);
  assert.match(read('studio.html'), /data-tab="dokumen"/);
  assert.match(read('studio.html'), /data-tab="sheet"/);
  assert.match(read('studio.html'), /data-tab="files"/);
  assert.match(read('studio.html'), /data-tab="logs"/);
  assert.match(read('studio.html'), /class="hunk-accept"/);
  assert.match(read('studio.html'), />Terima</);
  assert.match(read('studio.html'), />Tolak</);
});

test('tiga berkas inti neural tidak memuat rumus baru ini', () => {
  for (const rel of [
    'raget/raget-neural/llm-attention.js',
    'raget/raget-neural/runtime/webgpu-runner.js',
    'raget/raget-neural/llm-quantization.js',
  ]) {
    assert.equal(read(rel).includes('affineScale'), false, rel);
    assert.equal(existsSync(new URL(rel, root)), true);
  }
});

test('bukti 23 tidak mengklaim bobot terpasang', () => {
  const audit = JSON.parse(read('docs/evidence/antarmuka-23.0/audit.json'));
  assert.equal(audit.version, '23.0.0-PRODUCTION-GA');
  assert.equal(audit.weightsInstalled, false);
  assert.equal(audit.gpg, false);
  assert.equal(audit.hfWeightsUploaded, false);
  assert.equal(audit.hfOldWeightsDeleted, false);
});
