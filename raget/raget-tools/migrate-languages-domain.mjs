// Migrasi domain #7 (Fase B vNext, §3 roadmap): pindahkan BAHASA dari 20
// file array literal di raget-dataries/languages/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/bahasa/.
// Pola sama seperti migrate-country-domain.mjs.
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/languages/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-languages-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-agents/dataries-registry.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'bahasa');

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
  let id = 'bahasa-' + slugify(name);
  if (usedIds.has(id)) id = id + '-' + regionId;
  usedIds.add(id);
  return {
    id,
    kategori: 'bahasa',
    wilayah: regionId,
    nama: name,
    tags: tags || [],
    teks: item.text,
    meta: { ...restMeta, tags: tags || [] },
  };
}

async function main() {
  const regionList = REGIONS.languages;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/languages/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('languages', region.id);
    if (!list) {
      console.error('GAGAL memuat region:', region.id);
      process.exit(1);
    }
    const usedIds = new Set();
    const schema = list.map((item) => toSchema(item, region.id, usedIds));

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

  console.log('\nTotal:', totalEntries, 'entri bahasa di', regionList.length, 'file region, 0 id duplikat.');
}

main();
