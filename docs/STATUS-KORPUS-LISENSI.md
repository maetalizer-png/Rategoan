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

Workflow `.github/workflows/panen.yml` sudah dihapus dari repo (2026-09-02) - sumber ini tidak akan dipanen ulang otomatis. Kalau suatu saat mau dipanen manual lagi, wajib pakai `deteksi_spam()` (commit `7b8a433`) dulu.

## Token

**Total kanonik terbaru (2026-09-02): 543.202.593** (K1 354.376.464 + K2
151.487.572 + K3 37.338.557), naik dari 471.390.047 - Grok menambah
batch baru ke K2 (`korpus-dialog-daerah-bersih`: wiki daerah jv/su/min/
ace/ban + wikisource + `indonesian-nlp/id_personachat`, 291.928 ->
638.371 dokumen) dan K3 (`korpus-pelengkap-bersih`: +2.009 naskah
id.wikisource.org, filter lebih ketat, 97.548 -> 99.557 dokumen).
Diverifikasi Claude: SHA256 asset dicocokkan dulu, lalu token BPE
dihitung ulang penuh dengan tokenizer proyek (bukan estimasi kata).

**Catatan kualitas K2**: manifest Release-nya sendiri melaporkan 81,38%
dokumen TANPA tag bahasa dan cuma 6,82% eksplisit `id` - sisanya
tersebar di 14 bahasa daerah (masing-masing <=2,3%). K2 direkomendasikan
25-35% dari campuran training, jadi ini rak terbesar kedua (151,5 juta
token) dengan komposisi bahasa yang belum jelas mayoritas Indonesia
standar. Belum ada review kualitas manual atas batch baru ini.

MADLAD-400 tetap tidak masuk hitungan (lihat bagian RETIRE di atas).


## 2026-09-02 — rilis staging dihapus
Tag `panen-madlad400-id` dan `panen-wikipedia-id` dihapus dari Release. Folder `colab/` dan `kaggle/` dihapus dari repo. Checkpoint 200M hanya di Release, bukan di root.
