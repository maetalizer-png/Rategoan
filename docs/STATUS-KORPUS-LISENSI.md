# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-10-03.

Spesifikasi yang berlaku: `docs/PRD/PRD-RELEASE.md` (dokumen Drive, 4 Oktober 2026). Salinan yang sama ada di Release tag `prd-data-release`, aset `PRD-RELEASE.md`.

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

Rak R dan penampungan English masih kosong. Mentah Inggris (PubMed, peS2o, StackExchange, Cosmopedia) tinggal di `data-baru-English`. Belum disaring, jadi belum naik.

Tag korpus lama (`korpus-*-bersih`, `penampung`, `data-baru`, `data-baru-20261002`) dipensiunkan setelah asetnya pindah. Jangan dipakai training.
