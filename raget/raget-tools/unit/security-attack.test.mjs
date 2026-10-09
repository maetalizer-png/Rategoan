import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getUniversalCryptoSync } from '../../../js/core/isomorphic-crypto.js';
import { filterParams, PolicyEngine, claimNonce, NONCE_CAP } from '../../../js/connectors/policy-engine.js';
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
  const box = getUniversalCryptoSync();
  const iv = box.getRandomValues(new Uint8Array(12));
  const cipher = await box.subtle.encrypt({ name: 'AES-GCM', iv }, left, new TextEncoder().encode('halo'));
  const plain = await box.subtle.decrypt({ name: 'AES-GCM', iv }, left, cipher);
  assert.equal(new TextDecoder().decode(plain), 'halo');
  await assert.rejects(box.subtle.decrypt({ name: 'AES-GCM', iv }, right, cipher));
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

test('lima belas skenario serangan tertutup', () => {
  const scenarios = [];
  function scene(name, ok) {
    scenarios.push(name);
    assert.equal(ok, true, name);
  }
  const banned = filterParams({ q: 'a', access_token: 'x' });
  scene('token terlarang', banned.banned.includes('access_token') && banned.kept.q === 'a');
  const nested = filterParams({ q: { q: 'dalam', password: 'x' } });
  scene('sandi bersarang', nested.banned.some((name) => name.indexOf('password') >= 0));
  const extra = filterParams({ q: 'ok', liar: 1 });
  scene('properti asing dibuang', extra.kept.liar === undefined && extra.kept.q === 'ok');
  scene('proto tidak lolos', filterParams({ q: 'ok', __proto__: { admin: true } }).kept.admin === undefined);
  let now = 5000;
  const locked = new PolicyEngine({ reauth: () => false, confirmed: () => true, now: () => now });
  let message = '';
  try { locked.assert('hapus', { q: 'x' }); } catch (err) { message = err.message; }
  scene('level 5 menolak', message === 'Otentikasi ulang diperlukan');
  now += 1000;
  const still = new PolicyEngine({ reauth: () => true, confirmed: () => true, now: () => now });
  try { still.assert('hapus', { q: 'x' }); message = 'lolos'; } catch (err) { message = err.message; }
  scene('kunci 120 detik', message === 'kunci_120');
  now += 120001;
  let opened = false;
  try { still.assert('hapus', { q: 'y' }); opened = true; } catch (err) { opened = false; }
  scene('kunci berakhir', opened);
  for (let i = 0; i < NONCE_CAP; i += 1) claimNonce('nonce-' + i);
  scene('nonce masih menolak ulang', claimNonce('nonce-0') === false);
  scene('nonce lru menerima baru', claimNonce('nonce-baru') === true);
  scene('nonce terbuang boleh kembali', claimNonce('nonce-0') === true);
  scene('path traversal', (() => { try { vfsPath('../etc/passwd'); return false; } catch (e) { return /terlarang/.test(e.message); } })());
  scene('null byte', (() => { try { vfsPath('/a/\0b'); return false; } catch (e) { return /null byte/.test(e.message); } })());
  scene('zip slip', (() => { try { vfsPath('arsip/../../rahasia'); return false; } catch (e) { return /terlarang/.test(e.message); } })());
  const box = createToolSandbox(['fs:read']);
  scene('tanpa jaringan', (() => { try { box.fetch('https://example.test'); return false; } catch (e) { return /kapabilitas/.test(e.message); } })());
  scene('baca diizinkan', box.can('fs:read') === true && box.can('net:fetch') === false);
  assert.equal(scenarios.length, 15);
});
