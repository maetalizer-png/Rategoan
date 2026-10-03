import test from 'node:test';
import assert from 'node:assert/strict';
import { routerIntent } from '../../raget-agents/router-intent.js';

test('cuaca live mengambil nama kota', () => {
  assert.equal(routerIntent.detectCuacaLive('cuaca di pati hari ini'), 'pati');
  assert.equal(routerIntent.detectCuacaLive('cuaca panas'), null);
});

test('jenis jawaban definisi dan daftar', () => {
  assert.equal(routerIntent.detectAnswerType('apa itu korpus'), 'definisi');
  assert.equal(routerIntent.detectAnswerType('sebutkan manfaat tidur'), 'daftar');
});

test('classifyIntent hitung', () => {
  assert.equal(routerIntent.classifyIntent('hitung 2+2'), 'hitung');
});
