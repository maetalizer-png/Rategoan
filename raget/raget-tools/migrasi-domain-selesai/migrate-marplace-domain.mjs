// BLOK 5: migrasi domain MARPLACE (~378 entri, 5 region: ecommerce/
// freelance/karir/otomotif/properti, field terkaya di antara domain yang
// belum dimigrasi - category/type/name/founded/founder/country/region/
// products/tags/stats{annualRevenue,monthlyVisitors,totalSellers,
// totalProducts,marketShare,employees}) dari raget-dataries/marplace/*.js
// ke skema JSON tunggal {id, kategori, wilayah, nama, tags, teks, meta} di
// raget-data/json/marplace/. Field category/region/name DIBUANG dari meta
// (bukan hilang - unifiedToLegacyShape() di raget-dataries/index.js
// menyuntikkannya balik otomatis dari kategori/wilayah/nama level atas
// saat dibaca lagi), field lain (founded/founder/country/products/stats)
// dipertahankan APA ADANYA di meta - pola sama seperti migrate-country-
// domain.mjs (bukan pola topic seperti sains/olahraga, karena tidak ada
// fungsi tryTopicSearch() semacam itu untuk marplace).
//
// Beberapa nama platform (mis. "Sribulancer", "Zhaopin") muncul di lebih
// dari satu file region (cross-listing platform lintas kategori) - dicek
// via grep sebelum menulis skrip ini. ID pakai skema collision-avoidance
// sama seperti migrate-sains-domain.mjs (suffix region lalu -2/-3/dst),
// bukan hard-fail seperti migrate-country-domain.mjs, karena tabrakan di
// sini memang terjadi dan sah (bukan bug data).
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/marplace/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-marplace-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'marplace');

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
  let id = 'marplace-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'marplace-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'marplace',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS.marplace;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/marplace/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('marplace', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri marplace di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
