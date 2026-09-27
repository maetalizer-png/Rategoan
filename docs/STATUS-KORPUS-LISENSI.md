# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-25 (mutu K1→K2→K3 + wikibooks ID). Git mengikuti manifest rak.
`PRD-GROK-BUILD` hanya di tag `prd-data-release`.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 K1 ensiklopedia mutu: 7588004 dokumen / 2235779126 BPE (sebelum 2236191408). SHA concat Gerbang 2. SHA `2a3824d1…` |
| `korpus-dialog-daerah-bersih` | K2 K2 v9 mutu: 2757898 dokumen / 462997126 BPE (sebelum 482952902). SHA concat Gerbang 2. SHA `4be4466e…` |
| `korpus-pelengkap-bersih` | K3 K3 pelengkap mutu: 85471493 dokumen / 15277083398 BPE (sebelum 15277086568). SHA concat Gerbang 2. SHA `0801e475…` |
| `checkpoint-100m` | 100M |
| `checkpoint-200m` | arsip; PWA memakai HF `Maetalizer19/rategoan-neural` |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` + `LAPORAN-MUTU.json` |
| `penampung-tersaring-2026-09` | laporan JSON lama |
| `korpus-kode-bersih` | **K4**. Token tidak dijumlahkan ke lantai tiga rak |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dari manifest rak: **17975859650**
(K1 2235779126 + K2 462997126 + K3 15277083398).

## Mutu
Header ulang dan pasal identik di dalam dokumen dihapus. Hukum/berita tidak dibuang. Ubah 171 dok. BPE 15277086568 -> 15277083398.

## Dilarang
Jangan pangkas karena topik. Jangan buang hukum/berita karena temanya.
Jangan K4 ke lantai tiga rak. Jangan enwiki. Jangan hapus audio. Jangan model luar. Jangan latih 1B di gelombang mutu.
Jangan commit `PRD-GROK-BUILD.md` ke git.
