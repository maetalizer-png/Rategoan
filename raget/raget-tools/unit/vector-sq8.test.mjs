import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quantizeSymmetric, dequantizeSymmetric, safeNorm, dotInt8x8, searchInt8Matrix } from '../../raget-database/vector-quantizer.js';

test('nol tetap nol', () => {
  assert.equal(quantizeSymmetric([0]).data[0], 0);
});

test('satu dibulatkan ke 127', () => {
  assert.equal(quantizeSymmetric([1]).data[0], 127);
});

test('minus satu dibulatkan ke -127', () => {
  assert.equal(quantizeSymmetric([-1]).data[0], -127);
});

test('setengah dibulatkan ke 64', () => {
  assert.equal(quantizeSymmetric([0.5]).data[0], 64);
});

test('nilai di luar rentang dikunci', () => {
  assert.equal(quantizeSymmetric([2]).data[0], 127);
  assert.equal(quantizeSymmetric([-2]).data[0], -127);
});

test('skala per vektor 1/127', () => {
  assert.equal(quantizeSymmetric([0.25]).scale, 1 / 127);
});

test('dekuantisasi simetris', () => {
  const back = dequantizeSymmetric(quantizeSymmetric([1]));
  assert.ok(Math.abs(back[0] - 1) < 1e-6);
});

test('norma nol bukan NaN', () => {
  assert.equal(safeNorm([0, 0]), 0);
  assert.equal(Number.isNaN(safeNorm([0, 0])), false);
});

test('dot 8 jalan selaras dengan perkalian biasa', () => {
  const matrix = Int8Array.from([1, 2, 3, 4, 5, 6, 7, 8]);
  const query = Int8Array.from([1, 1, 1, 1, 1, 1, 1, 1]);
  assert.equal(dotInt8x8(matrix, 0, query, 8), 36);
});

test('pencarian mengembalikan baris tanam', () => {
  const matrix = new Int8Array(16);
  matrix[8] = 9;
  const hits = searchInt8Matrix(matrix, 2, 8, Int8Array.from([9, 0, 0, 0, 0, 0, 0, 0]), 1);
  assert.equal(hits[0].id, 1);
});
