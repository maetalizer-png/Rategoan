# Audit Token Korpus vs Target Skala Model

Dihasilkan otomatis oleh `raget-tools/audit-corpus-tokens.mjs` - PRD-RAGET-NEURAL.md Fase A.1.

Korpus kanonik saat ini (K1+K2+K3, `korpus-manifest-total.json`): **563.006.953 token BPE** (tokenizer resmi vocab 30.368), dari **1.532.940 dokumen**.

Target rasio Chinchilla-style: **20 token per parameter** untuk training mendekati optimal.

## Preset yang SUDAH ADA - seberapa cukup datanya

| Preset | Param (nameplate) | Token ideal (20:1) | Token tersedia | % tercukupi |
|---|---:|---:|---:|---:|
| tiny | 2.839.296 | 56.785.920 | 563.006.953 | 991.5% |
| massive50m | 49.999.872 | 999.997.440 | 563.006.953 | 56.3% |
| massive100m | 103.325.184 | 2.066.503.680 | 563.006.953 | 27.2% |
| massive200m | 200.709.120 | 4.014.182.400 | 563.006.953 | 14.0% |

**Temuan kunci**: preset yang lebih besar tercukupi data-nya jauh LEBIH SEDIKIT secara proporsional -
ini penjelasan kuantitatif kenapa massive200m held-out PPL-nya lebih buruk dari massive50m
(lihat docs/ARSITEKTUR.md §"Kenapa Neural AKTIF tapi belum koheren") - bukan cuma dugaan kualitatif lagi.

## Target masa depan roadmap - seberapa jauh korpus harus tumbuh

| Target | Token ideal (20:1) | % tercukupi hari ini | Korpus harus tumbuh berapa kali |
|---|---:|---:|---:|
| 500M (Fase A jembatan) | 10.000.000.000 | 5.63% | 17.8x |
| 1B (Fase A target) | 20.000.000.000 | 2.82% | 35.5x |
| 4B (Fase B) | 80.000.000.000 | 0.70% | 142.1x |
| 10B (Fase C) | 200.000.000.000 | 0.28% | 355.2x |
| 20B (Fase C) | 400.000.000.000 | 0.14% | 710.5x |
| 40B (Fase C) | 800.000.000.000 | 0.07% | 1420.9x |

## Kesimpulan untuk PRD-RAGET-NEURAL.md Fase A

Korpus (bukan compute) adalah penghambat DOMINAN untuk scaling ke atas 500M - bahkan target
500M paling dekat pun butuh korpus tumbuh signifikan dari kondisi hari ini. Growth plan korpus
HARUS jadi prasyarat nyata sebelum melatih preset >200M lagi, bukan cuma catatan di PRD.
