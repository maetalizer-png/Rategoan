import test from 'node:test';
import assert from 'node:assert/strict';
import { syntaxValidator } from '../../raget-agents/syntax-validator.js';

test('kurung seimbang lolos, yang pincang tidak', () => {
  assert.equal(syntaxValidator.validateJs('function a(){ return [1]; }').ok, true);
  const bad = syntaxValidator.validateJs('function a(){ return [1];');
  assert.equal(bad.ok, false);
  assert.ok(bad.issues.includes('kurung-kurawal'));
});

test('tag script ditolak', () => {
  const bad = syntaxValidator.validateJs('const x = 1; <script>alert(1)</script>');
  assert.equal(bad.ok, false);
  assert.ok(bad.issues.includes('script-tag'));
});

test('pagar ganjil ditolak', () => {
  assert.equal(syntaxValidator.validateFence('lihat ```js\ncode').ok, false);
  assert.equal(syntaxValidator.validateFence('lihat ```js\ncode\n```').ok, true);
});
