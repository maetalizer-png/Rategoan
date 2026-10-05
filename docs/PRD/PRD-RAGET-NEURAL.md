# PRD — Raget Neural (otak transformer dari nol, 50M → 40B)

## Goals

1. Model tumbuh dari 50M ke ukuran lebih besar HANYA kalau korpus
   training-nya sudah cukup (rasio ~20 token/parameter) — bukan asal
   naikkan parameter (preseden gagal: massive200m lebih buruk dari
   massive50m karena data kurang, bukan model kurang besar).
2. Setiap klaim naik fase WAJIB dibuktikan kualitatif (baca output
   generasi asli) + kuantitatif (PPL held-out membaik), bukan PPL
   turun doang.
3. 100% arsitektur milik RATEGOAN sendiri, ditulis dari nol — tidak
   pernah menyematkan model bahasa pihak ketiga.
4. Growth path korpus/compute/inference dipetakan jujur per skala
   (500M/1B/4B/10B+), termasuk kapan itu butuh keputusan produk
   (budget, ubah prinsip 100% lokal) — bukan diam-diam dieksekusi.

Cakupan: `raget-neural/` + tooling training/eval-nya. Template di luar
cakupan — lihat `PRD-RAGET-TEMPLATE.md`. Aturan kerja: `PRD-ATURAN-KERJA.md`.

Status ringkas: Fase A.1 (audit token korpus) dan A.1b (growth plan)
SELESAI (lihat §2b) — korpus, bukan compute, adalah penghambat dominan
untuk scaling, dan Wikipedia ID BUKAN sumber pertumbuhan lagi (sudah
habis digali dua kali, terbukti dari manifest nyata). Fase jauh ke
depan **spekulatif secara sengaja**, mensyaratkan keputusan produk
eksplisit sebelum dieksekusi (dicatat jelas di tiap fase).

**Prinsip yang tidak bisa ditawar**: seluruh roadmap ini tentang
membesarkan arsitektur transformer JS/PyTorch **milik RATEGOAN
sendiri** (`raget-neural/`, ditulis dari nol — attention, tokenizer,
trainer, semua sendiri). TIDAK ADA bagian dari PRD ini yang berarti
mengunduh/menyematkan model bahasa pihak ketiga — RATEGOAN hanya
punya SATU otak lokal (RAGET), dibangun sendiri dari nol.

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

1. **Data — angka resmi mengikuti `docs/STATUS-KORPUS-LISENSI.md` dan `PRD-RELEASE.md`**:
   korpus rilis produksi hari ini = **17.651.050.443 token BPE bersih** dari
   91.395.436 dokumen (K1 = 2,20 miliar, K2 = 0,43 miliar, K3 = 15,01 miliar).
   Audit September 2026 yang menyebut ratusan juta token sudah diganti dan tidak berlaku.
   Dengan rasio ~20 token/parameter, 17,65 miliar menutup preset 50M–500M
   dan menutup sekitar 88% kebutuhan 20 miliar untuk model 1B.

   | Target | Token ideal | Posisi terhadap korpus 17,65 miliar |
   |---|---:|---|
   | massive50m (ada) | 1,00 miliar | tertutup |
   | massive100m (ada) | 2,07 miliar | tertutup |
   | massive200m (ada) | 4,01 miliar | tertutup |
   | 500M | 10 miliar | tertutup |
   | 1B | 20 miliar | sekitar 88% |
   | 4B | 80 miliar | masih kurang |
   | 10B | 200 miliar | masih kurang |
   | 20B | 400 miliar | masih kurang |
   | 40B | 800 miliar | masih kurang |

   Angka lama ratusan juta token tidak dipakai lagi. Kekurangan yang tersisa
   baru muncul di target di atas 1B, bukan di preset yang sudah ada.
2. **Compute**: Colab gratis (kuota harian, sesi terbatas ~12 jam) SUDAH
   jadi batas nyata di preset 200M (lihat temuan PPL di atas — 200M
   dengan compute yang sama saja belum konvergen baik). Melatih 1B+ dari
   nol dalam waktu wajar REALISTANYA butuh GPU dedicated berbayar
   (Colab Pro/cloud) — PRD ini tidak mengasumsikan budget tersedia,
   cuma mencatatnya sebagai syarat yang harus disetujui secara eksplisit
   sebelum FASE B dimulai.
3. **Inference di browser**: WebGPU/WASM murni JS untuk model >1B
   kemungkinan besar TIDAK bisa jalan wajar di perangkat rata-rata —
   keterbatasan buffer GPU umum di perangkat Android kelas menengah
   ke bawah. Maka strategi INFERENCE untuk model besar harus dipikirkan
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
Release ini paling banter setara beberapa juta token pada masanya. Terhadap
korpus resmi 17,65 miliar token BPE hari ini, sumbangan penampung kecil itu
sudah tidak menjadi batas.

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
| A.1 ✅ SELESAI (diselaraskan Oktober 2026) | Audit token count korpus | Angka resmi: **17.651.050.443 token BPE** dari 91.395.436 dokumen (K1 = 2,20 miliar, K2 = 0,43 miliar, K3 = 15,01 miliar), lihat `docs/STATUS-KORPUS-LISENSI.md`. Audit September 2026 yang menyebut ratusan juta token dicabut. Preset sampai 500M tertutup; model 1B butuh 20 miliar dan saat ini sekitar 88%. |
| A.1b ✅ SELESAI (diselaraskan Oktober 2026) | Growth plan korpus | Penampung lama sudah masuk rak. Angka ratusan juta token dari September 2026 tidak berlaku. Lantai resmi ada di `docs/STATUS-KORPUS-LISENSI.md`: 17.651.050.443 token BPE. |
| A.2 | Pindahkan training andalan preset ≥500M ke jalur PyTorch | `train-massive50m-torch.py` sudah preseden — preset besar TIDAK dilatih lagi lewat JS murni di Colab (terlalu lambat/rawan limit sesi), JS murni tetap dipakai khusus preset kecil (tiny/compact) untuk eksperimen cepat. **Belum dikerjakan** — menunggu korpus BENAR-BENAR tumbuh (A.1b sudah SELESAI sebagai analisis/jalur, tapi eksekusi crawl-nya sendiri belum terjadi) |
| A.3 | Evaluasi arsitektur training: mixed precision, gradient checkpointing | Perlu di jalur PyTorch supaya training preset besar muat di memori GPU Colab/cloud yang terbatas. **Belum dikerjakan** |
| A.4 | Verifikasi ulang kuantisasi int8 pada model lebih dalam/lebar | Checkpoint format (`llm-quantization.js`) dipertahankan, tapi error kuantisasi HARUS diukur ulang — model lebih dalam bisa lebih sensitif terhadap presisi rendah. **Belum dikerjakan** |

**Kenapa A.2-A.4 belum dikerjakan sekarang**: korpus resmi sudah
17.651.050.443 token BPE, cukup untuk preset sampai 500M. Pekerjaan
berikutnya adalah pipeline pelatihan, bukan menunggu angka ratusan juta
yang sudah tidak berlaku. Dokumen ini tidak mengklaim ada training run
baru; yang diselaraskan hanya angka korpus resminya.

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
