# PRD-GROK-BUILD

Satu file perintah. Jangan buat PRD/tag/dokumen kerja baru.

Ikuti `PRD-RELEASE.md`: satu kategori satu tag. Setelah data di rak K, hapus mentah dan penampung.

## Status

K4 sudah ada (coding). K1–K3 sudah ada.
Wiki G3 0000–0029 sudah di K1 v8 (G4b). Git sudah mengikuti manifest rak.
Wiki **0030–0034 selesai disaring** 2026-09-21: semua `wikipedia.com` (enwiki), 0 dokumen ID sejati, **tidak masuk rak**.
G5 2026-09-21: K1 tidak bertambah: DOAB/edu/stackv2/math_id sample 0 ID sejati. 1 dokumen EN/IT DOAB lolos palsu (part07 Atlas of Renaissance Antiquarianism) tidak diangkat ke rak kanonik. K3 part28 +963947 dokumen / 117711691 BPE (kesehatan, agama, NLI/QA, hukum-QA, ringkasan, hf-safe ID). enwiki tidak diunduh. audio utuh. K4 tidak dijumlahkan. lantai 16794935092 aman.

## Wajib sekarang

1. Wiki 0019–habis: selesai. Jangan unduh wiki ≤0034 lagi.
2. Data baru dari sisa tag: masuk K1 (wiki/pelajaran ID) atau K3 (pelengkap ID). Bukan K2/K4. Bukan enwiki.
3. Tiap part rak baru: update di git `raget/raget-data/jsonl/external/korpus-manifest-total.json` dan `docs/STATUS-KORPUS-LISENSI.md`. Angka = manifest rak, bukan tebakan.
4. Audio jangan dihapus. Gzip wiki sisa penampung yang sudah di rak boleh dihapus.
5. Audio jangan dihapus. Jangan model luar. Lantai K1+K2+K3 jangan turun.

Jangan tulis Qwen/Qwen-Coder di body rak. Jangan seri v1/v2 di nama tag.
