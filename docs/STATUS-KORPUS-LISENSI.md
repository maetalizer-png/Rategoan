# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-01 malam (Claude, setelah Grok gabung Wikipedia unik ke K1)

## Release aktif
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1, **759.587 dokumen** (683.516 asli + 76.071 unik dari Wikipedia, digabung Grok ~19:58 UTC), SHA256 `3383bc30…` |
| `korpus-dialog-daerah-bersih` | K2 dialog+daerah, 291.928 dokumen |
| `korpus-pelengkap-bersih` | K3 sister project ID, 97.548 dokumen |
| `checkpoint-100m` | neural 100M |
| `checkpoint-200m` | neural 200M sesi training ke-2, SHA256 `b5aeb665…`, 171.344.036 B, PPL 1242,11 |
| `prd-data-release` | pagar PRD |

**Total token BPE kanonik (K1+K2+K3) saat ini: 471.390.047** — lihat
`raget/raget-data/jsonl/external/korpus-manifest-total.json` untuk rincian
per rak. Ini SATU-SATUNYA angka valid, naik dari 420.930.740 setelah
Wikipedia unik masuk K1.

## Panen diproses

- `panen-madlad400-id` — **RETIRE 2x** (harvest lama 150rb dok: judi/
  forex/blog; harvest sore 15,2 juta dok/11 part 0000-0010: sample 750
  baris, spam judi/forex/slot **18,7%**). **PENTING**: sebuah batch BARU
  (15.272.217 dokumen, part 0011-0021) muncul di Release ~16:21-16:36
  UTC 2026-09-01, part lama sudah tidak ada di asset — batch ini BELUM
  direview, kesimpulan retire di atas tidak otomatis berlaku ke batch
  ini. Instruksi: `PRD-PERINTAH-GROK.md` §3-4.
- `panen-wikipedia-id` — **SELESAI, digabung sebagian ke K1** (bukan
  retire). Koreksi atas kesimpulan sementara sebelumnya ("artikel
  pertama identik K1 → diduga overlap penuh, retire"): Grok melakukan
  dedupe per-fingerprint yang lebih presisi dan menemukan dari 562.195
  dokumen, 238.873 duplikat + 247.251 terlalu pendek dibuang, **76.071
  dokumen benar-benar unik** — digabung ke K1 (lihat baris K1 di atas).
  Kesimpulan Grok lebih akurat daripada dugaan overlap-penuh awal.

## Branch
- `staging/korpus-parts` sudah tidak ada.
