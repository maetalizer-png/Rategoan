// vNext Fase B: retrieval benchmark domain wisata (hit@1/hit@3/MRR/
// fallback-rate), pola sama seperti bench-retrieval.mjs (domain country).
// Diuji terhadap mekanisme NYATA raget-retrieval/retrieve.js (TF-IDF cosine
// similarity), korpus dibangun sama seperti dataries-bridge.js#datariesFallback()
// (grup wisata, threshold 0.3).
//
// Gold query dibangkitkan dari field metadata di raget-data/json/wisata/*.json:
// - template 'nama': "apa itu {name}" - semua 87 nama entri UNIK, tidak ambigu.
// - template 'kota': "tempat wisata terkenal di kota {city}" - HANYA untuk
//   entri yang field city-nya unik (81/87 - 6 entri kota bentrok seperti
//   Dubai/Istanbul/Yerusalem/Doha/Beijing SENGAJA dilewati karena TF-IDF
//   tidak bisa dipaksa memilih satu jawaban "benar" di antara 2 tempat
//   wisata di kota yang sama - itu bukan kegagalan retrieval, itu memang
//   query yang ambigu by design).
// Field 'country' dan 'type' TIDAK dipakai sebagai anchor query karena
// mayoritas tidak unik per entri (22/54 negara punya >1 tempat wisata).
//
// Pakai: node raget/raget-tools/bench-retrieval-wisata.mjs

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieval } from '../raget-retrieval/retrieve.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const WISATA_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'wisata');
const REPORT_FILE = path.join(__dirname, 'retrieval-bench-wisata-report.json');

function loadAllWisata() {
  const items = [];
  for (const f of readdirSync(WISATA_DIR).filter((f) => f.endsWith('.json'))) {
    const entries = JSON.parse(readFileSync(path.join(WISATA_DIR, f), 'utf8'));
    for (const entry of entries) {
      items.push({ text: entry.teks, metadata: { ...entry.meta, category: 'wisata', region: entry.wilayah, name: entry.nama } });
    }
  }
  return items;
}

const THRESHOLD = 0.3;
const TOP_K = 10;

function buildGoldQueries(items) {
  const cityCounts = {};
  items.forEach((it) => {
    const c = it.metadata.city;
    if (c) cityCounts[c] = (cityCounts[c] || 0) + 1;
  });

  const queries = [];
  for (const it of items) {
    const m = it.metadata || {};
    if (!m.name) continue;
    queries.push({ q: 'Apa itu ' + m.name + '?', expect: m.name, template: 'nama' });
    if (m.city && cityCounts[m.city] === 1) {
      queries.push({ q: 'Tempat wisata terkenal di kota ' + m.city + '.', expect: m.name, template: 'kota' });
    }
  }
  return queries;
}

function evaluate(queries, corpus) {
  let hit1 = 0;
  let hit3 = 0;
  let mrrSum = 0;
  let fallback = 0;
  const misses = [];

  for (const gq of queries) {
    const ranked = retrieval.rank(gq.q, corpus, { threshold: THRESHOLD, limit: TOP_K });
    if (!ranked.length) {
      fallback++;
      misses.push({ q: gq.q, expect: gq.expect, reason: 'fallback (tidak ada di atas threshold)' });
      continue;
    }
    const rankIdx = ranked.findIndex((r) => r.item.item.metadata && r.item.item.metadata.name === gq.expect);
    if (rankIdx === 0) hit1++;
    if (rankIdx >= 0 && rankIdx < 3) hit3++;
    if (rankIdx >= 0) mrrSum += 1 / (rankIdx + 1);
    else misses.push({ q: gq.q, expect: gq.expect, reason: 'top hasil: ' + (ranked[0].item.item.metadata ? ranked[0].item.item.metadata.name : '?') });
  }

  const n = queries.length;
  return {
    n,
    'hit@1': hit1,
    'hit@1_rate': n ? +(hit1 / n).toFixed(4) : 0,
    'hit@3': hit3,
    'hit@3_rate': n ? +(hit3 / n).toFixed(4) : 0,
    mrr: n ? +(mrrSum / n).toFixed(4) : 0,
    fallback,
    fallback_rate: n ? +(fallback / n).toFixed(4) : 0,
    misses,
  };
}

async function main() {
  console.log('Memuat domain wisata dari raget-data/json/wisata...');
  const items = loadAllWisata();
  console.log('Entri wisata:', items.length);

  const corpus = items.map((item) => ({ item, text: item.text || '' }));
  const queries = buildGoldQueries(items);
  console.log('Gold query dibangkitkan:', queries.length, '(template: nama, kota)');

  const byTemplate = {};
  for (const t of ['nama', 'kota']) {
    byTemplate[t] = evaluate(queries.filter((q) => q.template === t), corpus);
  }
  const overall = evaluate(queries, corpus);

  console.log('\n=== HASIL RETRIEVAL BENCH (domain: wisata, mekanisme: TF-IDF cosine, threshold 0.3) ===');
  console.log('Overall:', JSON.stringify({ n: overall.n, 'hit@1_rate': overall['hit@1_rate'], 'hit@3_rate': overall['hit@3_rate'], mrr: overall.mrr, fallback_rate: overall.fallback_rate }, null, 2));
  console.log('\nPer template pertanyaan:');
  for (const [t, r] of Object.entries(byTemplate)) {
    console.log('  ' + t + ':', JSON.stringify({ n: r.n, 'hit@1_rate': r['hit@1_rate'], 'hit@3_rate': r['hit@3_rate'], mrr: r.mrr, fallback_rate: r.fallback_rate }));
  }

  if (overall.misses.length) {
    console.log('\nContoh query yang gagal (maks 10):');
    overall.misses.slice(0, 10).forEach((m) => console.log('  "' + m.q + '" (harusnya: ' + m.expect + ') - ' + m.reason));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    domain: 'wisata',
    mechanism: 'raget-retrieval/retrieve.js (TF-IDF cosine similarity)',
    threshold: THRESHOLD,
    overall: { n: overall.n, 'hit@1_rate': overall['hit@1_rate'], 'hit@3_rate': overall['hit@3_rate'], mrr: overall.mrr, fallback_rate: overall.fallback_rate },
    byTemplate: Object.fromEntries(Object.entries(byTemplate).map(([t, r]) => [t, { n: r.n, 'hit@1_rate': r['hit@1_rate'], 'hit@3_rate': r['hit@3_rate'], mrr: r.mrr, fallback_rate: r.fallback_rate }])),
    misses: overall.misses,
  };
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('\nLaporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
