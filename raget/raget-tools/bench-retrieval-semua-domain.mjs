// MEGA-BATCH RAGETAN-FULL bagian D: retrieval bench (hit@1/hit@3/MRR) untuk
// SEMUA 21 domain migrasi Fase B, memakai mekanisme retrieval NYATA yang
// sama seperti bench-retrieval.mjs (domain country) - raget-retrieval/
// retrieve.js (TF-IDF cosine similarity), bukan benchmark strawman.
//
// Berbeda dari bench-retrieval.mjs (yang pakai template pertanyaan tangan
// per field seperti "Apa ibu kota X?"), skrip ini generik lintas 21 domain
// yang skema metadata-nya berbeda-beda (country punya capital/population,
// penemuan punya inventor/year, dst - tidak ada satu set field yang sama
// di semua domain). Gold query dibangkitkan otomatis dari field yang SELALU
// ada di semua domain migrated: entry.nama (field wajib skema unified
// {id,kategori,wilayah,nama,tags,teks,meta}) - query "apa itu <nama>",
// ground truth = entry itu sendiri harus jadi hasil top retrieval di dalam
// korpus DOMAIN-nya sendiri (bukan lintas domain, supaya adil - meniru cara
// dataries-bridge.js mengelompokkan pencarian per grup/domain).
//
// Pakai: node raget/raget-tools/bench-retrieval-semua-domain.mjs

import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { retrieval } from '../raget-retrieval/retrieve.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const JSON_DIR = path.join(ROOT, 'raget', 'raget-data', 'json');
const REPORT_FILE = path.join(__dirname, 'retrieval-bench-semua-domain-report.json');

const THRESHOLD = 0.3;
const TOP_K = 10;

function loadDomain(domainDir) {
  const items = [];
  const full = path.join(JSON_DIR, domainDir);
  for (const f of readdirSync(full).filter((f) => f.endsWith('.json'))) {
    const entries = JSON.parse(readFileSync(path.join(full, f), 'utf8'));
    for (const entry of entries) {
      if (!entry.nama || !entry.teks) continue;
      items.push({ id: entry.id, nama: entry.nama, text: entry.teks, wilayah: entry.wilayah });
    }
  }
  return items;
}

function evaluate(items) {
  const corpus = items.map((item) => ({ item, text: item.text || '' }));
  let hit1 = 0;
  let hit3 = 0;
  let mrrSum = 0;
  let fallback = 0;
  const misses = [];

  for (const gold of items) {
    const q = 'apa itu ' + gold.nama;
    const ranked = retrieval.rank(q, corpus, { threshold: THRESHOLD, limit: TOP_K });
    if (!ranked.length) {
      fallback++;
      misses.push({ q, expect: gold.nama, reason: 'fallback (di bawah threshold)' });
      continue;
    }
    const rankIdx = ranked.findIndex((r) => r.item.item.id === gold.id);
    if (rankIdx === 0) hit1++;
    if (rankIdx >= 0 && rankIdx < 3) hit3++;
    if (rankIdx >= 0) mrrSum += 1 / (rankIdx + 1);
    else misses.push({ q, expect: gold.nama, reason: 'top hasil: ' + (ranked[0].item.item.nama || '?') });
  }

  const n = items.length;
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
  const domainDirs = readdirSync(JSON_DIR).filter((d) => {
    try { return statSync(path.join(JSON_DIR, d)).isDirectory(); } catch (e) { return false; }
  }).filter((d) => d !== 'knowledge').sort();

  console.log('Domain ditemukan:', domainDirs.length, '->', domainDirs.join(', '));

  const perDomain = {};
  let totalN = 0, totalHit1 = 0, totalHit3 = 0, totalMrrSum = 0, totalFallback = 0;
  const allMisses = {};

  for (const d of domainDirs) {
    const items = loadDomain(d);
    if (!items.length) { console.log(d + ': 0 entri, dilewati.'); continue; }
    const r = evaluate(items);
    perDomain[d] = { n: r.n, 'hit@1_rate': r['hit@1_rate'], 'hit@3_rate': r['hit@3_rate'], mrr: r.mrr, fallback_rate: r.fallback_rate };
    console.log(d + ': n=' + r.n + ' hit@1=' + r['hit@1_rate'] + ' hit@3=' + r['hit@3_rate'] + ' mrr=' + r.mrr + ' fallback=' + r.fallback_rate);
    totalN += r.n;
    totalHit1 += r['hit@1'];
    totalHit3 += r['hit@3'];
    totalMrrSum += r.mrr * r.n;
    totalFallback += r.fallback;
    if (r.misses.length) allMisses[d] = r.misses.slice(0, 5);
  }

  const overall = {
    n: totalN,
    'hit@1_rate': totalN ? +(totalHit1 / totalN).toFixed(4) : 0,
    'hit@3_rate': totalN ? +(totalHit3 / totalN).toFixed(4) : 0,
    mrr: totalN ? +(totalMrrSum / totalN).toFixed(4) : 0,
    fallback_rate: totalN ? +(totalFallback / totalN).toFixed(4) : 0,
  };

  console.log('\n=== OVERALL (' + domainDirs.length + ' domain, ' + totalN + ' gold query) ===');
  console.log(JSON.stringify(overall, null, 2));

  const report = {
    generatedAt: new Date().toISOString(),
    domainsCovered: domainDirs.length,
    mechanism: 'raget-retrieval/retrieve.js (TF-IDF cosine similarity), threshold 0.3, retrieval per-domain (bukan lintas domain)',
    goldQueryTemplate: '"apa itu <nama>" - nama = field wajib skema unified, ground truth = entry itu sendiri',
    overall,
    perDomain,
    misses_sample: allMisses,
  };
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('\nLaporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
