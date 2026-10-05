// BLOK 5: migrasi domain LINGO (~158 entri, 5 region: asean-barat/
// asean-selatan/asean-tengah/asean-tenggara/asean-timur, field
// category/region/country/name/code/speakers/family/script/status/tags -
// domain terkaya kedua yang belum dimigrasi setelah marplace) dari
// raget-dataries/lingo/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/lingo/.
// Pola sama seperti migrate-marplace-domain.mjs (bukan pola topic seperti
// sains/olahraga - tidak ada fungsi tryTopicSearch() semacam itu untuk
// lingo; field 'name' dibuang dari meta karena unifiedToLegacyShape() di
// raget-dataries/index.js menyuntikkannya balik otomatis).
//
// Nama bahasa (mis. "Bahasa Arab", "Bahasa Inggris") MEMANG berulang lintas
// file region (bahasa yang sama dipakai/diajarkan di beberapa negara ASEAN
// berbeda) - dicek via grep sebelum menulis skrip ini, sengaja bukan bug.
// ID pakai skema collision-avoidance sama seperti migrate-marplace-
// domain.mjs (suffix region lalu -2/-3/dst).
//
// CATATAN: domain 'lingo' ini BERBEDA dari domain 'bahasa' (languages) yang
// sudah dimigrasi lebih dulu - lingo fokus ASEAN-sentris dengan metadata
// lebih ringkas (code/speakers/family/script/status), pelengkap sudut
// pandang per negara, bukan duplikasi. Lihat docs/DATA-STRUCTURE.md.
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/lingo/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-lingo-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'lingo');

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
  let id = 'lingo-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'lingo-' + slugify(name) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'lingo',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: restMeta,
  };
}

async function main() {
  const regionList = REGIONS.lingo;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/lingo/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('lingo', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri lingo di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
