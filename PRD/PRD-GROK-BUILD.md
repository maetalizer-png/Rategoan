# PRD-GROK-BUILD

Satu file perintah. Jangan buat PRD/tag/dokumen kerja baru.

Ikuti `PRD-RELEASE.md`: satu kategori satu tag. Setelah data di rak K, hapus mentah dan penampung.

## Status

K4 sudah ada (coding). K1–K3 sudah ada.
Wiki G3 0000–0029 sudah di K1 v8 (G4b). Git sudah mengikuti manifest rak.
Wiki **0030–0034 selesai disaring** 2026-09-21: semua `wikipedia.com` (enwiki), 0 dokumen ID sejati, **tidak masuk rak**. Lantai tidak turun.
Mentah wiki di tag staging dihapus. Gzip wiki penampung yang sudah di rak dihapus. Laporan tetap. Audio tetap.

Sisa tag `id-hf-more-new-quality-2026-09`: DOAB / edu / crawl (bukan wiki).

## Wajib sekarang

1. Wiki 0019–habis: selesai. Jangan unduh wiki ≤0334 lagi.
2. Data baru dari sisa tag: masuk K1 (wiki/pelajaran ID) atau K3 (pelengkap ID). Bukan K2/K4. Bukan enwiki.
3. Tiap part rak baru: update di git `raget/raget-data/jsonl/external/korpus-manifest-total.json` dan `docs/STATUS-KORPUS-LISENSI.md`. Angka = manifest rak, bukan tebakan.
4. Tag staging masih hidup karena DOAB/edu belum di rak. Jangan hapus audio. Gzip wiki sisa penampung yang sudah di rak boleh dihapus.
5. Audio jangan dihapus. Jangan model luar. Lantai K1+K2+K3 jangan turun.

Jangan tulis Qwen/Qwen-Coder di body rak. Jangan seri v1/v2 di nama tag.
