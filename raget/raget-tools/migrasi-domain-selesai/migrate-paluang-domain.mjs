// BLOK BATCH: migrasi domain PALUANG (27 entri, 5 region: investasi/
// kompetensi/peluang-daerah/sektor/tren, field name/type/tags dan
// field lain bervariasi per region) dari raget-dataries/paluang/*.js ke
// skema JSON tunggal {id, kategori, wilayah, nama, tags, teks, meta} di
// raget-data/json/paluang/. Tidak ada consumer khusus di raget-agents/
// (dicek via grep sebelum menulis skrip ini) - domain ini murni data
// generik, sama seperti marplace/lingo sebelum ada loader khusus.
//
// 1 nama duplikat ("AI & Otomatisasi") ditemukan lintas file region -
// id pakai skema collision-avoidance (suffix region lalu -2/-3/dst).
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/paluang/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-paluang-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'paluang');

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
  const { category: _category, region: _region, name, tags, ...restMeta } = m;
  let id = 'paluang-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'paluang-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'paluang',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS.paluang;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/paluang/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('paluang', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri paluang di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
