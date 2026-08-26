# MIX TRAINING RESMI — Seimbang & Bersih

Diperbarui: 2026-08-26  
Wajib dipatuhi setiap sesi training Claude.

## Prinsip
1. Semua data **bersih** (hanya A-series aman)
2. Campuran **seimbang** menurut rasio di bawah
3. **1 model per sesi** (50M → 100M → 200M)

## Rasio target (token efektif saat training)

| Komponen | % | Sumber | Cara load |
|----------|---|--------|-----------|
| Ensiklopedia ID | 50–55% | **A1 saja** | normal |
| Dialog / sapaan / Q&A | 20–25% | **A3 + A3v2** | **UPSAMPLE** (ulang sampai porsi tercapai) |
| Daerah ID | 10–15% | A5 + A9 + A13 + A16 | normal |
| Pelengkap | 10–15% | **satu** dari: A17 atau A8 | normal |

## Dilarang
- balanced-v1, jilid-2, news, opensubtitles
- A14 + A15 bersama A1 (overlap Wikipedia ID)
- Parallel 3 model

## Catatan penting
Volume dialog mentah masih lebih kecil dari A1.  
**Keseimbangan dicapai dengan upsample A3/A3v2**, bukan hanya menumpuk file Wikipedia.

## Urutan sesi
1. 50M · 60 menit · mix di atas
2. 100M · 60 menit · mix sama
3. 200M · 60 menit · mix sama · batch 16 (turun ke 8 jika OOM)
