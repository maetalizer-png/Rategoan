# Dapur GPU — jalur sah

## Colab gratis
Tidak ada API resmi untuk Connect T4 + Run All tanpa klik.
Yang resmi hanya [Colab Enterprise / Vertex](https://docs.cloud.google.com/colab/docs/schedule-notebook-run) (butuh proyek GCP + billing).
Otomasi browser Colab gratis = langgar ToS. Tidak dipakai.

## Kaggle (dipilih)
Dokumen: https://github.com/Kaggle/kaggle-api/blob/main/docs/kernels.md

1. Buat API token di akun Kaggle (Account > Create New API Token). Simpan sebagai secret, jangan commit.
2. Tambah secret kernel `GITHUB_TOKEN`.
3. Edit `kaggle/kernel-metadata.json` field `id` = `username/rategoan-latih-gpu`.
4. Uji: `kaggle kernels push -p kaggle --accelerator NvidiaTeslaT4` dengan MODEL_SIZE=50m, 5 menit.
5. Baru jadwal 200m 60 menit setelah uji lolos.

Sisa langkah manusia: sekali isi secret + sekali `kernels push` (atau GitHub Action dengan secret store). Nol klik di UI Colab, bukan nol setup awal.
