# Audit Token Korpus vs Target Skala Model

Dihasilkan otomatis oleh `raget-tools/audit-corpus-tokens.mjs` - PRD-RAGET-NEURAL.md Fase A.1.

Korpus kanonik saat ini (K1+K2+K3, `korpus-manifest-total.json`): **567.121.195 token BPE** (tokenizer resmi vocab 30.368), dari **1.513.933 dokumen**.

Target rasio Chinchilla-style: **20 token per parameter** untuk training mendekati optimal.

## Preset yang SUDAH ADA - seberapa cukup datanya

| Preset | Param (nameplate) | Token ideal (20:1) | Token tersedia | % tercukupi |
|---|---:|---:|---:|---:|
| tiny | 2.839.296 | 56.785.920 | 567.121.195 | 998.7% |
| massive50m | 49.999.872 | 999.997.440 | 567.121.195 | 56.7% |
| massive100m | 103.325.184 | 2.066.503.680 | 567.121.195 | 27.4% |
| massive200m | 200.709.120 | 4.014.182.400 | 567.121.195 | 14.1% |

**Temuan kunci**: preset yang lebih besar tercukupi data-nya jauh LEBIH SEDIKIT secara proporsional -
ini penjelasan kuantitatif kenapa massive200m held-out PPL-nya lebih buruk dari massive50m
(lihat docs/ARSITEKTUR.md §"Kenapa Neural AKTIF tapi belum koheren") - bukan cuma dugaan kualitatif lagi.

## Target masa depan roadmap - seberapa jauh korpus harus tumbuh

| Target | Token ideal (20:1) | % tercukupi hari ini | Korpus harus tumbuh berapa kali |
|---|---:|---:|---:|
| 500M (Fase A jembatan) | 10.000.000.000 | 5.67% | 17.6x |
| 1B (Fase A target) | 20.000.000.000 | 2.84% | 35.3x |
| 4B (Fase B) | 80.000.000.000 | 0.71% | 141.1x |
| 10B (Fase C) | 200.000.000.000 | 0.28% | 352.7x |
| 20B (Fase C) | 400.000.000.000 | 0.14% | 705.3x |
| 40B (Fase C) | 800.000.000.000 | 0.07% | 1410.6x |

## Kesimpulan untuk PRD-RAGET-NEURAL.md Fase A

Korpus (bukan compute) adalah penghambat DOMINAN untuk scaling ke atas 500M - bahkan target
500M paling dekat pun butuh korpus tumbuh signifikan dari kondisi hari ini. Growth plan korpus
HARUS jadi prasyarat nyata sebelum melatih preset >200M lagi, bukan cuma catatan di PRD.
