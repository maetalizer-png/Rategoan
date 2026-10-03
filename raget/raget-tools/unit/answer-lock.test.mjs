import test from 'node:test';
import assert from 'node:assert/strict';
import { answerComposer } from '../../raget-agents/answer-composer.js';

test('teks Indonesia tidak dianggap Inggris', () => {
  assert.equal(answerComposer.looksIndonesian('Ini adalah teks untuk pengujian yang tidak akan diubah'), true);
  assert.equal(answerComposer.looksEnglish('Ini adalah teks untuk pengujian yang tidak akan diubah'), false);
});

test('kunci bahasa tidak mengubah jawaban kalau paket terjemahan belum siap', async () => {
  const en = 'The model is trained with the data from the papers and the code.';
  assert.equal(answerComposer.looksEnglish(en), true);
  const out = await answerComposer.lockAnswer('apa itu model ini', en);
  assert.equal(out, en);
});

test('blok kode tidak dikunci', async () => {
  const code = '```\nThe code is for the parser and the test.\n```';
  assert.equal(await answerComposer.lockAnswer('apa itu', code), code);
});
