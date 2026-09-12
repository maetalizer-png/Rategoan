// Migrasi domain HARI INTERNASIONAL ke skema data standar (Ronde vNext
// Fase B, §3 roadmap) - domain ketiga setelah tokoh dan kuliner. Beda dari
// keduanya: hari internasional TIDAK punya wilayah geografis (observansi
// global, bukan per-negara/benua) - field "wilayah" sengaja null, persis
// contoh yang sudah disebut di roadmap §3 ("null bila tidak relevan").
//
// SUDAH DIJALANKAN (arsip/dokumentasi, bukan skrip yang dipakai ulang):
// hasilnya raget-data/json/hari-internasional/hari-internasional.json, dan
// INTERNATIONAL_DAYS di world-context.js SUDAH DIHAPUS setelah migrasi.
//
// Pakai: node raget/raget-tools/migrate-hari-domain.mjs

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { worldContext } from '../raget-agents/world-context.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'raget-data', 'json', 'hari-internasional');
const OUT_FILE = path.join(OUT_DIR, 'hari-internasional.json');

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSchema(d) {
  return {
    id: 'hari-' + d.date + '-' + slugify(d.name),
    kategori: 'hari-internasional',
    wilayah: null,
    nama: d.name,
    tags: [],
    teks: d.name + ' diperingati setiap tanggal ' + d.date + ' (format DD-MM).',
    meta: { date: d.date },
  };
}

function main() {
  const source = worldContext.INTERNATIONAL_DAYS;
  if (!source) {
    console.error(
      'worldContext.INTERNATIONAL_DAYS tidak ada - migrasi ini sudah dijalankan sebelumnya dan ' +
        'array literalnya sudah dihapus dari world-context.js. Skrip ini arsip/template, bukan untuk dijalankan ulang.'
    );
    process.exit(1);
  }
  console.log('Sumber: worldContext.INTERNATIONAL_DAYS,', source.length, 'entri.');

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
