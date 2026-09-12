// Migrasi domain KULINER ke skema data standar (Ronde vNext Fase B, §3
// roadmap) - domain kedua setelah tokoh (lihat migrate-tokoh-domain.mjs
// untuk pola dasarnya). Beda dari tokoh: kuliner SUDAH terpecah jadi 6 file
// per-region sejak Ronde v7 Bagian 3 (kuliner-data/*.js), jadi migrasi ini
// tinggal mengonversi tiap file region langsung ke raget-data/json/kuliner/
// <region>.json - regionnya sendiri jadi field "wilayah" tiap entri
// (granularitas benua, bukan negara - beda dari domain tokoh yang pakai
// negara kelahiran sebagai wilayah).
//
// SUDAH DIJALANKAN (arsip/dokumentasi, bukan skrip yang dipakai ulang):
// hasilnya raget-data/json/kuliner/*.json, dan raget-agents/kuliner-data/*.js
// (sumber import di bawah) SUDAH DIHAPUS setelah migrasi - menjalankan
// ulang skrip ini akan gagal di baris import paling atas, itu sinyal yang
// diharapkan (sengaja, bukan bug), bukan untuk "diperbaiki".

import { writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { DATA as ASIA } from '../raget-agents/kuliner-data/asia.js';
import { DATA as EROPA } from '../raget-agents/kuliner-data/eropa.js';
import { DATA as AMERIKA } from '../raget-agents/kuliner-data/amerika.js';
import { DATA as AFRIKA } from '../raget-agents/kuliner-data/afrika.js';
import { DATA as OSENIA } from '../raget-agents/kuliner-data/osenia.js';
import { DATA as TIMUR_TENGAH } from '../raget-agents/kuliner-data/timur-tengah.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, '..', 'raget-data', 'json', 'kuliner');

const REGIONS = {
  asia: ASIA,
  eropa: EROPA,
  amerika: AMERIKA,
  afrika: AFRIKA,
  osenia: OSENIA,
  'timur-tengah': TIMUR_TENGAH,
};

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSchema(k, wilayah) {
  return {
    id: 'kuliner-' + slugify(k.nama),
    kategori: 'kuliner',
    wilayah,
    nama: k.nama,
    tags: [k.jenis.toLowerCase()],
    teks: k.nama + ' adalah ' + k.jenis + ' khas ' + k.negara + '.',
    meta: {
      negara: k.negara,
      jenis: k.jenis,
      bahanUtama: k.bahanUtama,
      trivia: k.trivia,
    },
  };
}

function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const allIds = new Set();
  let total = 0;

  for (const [region, entries] of Object.entries(REGIONS)) {
    const schema = entries.map((e) => toSchema(e, region));
    for (const e of schema) {
      if (allIds.has(e.id)) {
        console.error('GAGAL: id duplikat lintas region:', e.id);
        process.exit(1);
      }
      allIds.add(e.id);
    }
    const outFile = path.join(OUT_DIR, region + '.json');
    writeFileSync(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf8');
    console.log(region + '.json:', schema.length, 'entri');
    total += schema.length;
  }

  console.log('Total:', total, 'entri, 0 id duplikat lintas region.');
}

main();
