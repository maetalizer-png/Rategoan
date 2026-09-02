# PRD — Perintah untuk Grok: cari + panen data tambahan dari Hugging Face Hub

Status: **BERLAKU, ditulis 2026-09-02 pagi.** Tugas migrasi checkpoint
ke Hugging Face SUDAH SELESAI (dikonfirmasi lewat commit
`chore: hapus part ckpt 200M setelah publish ke Hugging Face`,
`huggingface.co/Maetalizer19/rategoan-neural` - bagus, terima kasih).
Sandbox Claude tidak bisa menjangkau huggingface.co sama sekali
(diblokir egress proxy, kebijakan organisasi) jadi verifikasi CORS
langsung belum bisa dilakukan dari sisi Claude - **tolong konfirmasi
sekali lagi** dengan `curl -sI -H "Origin: https://apapun.test"` ke URL
resolve-nya kalau belum pernah dicek eksplisit.

## Tugas baru — EKSEKUSI: cari data tambahan Bahasa Indonesia di HF Hub

Dirigen minta "cari data sebanyak mungkin di huggingface". Grok punya
akses jaringan ke huggingface.co, Claude tidak - jadi ini tugas Grok.

Kandidat dataset untuk DICEK (bukan daftar terjamin ada/masih hidup -
verifikasi dulu sebelum unduh, ini dari pengetahuan umum bukan
pencarian live):

- `wikimedia/wikipedia` config lain yang belum diambil (cek `id`, dan
  bahasa daerah yang belum ada di K2: `min`, `bug`, `gor` dst sudah
  mulai, cek yang belum)
- `oscar-corpus/OSCAR-2301` subset `id` (web corpus besar, WAJIB lewat
  `deteksi_spam()` dulu - riwayat MADLAD-400 nunjukin web crawl mentah
  gampang penuh spam judi/forex)
- `allenai/c4` atau `mc4` subset `id`
- `SEACrowd` (katalog agregasi dataset Asia Tenggara termasuk banyak
  korpus Indonesia - cek lisensi per-dataset di dalamnya, campuran)
- `indonesian-nlp/*` (organisasi HF, banyak dataset ID kecil-menengah -
  cek satu-satu lisensinya)

## Aturan wajib (sama seperti korpus lain)

1. **Filter spam dulu** - `deteksi_spam()` (commit `7b8a433`) wajib
   dipakai sebelum data apa pun masuk staging, apalagi K1/K2/K3.
2. **Cek lisensi per-dataset** - JANGAN ambil yang lisensinya tidak
   jelas atau melarang redistribusi/derivative.
3. **JANGAN ambil dari daftar `janganPakai`** yang sudah ditolak
   sebelumnya: `balanced-v1`, `jilid-2`, `news`, `opensubtitles` (lihat
   manifest K2 di `korpus-manifest-total.json`).
4. **Taruh di staging dulu**, bukan langsung ke K1/K2/K3 - biar Claude
   bisa verifikasi SHA256 + hitung ulang token BPE sebelum jadi
   kanonik (pola yang sudah jalan untuk Wikipedia/MADLAD-400).
5. **Update manifest.json Release** dengan `tokenBPEResmi: null` +
   catatan "belum dihitung ulang" kalau belum sempat hitung sendiri -
   Claude akan lanjutkan penghitungan resmi.

Tugas ini SELESAI (untuk satu ronde) kalau minimal satu dataset baru
sudah masuk staging dengan manifest lengkap (bukan cuma daftar
kandidat di atas yang dicek doang).

## Checklist

- [ ] Konfirmasi ulang curl CORS ke URL HF checkpoint 200M (kalau
      belum pernah dicek eksplisit sebelum commit selesai).
- [ ] Minimal 1 dataset baru dari HF masuk staging (bukan K1/K2/K3
      langsung), lolos filter spam + cek lisensi.
- [ ] Laporkan ke dirigen: dataset apa yang diambil, berapa dokumen,
      lisensi, hasil filter spam.
