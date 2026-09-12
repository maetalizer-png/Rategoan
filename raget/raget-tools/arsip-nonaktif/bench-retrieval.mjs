// vNext Fase B: gerbang retrieval berlabel (hit@1/hit@3/MRR/fallback-rate)
// yang disebut roadmap sebagai item terbuka "100+ gold query berlabel per
// domain". Diuji terhadap MEKANISME NYATA yang dipakai produksi -
// raget-retrieval/retrieve.js (TF-IDF cosine similarity), dengan korpus
// dibangun PERSIS sama seperti raget-agents/dataries-bridge.js#datariesFallback()
// (grup country, threshold 0.3) - bukan strawman benchmark terpisah.
//
// Gold query DIBANGKITKAN dari field metadata yang sudah ada di
// raget-data/json/negara/*.json (ibu kota, populasi, dst - hasil migrasi Fase B,
// lihat migrate-country-domain.mjs) - bukan dikarang; ground truth-nya
// adalah metadata.name negara yang jawabannya berasal dari situ. Domain
// country dipilih karena field metadata-nya paling lengkap & konsisten di
// seluruh 163 entri (semua punya capital, population, currency).
//
// CATATAN: skrip Node ini baca JSON langsung lewat fs (bukan lewat
// dataries.loadRegion() yang browser-only karena pakai fetch()) - pola yang
// sama seperti dataries-ke-korpus.mjs/build-neural-checkpoint.mjs, supaya
// tooling Node tidak bergantung pada loader yang didesain untuk lingkungan
// browser.
//
// Pakai: node raget/raget-tools/bench-retrieval.mjs

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieval } from '../raget-retrieval/retrieve.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const NEGARA_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'negara');
const REPORT_FILE = path.join(__dirname, 'retrieval-bench-report.json');

function loadAllCountries() {
  const items = [];
  for (const f of readdirSync(NEGARA_DIR).filter((f) => f.endsWith('.json'))) {
    const entries = JSON.parse(readFileSync(path.join(NEGARA_DIR, f), 'utf8'));
    for (const entry of entries) {
      items.push({ text: entry.teks, metadata: { ...entry.meta, category: 'country', region: entry.wilayah, name: entry.nama } });
    }
  }
  return items;
}

const THRESHOLD = 0.3; // sama dengan DATARIES_FALLBACK_THRESHOLD di dataries-bridge.js
const TOP_K = 10;

function buildGoldQueries(countries) {
  const queries = [];
  for (const c of countries) {
    const m = c.metadata || {};
    if (!m.name) continue;
    if (m.capital) queries.push({ q: 'Apa ibu kota ' + m.name + '?', expect: m.name, template: 'ibu-kota' });
    if (m.population) queries.push({ q: 'Berapa populasi ' + m.name + '?', expect: m.name, template: 'populasi' });
    if (m.currency) queries.push({ q: 'Mata uang apa yang dipakai ' + m.name + '?', expect: m.name, template: 'mata-uang' });
    if (m.officialName) queries.push({ q: 'Apa nama resmi negara ' + m.name + '?', expect: m.name, template: 'nama-resmi' });
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
    // retrieval.rank() membungkus tiap elemen corpus jadi {item, score} -
    // dan elemen corpus KITA sendiri sudah {item: countryItem, text} (lihat
    // buildCorpus di main()), jadi negaranya ada di r.item.item.metadata -
    // persis pola unwrap ganda "found.item.item" di dataries-bridge.js#search().
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
  console.log('Memuat domain country dari raget-data/json/negara...');
  const countries = loadAllCountries();
  console.log('Entri country:', countries.length);

  const corpus = countries.map((item) => ({ item, text: item.text || '' }));
  const queries = buildGoldQueries(countries);
  console.log('Gold query dibangkitkan:', queries.length, '(dari field capital/population/currency/officialName)');

  const byTemplate = {};
  for (const t of ['ibu-kota', 'populasi', 'mata-uang', 'nama-resmi']) {
    byTemplate[t] = evaluate(queries.filter((q) => q.template === t), corpus);
  }
  const overall = evaluate(queries, corpus);

  console.log('\n=== HASIL RETRIEVAL BENCH (domain: country, mekanisme: TF-IDF cosine, threshold 0.3) ===');
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
    domain: 'country',
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
