import test from 'node:test';
import assert from 'node:assert/strict';
import { searchDocs } from '../../raget-vault/local-rag.js';
import { previewSrcdoc, zipStore } from '../../../js/studio/sandbox-runner.js';

test('pencarian lokal mengutamakan dokumen yang memuat makna kueri', () => {
  const hits = searchDocs([
    { id: 'a', text: 'Ibukota Indonesia adalah Jakarta.' },
    { id: 'b', text: 'Bandung berada di Jawa Barat.' },
  ], 'jakarta ibukota', 2);
  assert.ok(hits.length >= 1);
  assert.equal(hits[0].id, 'a');
});

test('pratinjau studio menyatukan html css dan javascript', () => {
  const page = previewSrcdoc({
    'index.html': '<html><head></head><body><h1>Halo</h1></body></html>',
    'style.css': 'h1{color:navy}',
    'script.js': 'console.log(1)',
  });
  assert.match(page, /h1\{color:navy\}/);
  assert.match(page, /console\.log\(1\)/);
});

test('zip studio berisi nama berkas dan tanda PK', () => {
  const bytes = zipStore({ 'index.html': '<h1>ok</h1>', 'script.js': '1' });
  assert.equal(bytes[0], 0x50);
  assert.equal(bytes[1], 0x4b);
  assert.match(new TextDecoder().decode(bytes), /index\.html/);
});
