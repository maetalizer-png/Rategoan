# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-02 siang

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 ~759.587 dokumen, gzip 571 MB, SHA `3383bc30…` |
| `korpus-dialog-daerah-bersih` | K2 638.371 dokumen, gzip 131 MB, SHA `e0dd2c6a…` |
| `korpus-pelengkap-bersih` | K3 99.557 dokumen, gzip 54 MB, SHA `2bf11202…` |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932 |
| `prd-data-release` | pagar PRD |

## Token
Angka BPE yang dicatat Claude 2026-09-02: **543.202.593**
(K1 354.376.464 + K2 151.487.572 + K3 37.338.557).
Target 2–4 miliar belum tercapai.

## Dilarang
MADLAD / OSCAR / mC4 / tag `panen-*`. Workflow `panen.yml` sudah dihapus.

## Pintu data berikutnya
Dump `idwikibooks` / `idwikiquote` / `idwiktionary` + buku PD. Bukan HF crawl.
