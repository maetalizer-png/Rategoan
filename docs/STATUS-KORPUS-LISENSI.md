# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-01 malam (PRD-PERINTAH-GROK ronde sore)

## Release aktif
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1 idwiki jilid1, 683.516 dokumen |
| `korpus-dialog-daerah-bersih` | K2 dialog+daerah |
| `korpus-pelengkap-bersih` | K3 sister project ID |
| `checkpoint-100m` | neural 100M |
| `checkpoint-200m` | neural 200M ronde 2026-09-01, SHA256 `5286b900…`, 171.344.040 B |
| `prd-data-release` | pagar PRD |

## Retire ronde ini
- `panen-madlad400-id` (15,2 juta dokumen, 11 part): sample 750 baris dari part 0000/0005/0010. Bahasa ID, tetapi web-crawl. Spam pola judi/forex/slot **18,7%**. Sisanya berita/SEO/boilerplate. Bukan ensiklopedia kurasi. Filter `panen_hf.py` perlu kualitas, bukan hanya bahasa. Jangan naikkan budget panen lagi sebelum filter.
- `panen-wikipedia-id` (562.195 dokumen): artikel pertama identik K1 (`Asam deoksiribonukleat`). Tidak ada field title; URL hanya `hf://wikimedia/wikipedia`. K1 683.516 > 562.195 — dump K1 lebih lengkap. Retire sebagai overlap.

## Branch
- `staging/korpus-parts` sudah tidak ada.
