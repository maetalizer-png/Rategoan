# Studi kasus — PRD Antarmuka 5.0

Tanggal uji: 2026-10-08. Lingkungan: pratinjau hidup Rategoan, desktop 1280×800 dan ponsel 390×844.

## Kasus

| Kasus | Yang dicoba | Hasil terukur |
| --- | --- | --- |
| Obrolan kosong | Layar desktop tanpa pesan | Merek di y=239, komposer di y=340 (tengah, bukan dasar 800), 4 kartu di y=488 |
| Ponsel | Lebar 390 | Tidak ada limpahan horizontal |
| Popover + | Buka lampiran di Studio | Lembar y=92–352, persis di atas komposer y=360. Judul satu: Lampiran & Konektor |
| Google Drive | Buka pemilih berkas | Modal tampil. Tanpa akun: "belum terhubung", bukan log kosong |
| Nol fabrikasi | Ketik `hvgyfkvhjnn` | Ditolak. 0 jejak alat. Tidak ada "Web app" |
| Kanvas | Scaffold, lalu tutup kanvas, lalu ubah warna | Judul tetap Pratinjau Rekayasa. Remah "Sesi Aktif" (≤24 karakter). Prompt berikut tidak membelah layar |
| Pintu B | Aliran token, alat, diff | Teks "fungsi ukur", kartu Read, diff `ukur()` |
| Putus jaringan | `navigator.onLine = false` | Pil beralih ke Pintu A · Lokal |
| Hapus riwayat | Ikon tempat sampah | Layar kembali kosong. 0 pesan |

## Mesin (uji satuan)

32/32 lulus. Lint 0 galat, 0 anti-placeholder, skema data 3934 entri OK.

- Int4 blok 32: simpangan di bawah 1,5% pada bobot yang rapat.
- GQA: 8 query dilayani 2 KV. Cache 2048 token di bawah 120 MB.
- 40 lapisan: puncak memori 26 MB, buffer dilepas tiap lapis.
- Unduh model: pecahan 20 MB, panggilan kedua 0 unduhan ulang, cache `rategoan-model-v5`.
- Parser WhatsApp dan ICS 1 MB, 5 MB, dan 10 MB: di bawah 200 ms (10 MB sekitar 16 ms).
- Indeks hibrida 384 dimensi menemukan dokumen kode, bukan resep, dan postings bisa disimpan.
