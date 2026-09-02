# PRD — Perintah untuk Grok (aktif)

Status: **BERLAKU 2026-09-02 siang.**  
Antrian besar ada di `PRD-PENGEMBANGAN-RATEGOAN.md`. Dokumen ini hanya
sisa kerja Grok. **Jangan** panen OSCAR / mC4 / MADLAD / tag `panen-*`.

## Sudah selesai
- Checkpoint 200M di `huggingface.co/Maetalizer19/rategoan-neural`
- CORS resolve: `access-control-allow-origin: *`
- Folder `checkpoint-200m/` dihapus dari git
- K2: wiki daerah + PersonaChat (638.371 dokumen)
- K3: Wikisource ID (99.557 dokumen)
- Ronde A sebagian: sekolah-izin, layanan-kantor-bank, sapaan-transportasi

## Sisa Grok (kerjakan dari sini, bukan HF berputar)
1. Lanjut Ronde A: JSON kerja / kesehatan / desa di folder yang sudah ada.
2. Rapikan `docs/STATUS-KORPUS-LISENSI.md` supaya cocok Release hidup.
3. Jangan unggah Release kecuali ada file gzip final + SHA §8.

## Kerja Claude (bukan Grok)
Tempel SATU perintah di `PRD-PENGEMBANGAN-RATEGOAN.md` §7 — mulai Ronde B
(200M 60 menit) atau C1 (hitung BPE). Jangan A–G sekaligus.
