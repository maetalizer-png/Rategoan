# Status Fase A (A4 Wikimedia)

## Yang sudah dikerjakan di sesi ini
- Dump kecil (wikibooks, wikisource, wiktionary, wikivoyage, wikiquote) berhasil diunduh & di-clean (~13,8 juta kata).
- Dump idwiki (~1,18 GB) berhasil diunduh; proses clean sudah jalan (puluhan ribu artikel) sebelum sandbox ephemeral menghapus `/tmp`.

## Kendala
Sandbox tidak persistent. File besar di `/tmp` hilang sebelum upload Release selesai.

## Cara menyelesaikan A4 (wajib Colab/lokal)
```bash
python raget/raget-tools/build-a4-wikimedia-clean.py --work ./a4_work
```
Lalu upload:
- `korpus-a4-wikimedia-clean.jsonl.gz`
- `manifest-a4-wikimedia-clean.json`
ke Release tag `korpus-a4-wikimedia-clean`
Nama: **A4 · Korpus AMAN — Wikimedia terbaru**

## Sementara untuk training
Tetap pakai **A1 + A3** (sudah di Release/repo). A1 isinya sama jenis (Wikimedia clean).
