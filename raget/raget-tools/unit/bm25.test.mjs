import test from 'node:test';
import assert from 'node:assert/strict';
import { bm25 } from '../../raget-retrieval/bm25.js';

test('dokumen yang berisi kata kueri mengalahkan dokumen kosong', () => {
  const scores = bm25.scoreAll(['jakarta'], [['jakarta', 'ibukota'], ['bandung']]);
  assert.equal(scores.length, 2);
  assert.ok(scores[0] > scores[1]);
  assert.ok(scores[0] > 0 && scores[0] < 1);
});

test('kueri kosong menghasilkan nol', () => {
  assert.deepEqual(bm25.scoreAll([], [['jakarta']]), [0]);
});
