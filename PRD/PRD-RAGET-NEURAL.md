# PRD — Pengembangan Lanjutan Raget Neural (Roadmap Skala 50M → 40B)

Status: roadmap aktif, sebagian besar fase jauh ke depan bersifat
**spekulatif secara sengaja** dan mensyaratkan keputusan produk
eksplisit sebelum dieksekusi (dicatat jelas di tiap fase). Cakupan PRD
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

1. **Data**: aturan umum scaling law (rasio token:parameter yang
   sekitar 20:1 untuk training optimal) berarti 1B parameter idealnya
   butuh puluhan miliar token bersih. Korpus saat ini (`raget-data/jsonl`,
   5 jilid Wikipedia/Wikibooks/Wikivoyage/Wiktionary bahasa Indonesia)
   BELUM DIAUDIT total token-nya terhadap target ini — audit token count
   nyata adalah pekerjaan WAJIB pertama sebelum menjanjikan fase 1B apa
   pun (lihat FASE A.1 di bawah).
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
| A.1 | Audit token count korpus nyata | Hitung total token bersih `raget-data/jsonl/` saat ini, bandingkan dengan target rasio ~20:1 untuk 500M–1B. Kalau kurang jauh, growth plan korpus (jilid tambahan) HARUS ada sebelum training preset baru — jangan latih preset lebih besar di atas data yang sama seperti 200M sekarang, itu ulangi masalah §2 temuan di atas |
| A.2 | Pindahkan training andalan preset ≥500M ke jalur PyTorch | `train-massive50m-torch.py` sudah preseden — preset besar TIDAK dilatih lagi lewat JS murni di Colab (terlalu lambat/rawan limit sesi), JS murni tetap dipakai khusus preset kecil (tiny/compact) untuk eksperimen cepat |
| A.3 | Evaluasi arsitektur training: mixed precision, gradient checkpointing | Perlu di jalur PyTorch supaya training preset besar muat di memori GPU Colab/cloud yang terbatas |
| A.4 | Verifikasi ulang kuantisasi int8 pada model lebih dalam/lebar | Checkpoint format (`llm-quantization.js`) dipertahankan, tapi error kuantisasi HARUS diukur ulang — model lebih dalam bisa lebih sensitif terhadap presisi rendah |

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
