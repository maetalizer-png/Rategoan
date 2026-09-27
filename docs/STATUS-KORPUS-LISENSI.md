# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-25 (mutu K1→K2→K3 + wikibooks ID). Git mengikuti manifest rak.
`PRD-GROK-BUILD` hanya di tag `prd-data-release`.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 K1 ensiklopedia mutu: 7588004 dokumen / 2236191408 BPE (sebelum 2236122314). SHA concat Gerbang 2. SHA `6b8085eb…` |
| `korpus-dialog-daerah-bersih` | K2 K2 v9 mutu: 2757898 dokumen / 462997126 BPE (sebelum 482952902). SHA concat Gerbang 2. SHA `4be4466e…` |
| `korpus-pelengkap-bersih` | K3 K3 v13 QC lanjut: 85471493 dokumen / 15277086568 BPE (sebelum 15680440223; dup 1834363, ubah 9916421, kalimat ulang 33167, patah 14787897). SHA concat Gerbang 2. SHA `4b66b3cf…` |
| `checkpoint-100m` | 100M |
| `checkpoint-200m` | arsip; PWA memakai HF `Maetalizer19/rategoan-neural` |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` + `LAPORAN-MUTU.json` |
| `penampung-tersaring-2026-09` | laporan JSON lama |
| `korpus-kode-bersih` | **K4**. Token tidak dijumlahkan ke lantai tiga rak |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dari manifest rak: **17976275102**
(K1 2236191408 + K2 462997126 + K3 15277086568).

## Mutu
K1 ditutup selisihnya. BPE 1938337197 naik 297854211 menjadi 2236191408. Dokumen panjang dikembalikan 4252. Target sebelum pangkas 2236122314. K2 tidak disentuh. K3 tidak diubah. Tanpa nomor seri.

## Dilarang
Jangan pangkas karena topik. Jangan buang hukum/berita karena temanya.
Jangan K4 ke lantai tiga rak. Jangan enwiki. Jangan hapus audio. Jangan model luar. Jangan latih 1B di gelombang mutu.
Jangan commit `PRD-GROK-BUILD.md` ke git.
