// PRD-RAGET-TEMPLATE.md Fase 3.1: uji EMPIRIS apakah pooling+cosine
// (semantic-index.js, dibangun di atas raget-neural/llm-embedding.js) benar
// menambah nilai dibanding BM25 (retrieve.js) yang sudah dipakai produksi -
// bukan cuma diklaim di PRD. Memakai HARNESS dan CORPUS PERSIS SAMA seperti
// bench-retrieval.mjs (163 negara, gold query dari metadata ibu-kota/
// populasi/mata-uang/nama-resmi, threshold 0.3 setara) supaya angkanya bisa
// dibandingkan langsung dengan hit@1/hit@3/MRR BM25 yang sudah diverifikasi
// di sana (hit@1 0.9848 pada versi terakhir yang diketahui - lihat
// retrieval-bench-report.json).
//
// embeddingTable yang dipakai di sini SENGAJA inisialisasi Gaussian acak
// (LLMEmbedding.createEmbeddingMatrix belum pernah dilatih) karena BELUM ADA
// checkpoint terlatih yang bisa diekstrak embedding-nya secara lokal tanpa
// mengunduh aset Release + parsing SafeTensors (di luar cakupan sesi ini -
// lihat catatan di semantic-index.js). Tujuan skrip ini BUKAN membuktikan
// semantic search "menang", tapi mengukur JUJUR seberapa jauh gap-nya
// dengan embedding acak, supaya PRD tidak menyimpan klaim tak teruji.
//
// Pakai: node raget/raget-tools/bench-semantic-vs-bm25.mjs

import { readFileSync, readdirSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scorer } from '../raget-agents/scorer.js';
import { semanticIndex } from '../raget-retrieval/semantic-index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const NEGARA_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'negara');
const REPORT_FILE = path.join(__dirname, 'semantic-vs-bm25-report.json');

const TOP_K = 10;
const D_MODEL = 64;

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

function evaluateSemantic(queries, corpusItems, index) {
  let hit1 = 0;
  let hit3 = 0;
  let mrrSum = 0;
  const misses = [];

  for (const gq of queries) {
    const queryTokens = scorer.tokenize(gq.q);
    const ranked = semanticIndex.rank(queryTokens, index, TOP_K);
    const rankIdx = ranked.findIndex((r) => r.item.metadata && r.item.metadata.name === gq.expect);
    if (rankIdx === 0) hit1++;
    if (rankIdx >= 0 && rankIdx < 3) hit3++;
    if (rankIdx >= 0) mrrSum += 1 / (rankIdx + 1);
    else misses.push({ q: gq.q, expect: gq.expect, reason: 'top hasil: ' + (ranked[0] && ranked[0].item.metadata ? ranked[0].item.metadata.name : '?') });
  }

  const n = queries.length;
  return {
    n,
    'hit@1': hit1,
    'hit@1_rate': n ? +(hit1 / n).toFixed(4) : 0,
    'hit@3': hit3,
    'hit@3_rate': n ? +(hit3 / n).toFixed(4) : 0,
    mrr: n ? +(mrrSum / n).toFixed(4) : 0,
    misses_sample: misses.slice(0, 5),
  };
}

async function main() {
  const countries = loadAllCountries();
  const queries = buildGoldQueries(countries);
  console.log('Korpus negara:', countries.length, 'entri.');
  console.log('Gold query:', queries.length, '(template sama seperti bench-retrieval.mjs).');

  const index = semanticIndex.buildIndex(countries, (item) => item.text, (t) => scorer.tokenize(t), D_MODEL);
  console.log('Ukuran vocab (word-level, dibangun dari korpus ini):', index.vocab.size, '| dModel:', D_MODEL);

  const semanticResult = evaluateSemantic(queries, countries, index);

  console.log('\n=== HASIL: pooling+cosine, embedding Gaussian ACAK (belum dilatih) ===');
  console.log(JSON.stringify({ 'hit@1_rate': semanticResult['hit@1_rate'], 'hit@3_rate': semanticResult['hit@3_rate'], mrr: semanticResult.mrr }, null, 2));

  console.log('\n=== PEMBANDING (baseline BM25 produksi, dari retrieval-bench-report.json) ===');
  let bm25Baseline = null;
  try {
    bm25Baseline = JSON.parse(readFileSync(path.join(__dirname, 'retrieval-bench-report.json'), 'utf8'));
    console.log(JSON.stringify(bm25Baseline.overall || bm25Baseline, null, 2));
  } catch (e) {
    console.log('(retrieval-bench-report.json tidak ditemukan/terbaca - jalankan bench-retrieval.mjs dulu untuk baseline)');
  }

  const verdict =
    bm25Baseline && bm25Baseline.overall
      ? semanticResult['hit@1_rate'] >= bm25Baseline.overall['hit@1_rate']
        ? 'Embedding acak SETARA/LEBIH BAIK dari BM25 - tidak terduga, cek ulang metodologi.'
        : 'SESUAI DUGAAN TEORITIS: embedding acak KALAH dari BM25 (tidak ada pembobotan IDF, tidak ada makna terlatih). Pooling+cosine ini baru berguna sebagai SINYAL TAMBAHAN setelah embeddingTable diganti dengan embedding dari checkpoint terlatih.'
      : 'Tidak bisa dibandingkan - baseline BM25 tidak tersedia.';

  console.log('\n=== KESIMPULAN JUJUR ===');
  console.log(verdict);

  writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mechanism: 'raget-retrieval/semantic-index.js (mean pooling + cosine similarity) di atas LLMEmbedding.createEmbeddingMatrix (Gaussian ACAK, belum dilatih)',
        dModel: D_MODEL,
        vocabSize: index.vocab.size,
        semanticResult,
        bm25Baseline: bm25Baseline ? bm25Baseline.overall || bm25Baseline : null,
        verdict,
      },
      null,
      2
    ),
    'utf8'
  );
  console.log('\nLaporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
