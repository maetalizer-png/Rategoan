# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-08-26 (release dirapikan — hanya yang diperlukan)

## Release yang aktif

| Tag | Nama | Peran |
|-----|------|--------|
| `checkpoint-100m` | 00 · Checkpoint 100M | Neural experimental |
| `checkpoint-200m` | 01 · Checkpoint 200M (R10-TUTUP) | Neural experimental |
| `korpus-jilid-1-clean` | **A1** · Wikimedia clean | Volume ensiklopedia (CC-BY-SA) |
| `korpus-train-seimbang-bersih-v1` | **A3** · Train seimbang bersih | Dialog + pengetahuan + fakta + persona |

## File di repo (aman)
- `raget/raget-data/jsonl/korpus-train-seimbang-bersih-v1.jsonl`
- `raget/raget-data/jsonl/raget_own_corpus.jsonl`
- `raget/raget-data/jsonl/korpus-pengetahuan-bersih-v1.jsonl` (subset, sudah masuk A3)

## Campuran training resmi
- **60–70%** A1
- **30–40%** A3

## Yang sudah dihapus
- Semua data berisiko (balanced-v1, jilid-2, news, opensubtitles, dll)
- RAW dump Wikimedia (J1/U/J34/Hhh) — sudah ada versi clean di A1
- A2 release kosong (konten tetap di repo, sudah masuk A3)

Lihat: `docs/STRUKTUR-KORPUS.md`

---
**Rujukan final (2026-08-26):** lihat `docs/STATUS-KORPUS-AMAN-RAPI.md` dan `docs/MIX-TRAINING-SEIMBANG.md`. Jangan redesign struktur.
