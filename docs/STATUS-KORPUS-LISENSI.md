# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-10-17.

Spesifikasi yang berlaku: `docs/PRD-RELEASE.md` (dokumen Drive, 4 Oktober 2026). Salinan yang sama ada di Release tag `prd-data-release`, aset `PRD-RELEASE.md`.

Enam tag, tiga tingkat. Tag GitHub tanpa spasi.

| Tingkat | Indonesia | English |
|---|---|---|
| 1 mentah | `Data-baru-Indonesian` | `data-baru-English` |
| 2 calon | `penampungan-Indonesian` | `penampungan-English` |
| 3 rak | `K-dataset-Indonesian` | `R-dataset-english` |

Rak K tidak diubah bitnya. Bukan pangkas topik. Bukan hitung ulang BPE.

Dokumen tiga rak 91395436. Lantai BPE K1+K2+K3 = 17651050443.

K1 7390037 dok / 2205108688 BPE.
K2 2717091 dok / 434724058 BPE.
K3 81288308 dok / 15011217697 BPE.
K4 ada di rak yang sama, belum masuk lantai BPE di atas. Audio tidak diubah.

Penampungan adalah calon, bukan rak. BPE calon belum dihitung. Angka di bawah adalah berkas yang sudah ada di tag rilis pada 2026-10-12.

`penampungan-Indonesian`: K1 4 berkas / 2939166211 byte, K2 2 berkas / 2281383426 byte, K3 6 berkas / 3134045008 byte, K4 1 berkas / 167485879 byte. `K3-calon-pelengkap-part5.jsonl.gz` SHA-256 `010b63642cee8e908c06f67d0a9e6a31442c02814df2472dab85c20e681aa513`. `K3-calon-pelengkap-part6.jsonl.gz` 419529411 byte, SHA-256 `4e8a1b44b82516098dd27910435b279a7b0cd2d2f74af27d7888e46af5fbae47`.

`penampungan-English`: R1 21 berkas / 11426267803 byte / 9173600 dok di `manifest.json`. Dua berkas lama `textbook-en-part01.jsonl.gz` dan `textbook-en-part02.jsonl.gz` tetap di tag yang sama, bukan nama kanonik `R1-calon-`. R2, R3, dan R4 belum punya partisi penuh.

Saringan calon masih berjalan dari mentah. Ekor di bawah 400MB belum masuk angka di atas. Rak R final masih kosong.

Tag korpus lama (`korpus-*-bersih`, `penampung`, `data-baru`, `data-baru-20261002`) dipensiunkan setelah asetnya pindah. Jangan dipakai training.

## Catatan verifikasi rak final (2026-10-17)

Tag `K-dataset-Indonesian` dan `R-dataset-english` sekarang menunjuk commit `e5adc3f7dd5e1c00fc04d9b78465120a7c2b6f46`, bertanda tangan GitHub (Verified). Sebelumnya `26cd59f9ccb857e4a2c2e88f1e02d898eeb8625b`. Nama tag, aset, dan isi data tidak berubah. Rujuk rak lewat nama tag atau tautan unduhan aset, bukan lewat nomor commit.

SHA-256 seluruh 12 berkas di `SHA256SUMS` rak K (K1 sampai K4 dan `manifest.json`) dicocokkan dengan berkas di rilis pada 2026-10-17: semua cocok. Alurnya `.github/workflows/verifikasi-rilis.yml`. Rak R masih kosong, jadi centang Verified di R tidak berarti ada data.

