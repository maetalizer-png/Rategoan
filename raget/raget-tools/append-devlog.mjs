// Hook self-updating devlog: menambah satu entri raget-devlog/sejarah/
// dan mendaftarkannya ke index.js secara otomatis, tanpa mengedit file
// index.js dengan tangan setiap ronde.
//
// Pakai di akhir tiap ronde (laporan akhir), setelah commit terakhir ronde
// diketahui:
//   node tools/append-devlog.mjs path/ke/entri.json
//
// entri.json wajib berisi field: {id, judul, tanggal, komit, ringkasan,
// fitur_baru, bug_ditutup, kpi} - skema yang sama dengan entri devlog lain.
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SEJARAH_DIR = path.join(ROOT, 'raget-devlog', 'sejarah');
const INDEX_FILE = path.join(ROOT, 'raget-devlog', 'index.js');

const REQUIRED_FIELDS = ['id', 'judul', 'tanggal', 'komit', 'ringkasan', 'fitur_baru', 'bug_ditutup', 'kpi'];

function loadEntry(jsonPath) {
  const raw = readFileSync(jsonPath, 'utf8');
  const data = JSON.parse(raw);
  const missing = REQUIRED_FIELDS.filter((f) => !(f in data));
  if (missing.length) throw new Error('Entri devlog kurang field: ' + missing.join(', '));
  return data;
}

function nextFileName(id) {
  const existing = readdirSync(SEJARAH_DIR).filter((f) => f.endsWith('.js'));
  const nums = existing.map((f) => parseInt(f.split('-')[0], 10)).filter((n) => !Number.isNaN(n));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  const slug = String(next).padStart(2, '0');
  return slug + '-' + id + '.js';
}

function toModuleSource(entry) {
  return (
    'export default ' +
    JSON.stringify(entry, null, 2)
      .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:') +
    ';\n'
  );
}

function appendToIndex(fileName, entry) {
  const src = readFileSync(INDEX_FILE, 'utf8');
  const varName = entry.id.replace(/[^a-zA-Z0-9]/g, '_');
  const importLine = "import " + varName + " from './sejarah" + fileName.replace(/\.js$/, '.js') + "';\n";

  const lastImportMatch = [...src.matchAll(/^import .+;\n/gm)].pop();
  if (!lastImportMatch) throw new Error('Tidak menemukan blok import di index.js - format berubah?');
  const insertAt = lastImportMatch.index + lastImportMatch[0].length;
  let next = src.slice(0, insertAt) + importLine + src.slice(insertAt);

  next = next.replace(/(\n\]\);\n\nfunction all\(\))/, '\n  ' + varName + ',$1');

  writeFileSync(INDEX_FILE, next);
}

function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Pakai: node tools/append-devlog.mjs path/ke/entri.json');
    process.exit(1);
  }
  const entry = loadEntry(path.resolve(jsonPath));
  const fileName = nextFileName(entry.id);
  const target = path.join(SEJARAH_DIR, fileName);
  writeFileSync(target, toModuleSource(entry));
  appendToIndex(fileName, entry);
  console.log('Entri devlog baru ditulis:', path.relative(ROOT, target));
  console.log('index.js diperbarui otomatis.');
}

main();
