import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterParams, PolicyEngine } from '../../../js/connectors/policy-engine.js';
import { getWorkspaceAesKey } from '../../../js/connectors/connector-state.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { crashAfterPrepare, recoverOpenJournal } from '../../../js/studio/vfs-transaction.js';
import { vfsPath } from '../../../js/studio/vfs.js';
import { createToolSandbox } from '../../../js/connectors/tool-sandbox.js';

test('serangan parameter terlarang dan properti asing ditolak', () => {
  const screened = filterParams({ q: 'studio', access_token: 'rahasia', acak: 'buang' });
  assert.deepEqual(screened.banned, ['access_token']);
  assert.equal(screened.kept.q, 'studio');
  const nested = filterParams({ q: { q: 'dalam', access_token: 'x', liar: 1 } });
  assert.ok(nested.banned.some((name) => name.indexOf('access_token') >= 0));
  assert.equal(nested.kept.q.liar, undefined);
  const engine = new PolicyEngine({ confirmed: () => true, reauth: () => true });
  const gate = engine.assert('catalog', { q: 'jakarta', liar: 'buang' });
  assert.equal(gate.args.q, 'jakarta');
  assert.equal(gate.args.liar, undefined);
  assert.equal(gate.args.access_token, undefined);
  assert.equal(gate.args.idempotency_key.length, 64);
  assert.throws(() => engine.assert('catalog', { q: 'jakarta', nonce: gate.args.nonce }), /nonce_ulang/);
});

test('kunci AES ruang kerja tidak saling membuka', async () => {
  const left = await getWorkspaceAesKey('ruang-a', 'rahasia-pengguna');
  const right = await getWorkspaceAesKey('ruang-b', 'rahasia-pengguna');
  assert.equal(left.extractable, false);
  assert.equal(right.extractable, false);
  assert.notEqual(left, right);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, left, new TextEncoder().encode('halo'));
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, left, cipher);
  assert.equal(new TextDecoder().decode(plain), 'halo');
  await assert.rejects(crypto.subtle.decrypt({ name: 'AES-GCM', iv }, right, cipher));
});

test('jurnal VFS yang tertahan di PREPARE dipulihkan', () => {
  const git = new VfsGit({ '/a.js': 'satu' });
  crashAfterPrepare(git);
  git.stage('/a.js', 'rusak');
  const n = recoverOpenJournal(git);
  assert.equal(n, 1);
  assert.equal(git.snapshot().get('/a.js'), 'satu');
});

test('traversal path dan alat tanpa kapabilitas jaringan ditolak', () => {
  assert.throws(() => vfsPath('../etc/passwd'), /terlarang/);
  assert.throws(() => vfsPath('/a/\0b'), /null byte/);
  const box = createToolSandbox(['fs:read']);
  assert.equal(box.can('fs:read'), true);
  assert.throws(() => box.fetch('https://example.test'), /kapabilitas/);
});
