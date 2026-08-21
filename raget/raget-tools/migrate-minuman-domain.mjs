// Migrasi domain #9 (Fase B vNext, §3 roadmap): pindahkan MINUMAN dari 6
// file array literal di raget-dataries/minuman/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/minuman/.
// Pola sama seperti migrate-etika-domain.mjs. Dipakai kode agen lewat
// bridge-extras.js#tryMinuman() -> dataries.loadAll('minuman').
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/minuman/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-minuman-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-dataries/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'minuman');

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
  let id = 'minuman-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'minuman-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'minuman',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: { ...restMeta, tags: tags || [] },
  };
}

async function main() {
  const regionList = REGIONS.minuman;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/minuman/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  // CATATAN: beberapa nama minuman muncul di LEBIH dari satu file region
  // sumber (mis. "Ayran" ada di asia.js DAN timur-tengah.js, negara sama -
  // duplikasi genuine di data asli, bukan salah migrasi). Karena itu
  // allIds dipakai GLOBAL (lintas region, bukan per-region) supaya
  // tabrakan lintas-file ketahuan saat id dibuat, bukan cuma sesudahnya.
  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('minuman', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri minuman di', regionList.length, 'file region, 0 id duplikat.');
}

main();
