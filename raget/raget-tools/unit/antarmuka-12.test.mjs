import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { stageHunks } from '../../../js/studio/diff-parser.js';
import { createReplica, insertAt, applyOps, readDoc } from '../../../js/artifacts/canvas-editor.js';
import { describePick, groundScreenshot } from '../../../js/studio/sandbox-runner.js';
import { hybridSearch, buildHnsw } from '../../raget-database/hybrid-search.js';
import { handshakeMcp } from '../../../js/connectors/mcp-bridge.js';
import { createSyncKey, sealProject, openProject } from '../../../js/sync/p2p-sync.js';
import { verifyClaims } from '../../raget-template/fact-verifier.js';
import { humanevalPassAt1 } from '../benchmark/browser-humaneval.mjs';
import { nextBatch } from '../../raget-neural/runtime/thermal-governor.js';
import { signPlugin, verifyPlugin } from '../../../js/connectors/plugin-verifier.js';
import { createVoicePipeline } from '../../../js/voice/voice-pipeline.js';
import { applyLora } from '../../raget-neural/runtime/lora-adapter.js';
import { scaffoldProject } from '../../../js/studio/template-generator.js';
import { renderMermaid } from '../../../js/artifacts/mermaid-renderer.js';
import { createGrid } from '../../../js/artifacts/table-grid.js';
import { createVersionTravel } from '../../../js/artifacts/version-travel.js';
import { runTerminal } from '../../../js/studio/wasm-terminal.js';
import { indexModule } from '../../../js/studio/ast-indexer.js';
import { AUTOSAVE_MS, writeAutosave, readAutosave } from '../../../js/studio/vfs-transaction.js';
import { createEphemeralWorkspace } from '../../../js/studio/vfs.js';
import { checksumManifest } from '../../../js/studio/drive-backup.js';
import { selectImpactedTests, lintGuidedHeal } from '../../../js/studio/studio-agent.js';
import { rememberShader, recallShader } from '../../raget-neural/runtime/shader-cache.js';
import { layoutForTask } from '../../../js/studio/layout-mode.js';
import { synthesizeTool } from '../../../js/connectors/tool-synthesizer.js';
import { stampToolCall } from '../../../js/studio/sse-door.js';
import { liveCalculator, filterTable } from '../../../js/artifacts/widgets.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }

test('DOD-12.04 hunk yang ditolak tidak masuk ke teks', () => {
  const source = 'a\nb\nc';
  const patch = '@@ -1,1 +1,1 @@\n-a\n+A\n@@ -3,1 +3,1 @@\n-c\n+C';
  const staged = stageHunks(source, patch, ['reject', 'accept']);
  assert.equal(staged.accepted, 1);
  assert.equal(staged.rejected, 1);
  assert.match(staged.text, /^a/);
  assert.match(staged.text, /C$/);
  assert.doesNotMatch(staged.text, /^A/);
});

test('DOD-12.05 dua penyunting tidak saling menghapus lewat CRDT', () => {
  const left = createReplica('a');
  const right = createReplica('b');
  const fromLeft = insertAt(left, 0, 'A');
  const fromRight = insertAt(right, 0, 'B');
  applyOps(left, fromRight);
  applyOps(right, fromLeft);
  assert.match(readDoc(left), /A/);
  assert.match(readDoc(left), /B/);
  assert.equal(readDoc(left).length, 2);
  assert.equal(readDoc(right).length, 2);
});

test('DOD-12.06 klik pratinjau dan tangkapan layar mengisi selektor', () => {
  const pick = describePick({ tag: 'BUTTON', id: 'tambah', className: 'primer', path: '/index.html' });
  assert.equal(pick.selector, 'button#tambah.primer');
  assert.equal(pick.path, '/index.html');
  const hit = groundScreenshot({ x: 10, y: 10, w: 40, h: 20 }, [
    { x: 0, y: 0, w: 10, h: 10, selector: 'h1' },
    { x: 12, y: 12, w: 30, h: 16, selector: 'button.primer' },
  ]);
  assert.equal(hit.selector, 'button.primer');
  assert.equal(groundScreenshot({ x: 0, y: 0, w: 1, h: 1 }, []), null);
  assert.match(read('js/chat/composer.js'), /export function groundBugShot/);
});

test('DOD-12.09 pencarian hibrida BM25 dan HNSW di bawah 15ms', () => {
  const docs = [];
  for (let i = 0; i < 180; i += 1) {
    docs.push({
      id: 'd' + i,
      text: i === 7 ? 'jakarta ibu kota indonesia' : 'catatan biasa ' + i,
      vector: [i === 7 ? 1 : 0, 0.1, 0, 0],
    });
  }
  const index = buildHnsw(docs);
  const t0 = performance.now();
  const hits = hybridSearch(index, 'jakarta', [1, 0, 0, 0]);
  const ms = performance.now() - t0;
  assert.equal(hits[0].id, 'd7');
  assert.ok(ms < 15);
  assert.equal(index.links.length, 180);
});

test('DOD-12.10 jabat tangan MCP lokal menolak token dan host asing', () => {
  assert.equal(handshakeMcp('rahasia', 'rahasia', 'ws://127.0.0.1:9/mcp').ok, true);
  assert.equal(handshakeMcp('rahasia', 'salah', 'ws://127.0.0.1:9/mcp').reason, 'token');
  assert.equal(handshakeMcp('rahasia', 'rahasia', 'wss://example.test/mcp').reason, 'host');
});

test('DOD-12.11 paket proyek antar-perangkat tersegel AES-GCM', async () => {
  const key = await createSyncKey();
  const other = await createSyncKey();
  const pack = await sealProject(key, { nama: 'Studio' });
  assert.deepEqual(await openProject(key, pack), { nama: 'Studio' });
  await assert.rejects(openProject(other, pack));
  assert.equal(key.extractable, false);
});

test('sasis 12 menyatukan header ponsel dan meruntuhkan track hantu', () => {
  const css = read('css/layout/desktop.css');
  const router = read('js/core/router.js');
  assert.match(css, /body\.no-topbar/);
  assert.match(css, /grid-template-rows:\s*1fr/);
  assert.match(css, /backdrop-filter:\s*blur\(14px\)\s*!important/);
  assert.match(css, /font-size:\s*17px\s*!important/);
  assert.match(css, /padding:\s*0 16px 32px\s*!important/);
  assert.match(css, /padding:\s*40px 48px 64px\s*!important/);
  assert.match(router, /no-topbar/);
  const studio = read('studio.html');
  assert.doesNotMatch(studio, /Edit Manual|Terapkan Kode/);
  assert.match(studio, /data-tab="dokumen"/);
  assert.match(studio, /data-tab="sheet"/);
  const manifest = read('manifest.webmanifest');
  assert.match(manifest, /isolated_storage/);
  assert.equal(layoutForTask('buka kanvas luas'), 'expanded');
  assert.equal(layoutForTask('mode fokus baca'), 'focus');
});

test('klaim angka, evaluasi, termal, suara, dan plugin', async () => {
  const facts = verifyClaims('Populasi Indonesia 277 juta dan ibu kota pindah.', [
    { id: 'populasi', pattern: 'populasi indonesia', forbid: '277 juta' },
  ]);
  assert.equal(facts.ok, false);
  assert.equal(humanevalPassAt1().score, 1);
  assert.equal(nextBatch({ battery: 0.1, batch: 8 }), 4);
  assert.equal(nextBatch({ battery: 0.9, batch: 8, celsius: 20 }), 8);
  const voice = createVoicePipeline();
  voice.start();
  assert.equal(voice.step().barged, false);
  voice.barge();
  assert.equal(voice.step().barged, true);
  assert.ok(voice.step().ms < voice.budgetMs);
  const signed = await signPlugin('template-a');
  assert.equal(await verifyPlugin(signed), true);
  assert.equal(await verifyPlugin({ ...signed, payload: 'template-b' }), false);
});

test('lora, templat, diagram, grid, terminal, dan dampak tes', async () => {
  const vector = [1, 2];
  const a = [[0, 0, 0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0, 0, 0]];
  const b = [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]];
  assert.deepEqual(applyLora(vector, a, b, 1), vector);
  const form = scaffoldProject('form');
  assert.match(form['index.html'], /<form id="form"/);
  assert.match(renderMermaid('flowchart TD\nA --> B'), /<svg/);
  const grid = createGrid([{ n: 1 }, { n: 2 }]);
  grid.set(1, 'n', 5);
  assert.deepEqual(grid.series('n'), [1, 5]);
  const travel = createVersionTravel(['v1', 'v2', 'v3']);
  assert.equal(travel.goto(0), 'v1');
  assert.equal(runTerminal('1+2*3'), 7);
  assert.throws(() => runTerminal('alert(1)'), /sintaks/);
  const symbols = indexModule('/js/app.js', 'function tambah(){}\nclass Kartu {}\nconst judul = 1;');
  assert.deepEqual(symbols.functions, ['tambah']);
  assert.deepEqual(symbols.classes, ['Kartu']);
  assert.equal(AUTOSAVE_MS, 30000);
  writeAutosave('uji', ['a']);
  assert.deepEqual(readAutosave('uji').snapshot, ['a']);
  const room = createEphemeralWorkspace({ '/a.js': 'ada' });
  assert.equal(room.read('/a.js'), 'ada');
  room.close();
  assert.equal(room.read('/a.js'), '');
  const manifest = checksumManifest({ 'a.txt': 'halo' });
  assert.equal(manifest.files[0].sha256.length, 64);
  const impacted = selectImpactedTests(['app.js'], { 'app.js': ['app.test.mjs'], 'app.test.mjs': [] });
  assert.deepEqual(impacted, ['app.test.mjs']);
  const healed = await lintGuidedHeal('rusak', async (code, cycle) => {
    if (cycle < 1) return { ok: false, next: code + 'x', line: 1, col: 2 };
    return { ok: true, verify: 'lulus' };
  });
  assert.equal(healed.ok, true);
  const hash = rememberShader('fn main(){}');
  assert.equal(recallShader(hash), 'fn main(){}');
  const tool = synthesizeTool({ op: 'sum', field: 'n' });
  assert.equal(tool.run([{ n: 2 }, { n: 3 }]), 5);
  const stamped = stampToolCall('catalog', { q: 'a' });
  assert.equal(stamped.nonce.length, 32);
  assert.equal(liveCalculator('2*4'), 8);
  assert.equal(filterTable([{ nama: 'Jakarta' }, { nama: 'Bandung' }], 'jak').length, 1);
  assert.match(read('js/account/settings.js'), /export function armIncognito/);
});
