# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-11 (sinkron dengan `korpus-manifest-total.json`
setelah K3 v8 digabung — lihat commit yang menyertakan file ini).

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 2.012.126 dokumen, gzip 760,6 MB, SHA `7ce4830d…` |
| `korpus-dialog-daerah-bersih` | K2 20.356.241 dokumen, gzip 701,3 MB, SHA `3c64fee9…` |
| `korpus-pelengkap-bersih` | K3 v8 2.973.740 dokumen (termasuk 69.495 dokumen hukum Indonesia baru), gzip 640,3 MB, SHA `ec077604…` |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi (`access-control-allow-origin: *`) |
| `prd-data-release` | riwayat aturan awal penyaringan korpus (sudah dilebur ke dokumen internal) |

## RETIRE — `panen-madlad400-id`

Sample 600 baris (part 0011/0018/0027): spam ketat 8,8%, 1 frasa spam
12,3%, navigasi blog 15,3%. Bukan mayoritas judi murni tapi mayoritas
bukan ensiklopedia — tidak lolos aturan saring korpus, tidak digabung ke K1,
tidak dihitung ke token kanonik. Workflow `panen.yml` sudah dihapus,
tidak akan dipanen ulang otomatis.

## Token
Angka BPE dicatat 2026-09-11 (`check-korpus-manifest-sync.mjs`: SEMUA SINKRON): **5.223.639.069**
(K1 459.594.014 + K2 4.375.227.575 + K3 388.817.480).
Gerbang 1 miliar tercapai; target jangka panjang 4 miliar sudah terlewati.

## Dilarang
MADLAD / OSCAR / mC4 / tag `panen-*`. Workflow `panen.yml` sudah dihapus.

## Pintu data berikutnya
Dump `idwikibooks` / `idwikiquote` / `idwiktionary` + buku PD. Bukan HF crawl.
