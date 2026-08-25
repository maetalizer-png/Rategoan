# Rategoan

<p>
  <img alt="100% Local-First" src="https://img.shields.io/badge/AI-100%25%20Local--First-2ea44f?style=flat-square">
  <img alt="No Backend" src="https://img.shields.io/badge/backend-none-blue?style=flat-square">
  <img alt="No Build Step" src="https://img.shields.io/badge/build%20step-none-blue?style=flat-square">
  <img alt="PWA" src="https://img.shields.io/badge/type-PWA-informational?style=flat-square">
  <img alt="Bench" src="https://img.shields.io/badge/bench-1180%20kasus%20core--suite%20%7C%20100%25%20lolos-success?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-starter%20kit%20(personal%2Fkomersial)-lightgrey?style=flat-square">
</p>

Chat AI 100% local-first — tanpa server, tanpa API key, tanpa biaya per-pesan.
Seluruh percakapan, memori, dan basis pengetahuan berjalan langsung di
perangkat pengguna lewat Progressive Web App (PWA) murni HTML/CSS/JavaScript
modular (ES6 Modules), tanpa framework dan tanpa build step.

Satu repo ini berisi dua produk yang saling terhubung:

| Produk | Deskripsi |
|---|---|
| **Rategoan** | Kerangka chat inti dengan **Raget**, mesin balasan template/rule-based (bukan model bahasa besar). |
| **Pitutur** | PWA turunan berdiri sendiri di [`fitur/pitutur/`](fitur/pitutur/), studio siaran audio yang membaca sumber data yang sama. |

## Daftar Isi

- [Prinsip Desain](#prinsip-desain)
- [Fitur](#fitur)
- [Arsitektur](#arsitektur)
- [Basis Data](#basis-data)
- [Kualitas & Pengujian](#kualitas--pengujian)
- [Menjalankan](#menjalankan)
- [Kustomisasi](#kustomisasi)
- [Status](#status)

## Prinsip Desain

- **100% lokal** — tidak ada panggilan API AI berbayar untuk fitur inti; data
  percakapan tidak pernah meninggalkan perangkat.
- **Deterministik & jujur** — balasan dihasilkan dari pencocokan pola dan data
  terstruktur, bukan generasi probabilistik; saat tidak tahu, mengaku tidak
  tahu alih-alih mengarang.
- **Data terpisah dari kode** — kepribadian, gaya bicara, dan basis
  pengetahuan sepenuhnya ada di file `.json`/`.js`, bisa diganti tanpa
  menyentuh logic aplikasi.
- **Diverifikasi dengan angka nyata** — setiap perubahan diuji lewat suite
  bench otomatis (Playwright) sebelum dianggap selesai, bukan diasumsikan
  benar.

## Fitur

**Percakapan**
- Riwayat chat tersimpan lokal (IndexedDB), pencarian lintas riwayat & catatan.
- Animasi ketik natural, mode hemat (reduced motion), tema terang/gelap/otomatis.
- Text-to-Speech dan input suara (bila didukung perangkat).
- Ekspor catatan ke PDF/Markdown, impor dari PDF/Notion/Evernote/WhatsApp (opt-in).
- Sapaan harian dinamis yang menyapa nama pengguna yang sedang login.

**Otak AI (Raget)**
- Router intent yang mencoba serangkaian tool khusus sebelum jatuh ke jawaban
  umum: matematika (termasuk soal cerita), pengingat, tanggal, faktual
  dua-bahasa, kuis, dan lebih.
- Toleransi typo, gaya jawaban adaptif, follow-up percakapan yang menjaga
  konteks entitas antar-giliran, termasuk kontinuitas nada emosi (positif
  maupun negatif) lintas beberapa giliran.
- Mode "terapkan" interaktif untuk kerangka berpikir (Decision Matrix, 5
  Whys, SWOT) — bukan cuma menjelaskan definisinya, tapi benar-benar
  menjalankan langkah-langkahnya bareng pengguna lewat sesi tanya-jawab.
- Skor kualitas (Q) yang dihitung dari lima komponen terukur: Akurasi (dari
  feedback nyata), Kekayaan, Utilitas, Kedalaman, Variasi.

**Koleksi**
- Ruang simpan pribadi untuk catatan, tautan, dan hasil chat yang ingin
  disimpan di luar riwayat percakapan.

  offline pack untuk data penting saat tanpa koneksi.

## Arsitektur

```
index.html, css/, js/            kerangka aplikasi (UI, state, riwayat, akun)
js/ai/                            satu-satunya pintu integrasi ke otak AI
utils/                            util murni bersama (dipakai lintas raget/)
raget/                            induk seluruh otak AI Raget
  raget-agents/                   router intent + orkestrasi tool + mesin khusus
  raget-llm/                      mesin balasan (template default + Raget Neural eksperimental, lihat di bawah)
  raget-memory/                   memori jangka pendek (konteks) & jangka panjang (fakta)
  raget-database/                 riwayat catatan Q&A lokal (untuk feedback loop)
  raget-retrieval/                pencarian TF-IDF satu pintu lintas sumber
  raget-devlog/                   riwayat pengembangan proyek (dipakai balasan chat)
                                     json/ persona,fewshot,metadata · jsonl/ arsitektur,bug,keputusan,ux · neural/ laporan training · sejarah/, index.js
  raget-dataries/                 folder DATA murni (negara, kota, bahasa, tokoh, dst; loader di raget-agents/)
  raget-data/                     data dunia dalam skema JSON tunggal
                                     json/ domain+knowledge/ · jsonl/ korpus+languages.jsonl · neural/ checkpoint .safetensors
  raget-tools/                    skrip verifikasi: bench runner (+bench.json), pengukuran KV, devlog, migrasi data
vault/                            fitur opt-in: pengingat, kalender, ekspor, importer
fitur/                            PWA turunan berdiri sendiri
  pitutur/                          studio siaran audio
docs/                             panduan kustomisasi & lisensi (starter kit)
```

### Alur satu pesan

```
Pesan pengguna
  → raget-memory (konteks percakapan + fakta jangka panjang)
  → raget-agents (router intent → deret mesin khusus, lihat di bawah)
  → raget-llm (fallback: pencocokan pola template)
  → post-processing (rapikan teks, jawaban jujur bila kosong)
  → tampil sebagai balasan + tersimpan ke raget-database
```

`raget/raget-agents/agent.js` mengorkestrasi lebih dari selusin mesin khusus,
masing-masing dicoba berurutan sebelum jatuh ke fallback umum:

| Mesin | Cakupan |
|---|---|
| `math-engine.js` | Parser matematika aman (tanpa `eval`): aritmatika, konversi satuan/mata uang, soal cerita harga & persen |
| `bilingual.js` | Deteksi ID/EN, faktual dan terjemahan frasa dasar dua bahasa |
| `knowledge-graph.js` | Deskripsi negara adaptif, follow-up dialog lintas giliran |
| `answer-composer.js` | Koreksi typo (Levenshtein + fonetik) |
| `stem-engine.js` | Aljabar, geometri, statistika, kalkulus ringan, fisika, konsep teknologi, biologi |
| `social-engine.js` | Intent sosial (curhat, diskusi, humor, motivasi), kerangka customer service |
| `context-engine.js` | Sapaan sadar-waktu, klasifikasi situasi, deteksi darurat dengan hotline, kontinuitas emosi lintas giliran |
| `intelligence-rumus.js` | Perpustakaan kerangka berpikir/keputusan/belajar (SWOT, 5 Whys, Decision Matrix, dst) |
| `framework-apply.js` | Mode "terapkan" interaktif untuk Decision Matrix, 5 Whys, dan SWOT — sesi tanya-jawab bertahap |
| `tokoh-store.js` | Profil tokoh publik terstruktur (pencapaian, kutipan, trivia, relasi) — 236 entri |
| `kuliner-store.js` | Basis data kuliner dunia terstruktur (asal, bahan utama, trivia), dipecah per-region — 143 entri |
| `daily-briefing.js` | Ringkasan harian personal (acara, pengingat) dengan sapaan dinamis sesuai nama pengguna |
| `feedback-store.js` | Statistik suka/tidak-suka nyata untuk komponen Akurasi (A) |

## Basis Data

`raget/raget-data/json/` berisi lebih dari 1.000 entri terstruktur lintas kategori: negara,
kota, bahasa, tokoh, sains, sejarah, kuliner, olahraga, etika budaya per
negara, dan lainnya — dapat diperluas atau diganti total tanpa menyentuh kode.
`raget/raget-data/json/knowledge/` menyimpan pengetahuan umum berformat factoid sederhana
yang dimuat lewat pencarian satu-pintu. Lihat [`docs/DATA-STRUCTURE.md`](docs/DATA-STRUCTURE.md)
untuk peta lengkap struktur data (dua akar `raget-data/`/`raget-devlog/`, tiga subfolder
`json/`/`jsonl/`/`neural/`, dan dua jalur baca yang masih hidup berdampingan).

**Migrasi skema data (vNext Fase B)**: domain data yang tadinya array literal di dalam file
`.js` (mencampur data dan logika) dipindah bertahap ke satu skema JSON standar
(`{id, kategori, wilayah, nama, tags, teks, meta}`) di `raget/raget-data/json/`, dengan
`raget-agents/dataries-registry.js`/`*-store.js`/`llm-engine.js` yang tersisa hanya jadi loader tipis
(fetch + fungsi query, nol data literal). 15 domain sudah dimigrasi: tokoh, kuliner, hari
internasional, sapaan, negara, kota, bahasa, etika, minuman, wisata, sejarah, makanan, alam,
sains, dan olahraga — pola migrasinya didokumentasikan di
`raget/raget-tools/migrate-*-domain.mjs` untuk dipakai ulang di domain berikutnya.

**Korpus milik sendiri**: `raget/raget-tools/dataries-ke-korpus.mjs` merender seluruh data
di atas (plus `raget-data/json/knowledge/*`, `raget-devlog/json/{fewshot,persona}.json`) jadi
`raget/raget-data/jsonl/raget_own_corpus.jsonl` — 3.543 baris, ±104.728 token perkiraan kasar.
`raget-tools/bench.json` dan `raget-devlog/json/metadata/answer-rules.json` sengaja dilewati
(alasannya di komentar header skrip) supaya korpus tidak berisi data latih yang dikarang.

## Raget Neural (Eksperimental)

Selain mesin template default, tersedia **Raget Neural** — keluarga transformer yang ditulis
dari nol dalam JavaScript murni (bukan wrapper provider apa pun), diadaptasi dari proyek
sepupu [kesempatan-os-](https://github.com/maetalizer-png/kesempatan-os-) (`kesem-llm/`) ke
`raget/raget-llm/neural/`. Bisa dicoba lewat pemilih model (ikon kotak di composer) —
**opt-in**, mesin template tetap default dan berjalan tanpa perubahan apa pun.

**Status jujur saat ini**: bobot **SUDAH dilatih nyata** (bukan inisialisasi acak) - tier
"lokal-ringan" (50M, default) dan "lokal-berat" (100M) sama-sama memuat checkpoint keluarga
`massive*` (vocab BPE 30.368 satu tokenizer untuk semua ukuran) hasil training gradient
descent sungguhan pada korpus gabungan Rategoan (ribuan step, lihat
`raget-devlog/neural/training-report-*.json` per checkpoint untuk angka pasti). Output
sudah gramatikal (kalimat Bahasa Indonesia bersambung, tanda baca wajar) tapi **belum akurat
secara faktual** dan belum konvergen penuh - training lanjutan berjalan lewat Colab GPU
(`raget-tools/colab-train-gpu.ipynb`), bukan di browser. Label "Neural Lokal (Eksperimental)"
di UI tetap dipertahankan karena kualitas belum lulus gerbang produksi, bukan karena bobotnya
acak.

```
node raget/raget-tools/build-neural-checkpoint.mjs   # bangun ulang checkpoint dari korpus Rategoan
```

Rencana lanjutan (training lebih banyak step, korpus lebih besar, gerbang kualitas sebelum
label eksperimental dilepas) ada di roadmap vNext dan `raget-tools/CHECKPOINT-POLICY.md`.

## Kualitas & Pengujian

Setiap perubahan lewat dua gerbang berurutan sebelum dianggap selesai:

1. **Lint/syntax** (`raget/raget-tools/lint-check.mjs`) — `node --check` di
   seluruh 307 file `.js`/`.mjs` (menangkap error yang gagal total di
   runtime browser walau lolos review manual) + ESLint dengan
   `eslint.config.mjs` beraturan correctness-only (variabel tak
   terdefinisi, import/export salah, dead code jelas — bukan gaya
   penulisan, supaya gerbang ini tidak memicu perombakan gaya di 300+ file
   yang sudah berjalan). Tanpa dependency `@eslint/js`/`globals`, konsisten
   dengan prinsip "tanpa build step" — ini murni alat verifikasi dev-time.
2. **Bench Playwright** (`raget/raget-tools/run-bench.mjs`) — **1.180
   kasus** core-suite dengan target lolos ≥97% (saat ini 100%), plus 10
   kasus stub informatif (butuh attach file nyata, tidak dihitung ke
   target).

Skor kualitas gabungan (Q) dan komponen K/A/U/D/V diukur lewat
`raget/raget-tools/measure-kv.mjs` dengan komposisi 100 kueri tetap agar
hasil antar-perubahan bisa dibandingkan apel-ke-apel — skor terakhir **Q=82**.

```
npm run lint     # atau: node raget/raget-tools/lint-check.mjs
npm run bench    # atau: node raget/raget-tools/run-bench.mjs http://localhost:8099
npm run measure-kv
```

Riwayat lengkap perubahan, keputusan desain, dan kelemahan yang jujur
dilaporkan (bukan disembunyikan) tersimpan di `raget/raget-devlog/` (18 entri,
92 commit) dan bisa ditanyakan langsung ke Raget lewat chat (mis. "sejarahmu",
"perkembangan skormu").

## Menjalankan

JavaScript diorganisir sebagai ES6 Modules, sehingga wajib diakses lewat
server HTTP (bukan `file://`):

```bash
python3 -m http.server 8099
# atau
npx http-server -p 8099
```

Lalu buka `http://localhost:8099/index.html`.

Untuk Pitutur, buka `http://localhost:8099/fitur/pitutur/index.html`.

## Kustomisasi

Rategoan dirancang agar bisa diubah jadi produk lain hanya lewat file data,
tanpa menyentuh kode:

- **Identitas & gaya bicara** → `raget/raget-devlog/json/persona.json`
- **Basis pengetahuan** → `raget/raget-data/json/` (domain terstruktur) dan `raget/raget-data/json/knowledge/`

Panduan lengkap kustomisasi ada di [`docs/STARTER-KIT.md`](docs/STARTER-KIT.md).
Ketentuan penggunaan dan lisensi ada di [`docs/LICENSE-KIT.md`](docs/LICENSE-KIT.md).

## Status

Kerangka aplikasi dan otak AI Raget sudah dalam tahap pengembangan
aktif dan berfungsi penuh secara lokal, dengan deployment produksi terverifikasi
berjalan di Vercel. Pengembangan berjalan dalam ronde inkremental yang
masing-masing didokumentasikan di `raget/raget-devlog/` — riwayat lengkapnya,
termasuk kelemahan yang belum tuntas dan rencana lanjutan, tercatat apa
adanya di sana alih-alih di roadmap statis yang cepat basi.
