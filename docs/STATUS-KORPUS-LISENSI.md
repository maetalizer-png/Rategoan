# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-08-26 (pembersihan + perluasan pengetahuan)

## Yang aktif & AMAN

### Checkpoint
- `checkpoint-100m` — 100M experimental
- `checkpoint-200m` — 200M R10-TUTUP experimental

### Korpus AMAN
- `korpus-jilid-1-clean` (**A1**) — Wikimedia CC-BY-SA (utama)
- `raget_own_corpus.jsonl` — milik sendiri
- `korpus-pengetahuan-bersih-v1.jsonl` — sains, sejarah, penemuan, wawasan (milik sendiri)

### RAW aman
- `J1` Wikipedia ID, `U` Wikibooks, `J34` Wikisource/Voyage/Quote, `Hhh` Wiktionary

## Domain JSON yang diperluas (rule-engine)
- `sains/umum`, `sains/fisika-kimia`
- `sejarah/indonesia`, `sejarah/dunia`
- `penemuan/teknologi`, `penemuan/sains`, `penemuan/kedokteran`
- `knowledge/wawasan` (baru)

## Yang sudah dihapus (berisiko)
balanced-v1, jilid-2, data-kualitas-raget, Sft, extra-clean, stok-seimbang v2/v3

## Kebijakan
Training baru **hanya** data AMAN. Lihat juga `docs/STRUKTUR-KORPUS.md`.
