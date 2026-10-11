import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import test from 'node:test';
import { neuralAdapter } from '../../raget-neural/neural-adapter.js';
import { dotI32x4 } from '../../raget-database/simd128.js';

const root = new URL('../../../', import.meta.url);

function read(rel) {
  return readFileSync(new URL(rel, root), 'utf8');
}

test('sapaan halo selesai di bawah 2 detik dan bukan angka token', async () => {
  const t0 = performance.now();
  const reply = await neuralAdapter.ask('halo', {});
  const ms = performance.now() - t0;
  assert.equal(ms < 2000, true);
  assert.match(reply, /Halo! Ada yang bisa saya bantu\?/);
  assert.equal(/^\d+$/.test(reply.trim()), false);
  const help = await neuralAdapter.ask('bisa bantu saya', {});
  assert.match(help, /membantu/);
  const negara = await neuralAdapter.ask('apa yang kamu ketahui tentang Indonesia', {});
  assert.match(negara, /Jakarta/);
  assert.match(negara, /282 juta/);
  assert.match(negara, /38 provinsi/);
  assert.match(negara, /416 kabupaten/);
  assert.match(negara, /98 kota/);
});

test('simd128 menghitung dot i32x4 dan tidak memakai sum4', () => {
  assert.equal(read('raget/raget-database/simd128.js').includes('sum4'), false);
  assert.equal(dotI32x4([1, 2, 3, 4], [10, 20, 30, 40]), 110);
  assert.equal(read('raget/raget-neural/neural-provider.js').includes('large === true'), true);
});

test('riwayat antarmuka dan versi 24 tercatat', () => {
  assert.equal(existsSync(new URL('docs/HISTORY-ANTARMUKA.md', root)), true);
  assert.match(read('package.json'), /24\.0\.0-PRODUCTION-GA/);
  assert.match(read('version.json'), /24\.0\.0-PRODUCTION-GA/);
  assert.equal(existsSync(new URL('docs/PRD', root)), false);
  assert.equal(existsSync(new URL('docs/PRD-RELEASE.md', root)), true);
  assert.equal(existsSync(new URL('raget/raget-neural/checkpoints', root)), false);
});
