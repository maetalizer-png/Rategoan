import { readFileSync, readdirSync, writeFileSync, statSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { scorer } from '../raget-agents/scorer.js';
import { ppmiEmbedding } from '../raget-retrieval/ppmi-embedding.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const JSON_DIR = path.join(ROOT, 'raget', 'raget-data', 'json');
const NEGARA_DIR = path.join(JSON_DIR, 'negara');
const REPORT_FILE = path.join(__dirname, 'ppmi-vs-bm25-report.json');

const TOP_K = 10;
const WINDOW = 4;

function loadAllDomainsText() {
  const domainDirs = readdirSync(JSON_DIR).filter((d) => {
    try {
      return statSync(path.join(JSON_DIR, d)).isDirectory();
    } catch (e) {
      return false;
    }
  });
  const texts = [];
  for (const d of domainDirs) {
    const full = path.join(JSON_DIR, d);
    for (const f of readdirSync(full).filter((f) => f.endsWith('.json'))) {
      const entries = JSON.parse(readFileSync(path.join(full, f), 'utf8'));
      for (const entry of entries) {
        const t = entry.teks || entry.text || entry.answer || entry.a || '';
        if (t) texts.push(t);
      }
    }
  }
  return texts;
}

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
    if (m.capital) queries.push({ q: 'Apa ibu kota ' + m.name + '?', expect: m.name });
    if (m.population) queries.push({ q: 'Berapa populasi ' + m.name + '?', expect: m.name });
    if (m.currency) queries.push({ q: 'Mata uang apa yang dipakai ' + m.name + '?', expect: m.name });
    if (m.officialName) queries.push({ q: 'Apa nama resmi negara ' + m.name + '?', expect: m.name });
  }
  return queries;
}

function evaluate(queries, corpusItems, index, idfWeights) {
  let hit1 = 0;
  let hit3 = 0;
  let mrrSum = 0;
  const misses = [];

  for (const gq of queries) {
    const queryTokens = scorer.tokenize(gq.q);
    const idx = idfWeights ? { ...index, idfWeights } : index;
    const ranked = ppmiEmbedding.rank(queryTokens, idx, TOP_K);
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
  console.log('Memuat korpus semua domain untuk statistik co-occurrence PPMI...');
  const allTexts = loadAllDomainsText();
  console.log('Dokumen dipakai untuk co-occurrence:', allTexts.length);

  const tokenizedAll = allTexts.map((t) => scorer.tokenize(t));
  const cooc = ppmiEmbedding.buildCooccurrence(tokenizedAll, WINDOW);
  const ppmiTable = ppmiEmbedding.buildPPMITable(cooc);
  console.log('Ukuran vocab dengan PPMI row (window=' + WINDOW + '):', ppmiTable.size);

  const countries = loadAllCountries();
  const queries = buildGoldQueries(countries);
  console.log('Korpus negara (dievaluasi):', countries.length, 'entri.');
  console.log('Gold query:', queries.length);

  const tokenizedCountries = countries.map((item) => scorer.tokenize(item.text || ''));
  const idfWeights = ppmiEmbedding.buildIdfWeights(tokenizedAll);
  const vectorsUniform = tokenizedCountries.map((tokens) => ppmiEmbedding.documentVector(tokens, ppmiTable));
  const vectorsIdf = tokenizedCountries.map((tokens) => ppmiEmbedding.documentVector(tokens, ppmiTable, idfWeights));
  const indexUniform = { corpus: countries, vectors: vectorsUniform, ppmiTable };
  const indexIdf = { corpus: countries, vectors: vectorsIdf, ppmiTable, idfWeights };

  const ppmiResult = evaluate(queries, countries, indexUniform);
  const ppmiIdfResult = evaluate(queries, countries, indexIdf, idfWeights);

  console.log('\n=== HASIL: PPMI co-occurrence, pooling UNIFORM (dilatih dari SEMUA domain lokal, window=' + WINDOW + ') ===');
  console.log(JSON.stringify({ 'hit@1_rate': ppmiResult['hit@1_rate'], 'hit@3_rate': ppmiResult['hit@3_rate'], mrr: ppmiResult.mrr }, null, 2));

  console.log('\n=== HASIL: PPMI co-occurrence, pooling IDF-WEIGHTED ===');
  console.log(JSON.stringify({ 'hit@1_rate': ppmiIdfResult['hit@1_rate'], 'hit@3_rate': ppmiIdfResult['hit@3_rate'], mrr: ppmiIdfResult.mrr }, null, 2));

  let bm25Baseline = null;
  let randomBaseline = null;
  try {
    bm25Baseline = JSON.parse(readFileSync(path.join(__dirname, 'retrieval-bench-report.json'), 'utf8'));
  } catch (e) {}
  try {
    randomBaseline = JSON.parse(readFileSync(path.join(__dirname, 'semantic-vs-bm25-report.json'), 'utf8'));
  } catch (e) {}

  console.log('\n=== PEMBANDING ===');
  console.log('BM25 produksi:', bm25Baseline ? JSON.stringify(bm25Baseline.overall) : '(tidak ada laporan)');
  console.log('Embedding acak (Fase 3.1 sebelumnya):', randomBaseline ? JSON.stringify(randomBaseline.semanticResult && { 'hit@1_rate': randomBaseline.semanticResult['hit@1_rate'], mrr: randomBaseline.semanticResult.mrr }) : '(tidak ada laporan)');

  const best = ppmiIdfResult['hit@1_rate'] >= ppmiResult['hit@1_rate'] ? ppmiIdfResult : ppmiResult;
  const bestLabel = best === ppmiIdfResult ? 'PPMI IDF-weighted' : 'PPMI uniform';
  let verdict;
  if (bm25Baseline && bm25Baseline.overall) {
    if (best['hit@1_rate'] >= bm25Baseline.overall['hit@1_rate']) {
      verdict = bestLabel + ' SETARA/LEBIH BAIK dari BM25 di gold query ini - kandidat sinyal tambahan nyata.';
    } else if (randomBaseline && randomBaseline.semanticResult && best['hit@1_rate'] > randomBaseline.semanticResult['hit@1_rate']) {
      verdict = bestLabel + ' KALAH dari BM25 tapi lebih baik dari embedding acak - sinyal distribusional ada tapi belum cukup kuat untuk gold query ini.';
    } else {
      verdict = 'Baik PPMI uniform (hit@1 ' + ppmiResult['hit@1_rate'] + ') maupun IDF-weighted (hit@1 ' + ppmiIdfResult['hit@1_rate'] + ') KALAH dari embedding acak (hit@1 ' + (randomBaseline && randomBaseline.semanticResult ? randomBaseline.semanticResult['hit@1_rate'] : '?') + ') dan jauh dari BM25 (hit@1 ' + bm25Baseline.overall['hit@1_rate'] + '). Mean-pooling co-occurrence PPMI melarutkan sinyal kata spesifik (nama negara) dengan kata umum yang muncul di semua entri sejenis - pooling uniform token-level TIDAK cocok untuk retrieval presisi-tinggi seperti gold query template ini, terlepas dari embedding-nya random atau PPMI terlatih.';
    }
  } else {
    verdict = 'Tidak bisa dibandingkan - baseline BM25 tidak tersedia.';
  }

  console.log('\n=== KESIMPULAN JUJUR ===');
  console.log(verdict);

  writeFileSync(
    REPORT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        mechanism: 'raget-retrieval/ppmi-embedding.js (PPMI co-occurrence, window=' + WINDOW + ', dilatih dari SEMUA domain lokal, ' + allTexts.length + ' dokumen)',
        vocabWithPPMI: ppmiTable.size,
        ppmiResultUniformPooling: ppmiResult,
        ppmiResultIdfWeightedPooling: ppmiIdfResult,
        bm25Baseline: bm25Baseline ? bm25Baseline.overall : null,
        randomEmbeddingBaseline: randomBaseline ? randomBaseline.semanticResult : null,
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
