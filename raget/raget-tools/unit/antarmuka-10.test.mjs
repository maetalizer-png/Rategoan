import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getWebCrypto } from '../../../js/crypto/get-web-crypto.js';
import { deriveVaultKey } from '../../../js/connectors/connector-state.js';
import { validateMcpPayload } from '../../../js/connectors/mcp-client.js';
import { parseIntentGraph, synthesizeAST, synthesizeCode, renderPartial, createStreamSynthesizer } from '../../../js/studio/neural-synthesizer.js';
import { VfsGit } from '../../../js/studio/vfs-git.js';
import { mergeLines } from '../../../js/studio/diff-parser.js';
import { cycleSandboxPorts } from '../../../js/studio/sandbox-runner.js';
import { recordTelemetry, publicMetrics, auditEvent } from '../../../js/studio/telemetry.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-10.01 getWebCrypto dan deriveVaultKey tidak melempar ReferenceError', async () => {
  const cryptoImpl = await getWebCrypto();
  assert.equal(typeof cryptoImpl.subtle.importKey, 'function');
  const key = await deriveVaultKey(new Map());
  assert.equal(key.extractable, false);
  assert.equal(key.algorithm.name, 'AES-GCM');
});

test('DOD-10.03 iframe pratinjau tidak membawa allow-same-origin', () => {
  const html = read('studio.html');
  assert.match(html, /sandbox="allow-scripts allow-forms"/);
  assert.doesNotMatch(html, /allow-same-origin/);
  const runner = read('js/studio/sandbox-runner.js');
  assert.match(runner, /MessageChannel/);
  assert.match(runner, /INIT_PORT/);
  assert.match(runner, /RENDER_PAYLOAD/);
  assert.doesNotMatch(runner, /postMessage\([\s\S]{0,180}'\*'/);
});

test('DOD-10.06 sintesis tidak memakai templat daftar belanja kaku', () => {
  const src = read('js/studio/neural-synthesizer.js');
  assert.doesNotMatch(src, /\/daftar\|list\|belanja/);
  assert.match(src, /parseIntentGraph/);
  assert.match(src, /synthesizeAST/);
});

test('DOD-10.07 IntentNode menjadi AST dan halaman daftar tetap punya formulir', async () => {
  const graph = parseIntentGraph('buat halaman daftar belanja dengan tombol tambah');
  const ast = synthesizeAST(graph);
  assert.equal(ast.component, 'DynamicContainer');
  assert.ok(ast.children.some((node) => node.component === 'CardContainer'));
  const made = await synthesizeCode('buat halaman daftar belanja dengan tombol tambah', {});
  assert.match(made.files['index.html'], /id="form"/);
  assert.match(made.files['index.html'], /daftar/);
  assert.match(made.reply, /dirakit/);
  const plain = synthesizeAST(parseIntentGraph('rancang panel cuaca bandung'));
  assert.equal(plain.children.some((node) => node.component === 'CardContainer'), false);
  assert.equal(plain.children.some((node) => node.component === 'NumericInputField'), false);
});

test('DOD-10.08 fragmen stream tidak utuh tetap merender di bawah 20ms', () => {
  const started = performance.now();
  const partial = renderPartial('buat daftar catatan ```index');
  const ms = performance.now() - started;
  assert.ok(partial['index.html']);
  assert.ok(ms < 20, 'parsing ' + ms);
  const stream = createStreamSynthesizer();
  stream.push('buat ');
  const done = stream.finish();
  assert.match(done['index.html'], /<h1>/);
});

test('DOD-10.11 seribu siklus port tidak menyisakan saluran terbuka', () => {
  const stat = cycleSandboxPorts(1000);
  assert.equal(stat.cycles, 1000);
  assert.equal(stat.open, 0);
});

test('DOD-10.13 dan 10.14 sasis 920, galeri, dan backdrop lampiran transparan', () => {
  const desktop = read('css/layout/desktop.css');
  const overhaul = read('css/ui/overhaul.css');
  const studio = read('css/ui/studio.css');
  assert.match(desktop, /max-width:\s*920px/);
  assert.match(desktop, /padding:\s*32px 40px/);
  assert.match(desktop, /body\.attach-open \.sheet-backdrop\.show[\s\S]*background:\s*transparent/);
  assert.match(overhaul, /minmax\(260px,\s*1fr\)/);
  assert.doesNotMatch(overhaul, /#view-artifacts \.settings-page \{ display: grid; grid-template-columns: 1fr 1fr/);
  assert.match(studio, /#sheet-backdrop[\s\S]*background:\s*transparent !important/);
  assert.match(studio, /studio-pop 150ms/);
});

test('Merkle VFS utuh dan merge baris menandai konflik', () => {
  const git = new VfsGit({ '/index.html': '<h1>ada</h1>' });
  assert.equal(git.verifyIntegrity(), true);
  const snap = git.snapshot();
  git.stage('/index.html', '<h1>ubah</h1>');
  assert.equal(git.recover(snap), true);
  assert.equal(git.snapshot().get('/index.html'), '<h1>ada</h1>');
  assert.equal(mergeLines('a', 'a', 'b').text, 'b');
  assert.equal(mergeLines('a', 'b', 'c').conflict, true);
});

test('payload MCP menolak token dan telemetri terisolasi tanpa PII', () => {
  assert.equal(validateMcpPayload({ jsonrpc: '2.0', method: 'tools/list', params: {} }), true);
  assert.throws(() => validateMcpPayload({
    jsonrpc: '2.0',
    method: 'tools/call',
    params: { arguments: { access_token: 'rahasia' } },
  }), /parameter_ditolak/);
  recordTelemetry('org-a', { ms: 4, ok: true, kind: 'parse' });
  recordTelemetry('org-b', { ms: 30, ok: false, kind: 'parse' });
  assert.equal(publicMetrics('org-a').alerts, 0);
  assert.equal(publicMetrics('org-b').alerts, 1);
  assert.equal(publicMetrics('org-a').failures, 0);
  const row = auditEvent('vault_derive');
  assert.equal(row.pii, false);
  assert.equal(Object.prototype.hasOwnProperty.call(row, 'text'), false);
});
