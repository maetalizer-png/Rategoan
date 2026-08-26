# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-08-26 (seimbang bersih v1 siap)

## Data AMAN untuk training

| Kode | Nama | Peran |
|------|------|--------|
| **A1** | korpus-jilid-1-clean | Volume ensiklopedia (Wikimedia CC-BY-SA) |
| **A3** | korpus-train-seimbang-bersih-v1 | Dialog + pengetahuan + fakta + gaya Raget |
| **A2** | korpus-pengetahuan-bersih-v1 | Subset pengetahuan (sudah masuk A3) |
| — | raget_own_corpus.jsonl | Persona (sudah masuk A3) |

### Campuran resmi training
- **60–70%** A1 (Wikimedia)
- **30–40%** A3 (seimbang bersih)

### Checkpoint
- checkpoint-100m, checkpoint-200m tetap ada

### Data berisiko
Sudah dihapus. Jangan diunduh lagi.

Lihat juga: `docs/STRUKTUR-KORPUS.md`
