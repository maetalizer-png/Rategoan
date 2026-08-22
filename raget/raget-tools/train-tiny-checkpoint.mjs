// vNext Fase C - bukti training: preset 'tiny' (~2-3 juta parameter, jauh
// lebih kecil dari preset 'small' ~58 juta) untuk menguji apakah anggaran
// waktu praktis (30-45 menit) cukup membuat model mulai koheren pada skala
// yang jauh lebih kecil. Held-out perplexity dihitung dari 10% korpus yang
// TIDAK pernah dipakai untuk training (dipisah di level record, sebelum
// dialog di-expand jadi prompt+completion, supaya prompt satu dialog tidak
// bocor ke sisi train sementara completion-nya ke held-out).
//
// Pakai: node raget/raget-tools/train-tiny-checkpoint.mjs [menitAnggaran]

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-llm/neural/llm-core.js';
import { LLMTrainer } from '../raget-llm/neural/llm-trainer.js';
import { LLMTokenizer } from '../raget-llm/neural/llm-tokenizer.js';
import { LLMVocabulary } from '../raget-llm/neural/llm-vocabulary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CORPUS_FILE = path.join(ROOT, 'raget', 'raget-data', 'jsonl', 'raget_own_corpus.jsonl');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'raget-neural-tiny.safetensors');
const REPORT_FILE = path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report-tiny.json');

const BUDGET_MINUTES = Number(process.argv[2]) || 40;
const HELD_OUT_FRACTION = 10; // 1 record dari tiap 10 masuk held-out
const SAMPLE_PROMPTS = [
  'Apa ibu kota Indonesia?',
  'Siapa itu Albert Einstein?',
  'Ceritakan tentang Rategoan',
  'Halo, apa kabar?',
  'Apa itu localStorage?',
];

function recordToTexts(rec) {
  if (rec.type === 'dialog') return [rec.prompt, rec.completion];
  if (rec.text) return [rec.text];
  return [];
}

function loadSplitCorpus() {
  const raw = readFileSync(CORPUS_FILE, 'utf8').trim();
  const records = raw.split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l));
  const train = [];
  const heldOut = [];
  records.forEach((rec, i) => {
    const texts = recordToTexts(rec).filter((t) => typeof t === 'string' && t.trim().length > 0);
    if (i % HELD_OUT_FRACTION === 0) heldOut.push(...texts);
    else train.push(...texts);
  });
  return { train, heldOut };
}

function tokenizeToIds(text, model) {
  const pieces = LLMTokenizer.tokenize(text, model.merges);
  const ids = LLMVocabulary.encode(pieces, model.vocab);
  return [model.vocab.bosId].concat(ids, [model.vocab.eosId]);
}

function evalHeldOutLoss(model, heldOutTexts, sampleSize) {
  const sample = heldOutTexts.slice(0, sampleSize);
  let totalLoss = 0;
  let count = 0;
  for (const text of sample) {
    const ids = tokenizeToIds(text, model);
    if (ids.length < 2) continue;
    const inputIds = ids.slice(0, -1);
    const targetIds = ids.slice(1);
    const { logits } = LLMTrainer.forwardWithCache(inputIds, model, model.config.model);
    const { loss } = LLMTrainer.crossEntropyLossAndGrad(logits, targetIds);
    totalLoss += loss;
    count += 1;
  }
  return count ? totalLoss / count : null;
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
  console.log('Anggaran waktu training:', BUDGET_MINUTES, 'menit. Preset: tiny.');
  const { train, heldOut } = loadSplitCorpus();
  console.log('Korpus train:', train.length, 'teks. Held-out (tak pernah dilatih):', heldOut.length, 'teks.');

  console.log('\nMembangun model (preset tiny, skipAutoTrain)...');
  const tInit = Date.now();
  await RATEGOAN.initialize({ corpus: train, configOptions: { preset: 'tiny' }, skipAutoTrain: true });
  const stats0 = RATEGOAN.getStats();
  console.log('Model dibangun dalam', ((Date.now() - tInit) / 1000).toFixed(1), 'detik.');
  console.log('Stats:', JSON.stringify(stats0));

  const model = RATEGOAN.getModel();
  const perplexityBefore = Math.exp(evalHeldOutLoss(model, heldOut, 30));
  console.log('Held-out perplexity SEBELUM training:', perplexityBefore.toFixed(1));

  const samplesBefore = await generateSamples('SEBELUM training - bobot acak');

  console.log('\nMulai training nyata (gradient descent, learningRate=1e-3)...');
  const deadline = Date.now() + BUDGET_MINUTES * 60 * 1000;
  const lossHistory = [];
  const heldOutHistory = [];
  let totalSteps = 0;
  let corpusIdx = 0;
  const trainStart = Date.now();

  while (Date.now() < deadline && train.length > 0) {
    const batch = train.slice(corpusIdx, corpusIdx + 4);
    corpusIdx += 4;
    if (!batch.length) { corpusIdx = 0; continue; }
    const result = await RATEGOAN.train(batch, { epochs: 1, learningRate: 1e-3 });
    for (const h of result.history) {
      totalSteps++;
      lossHistory.push({ step: totalSteps, loss: h.loss, elapsedSec: Number(((Date.now() - trainStart) / 1000).toFixed(1)) });
    }
    if (totalSteps % 25 === 0) {
      const heldOutLoss = evalHeldOutLoss(model, heldOut, 30);
      const perplexity = Math.exp(heldOutLoss);
      heldOutHistory.push({ step: totalSteps, loss: heldOutLoss, perplexity, elapsedSec: Number(((Date.now() - trainStart) / 1000).toFixed(1)) });
      console.log('  step ' + totalSteps + ' train_loss=' + lossHistory[lossHistory.length - 1].loss.toFixed(4) +
        ' held_out_perplexity=' + perplexity.toFixed(1) + ' (' + heldOutHistory[heldOutHistory.length - 1].elapsedSec + 's)');
    }
    if (corpusIdx >= train.length) corpusIdx = 0;
  }

  const actualMinutes = ((Date.now() - trainStart) / 60000).toFixed(1);
  console.log('\nTraining berhenti setelah', actualMinutes, 'menit,', totalSteps, 'step total.');

  const avgLossFirst5 = lossHistory.slice(0, 5).reduce((s, h) => s + h.loss, 0) / Math.min(5, lossHistory.length);
  const avgLossLast5 = lossHistory.slice(-5).reduce((s, h) => s + h.loss, 0) / Math.min(5, lossHistory.length);
  const trainPerplexityFirst = Math.exp(avgLossFirst5);
  const trainPerplexityLast = Math.exp(avgLossLast5);

  const heldOutLossFinal = evalHeldOutLoss(model, heldOut, heldOut.length);
  const heldOutPerplexityFinal = Math.exp(heldOutLossFinal);
  console.log('Perplexity train (5 step pertama vs terakhir):', trainPerplexityFirst.toFixed(1), '->', trainPerplexityLast.toFixed(1));
  console.log('Held-out perplexity FINAL (seluruh', heldOut.length, 'teks held-out):', heldOutPerplexityFinal.toFixed(1));

  const samplesAfter = await generateSamples('SESUDAH training - ' + totalSteps + ' step');

  console.log('\nMenyimpan checkpoint SafeTensors (preset tiny, bobot sudah dilatih)...');
  const checkpointBytes = RATEGOAN.buildCheckpointSafetensors({
    name: 'rategoan-neural-tiny-checkpoint',
    corpusSize: train.length,
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
    preset: 'tiny',
    parameterCount: stats0.parameterCount,
    budgetMinutes: BUDGET_MINUTES,
    actualMinutes: Number(actualMinutes),
    trainCorpusSize: train.length,
    heldOutCorpusSize: heldOut.length,
    totalSteps,
    secPerStepAvg: Number((Number(actualMinutes) * 60 / totalSteps).toFixed(3)),
    lossHistory,
    heldOutHistory,
    trainPerplexity: { first5Steps: trainPerplexityFirst, last5Steps: trainPerplexityLast },
    heldOutPerplexity: { before: perplexityBefore, final: heldOutPerplexityFinal },
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
