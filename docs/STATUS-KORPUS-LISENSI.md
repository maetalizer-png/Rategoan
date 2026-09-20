# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-20 (G4 sinkron dengan `korpus-manifest-total.json`
setelah K1 v7 / K2 v6 / K3 v10).

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v7 7.642.249 dokumen, gzip 1796.7 MB, SHA concat `182aab09…`; part05 G3 wiki/edu unik 25.209 dokumen / 177.821.331 BPE |
| `korpus-dialog-daerah-bersih` | K2 v6 807.558 dokumen, gzip 174.7 MB, SHA `29690c3b…` (G1 pindah hukum + G2 QC sapaan) |
| `korpus-pelengkap-bersih` | K3 v10 85.774.410 dokumen, 28 part, SHA concat `4852018c…`; part26-27 hukum unik dari K2 |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |
| `penampung-tersaring-2026-09` | tetap utuh; sumber merge, bukan rak kanonik. G3 `*-bersih` dari `id-hf-more-new-quality-2026-09` di sini |
| `penampung-kode-2026-09` | staging G6, bukan rak kanonik, tidak masuk lantai 16,79 miliar |
| `korpus-kode-bersih` | **K4 v1** (dirigen 20 Sep). Token **tidak** dijumlahkan ke 16.794.935.092 |

## Token
Angka BPE dicatat 2026-09-20 G4: **16.972.756.455**
(K1 1.146.336.878 + K2 264.815.163 + K3 15.561.604.414).
Lantai 16.794.935.092 tidak turun. Tambahan = BPE dokumen baru G2 (+32) + G4 (+177.821.331) saja; rak lama tidak diukur ulang.

## G1–G4
- G1: QA regulasi unik 19.549.205 / 4.110.436.143 BPE K2→K3. Dup 122.320 tetap di K2.
- G2: QC sapaan K2; 10 sapaan unik; total 16.794.935.124 ≥ lantai.
- G3: saring staging `id-hf-more-new-quality` ke penampung `*-bersih` (spam sampel 0%). Sisa shard wiki masih diantrikan.
- G4: wiki/edu G3 unik → K1 v7 part05. Dedup sha1-400 vs K1 v6 (4 dup). Penampung tidak dihapus.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Jangan hapus penampung teks. Jangan K4 token ke lantai tiga rak.
Jangan pangkas K2 karena dup hukum.

## Pintu data berikutnya
Sisa shard `rategoan_wikimedia_*` / DOAB di staging → penampung → K1.
Crawl/edu sisa → K3. Bukan HF crawl mentah. Bukan audio.
