# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-28. Git mengikuti manifest rak.
`PRD-GROK-BUILD` hanya di tag `prd-data-release`.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 7590198 dok / 2244713763 BPE. SHA `8ef96bc3…` |
| `korpus-dialog-daerah-bersih` | K2 2757898 dok / 462997126 BPE. SHA `7b23d622…` |
| `korpus-pelengkap-bersih` | K3 85471493 dok / 15277083398 BPE. SHA `6b8f99e5…` |
| `checkpoint-100m` | 100M |
| `checkpoint-200m` | arsip; PWA memakai HF `Maetalizer19/rategoan-neural` |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` |
| `penampung-tersaring-2026-09` | laporan JSON lama |
| `korpus-kode-bersih` | **K4**. Token tidak dijumlahkan ke lantai tiga rak |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dari manifest rak: **17984794287**
(K1 2244713763 + K2 462997126 + K3 15277083398).

## Sumber 2026-09-28
Situs BSE `buku.kemdikbud.go.id` tidak terjangkau. Wikibooks ID sudah ada di K1, tidak disaring ulang.
Masuk: id.wikisource.org CC BY-SA 4.0 / domain publik, 2194 dokumen, 8934637 BPE, digabung ke part terakhir K1.

## Dilarang
Jangan pangkas rak hidup. Jangan enwiki, Dolma, Stack-edu EN, Arxiv EN, crawl campur.
Jangan hapus audio. Jangan K4 ke lantai tiga rak. Jangan nomor seri. Jangan latih.
Jangan commit `PRD-GROK-BUILD.md` ke git.
