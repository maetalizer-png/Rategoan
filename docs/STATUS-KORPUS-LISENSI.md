# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-25 (mutu K1→K2→K3 + wikibooks ID). Git mengikuti manifest rak.
`PRD-GROK-BUILD` hanya di tag `prd-data-release`.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 K1 v10 mutu: 7384487 dokumen / 987475894 BPE (sebelum 2236122314). SHA concat Gerbang 2. SHA `4bf61d88…` |
| `korpus-dialog-daerah-bersih` | K2 K2 v8 QC lanjut: 2777813 dokumen / 482952902 BPE (sebelum 484678715; dup 919, ubah 64704, kalimat ulang 20355, patah 25283). SHA concat Gerbang 2. SHA `e3744887…` |
| `korpus-pelengkap-bersih` | K3 K3 v13 QC lanjut: 85471493 dokumen / 15277086568 BPE (sebelum 15680440223; dup 1834363, ubah 9916421, kalimat ulang 33167, patah 14787897). SHA concat Gerbang 2. SHA `4b66b3cf…` |
| `checkpoint-100m` | 100M |
| `checkpoint-200m` | arsip; PWA memakai HF `Maetalizer19/rategoan-neural` |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` + `LAPORAN-MUTU.json` |
| `penampung-tersaring-2026-09` | laporan JSON lama |
| `korpus-kode-bersih` | **K4**. Token tidak dijumlahkan ke lantai tiga rak |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dari manifest rak: **16747515364**
(K1 987475894 + K2 482952902 + K3 15277086568).

## Mutu
K1 v10 mutu + wikibooks, K2/K3 belum.

## Dilarang
Jangan pangkas karena topik. Jangan buang hukum/berita karena temanya.
Jangan K4 ke lantai tiga rak. Jangan enwiki. Jangan hapus audio. Jangan model luar. Jangan latih 1B di gelombang mutu.
Jangan commit `PRD-GROK-BUILD.md` ke git.
