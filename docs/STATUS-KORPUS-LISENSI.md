# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-21 (G5 pelengkap ID ke K3 v11). Git mengikuti manifest rak.
K1 v8 utuh. 1 dokumen EN DOAB lolos palsu tidak diangkat.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v8 G4b 7796681 dokumen, gzip 2929.6 MB, SHA concat `fced450c…`; part06 154432 dokumen / 1103823552 BPE |
| `korpus-dialog-daerah-bersih` | K2 v6 807.558 dokumen, gzip 174.7 MB, SHA `29690c3b…` (G1 pindah hukum + G2 QC sapaan) |
| `korpus-pelengkap-bersih` | K3 v11 G5 86738357 dokumen, SHA concat `afeb27f7…`; part28 963947 / 117711691 BPE |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |
| `penampung-tersaring-2026-09` | laporan G5 tetap |
| `penampung-kode-2026-09` | staging G6, bukan rak kanonik, tidak masuk lantai tiga rak |
| `korpus-kode-bersih` | **K4 v1**. Token **tidak** dijumlahkan ke lantai K1+K2+K3 |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dicatat 2026-09-21 dari manifest rak: **18194291698**
(K1 2250160430 + K2 264815163 + K3 15679316105).
Lantai 16794935092 tidak turun.

## G5
K1 tidak bertambah: DOAB/edu/stackv2/math_id sample 0 ID sejati. 1 dokumen EN/IT DOAB lolos palsu (part07 Atlas of Renaissance Antiquarianism) tidak diangkat ke rak kanonik. K3 part28 +963947 dokumen / 117711691 BPE (kesehatan, agama, NLI/QA, hukum-QA, ringkasan, hf-safe ID). enwiki tidak diunduh. audio utuh. K4 tidak dijumlahkan. lantai 16794935092 aman.

DOAB / stackv2_edu / math_id / dolma / html / arxiv: sample 0 ID (bahasa bukan Indonesia). Tidak masuk rak.
K3 sumber ID: kesehatan-berita, korpus keagamaan, NLI/QA Indo, legal QA, ringkasan, hf-safe teks ID.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Jangan K4 token ke lantai tiga rak.
Jangan pangkas K2 karena dup hukum.
Jangan masukkan enwiki ke K1. Jangan hapus audio. Jangan model luar.
