# Studi kasus Antarmuka 6.0

Diukur di lingkungan yang sama dengan pratinjau hidup, layar 1366×768 dan ponsel 390×844. Sumber: `raget/raget-tools/studi-kasus-6.mjs`.

## Yang diuji

Studio Kode sebagai ruang kontrol: obrolan hanya narasi, kanvas hanya pemantau, konektor bukan perintah koding.

## Hasil terukur

| Pemeriksaan | Hasil |
|---|---|
| Uji satuan `npm test` | 40/40 lulus |
| `npm run lint` | 0 galat, 0 peringatan |
| Playwright | 22/22 lulus, 0 galat halaman |
| Sidebar | 260px di Studio dan di halaman proyek |
| Saat belah, 1366×768 | sidebar 260, obrolan 574, kanvas 532, tidak ada limpahan |
| Header kanvas | Pratinjau, Berkas, Terminal, lencana mikro. Tidak bertabrakan. Tidak ada "Pratinjau Rekayasa" |
| Kanvas kosong | Kartu "Ruang Kerja Siap", bukan teks diagnostik mentah |
| Gelembung pengguna | lebar 279px pada kolom 574px, sisa kanan 20px |
| Jejak alat | 0 kartu dan 0 tombol aksi di obrolan; 1 kartu di terminal |
| Remah atas | "Studio Kode". Lencana kanvas "Siap" |
| Diff | header `@@ -awal,panjang +awal,panjang @@`, dua nomor baris |
| Popover lampiran | tinggi 220px, lebar 340px, puncak y=128, dasar di atas komposer, z-index 140 |
| Google Drive | modal terbuka, teks "belum terhubung", jumlah pesan tetap 0 |
| GitHub tanpa token | pindah ke hub konektor, tidak merakit, tidak menambah pesan |
| Perintah tersembunyi | pengiriman dibatalkan sebelum gelembung dibuat |
| Teks acak `hvgyfkvhjnn` | ditolak, tanpa jejak alat |
| Kanvas yang ditutup pengguna | tetap tertutup pada perintah berikutnya |
| Tombol kembali di halaman proyek | `display: none` pada desktop |
| CSP | `studio.html` dan `index.html` tanpa `unsafe-eval` |
| Ponsel 390×844 | tidak limpah; tombol ciut desktop tersembunyi; menu tetap ada |

## Catatan

Popover memakai z-index 140, bukan 70. Latar lembar lampiran berada di 120 di dalam komposer, jadi nilai 70 tidak bisa diketuk.

Parser hitung tidak lagi memakai `Function()`. `2 + 3 * 4` = 14, `2 ** 3 ** 2` = 512, dan `2+3;alert(1)` ditolak.
