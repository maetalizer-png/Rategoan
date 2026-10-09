import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { digestSha256 } from '../../raget-neural/runtime/model-downloader.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { createVfs } from '../../../js/studio/vfs.js';
import { VfsTransaction } from '../../../js/studio/vfs-transaction.js';
import { parseUnifiedDiff, validateHunkLineCount, applyUnifiedDiff, linesToPatch } from '../../../js/studio/diff-parser.js';
import { filterParams, PolicyEngine } from '../../../js/connectors/policy-engine.js';
import { McpClient } from '../../../js/connectors/mcp-client.js';
import { failoverStream, reduceStream } from '../../../js/studio/sse-door.js';
import { createEnvelope, attributeDelta, AGENT_STAGES } from '../../../js/studio/studio-agent.js';
import { healSyntax } from '../../../js/studio/ast-heal.js';
import { withWatchdog, memoryUnderBudget, blockDeviationOk } from '../../../js/studio/webgpu-watchdog.js';
import { backupToDrive } from '../../../js/studio/drive-backup.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-8.01 topbar menyatu dengan permukaan, tanpa balok terpisah', () => {
  const css = read('css/ui/studio.css');
  assert.match(css, /#topbar\.studio-topbar[\s\S]*background:\s*var\(--rg-surface\)\s*!important/);
  assert.match(css, /\.desktop-crumb[\s\S]*background:\s*transparent\s*!important/);
  assert.match(css, /#crumb-project[\s\S]*background:\s*transparent\s*!important/);
});

test('DOD-8.02 popover lampiran menempel 8px di atas tombol', () => {
  const css = read('css/ui/studio.css');
  const app = read('js/studio/studio-app.js');
  assert.match(app, /positionDesktopPopover\(sheet, \$\('btn-plus'\)\)/);
  assert.doesNotMatch(css, /bottom:\s*calc\(100% \+ 8px\)\s*!important/);
  assert.doesNotMatch(css, /bottom:\s*calc\(100% \+ 12px\)/);
});

test('DOD-8.03 jarak ikon dan label lampiran 10px', () => {
  const css = read('css/ui/studio.css');
  assert.match(css, /body\.studio-page \.attach-plain[\s\S]*gap:\s*10px\s*!important/);
});

test('DOD-8.04 digest SHA-256 tidak melempar ReferenceError dan punya fallback node', async () => {
  const src = read('raget/raget-neural/runtime/model-downloader.js');
  assert.match(src, /createHash\('sha256'\)/);
  const hex = await digestSha256(new TextEncoder().encode('abc'));
  assert.equal(hex, 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
});

test('DOD-8.05 VFS Git CAS menolak ref usang dan rollback bila sintaks pincang', async () => {
  const git = new VfsGit({ '/a.js': 'function ok(){ return 1; }' });
  const vfs = createVfs({ '/a.js': 'function ok(){ return 1; }' });
  const tx = new VfsTransaction(vfs, git);
  tx.begin();
  const id = await tx.commitBatch({ '/a.js': 'function ok(){ return 2; }' });
  assert.equal(git.refs.get('HEAD'), id);
  assert.equal(git.refs.get('main'), id);
  assert.equal(vfs.read('/a.js'), 'function ok(){ return 2; }');
  assert.throws(() => git.casRef('HEAD', 'bukan-ini', 'lain'), /CAS Ref Conflict/);
  const again = new VfsTransaction(vfs, git);
  again.begin();
  await assert.rejects(() => again.commitBatch({ '/a.js': 'function bad(){ return 1; }\n<script>alert(1)</script>' }), /Sintaks tidak sah/);
  assert.equal(vfs.read('/a.js'), 'function ok(){ return 2; }');
  assert.equal(git.refs.get('HEAD'), id);
});

test('DOD-8.05 diff menolak hunk cacat, menerapkan yang sah, dan menolak ganda', () => {
  assert.throws(() => parseUnifiedDiff('@@ -1,2 +1,1 @@\n-a\n+b\n'), /Malformed diff hunk/);
  const patch = linesToPatch([{ kind: 'same', text: 'tetap' }, { kind: 'del', text: 'lama' }, { kind: 'add', text: 'baru' }]);
  assert.equal(validateHunkLineCount(parseUnifiedDiff(patch).hunks[0]), true);
  assert.equal(applyUnifiedDiff('tetap\nlama\n', patch), 'tetap\nbaru');
  assert.equal(applyUnifiedDiff('tetap\n  lama\n', patch.replace('-lama', '-lama')), 'tetap\nbaru');
  assert.throws(() => applyUnifiedDiff('sama\nsama\n', '@@ -1,1 +1,1 @@\n-sama\n+beda\n'), /Multiple matches/);
});

test('DOD-8.06 policy menolak parameter terlarang dan MCP memakai JSON-RPC 2.0', async () => {
  const screened = filterParams({ q: 'studio', access_token: 'rahasia', acak: 'buang' });
  assert.deepEqual(screened.banned, ['access_token']);
  assert.equal(screened.kept.q, 'studio');
  assert.equal(screened.kept.acak, undefined);
  const policy = new PolicyEngine({ confirmed: () => true, reauth: () => true });
  assert.throws(() => policy.assert('github_read', { access_token: 'x' }), /parameter_ditolak/);
  let sent = null;
  const client = new McpClient({
    send(message) {
      sent = message;
      return { jsonrpc: '2.0', id: message.id, result: { tools: [{ name: 'baca' }] } };
    },
  }, policy);
  const listed = await client.listTools();
  assert.equal(sent.jsonrpc, '2.0');
  assert.equal(sent.method, 'tools/list');
  assert.equal(listed.tools[0].name, 'baca');
  const strict = new McpClient({
    send() { return { jsonrpc: '1.0', id: 1, result: {} }; },
  }, policy);
  await assert.rejects(() => strict.listTools(), /JSON-RPC tidak sah/);
});

test('DOD-8.07 pushGithub satu transaksi Git Data API, bukan PUT per berkas', () => {
  const src = read('js/studio/studio-agent.js');
  const fn = src.slice(src.indexOf('export async function pushGithub'));
  const body = fn.slice(0, fn.indexOf('export async function pullGithub'));
  assert.match(body, /\/git\/trees/);
  assert.match(body, /\/git\/commits/);
  assert.match(body, /\/git\/refs\/heads\/main/);
  assert.doesNotMatch(body, /method:\s*'PUT'/);
});

test('failover pintu tengah menyambung ke pintu lokal tanpa mengulang token', () => {
  const first = reduceStream('event: token\ndata: {"text":"halo","seq":1,"run_id":"r"}\n\n');
  const again = reduceStream('event: token\ndata: {"text":"halo","seq":1,"run_id":"r"}\n\nevent: token\ndata: {"text":" lagi","seq":2,"run_id":"r"}\n\n', first);
  assert.equal(again.text, ' lagi');
  assert.equal((again.text.match(/halo/g) || []).length, 0);
  let state = { phase: 'DOOR_B_STREAMING', seq: 2, door: 'center' };
  state = failoverStream(state, 'NETWORK_FAILURE');
  assert.equal(state.phase, 'RESUME_CURSOR');
  state = failoverStream(state, 'resume');
  assert.equal(state.phase, 'DOOR_A_LOCAL_WEBGPU');
  state = failoverStream(state, 'verify');
  state = failoverStream(state, 'commit');
  assert.equal(state.phase, 'ATOMIC_COMMIT');
  assert.equal(state.seq, 2);
});

test('envelope agen 8 tahap dan utang lama tidak dituduhkan', () => {
  assert.equal(AGENT_STAGES.length, 8);
  const env = createEnvelope({ state: 'SYNTHESIS', parent_snapshot_hash: 'abc', seq: 3 });
  assert.equal(env.state, 'SYNTHESIS');
  assert.equal(env.tool_budget, 32);
  assert.equal(env.policy_level, 3);
  assert.equal(env.parent_snapshot_hash, 'abc');
  assert.ok(env.run_id);
  assert.deepEqual(attributeDelta(['lama'], ['lama', 'baru']), ['baru']);
});

test('penyembuhan kurung dan watchdog memutus kerja yang menggantung', async () => {
  const healed = healSyntax('function a(){ return [1];');
  assert.equal(healed.ok, true);
  assert.equal(healed.healed, true);
  assert.equal(memoryUnderBudget(10 * 1024 * 1024), true);
  assert.equal(memoryUnderBudget(120 * 1024 * 1024), false);
  assert.equal(blockDeviationOk([1, 2, 3], [1, 2.01, 3]), true);
  await assert.rejects(withWatchdog(() => new Promise(() => {}), 20), /watchdog/);
});

test('cadangan Drive menolak tanpa token dan mengirim multipart bila ada token', async () => {
  assert.equal((await backupToDrive('', { a: 1 })).ok, false);
  let hit = null;
  const saved = await backupToDrive('tok', { 'index.html': '<h1>ok</h1>' }, async (url, init) => {
    hit = { url, init };
    return { ok: true, json: async () => ({ id: 'file-1' }) };
  });
  assert.equal(saved.ok, true);
  assert.equal(saved.id, 'file-1');
  assert.match(hit.url, /uploadType=multipart/);
  assert.match(hit.init.body, /index.html/);
});

test('pemeriksaan injeksi lampiran terjadi sebelum memori jangka panjang', () => {
  const src = read('js/chat/composer.js');
  const send = src.slice(src.indexOf('async send(text)'));
  const learn = send.indexOf('memoryLong.learnFromText');
  const guard = send.indexOf('Berkas berisi injeksi');
  assert.ok(guard > 0 && learn > guard);
});
