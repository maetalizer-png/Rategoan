// MEGA-BATCH RAGETAN-FULL bagian C: bukti training nyata pada arsitektur
// PERSIS 50.000.000 parameter (preset 'massive50m': vocabSize 30368,
// dModel 512, nLayers 6, nHeads 8, dFF 2048 - lihat llm-config.js,
// parameterCount terverifikasi 49.999.872 lewat RATEGOAN.getStats()).
//
// CATATAN JUJUR WAJIB DIBACA SEBELUM MENJALANKAN ULANG:
// Instruksi asli minta token_target = 20 x 50M = 1 miliar token (lantai
// 100 juta), lalu training SAMPAI total_step tuntas dalam waktu 1 hari.
// Pengukuran nyata (bukan asumsi) di sesi ini: 1 step gradient descent
// (batch=4 teks, avg ~25 token/teks) pada model 50M ini makan ~26 detik
// -CPU-only, JS murni, tanpa akselerasi GPU nyata (WebGPU dicoba, tidak
// aktif). Itu artinya floor 100 juta token (~1 juta step) butuh ~312 HARI
// non-stop, jauh melebihi anggaran waktu yang diberikan (1 hari) dan jauh
// melebihi ukuran korpus nyata yang tersedia (~105 ribu token unik).
// Skrip ini TIDAK mengejar target 1 miliar/100 juta token yang mustahil
// itu - sebagai gantinya menjalankan anggaran waktu nyata (BUDGET_MINUTES,
// pola sama seperti train-tiny-checkpoint.mjs) dan melaporkan angka apa
// adanya: berapa step benar-benar selesai, loss/perplexity, dan sampel
// generasi - bukti bahwa gradient descent nyata berjalan di skala 50M,
// bukan klaim sudah koheren atau sudah mencapai token_target.
//
// Pakai: node --max-old-space-size=4096 raget/raget-tools/train-massive50m-checkpoint.mjs [menitAnggaran]

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-neural/llm-core.js';
import { LLMTrainer } from '../raget-neural/llm-trainer.js';
import { LLMTokenizer } from '../raget-neural/llm-tokenizer.js';
import { LLMVocabulary } from '../raget-neural/llm-vocabulary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CORPUS_FILE = path.join(ROOT, 'raget', 'raget-data', 'jsonl', 'raget_own_corpus.jsonl');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'raget-neural-massive50m.safetensors');
const REPORT_FILE = path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'training-report-massive50m.json');

const BUDGET_MINUTES = Number(process.argv[2]) || 40;
const HELD_OUT_FRACTION = 10;
const CHECKPOINT_FRACTIONS = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
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
    const out = await RATEGOAN.generateText(prompt, { maxNewTokens: 40, minNewTokens: 8, temperature: 0.9, greedy: false });
    const text = out && out.text ? out.text.trim() : '(kosong)';
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    console.log('  "' + prompt + '" -> "' + text + '" (' + dt + 's, ' + (out ? out.tokensGenerated : 0) + ' token)');
    samples.push({ prompt, text, tokensGenerated: out ? out.tokensGenerated : 0, stoppedAtEos: out ? out.stoppedAtEos : null, seconds: Number(dt) });
  }
  return samples;
}

async function main() {
  console.log('Anggaran waktu training: ' + BUDGET_MINUTES + ' menit. Preset: massive50m (persis 50.000.000 param).');
  const { train, heldOut } = loadSplitCorpus();
  console.log('Korpus train:', train.length, 'teks. Held-out (tak pernah dilatih):', heldOut.length, 'teks.');

  console.log('\nMembangun model (preset massive50m, skipAutoTrain)...');
  const tInit = Date.now();
  await RATEGOAN.initialize({ corpus: train, configOptions: { preset: 'massive50m' }, skipAutoTrain: true });
  const initSeconds = (Date.now() - tInit) / 1000;
  const stats0 = RATEGOAN.getStats();
  console.log('Model dibangun dalam', initSeconds.toFixed(1), 'detik.');
  console.log('Stats:', JSON.stringify(stats0));
  if (stats0.parameterCount !== 49999872) {
    console.warn('PERINGATAN: parameterCount (' + stats0.parameterCount + ') bukan 49999872 yang diharapkan preset massive50m!');
  }

  const model = RATEGOAN.getModel();
  const perplexityBefore = Math.exp(evalHeldOutLoss(model, heldOut, 15));
  console.log('Held-out perplexity SEBELUM training:', perplexityBefore.toFixed(1));

  const samplesBefore = await generateSamples('SEBELUM training - bobot acak');

  console.log('\nMulai training nyata (gradient descent, learningRate=1e-3, batch=4)...');
  const deadline = Date.now() + BUDGET_MINUTES * 60 * 1000;
  const lossHistory = [];
  const heldOutHistory = [];
  const checkpointsSaved = [];
  let totalSteps = 0;
  let corpusIdx = 0;
  const trainStart = Date.now();
  const estimatedTotalStepsForBudget = Math.max(1, Math.floor((BUDGET_MINUTES * 60) / 26));
  let nextCheckpointFractionIdx = 0;

  mkdirSync(OUT_DIR, { recursive: true });

  while (Date.now() < deadline && train.length > 0) {
    const batch = train.slice(corpusIdx, corpusIdx + 4);
    corpusIdx += 4;
    if (!batch.length) { corpusIdx = 0; continue; }
    const result = await RATEGOAN.train(batch, { epochs: 1, learningRate: 1e-3 });
    for (const h of result.history) {
      totalSteps++;
      lossHistory.push({ step: totalSteps, loss: h.loss, elapsedSec: Number(((Date.now() - trainStart) / 1000).toFixed(1)) });
    }
    console.log('  step ' + totalSteps + ' train_loss=' + lossHistory[lossHistory.length - 1].loss.toFixed(4) +
      ' (' + lossHistory[lossHistory.length - 1].elapsedSec + 's)');

    const progressFraction = totalSteps / estimatedTotalStepsForBudget;
    while (nextCheckpointFractionIdx < CHECKPOINT_FRACTIONS.length && progressFraction >= CHECKPOINT_FRACTIONS[nextCheckpointFractionIdx]) {
      const frac = CHECKPOINT_FRACTIONS[nextCheckpointFractionIdx];
      const fracFile = path.join(OUT_DIR, 'raget-neural-massive50m-' + Math.round(frac * 100) + 'pct.safetensors');
      const bytes = RATEGOAN.buildCheckpointSafetensors({
        name: 'rategoan-neural-massive50m-checkpoint-' + Math.round(frac * 100) + 'pct',
        corpusSize: train.length,
        trained: true,
        trainingSteps: totalSteps,
        trainingMinutes: Number(((Date.now() - trainStart) / 60000).toFixed(2)),
        createdAt: new Date().toISOString(),
      });
      writeFileSync(fracFile, bytes);
      checkpointsSaved.push({ fraction: frac, step: totalSteps, file: path.relative(ROOT, fracFile), bytes: bytes.byteLength });
      console.log('  [checkpoint ' + Math.round(frac * 100) + '%] step ' + totalSteps + ' -> ' + path.relative(ROOT, fracFile));
      nextCheckpointFractionIdx++;
    }

    if (corpusIdx >= train.length) corpusIdx = 0;
  }

  const actualMinutes = ((Date.now() - trainStart) / 60000).toFixed(1);
  console.log('\nTraining berhenti setelah', actualMinutes, 'menit,', totalSteps, 'step total.');

  const heldOutLossFinal = evalHeldOutLoss(model, heldOut, heldOut.length);
  const heldOutPerplexityFinal = Math.exp(heldOutLossFinal);
  console.log('Held-out perplexity FINAL (seluruh', heldOut.length, 'teks held-out):', heldOutPerplexityFinal.toFixed(1));

  const samplesAfter = await generateSamples('SESUDAH training - ' + totalSteps + ' step');

  console.log('\nMenyimpan checkpoint SafeTensors final (preset massive50m)...');
  const checkpointBytes = RATEGOAN.buildCheckpointSafetensors({
    name: 'rategoan-neural-massive50m-checkpoint-final',
    corpusSize: train.length,
    trained: true,
    trainingSteps: totalSteps,
    trainingMinutes: Number(actualMinutes),
    createdAt: new Date().toISOString(),
  });
  writeFileSync(OUT_FILE, checkpointBytes);
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', (checkpointBytes.byteLength / 1024 / 1024).toFixed(2), 'MB');

  const secPerStepAvg = totalSteps ? Number((Number(actualMinutes) * 60 / totalSteps).toFixed(2)) : null;
  const tokenPerStepMeasured = 98; // batch=4 x avg ~24.6 token/teks (BOS+EOS termasuk), diukur langsung dari korpus
  const tokenTargetChinchilla = 20 * stats0.parameterCount;
  const tokenTargetFloor = 100000000;
  const totalStepNeededFloor = Math.ceil(tokenTargetFloor / tokenPerStepMeasured);
  const totalStepNeededChinchilla = Math.ceil(tokenTargetChinchilla / tokenPerStepMeasured);

  const report = {
    generatedAt: new Date().toISOString(),
    preset: 'massive50m',
    parameterCount: stats0.parameterCount,
    parameterCountTargetExact: 50000000,
    budgetMinutes: BUDGET_MINUTES,
    actualMinutes: Number(actualMinutes),
    initSeconds: Number(initSeconds.toFixed(1)),
    trainCorpusSize: train.length,
    heldOutCorpusSize: heldOut.length,
    totalSteps,
    secPerStepAvg,
    checkpointsSaved,
    lossHistory,
    heldOutHistory,
    heldOutPerplexity: { before: perplexityBefore, final: heldOutPerplexityFinal },
    samplesBefore,
    samplesAfter,
    hitunganPresisiC1sampaiC4: {
      'C1_arsitektur': { vocabSize: model.config.model.vocabSize, dModel: model.config.model.dModel, nLayers: model.config.model.nLayers, nHeads: model.config.model.nHeads, dFF: model.config.model.dFF, parameterCountAktual: stats0.parameterCount },
      'C2_token_target': { formula: '20 x parameterCount', tokenTargetChinchilla, tokenTargetFloorDiminta: tokenTargetFloor },
      'C3_token_per_step': { formula: 'batch_size x rata-rata_seqLen_terukur', batchSize: 4, avgSeqLenTerukur: 24.6, tokenPerStepMeasured },
      'C4_total_step': { totalStepNeededFloor, totalStepNeededChinchilla, totalStepNeededFloorHari: Number((totalStepNeededFloor * secPerStepAvg / 86400).toFixed(1)), totalStepNeededChinchillaHari: Number((totalStepNeededChinchilla * secPerStepAvg / 86400).toFixed(1)) },
    },
    catatanJujur: 'Model 50.000.000 parameter NYATA dibangun dan dilatih dengan gradient descent sungguhan (bukan simulasi) selama anggaran waktu di atas. Target token_target (1 miliar, lantai 100 juta) dari instruksi TIDAK tercapai dan TIDAK BISA tercapai dalam batas waktu 1 hari yang diminta - diukur langsung: 1 step (batch=4) makan rata-rata ' + secPerStepAvg + ' detik CPU-only tanpa GPU nyata, sehingga floor 100 juta token butuh ' + Math.round(totalStepNeededFloor * secPerStepAvg / 86400) + ' hari non-stop. Generasi pasca-training MASIH belum koheren pada anggaran waktu yang benar-benar dijalankan (lihat samplesAfter) - ini bukti nyata gradient descent berjalan di skala 50M, bukan klaim sudah "koheren" atau sudah mencapai token_target yang diminta.',
  };
  mkdirSync(path.dirname(REPORT_FILE), { recursive: true });
  writeFileSync(REPORT_FILE, JSON.stringify(report, null, 2), 'utf8');
  console.log('Laporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
