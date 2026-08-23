// BLOK BATCH: migrasi domain SENI-BUDAYA (26 entri, 5 region: asia/
// eropa/amerika/afrika/osenia, field region/country/name/type/tags -
// dipakai bridge-extras.js#trySeniBudaya() lewat it.metadata.country dan
// .tags) dari raget-dataries/seni-budaya/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di
// raget-data/json/seni-budaya/. Pola sama seperti migrate-marplace-
// domain.mjs - field 'country'/'type' TIDAK didestructure jadi otomatis
// tetap ada di meta, aman untuk trySeniBudaya() (field 'region' DI
// destructure karena sudah terwakili di 'wilayah' level atas, sama
// seperti domain lain).
//
// 0 nama duplikat dicek via grep sebelum menulis skrip ini.
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/seni-budaya/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-seni-budaya-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-dataries/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'seni-budaya');

const DIACRITICS_RE = new RegExp('[\\u0300-\\u036f]', 'g');

function slugify(s) {
  return String(s)
    .normalize('NFD')
    .replace(DIACRITICS_RE, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function toSchema(item, regionId, usedIds) {
  const m = item.metadata || {};
  const { category, region, name, tags, ...restMeta } = m;
  let id = 'seni-budaya-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'seni-budaya-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'seni-budaya',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS['seni-budaya'];
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/seni-budaya/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('seni-budaya', region.id);
    if (!list) {
      console.error('GAGAL memuat region:', region.id);
      process.exit(1);
    }
    const schema = list.map((item) => toSchema(item, region.id, allIds));

    const outFile = path.join(OUT_DIR, region.id + '.json');
    writeFileSync(outFile, JSON.stringify(schema, null, 2) + '\n', 'utf8');
    console.log('Ditulis:', path.relative(ROOT, outFile), '-', schema.length, 'entri.');
    totalEntries += schema.length;
  }

  console.log('\nTotal:', totalEntries, 'entri seni-budaya di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
