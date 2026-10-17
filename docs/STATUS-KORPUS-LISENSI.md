# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-10-17.

Spesifikasi yang berlaku: `docs/PRD-RELEASE.md` (dokumen Drive `PRD RELEASE`, Oktober 2026). Salinan yang sama ada di Release tag `prd-data-release`, aset `PRD-RELEASE.md`.

Enam tag, tiga tingkat. Tag GitHub tanpa spasi:
- Tingkat 1 (Mentah): `Data-baru-Indonesian` dan `data-baru-English`
- Tingkat 2 (Calon Korpus): `penampungan-Indonesian` dan `penampungan-English`
- Tingkat 3 (Rak Final Textbook): `K-dataset-Indonesian` dan `R-dataset-english`

Prinsip akumulasi korpus:
- Setiap rak dan kategori (`K1, K2, K3, K4` maupun `R1, R2, R3, R4`) **bebas mengumpulkan token BPE bersih sebanyak-banyaknya tanpa batas maksimal per kategori**.
- Untuk kebutuhan pelatihan model 1,5B parameter, sasaran kecukupan korpus gabungan (Rak K + Rak R) adalah **minimal 27–30 miliar token BPE ke atas** berstandar mutu *textbook*.
- Pembersihan residu pada Rak K wajib mengutamakan perbaikan teks (*in-place repair*: kupas URL/ekor navigasi berita, pulihkan kapitalisasi kalimat *all-lowercase*, pindahkan dokumen Bahasa Inggris `K1-part2` ke Rak R, dan potong partisi pada batas baris `\n`) serta dilakukan serentak dengan penggabungan calon korpus dari `penampungan` agar jumlah token bersih terus bertambah naik dan tidak merosot.

Posisi saldo Rak K (`K-dataset-Indonesian`) saat ini:
- Dokumen K1+K2+K3: `91.395.436` dok / Lantai BPE K1+K2+K3 = `17.651.050.443` token BPE.
- `K1`: `7.390.037` dok / `2.205.108.688` BPE.
- `K2`: `2.717.091` dok / `434.724.058` BPE.
- `K3`: `81.288.308` dok / `15.011.217.697` BPE.
- `K4`: Berada di rak yang sama (`K4-coding-part1.jsonl.gz`), wajib dihitung masuk ke dalam `manifest.json` pada pembaruan berikutnya dan terus ditambah tanpa batas atas. Audio tidak diubah.

Posisi saldo Tingkat Penampungan (siap QC akhir & promosi ke Rak Final):
- `penampungan-Indonesian`: `K1` 4 berkas / `2.939.166.211` byte, `K2` 2 berkas / `2.281.383.426` byte, `K3` 6 berkas / `3.134.045.008` byte, `K4` 1 berkas / `167.485.879` byte. `K3-calon-pelengkap-part5.jsonl.gz` SHA-256 `010b63642cee8e908c06f67d0a9e6a31442c02814df2472dab85c20e681aa513`. `K3-calon-pelengkap-part6.jsonl.gz` `419.529.411` byte, SHA-256 `4e8a1b44b82516098dd27910435b279a7b0cd2d2f74af27d7888e46af5fbae47`.
- `penampungan-English`: `R1` 21 berkas / `11.426.267.803` byte / `9.173.600` dok di `manifest.json`. Dua berkas lama `textbook-en-part01.jsonl.gz` dan `textbook-en-part02.jsonl.gz` diseragamkan ke nama kanonik `R1-` saat promosi ke `R-dataset-english`. `R2`, `R3`, dan `R4` terus disaring dari `data-baru-English`.

Tag korpus lama (`korpus-*-bersih`, `penampung`, `data-baru`, `data-baru-20261002`) dipensiunkan setelah asetnya pindah. Jangan dipakai training.
