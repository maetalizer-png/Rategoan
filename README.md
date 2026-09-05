# Rategoan

<p>
  <img alt="100% Local-First" src="https://img.shields.io/badge/AI-100%25%20Local--First-2ea44f?style=flat-square">
  <img alt="No Backend" src="https://img.shields.io/badge/backend-none-blue?style=flat-square">
  <img alt="No Build Step" src="https://img.shields.io/badge/build%20step-none-blue?style=flat-square">
  <img alt="PWA" src="https://img.shields.io/badge/type-PWA-informational?style=flat-square">
  <img alt="Bench" src="https://img.shields.io/badge/bench-1180%20kasus%20core--suite%20%7C%2099.66%25%20lolos-success?style=flat-square">
  <img alt="License" src="https://img.shields.io/badge/license-RATEGOAN%20v1.0-blue?style=flat-square">
</p>

Chat AI 100% local-first — tanpa server, tanpa API key, tanpa biaya per-pesan.
Seluruh percakapan, memori, dan basis pengetahuan berjalan langsung di
perangkat pengguna lewat Progressive Web App (PWA) murni HTML/CSS/JavaScript
modular (ES6 Modules), tanpa framework dan tanpa build step.

Repo ini adalah **RATEGOAN**, kerangka chat inti dengan **Raget**, mesin
balasan template/rule-based (bukan model bahasa besar).

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
  pengetahuan sepenuhnya ada di file `.json` di `raget-data/json/`, bisa diganti tanpa
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
- **Tersimpan** — pesan & balasan AI yang disimpan manual dari chat, dengan
  tag dan catatan pribadi, dicari dan diekspor (Markdown/JSON).
- **Perpustakaan** — semua yang Raget ingat otomatis: catatan yang diminta
  diingat, fakta pribadi/diajarkan, dan chunk file yang diimpor
  (PDF/Notion/Evernote/WhatsApp).
- **Artefak** — hasil kerja yang muncul otomatis dari chat (draf email,
  kartu negara, ekspor catatan) tanpa perlu tap Simpan.

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
  raget-data/                     sumber data resmi (skema JSON tunggal Fase B)
                                     json/ 21+ domain (negara,kota,tokoh,sapaan,…) · jsonl/ korpus · neural/ checkpoint
  raget-tools/                    skrip verifikasi: bench runner (+bench.json), pengukuran KV, devlog, migrasi data
vault/                            fitur opt-in: pengingat, kalender, ekspor, importer
docs/                             status korpus/lisensi, kapabilitas, struktur data
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

`raget/raget-data/json/` adalah **satu-satunya** sumber data domain (folder `raget-dataries/` JS legacy sudah dihapus).
Loader: `raget-agents/dataries-registry.js` (fetch JSON → bentuk `{text, metadata}` untuk bridge).
Domain antara lain: negara, kota, bahasa, tokoh, sains, sejarah, wisata, kuliner/makanan,
olahraga, etika, minuman, platform, ekonomi, peluang, penemuan, alam, seni-budaya,
plus `obrolan-ringan/` untuk template chat. `sapaan/` (sapaan/smalltalk harian) dimuat
sendiri oleh `raget-llm/llm-engine.js` (fetch langsung, bukan lewat dataries-registry.js) —
folder `greeting/` yang dulu ada di sampingnya sudah dihapus karena isinya duplikat penuh
dari `sapaan/` dan tidak pernah dibaca kode manapun.
`json/pengetahuan/` = factoid umum. Korpus train neural = 3 rak Release kanonik (K1
`korpus-ensiklopedia-bersih`, K2 `korpus-dialog-daerah-bersih`, K3 `korpus-pelengkap-bersih`,
aturan lengkap di [`PRD.md`](PRD.md) §2). Token training yang valid hanya dari 3 rak itu,
angka terbaru di `korpus-manifest-total.json`. Checkpoint neural 100M ada di
GitHub Release (`checkpoint-100m`); checkpoint 200M yang dipakai browser ada di
Hugging Face Hub (`huggingface.co/Maetalizer19/rategoan-neural`) karena
GitHub Release tidak mengirim header CORS. Tidak ada tag `panen-*`.

**Migrasi skema data (vNext Fase B)**: domain data yang tadinya array literal di dalam file
`.js` (mencampur data dan logika) dipindah bertahap ke satu skema JSON standar
(`{id, kategori, wilayah, nama, tags, teks, meta}`) di `raget/raget-data/json/`, dengan
`raget-agents/dataries-registry.js`/`*-store.js`/`llm-engine.js` yang tersisa hanya jadi loader tipis
(fetch + fungsi query, nol data literal). 15 domain sudah dimigrasi: tokoh, kuliner, hari
internasional, sapaan, negara, kota, bahasa, etika, minuman, wisata, sejarah, makanan, alam,
sains, dan olahraga — pola migrasinya didokumentasikan di
`raget/raget-tools/migrate-*-domain.mjs` untuk dipakai ulang di domain berikutnya.

**Korpus milik sendiri**: `raget/raget-tools/dataries-ke-korpus.mjs` merender seluruh data
di atas (plus `raget-data/json/pengetahuan/*`, `raget-devlog/json/{fewshot,persona}.json`) jadi
`raget/raget-data/jsonl/raget_own_corpus.jsonl` — 3.543 baris, ±104.728 token perkiraan kasar.
`raget-tools/bench.json` dan `raget-devlog/json/metadata/answer-rules.json` sengaja dilewati
(alasannya di komentar header skrip) supaya korpus tidak berisi data latih yang dikarang.

## RAGET Neural (belum aktif menjawab)

Satu nama tampil ke pengguna: **RAGET** — tidak ada lagi pemilih model. Di balik layar
ada mesin neural — keluarga transformer yang ditulis dari nol dalam JavaScript murni
(bukan wrapper provider apa pun), diadaptasi dari proyek sepupu
[kesempatan-os-](https://github.com/maetalizer-png/kesempatan-os-) (`kesem-llm/`) ke
`raget/raget-llm/neural/`, dengan cascade otomatis 200M → 100M → 50M
(`raget/raget-llm/neural-provider.js`) — checkpoint 200M diambil diam-diam di
background saat app dibuka dan di-cache browser, tanpa pengguna klik apa pun.

**Status jujur saat ini**: bobotnya **SUDAH dilatih nyata** (bukan inisialisasi acak),
held-out perplexity turun konsisten tiap ronde training (lihat
`raget-devlog/neural/training-report-*.json` per checkpoint) — bukti model memang belajar
sesuatu — **tapi output generasi masih berupa rangkaian kata belum gramatikal** di semua
ukuran, model belum pernah melihat seluruh korpus satu putaran penuh. Karena itu cascade-nya
sudah lengkap dan aktif prefetch di background, tapi **belum dipakai untuk menjawab** —
`js/ai/ai.js` punya satu flag (`NEURAL_ANSWERS_ENABLED`, saat ini `false`) yang mengunci
jawaban tetap dari mesin template (rule-based) sampai generasi benar-benar koheren, bukan
cuma PPL rendah. Lihat [`PRD.md`](PRD.md) §1 untuk status terbaru.

Checkpoint 50/100M ada di `raget/raget-data/neural/`. Checkpoint 200M ada di
Hugging Face Hub (`huggingface.co/Maetalizer19/rategoan-neural`).

Rencana lanjutan ada di [`PRD.md`](PRD.md) §7 dan `raget/raget-tools/CHECKPOINT-POLICY.md`.

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
   kasus** core-suite dengan target lolos ≥97% (**99,7% — 1.176/1.180**
   per 2026-09-04, 0 error konsol), plus 10 kasus stub informatif (butuh
   attach file nyata, tidak dihitung ke target). 4 kegagalan tercatat dan
   diklasifikasi di [`PRD.md`](PRD.md) §1 (bukan disembunyikan).

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

## Kustomisasi

Rategoan dirancang agar bisa diubah jadi produk lain hanya lewat file data,
tanpa menyentuh kode:

- **Identitas & gaya bicara** → `raget/raget-devlog/json/persona.json`
- **Basis pengetahuan** → `raget/raget-data/json/` (domain terstruktur) dan `raget/raget-data/json/pengetahuan/`

Ketentuan penggunaan dan lisensi ada di [`LICENSE.md`](LICENSE.md).

## Status

**Perubahan terbaru (2026-09-05):** ekstrak file diperluas ke 15+ format
umum (txt/md/csv/tsv/json/xml/html/log/yaml/srt/rtf/ics/enex/pdf/zip),
bug filter superlatif per-benua ("negara terkecil di Eropa") dibetulkan,
fitur Pitutur dipindah ke branch terpisah (`fitur/pitutur-mandiri`),
data pengetahuan Indonesia (kosakata + sektor bisnis) ditambah dan
disambungkan ke pencarian topik, dan logo diganti teks polos.

Kerangka aplikasi dan otak AI Raget sudah dalam tahap pengembangan
aktif dan berfungsi penuh secara lokal, dengan deployment produksi terverifikasi
berjalan di Vercel. Pengembangan berjalan dalam ronde inkremental yang
masing-masing didokumentasikan di `raget/raget-devlog/` — riwayat lengkapnya,
termasuk kelemahan yang belum tuntas, tercatat apa adanya di sana.

**Status kerja, aturan mengikat data Release, dan antrian ronde pengembangan** — satu
dokumen tunggal, tidak dipecah — ada di [`PRD.md`](PRD.md).
