# PRD — Pengembangan Lanjutan Raget Neural (Roadmap Skala 50M → 40B)

Status: roadmap aktif — **Fase A.1 (audit token korpus) dan A.1b (growth
plan, analisis) SELESAI** (lihat §2b), hasilnya sudah mengubah urutan
prioritas Fase A (lihat §2-3): korpus, bukan compute, adalah penghambat
dominan untuk scaling — dan Wikipedia ID BUKAN sumber pertumbuhan lagi
(sudah habis digali dua kali, terbukti dari manifest nyata). Sebagian besar
fase jauh ke depan bersifat **spekulatif secara sengaja** dan
mensyaratkan keputusan produk eksplisit sebelum dieksekusi (dicatat
jelas di tiap fase). Cakupan PRD
ini CUMA `raget-neural/` + tooling training/eval-nya. Perubahan Template
di luar cakupan ini — lihat `PRD-RAGET-TEMPLATE.md`. Aturan kerja
lintas-sektor: `PRD-ATURAN-KERJA.md`, WAJIB dibaca dulu.

**Prinsip yang tidak bisa ditawar**: seluruh roadmap ini tentang
membesarkan arsitektur transformer JS/PyTorch **milik RATEGOAN
sendiri** (`raget-neural/`, ditulis dari nol — attention, tokenizer,
trainer, semua sendiri). TIDAK ADA bagian dari PRD ini yang berarti
mengunduh/menyematkan model bahasa pihak ketiga (Llama/Qwen/dst) —
jalur itu sudah dievaluasi dan diputuskan TIDAK dikejar (bukti kegagalan
hardware nyata di eksperimen terpisah `gawean-app`: `VK_ERROR_DEVICE_LOST`,
limit GPU buffer 512MB, model 360M pihak ketiga pun gagal — lihat
`docs/ARSITEKTUR.md`).

## 1. Kondisi nyata hari ini

Preset yang sudah ada (`raget-neural/llm-config.js`, dicek langsung dari kode):

| Preset | dModel | nLayers | nHeads | dFF | vocabSize | Param nameplate |
|---|---:|---:|---:|---:|---:|---:|
| tiny | 128 | 4 | 4 | 512 | 8.000 | 2.839.296 |
| massive50m | 512 | 6 | 8 | 2048 | 30.368 | 49.999.872 |
| massive100m | 768 | 8 | 12 | 3072 | 30.368 | 103.325.184 |
| massive200m | 1024 | 11 | 16 | 4096 | 30.368 | 200.709.120 |

Hasil training terbaru (`raget-devlog/neural/training-report-*-round8-colab-gpu.json`):

| Preset | Held-out PPL sebelum sesi | Held-out PPL akhir |
|---|---:|---:|
| massive50m | 331.05 | **141.90** |
| massive100m | 1272.30 | 525.05 |
| massive200m | 426.93 | **825.55** |

**Temuan penting yang harus jadi dasar roadmap, bukan diabaikan**:
model yang LEBIH BESAR (massive200m) berakhir dengan PPL held-out LEBIH
BURUK daripada model yang lebih kecil (massive50m). Ini indikasi kuat
model besar saat ini **kekurangan data dan/atau compute untuk ukurannya**
(undertrained), bukan cuma "belum koheren karena masih kecil". Menaikkan
ukuran parameter tanpa menaikkan data+compute sebanding akan
memperparah, bukan memperbaiki, masalah ini — inilah alasan §2 di bawah
menaruh syarat data/compute SEBELUM syarat ukuran model di tiap fase.

Training berjalan di GPU gratis Colab (skrip JS murni `train-*.mjs` dan
jalur PyTorch `train-massive50m-torch.py` sudah ada preseden). Inference
berjalan CPU-JS/WebGPU murni di browser lewat `neural-provider.js`
(cascade unduh 200M→100M→50M). Checkpoint disimpan `.safetensors`
kuantisasi int8 (matriks) + F32 (bias/LayerNorm), embedding di-tie
dengan output projection.

## 2. Kenyataan teknis yang harus dihadapi jujur SEBELUM bicara 1B–40B

1. **Data — SUDAH DIAUDIT (`raget-tools/audit-corpus-tokens.mjs`)**:
   korpus kanonik hari ini (K1+K2+K3, `korpus-manifest-total.json`, token
   BPE resmi vocab 30.368) = **543.202.593 token** dari 1.497.515 dokumen.
   Dengan rasio scaling ~20 token/parameter:

   | Target | Token ideal | % tercukupi hari ini | Korpus harus tumbuh |
   |---|---:|---:|---:|
   | massive50m (ada) | 1,00 miliar | 54,3% | - |
   | massive100m (ada) | 2,07 miliar | 26,3% | - |
   | massive200m (ada) | 4,01 miliar | 13,5% | - |
   | 500M | 10 miliar | 5,43% | 18,4x |
   | 1B | 20 miliar | 2,72% | 36,8x |
   | 4B | 80 miliar | 0,68% | 147,3x |
   | 10B | 200 miliar | 0,27% | 368,2x |
   | 20B | 400 miliar | 0,14% | 736,4x |
   | 40B | 800 miliar | 0,07% | 1.472,7x |

   **Ini bukti kuantitatif, bukan dugaan lagi**, untuk temuan PPL di §1:
   massive200m (13,5% tercukupi) jauh lebih kekurangan data secara
   proporsional daripada massive50m (54,3% tercukupi) - urutan
   kecukupan data PERSIS SAMA dengan urutan kualitas PPL. **Korpus,
   bukan compute, adalah penghambat DOMINAN** — bahkan lompatan
   terdekat (500M) butuh korpus 18,4x lebih besar dari hari ini.
2. **Compute**: Colab gratis (kuota harian, sesi terbatas ~12 jam) SUDAH
   jadi batas nyata di preset 200M (lihat temuan PPL di atas — 200M
   dengan compute yang sama saja belum konvergen baik). Melatih 1B+ dari
   nol dalam waktu wajar REALISTANYA butuh GPU dedicated berbayar
   (Colab Pro/cloud) — PRD ini tidak mengasumsikan budget tersedia,
   cuma mencatatnya sebagai syarat yang harus disetujui secara eksplisit
   sebelum FASE B dimulai.
3. **Inference di browser**: WebGPU/WASM murni JS untuk model >1B
   kemungkinan besar TIDAK bisa jalan wajar di perangkat rata-rata.
   Preseden nyata dari eksperimen terpisah `gawean-app`: model pihak
   ketiga 360M pun gagal keras di Android nyata karena limit GPU buffer
   512MB. Maka strategi INFERENCE untuk model besar harus dipikirkan
   TERPISAH dari strategi TRAINING — lihat FASE B/C.

## 2b. Growth plan korpus — bukti lengkap (Fase A.1b, dicek 2026-09-09)

**(a) Wikipedia ID — sumur ini sudah nyaris kering, BUKAN peluang.**
Bukti dari `raget-data/jsonl/external/korpus-jilid1-round10-manifest.json`:
dump `idwiki-latest-pages-articles.xml.bz2` (1.232.894.346 byte) diproses
**SELURUHNYA sampai habis** ("Dump HABIS diproses sebelum lantai 300 juta
kata tercapai... seluruh 1.874.320 halaman `<page>` dalam dump sudah
diproses") — 683.516 artikel disimpan, menghasilkan ~307 juta token
(window126). Bukti kedua dari `korpus-manifest-total.json` (harvest
terpisah oleh Grok, tag `panen-wikipedia-id`): dari 561.195 dokumen
Wikipedia yang di-scan ulang, **238.873 duplikat + 247.251 terlalu
pendek dibuang — cuma 76.071 (13,4%) yang benar-benar unik** dan
digabung ke K1. Dua proses ekstraksi independen konvergen ke overlap
86,6% — ini pola khas sumber yang sudah HABIS digali, bukan "belum
ter-crawl penuh" seperti draf awal fase ini menduga (koreksi jujur atas
kesalahan asumsi sebelumnya).

**(b) Dua Release "penampung" — nyata tapi kecil.** Dicek langsung lewat
GitHub API (bukan browser_download_url yang 404 di sandbox ini — lihat
`PRD-RELEASE.md` §0):

| Tag | Isi | Ukuran (gzip) | Status |
|---|---|---:|---|
| `korpus-sejarah-indonesia-bersih` | Sejarah Indonesia, CC-BY-SA | 564.158 byte (≈0,54 MiB) | "Belum digabung K1" (body Release, verbatim) |
| `korpus-mentah-id` | 3 file: dump daerah mentah, kamus ID, wiki ID mentah | 3.617.641 + 2.853.681 + 1.515.380 = 7.986.702 byte (≈7,62 MiB) | "Belum sort" (body Release, verbatim) |

Estimasi kasar token (gzip teks Indonesia biasanya rasio kompresi
~3-3,5x, BPE vocab proyek ini ~3,5-4 karakter/token — **ESTIMASI, bukan
angka pasti**, butuh tokenisasi nyata untuk kepastian): gabungan kedua
Release ini paling banter setara **5-9 juta token**. Dibanding
kekurangan 9,46 miliar token untuk target 500M (10 miliar - 543,2 juta
yang sudah ada), ini **~0,05-0,1% dari gap** — kontribusi nyata tapi
jauh dari cukup untuk jadi solusi utama.

**(c) Kesimpulan growth plan**: satu-satunya jalur yang secara matematis
bisa menutup gap 18,4x adalah korpus berskala Common Crawl/OSCAR (ratusan
juta-miliaran dokumen), BUKAN crawl tambahan Wikipedia (sudah habis) atau
Release penampung kecil (kontribusi <0,1%). Preseden `panen-madlad400-id`
GAGAL (18,7% spam) menunjukkan filter kualitas untuk sumber sebesar itu
HARUS jauh lebih ketat — pola yang TERBUKTI berhasil di proyek ini adalah
dedup fingerprint ala `panen-wikipedia-id` (buang duplikat exact +
dokumen terlalu pendek, rasio buang 86,6% di Wikipedia yang notabene
sudah bersih), yang untuk Common Crawl (jauh lebih kotor) perlu ditambah
minimal: filter deteksi bahasa (confidence tinggi, bukan cuma heuristik
kata), filter perplexity pakai model kecil yang sudah ada, dan sampling
rate awal kecil (uji filter di 1-5% dump dulu, ukur spam rate, baru
scale up) — bukan langsung memproses dump penuh seperti kegagalan
`panen-madlad400-id`. **Eksekusi crawl Common Crawl skala besar itu
sendiri di luar cakupan realistis satu sesi kerja** (butuh infrastruktur
download+filter+verifikasi terpisah) — growth plan ini menutup A.1b
dengan mengidentifikasi jalur yang benar dan alasan kuantitatifnya,
bukan dengan mengeksekusinya.

## 3. Roadmap berfase menuju skala lebih besar

### FASE A — 500M sampai 1B (jembatan, syarat dulu sebelum lompat lebih jauh)

| # | Syarat/Pekerjaan | Detail |
|---|---|---|
| A.1 ✅ SELESAI | Audit token count korpus nyata (`raget-tools/audit-corpus-tokens.mjs`, laporan di `raget-devlog/neural/corpus-token-audit.md`) | Hasil: korpus 543,2 juta token, cuma 5,43% dari kebutuhan 500M (18,4x kurang) dan 2,72% dari kebutuhan 1B (36,8x kurang) — lihat tabel §2. **Kesimpulan tegas: TIDAK BOLEH melatih preset ≥500M sampai korpus tumbuh signifikan** — mengulang training di atas data yang sama seperti massive200m sekarang cuma akan menghasilkan model yang lebih undertrained lagi, bukan lebih pintar |
| A.1b ✅ SELESAI (analisis) | Growth plan korpus konkret menuju 10 miliar token (target 500M) | **Dicek ulang lewat GitHub API langsung (bukan asumsi) — koreksi jujur atas draf sebelumnya di baris ini**: lihat detail penuh di §2b di bawah. Ringkas: (a) Wikipedia ID **BUKAN** peluang belum-tergarap — sudah di-crawl SAMPAI HABIS dua kali (jilid1 seluruh dump 1.874.320 halaman + harvest kedua `panen-wikipedia-id` yang cuma menemukan 13,4% dokumen unik baru dari 561.195 kandidat, 86,6% sisanya duplikat/terlalu pendek) — sumur ini sudah nyaris kering. (b) Dua Release "penampung" ditemukan (`korpus-sejarah-indonesia-bersih` 564.158 byte gzip, `korpus-mentah-id` ~7,99 MB gzip gabungan 3 file) TAPI keduanya **belum digabung/belum di-sort** dan skalanya cuma ~0,05-0,1% dari kekurangan 9,46 miliar token untuk target 500M — bukan solusi, cuma tambahan kecil. (c) **Kesimpulan tegas**: satu-satunya jalur realistis menutup gap 18,4x adalah Common Crawl/OSCAR porsi Indonesia dalam skala besar DENGAN filter kualitas jauh lebih ketat dari preseden gagal `panen-madlad400-id` (18,7% spam) — pola filter yang TERBUKTI berhasil di proyek ini adalah dedup fingerprint ala `panen-wikipedia-id` (buang duplikat + dokumen terlalu pendek), harus direplikasi + ditambah filter bahasa/perplexity untuk Common Crawl yang jauh lebih kotor dari Wikipedia. Korpus buku/berita berlisensi terbuka (c) masih valid sebagai sumber tapi belum ada kandidat konkret teridentifikasi. **A.2-A.4 tetap correctly diblokir** — growth plan ini mengidentifikasi JALUR-nya, belum mengeksekusi crawl Common Crawl skala besar (di luar cakupan realistis satu sesi) |
| A.2 | Pindahkan training andalan preset ≥500M ke jalur PyTorch | `train-massive50m-torch.py` sudah preseden — preset besar TIDAK dilatih lagi lewat JS murni di Colab (terlalu lambat/rawan limit sesi), JS murni tetap dipakai khusus preset kecil (tiny/compact) untuk eksperimen cepat. **Belum dikerjakan** — menunggu korpus BENAR-BENAR tumbuh (A.1b sudah SELESAI sebagai analisis/jalur, tapi eksekusi crawl-nya sendiri belum terjadi) |
| A.3 | Evaluasi arsitektur training: mixed precision, gradient checkpointing | Perlu di jalur PyTorch supaya training preset besar muat di memori GPU Colab/cloud yang terbatas. **Belum dikerjakan** |
| A.4 | Verifikasi ulang kuantisasi int8 pada model lebih dalam/lebar | Checkpoint format (`llm-quantization.js`) dipertahankan, tapi error kuantisasi HARUS diukur ulang — model lebih dalam bisa lebih sensitif terhadap presisi rendah. **Belum dikerjakan** |

**Kenapa A.2-A.4 belum dikerjakan sekarang**: A.1 membuktikan korpus
adalah penghambat dominan (18,4x kurang untuk lompatan TERDEKAT), dan
A.1b (analisis, sudah selesai — lihat §2b) mengidentifikasi JALUR yang
benar (Common Crawl/OSCAR skala besar dengan filter ketat) tapi BELUM
mengeksekusi crawl itu — korpus hari ini masih 543,2 juta token, belum
tumbuh sama sekali dari angka yang diaudit A.1. Mengerjakan pipeline
training PyTorch/mixed-precision/kuantisasi sebelum korpus benar-benar
tumbuh membuang usaha di infrastruktur untuk data yang belum ada —
urutan yang benar adalah eksekusi growth plan A.1b dulu (di luar cakupan
realistis satu sesi kerja, butuh infrastruktur crawl+filter terpisah),
baru A.2-A.4. Ini juga alasan kenapa PRD ini TIDAK mengklaim training
run baru sudah dilakukan — training preset ≥500M di atas data hari ini
akan mengulang pola undertraining massive200m, bukan kemajuan.

Gate keluar Fase A: preset baru (500M–1B) punya held-out PPL yang
BENAR-BENAR lebih baik dari massive200m (bukan cuma "lebih besar
paramnya") — kalau tidak, kembali ke A.1 (data belum cukup), jangan
lanjut ke Fase B.

### FASE B — 4B parameter

| # | Syarat/Pekerjaan | Detail |
|---|---|---|
| B.1 | Persetujuan budget compute eksplisit | GPU cloud berbayar realistanya wajib di skala ini — PRD ini TIDAK mengasumsikan ini sudah disetujui, harus jadi keputusan produk terpisah sebelum kerja dimulai |
| B.2 | Strategi inference server-assisted (opsional) | Browser/WebGPU tidak akan sanggup model 4B. Opsi realistis: model tetap 100% milik RATEGOAN sendiri, tapi INFERENCE dijalankan di server milik produk sendiri (bukan model pihak ketiga, cuma lokasi eksekusi yang pindah) — ini WAJIB didiskusikan sebagai keputusan produk, bukan default otomatis, karena menyentuh prinsip "100% lokal" |
| B.3 | Evaluasi ulang vocab/tokenizer | Vocab 30.368 token (BPE) saat ini mungkin perlu diperbesar untuk efisiensi token di skala ini |

### FASE C — 10B / 20B / 40B (horizon jauh, sengaja spekulatif)

Pada skala ini RATEGOAN Neural sudah keluar sepenuhnya dari kategori
"jalan di HP/browser pengguna" — ini akan jadi model besar yang
dihosting sendiri (self-hosted), bukan lagi genuinely on-device.

**Catatan wajib, bukan komitmen**: mengejar fase ini berarti meninjau
ulang salah satu prinsip desain inti produk (100% lokal, tanpa server)
— ini BUKAN keputusan teknis semata dan TIDAK BOLEH dimulai tanpa
keputusan produk eksplisit yang menyatakan prinsip itu memang diubah
untuk kasus ini. PRD ini cuma mencatat jalurnya ADA secara teknis
(scaling arsitektur transformer sendiri tidak punya batas ukuran
teoretis), bukan mendorong untuk otomatis dikerjakan.

## 4. "Belajar dari user" & "federated learning" — makna yang jujur untuk Neural

- **Continual pretraining periodik (opt-in, anonim)**: percakapan yang
  sudah tersimpan lokal (`raget-database`) bisa dipakai sebagai data
  training TAMBAHAN pada sesi training BERIKUTNYA (bukan real-time),
  HARUS opt-in eksplisit dari pengguna dan dianonimkan sebelum dipakai.
  Ini bentuk realistis dari "belajar dari pengguna" yang sejalan dengan
  privasi produk.
- **Federated learning (istilah teknis sebenarnya: agregasi gradien
  lintas banyak perangkat)**: secara jujur DICATAT bertentangan dengan
  prinsip 100% lokal produk ini kecuali dibangun infrastruktur agregasi
  terpisah yang eksplisit disetujui. Distatuskan sebagai **riset jangka
  sangat panjang**, bukan roadmap dekat — jangan menjanjikan istilah ini
  ke pengguna sebelum ada implementasi nyata di baliknya.

## 5. Gate wajib naik fase (jangan puas cuma karena angka turun)

Sama seperti aturan yang sudah berlaku (`docs/ARSITEKTUR.md` §5): PPL
turun BUKAN bukti cukup. Setiap kenaikan fase WAJIB:
1. Baca output generasi kata per kata (`raget-tools/diagnose-neural-generation.mjs`),
   bukan cuma percaya angka PPL.
2. Preset baru harus mengalahkan preset sebelumnya SECARA KUALITATIF
   (koheren gramatikal lebih baik), bukan cuma lebih besar paramnya —
   preseden massive200m di §1 adalah contoh nyata kenapa aturan ini ada.
3. lint-check + bench Playwright penuh sebelum commit checkpoint baru.

## 6. Di luar cakupan PRD ini

- Perubahan Template/data/retrieval — `PRD-RAGET-TEMPLATE.md`.
- Model bahasa pihak ketiga dalam bentuk apa pun — sudah diputuskan
  TIDAK dikejar secara permanen.
- Setiap pekerjaan di PRD ini WAJIB ikut `PRD-ATURAN-KERJA.md`.
