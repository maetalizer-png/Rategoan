# PRD — Struktur Data Release & Penamaan Korpus Rategoan

Status: **BERLAKU, mengikat**. Dokumen ini adalah rumus tunggal untuk
mengukur, menata, menamakan, dan menggabungkan data training (korpus
teks + checkpoint neural) di GitHub Release proyek Rategoan.

Ditulis untuk dibaca dan diikuti oleh **siapa pun/agen apa pun** (manusia,
Grok, Claude, atau lainnya) yang menambah/mengelola data Release —
bukan hanya catatan sekali pakai. Kalau ada aturan lama di `docs/` yang
bertentangan dengan dokumen ini, **dokumen ini yang menang**.

## 0. Masalah yang diperbaiki

Audit tanggal 2026-08-26 menemukan **19 Release** dengan penamaan
`A1..A17` + `PACK` yang tidak konsisten: nomor tidak mencerminkan ukuran
maupun kategori, ada file yang cuma **1014 byte** dapat Release sendiri,
ada versi berulang (`A3`, `A3v2`) sebagai tag terpisah alih-alih
memperbarui tag yang sama, dan tag lama yang sudah digabung ke `PACK`
dibiarkan tetap hidup alih-alih dihapus. Akibatnya: pilihan mana yang
harus di-load untuk training jadi tidak jelas kecuali baca beberapa file
`STATUS-*.md` sekaligus.

Dokumen ini mengganti semua itu dengan **rumus tetap** — bukan
keputusan ad-hoc per sesi.

## 1. Kategori (taksonomi tertutup — hanya 5)

Setiap data baru **wajib** masuk salah satu dari 5 kategori ini. Kalau
benar-benar tidak cocok satupun, **berhenti dan tanya dirigen** sebelum
membuat kategori ke-6 — jangan langsung menambah huruf/angka baru.

| Kategori | Isi | Peran dalam mix training |
|---|---|---|
| `ensiklopedia` | Narasi faktual volume besar — Wikipedia/Wikimedia ID + serumpun (Melayu, regional) | 55–65% |
| `dialog` | Percakapan, gaya Raget, tanya-jawab, sapaan, obrolan buatan | bagian dari 25–35% |
| `daerah` | Bahasa daerah Indonesia sebagai teks (Jawa, Sunda, Minang, Madura, Ngapak, dst) | bagian dari 25–35% |
| `pelengkap` | Tambahan kecil opsional — simple-wiki, wikiquote, wikivoyage, edukasi, buku/naskah | 5–15% |
| `checkpoint` | Bobot model neural (safetensors) | bukan korpus — diatur `raget/raget-tools/CHECKPOINT-POLICY.md`, PRD ini cuma merujuk, tidak menggantikan |

`dialog` dan `daerah` **selalu digabung jadi satu file pack** saat
training (lihat §4) karena sama-sama porsi kecil yang perlu di-upsample
bersama — tapi tetap dua kategori terpisah saat diukur/dinamai, supaya
komposisi tetap terlihat kalau dibongkar lagi nanti.

## 2. Penamaan — satu tag permanen per kategori

**Tag** (nama teknis yang dipakai skrip) mengikuti pola tetap:

```
korpus-<kategori>-bersih
```

Tidak ada `-v1`, `-v2`, `-vN` di **tag**. Versi hidup di dalam
`manifest.json` (field `versi`, integer, naik terus) dan di judul
Release (field "name"), BUKAN di tag. Saat ada data baru untuk kategori
yang sama: **timpa asset di tag yang sama**, jangan bikin tag baru.

Contoh tag yang benar (final, setelah migrasi §6):

| Tag | Kategori |
|---|---|
| `korpus-ensiklopedia-bersih` | ensiklopedia |
| `korpus-dialog-daerah-bersih` | dialog + daerah (satu pack gabungan) |
| `korpus-pelengkap-bersih` | pelengkap |
| `checkpoint-<ukuran>` (mis. `checkpoint-100m`) | checkpoint — sudah benar, tidak diubah |

**Pengecualian version-pin** (langka, butuh alasan tertulis di manifest
field `alasanPin`): kalau satu training run yang SUDAH dipublikasikan
harus tetap bisa direproduksi persis dari korpus versi lama, boleh
membekukan satu snapshot sebagai `korpus-<kategori>-bersih-v<N>-pinned`.
Ini bukan alur normal — jangan dipakai untuk update rutin.

Field "name" (judul tampilan Release, boleh bebas/enak dibaca manusia)
tetap boleh punya indeks display seperti `K1 · Ensiklopedia ID` — itu
kosmetik saja, bukan identitas teknis. Jangan sampai script bergantung
pada nomor display ini.

## 3. Ukuran — rumus tingkatan kapasitas ("1 ukuran sesuai kapasitasnya")

Ukur ukuran file **gzip final** (bukan raw) dalam MB:

```
size_mb = bytes(file.jsonl.gz) / 1_000_000
```

| Tingkat | Rentang | Aturan |
|---|---|---|
| **XS** | < 20 MB | **DILARANG jadi Release sendiri.** Wajib digabung ke pack kategorinya (§5) sebelum publish. |
| **S** | 20–95 MB | Boleh Release tersendiri satu file per kategori. |
| **M** | 95–500 MB | Ideal — cukup besar untuk volume berarti, cukup kecil untuk diunduh/verifikasi cepat. Target band utama untuk `ensiklopedia`. |
| **L** | 500 MB–1.5 GB | Masih satu file (GitHub Release single-asset limit ~2GB), tapi mulai pertimbangkan split kalau mendekati batas. |
| **XL** | > 1.5 GB | **Wajib dipecah** jadi part berurutan `<tag-file>.partNN` (NN 2-digit, mulai `00`), tiap part idealnya ~300–500 MB, plus `manifest.json` berisi SHA256 tiap part + SHA256 file utuh + urutan gabung. |

Batas 20 MB (XS) dipilih supaya tidak ada lagi Release seperti
`korpus-inti-id-buatan-v1` (1014 byte) atau `korpus-inti-id-buatan-v3`
yang berdiri sendiri padahal isinya recehan.

**Catatan penting — ini beda dari aturan git.** Batas 100MB/95MB-part
di `CHECKPOINT-POLICY.md` itu khusus untuk file yang MUNGKIN masuk git
(checkpoint kecil) atau branch `staging/korpus-parts` (batas keras
GitHub per-blob). Release asset **tidak** kena batas itu — GitHub
Release boleh sampai ~2GB per file. Jangan pecah korpus jadi part
95MB kalau tujuannya Release, itu cuma bikin part berlebihan tanpa
alasan (lihat masalah §0).

## 4. Rumus campuran training (mix ratio)

Target resmi (generalisasi dari `docs/MIX-TRAINING-SEIMBANG.md`, berlaku
untuk kategori, bukan tag spesifik):

```
ensiklopedia   : 55–65%
dialog+daerah  : 25–35%   (upsampled — lihat rumus oversample di bawah)
pelengkap      : 5–15%
```

### Rumus oversample (dipakai kalau kategori kecil harus dinaikkan porsinya)

Ini rumus yang sudah dipakai berulang kali sesi ini (mis. `own_corpus`
5×, A1+A3 65:35) — sekarang resmi dikodifikasi:

```
target_share   = porsi yang diinginkan kategori kecil (mis. 0.35)
anchor_bytes   = ukuran byte kategori acuan (biasanya ensiklopedia, boleh disample dulu ke ukuran kerja yang wajar, mis. 100-300MB)
small_bytes    = ukuran byte asli kategori kecil (sebelum diulang)

repeat_factor  = ceil( (target_share / (1 - target_share)) * anchor_bytes / small_bytes )
```

Setelah repeat, gabungkan lalu **shuffle** (`shuf`) sebelum tokenisasi —
supaya kategori tidak mengelompok jadi blok besar di korpus akhir (data
mengelompok = model belajar satu jenis dulu baru jenis lain dalam satu
sesi training, tidak diinginkan).

Verifikasi rasio SELALU dengan menghitung ulang byte hasil akhir
per kategori, dicatat di manifest (`proporsiAktual`), bukan cuma
diasumsikan dari repeat_factor teoretis.

## 5. Alur wajib untuk data baru (checklist "pagar")

Jalankan urutan ini **setiap kali** ada korpus baru mau dipublikasikan.
Ini berlaku untuk siapa pun/agen apa pun yang punya akses publish Release
(saat ini: dirigen manusia atau proses di luar sandbox Claude Code Remote
— lihat catatan di `CHECKPOINT-POLICY.md` kenapa Claude sendiri tidak
bisa publish Release).

1. **Bersihkan + dedupe** data mentah dulu. Jangan publish data mentah.
2. **Ukur**: jumlah dokumen, kata approx (`wc -w` atau split whitespace),
   byte gzip, breakdown bahasa (%), lisensi per sumber.
3. **Klasifikasi kategori** — pilih SATU dari 5 kategori §1 berdasarkan
   ISI, bukan berdasarkan urutan kedatangan.
4. **Hitung `size_mb`** dan tentukan tingkat (§3).
5. **Kalau XS (<20MB):**
   a. Unduh pack kategori yang sudah ada (`korpus-<kategori>-bersih`,
      atau `korpus-dialog-daerah-bersih` untuk dialog/daerah).
   b. Gabungkan data baru ke situ, **dedupe ulang lintas-file**.
   c. Upload ulang sebagai asset baru **di tag yang sama** (timpa file
      lama), naikkan `versi` di manifest.
   d. **Jangan** buat tag baru.
6. **Kalau S/M/L (≥20MB):**
   a. Kalau kategori ini BELUM punya file kanonik → publish langsung ke
      tag `korpus-<kategori>-bersih` (tag baru dibuat sekali di sini).
   b. Kalau kategori ini SUDAH punya file kanonik dan data baru
      dimaksudkan **menambah** volume (bukan menggantikan) → unduh yang
      lama, gabung, dedupe, upload ulang sebagai asset baru di tag yang
      sama (bukan bikin `-v2`).
   c. Kalau data baru SECARA SADAR dimaksudkan menggantikan (mis. jauh
      lebih bersih dari sumber yang sama) → tetap pakai tag yang sama,
      upload ulang menimpa asset lama.
7. **Kalau XL (>1.5GB)**: pecah jadi part sesuai §3, semua part + manifest
   di tag yang sama.
8. **Tulis/timpa `manifest-<kategori>.json`** dengan skema wajib (§7) —
   selalu ikut ter-upload sebagai asset kedua di release yang sama.
9. **Retire tag lama** yang isinya sudah sepenuhnya masuk ke pack/file
   baru — hapus Release-nya (bukan cuma dibiarkan "tidak wajib diload").
   Release yang aktif harus selalu bisa dipetakan 1:1 ke tabel §1/§2 —
   tidak ada tag "nganggur" di listing.
10. **Update `docs/STATUS-KORPUS-LISENSI.md`** (satu baris per kategori,
    bukan per tag) supaya tetap sinkron.

## 6. Migrasi dari kondisi sekarang (audit 2026-08-26)

Tabel ini memetakan 19 Release yang ada sekarang ke kategori final.
`AKSI` adalah rekomendasi, dijalankan oleh dirigen/Grok (bukan Claude —
lihat §5 soal siapa yang bisa publish Release):

| Tag lama | Kategori target | Ukuran | Aksi |
|---|---|---|---|
| `korpus-jilid-1-clean` (A1) | ensiklopedia | ~479MB | **KANONIK** — rename tujuan jadi `korpus-ensiklopedia-bersih` (atau alias tag lama ke situ), jadi acuan utama |
| `korpus-wiki-se-asia-bersih-v1` (A6) | ensiklopedia | ? | Cek overlap dgn A1 → kalau tambahan asli, gabung; kalau tumpang tindih penuh, retire |
| `korpus-buku-naskah-bersih-v1` (A7) | pelengkap (buku/naskah) | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-edukasi-bersih-v1` (A8) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-idwikivoyage-bersih-v1` (A16) | ensiklopedia (niche) | ? | Cek isi — voyage/travel teks faktual → `ensiklopedia`, bukan `dialog` (PACK saat ini salah taruh A16 di sini, perbaiki) |
| `korpus-idwikiquote-bersih-v1` (A13) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-idwiki-hf-bersih-v1` (A14) | ensiklopedia | ? | Cek overlap dgn A1, gabung atau retire |
| `korpus-idwiki-derhan-bersih-v1` (A15) | ensiklopedia | ? | Cek overlap dgn A1, gabung atau retire |
| `korpus-simplewiki-bersih-v1` (A17) | pelengkap | ? | Gabung ke `korpus-pelengkap-bersih` |
| `korpus-wiki-lokal-bersih-v1` (A5) | daerah | ? | Gabung ke `korpus-dialog-daerah-bersih` |
| `korpus-daerah-id-extra-v1` (A9) | daerah | 8.2MB (XS) | Sudah masuk PACK — **retire tag lama** |
| `korpus-train-seimbang-bersih-v1` (A3) | dialog | 1.4MB (XS) | Sudah masuk PACK — **retire tag lama** |
| `korpus-a3-dialog-seimbang-v2` (A3v2) | dialog | ? | Sudah masuk PACK — **retire**, ini contoh persis pola `-v2` yang dilarang §2 |
| `korpus-inti-id-buatan-v1/v2/v3` (A10/A11/A12) | dialog | 1KB tiap file (XS) | Sudah masuk PACK — **retire ketiganya**, contoh persis masalah §0 |
| `korpus-dialog-daerah-pack-v1` | dialog+daerah | 13MB | Rename tujuan jadi `korpus-dialog-daerah-bersih` (drop `-v1` dari tag, ikuti §2) |
| `checkpoint-100m`, `checkpoint-200m` | checkpoint | — | Tidak diubah, sudah sesuai kebijakan |

`?` = ukuran belum diverifikasi di sesi ini, wajib dicek sebelum retire
(unduh, cek `manifest.json`-nya, konfirmasi benar-benar sudah tercakup
di pack/kanonik sebelum hapus — **jangan hapus tanpa verifikasi**).

Setelah migrasi selesai, jumlah Release aktif untuk korpus seharusnya
**3** (`korpus-ensiklopedia-bersih`, `korpus-dialog-daerah-bersih`,
`korpus-pelengkap-bersih`) + checkpoint yang berlaku, bukan 17.

## 7. Skema manifest wajib

Setiap Release korpus **wajib** punya `manifest.json` dengan field ini
(field baru dibanding pola lama ditandai **[BARU]**):

```json
{
  "kategori": "ensiklopedia",           // [BARU] salah satu dari §1, wajib
  "tag": "korpus-ensiklopedia-bersih",  // [BARU] harus cocok §2
  "tierUkuran": "M",                    // [BARU] XS/S/M/L/XL sesuai §3
  "versi": 3,                           // [BARU] integer naik tiap update, bukan di nama tag
  "name": "korpus-ensiklopedia-bersih",
  "generatedAt": "2026-08-26",
  "totalDokumen": 683516,
  "totalKataApprox": 305971509,
  "totalByte": 470656011,
  "sha256": "...",
  "format": "jsonl",
  "fields": ["text", "source", "license", "url"],
  "license": "...",
  "proporsiInternal": { "...": "..." },
  "proporsiAktual": { "...": "..." },   // [BARU] hasil ukur ulang setelah oversample+shuffle, lihat §4
  "rekomendasiCampuranTraining": { "...": "..." },
  "status": "AMAN — siap dipakai training",
  "janganPakai": ["..."]
}
```

## 8. Yang TIDAK berubah

- `raget/raget-tools/CHECKPOINT-POLICY.md` tetap berlaku penuh untuk
  checkpoint (>100MB git → Release, larangan Git LFS, cara publish).
  PRD ini tidak menggantikannya, hanya menambah aturan korpus teks.
- Larangan sumber berisiko (`balanced-v1`, `jilid-2`, `news crawl`,
  `opensubtitles`, Release yang sudah dihapus) tetap berlaku, lihat
  `docs/STATUS-KORPUS-LISENSI.md`.
- Tokenizer tunggal (vocab 30.368, `train=runtime`) tetap dipakai untuk
  semua korpus tanpa kecuali.
