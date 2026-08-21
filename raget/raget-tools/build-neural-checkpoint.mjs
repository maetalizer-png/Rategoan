// vNext Fase C: bangun korpus bootstrap dari data Rategoan sendiri (bukan
// scraping baru) dan hasilkan checkpoint awal untuk Raget Neural - transformer
// ~50 juta parameter yang diadaptasi dari kesempatan-os-/kesem-llm/ (lihat
// raget/raget-llm/neural/). Checkpoint ini yang di-fetch browser saat pengguna
// memilih model neural, BUKAN training BPE tokenizer di runtime browser
// (terlalu lambat) - build-time step ini sama seperti migrate-*-domain.mjs
// dijalankan sekali, hasilnya disimpan sebagai aset statis.
//
// CATATAN JUJUR: skipAutoTrain dipakai (bobot inisialisasi acak, TIDAK
// dilatih gradient descent) supaya build step ini cepat dan bisa diverifikasi
// end-to-end sekarang. Ini "struktur yang bisa diuji coba", bukan model yang
// sudah menghasilkan teks koheren - badge "Neural (Eksperimental)" di UI
// mencerminkan ini apa adanya. Pelatihan sungguhan (banyak epoch, korpus jauh
// lebih besar) adalah kerja lanjutan Fase C berikutnya.
//
// Pakai: node raget/raget-tools/build-neural-checkpoint.mjs

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LLMCore } from '../raget-llm/neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const OUT_DIR = path.join(ROOT, 'raget', 'raget-data', 'neural');
const OUT_FILE = path.join(OUT_DIR, 'checkpoint-50m.json');

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf8'));
}

function gatherCorpus() {
  const texts = [];

  // 1) raget-dataset/knowledge/*.json - factoid {subject,answer} dan FAQ-style {q,a}
  const knowDir = path.join(ROOT, 'raget', 'raget-dataset', 'knowledge');
  for (const f of readdirSync(knowDir).filter((f) => f.endsWith('.json'))) {
    const data = readJson(path.join(knowDir, f));
    if (!Array.isArray(data)) continue;
    for (const item of data) {
      if (item.subject && item.answer) texts.push(item.subject.charAt(0).toUpperCase() + item.subject.slice(1) + ': ' + item.answer);
      if (item.q && item.a) { texts.push(item.q); texts.push(item.a); }
      if (item.text) texts.push(item.text);
    }
  }

  // 2) fewshot.json - dialog {q,a} - materi percakapan asli Rategoan
  const fewshot = readJson(path.join(ROOT, 'raget', 'raget-dataset', 'fewshot.json'));
  for (const item of fewshot) {
    if (item.q) texts.push(item.q);
    if (item.a) texts.push(item.a);
  }

  // 3) raget-data/*/*.json (domain yang sudah dimigrasi skema tunggal Fase B) - field teks
  const dataDir = path.join(ROOT, 'raget', 'raget-data');
  for (const domain of readdirSync(dataDir, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const domainDir = path.join(dataDir, domain.name);
    for (const f of readdirSync(domainDir).filter((f) => f.endsWith('.json'))) {
      const data = readJson(path.join(domainDir, f));
      if (!Array.isArray(data)) continue;
      for (const entry of data) {
        if (entry.teks) texts.push(entry.teks);
      }
    }
  }

  return texts.filter((t) => typeof t === 'string' && t.trim().length > 0);
}

async function main() {
  console.log('Mengumpulkan korpus dari data Rategoan sendiri...');
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
