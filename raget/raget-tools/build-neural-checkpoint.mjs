// vNext Fase C: bangun checkpoint awal untuk Raget Neural - transformer
// ~50 juta parameter yang diadaptasi dari kesempatan-os-/kesem-llm/ (lihat
// raget/raget-llm/neural/). Checkpoint ini yang di-fetch browser saat pengguna
// memilih model neural, BUKAN training BPE tokenizer di runtime browser
// (terlalu lambat) - build-time step ini sama seperti migrate-*-domain.mjs
// dijalankan sekali, hasilnya disimpan sebagai aset statis.
//
// KORPUS: dibaca dari raget-corpus/raget_own_corpus.jsonl - dihasilkan oleh
// raget-tools/dataries-ke-korpus.mjs (jalankan skrip itu dulu kalau file ini
// belum ada atau sumber data berubah). Skrip ini SENGAJA tidak lagi
// mengumpulkan data sendiri secara terpisah (dulu ada gatherCorpus() yang
// duplikat logikanya dengan dataries-ke-korpus.mjs) - satu sumber kebenaran
// korpus, bukan dua jalur yang bisa berbeda diam-diam.
//
// CATATAN JUJUR: skipAutoTrain dipakai (bobot inisialisasi acak, TIDAK
// dilatih gradient descent) supaya build step ini cepat dan bisa diverifikasi
// end-to-end sekarang. Ini "struktur yang bisa diuji coba", bukan model yang
// sudah menghasilkan teks koheren - badge "Neural (Eksperimental)" di UI
// mencerminkan ini apa adanya. Pelatihan sungguhan (banyak epoch, korpus jauh
// lebih besar) adalah kerja lanjutan Fase C berikutnya - TIDAK dijalankan di
// skrip ini.
//
// Pakai: node raget/raget-tools/dataries-ke-korpus.mjs   (bangun/perbarui korpus)
//        node raget/raget-tools/build-neural-checkpoint.mjs   (bangun checkpoint)

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LLMCore } from '../raget-llm/neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'checkpoint-50m.json');
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

  console.log('\nMembangun model (preset small, ~50M parameter, skipAutoTrain - lihat catatan jujur di header)...');
  const t0 = Date.now();
  await LLMCore.initialize({
    corpus,
    configOptions: { preset: 'small' },
    skipAutoTrain: true,
  });
  console.log('Model dibangun dalam', ((Date.now() - t0) / 1000).toFixed(1), 'detik.');

  const stats = LLMCore.getStats();
  console.log('Stats:', JSON.stringify(stats, null, 2));

  console.log('\nMembangun checkpoint...');
  const checkpoint = LLMCore.buildCheckpointObject({
    source: 'raget-tools/build-neural-checkpoint.mjs',
    corpusSize: corpus.length,
    trained: false,
    createdAt: new Date().toISOString(),
  });

  mkdirSync(OUT_DIR, { recursive: true });
  const json = JSON.stringify(checkpoint);
  writeFileSync(OUT_FILE, json, 'utf8');
  console.log('Ditulis:', path.relative(ROOT, OUT_FILE), '-', (json.length / 1024 / 1024).toFixed(2), 'MB');
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
