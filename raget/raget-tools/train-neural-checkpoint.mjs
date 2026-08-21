// vNext Fase C: training NYATA pertama untuk Raget Neural (gradient descent
// sungguhan, bukan skipAutoTrain). Dipakai SETELAH build-neural-checkpoint.mjs
// membangun struktur - skrip ini yang benar-benar melatih bobotnya dari
// korpus lokal Rategoan sendiri (raget-corpus/raget_own_corpus.jsonl).
//
// KALIBRASI JUJUR sebelum dijalankan penuh: satu training step (forward +
// backward penuh lewat transformer 8-layer/512-dim, 58 juta parameter)
// di JavaScript murni tanpa GPU (gpu.active: false, WebGPU tidak aktif di
// Node) makan waktu JAUH lebih lama dari perkiraan awal - percobaan 5 teks/
// 1 epoch tidak selesai dalam >180 detik. Karena itu skrip ini dibatasi
// ANGGARAN WAKTU (bukan jumlah step tetap) - berhenti setelah durasi
// tertentu berlalu, apa pun jumlah step yang berhasil diselesaikan, supaya
// hasilnya bisa dilaporkan jujur tanpa membuat sesi kerja menunggu tanpa
// batas. ONE hasil realistis: hanya PULUHAN step (bukan ribuan) yang bisa
// diselesaikan dalam anggaran waktu praktis - ini TIDAK CUKUP untuk model
// menghasilkan teks koheren (butuh puluhan ribu step minimum untuk model
// seukuran ini). Status "Neural (Eksperimental)" TETAP berlaku apa pun
// hasil training ini.
//
// Pakai: node raget/raget-tools/train-neural-checkpoint.mjs [menitAnggaran]

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LLMCore } from '../raget-llm/neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CORPUS_FILE = path.join(ROOT, 'raget', 'raget-corpus', 'raget_own_corpus.jsonl');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'checkpoint-50m.json');
const REPORT_FILE = path.join(__dirname, 'training-report.json');

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
    const out = await LLMCore.generateText(prompt, { maxNewTokens: 40, temperature: 0.9, greedy: false });
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
  await LLMCore.initialize({ corpus, configOptions: { preset: 'small' }, skipAutoTrain: true });
  console.log('Model dibangun dalam', ((Date.now() - tInit) / 1000).toFixed(1), 'detik. Vocab:', LLMCore.getStats().vocabSize);

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
    const result = await LLMCore.train(batch, { epochs: 1, learningRate: 1e-3 });
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

  console.log('\nMenyimpan checkpoint (bobot sudah dilatih)...');
  const checkpoint = LLMCore.buildCheckpointObject({
    source: 'raget-tools/train-neural-checkpoint.mjs',
    corpusSize: corpus.length,
    trained: true,
    trainingSteps: totalSteps,
    trainingMinutes: Number(actualMinutes),
    createdAt: new Date().toISOString(),
  });
  mkdirSync(OUT_DIR, { recursive: true });
  const json = JSON.stringify(checkpoint);
  writeFileSync(OUT_FILE, json, 'utf8');
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', (json.length / 1024 / 1024).toFixed(2), 'MB');

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
