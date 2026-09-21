# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-21 (G5c pecah staging: dialog/instruksi ke K2 v7, pelengkap ke K3 v12).
Git mengikuti manifest rak. PRD-GROK-BUILD hanya di tag `prd-data-release`. K1 v8 utuh.

## Release hidup
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 v8 G4b 7796681 dokumen, gzip 2929.6 MB, SHA concat `fced450c…`; part06 154432 dokumen / 1103823552 BPE |
| `korpus-dialog-daerah-bersih` | K2 v7 G5c 2778770 dokumen, SHA concat `221d4b56…`; korpus-dialog-daerah-bersih.jsonl.gz.part01 1971212 dok / 374437719 B |
| `korpus-pelengkap-bersih` | K3 v12 G5c 86750230 dokumen, SHA concat `78c10536…`; korpus-pelengkap-bersih.jsonl.gz.part29 11873 dok / 1213045 B |
| `checkpoint-100m` | 100M di GitHub Release |
| `checkpoint-200m` | arsip PPL 1068; **yang dipakai PWA** = HF `Maetalizer19/rategoan-neural` SHA `69daa21d…` PPL 932, CORS terkonfirmasi |
| `prd-data-release` | pagar `PRD-RELEASE.md` + perintah `PRD-GROK-BUILD.md` |
| `penampung-tersaring-2026-09` | laporan G5/G5c tetap |
| `korpus-kode-bersih` | **K4 v1**. Token **tidak** dijumlahkan ke lantai K1+K2+K3 |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio — jangan dihapus |

Tag staging `id-hf-more-new-quality-2026-09` **dihapus** setelah isinya naik rak.

## Token
Angka BPE dicatat 2026-09-21 dari manifest rak: **18415279368**
(K1 2250160430 + K2 484678715 + K3 15680440223).
Lantai 18194291698 tidak turun.

## G5c
G5c pecah sisa staging sesuai PRD rilis: dialog/instruksi (LaMini/alpaca/sharegpt/cahya/skenario) ke K2 v7 +1971212 dokumen / 219863552 BPE; pelengkap (KBBI/resep/penalaran/idiom/olahraga/keuangan/headline) ke K3 v12 +11873 dokumen / 1124118 BPE. Headline yang gagal gerbang dibuang. K1 v8 utuh. enwiki tidak diunduh. audio utuh. K4 tidak dijumlahkan. Staging dihapus. lantai 18194291698 aman.

## Dilarang
MADLAD / OSCAR mentah / mC4 / tag `panen-*` sebagai rak kanonik baru.
Jangan K4 token ke lantai tiga rak.
Jangan pangkas K2 karena dup hukum.
Jangan masukkan enwiki ke K1. Jangan hapus audio. Jangan model luar.
Jangan commit `PRD-GROK-BUILD.md` ke git.
