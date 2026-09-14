# Skenario proses data mentah → korpus (berlaku 2026-09-14)

Sumber aturan: `PRD/PRD-RELEASE.md` §0–§5b dan `PRD/PRD-MANUS-DATA-MENTAH.md`.
Angka BPE resmi yang tidak boleh turun: **5.223.639.069** (K1+K2+K3).

## Pagar

- Mentah tetap di tag staging. Jangan timpa K1/K2/K3 sebelum bersih.
- Hanya 3 rak: `korpus-ensiklopedia-bersih` / `korpus-dialog-daerah-bersih` / `korpus-pelengkap-bersih`.
- Tidak ada K4, tidak ada tag `korpus-<nama-dataset>-bersih`.
- Urutan: extract → clean → dedupe (lintas batch + rak lama) → filter `id*` → gabung rak → **baru** tokenize BPE vocab 30368 → SHA gzip final → publish timpa tag rak → sync git manifest → hapus staging yang 100% masuk.
- Audio staging bukan korpus teks. Jangan masuk K1–K3.

## Antrian

| Urutan | Tag staging | Kandidat rak | Catatan |
|---|---|---|---|
| A | `id-wikisource-public-text-2026-09` | K3 pelengkap | ~50MB×4 jsonl, Wikimedia, tinjau hak halaman dulu |
| B | `id-hf-idx-prose-filtered-2026-09` | K3 | prosa/profil, niche |
| C | `id-hf-quality-text-batch-2026-09` | pecah: berita→K3, regulation QA→K2 | parquet; dedupe vs K2 hukum |
| D | `id-hf-more-new-quality-2026-09` | isi dulu, baru rak | jangan tebak sebelum sample |
| E | `indo4b-*` + `id-corpus-1p8b-split-*` | K1 setelah saring ketat | SATU keluarga; dedupe silang dulu; preseden MADLAD |
| Tahan | `id-hf-safe-indonesian-audio-*` | bukan rak teks | di luar skenario ini |
| Tahan | garuda / LaMini (kalau masih di staging lama) | jangan paksa ke dialog | lisensi / terjemahan mesin |
| Stub | `id-training-data-manifest-2026-09` | retire setelah E | bukan payload |

## Satu batch = satu laporan

1. Sample 200–500 baris: bahasa, panjang, spam, lisensi.
2. Extract JSONL `{text,source,license,lang}`.
3. Dedupe fingerprint vs batch + file rak tujuan.
4. Filter bahasa pada field `text`, bukan baris JSON mentah.
5. Jika lolos dan ≥20MB bersih (atau gabung XS ke rak): unduh gzip rak, gabung, dedupe ulang, gzip -9.
6. Tokenize BPE resmi, tulis `totalTokenBPEResmi` (angka rak lama + baru bersih, tidak boleh lebih kecil dari angka resmi tanpa alasan tertulis).
7. `publish-korpus-release.py` timpa tag rak + manifest + `komposisiBahasa`.
8. `sync-manifest-from-release.mjs` + `check-korpus-manifest-sync.mjs` + `STATUS-KORPUS-LISENSI.md`.
9. Hapus tag staging hanya jika isinya sudah 100% di rak.

Batch A (Wikisource) dikerjakan dulu karena paling sesuai pintu PRD (Wikimedia + PD), volume terukur, bukan crawl.
