// vNext Fase C: pipeline PENERIMAAN korpus eksternal (Wikipedia ID
// terkurasi + buku domain publik) sesuai rencana perluasan korpus &
// anggaran token di roadmap §4 (target awal <20 juta token, badge
// "eksperimental" sampai lolos gerbang kualitas §7).
//
// KENAPA SKRIP INI TIDAK MENGAMBIL KONTEN SENDIRI:
// sesi kerja ini berjalan di lingkungan remote dengan kebijakan jaringan
// yang MEMBLOKIR akses ke id.wikipedia.org dan www.gutenberg.org (dicoba
// langsung lewat WebFetch, keduanya balas EGRESS_BLOCKED - bukan asumsi).
// Karena itu skrip ini dirancang sebagai TITIK PENERIMAAN: siapa pun
// (pengguna, atau sesi kerja lain dengan akses jaringan lebih luas) bisa
// menaruh teks sumber di raget-data/jsonl/sumber-eksternal/, dan skrip ini
// yang memvalidasi + merender jadi JSONL dengan atribusi wajib - supaya
// tidak ada teks eksternal yang masuk korpus tanpa sumber & lisensi yang
// jelas (prinsip kejujuran data, sama seperti keputusan filter di
// dataries-ke-korpus.mjs).
//
// CARA PAKAI:
// 1. Untuk tiap sumber, buat DUA file berpasangan di sumber-eksternal/:
//      <nama>.txt        - teks mentah (satu paragraf per baris kosong)
//      <nama>.meta.json   - {"source","url","license","attribution","topik"}
//    Semua empat field wajib diisi (bukan string kosong) - skrip menolak
//    file yang metanya tidak lengkap, supaya tidak ada konten tanpa
//    lisensi/atribusi yang jelas ikut ke korpus.
// 2. Jalankan: node raget/raget-tools/tambah-korpus-eksternal.mjs
// 3. Hasil ditulis ke raget-data/jsonl/raget_external_corpus.jsonl - file
//    TERPISAH dari raget_own_corpus.jsonl (konten Rategoan sendiri),
//    supaya batas lisensi CC-BY-SA/domain-publik tetap jelas kelihatan,
//    tidak tercampur diam-diam dengan data yang ditulis Rategoan sendiri.
//
// Skrip ini TIDAK melatih apa pun - cuma memvalidasi & merender teks jadi
// JSONL siap pakai untuk langkah training (masih terpisah, belum
// dijalankan).

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CORPUS_DIR = path.join(ROOT, 'raget', 'raget-data', 'jsonl');
const SRC_DIR = path.join(CORPUS_DIR, 'sumber-eksternal');
const OUT_FILE = path.join(CORPUS_DIR, 'raget_external_corpus.jsonl');

const REQUIRED_META_FIELDS = ['source', 'url', 'license', 'attribution', 'topik'];

function loadManifest(txtFile) {
  const metaFile = txtFile.replace(/\.txt$/, '.meta.json');
  if (!existsSync(metaFile)) {
    throw new Error('Tidak ada manifest untuk ' + path.basename(txtFile) + ' - butuh ' + path.basename(metaFile));
  }
  const meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  for (const field of REQUIRED_META_FIELDS) {
    if (!meta[field] || !String(meta[field]).trim()) {
      throw new Error('Manifest ' + path.basename(metaFile) + ' kosong di field wajib: ' + field);
    }
  }
  return meta;
}

function splitParagraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 20); // buang fragmen terlalu pendek untuk jadi kalimat korpus yang berguna
}

function main() {
  mkdirSync(SRC_DIR, { recursive: true });
  const txtFiles = existsSync(SRC_DIR) ? readdirSync(SRC_DIR).filter((f) => f.endsWith('.txt')) : [];

  if (txtFiles.length === 0) {
    console.log('=== raget_external_corpus.jsonl ===');
    console.log('Tidak ada sumber di', path.relative(ROOT, SRC_DIR) + '/ - belum ada yang diproses.');
    console.log('Lihat komentar header skrip ini untuk cara menambah sumber (Wikipedia ID terkurasi,');
    console.log('buku domain publik) - sesi kerja ini sendiri tidak bisa mengambilnya karena kebijakan');
    console.log('jaringan lingkungan remote memblokir id.wikipedia.org dan www.gutenberg.org.');
    return;
  }

  const records = [];
  const bySource = {};
  for (const f of txtFiles) {
    const txtPath = path.join(SRC_DIR, f);
    const meta = loadManifest(txtPath);
    const paragraphs = splitParagraphs(readFileSync(txtPath, 'utf8'));
    for (const text of paragraphs) {
      records.push({
        type: 'external',
        source: meta.source,
        url: meta.url,
        license: meta.license,
        attribution: meta.attribution,
        topik: meta.topik,
        text,
      });
    }
    bySource[meta.source] = (bySource[meta.source] || 0) + paragraphs.length;
  }

  const chars = records.reduce((s, r) => s + r.text.length, 0);
  const lines = records.map((r) => JSON.stringify(r)).join('\n') + '\n';
  writeFileSync(OUT_FILE, lines, 'utf8');

  console.log('=== raget_external_corpus.jsonl ===');
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE));
  console.log('Total baris:', records.length);
  console.log('Per sumber:', JSON.stringify(bySource, null, 2));
  console.log('Total karakter:', chars);
  console.log('Estimasi token (kasar, ~4 char/token):', Math.round(chars / 4));
}

main();
