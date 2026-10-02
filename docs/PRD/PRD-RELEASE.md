<!-- Sumber: Google Drive "PRD RELEASE" (file 1kbJbTGh1ZvaUjQOkarPLoPtEIAbhcooSUbLo_nwZx2E), diubah 2026-10-02. Menggantikan PRD-RELEASE lama di git dan di tag prd-data-release. Isi di bawah ini dokumen Drive itu. -->

# **PRD RELEASE: SPESIFIKASI ARSITEKTUR KORPUS RATEGOAN**

**Standar Penataan Struktur Penempatan Data, Nama Tag, Nama Aset Rilis, Checksum SHA256, Manifest Metadata, dan Alur Pemrosesan Data (K & R Dataset)**  
*Per: 2 Oktober 2026 (Diperbarui dengan Temuan Claude & Preseden Sistem)*  
*Status Verifikasi: Disahkan untuk Eksekusi Penataan, Verifikasi Checksum, & Rilis Data Rategoan*

# **0. RINGKASAN EKSEKUTIF & PRESEDEN SEJARAH SISTEM**

Dokumen ini menetapkan standar arsitektur rilis korpus Rategoan yang diperbarui secara menyeluruh. Dokumen ini mengolaborasikan seluruh temuan analisis mendalam, preseden historis dari pengembangan sistem sebelumnya, serta spesifikasi operasional untuk mengelola data mentah hingga menjadi korpus bersih siap latih (production-ready) berstandar mutu textbook.

## **0.1 Ringkasan Keputusan Strategis**

1. **Pemisahan Jalur Bahasa (Dual-Engine Architecture):** Korpus Bahasa Indonesia (K) dan Korpus Bahasa Inggris (R) dipisahkan secara ketat untuk menjaga kemurnian tata bahasa dan mencegah efek translationese.  
2. **Tiga Tingkat Tag Rilis:** Pengelolaan berkas bertingkat melalui Lapis 1 (Data Baru / Mentah), Lapis 2 (Penampungan / QC Gate), dan Lapis 3 (Rak Final Mutu Textbook).  
3. **Validasi Keras Tiga Gerbang Integritas:** Penerapan verifikasi checksum SHA256SUMS dan manifest metadata wajib pada seluruh tingkatan rilis.

---

# **1. PENDAHULUAN & BATASAN RUANG LINGKUP**

## **1.1 Tujuan Dokumen**

Dokumen Product Requirements Document (PRD RELEASE) ini disusun sebagai pedoman baku operasional dan arsitektur rilis korpus Rategoan untuk:

4. **Menata struktur penempatan data** dalam sistem rilis Rategoan.  
5. **Menstandarkan nama tag rilis** ke dalam sistem 3 tingkatan (Data Baru, Penampungan, dan Rak Final).  
6. **Menstandarkan format nama aset file** di dalam setiap tag rilis secara teratur dan simetris.  
7. **Menetapkan format keterangan resmi (Release Notes)** serta berkas verifikasi standar (SHA256SUMS dan manifest.json) yang wajib dicantumkan pada setiap tag rilis.  
8. **Menetapkannya sebagai pedoman wajib** sebelum data mentah diizinkan masuk ke pipeline pemrosesan.

## **1.2 Batasan Mutlak Ruang Lingkup (Scope Boundaries)**

**PRINSIP UTAMA:**  
PRD ini **MURNI MENGATUR PENATAAN STRUKTUR PENEMPATAN, ALUR PIPELINE, CHECKSET SHA256, METADATA MANIFEST, NAMA TAG, DAN NAMA ASET.**  
Dokumen ini **TIDAK MENGUBAH DAN TIDAK MENDEFINISIKAN ULANG ISI MATERI TERVERIFIKASI DARI K1, K2, K3, DAN K4.**  
Seluruh isi materi K1, K2, K3, dan K4 **tetap persis seperti yang sudah ada pada rilis saat ini** (17+ Miliar token BPE).  
---

# **2. LATAR BELAKANG ARSITEKTUR & KEPUTUSAN STRATEGIS**

## **2.1 Penyelesaian Isu Kritis Bagian A.3 PRD Terjemahan**

Pada rilis batch `data-baru-20261002` (2 Oktober 2026, ~109 GB mentah), sistem rilis menerima aset skala besar yang mencakup peS2o (30,6 GB), PubMed Central (43,6 GB), dan StackExchange (34,9 GB). Penerimaan ini menimbulkan pertanyaan kritis mengenai alokasi dan penataan data:

* *Apakah data akademik bahasa Inggris ini harus dipaksa diterjemahkan mesin ke Bahasa Indonesia sebelum masuk korpus?*  
* *Ataukah data ini dialokasikan ke rak/kategori baru yang memang diperuntukkan bagi materi berbahasa Inggris?*

## **2.3 Preseden Sejarah Sistem & Pembelajaran Rilis Sebelumnya**

Pengalaman dari iterasi rilis sebelumnya menunjukkan bahwa mencampur data mentah langsung ke dalam korpus produksi tanpa karantina bertingkat menyebabkan degradasi mutu token BPE dan ketidakpastian lisensi. Oleh karena itu, diputuskan bahwa seluruh alur pipeline wajib melewati 11 tahapan linier secara disiplin.

# **4. CHECKLIST 'PAGAR' DATA BARU, ATURAN LISENSI, & LARANGAN KONTEN**

Sebelum berkas data mentah diperbolehkan masuk ke tingkat 1 (Data Baru), setiap kandidat dataset wajib melewati verifikasi 5 poin pagar data (Data Gateways):

9. **Kejelasan Audit Lisensi HKI:** Berkas harus berlisensi terbuka (CC-BY, MIT, Apache 2.0, Public Domain, atau ODbL). Dataset berstatus 'Non-Commercial' atau 'Unknown' wajib dikarantina terpisah.  
10. **Bebas dari Kebocoran Data Benchmark (Data Contamination Check):** Dilakukan pencocokan n-gram terhadap dataset evaluasi standar (MMLU, IndoMMLU, GSM8K, HumanEval) untuk mencegah kebocoran data uji.  
11. **Pembersihan PII (Personally Identifiable Information):** Pemindaian regex dan model NER untuk menghapus NIK, nomor telepon, alamat email pribadi, dan nomor rekening finansial.  
12. **Pemeriksaan Integritas Berkas Sederhana:** Pengujian dekstrim/uncompress berkas sampel untuk memastikan berkas tidak korup sebelum diunggah.  
13. **Penetapan Taksonomi Rak Target:** Klasifikasi awal apakah dataset masuk ke kategori Pengetahuan (1), Dialog (2), Pelengkap (3), atau Coding (4).

---

# **5. ALUR KHUSUS LENGKAP: RAW -> TOKEN BPE (11 TAHAPAN WAJIB)**

Proses pengolahan data mentah menjadi korpus final BPE dilakukan secara terstruktur melalui 11 tahapan linier:

14. **Tahap 1 - Ingestion Data Mentah:** Penempatan berkas mentah asli di tag `Data baru Indonesian` / `data baru English`.  
15. **Tahap 2 - Parsing & Normalisasi Teks UNICODE:** Ekstraksi teks dari format asli (PDF, HTML, WARC, JSON) ke JSONL murni serta konversi normalisasi Unicode (NFKC).  
16. **Tahap 3 - Deteksi & Pemisahan Bahasa (Language Identification):** Menggunakan FastText LID / CLD3 untuk menyalurkan teks ke poros Bahasa Indonesia (K) atau Bahasa Inggris (R).  
17. **Tahap 4 - Deduplikasi Skala Besar (MinHash / LSH & Exact Match):** Penghapusan dokumen duplikat persis maupun duplikat dekat (near-deduplication) dengan nilai kemiripan Jaccard > 0,80.  
18. **Tahap 5 - Penyaringan Kualitas Heuristik (Heuristic Filtering):** Eliminasi teks dengan rasio simbol/angka tidak wajar, kalimat terpotong, teks terlalu pendek (< 50 kata), atau konsentrasi kata kunci sampah (spam/boilerplate).  
19. **Tahap 6 - Penyaringan Mutu Perisai AI & Klasifikasi Mutu Textbook:** Scoring menggunakan model classifier mutu teks untuk menjamin standar kualitas mutu textbook.  
20. **Tahap 7 - Penataan Format Zero-Conversational JSONL:** Standarisasi struktur tiap baris menjadi `{"text": "..."}` tanpa wrapping conversational berlebih.  
21. **Tahap 8 - Transit Karantina Penampungan (Quality Control Gate 2):** Penyimpanan di tag penampungan untuk verifikasi statistik sampling akhir.  
22. **Tahap 9 - Tokenisasi BPE & Verifikasi Jumlah Token:** Eksekusi tokenizer BPE Rategoan resmi dan perhitungan presisi total token yang dihasilkan.  
23. **Tahap 10 - Pembagian Partisi & Kompresi GZIP Standard (1.35 - 1.5 GB):** Pemecahan berkas ke ukuran optimal dan kompresi gzip simetris.  
24. **Tahap 11 - Promosi Final, Segel Checksum SHA256, & Injeksi Manifest.json:** Penerbitan ke tag final K/R beserta pembuatan berkas validasi integritas.  
25. **Tahap 12 - Sinkronisasi Repositori & Dokumentasi Sistem:** Pembaruan dokumentasi dan konfigurasi sistem dilakukan secara terpisah sesuai peruntukannya:  
    1. **File Wajib yang Di-commit ke Git Repo:** `docs/STATUS-KORPUS-LISENSI.md` dan `README.md`.  
    2. **File Aset di GitHub Releases:** `manifest.json` dan `SHA256SUMS`.  
    3. **Parameter di Lingkungan Training:** Penyesuaian total token pada runtime/skrip DataLoader.

---

# **6. SEGEL SHA256 — TIGA GERBANG WAJIB (MEKANISME ANTI-BENTROK UTAMA)**

## **6.1 Segel Integritas Checksum SHA256SUMS**

Setiap rilis tag wajib melampirkan berkas `SHA256SUMS` yang memuat checksum SHA-256 dari seluruh aset file yang ada di dalam tag rilis tersebut untuk menjamin data tidak mengalami perubahan bit (bit-rot atau korupsi transmisi).

# **7. SKEMA MANIFEST WAJIB (manifest.json)**

Setiap tag rilis wajib menyertakan berkas `manifest.json` berstruktur standar sebagai berikut:

```json

{
  "release_tag": "K dataset Indonesian",
  "release_date": "2026-10-02",
  "version": "1.0.0",
  "language": "id",
  "total_files": 12,
  "total_size_bytes": 117039611904,
  "total_bpe_tokens": 17420119800,
  "tokenizer": "rategoan-bpe-v1",
  "categories": {
    "K1": { "name": "Pengetahuan", "parts": 3 },
    "K2": { "name": "Dialog", "parts": 3 },
    "K3": { "name": "Pelengkap", "parts": 3 },
    "K4": { "name": "Coding", "parts": 3 }
  },
  "license": "CC-BY-4.0 / Open Data",
  "checksum_file": "SHA256SUMS"
}

```

## **6.2 Perintah Shell Bash Pembuatan & Verifikasi Checksum SHA256**

Untuk menjamin presisi verifikasi tanpa kesalahan manusia, pembuatan dan pemeriksaan berkas SHA256SUMS wajib menggunakan perintah shell bash standar berikut:

```sh
# 1. Perintah Pembuatan Berkas Checksum SHA256SUMS
sha256sum *.jsonl.gzip *.gzip > SHA256SUMS

# 2. Perintah Verifikasi Integritas Berkas di Lingkungan QC / Pipeline
sha256sum -c SHA256SUMS
```

---

## **2.2 Keputusan Resmi Dirigen**

Diputuskan secara resmi untuk **membuka jalur rak terpisah untuk Bahasa Inggris (Rak R)**:

26. **Mencegah Penurunan Kualitas Bahasa:** Memaksakan terjemahan mesin massal (machine translation) pada ratusan gigabyte teks sains dan kode akan menghasilkan bahasa kaku (translationese) dan merusak konteks teknis.  
27. **Menjaga Kemurnian Korpus Indonesia:** Korpus K tetap berdiri mandiri 100% berbahasa Indonesia murni dengan 17+ Miliar token BPE yang sudah bersih.  
28. **Membangun Kekuatan Nalar Simetris:** Rak R dihadirkan sebagai pilar literatur berbahasa Inggris kualitas mutu textbook dengan kategori yang simetris dengan K.

---

# **3. ARSITEKTUR TIGA TINGKAT TAG RILIS**

Sistem penempatan data diatur secara bertingkat dan disiplin melalui 3 lapis tag rilis:

```
+--------------------------------------------------------------------------------+
|                       TINGKAT 1: DATA BARU (DATA MENTAH)                       |
|  Tag: Data baru Indonesian             |  Tag: data baru English               |
|  -> Seluruh data mentah yang baru masuk/diunduh ditaruh di sini.               |
+---------------------------------------+----------------------------------------+
                                    |
                                    v (Melewati proses penyaringan awal)
+--------------------------------------------------------------------------------+
|                     TINGKAT 2: PENAMPUNGAN (CALON KORPUS)                      |
|  Tag: penampungan Indonesian           |  Tag: penampungan English             |
|  -> Seluruh data yang sudah melewati proses penyaringan (calon korpus).        |
|  -> Ruang transit untuk pengujian Quality Control (QC) tahap akhir.            |
+---------------------------------------+----------------------------------------+
                                    |
                                    v (Lolos QC tahap akhir & tokenisasi BPE)
+--------------------------------------------------------------------------------+
|                 TINGKAT 3: RAK FINAL TEXTBOOK (KORPUS BERSIH SIAP PAKAI)       |
|  Tag: K dataset Indonesian             |  Tag: R dataset english               |
|  -> Korpus bersih final token BPE      |  -> Korpus bersih final token BPE     |
|     kualitas mutu textbook Indonesia   |     kualitas mutu textbook English    |
|     (K1, K2, K3, K4 disatukan)         |     (R1, R2, R3, R4 disatukan)        |
+--------------------------------------------------------------------------------+
```

## **3.1 Rincian Fungsi Tiap Tingkatan:**

29. **Tingkat 1 - Data Baru (**`Data baru Indonesian` **&** `data baru English`**):**  
    1. Berfungsi sebagai pintu masuk utama penampungan data mentah.  
    2. Tempat menyimpan dump unduhan baru (seperti dump PubMed mentah, web crawl mentah, dsb.) sebelum tersentuh pipeline penyaringan.  
30. **Tingkat 2 - Penampungan (**`penampungan Indonesian` **&** `penampungan English`**):**  
    1. Berfungsi sebagai wadah bagi seluruh data yang telah selesai disaring.  
    2. Berstatus resmi sebagai *Calon Korpus*.  
    3. Menjadi zona karantina untuk pelaksanaan audit dan Quality Control (QC) tahap akhir sebelum dinaikkan statusnya ke rak produksi final.  
31. **Tingkat 3 - Rak Final Mutu Textbook (**`K dataset Indonesian` **&** `R dataset english`**):**  
    1. Berfungsi sebagai rak final korpus bersih siap latih (production-ready).  
    2. Memiliki jaminan mutu *textbook quality* dan telah diverifikasi perhitungan token BPE-nya.

## **3.2 Aturan Penambahan vs Penggantian Data, Partisi XL, & Retire Tag Lama**

32. **Aturan Penambahan vs Penggantian Data:** Penambahan data baru wajib menggunakan metode append/incremental tanpa menimpa partisi data yang sudah ada. Penggantian (replacement) hanya diizinkan jika ditemukan korupsi data atau revisi mayor berstatus critical fix.  
33. **Partisi Berkas XL (> 1.5 GB):** Jika ukuran partisi melebihi 1,5 GB, berkas wajib dipecah menjadi beberapa sub-partisi (misal: `part1a`, `part1b`) untuk menjamin batas aman pengunduhan dan kepatuhan sistem rilis.  
34. **Protokol Retire Tag Lama yang Menganggur:** Tag rilis lama yang sudah digantikan atau tidak aktif wajib diarsipkan/deprecate secara resmi dan ditandai dalam manifest agar tidak diakses oleh pipeline pelatihan aktif.

---

# **8. STANDARISASI NAMA TAG DAN NAMA ASET FILE**

## **8.1 Poros Bahasa Indonesia (Tag: K dataset Indonesian)**

Tag ini menyatukan seluruh aset K1, K2, K3, dan K4 yang saat ini masih berada di tag terpisah ke dalam **satu tag rilis tunggal**. Isi aset tetap sama persis seperti korpus bersih saat ini (17+ Miliar token BPE).  
Standar penamaan aset file di dalam tag `K dataset Indonesian`:

* **K1 (Pengetahuan):** `K1-pengetahuan-part1.jsonl.gzip`, `K1-pengetahuan-part2.jsonl.gzip`, dst.  
* **K2 (Dialog):** `K2-dialog-part1.jsonl.gzip`, `K2-dialog-part2.jsonl.gzip`, dst.  
* **K3 (Pelengkap):** `K3-pelengkap-part1.gzip`, `K3-pelengkap-part2.gzip`, dst.  
* **K4 (Coding):** `K4-coding-part1.jsonl.gzip`, `K4-coding-part2.jsonl.gzip`, dst.

## **8.2 Poros Bahasa Inggris (Tag: R dataset english)**

Tag ini menampung seluruh aset R1, R2, R3, dan R4 full berbahasa Inggris kualitas mutu textbook. Pembagian kategorinya dibuat sama persis dan simetris dengan K untuk seluruh materi berbahasa Inggris.  
Standar penamaan aset file di dalam tag `R dataset english`:

* **R1 (Pengetahuan):** `R1-pengetahuan-part1.jsonl.gzip`, `R1-pengetahuan-part2.jsonl.gzip`, dst.  
* **R2 (Dialog):** `R2-dialog-part1.jsonl.gzip`, `R2-dialog-part2.jsonl.gzip`, dst.  
* **R3 (Pelengkap):** `R3-pelengkap-part1.jsonl.gzip`, `R3-pelengkap-part2.jsonl.gzip`, dst.  
* **R4 (Coding):** `R4-coding-part1.jsonl.gzip`, `R4-coding-part2.jsonl.gzip`, dst.

### **8.2.1 Strategi Tokenizer & Vokabulari Rak R**

Aset pada Rak R diproses menggunakan tokenizer BPE Rategoan yang telah disesuaikan untuk efisiensi kompresi teks akademik dan teknis berbahasa Inggris. Hal ini menjamin rasio token-per-karakter yang optimal serta kompatibilitas penuh dengan vokabulari gabungan K & R.

## **8.3 Tingkat Penampungan (Tag: penampungan Indonesian & penampungan English)**

* Menampung seluruh data yang telah melewati proses penyaringan (calon korpus).  
* Tempat pelaksanaan QC tahap akhir sebelum dipromosikan ke rak final K atau R.

## **8.4 Tingkat Data Baru (Tag: Data baru Indonesian & data baru English)**

* Menampung seluruh data mentah yang baru masuk ke sistem rilis.

---

# **11. STANDAR KETERANGAN RESMI SETIAP TAG (RELEASE NOTES)**

Setiap tag rilis pada GitHub Releases wajib menyertakan deskripsi resmi terstandarisasi sebagai berikut:

## **A. Keterangan pada Tag: K dataset Indonesian**

**K dataset Indonesian**

Tag rilis final untuk korpus bersih mutu textbook Bahasa Indonesia (token BPE).  
Menyatukan seluruh aset korpus bersih ke dalam satu rak rilis terpadu dengan isi tetap sama seperti rilis saat ini:  
- `K1-pengetahuan-part*.jsonl.gzip` : Aset pengetahuan K1  
- `K2-dialog-part*.jsonl.gzip` : Aset dialog K2  
- `K3-pelengkap-part*.gzip` : Aset pelengkap K3  
- `K4-coding-part*.jsonl.gzip` : Aset coding K4

Setiap rilis dilengkapi dengan SHA256SUMS dan manifest.json untuk verifikasi integritas data.

## **B. Keterangan pada Tag: R dataset english**

**R dataset english**

Tag rilis final untuk korpus bersih mutu textbook Bahasa Inggris (token BPE).  
Kategori aset dibuat sama persis dengan K untuk materi berbahasa Inggris:  
- `R1-pengetahuan-part*.jsonl.gzip` : Aset pengetahuan R1  
- `R2-dialog-part*.jsonl.gzip` : Aset dialog R2  
- `R3-pelengkap-part*.jsonl.gzip` : Aset pelengkap R3  
- `R4-coding-part*.jsonl.gzip` : Aset coding R4

Setiap rilis dilengkapi dengan SHA256SUMS dan manifest.json untuk verifikasi integritas data.

## **C. Keterangan pada Tag: penampungan Indonesian & penampungan English**

**Penampungan (Calon Korpus)**

Berisi seluruh data yang sudah melewati proses penyaringan awal dan telah menjadi calon korpus.  
Data di tag ini disiapkan untuk menjalani Quality Control (QC) tahap akhir sebelum dimasukkan ke rak final K dataset Indonesian / R dataset english.

## **D. Keterangan pada Tag: Data baru Indonesian & data baru English**

**Data Baru (Data Mentah)**

Tempat penampungan seluruh data mentah yang baru masuk sebelum masuk ke tahapan pemrosesan dan penyaringan.

Setiap rilis tag pada Bab 11 wajib melampirkan berkas pendamping SHA256SUMS dan manifest.json sebagai standar verifikasi integritas dan metadata rilis.  
---

# **10. STRATEGI PELATIHAN DUAL-KORPUS (K & R TRAINING STRATEGY)**

35. **Ukuran File Partisi:** Setiap partisi file `.jsonl.gzip` (atau `.gzip`) diatur berukuran optimal 1,35–1,5 GB untuk memastikan kepatuhan penuh terhadap batas ukuran aset rilis GitHub (maksimal 2 GiB per aset) dan kemudahan unduhan.  
36. **Format Data Zero-Conversational JSONL:** Seluruh berkas korpus bersih disusun menggunakan format JSONL murni tanpa struktur conversational/chat berlebih untuk efisiensi parsing dan proses tokenisasi BPE langsung.  
37. **Berkas Verifikasi Integritas (SHA256SUMS & manifest.json):** Setiap tag rilis wajib melampirkan berkas `SHA256SUMS` untuk validasi checksum serta berkas `manifest.json` yang memuat metadata rilis, jumlah partisi, total token BPE, dan lisensi data.  
38. **Penyatuan Tag K1-K4:** Proses konsolidasi dari tag K1, K2, K3, dan K4 yang saat ini terpisah menjadi 1 tag tunggal `K dataset Indonesian` dilakukan tanpa mengubah bit data maupun urutan isi korpus yang sudah ada.  
39. **Penyaluran Data Batch 2 Oktober 2026:** Data mentah PubMed Central, peS2o, dan StackExchange yang saat ini berada di rilis `data-baru-20261002` dialokasikan ke jalur English: ditempatkan di `data baru English` -> disaring ke `penampungan English` -> QC tahap akhir -> masuk ke `R dataset english`.

---

## **10.1 FILOSOFI PELATIHAN: DUAL-ENGINE ARCHITECTURE**

Setelah tersedianya dua rak korpus bersih mutu textbook (K dataset Indonesian dan R dataset english), strategi pelatihan model fondasi Rategoan dirancang mengikuti metodologi AI frontier:

40. Korpus K sebagai Identity Engine (Pilar Bahasa & Budaya):  
    1. Menjamin model memiliki keluwesan alami, kepatuhan tata bahasa (PUEBI/KBBI), pemahaman konteks sosial-budaya Indonesia, sastra, hukum, dan regulasi nasional tanpa canggung.  
41. Korpus R sebagai Reasoning Engine (Pilar Nalar & Sains Global):  
    1. Menjadi motor logika, penalaran multi-langkah (multi-step reasoning), pemahaman matematika, literatur kedokteran/biomedis (PubMed), riset sains (peS2o), pemecahan masalah teknis (StackExchange), dan arsitektur kode/sistem (R4).  
    2. Model mentransfer kemampuan penalaran (reasoning transfer) dari bahasa Inggris ke dalam cara berpikir model saat memproses prompt bahasa Indonesia.

---

## **10.2 Strategi Campuran Data (Data Mixing & Sampling Weight)**

DataLoader pada fase pre-training menerapkan bobot sampling proporsional:

* Total Porsi Korpus K (Bahasa Indonesia): 55% - 60%  
  * K1 (Pengetahuan Umum & Sains Dasar): 20%  
  * K2 (Dialog & Teks Formal): 15%  
  * K3 (Pelengkap Web Terkurasi): 10%  
  * K4 (Buku Raget Coding ID): 10% - 15%  
* Total Porsi Korpus R (Bahasa Inggris): 40% - 45%  
  * R1 (Pengetahuan Global & Ensiklopedia EN): 10%  
  * R2 (Sains, Medis, & Riset Akademik / PubMed, peS2o): 15%  
  * R3 (Technical Problem Solving / StackExchange): 10%  
  * R4 (Coding & Computer Systems EN): 10%

---

## **10.3 Tahapan Kurikulum Pelatihan (Two-Stage Curriculum Learning)**

Pelatihan tidak dilakukan secara statis datar, melainkan melalui 2 fase dinamis:

42. Fase 1: Fondasi Nalar dan Representasi Bersama (Initial Pre-Training - 80% Total Steps)  
    1. Rasio seimbang: 50% K : 50% R.  
    2. Tujuan: Membentuk ruang representasi semantik bersama (shared latent space). Model mempelajari konsep logika abstrak dan sains tingkat tinggi secara paralel dalam dua bahasa.  
43. Fase 2: Indonesian Alignment & Annealing (Cool-Down Phase - 20% Terakhir)  
    1. Rasio diubah menjadi: 75% - 80% K : 20% - 25% R.  
    2. Learning rate diturunkan (cosine decay) dengan batch data K2 dan K4 kualitas tertinggi.  
    3. Tujuan: 'Mengunci' gaya keluaran model agar secara intuitif mengutamakan Bahasa Indonesia yang luwes dan alami, sekaligus mempertahankan seluruh daya nalar sains yang telah diserap dari korpus R pada Fase 1.

---

## **10.4 Evaluasi Cross-Lingual Transfer**

Model yang berhasil adalah model yang mampu:

44. Menerima instruksi dalam Bahasa Indonesia mengenai masalah medis/sains kompleks atau coding tingkat lanjut.

---

## **10.5 Formula Matematis Sampling Weight & Oversample Ratio**

Untuk menyeimbangkan distribusi data antara Korpus K dan Korpus R selama fase pre-training, probabilitas sampling P(D_i) untuk setiap domain D_i dihitung menggunakan formula matematis oversample terskala:  
`P(D_i) = (N_i * alpha_i) / sum_j(N_j * alpha_j)`  
Di mana N_i adalah jumlah token mentah domain i, dan alpha_i adalah koefisien pembobotan mutu (quality weight multiplier) yang ditetapkan berdasarkan tingkat kebersihan dan urgensi domain (misal: K2/K4 diberikan alpha > 1.0 untuk oversampling terkurasi).

# **12. KESIMPULAN**

Melalui spesifikasi PRD RELEASE ini, rilis korpus Rategoan memiliki tata kelola penempatan data yang rapi, transparan, dan terverifikasi penuh:

45. Data mentah tidak akan pernah bercampur dengan data produksi.  
46. Data yang berstatus calon korpus memiliki tempat karantina yang jelas di tag penampungan.  
47. Rak final `K dataset Indonesian` dan `R dataset english` menjadi sumber tunggal (single source of truth) yang bersih, mudah diakses skrip pelatihan, dan terjaga standarisasinya.  
48. Memanfaatkan nalar sains dari R2/R3/R4 untuk menyelesaikan logika masalah tersebut.  
49. Menyampaikan jawaban akhir secara runtut, fasih, dan elegan dalam Bahasa Indonesia (K).
