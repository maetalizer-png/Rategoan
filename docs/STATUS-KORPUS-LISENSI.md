# Status Korpus & Lisensi — Rategoan

Dokumen ini merapikan status semua data korpus per 26 Agustus 2026.
Tujuan: memudahkan training berikutnya hanya memakai data yang aman.

## Kategori Release

| Prefix | Arti | Boleh untuk training baru? |
|--------|------|---------------------------|
| **A**  | AMAN (lisensi jelas & terbuka) | **Ya — utamakan** |
| **R**  | RAW aman (sumber Wikimedia, belum diproses) | Boleh (setelah dibersihkan) |
| **X**  | ARSIP / berisiko atau versi lama | **Jangan** sebagai data utama |
| **00/01** | Checkpoint neural | Opt-in experimental |

## Yang AMAN (utamakan untuk training berikutnya)

### A1 · Korpus AMAN — Wikimedia (Jilid 1+3+4+5)
- Tag: `korpus-jilid-1-clean`
- Isi: Wikipedia + Wikibooks + Wikisource + Wikivoyage + Wikiquote + Wiktionary
- Lisensi: **CC-BY-SA 4.0**
- Rekomendasi: **ini yang utama** untuk lanjut training

### Data internal
- `raget/raget-data/jsonl/raget_own_corpus.jsonl`
- Dibuat sendiri dari 21 domain JSON + persona
- Lisensi: milik proyek (aman)

## Yang ARSIP / berisiko (jangan dijadikan data utama)

| Tag | Nama | Alasan |
|-----|------|--------|
| `korpus-train-balanced-v1` | X1 · Balanced v1 | Campuran ensiklopedia + **berita** + percakapan (ada sumber abu-abu) |
| `korpus-jilid-2-clean` | X2 · Jilid 2 | HPLT / CommonCrawl-derived |
| `data-kualitas-raget` | X3 · Data mentah | News crawl, OpenSubtitles, dll |
| `Sft` | X4 · Raw Jilid 2 | Mentah HPLT |
| `korpus-raget-extra-clean` | X5 | Arsip lama |
| `korpus-stok-seimbang-v2` | X6 | Arsip lama |
| `korpus-stok-seimbang-v3` | X7 | Arsip lama |

## Checkpoint Neural

| Tag | Model | Catatan |
|-----|-------|---------|
| `checkpoint-100m` | 100M | Experimental |
| `checkpoint-200m` | 200M (R10-TUTUP) | Experimental, generasi belum koheren penuh |

## Kebijakan ke depan

1. Training baru **hanya** memakai data berstatus **A** (AMAN) + `raget_own_corpus`.
2. Data berstatus **X** disimpan sebagai arsip, tidak dihapus, tapi tidak dijadikan sumber utama.
3. Jika nanti ada korpus bersih baru dari sumber terbuka, publish dengan prefix **A** dan isi `manifest.json` lengkap (total dokumen, token, SHA256, breakdown sumber).

---
Diperbarui: 2026-08-26
