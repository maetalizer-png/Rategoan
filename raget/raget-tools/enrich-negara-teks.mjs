// Perbaikan konten kecil pasca-migrasi domain negara (Fase B): retrieval
// bench (bench-retrieval.mjs) menemukan query "nama resmi" (16% hit@1) dan
// "mata uang" (28,8% hit@1) jauh lebih jeblok dari "ibu kota"/"populasi"
// (~62-63%). Sebabnya field meta.officialName dan meta.currency SUDAH ADA
// di data (dipakai 100% entri), tapi frasanya tidak pernah tersurat secara
// harfiah di field `teks` yang dicari mekanisme TF-IDF di
// raget-agents/dataries-bridge.js#datariesFallback() - jadi kata kunci
// "nama resmi"/"mata uang" di query pengguna tidak pernah cocok dengan kata
// apa pun di teks negara, walau jawabannya sebenarnya ADA di data.
//
// Perbaikannya BUKAN nulis ulang skema (masih {id, kategori, wilayah, nama,
// tags, teks, meta}), cuma menambah kalimat literal di akhir `teks` tiap
// entri negara: "Nama resmi: <officialName>." dan/atau "Mata uang:
// <currency> (<currencyCode>)." - field sumbernya (meta.officialName/
// currency/currencyCode) sudah 100% lengkap di 163 entri (diverifikasi
// sebelum dijalankan), jadi tidak ada data yang perlu dikarang.
//
// TEMUAN saat pertama dijalankan: SEMUA 163 teks aslinya SUDAH punya frasa
// "Mata uang: ..." (bukan "Nama resmi:") - makanya dua frasa dicek dan
// ditambah SECARA TERPISAH, bukan sepasang, supaya tidak menulis "Mata
// uang:" dobel untuk entri yang sudah punya.
//
// PASS KEDUA (setelah migrasi domain etika): retrieval bench "mata uang"
// masih 74,2% hit@1 walau frasa "Mata uang:" sudah ada di semua teks.
// Analisis akar masalah: kata "mata"/"uang" muncul di 100% dokumen negara,
// jadi bobot IDF-nya nyaris nol (term yang muncul di semua dokumen tidak
// membedakan apa pun secara statistik) - satu-satunya kata yang benar-benar
// membedakan di query "Mata uang apa yang dipakai <negara>?" adalah nama
// negaranya sendiri. Solusinya: naikkan frekuensi kemunculan nama negara
// TEPAT DI SAMPING info mata uang (bukan cuma di awal kalimat) lewat
// kalimat literal "<nama>: mata uang <currency> (<code>)." - ini menaikkan
// term-frequency nama negara di dokumennya sendiri, membantu skor cosine
// similarity clear ambang batas 0.3 tanpa mengubah mekanisme retrieval
// atau data sumber (masih meta.nama + meta.currency yang sudah ada).
//
// SUDAH DIJALANKAN - idempotent-check ada di bawah supaya AMAN dijalankan
// ulang (tidak menambah kalimat dobel kalau teks sudah punya frasa ini).
//
// Pakai: node raget/raget-tools/enrich-negara-teks.mjs

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const NEGARA_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'negara');

function main() {
  const files = readdirSync(NEGARA_DIR).filter((f) => f.endsWith('.json'));
  let touched = 0;
  let skipped = 0;

  for (const f of files) {
    const filePath = path.join(NEGARA_DIR, f);
    const entries = JSON.parse(readFileSync(filePath, 'utf8'));
    let changed = false;

    for (const e of entries) {
      const m = e.meta;
      const nameCurrencyPhrase = e.nama + ': mata uang ' + m.currency + ' (' + m.currencyCode + ').';
      let added = '';
      if (!e.teks.includes('Nama resmi:')) added += ' Nama resmi: ' + m.officialName + '.';
      if (!e.teks.includes('Mata uang:')) added += ' Mata uang: ' + m.currency + ' (' + m.currencyCode + ').';
      if (!e.teks.includes(nameCurrencyPhrase)) added += ' ' + nameCurrencyPhrase;
      if (!added) {
        skipped++;
        continue;
      }
      e.teks = e.teks.trim() + added;
      changed = true;
      touched++;
    }

    if (changed) writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  }

  console.log('Entri diperkaya:', touched, '| dilewati (sudah ada):', skipped);
}

main();
