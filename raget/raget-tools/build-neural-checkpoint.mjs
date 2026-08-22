// vNext Fase C: bangun checkpoint raget-neural-50m.safetensors dari korpus lokal.
// Korpus: raget-corpus/raget_own_corpus.jsonl (jalankan dataries-ke-korpus.mjs
// dulu kalau belum ada). skipAutoTrain dipakai di sini - bobot inisialisasi
// acak, belum dilatih; training nyata ada di train-neural-checkpoint.mjs.
//
// Pakai: node raget/raget-tools/build-neural-checkpoint.mjs

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-llm/neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'raget-neural-50m.safetensors');
const CORPUS_FILE = path.join(ROOT, 'raget', 'raget-corpus', 'raget_own_corpus.jsonl');

function gatherCorpus() {
  const raw = readFileSync(CORPUS_FILE, 'utf8').trim();
  if (!raw) throw new Error('Korpus kosong: ' + CORPUS_FILE + ' - jalankan dataries-ke-korpus.mjs dulu.');
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

async function main() {
  console.log('Membaca korpus dari', path.relative(ROOT, CORPUS_FILE) + '...');
  const corpus = gatherCorpus();
  console.log('Korpus terkumpul:', corpus.length, 'kalimat/teks.');
  const totalChars = corpus.reduce((s, t) => s + t.length, 0);
  console.log('Perkiraan total karakter:', totalChars, '(~' + Math.round(totalChars / 4) + ' token kasar)');

  console.log('\nMembangun model (preset small, ~50M parameter, skipAutoTrain)...');
  const t0 = Date.now();
  await RATEGOAN.initialize({
    corpus,
    configOptions: { preset: 'small' },
    skipAutoTrain: true,
  });
  console.log('Model dibangun dalam', ((Date.now() - t0) / 1000).toFixed(1), 'detik.');

  const stats = RATEGOAN.getStats();
  console.log('Stats:', JSON.stringify(stats, null, 2));

  console.log('\nMembangun checkpoint SafeTensors...');
  const checkpointBytes = RATEGOAN.buildCheckpointSafetensors({
    corpusSize: corpus.length,
    trained: false,
    createdAt: new Date().toISOString(),
  });

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_FILE, checkpointBytes);
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', (checkpointBytes.byteLength / 1024 / 1024).toFixed(2), 'MB');
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
