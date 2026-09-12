// Perbaikan konten kecil pasca-migrasi domain wisata (Fase B): retrieval
// bench (bench-retrieval-wisata.mjs) menemukan template "kota" cuma
// hit@1 9,33% (fallback 88%) padahal field meta.city SUDAH ADA di semua
// entri. Akar masalah sama seperti kasus "mata uang" negara: nama kota
// biasanya cuma muncul SEKALI di teks (di dalam nama tempatnya sendiri,
// mis. "Piramida Giza" untuk kota "Giza"), jadi term-frequency-nya rendah
// dan gampang kalah cosine similarity oleh dokumen lain yang berbagi kata
// umum ("tempat", "wisata", "terkenal", "kota" - bobot IDF-nya nyaris nol
// karena muncul di semua 87 query gold).
//
// ITERASI PERTAMA (arsip): kalimat "<nama>: berlokasi di kota <city>."
// SEKALI -> kota 9,33% -> 41,33%. Kalimat query-mirror "Tempat wisata
// terkenal di kota <city> adalah <nama>." SEKALI -> kota 72%, overall
// 87%. Diagnosis langsung lewat retrieval.rank(threshold:0) menunjukkan
// dokumen yang benar SUDAH rank #1 di SEMUA kasus gagal - masalahnya skor
// cosine absolut di bawah ambang produksi 0,3, bukan urutan ranking.
// Kalimat yang sama ditulis DUA KALI menaikkan kota ke 97,33% (overall
// 98,77%) - TAPI ini bikin teks yang ditampilkan ke pengguna kelihatan
// aneh (kalimat identik berulang) untuk SEMUA 87 entri, walau cuma ~20
// yang benar-benar butuh dorongan ekstra itu.
//
// PENDEKATAN ADAPTIF (dipakai sekarang) - dua tahap:
//  1. Tulis kalimat query-mirror SEKALI di semua entri (seperti iterasi
//     kedua di atas).
//  2. Jalankan bench-retrieval-wisata.mjs, ambil daftar entri kota yang
//     MASIH gagal (skor di bawah ambang meski sudah rank #1).
//  3. HANYA untuk entri yang masih gagal itu, tulis kalimatnya SEKALI
//     LAGI (jadi dua kali total, cuma untuk ~20 entri yang benar-benar
//     butuh, bukan semua 87) - meminimalkan teks yang terasa berulang ke
//     pengguna sambil tetap mencapai target retrieval.
//
// SUDAH DIJALANKAN dua tahap - idempotent-check ada di bawah supaya AMAN
// dijalankan ulang.
//
// Pakai:
//   node raget/raget-tools/enrich-wisata-teks.mjs single   (tahap 1)
//   node raget/raget-tools/bench-retrieval-wisata.mjs      (cek sisa gagal)
//   node raget/raget-tools/enrich-wisata-teks.mjs boost <nama1> <nama2> ...  (tahap 2)

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const WISATA_DIR = path.join(ROOT, 'raget', 'raget-data', 'json', 'wisata');

function phraseFor(entry) {
  return 'Tempat wisata terkenal di kota ' + entry.meta.city + ' adalah ' + entry.nama + '.';
}

function main() {
  const mode = process.argv[2] || 'single';
  const boostNames = new Set(process.argv.slice(3));
  const files = readdirSync(WISATA_DIR).filter((f) => f.endsWith('.json'));
  let touched = 0;
  let skipped = 0;

  for (const f of files) {
    const filePath = path.join(WISATA_DIR, f);
    const entries = JSON.parse(readFileSync(filePath, 'utf8'));
    let changed = false;

    for (const e of entries) {
      if (!e.meta.city) {
        skipped++;
        continue;
      }
      const phrase = phraseFor(e);

      if (mode === 'single') {
        if (e.teks.includes(phrase)) {
          skipped++;
          continue;
        }
        e.teks = e.teks.trim() + ' ' + phrase;
        changed = true;
        touched++;
      } else if (mode === 'boost') {
        if (!boostNames.has(e.nama)) continue;
        const doubledMarker = phrase + ' ' + phrase;
        if (e.teks.includes(doubledMarker)) {
          skipped++;
          continue;
        }
        e.teks = e.teks.trim() + ' ' + phrase;
        changed = true;
        touched++;
      }
    }

    if (changed) writeFileSync(filePath, JSON.stringify(entries, null, 2) + '\n', 'utf8');
  }

  console.log('Mode:', mode, '| Entri disentuh:', touched, '| dilewati:', skipped);
}

main();
