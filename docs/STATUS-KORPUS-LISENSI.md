# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-08-26 (setelah pembersihan data berisiko)

## Yang MASIH ADA (AMAN)

### Checkpoint Neural
| Tag | Nama | Keterangan |
|-----|------|------------|
| `checkpoint-100m` | 00 · Checkpoint 100M | Experimental |
| `checkpoint-200m` | 01 · Checkpoint 200M (R10-TUTUP) | Experimental |

### Korpus AMAN
| Tag | Nama | Keterangan |
|-----|------|------------|
| `korpus-jilid-1-clean` | A1 · Korpus AMAN — Wikimedia (Jilid 1+3+4+5) | **Utama untuk training berikutnya** (CC-BY-SA) |

### Raw AMAN (sumber Wikimedia)
| Tag | Nama |
|-----|------|
| `J1` | R1 · RAW — Wikipedia ID (dump) |
| `U` | R2 · RAW — Wikibooks ID |
| `J34` | R3 · RAW — Wikisource + Wikivoyage + Wikiquote |
| `Hhh` | R4 · RAW — Wiktionary ID |

### Data internal (di dalam repo)
- `raget/raget-data/jsonl/raget_own_corpus.jsonl` → aman, milik sendiri

## Yang SUDAH DIHAPUS (berisiko / arsip)
- korpus-train-balanced-v1 (berita + percakapan)
- korpus-jilid-2-clean (HPLT/CommonCrawl)
- data-kualitas-raget (news, opensubtitles, dll)
- Sft (raw jilid 2)
- korpus-raget-extra-clean
- korpus-stok-seimbang-v2 & v3

## Kebijakan
1. Training baru **hanya** memakai data berstatus AMAN + `raget_own_corpus`.
2. Struktur aplikasi Raget (rule-engine + JSON domain) **tidak terpengaruh** penghapusan ini.
3. Script training Colab yang masih menyebut release lama perlu di-update saat ronde berikutnya.
