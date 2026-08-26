# MIX TRAINING RESMI — Seimbang & Bersih (FINAL)

Diperbarui: 2026-08-26  
Struktur **dikunci**.

## Hanya 3 sumber load

| Porsi | Sumber | Tag Release |
|-------|--------|-------------|
| 50–55% | Ensiklopedia ID | **A1** `korpus-jilid-1-clean` |
| 30–35% | Dialog + daerah (upsample) | **PACK** `korpus-dialog-daerah-pack-v1` |
| 10–15% | Pelengkap | **A17** `korpus-simplewiki-bersih-v1` **atau** **A5** `korpus-wiki-lokal-bersih-v1` |

## Dilarang
- A14, A15 bareng A1 (overlap)
- balanced-v1, jilid-2, news, opensubtitles
- Load file kecil A3/A9/A10… satu-satu (sudah digabung di PACK)

## Training
50M → 100M → 200M, satu model per sesi, 60 menit.
