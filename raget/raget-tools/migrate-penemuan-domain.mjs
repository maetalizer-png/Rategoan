// BLOK BATCH: migrasi domain PENEMUAN (16 entri, 3 region: sains/
// teknologi/kedokteran, field name/inventor/year/field/tags - dipakai
// bridge-extras.js#tryPenemuan() lewat it.metadata.name dan .tags) dari
// raget-dataries/penemuan/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di
// raget-data/json/penemuan/. Pola sama seperti migrate-marplace-
// domain.mjs - field 'inventor'/'year'/'field' TIDAK didestructure jadi
// otomatis tetap ada di meta, aman untuk tryPenemuan().
//
// 0 nama duplikat dicek via grep sebelum menulis skrip ini.
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/penemuan/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-penemuan-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-dataries/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'penemuan');

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
  let id = 'penemuan-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'penemuan-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'penemuan',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS.penemuan;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/penemuan/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('penemuan', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri penemuan di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
