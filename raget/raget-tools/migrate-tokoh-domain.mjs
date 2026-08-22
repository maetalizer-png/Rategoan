// Migrasi domain PERCONTOHAN untuk skema data standar (Ronde vNext Fase B,
// §3 roadmap): memindahkan TOKOH dari array literal di dalam tokoh-store.js
// (JS bercampur data) ke raget-data/json/tokoh/tokoh.json (JSON murni, skema
// {id, kategori, wilayah, nama, tags, teks, meta}).
//
// SUDAH DIJALANKAN (arsip/dokumentasi, bukan skrip yang dipakai ulang):
// hasilnya raget-data/json/tokoh/tokoh.json, dan tokoh-store.js sudah ditulis
// ulang jadi loader tipis sehingga import `tokohStore.TOKOH` di bawah ini
// TIDAK LAGI ada (array literalnya sudah dihapus dari tokoh-store.js).
// Disimpan sebagai TEMPLATE untuk migrasi domain berikutnya (kuliner, hari
// internasional, dst): baca array lama dari *-store.js, petakan ke skema
// tunggal §3, tulis JSON, baru rewrite *-store.js jadi loader.

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { tokohStore } from '../raget-agents/tokoh-store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'raget-data', 'json', 'tokoh');
const OUT_FILE = path.join(OUT_DIR, 'tokoh.json');

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fmtTahun(t) {
  if (t == null) return 'sekarang (masih hidup)';
  return t < 0 ? Math.abs(t) + ' SM' : String(t);
}

function ringkasanTeks(t) {
  const wafatStr = t.wafat == null ? 'Masih hidup hingga sekarang.' : 'Wafat tahun ' + fmtTahun(t.wafat) + '.';
  return t.nama + ' (' + t.bidang + ') — lahir tahun ' + fmtTahun(t.lahir.tahun) + ' di ' + t.lahir.negara + '. ' + wafatStr;
}

function tagsFor(t) {
  const raw = t.bidang.split('/').map((s) => s.trim().toLowerCase());
  return [...new Set(raw)];
}

function toSchema(t) {
  return {
    id: 'tokoh-' + slugify(t.nama),
    kategori: 'tokoh',
    wilayah: t.lahir.negara,
    nama: t.nama,
    tags: tagsFor(t),
    teks: ringkasanTeks(t),
    meta: {
      namaEn: t.namaEn,
      lahir: t.lahir,
      wafat: t.wafat,
      bidang: t.bidang,
      pencapaian: t.pencapaian,
      kutipan: t.kutipan,
      trivia: t.trivia,
      relasi: t.relasi,
    },
  };
}

function main() {
  const source = tokohStore.TOKOH;
  if (!source) {
    console.error(
      'tokohStore.TOKOH tidak ada - migrasi ini sudah dijalankan sebelumnya dan ' +
        'array literalnya sudah dihapus dari tokoh-store.js. Skrip ini arsip/template, bukan untuk dijalankan ulang.'
    );
    process.exit(1);
  }
  console.log('Sumber: tokohStore.TOKOH,', source.length, 'entri.');

  const schema = source.map(toSchema);

  const ids = new Set();
  const dupes = schema.filter((e) => (ids.has(e.id) ? true : (ids.add(e.id), false)));
  if (dupes.length) {
    console.error('GAGAL: id duplikat setelah slugify:', dupes.map((d) => d.id));
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, JSON.stringify(schema, null, 2) + '\n', 'utf8');
  console.log('Ditulis:', path.relative(path.resolve(__dirname, '..', '..'), OUT_FILE), '-', schema.length, 'entri, 0 id duplikat.');
}

main();
