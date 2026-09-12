// vNext Fase C: training gradient descent nyata untuk Raget Neural, dibatasi
// anggaran waktu (bukan jumlah step tetap) - satu step lewat transformer
// 8-layer/512-dim di CPU murni makan ~12-19 detik, jadi anggaran praktis
// hanya cukup untuk puluhan step, bukan ribuan.
// Pakai: node raget/raget-tools/train-neural-checkpoint.mjs [menitAnggaran]

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CORPUS_FILE = path.join(ROOT, 'raget', 'raget-data', 'jsonl', 'raget_own_corpus.jsonl');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'raget-neural-50m.safetensors');
const REPORT_FILE = path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report.json');

const BUDGET_MINUTES = Number(process.argv[2]) || 25;
const SAMPLE_PROMPTS = [
  'Apa ibu kota Indonesia?',
  'Siapa itu Albert Einstein?',
  'Ceritakan tentang Rategoan',
  'Halo, apa kabar?',
  'Apa itu localStorage?',
];

function gatherCorpus() {
  const raw = readFileSync(CORPUS_FILE, 'utf8').trim();
  const texts = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const rec = JSON.parse(line);
    if (rec.type === 'dialog') {
      texts.push(rec.prompt);
      texts.push(rec.completion);
    } else if (rec.text) {
      texts.push(rec.text);
    }
  }
  return texts.filter((t) => typeof t === 'string' && t.trim().length > 0);
}

async function generateSamples(label) {
  console.log('\n--- Sampel generasi (' + label + ') ---');
  const samples = [];
  for (const prompt of SAMPLE_PROMPTS) {
    const t0 = Date.now();
    const out = await RATEGOAN.generateText(prompt, { maxNewTokens: 40, temperature: 0.9, greedy: false });
    const text = out && out.text ? out.text.trim() : '(kosong)';
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('  "' + prompt + '" -> "' + text + '" (' + dt + 's)');
    samples.push({ prompt, text, seconds: Number(dt) });
  }
  return samples;
}

async function main() {
  console.log('Anggaran waktu training:', BUDGET_MINUTES, 'menit.');
  const corpus = gatherCorpus();
  console.log('Korpus:', corpus.length, 'kalimat/teks dari', path.relative(ROOT, CORPUS_FILE));

  console.log('\nMembangun model (preset small, ~58 juta parameter, bobot ACAK, skipAutoTrain)...');
  const tInit = Date.now();
  await RATEGOAN.initialize({ corpus, configOptions: { preset: 'small' }, skipAutoTrain: true });
  console.log('Model dibangun dalam', ((Date.now() - tInit) / 1000).toFixed(1), 'detik. Vocab:', RATEGOAN.getStats().vocabSize);

  const samplesBefore = await generateSamples('SEBELUM training - bobot acak');

  console.log('\nMulai training nyata (gradient descent, learningRate=1e-3)...');
  const deadline = Date.now() + BUDGET_MINUTES * 60 * 1000;
  const lossHistory = [];
  let totalSteps = 0;
  let corpusIdx = 0;
  const trainStart = Date.now();

  while (Date.now() < deadline && corpusIdx < corpus.length) {
    const batch = corpus.slice(corpusIdx, corpusIdx + 4);
    corpusIdx += 4;
    if (!batch.length) break;
    const result = await RATEGOAN.train(batch, { epochs: 1, learningRate: 1e-3 });
    for (const h of result.history) {
      totalSteps++;
      lossHistory.push({ step: totalSteps, loss: h.loss, elapsedSec: Number(((Date.now() - trainStart) / 1000).toFixed(1)) });
      console.log('  step ' + totalSteps + ' loss=' + h.loss.toFixed(4) + ' (' + lossHistory[lossHistory.length - 1].elapsedSec + 's)');
    }
    if (corpusIdx >= corpus.length) corpusIdx = 0; // ulang dari awal korpus kalau anggaran waktu masih ada
  }

  const actualMinutes = ((Date.now() - trainStart) / 60000).toFixed(1);
  console.log('\nTraining berhenti setelah', actualMinutes, 'menit,', totalSteps, 'step total.');

  const avgLossFirst5 = lossHistory.slice(0, 5).reduce((s, h) => s + h.loss, 0) / Math.min(5, lossHistory.length);
  const avgLossLast5 = lossHistory.slice(-5).reduce((s, h) => s + h.loss, 0) / Math.min(5, lossHistory.length);
  const perplexityFirst = Math.exp(avgLossFirst5);
  const perplexityLast = Math.exp(avgLossLast5);
  console.log('Loss rata-rata 5 step pertama:', avgLossFirst5.toFixed(4), '(perplexity ~' + perplexityFirst.toFixed(1) + ')');
  console.log('Loss rata-rata 5 step terakhir:', avgLossLast5.toFixed(4), '(perplexity ~' + perplexityLast.toFixed(1) + ')');

  const samplesAfter = await generateSamples('SESUDAH training - ' + totalSteps + ' step');

  console.log('\nMenyimpan checkpoint SafeTensors (bobot sudah dilatih)...');
  const checkpointBytes = RATEGOAN.buildCheckpointSafetensors({
    corpusSize: corpus.length,
    trained: true,
    trainingSteps: totalSteps,
    trainingMinutes: Number(actualMinutes),
    createdAt: new Date().toISOString(),
  });
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, checkpointBytes);
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', (checkpointBytes.byteLength / 1024 / 1024).toFixed(2), 'MB');

  const report = {
    generatedAt: new Date().toISOString(),
    budgetMinutes: BUDGET_MINUTES,
    actualMinutes: Number(actualMinutes),
    corpusSize: corpus.length,
    totalSteps,
    lossHistory,
    perplexity: { first5Steps: perplexityFirst, last5Steps: perplexityLast },
    samplesBefore,
    samplesAfter,
  };
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('Laporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
