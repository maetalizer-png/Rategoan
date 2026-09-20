<!-- KEPUTUSAN DIRIGEN 2026-09-20: gerbang §5 TERJAWAB. Lihat PRD-CODING-KEPUTUSAN.md. K4 korpus-kode-bersih DISETUJUI. Build boleh buat tag. -->

# PRD — Arsitektur Mesin Coding untuk Raget

Baca `PRD-CODING-RAGET.md` dulu — dokumen ini tidak berlaku sebelum
Gerbang Keputusan di sana dijawab dirigen.

## 0. Ruang Lingkup

Dokumen ini HANYA soal perubahan kode/struktur di `raget-neural/`
dan `raget-agents/` terkait. Kebutuhan data/korpus ada di
`PRD-CODING-DATA.md` — jangan campur keduanya.

## 1. Peta Perubahan per File

| File | Perubahan | Level |
|---|---|---|
| `raget-neural/llm-tokenizer.js` | Retrain BPE vocab dengan data kode masuk | Breaking change |
| `raget-neural/llm-trainer.js` | Tambah kurikulum bertahap eksplisit (bahasa → kode) | Perluasan |
| `raget-neural/llm-sampler.js` | Tambah mode *constrained decoding* khusus kode | Perluasan |
| `raget-neural/llm-checkpoint.js` | Strategi checkpoint gabungan vs terpisah (lihat gerbang §5 poin 3) | Keputusan arsitektur |
| `raget-agents/engine-router.js` atau `router-intent.js` | Tambah deteksi niat coding | Perluasan |
| `raget-agents/syntax-validator.js` | **Baru** — QC pasca-generate | File baru |
| `vault/code/js-sandbox.js` | **Baru** — eksekusi uji JS di Web Worker | File baru |
| `raget-tools/tambah-korpus-kode.mjs` | **Baru** — pipeline ingest data kode | File baru |

## 2. Detail per Komponen

### 2.1 Tokenizer (`llm-tokenizer.js`)

**Masalah:** vocab 30.368 dilatih dari teks natural Bahasa
Indonesia. Simbol kode (`{`, `}`, `=>`, `===`, indentasi menerus,
identifier `camelCase`) akan terpecah jadi banyak token kecil —
boros konteks, model kesulitan mempelajari polanya.

**Kebutuhan:** retrain BPE dengan campuran data kode masuk sebelum
seluruh korpus dihitung ulang. Ini perluasan dari aturan yang sudah
ada di `PRD-MANUS-DATA-MENTAH.md` langkah 6 ("PAKAI TOKENIZER YANG
SAMA PERSIS, JANGAN retrain BPE baru") — di sini pengecualiannya
eksplisit: retrain BPE baru MEMANG diperlukan untuk menambah
cakupan kode, tapi begitu vocab baru jadi, seluruh korpus (lama +
baru) harus pakai tokenizer yang SAMA itu, tidak ada vocab ganda.

**Dampak:** checkpoint lama tidak kompatibel dengan tokenizer baru
→ training dimulai ulang dari titik ini untuk komponen bahasa,
atau checkpoint lama disimpan sebagai varian arsip terpisah
("non-kode", kalau strategi checkpoint terpisah dipilih — lihat
§2.4).

### 2.2 Trainer (`llm-trainer.js`)

Tambah dukungan kurikulum bertahap eksplisit — bukan satu training
run rata seperti sekarang:

- **Tahap A** — lanjutkan/ulangi training bahasa umum sampai
  koheren (target sudah ada di roadmap `ARSITEKTUR.md`)
- **Tahap B** — fase khusus kode, terpisah dari batch bahasa

Skala minimum Tahap B: lihat `PRD-CODING-DATA.md` §2 (~7,5 miliar
token, preseden SmallCoder).

### 2.3 Sampler (`llm-sampler.js`)

Tambah mode *constrained/guided decoding* khusus saat menghasilkan
kode: batasi token berikutnya yang valid berdasarkan status
kurung/tanda kutip yang masih terbuka, supaya output selalu bisa
di-parse.

Ini lapis pengaman WAJIB, bukan opsional — model sekecil ~100M
parameter secara statistik rawan salah sintaks tanpa pembatas ini.

### 2.4 Checkpoint (`llm-checkpoint.js`)

Dua opsi, keputusan ada di Gerbang §5 poin 3 (`PRD-CODING-RAGET.md`):

- **Gabungan** — satu model untuk semua. Risiko: kemampuan bahasa
  umum bisa menurun kalau data kode tidak diberi bobot campuran
  yang hati-hati (pola yang sama seperti rasio mix K1/K2/K3 ≤15%
  untuk K3 di training teks yang sudah ada).
- **Terpisah** — checkpoint khusus kode dimuat sesuai permintaan.
  Perlu mekanisme *lazy load* supaya user yang tidak pernah pakai
  fitur coding tidak wajib mengunduh model tambahan.

### 2.5 Router (`engine-router.js` / `router-intent.js`)

Tambah deteksi niat coding — trigger kata kunci ("buatkan kode",
"fungsi javascript", "perbaiki bug ini", dst) → arahkan ke
mode/checkpoint kode.

Ikuti pola fallback yang sudah ada di router: kalau mode kode
gagal atau model tidak yakin, JANGAN diam — beri tahu
keterbatasannya ke user, konsisten dengan filosofi kejujuran
produk yang sudah jalan lewat `NEURAL_NOTE`.

### 2.6 File Baru: Syntax Validator

**Lokasi:** `raget-agents/syntax-validator.js`

QC pasca-generate: cek kurung/kutip seimbang sebelum output
ditampilkan ke user. Peran setara `web-qc.js` untuk hasil pencarian
web — lapis verifikasi terakhir sebelum jawaban keluar.

### 2.7 File Baru: JS Sandbox

**Lokasi:** `vault/code/js-sandbox.js`

Eksekusi kode JS hasil generate di Web Worker + timeout, sebagai
self-test opsional sebelum ditampilkan sebagai jawaban final.
**Hanya untuk JavaScript** — bahasa lain tidak bisa diverifikasi
jalan di lingkungan browser tanpa backend ini.

### 2.8 Pipeline Ingest Data Kode

**Lokasi:** `raget-tools/tambah-korpus-kode.mjs`

Mengikuti prosedur `PRD-MANUS-DATA-MENTAH.md` §2 penuh (klasifikasi
→ bersihkan → dedupe → filter bahasa/lisensi → gabung → tokenize
BPE → ukur → SHA256 → manifest → publish → retire staging), khusus
untuk kategori kode. Detail sumber data di `PRD-CODING-DATA.md`.

## 3. Urutan Kerja Disarankan

1. Kumpulkan data kode (`PRD-CODING-DATA.md`) sampai lolos gerbang
   volume minimum
2. Retrain tokenizer dengan data kode masuk
3. Tulis ulang seluruh korpus lama (K1-K3) dengan tokenizer baru —
   verifikasi `totalTokenBPEResmi` tidak melenceng jauh dari angka
   lama sebagai cross-check kewarasan
4. Jalankan Tahap B training (kode terpisah)
5. Bangun `syntax-validator.js` + mode *constrained decoding* di
   sampler **SEBELUM** kemampuan ini dirilis ke user — lapis
   pengaman wajib, bukan opsional, karena ukuran model kecil
6. Uji coba internal: tambah kategori "coding" ke `bench.json`
   (ikuti pola 1.190 kasus uji yang sudah ada di rule-engine)
   sebelum dianggap siap pakai
