// Migrasi domain WISATA (domain terkaya berikutnya - 87 entri, 6 region,
// field metadata terbanyak: region/country/name/city/type/unesco/tags) dari
// file array literal di raget-dataries/wisata/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/wisata/.
// Pola sama seperti migrate-minuman-domain.mjs (allIds GLOBAL lintas region
// buat jaga-jaga nama tempat wisata yang sama muncul di region berbeda).
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/wisata/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-wisata-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'wisata');

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
  const { region: _region, name, tags, ...restMeta } = m;
  let id = 'wisata-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'wisata-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'wisata',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: { ...restMeta, tags: tags || [] },
  };
}

async function main() {
  const regionList = REGIONS.wisata;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/wisata/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('wisata', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri wisata di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
