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


## Hasil kerja 2026-09-14 (sesi ini)

K3 kanonik v8 SHA `ec07760453fa6cd9d3728ba5edc04b67f5c02f9c8061206060e5f0088ebf2d55` **terverifikasi** (gzip 640.253.994 B).

### Batch A Wikisource — bersih selesai, BELUM di-publish ke rak

Sumber: `id-wikisource-public-text-2026-09` (64.531 dokumen mentah).
Saring: buang judul meta wiki, <30 kata, fingerprint SHA1 vs seluruh K3 v8.

| Metrik | Angka |
|---|---:|
| masuk | 64.531 |
| buang judul meta | 850 |
| buang pendek | 228 |
| duplikat internal | 869 |
| duplikat K3 | 1.188 |
| **lolos bersih** | **61.396** |
| kata approx | 17.294.340 |

File bersih sesi: ~129 MB JSONL. Tokenizer BPE resmi diekstrak dari checkpoint 100M (30.108 merges / 30.364 piece).

**Tidak di-upload ke `korpus-pelengkap-bersih`.** Gabungan gzip v9 + hitung BPE penuh + publish terputus (workspace sesi terhapus sebelum segel). Angka BPE resmi proyek **tetap 5.223.639.069**. Rak tidak disentuh.

### Batch B–E

Tidak diproses di sesi ini. IDX ~1,3 GB, quality-text parquet besar, Indo4B keluarga ~37 GB: tidak muat dituntaskan aman dalam 60 menit tanpa merusak angka resmi.

Lanjut wajib: ulang extract A dari staging (masih utuh), tokenize 61.396 dokumen, `zcat K3 + bersih | gzip -9`, SHA, `publish-korpus-release.py` timpa K3, sync manifest git, baru retire tag Wikisource.


## Penampung tersaring (bukan rak) — 2026-09-14

Tag staging: `penampung-tersaring-2026-09`. **Tidak menimpa K1/K2/K3.**

| File | Lolos | Kata approx |
|---|---:|---:|
| wikisource-id-bersih.jsonl.gz | 58.801 | 19.693.015 |
| kesehatan-berita-bersih.jsonl.gz | 17.292 | 1.594.041 |
| hukum-qa-bersih.jsonl.gz | 8.019 | 11.549.656 |
| mrc-nli-bersih.jsonl.gz | 3.259 | 285.399 |
| nli-bersih.jsonl.gz | 377 | 16.647 |
| dialog-skenario-bersih.jsonl.gz | 146 | 12.444 |
| ringkasan-bersih.jsonl.gz | 120 | 24.176 |


Perintah mesin untuk Grok Build: `docs/PERINTAH-GROK-BUILD-BERSIH.md` (bersih ke penampung, bukan ke rak).
