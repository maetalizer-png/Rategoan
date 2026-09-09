# PRD — Pengembangan Lanjutan Raget Neural (Roadmap Skala 50M → 40B)

Status: roadmap aktif — **Fase A.1 (audit token korpus) SELESAI**,
hasilnya sudah mengubah urutan prioritas Fase A (lihat §2-3): korpus,
bukan compute, adalah penghambat dominan untuk scaling. Sebagian besar
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

## 3. Roadmap berfase menuju skala lebih besar

### FASE A — 500M sampai 1B (jembatan, syarat dulu sebelum lompat lebih jauh)

| # | Syarat/Pekerjaan | Detail |
|---|---|---|
| A.1 ✅ SELESAI | Audit token count korpus nyata (`raget-tools/audit-corpus-tokens.mjs`, laporan di `raget-devlog/neural/corpus-token-audit.md`) | Hasil: korpus 543,2 juta token, cuma 5,43% dari kebutuhan 500M (18,4x kurang) dan 2,72% dari kebutuhan 1B (36,8x kurang) — lihat tabel §2. **Kesimpulan tegas: TIDAK BOLEH melatih preset ≥500M sampai korpus tumbuh signifikan** — mengulang training di atas data yang sama seperti massive200m sekarang cuma akan menghasilkan model yang lebih undertrained lagi, bukan lebih pintar |
| A.1b | Growth plan korpus konkret menuju 10 miliar token (target 500M) | Sumber realistis untuk pertumbuhan ~18x: (a) Wikipedia ID belum ter-crawl penuh di luar 76.071 dokumen unik yang sudah masuk K1, (b) Common Crawl/OSCAR porsi Indonesia (butuh filter kualitas ketat, preseden `panen-madlad400-id` di korpus-manifest-total.json GAGAL 18,7% spam - filter HARUS lebih ketat dari itu), (c) korpus buku/berita berlisensi terbuka. **Belum dikerjakan** - ini prasyarat nyata sebelum A.2-A.4 berguna |
| A.2 | Pindahkan training andalan preset ≥500M ke jalur PyTorch | `train-massive50m-torch.py` sudah preseden — preset besar TIDAK dilatih lagi lewat JS murni di Colab (terlalu lambat/rawan limit sesi), JS murni tetap dipakai khusus preset kecil (tiny/compact) untuk eksperimen cepat. **Belum dikerjakan** — menunggu A.1b (percuma optimasi training pipeline di atas data yang belum cukup) |
| A.3 | Evaluasi arsitektur training: mixed precision, gradient checkpointing | Perlu di jalur PyTorch supaya training preset besar muat di memori GPU Colab/cloud yang terbatas. **Belum dikerjakan** |
| A.4 | Verifikasi ulang kuantisasi int8 pada model lebih dalam/lebar | Checkpoint format (`llm-quantization.js`) dipertahankan, tapi error kuantisasi HARUS diukur ulang — model lebih dalam bisa lebih sensitif terhadap presisi rendah. **Belum dikerjakan** |

**Kenapa A.2-A.4 belum dikerjakan sekarang**: A.1 baru saja membuktikan
korpus adalah penghambat dominan (18,4x kurang untuk lompatan
TERDEKAT). Mengerjakan pipeline training PyTorch/mixed-precision/
kuantisasi sebelum ada rencana nyata menutup gap data 18,4x itu
membuang usaha di infrastruktur untuk data yang belum ada — urutan yang
benar adalah A.1b dulu, baru A.2-A.4. Ini juga alasan kenapa PRD ini
TIDAK mengklaim training run baru sudah dilakukan — training preset
≥500M di atas data hari ini akan mengulang pola undertraining
massive200m, bukan kemajuan.

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
