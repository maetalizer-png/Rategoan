# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-02 (PRD-PERINTAH-GROK 2 tugas)

## Tugas 2 — SELESAI
Release `checkpoint-200m`:
- 171.344.024 B
- SHA256 `d4aba4d8b20efe52a91d5501666d9b9e7b04aeb1c1d51bf03da40854ce3c681a`
- PPL 1899,89 → 1068,37 (1787 step / 335,46 menit)
- Folder `checkpoint-200m/` di git sudah dihapus setelah publish

## Tugas 1 — MADLAD-400: review sample SELESAI, promosi penuh BELUM
Sample 600 baris dari part 0011 + 0018 + 0027:
- spam ketat (≥2 frasa judi/forex): **8,8%**
- 1 frasa spam: 12,3%
- lolos pola spam: **78,8%**
- nav/boilerplate Home»: 12,2%

Bukan mayoritas spam menurut filter Claude. Isi tetap web-blog/berita, bukan ensiklopedia kurasi.
Part di Release ~22 file × ~1,8 GB ≈ 30 GB. Satu part 1,35 GB sempat diunduh dan disaring, lalu workspace ephemeral terhapus sebelum upload K1.

Keputusan ronde ini: **belum dipromosikan ke K1, belum di-retire.** Perlu mesin dengan disk ≥40 GB untuk saring+dedupe+gabung penuh. Jangan hitung 30 juta dokumen MADLAD sebagai token kanonik.

## Kanonik (file Release)
- K1 759.587 dokumen (setelah unik Wikipedia), gzip 571 MB, SHA `3383bc30…` — token BPE belum dihitung ulang dari 303.917.157 (K1 683.516)
- K2 291.928 dokumen, 85.003.080 token BPE
- K3 97.548 dokumen, 32.010.503 token BPE
