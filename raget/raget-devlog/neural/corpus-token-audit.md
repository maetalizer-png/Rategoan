# Audit Token Korpus vs Target Skala Model

Dihasilkan otomatis oleh `raget-tools/audit-corpus-tokens.mjs` - PRD-RAGET-NEURAL.md Fase A.1.

Korpus kanonik saat ini (K1+K2+K3, `korpus-manifest-total.json`): **543.202.593 token BPE** (tokenizer resmi vocab 30.368), dari **1.497.515 dokumen**.

Target rasio Chinchilla-style: **20 token per parameter** untuk training mendekati optimal.

## Preset yang SUDAH ADA - seberapa cukup datanya

| Preset | Param (nameplate) | Token ideal (20:1) | Token tersedia | % tercukupi |
|---|---:|---:|---:|---:|
| tiny | 2.839.296 | 56.785.920 | 543.202.593 | 956.6% |
| massive50m | 49.999.872 | 999.997.440 | 543.202.593 | 54.3% |
| massive100m | 103.325.184 | 2.066.503.680 | 543.202.593 | 26.3% |
| massive200m | 200.709.120 | 4.014.182.400 | 543.202.593 | 13.5% |

**Temuan kunci**: preset yang lebih besar tercukupi data-nya jauh LEBIH SEDIKIT secara proporsional -
ini penjelasan kuantitatif kenapa massive200m held-out PPL-nya lebih buruk dari massive50m
(lihat docs/ARSITEKTUR.md §"Kenapa Neural AKTIF tapi belum koheren") - bukan cuma dugaan kualitatif lagi.

## Target masa depan roadmap - seberapa jauh korpus harus tumbuh

| Target | Token ideal (20:1) | % tercukupi hari ini | Korpus harus tumbuh berapa kali |
|---|---:|---:|---:|
| 500M (Fase A jembatan) | 10.000.000.000 | 5.43% | 18.4x |
| 1B (Fase A target) | 20.000.000.000 | 2.72% | 36.8x |
| 4B (Fase B) | 80.000.000.000 | 0.68% | 147.3x |
| 10B (Fase C) | 200.000.000.000 | 0.27% | 368.2x |
| 20B (Fase C) | 400.000.000.000 | 0.14% | 736.4x |
| 40B (Fase C) | 800.000.000.000 | 0.07% | 1472.7x |

## Kesimpulan untuk PRD-RAGET-NEURAL.md Fase A

Korpus (bukan compute) adalah penghambat DOMINAN untuk scaling ke atas 500M - bahkan target
500M paling dekat pun butuh korpus tumbuh signifikan dari kondisi hari ini. Growth plan korpus
HARUS jadi prasyarat nyata sebelum melatih preset >200M lagi, bukan cuma catatan di PRD.
