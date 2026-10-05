// Migrasi domain #5 (Fase B vNext, §3 roadmap): pindahkan NEGARA dari 20
// file array literal di raget-dataries/country/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/negara/.
//
// BEDA dari migrasi tokoh/kuliner/hari sebelumnya: domain ini punya field
// metadata jauh lebih kaya (30+ field: capital, population, ethnicGroups,
// religions, languages, dst) dan region id-nya (mis. 'asian-tenggara')
// dipakai BERSAMA oleh tiga domain raget-dataries (country/cities/languages)
// untuk deteksi entitas (bridgeResolve.detectEntityRegions). Karena itu:
//   - `meta` menyimpan HAMPIR SELURUH object metadata asli apa adanya
//     (near-lossless, bukan dikurasi ulang seperti tokoh) - field
//     category/region/name dibuang dari dalam meta karena sudah terwakili
//     di kategori/wilayah/nama level atas, supaya tidak duplikat.
//   - wilayah diisi region id ASLI (bukan nama negara) supaya taksonomi
//     region tetap konsisten kalau nanti cities/languages ikut dimigrasi.
//   - raget-dataries/index.js#loadRegion TETAP jadi satu-satunya titik
//     yang tahu soal file storage (loader tipis) - untuk group 'country'
//     ia fetch JSON baru lalu bentuk ulang jadi {text, metadata} SAMA
//     PERSIS seperti sebelumnya, supaya dataries-bridge.js dan seluruh
//     pipeline resolusi entitas TIDAK PERLU diubah sama sekali.
//   - REGIONS.country (id + names untuk deteksi keyword) TETAP di JS -
//     itu indeks routing sinkron, bukan konten data.
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/country/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-country-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'negara');

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSchema(item, regionId) {
  const m = item.metadata || {};
  const { category: _category, region: _region, name: _name, ...restMeta } = m;
  return {
    id: 'negara-' + slugify(m.name),
    kategori: 'negara',
    wilayah: regionId,
    nama: m.name,
    tags: m.subregion ? [m.subregion] : [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS.country;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/country/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('country', region.id);
    if (!list) {
      console.error('GAGAL memuat region:', region.id);
      process.exit(1);
    }
    const schema = list.map((item) => toSchema(item, region.id));

    const dupes = schema.filter((e) => (allIds.has(e.id) ? true : (allIds.add(e.id), false)));
    if (dupes.length) {
      console.error('GAGAL: id duplikat setelah slugify:', dupes.map((d) => d.id));
      process.exit(1);
    }

    const outFile = path.join(OUT_DIR, region.id + '.json');
    writeFileSync(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf8');
    console.log('Ditulis:', path.relative(ROOT, outFile), '-', schema.length, 'entri.');
    totalEntries += schema.length;
  }

  console.log('\nTotal:', totalEntries, 'entri negara di', regionList.length, 'file region, 0 id duplikat.');
}

main();
