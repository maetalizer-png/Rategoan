# Status Korpus & Lisensi — Rategoan

Diperbarui: 2026-09-02 (PRD-PERINTAH-GROK: nasib MADLAD-400)

## Release kanonik
| Tag | Isi |
|-----|-----|
| `korpus-ensiklopedia-bersih` | K1, 759.587 dokumen (jilid1 + unik Wikipedia) |
| `korpus-dialog-daerah-bersih` | K2 |
| `korpus-pelengkap-bersih` | K3 |
| `checkpoint-200m` | neural 200M (lihat digest Release) |
| `checkpoint-100m` | neural 100M |
| `prd-data-release` | pagar PRD |

## RETIRE — `panen-madlad400-id`

Tanggal review: 2026-09-02. Sample **600 baris** dari part **0011, 0018, 0027**.

| Metrik | Hasil |
|--------|-------|
| Spam ketat (judi/forex ≥2 frasa) | **8,8%** |
| 1 frasa spam | **12,3%** |
| Navigasi blog (`Home »`, dsb.) | **15,3%** |

Bukan mayoritas judi murni, tetapi **mayoritas bukan ensiklopedia**: crawl blog/berita/SEO. Tidak lolos PRD-DATA-RELEASE §5 untuk naik ke K1.

Tidak digabung ke K1 (759.587 dokumen tetap). Tidak dihitung ke token kanonik.

Jangan panen ulang sumber MADLAD-400 sampai `deteksi_spam()` (commit `7b8a433`) dipakai di run `panen.yml` dan hasilnya direview lagi.

## Token
Basis perintah Claude sebelum tugas ini: 471.390.047.  
Tidak berubah karena MADLAD tidak masuk K1. Token BPE K1 setelah gabung Wikipedia belum dihitung ulang di Release manifest (boleh null).


## 2026-09-02 — rilis staging dihapus
Tag `panen-madlad400-id` dan `panen-wikipedia-id` dihapus dari Release. Folder `colab/` dan `kaggle/` dihapus dari repo. Checkpoint 200M hanya di Release, bukan di root.
