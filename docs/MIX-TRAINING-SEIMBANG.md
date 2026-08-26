# MIX TRAINING — mengikuti PRD-DATA-RELEASE.md

**Acuan mengikat:** `/PRD-DATA-RELEASE.md` di root repo.

## Hanya 3 korpus + checkpoint

| Porsi | Tag Release |
|-------|-------------|
| 55–65% | `korpus-ensiklopedia-bersih` |
| 25–35% | `korpus-dialog-daerah-bersih` (upsample) |
| 5–15% | `korpus-pelengkap-bersih` |

Checkpoint: `checkpoint-100m`, `checkpoint-200m` (tidak diubah).

## Dilarang
balanced-v1, jilid-2, news, opensubtitles, tag A1–A17 lama (sudah di-retire 2026-08-26).

## Training
50M → 100M → 200M sekuensial, 60 menit/model.
