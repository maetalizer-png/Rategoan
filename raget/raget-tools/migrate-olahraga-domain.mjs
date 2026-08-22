// Migrasi domain OLAHRAGA (28 entri, 3 region: sepakbola/olimpiade/lain,
// field: topic/category/tags - lebih sedikit dari makanan/alam, tapi
// tetap dimigrasikan demi KONSISTENSI SKEMA, bukan karena ini domain
// terkaya berikutnya) dari file array literal di
// raget-dataries/olahraga/*.js ke skema JSON tunggal
// {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/olahraga/.
// Field 'nama' diisi dari meta.topic (olahraga tidak punya field 'name').
// Pola sama seperti migrate-sains-domain.mjs (allIds GLOBAL lintas region).
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/olahraga/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-olahraga-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-dataries/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'olahraga');

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
  const { topic, tags, ...restMeta } = m;
  let id = 'olahraga-' + slugify(topic);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'olahraga-' + slugify(topic) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'olahraga',
    wilayah: regionId,
    nama: topic,
    tags: tags || [],
    teks: item.text,
    // CATATAN: 'topic' SENGAJA dipertahankan juga di meta - lihat catatan
    // sama di migrate-sains-domain.mjs (tryTopicSearch baca metadata.topic).
    meta: { ...restMeta, topic, tags: tags || [] },
  };
}

async function main() {
  const regionList = REGIONS.olahraga;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/olahraga/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('olahraga', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri olahraga di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
