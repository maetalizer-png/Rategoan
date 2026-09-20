# PRD Grok Build — satu perintah kerja

Jangan buat file PRD baru. Perbarui file ini.

## Alur (wajib urut)

```
mentah staging  →  saring  →  rak K  →  hapus tag/file mentah
```

Yang sudah di rak tidak disimpan lagi di staging.

## Rak hidup

| Tag | Isi |
|---|---|
| `korpus-ensiklopedia-bersih` | K1 |
| `korpus-dialog-daerah-bersih` | K2 |
| `korpus-pelengkap-bersih` | K3 |
| `korpus-kode-bersih` | K4 coding saja |
| `checkpoint-100m` / `checkpoint-200m` | model |
| `prd-data-release` | pagar + file ini |

Lantai K1+K2+K3 ≥ **16.794.935.092**. Jangan turun.

## Mentah yang sudah di rak — dihapus

Wikisource, IDX, quality-text, Indo4B, Indo4B-Plus, 1.8B, knowledge-science, manifest smoke.
Gzip penampung teks yang sudah digabung ke K juga dihapus. Laporan JSON tetap.

## Belum dihapus (alasan)

| Tag | Alasan |
|---|---|
| `id-hf-more-new-quality-2026-09` | ~89 GB belum selesai ke rak |
| `id-hf-safe-indonesian-audio-batch-2026-09` | audio, bukan teks rak |
| `penampung-kode-2026-09` | staging K4, K4 masih ~10 MB |

## Sisa kerja — satu sesi

1. Isi K4 ≥200 MB (The Stack JS permissive, MDN, Rosetta, repo). Part staging yang sudah di K4 dihapus.
2. Saring 89 GB `more-new-quality` ke K1/K3. Setelah masuk rak, hapus tag mentah itu.
3. Audio tetap sampai keputusan terpisah.

Jangan model luar. Jangan K5. Jangan berhenti setelah baca.
