import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { positionDesktopPopover } from '../../../shared/popover.js';
import { progressiveGutter } from '../../../js/studio/diff-parser.js';
import { deriveVaultKey } from '../../../js/connectors/connector-state.js';
import { PolicyEngine } from '../../../js/connectors/policy-engine.js';
import { devlogIndex } from '../../../raget/raget-devlog/index.js';
import { llmEngine } from '../../../raget/raget-template/llm-engine.js';
import { whatsappImporter } from '../../../vault/whatsapp/importer.js';
import { scanDelimiters } from '../../../js/studio/ast-heal.js';

const root = new URL('../../../', import.meta.url);
function read(rel) { return readFileSync(new URL(rel, root), 'utf8'); }
function gone(rel) { return !existsSync(new URL(rel, root)); }

test('DOD-11.01 geometri popover tidak menembus tepi atas', () => {
  globalThis.window = { innerWidth: 1366, innerHeight: 768 };
  const sheet = { style: {}, offsetHeight: 220 };
  const btn = { getBoundingClientRect: () => ({ left: 48, top: 640, bottom: 676, right: 88, width: 40, height: 36 }) };
  positionDesktopPopover(sheet, btn);
  const top = parseFloat(sheet.style.top);
  assert.ok(top >= 20, 'top ' + top);
  assert.equal(Math.round(640 - (top + 220)), 10);
  const high = { style: {}, offsetHeight: 320 };
  const near = { getBoundingClientRect: () => ({ left: 48, top: 70, bottom: 106, right: 88, width: 40, height: 36 }) };
  positionDesktopPopover(high, near);
  assert.ok(parseFloat(high.style.top) >= 20);
});

test('DOD-11.02 chat dan studio memakai helper yang sama', () => {
  const chat = read('js/sheets/attach.js');
  const studio = read('js/studio/studio-app.js');
  assert.match(chat, /positionDesktopPopover\(sheet, \$\('btn-plus'\)\)/);
  assert.match(studio, /positionDesktopPopover\(sheet, \$\('btn-plus'\)\)/);
  assert.match(read('js/sheets/sheets.js'), /Escape/);
  assert.match(studio, /sheetBackdrop\) sheetBackdrop\.onclick = \(\) => closePlus\(\)/);
});

test('DOD-11.03 dan 11.04 sasis 960 dan kartu artefak bertingkat', () => {
  const desktop = read('css/layout/desktop.css');
  const overhaul = read('css/ui/overhaul.css');
  const art = read('js/artifacts/artifacts.js');
  const connect = read('css/ui/connect.css');
  assert.match(desktop, /max-width:\s*960px !important/);
  assert.match(desktop, /padding:\s*40px 48px 64px !important/);
  assert.match(overhaul, /minmax\(280px,\s*1fr\)/);
  assert.match(overhaul, /\.artifact-preview[\s\S]*height:\s*110px/);
  assert.match(art, /artifact-preview/);
  assert.match(art, /Pratinjau/);
  assert.match(art, /Unduh/);
  assert.match(connect, /grid-template-columns:\s*repeat\(2,\s*1fr\)/);
  const rows = progressiveGutter('a\nb');
  assert.equal(rows[1].n, 2);
});

test('DOD-11.06 ikon pindah dan tautan ikut', () => {
  assert.equal(existsSync(new URL('assets/icons/icon-192.png', root)), true);
  assert.equal(existsSync(new URL('assets/icons/icon-512.png', root)), true);
  assert.equal(existsSync(new URL('assets/icons/icon.svg', root)), true);
  assert.equal(gone('icon-192.png') && gone('icon-512.png') && gone('icon.svg'), true);
  for (const file of ['index.html', 'studio.html', 'privacy.html']) {
    const html = read(file);
    assert.match(html, /assets\/icons\/icon\.svg/);
    assert.match(html, /assets\/icons\/icon-192\.png/);
  }
  assert.match(read('manifest.webmanifest'), /assets\/icons\/icon-512\.png/);
  assert.match(read('sw.js'), /\.\/assets\/icons\/icon-512\.png/);
  assert.match(read('.github/workflows/build-twa.yml'), /assets\/icons\/icon-512\.png/);
});

test('DOD-11.07 dokumen usang hilang dan sejarah antarmuka ada', () => {
  const removed = [
    'docs/STUDI-KASUS-ANTARMUKA-5.0.md',
    'docs/STUDI-KASUS-ANTARMUKA-6.0.md',
    'docs/STUDI-KASUS-ANTARMUKA-7.0.md',
    'docs/STUDI-KASUS-ANTARMUKA-8.0.md',
    'docs/STUDI-KASUS-ANTARMUKA-9.0.md',
    'docs/STUDI-KASUS-ANTARMUKA-10.0.md',
    'docs/PRD/PRD-ANTARMUKA-3.0.md',
    'docs/PRD/PRD-ANTARMUKA-8.0.md',
    'docs/PRD/PRD-ANTARMUKA-9.0.md',
    'docs/PRD/PRD-ANTARMUKA-10.0.md',
    'docs/PRD/PRD-PENAMBANGAN-DATA.md',
  ];
  removed.forEach((rel) => assert.equal(gone(rel), true, rel));
  assert.match(read('docs/HISTORY-ANTARMUKA.md'), /11\.0/);
  assert.match(read('docs/PRD/README.md'), /PRD-ANTARMUKA-11\.0\.md/);
});

test('DOD-11.11 dan 11.12 fakta Indonesia dan sapaan tidak berhalusinasi', () => {
  const negara = read('raget/raget-data/json/negara/asian-tenggara.json');
  const kota = read('raget/raget-data/json/kota/asia-tenggara.json');
  const umum = read('raget/raget-data/json/pengetahuan/umum.json');
  assert.equal(/segera pindah ke IKN/.test(negara + kota + umum), false);
  assert.match(negara, /Ibu kota: Jakarta\./);
  assert.match(negara, /282 juta/);
  assert.match(negara, /282000000/);
  assert.match(kota, /416 kabupaten dan 98 kota/);
  const sopan = JSON.parse(read('raget/raget-data/json/sapaan/sosial/sapaan-sopan.json'));
  const maaf = sopan.find((e) => e.id === 'sapaan-sopan-maaf-gangguan-002');
  assert.equal(maaf.meta.jenis, 'maaf');
  assert.equal(maaf.tags.includes('bantu'), false);
  const luas = JSON.parse(read('raget/raget-data/json/sapaan/harian-rumah/sapaan-harian-luas.json'));
  assert.equal(luas.find((e) => e.id === 'sapaan-pagi-v04').meta.periode, 'jumat');
  llmEngine.useSapaan(sopan.concat(luas));
  const help = llmEngine.tryDailyTalk('bisa membantu saya', {});
  assert.match(help, /bantu/i);
  assert.doesNotMatch(help, /maaf sebelumnya/i);
  const pagiHari = new Date(2026, 9, 9, 8, 0, 0);
  const malam = llmEngine.tryGreeting('selamat malam', { now: pagiHari });
  assert.match(malam, /Selamat malam/);
  assert.doesNotMatch(malam, /perangkat/i);
  const pagi = llmEngine.tryGreeting('selamat pagi', { now: pagiHari });
  assert.doesNotMatch(pagi, /Jumat berkah/);
});

test('DOD-11.13 sampai 11.15 korpus, sejarah, dan laporan diringkas', () => {
  assert.equal(gone('raget/raget-data/jsonl/external'), true);
  assert.equal(gone('raget/raget-data/jsonl/languages.jsonl'), true);
  assert.equal(gone('raget/raget-data/jsonl/korpus-pengetahuan-bersih-v1.jsonl'), true);
  assert.equal(gone('raget/raget-data/jsonl/korpus-train-seimbang-bersih-v1.jsonl'), true);
  assert.equal(existsSync(new URL('raget/raget-data/jsonl/kode/pack-v1.jsonl', root)), true);
  const corpus = read('raget/raget-data/jsonl/raget_own_corpus.jsonl');
  assert.equal(/segera pindah ke IKN/.test(corpus), false);
  assert.match(corpus, /282 juta/);
  assert.equal(gone('raget/raget-devlog/sejarah'), true);
  assert.equal(devlogIndex.all().length, 21);
  assert.equal(typeof devlogIndex.latest().judul, 'string');
  const tematik = read('raget/raget-devlog/jsonl/devlog-tematik.jsonl').trim().split('\n');
  assert.ok(tematik.length >= 60);
  assert.match(tematik[0], /"kategori":/);
  assert.equal(gone('raget/raget-devlog/neural/training-report-tiny.json'), true);
  const ringkas = read('raget/raget-devlog/neural/laporan-pelatihan-ringkas.json');
  assert.equal(/round\s*8/i.test(ringkas), false);
  assert.ok(ringkas.length < 10000);
});

test('DOD-11.08 sampai 11.10 sandbox, brankas, dan kebijakan tetap tertutup', async () => {
  assert.match(read('studio.html'), /sandbox="allow-scripts allow-forms"/);
  assert.doesNotMatch(read('studio.html'), /allow-same-origin/);
  const key = await deriveVaultKey(new Map());
  assert.equal(key.extractable, false);
  const engine = new PolicyEngine();
  assert.throws(() => engine.assert('alat_tak_terdaftar', {}), (err) => err.level === 5);
});

test('DOD-11.38 muatan 10MB dan kurung bersarang di bawah 50ms', () => {
  const nested = '('.repeat(4000) + ')'.repeat(4000);
  let started = performance.now();
  const scan = scanDelimiters(nested);
  assert.equal(scan.length, 0);
  assert.ok(performance.now() - started < 50, 'kurung');
  started = performance.now();
  const res = whatsappImporter.importWhatsApp('[01/01/2026 12:00] ' + 'A'.repeat(10 * 1024 * 1024));
  const ms = performance.now() - started;
  assert.equal(res.ok, false);
  assert.ok(ms < 50, '10MB ' + ms);
});
