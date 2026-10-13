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

test('sapaan tidak memakai template dan tidak mencetak galat bobot', async () => {
  const src = read('raget/raget-neural/neural-provider.js');
  const adapter = read('raget/raget-neural/neural-adapter.js');
  assert.equal(src.includes('tryGreeting'), false);
  assert.equal(src.includes('tryDailyTalk'), false);
  assert.equal(src.includes('retrieveFact'), false);
  assert.equal(/hallo\+/.test(src), false);
  assert.equal(adapter.includes('Bobot Raget 1.0 belum termuat'), false);
  const orig = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error('offline'); };
  try {
    const t0 = performance.now();
    const reply = await neuralAdapter.ask('halo', {});
    assert.equal(performance.now() - t0 < 2000, true);
    assert.equal(reply, null);
  } finally {
    globalThis.fetch = orig;
  }
});

test('simd128 menghitung dot i32x4 dan tidak memakai sum4', () => {
  assert.equal(read('raget/raget-database/simd128.js').includes('sum4'), false);
  assert.equal(dotI32x4([1, 2, 3, 4], [10, 20, 30, 40]), 110);
  assert.equal(read('raget/raget-neural/neural-provider.js').includes('large === true'), true);
});

test('riwayat antarmuka dan versi 24 tercatat', () => {
  assert.equal(existsSync(new URL('docs/HISTORY-ANTARMUKA.md', root)), false);
  assert.match(read('package.json'), /25\.0\.0-PRODUCTION-GA/);
  assert.match(read('version.json'), /25\.0\.0-PRODUCTION-GA/);
  assert.equal(existsSync(new URL('docs/PRD', root)), false);
  assert.equal(existsSync(new URL('docs/PRD-RELEASE.md', root)), true);
  assert.equal(existsSync(new URL('raget/raget-neural/checkpoints', root)), false);
});
