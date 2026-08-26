# Struktur Korpus Pengembangan Raget

Diperbarui: 2026-08-26

## Prinsip
1. Hanya data berlisensi terbuka / milik sendiri.
2. Prefix Release:
   - **A** = AMAN (siap training)
   - **R** = RAW aman (belum diproses)
   - **C** = Checkpoint neural
3. Setiap korpus bersih wajib punya `manifest.json` (total dokumen, token/kata, SHA256, breakdown sumber, lisensi).

## Release yang aktif

| Tag | Nama | Status |
|-----|------|--------|
| `checkpoint-100m` | C0 · Checkpoint 100M | Experimental |
| `checkpoint-200m` | C1 · Checkpoint 200M (R10-TUTUP) | Experimental |
| `korpus-jilid-1-clean` | A1 · Korpus AMAN — Wikimedia | **Utama** (CC-BY-SA) |
| `J1`, `U`, `J34`, `Hhh` | R1–R4 · RAW Wikimedia | Sumber mentah aman |

## Korpus di dalam repo (aman)
| Path | Isi |
|------|-----|
| `raget/raget-data/jsonl/raget_own_corpus.jsonl` | Persona + domain internal |
| `raget/raget-data/jsonl/korpus-pengetahuan-bersih-v1.jsonl` | Sains, sejarah, penemuan, wawasan (milik sendiri) |
| `raget/raget-data/json/**` | 21+ domain JSON (rule-engine) |

## Rencana penambahan (A2, A3, ...)
- **A2** Pengetahuan terstruktur (Wikidata → teks, CC0/CC-BY)
- **A3** Buku & naskah (Wikisource filter + domain publik)
- **A4** Sains & teknologi (filter topik dari Wikimedia + sumber terbuka)
- **A5** Sejarah & budaya (filter topik)

## Format JSONL standar
```json
{"text": "...", "source": "...", "license": "...", "url": null}
```

## Kebijakan training
Training baru hanya boleh memakai:
1. A1 (Wikimedia clean)
2. `raget_own_corpus.jsonl`
3. `korpus-pengetahuan-bersih-v1.jsonl`
4. Release berprefix **A** berikutnya

Jangan memakai sumber Common Crawl / news crawl / OpenSubtitles.

---
**Rujukan final (2026-08-26):** lihat `docs/STATUS-KORPUS-AMAN-RAPI.md` dan `docs/MIX-TRAINING-SEIMBANG.md`. Jangan redesign struktur.
