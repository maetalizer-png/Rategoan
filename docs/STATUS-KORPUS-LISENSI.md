# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-21 (git disinkron ke manifest rak K1 v8 G4b;
wiki 0030–0034 disaring, 0 ID, tidak masuk rak).

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v8 G4b 7.796.681 dokumen, gzip 2929.6 MB, SHA concat `fced450c…`; part06 154.432 dokumen / 1.103.823.552 BPE |
| `korpus-dialog-daerah-bersih` | K2 v6 807.558 dokumen, gzip 174.7 MB, SHA `29690c3b…` (G1 pindah hukum + G2 QC sapaan) |
| `korpus-pelengkap-bersih` | K3 v10 85.774.410 dokumen, 28 part, SHA concat `4852018c…`; part26-27 hukum unik dari K2 |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |
| `penampung-tersaring-2026-09` | laporan tetap; gzip wiki 0003–0029 yang sudah di rak dihapus |
| `penampung-kode-2026-09` | staging G6, bukan rak kanonik, tidak masuk lantai tiga rak |
| `korpus-kode-bersih` | **K4 v1**. Token **tidak** dijumlahkan ke lantai K1+K2+K3 |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dicatat 2026-09-21 dari manifest rak: **18.076.580.007**
(K1 2.250.160.430 + K2 264.815.163 + K3 15.561.604.414).
Lantai 16.794.935.092 tidak turun. Wiki 0030–0034 tidak menambah token.

## G1–G4b + wiki 0030–0034
- G1: QA regulasi unik 19.549.205 / 4.110.436.143 BPE K2→K3. Dup 122.320 tetap di K2.
- G2: QC sapaan K2; total ≥ lantai.
- G3: saring staging `id-hf-more-new-quality` ke penampung `*-bersih`. Wiki 0000–0029 sudah di K1.
- G4: wiki/edu G3 unik → K1 v7 part05.
- G4b: wiki 0003–0029 unik → K1 v8 part06. Git 2026-09-21 mengikuti manifest rak, bukan tebakan.
- Wiki 0030–0034: seluruh shard `wikipedia.com` (enwiki). 0 artikel ID sejati (gerbang `adalah` + rasio kata-tugas). Tidak masuk K1/K2/K3/K4. Mentah wiki di tag staging dihapus.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Jangan K4 token ke lantai tiga rak.
Jangan pangkas K2 karena dup hukum.
Jangan masukkan enwiki ke K1. Jangan hapus audio. Jangan model luar.

## Pintu data berikutnya
DOAB / pelajaran sisa di `id-hf-more-new-quality-2026-09` → saring → K1 jika ID.
Crawl/edu sisa → K3 jika ID. Bukan HF crawl mentah. Bukan audio. Bukan enwiki.
