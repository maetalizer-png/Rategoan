# Studi kasus Antarmuka 7.0

Tanggal ukur: 8 Oktober 2026. Dasar: PRD Antarmuka 7.0 (`7.0.0-ENTERPRISE-MASTER`). Pratinjau hidup memakai berkas yang sama dengan repositori.

## Yang diperbaiki

- Halaman konektor yang dibuka langsung tidak lagi kosong. `mount()` ikut jalan saat boot jika URL memuat `connect`.
- Tautan biru "Kelola di hub" di lembar lampiran dihapus.
- Lembar lampiran desktop tidak lagi dipotong di 220px. Enam pilihan tampil utuh, tanpa scrollbar.
- Bilah atas Studio memakai `var(--rg-surface)`, bukan latar yang menyala sendiri.
- Sesi bernama scaffold, ujicoba, test, atau demo disaring saat cold boot.
- Perintah tersembunyi dinormalisasi NFKC lalu dibatalkan sebelum pesan disimpan.
- Token OAuth tidak lagi menempel di fragment URL. Token duduk di cookie `HttpOnly`, `SameSite=Lax`.
- Kuota IndexedDB yang penuh melempar `QuotaExceededError` dan tidak menulis diam-diam.
- Worktree punya graf Git di memori: blob SHA-256, tree, commit, dan rollback jika perbaikan mandiri gagal.
- Aliran SSE membuang token ber-`seq` yang sama pada `run_id` yang sama. Offline tetap pintu lokal.

## Angka

| Pemeriksaan | Hasil |
|---|---|
| `npm test` | 45/45 |
| lima uji DOD-7.01 sampai 7.05 | 5/5 |
| lint | 336 berkas, 0 galat, 0 peringatan |
| Playwright | 14/14, konsol bersih |
| Sidebar | 260px |
| Belah 1366×768 | obrolan 574px (42% layar), kanvas 532px, tidak limpah |
| Header kanvas | Pratinjau, Berkas, Terminal, tidak bertabrakan |
| Kanvas kosong | kartu "Ruang Kerja Siap" |
| Popover | tinggi 287px, scroll 0, puncak y=57, ZIP terlihat |
| Injeksi | 0 pesan masuk |
| Boot `#/connect` | 6 kartu konektor |
| Ketuk Sandbox | penjelajah alat terbuka, bukan layar putih |
| Ponsel 390×844 | tidak limpah |
| SHA-256 string kosong | `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855` |
| Duplikat stream `seq` 1 | teks tinggal "fungsi", satu jejak alat |
| Rollback worktree | berkas kembali ke `console.log("siap")` |

Paket bukti ada di [docs/evidence/antarmuka-7.0](evidence/antarmuka-7.0).
