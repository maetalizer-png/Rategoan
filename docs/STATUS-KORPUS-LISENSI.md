# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-22 (QC lanjut K1→K2→K3: dup, kalimat ulang, ekor patah. Bukan pangkas topik).
Git mengikuti manifest rak. PRD-GROK-BUILD hanya di tag `prd-data-release`.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v9 QC 7792951 dokumen, SHA concat `92c736cc…`; BPE 2236122314 (sebelum 2250160430) |
| `korpus-dialog-daerah-bersih` | K2 v8 QC 2777813 dokumen, SHA concat `e3744887…`; BPE 482952902 (sebelum 484678715) |
| `korpus-pelengkap-bersih` | K3 v13 QC 85471493 dokumen, SHA concat `4b66b3cf…`; BPE 15277086568 (sebelum 15680440223) |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` |
| `penampung-tersaring-2026-09` | laporan JSON (termasuk LAPORAN-QC-LANJUT.json) |
| `korpus-kode-bersih` | **K4 v1**. Token **tidak** dijumlahkan ke lantai K1+K2+K3 |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

## Token
Angka BPE dicatat 2026-09-22 dari manifest rak: **17996161784**
(K1 2236122314 + K2 482952902 + K3 15277086568).
Lantai 18415279368 turun hanya karena sampah patah/dup — dicatat jujur.

## QC lanjut
QC lanjut K1→K2→K3 (bukan pangkas topik, bukan buang hukum/berita karena tema). K1 dup=590 ubah=176360 patah=100310 BPE 2250160430→2236122314. K2 dup=919 ubah=64704 patah=25283 BPE 484678715→482952902. K3 dup=1834363 ubah=9916421 patah=14787897 BPE 15680440223→15277086568. Total 17996161784. lantai 18415279368 turun hanya sampah patah/dup. audio utuh. K4 tidak dijumlahkan.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Jangan K4 token ke lantai tiga rak.
Jangan pangkas K2 karena dup hukum / jangan buang berita karena tema.
Jangan masukkan enwiki ke K1. Jangan hapus audio. Jangan model luar.
Jangan commit `PRD-GROK-BUILD.md` ke git.
