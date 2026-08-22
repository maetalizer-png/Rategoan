// Migrasi domain SAINS (45 entri, 3 region: fisika-kimia/biologi/umum,
// field: topic/field/tags - lebih sedikit dari makanan/alam, tapi tetap
// dimigrasikan demi KONSISTENSI SKEMA, bukan karena ini domain terkaya
// berikutnya) dari file array literal di raget-dataries/sains/*.js ke
// skema JSON tunggal {id, kategori, wilayah, nama, tags, teks, meta} di
// raget-data/json/sains/. Field 'nama' diisi dari meta.topic (sains tidak
// punya field 'name' seperti domain lain). Pola sama seperti migrasi
// makanan/alam (allIds GLOBAL lintas region).
//
// SUDAH DIJALANKAN - arsip/template, bukan untuk dijalankan ulang setelah
// raget-dataries/sains/*.js dihapus.
//
// Pakai: node raget/raget-tools/migrate-sains-domain.mjs

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { REGIONS, dataries } from '../raget-dataries/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'sains');

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
  let id = 'sains-' + slugify(topic);
  if (usedIds.has(id)) id = id + '-' + regionId;
  let n = 2;
  while (usedIds.has(id)) id = 'sains-' + slugify(topic) + '-' + regionId + '-' + n++;
  usedIds.add(id);
  return {
    id,
    kategori: 'sains',
    wilayah: regionId,
    nama: topic,
    tags: tags || [],
    teks: item.text,
    // CATATAN: 'topic' SENGAJA dipertahankan juga di meta (bukan cuma di
    // 'nama' level-atas) - raget-agents/bridge-extras.js#tryTopicSearch()
    // baca it.metadata.topic secara eksplisit, bukan .name. Kalau topic
    // dihapus dari meta di sini, query "apa itu X" untuk sains/olahraga
    // akan diam-diam berhenti berfungsi pasca-migrasi.
    meta: { ...restMeta, topic, tags: tags || [] },
  };
}

async function main() {
  const regionList = REGIONS.sains;
  if (!existsSync(path.join(ROOT, 'raget', 'raget-dataries', regionList[0].file.replace('./', '')))) {
    console.error('File sumber raget-dataries/sains/*.js tidak ada - migrasi ini sudah dijalankan sebelumnya. Arsip/template, bukan untuk dijalankan ulang.');
    process.exit(1);
  }

  mkdirSync(OUT_DIR, { recursive: true });

  let totalEntries = 0;
  const allIds = new Set();
  for (const region of regionList) {
    const list = await dataries.loadRegion('sains', region.id);
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

  console.log('\nTotal:', totalEntries, 'entri sains di', regionList.length, 'file region,', allIds.size === totalEntries ? '0 id duplikat.' : (totalEntries - allIds.size) + ' id duplikat!');
}

main();
