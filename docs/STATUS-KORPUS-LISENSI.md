# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-10-17.

Spesifikasi operasional yang berlaku: `docs/PRD-RELEASE.md` (selaras dengan dokumen Google Docs `PRD RELEASE`, Oktober 2026).

Enam tag rilis korpus resmi di GitHub Releases (tiga tingkat, menggunakan tanda hubung tanpa spasi, tanpa tag ketujuh atau rilis draf terpisah):
- Tingkat 1 (Data Mentah): `Data-baru-Indonesian` dan `data-baru-English`
- Tingkat 2 (Calon Korpus): `penampungan-Indonesian` dan `penampungan-English`
- Tingkat 3 (Rak Final Textbook): `K-dataset-Indonesian` dan `R-dataset-english`

Prinsip akumulasi korpus & aturan deterministik (sesuai `docs/PRD-RELEASE.md`):
- Setiap rak dan setiap kategori (`K1, K2, K3, K4` maupun `R1, R2, R3, R4`) **bebas mengumpulkan token BPE bersih mutu *textbook* sebanyak-banyaknya tanpa batas atas (plafon) per kategori**.
- Pembersihan residu pada Rak K wajib mengutamakan perbaikan deterministik (*in-place repair*: kupas URL dan kalimat ekor navigasi berita dengan menyimpan isi artikel ≥200 karakter, pulihkan kapitalisasi kalimat dokumen *all-lowercase* `<0,2%` huruf kapital dengan daftar pengecualian singkatan, pindahkan dokumen Bahasa Inggris bersih dari `K1-part2` ke `R1-calon-pengetahuan-part*.jsonl.gz` di `penampungan-English` dan sebaliknya, kecualikan `K4/R4` coding dari filter bahasa 95% serta filter `NaN`/`undefined`, dan potong `.jsonl` mentah pada batas baris `\n` sehingga setiap `.jsonl.gz` memenuhi `0 < size_bytes <= 1.500.000.000` byte).
- Data dinyatakan resmi terbit (*published*) hanya setelah penggabungan lokal di VM (Tahap 10) lulus verifikasi fisik Gerbang 2 & Gerbang 3 (Tahap 11) dan seluruh berkas `.jsonl.gz`, `manifest.json`, serta `SHA256SUMS` selesai terunggah ke `K-dataset-Indonesian` atau `R-dataset-english` (Tahap 12).

Posisi saldo Rak K (`K-dataset-Indonesian`) saat ini:
- Dokumen K1+K2+K3: `91.395.436` dok / Lantai BPE K1+K2+K3 = `17.651.050.443` token BPE (dihitung dengan tokenizer resmi `rategoan-bpe`, `vocab_size: 32000`).
- `K1`: `7.390.037` dok / `2.205.108.688` BPE.
- `K2`: `2.717.091` dok / `434.724.058` BPE.
- `K3`: `81.288.308` dok / `15.011.217.697` BPE.
- `K4`: Berada di rak yang sama (`K4-coding-part1.jsonl.gz`), wajib dihitung masuk ke dalam `manifest.json` pada pembaruan berikutnya dan terus ditambah tanpa batas atas. Audio tidak diubah.

Posisi saldo Tingkat Penampungan (siap penggabungan lokal VM, re-audit fisik Gerbang 2 & 3, dan promosi ke Rak Final):
- `penampungan-Indonesian`: `K1` 4 berkas / `2.939.166.211` byte, `K2` 2 berkas / `2.281.383.426` byte, `K3` 6 berkas / `3.134.045.008` byte, `K4` 1 berkas / `167.485.879` byte. `K3-calon-pelengkap-part5.jsonl.gz` SHA-256 `010b63642cee8e908c06f67d0a9e6a31442c02814df2472dab85c20e681aa513`. `K3-calon-pelengkap-part6.jsonl.gz` `419.529.411` byte, SHA-256 `4e8a1b44b82516098dd27910435b279a7b0cd2d2f74af27d7888e46af5fbae47`.
- `penampungan-English`: `R1` 21 berkas / `11.426.267.803` byte / `9.173.600` dok di `manifest.json`. Dua berkas lama `textbook-en-part01.jsonl.gz` dan `textbook-en-part02.jsonl.gz` diseragamkan ke nama kanonik `R1-pengetahuan-part*.jsonl.gz` saat promosi ke `R-dataset-english`. `R2`, `R3`, dan `R4` terus disaring dari `data-baru-English`.

Tag korpus lama di luar 6 tag resmi (`korpus-*-bersih`, `penampung`, `data-baru`, `data-baru-20261002`, `prd-data-release`) dipensiunkan setelah asetnya pindah. Jangan dipakai training.
