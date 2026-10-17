# **PRD RELEASE**

**Spesifikasi Standar Rilis Korpus Data Mutu Textbook, Tata Kelola Rak, Tata Nama Aset, Protokol Integritas, dan Strategi Pelatihan**

*Status: Standar Operasional Baku Sistem Rilis Data Rategoan (100% Deterministik, Bebas Ambiguitas, & Anti-Halusinasi)*

*Berlaku Per: Oktober 2026*

# **0. PEMBAGIAN PERAN KERJA & TITIK SERAH TERIMA (WORKER ROLES & HANDOFF)**

Untuk memastikan disiplin operasional dan mencegah tabrakan eksekusi pada sistem rilis data, ditetapkan pembagian peran kerja yang tegas:

## **0.1 Claude (Perumus Arsitektur & Auditor Kualitas)**

* **Kewenangan & Tanggung Jawab:** Menyusun dokumen spesifikasi PRD, merancang skema taksonomi, menganalisis perbandingan data, mengaudit integritas skema manifest serta kemurnian mutu *textbook*, memverifikasi kepatuhan terhadap preseden kasus, serta menyortir keterangan usang.

* **Batasan Mutlak:** Claude secara teknis dibatasi aksesnya dari sistem penerbitan rilis. Claude **DILARANG KERAS** mempublikasikan aset rilis secara langsung ke tag rilis.

## **0.2 Grok Build / Manus AI / Dirigen (Eksekutor Produksi & Publisher)**

* **Kewenangan & Tanggung Jawab:** Mengeksekusi penyerapan benih data skala masif di lingkungan VM, menjalankan perbaikan teks deterministik (*in-place repair*) dan penyaringan mutu *textbook*, memilah partisi berkas pada batas baris utuh (`\n`), menjalankan kompresi `.jsonl.gz`, menghitung token BPE riil dari berkas fisik, memverifikasi segel SHA-256 dan fisik berkas di lokal VM, serta mengeksekusi publikasi resmi (*Publish Release*) ke 6 tag rilis korpus resmi.

## **0.3 Protokol Titik Serah Terima (Handoff Protocol)**

1. Claude merumuskan dokumen PRD dan memverifikasi skema kelayakan data hingga 100% bebas anomali.

2. Naskah diserahterimakan kepada Grok Build, Manus AI, atau Dirigen.

3. Eksekutor menjalankan pipeline pengolahan berkas, pengemasan partisi, verifikasi fisik kriptografis di VM, dan melakukan penerbitan rilis sesuai standar dokumen ini.

# **1. PENDAHULUAN & PRINSIP AKUMULASI KORPUS TANPA BATAS**

## **1.1 Tujuan Dokumen**

Dokumen Product Requirements Document (PRD) ini menetapkan standar operasional baku berpresisi tinggi untuk:

 1. **Penataan struktur penempatan berkas data pada sistem rilis** ke dalam tepat **6 tag rilis resmi** yang terbagi atas 3 tingkatan (Data Baru, Penampungan, dan Rak Final K & R) serta kriteria klasifikasi 4 kamar (`K1–K4` dan `R1–R4`).

 2. **Penerapan 5 Pemeriksaan 'Pagar' untuk data baru**, batasan lisensi yang diperbolehkan, serta standar kualitas mutu *textbook* yang deterministik.

 3. **Prinsip penyelamatan data bersih (*Deterministic In-Place Repair*) dan akumulasi token terbuka tanpa batas atas**, agar data bermutu tidak terbuang sia-sia saat pembersihan dan volume token terus bertambah.

 4. **Standarisasi alur konversi data mentah menjadi token BPE resmi** melalui 12 tahapan berurutan tanpa ambiguitas urutan penerbitan.

 5. **Penerapan Tiga Gerbang Segel SHA-256 Wajib** dengan perintah shell mandiri (*self-contained*) yang menghitung ulang langsung dari berkas fisik `.jsonl.gz`.

 6. **Pencegahan penggunaan skrip penggabungan usang** serta penetapan **Skema Manifest Wajib (`manifest.json`)** yang dihitung murni dari berkas fisik (anti-halusinasi angka).

 7. **Penyelesaian gap tokenizer untuk Korpus R (Bahasa Inggris)** guna mengatasi risiko inflasi token.

 8. **Standarisasi format tata nama aset berkas rilis** K1–K4 dan R1–R4 secara simetris dan teratur.

 9. **Format keterangan resmi (Release Notes)** yang wajib dicantumkan pada setiap tag rilis.

10. **Strategi pemanfaatan data pada tahap pelatihan (Training Strategy)** dilengkapi formula matematis oversampling dan kurikulum dua tahap.

## **1.2 Prinsip Akumulasi Terbuka, Perbaikan Deterministik, & Anti-Halusinasi**

**KETENTUAN PASTI:**

1. **Bebas Mengumpulkan Token Sebanyak-banyaknya (Tanpa Batas Atas Per Kategori/Rak):**

   Dokumen ini **DILARANG** membatasi jumlah maksimal token pada kategori mana pun (`K1, K2, K3, K4` maupun `R1, R2, R3, R4`). Setiap rak dan setiap kategori (termasuk `K4/R4` coding, `K1/R1` pengetahuan, `K2/R2` dialog/sains, dan `K3/R3` pelengkap) bebas mengumpulkan token BPE bersih **sebanyak-banyaknya tanpa plafon/batas atas** selama memenuhi standar mutu *textbook*.

2. **Larangan Keras Halusinasi Teks & Halusinasi Angka Manifest:**

   * **Larangan Mengarang/Mengubah Isi Teks dengan AI Generatif:** Seluruh proses pembersihan dan perbaikan teks (*in-place repair*) wajib menggunakan **operasi string/regex deterministik**. Eksekutor **DILARANG KERAS** menggunakan LLM untuk menulis ulang (*paraphrase*) atau mengarang dokumen karena dapat memicu halusinasi fakta.

   * **Larangan Mengarang/Menebak Angka di `manifest.json`:** Setiap angka `documents_count`, `size_bytes`, `tokens_word_count`, `tokens_bpe`, dan `sha256` di dalam `manifest.json` **WAJIB merupakan hasil perhitungan skrip langsung atas berkas fisik `.jsonl.gz` yang sesungguhnya**. Dilarang keras menyalin angka contoh dari dokumen PRD ini, menebak jumlah token dengan pembagian byte kasar, atau memalsukan angka.

3. **Definisi Unit JSONL & Prinsip Perbaikan Deterministik (*In-Place Repair*):**

   Dalam seluruh berkas `.jsonl` dan `.jsonl.gz` pada sistem ini, **1 baris fisik (`\n`) adalah tepat 1 objek JSON dokumen (`{"text": "..."}`)**. Oleh karena itu, istilah "membuang baris JSONL" dan "membuang dokumen" memiliki arti yang sama persis, yaitu **menghapus 1 objek JSON dokumen tersebut dari berkas partisi** (bukan menghapus seluruh berkas `.jsonl.gz`). Agar data sehat tidak terbuang sia-sia:

   * **Artikel dengan URL atau Ekor Navigasi Berita (`K1–K3` / `R1–R3`):** Jangan buang dokumennya. Gunakan regex untuk menghapus substring URL (`http://...`, `https://...`) dan kalimat ekor navigasi portal (*"Baca juga:"*, *"Bagikan:"*, *"Follow..."*, *"Selanjutnya di halaman..."*, *"Simak selengkapnya"*), lalu simpan dokumen tersebut apabila panjang teks bersihnya masih ≥200 karakter.

   * **Dokumen Naratif Huruf Kecil Semua (*All-Lowercase* pada `K1–K3` / `R1–R3`):** Jangan buang dokumennya. Jalankan fungsi kapitalisasi awal kalimat deterministik sesuai definisi eksak pada **Bab 4.3 Butir 6** (tidak berlaku untuk `K4/R4` coding).

   * **Dokumen Bersih yang Salah Kamar Bahasa (*Cross-Language Reroute*):**
     * Apabila pada pembersihan jalur K (`K1/K2/K3`) ditemukan dokumen berbahasa Inggris (`__label__en`) yang bersih dan memiliki panjang ≥200 karakter, dokumen tersebut **jangan dihapus**, melainkan dipindahkan (*reroute*) ke berkas calon korpus **`R1-calon-pengetahuan-part*.jsonl.gz` pada tag Tingkat 2 `penampungan-English`**.
     * Sebaliknya, apabila pada pembersihan jalur R (`R1/R2/R3`) ditemukan dokumen berbahasa Indonesia (`__label__id`) yang bersih dan memiliki panjang ≥200 karakter, dokumen tersebut **jangan dihapus**, melainkan dipindahkan (*reroute*) ke berkas calon korpus **`K1-calon-pengetahuan-part*.jsonl.gz` pada tag Tingkat 2 `penampungan-Indonesian`**.

   * **Dokumen Sampah Murni yang Wajib Dibuang & Dicatat di Log Eksekusi:** Dokumen JSONL wajib dibuang (dihapus dari keluaran dan tidak disimpan ke tag rilis mana pun) apabila murni berisi: spam judi online (`slot gacor`, `togel`, `"B a n d a r | J u d i"`), dokumen naratif non-kode (`K1–K3` / `R1–R3`) yang memuat templat cacat gagal baca tabel/OCR (`"No nan Tahun"`, `"Nomor nan Tahun"`, `"Peraturan Menter!"`), banner kebijakan cookie terjemahan mesin rusak, duplikat, atau fragmen pendek di bawah batas minimal (<200 karakter bersih untuk `K1–K3`/`R1–R3`, <128 karakter bersih untuk `K4`/`R4`). Skrip pembersihan wajib mencetak jumlah dokumen yang dibuang per alasan ke log terminal (lihat **Bab 4.4**).

# **2. ARSITEKTUR TIGA TINGKAT & ENAM TAG RILIS RESMI (TIERED RELEASE SYSTEM)**

Seluruh korpus data pada GitHub Releases dikelola menggunakan **tepat 6 nama tag rilis resmi** (menggunakan tanda hubung tanpa spasi) yang tersusun dalam 3 tingkatan berjenjang. Penggunaan tag tambahan di luar ke-6 tag ini (termasuk pembuatan "rilis draf" terpisah atau tag dokumentasi tersendiri di GitHub Releases) dilarang; spesifikasi dokumen `PRD-RELEASE.md` dan `STATUS-KORPUS-LISENSI.md` disimpan langsung di dalam cabang Git repositori (`docs/`):

```
+-------------------------------------------------------------------------------+
|                       TINGKAT 1: DATA BARU (DATA MENTAH)                      |
|  Tag 1: Data-baru-Indonesian           |  Tag 2: data-baru-English            |
|  -> Tempat seluruh data mentah yang baru masuk/diunduh ditaruh di sini.       |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Melewati Tahap 2–8 & 5 Pemeriksaan Pagar)
+-------------------------------------------------------------------------------+
|                     TINGKAT 2: PENAMPUNGAN (CALON KORPUS)                     |
|  Tag 3: penampungan-Indonesian         |  Tag 4: penampungan-English          |
|  -> Seluruh data yang telah disaring, diperbaiki deterministik, & berformat   |
|     .jsonl.gz + manifest.json + SHA256SUMS (berstatus Calon Korpus).          |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Lolos Tahap 10–11: Gabung Lokal VM & Gerbang 2+3)
+-------------------------------------------------------------------------------+
|                 TINGKAT 3: RAK FINAL TEXTBOOK (KORPUS BERSIH TERBIT)          |
|  Tag 5: K-dataset-Indonesian           |  Tag 6: R-dataset-english            |
|  -> Korpus bersih final token BPE      |  -> Korpus bersih final token BPE    |
|     kualitas mutu textbook Indonesia   |     kualitas mutu textbook English   |
|     (K1, K2, K3, K4 disatukan)         |     (R1, R2, R3, R4 disatukan)       |
+-------------------------------------------------------------------------------+
```

## **2.1 Peran dan Batas Tiap Tingkatan**

1. **Tingkat 1 — Data Baru (`Data-baru-Indonesian` & `data-baru-English`):**

   Pintu masuk utama penampungan arsip mentah sebelum tersentuh pipeline pengolahan. Skrip pelatihan dilarang keras mengambil data dari tingkat ini.

2. **Tingkat 2 — Penampungan (`penampungan-Indonesian` & `penampungan-English`):**

    Tempat penyimpanan *Calon Korpus* (`K1-calon-...`, `R1-calon-...`, dst.) yang telah melewati ekstraksi, perbaikan deterministik, deduplikasi, tokenisasi BPE, pemotongan aman baris, dan kompresi `.jsonl.gz`. Data pada tingkat ini belum dianggap terbit untuk produksi hingga digabungkan dan lulus audit fisik ke Tingkat 3.

3. **Tingkat 3 — Rak Final Mutu Textbook (`K-dataset-Indonesian` & `R-dataset-english`):**

   Rak rilis produksi akhir yang berisi korpus bersih terverifikasi mutu *textbook*. **Data korpus dinyatakan resmi terbit (*published*) hanya ketika berkas `.jsonl.gz`, `manifest.json`, dan `SHA256SUMS` telah lulus re-audit fisik di VM (Tahap 11) dan selesai terunggah ke tag `K-dataset-Indonesian` atau `R-dataset-english` (Tahap 12).**

## **2.2 Definisi & Kriteria Klasifikasi 4 Kamar Korpus (`K1–K4` & `R1–R4`)**

Setiap dokumen wajib diklasifikasikan secara deterministik ke dalam salah satu dari 4 kamar berikut berdasarkan asal sumber atau struktur isinya:

1. **Kamar 1 — Pengetahuan (`K1-pengetahuan` & `R1-pengetahuan`):**

   Berisi materi ensiklopedia (mis. Wikipedia bersih), buku teks pendidikan/universitas, monograf ilmiah, materi referensi sejarah, geografi, ekonomi, dan artikel pemaparan konsep/pengetahuan faktual terstruktur.

2. **Kamar 2 — Dialog, Penalaran Ilmiah, & Regulasi Formal (`K2-dialog` & `R2-dialog`):**

   * **`K2-dialog` (Indonesia):** Berisi transkrip percakapan multi-giliran (*multi-turn dialogue*), tanya-jawab instruksional, wawancara terstruktur, diskusi pakar, serta teks regulasi/hukum/kedinasan formal nasional (seperti dokumen JDIH yang utuh dan bebas cacat OCR).
   * **`R2-dialog` (Inggris):** Berisi artikel riset akademik, sains, kedokteran/biomedis (seperti PubMed, peS2o, arXiv), serta dialog penalaran ilmiah.

3. **Kamar 3 — Pelengkap & Pemecahan Masalah Umum (`K3-pelengkap` & `R3-pelengkap`):**

   * **`K3-pelengkap` (Indonesia):** Berisi artikel jurnalisme/berita bersih (setelah dikupas URL & ekor navigasinya), esai sosial-budaya, sastra/prosa umum, dan artikel web informatif bermutu *textbook*.
   * **`R3-pelengkap` (Inggris):** Berisi forum tanya-jawab pemecahan masalah teknis/logika (seperti StackExchange non-kode murni), artikel analitis, dan prosa pelengkap berbahasa Inggris.

4. **Kamar 4 — Kode Sumber & Rekayasa Perangkat Lunak (`K4-coding` & `R4-coding`):**

   Dikunci mutlak hanya untuk kode sumber pemrograman (`Python`, `JavaScript`, `TypeScript`, `C`, `C++`, `Rust`, `Go`, `Java`, `SQL`, `Shell`, `HTML/CSS`), algoritma, pengujian perangkat lunak, dan dokumentasi API teknis dengan panjang minimal 128 karakter bersih. Pemisahan `K4` dan `R4` didasarkan pada bahasa komentar/docstring atau asal repositori (`K4` untuk kode dengan komentar/dokumentasi Bahasa Indonesia; `R4` untuk kode dengan komentar/dokumentasi Bahasa Inggris).

## **2.3 Aturan Operasional Aset Rilis, Ukuran Partisi, & Manajemen Tag**

1. **Aturan Penggabungan dan Pembaruan Aset:**

   * **Penambahan Volume Data:** Unduh aset dan `manifest.json` lama dari Rak Final ke VM lokal, gabungkan dengan partisi calon korpus dari `penampungan`, jalankan deduplikasi lintas-partisi, jalankan re-audit fisik Gerbang 2 & Gerbang 3 di VM, lalu unggah ke tag Rak Final.

   * **Perbaikan Partisi Eksisting:** Jika suatu partisi pada Rak K/R dibersihkan dari residu menggunakan aturan Bab 4.3, kemas ulang partisi yang telah bersih tersebut bersama promosi berkas dari `penampungan`, jalankan Gerbang 2 & Gerbang 3 di VM, lalu perbarui `manifest.json` dan `SHA256SUMS` sesuai angka fisik hasil pembersihan dan penggabungan.

2. **Aturan Pemotongan Baris Utuh (`.jsonl` Mentah) vs Batas Ukuran `.jsonl.gz` Terkompresi:**

   Agar tidak terjadi kebingungan antara ukuran berkas sebelum dan sesudah kompresi `gzip`:

   * **Pemotongan `.jsonl` Mentah Sebelum Kompresi (Wajib Batas Baris `\n`):** Berkas `.jsonl` mentah wajib dipotong menggunakan `split --line-bytes` (bukan `split --bytes` / `-b`) agar tidak ada objek JSON yang terbelah di tengah baris:
     * Untuk menghasilkan partisi `.jsonl.gz` berukuran **~0,45 GB – 0,55 GB**, potong berkas `.jsonl` mentah dengan `split -d -a 2 --line-bytes=1450M --additional-suffix=.jsonl`.
     * Untuk menghasilkan partisi `.jsonl.gz` berukuran mendekati **1,35 GB – 1,50 GB** (dengan rasio kompresi teks JSONL rata-rata ~3x), potong berkas `.jsonl` mentah dengan `split -d -a 2 --line-bytes=4200M --additional-suffix=.jsonl`.
   * **Batas Ukuran Berkas `.jsonl.gz` Terkompresi:** Angka **1,50 GB (`1.500.000.000` byte)** adalah **batas maksimum (*hard ceiling*)** ukuran setiap berkas `.jsonl.gz` terkompresi agar selalu aman di bawah batas 2 GiB GitHub Releases. Berkas partisi `.jsonl.gz` yang ukuran terkompresinya berada di bawah 1,35 GB (misalnya 0,40 GB – 1,35 GB, atau partisi nomor terakhir dari suatu kategori) **dinyatakan 100% SAH** selama memenuhi syarat `0 < size_bytes <= 1.500.000.000` byte dan 0 baris JSON terpotong.

3. **Protokol Retire / Hapus Tag Rilis Lama (Anti-Tag Menganggur):**

   Tag rilis korpus lama yang seluruh isinya telah diserap ke dalam 6 tag resmi WAJIB dihapus rilisnya (*retire release*). Seluruh rilis korpus aktif di GitHub Releases harus terpetakan tepat 1:1 dengan 6 nama tag resmi pada diagram Bab 2.

# **3. PRESEDEN NYATA & SEJARAH ANOMALI SISTEM (LESSONS LEARNED)**

Setiap aturan dan protokol ketat dalam PRD ini disusun berdasarkan insiden teknis nyata yang pernah terjadi pada proses rilis sebelumnya:

1. **Insiden JDIH (Pemisahan Kamar Domain Mutlak):**

   Berkas pindaian dari JDIH (Jaringan Dokumentasi dan Informasi Hukum) hampir salah diklasifikasikan sebagai kandidat K4 koding. Kategori K4 dikunci mutlak hanya untuk domain ilmu komputer, algoritma, dan rekayasa perangkat lunak. Teks hukum, regulasi, dan kedinasan yang sehat dikunci masuk ke kamar K2.

2. **Insiden K3 94% en-simple (Keputusan-014):**

   Partisi K3 sempat terinfiltrasi teks bahasa Inggris sederhana (*en-simple*) hingga mencapai 94% dari volume berkas. Diterapkan ambang batas deteksi bahasa otomatis minimal 95,0% dokumen berbahasa Indonesia untuk setiap berkas partisi `K1, K2, K3` (dengan pengecualian untuk `K4` coding). Seluruh dokumen berbahasa Inggris yang bersih dipindahkan (*reroute*) ke `R1-calon-pengetahuan` di `penampungan-English`.

3. **Insiden MADLAD-400 (Pensiun 8,1 Miliar Kata Akibat Sampah Web):**

   Sekitar 8,1 miliar kata dari dump korpus web publik MADLAD-400 terpaksa dipensiunkan (*retired*) secara massal karena audit pasca-unduh menemukan keberadaan spam SEO, teks mesin rusak, dan duplikasi tak terkendali. Seluruh data mentah wajib melewati pembersihan boilerplate dan deduplikasi MinHash LSH sebelum diizinkan masuk ke tahap penampungan calon korpus.

4. **Bug Dual-Field Manifest (Insiden 2026-09-09):**

   Terjadi tabrakan skema metadata di mana berkas manifest memuat dua field token yang saling tumpang tindih dan dihitung dengan rumus berbeda, menyebabkan skrip dataloader training gagal membaca total token secara akurat. Skema manifest dibakukan secara tunggal (Bab 7) dan skrip penggabungan manifest lama dilarang keras untuk digunakan kembali.

5. **Temuan Audit Korpus K (Penyempurnaan Standar Mutu Textbook Oktober 2026):**

   Audit isi partisi menemukan bahwa pemotongan menggunakan `split --bytes` memutus 1–2 baris JSON di ujung berkas, serta masih adanya URL inline dan ekor berita di `K3-part1`, teks huruf kecil semua (*all-lowercase*) di `K3-part3..5`, spam judi yang disamarkan dengan spasi (`"B a n d a r | J u d i"`), dan cetakan templat cacat OCR (`"Pasal ... Menter! ... No nan Tahun"`) di `K3-part2/6/7`. Seluruh celah tersebut kini ditutup secara deterministik pada Bab 4 dan Bab 5.

# **4. LIMA PEMERIKSAAN 'PAGAR', ATURAN LISENSI, & STANDAR MUTU TEXTBOOK**

## **4.1 Lima Pemeriksaan Checklist 'Pagar' (Untuk Data Baru)**

*(Catatan Terminologi: Istilah **"Pagar"** digunakan khusus untuk 5 pemeriksaan kelayakan awal data mentah pada Bab 4.1 ini, sedangkan istilah **"Gerbang"** pada Bab 6 digunakan khusus untuk 3 verifikasi segel kriptografis SHA-256).*

Sebelum data baru diizinkan masuk ke pipeline pengolahan tingkat lanjut, data wajib lulus 5 pemeriksaan 'Pagar':

1. **Pagar 1 — Pagar Lisensi (License Check):**

   Memverifikasi bahwa sumber data memiliki lisensi terbuka yang sah dan termasuk dalam daftar lisensi yang diperbolehkan pada Bab 4.2.

2. **Pagar 2 — Pagar Provenance / Asal-Usul (Provenance Check):**

   Mencatat riwayat asal data secara presisi (URL asal, waktu pengambilan, metode pengambilan, dan hash arsip mentah).

3. **Pagar 3 — Pagar Isolasi Sistem (Storage Isolation Check):**

   Berkas data skala besar (gigabyte) dilarang keras di-commit ke branch kode Git; seluruh berkas korpus wajib diunggah ke sistem GitHub Releases.

4. **Pagar 4 — Pagar Format & Integritas (Format Integrity Check):**

   Memastikan arsip mentah tidak rusak (bebas error CRC/gzip) dan dapat diekstrak secara konsisten dengan setiap baris JSONL utuh tanpa pemotongan baris.

5. **Pagar 5 — Pagar Sanitasi Awal (Initial Hygiene Check):**

   Memastikan teks dapat didekodekan ke UTF-8 murni tanpa karakter pengganti rusak (`\ufffd`).

## **4.2 Ketentuan Lisensi Data (Allowed vs Prohibited Licenses)**

* **Lisensi yang DIPERBOLEHKAN (Greenlist):**

  * Public Domain / CC0 (`CC0-1.0`): Lisensi bebas tanpa batasan hak cipta.

  * Creative Commons Permisif: `CC-BY-4.0`, `CC-BY-SA-4.0` (dan versi sebelumnya yang setara).

  * Lisensi Software Permisif: `MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`.

  * Open Data Licenses: `ODC-By`, `PDDL`, `CDLA-Permissive-2.0`.

* **Lisensi yang DILARANG KERAS (Blacklist):**

  * **Lisensi Non-Komersial (NC) & Tanpa Turunan (ND):** `CC-BY-NC`, `CC-BY-NC-SA`, `CC-BY-NC-ND`, `CC-BY-ND`.

  * **Hak Cipta Tertutup Tanpa Izin:** Buku komersial berbayar bajakan, makalah ilmiah berbayar (*paywalled*) tanpa hak lisensi terbuka.

  * **Lisensi dengan Klausul Anti-AI:** Konten dari platform web yang secara eksplisit melarang pelatihan model AI.

## **4.3 Matriks Larangan Konten & Aturan Perbaikan Deterministik (6 Aturan Baku)**

Seluruh berkas calon korpus dan rak final wajib memenuhi 6 aturan deterministik berikut (tanpa menggunakan LLM generatif):

1. **Redaksi PII (Personally Identifiable Information):**

   Ganti dengan token `[REDACTED]` menggunakan pencocokan regex deterministik untuk: NIK/KTP (16 digit), nomor paspor, nomor telepon pribadi, alamat email personal non-publik (termasuk mengupas alamat email penulis pada header commit di `K4/R4` tanpa membuang isi kodenya), password, private key/token API (`AKIA...`, `ghp_...`, `sk-...`, `-----BEGIN PRIVATE KEY-----`), dan nomor rekening/kartu.

2. **Pembuangan Konten Toksik, Ilegal, & Spam Judi (Anti-Obfuscation):**

   Buang dokumen JSONL (hapus seluruh baris objek JSON dokumen tersebut) yang memuat ujaran kebencian ekstrem, materi eksploitasi, instruksi pembuatan senjata/bahan peledak, serta promosi perjudian online (`slot gacor`, `togel`, `kasino`, `judi bola`, `poker`, `domino qq`, `rtp live`, `maxwin`). Sebelum pencocokan kata kunci spam judi, salinan teks uji wajib dinormalisasi sementara dengan menghapus spasi tunggal berulang di antara huruf tunggal dan menghapus karakter pemisah (`|`, `-`, `_`, `.`) sehingga pola samaran seperti `"B a n d a r | J u d i | Q Q"` terdeteksi 100% dan seluruh dokumennya dibuang.

3. **Dekontaminasi Tolok Ukur (Benchmark Contamination):**

   Buang dokumen JSONL yang memiliki tumpang tindih n-gram (`13-gram`) atau kemiripan MinHash (`>= 0.85`) terhadap teks soal/jawaban pada set evaluasi standar (`HumanEval`, `MBPP`, `GSM8k`, `MMLU`, `ARC`, `IndoMMLU`) agar evaluasi model bebas kebocoran data (*data leakage*).

4. **Pengupasan URL Inline & Ekor Navigasi Berita (Kupas Sampahnya, Simpan Artikelnya):**

   * **Buang Dokumen Boilerplate Murni:** Buang dokumen JSONL apabila teksnya hanya berisi pemberitahuan cookie (*cookie consent banners*, termasuk terjemahan mesin rusak yang menerjemahkan *cookie* menjadi *"kue"*), daftar menu navigasi header/footer, atau pesan Error 404/500.

   * **Kupas In-Place pada Artikel Sehat (`K1–K3` / `R1–R3`):** Untuk artikel berita/pengetahuan yang memuat baris atau substring URL (`https?://[^\s)\]"']+`) atau kalimat ekor navigasi portal (*"Baca juga:..."*, *"Selanjutnya di halaman..."*, *"Bagikan:..."*, *"Follow..."*, *"Simak selengkapnya..."*, *"Artikel ini telah tayang di..."*), **hapus hanya substring URL dan kalimat ekor tersebut dengan regex**, lalu **pertahankan dokumen utamanya** jika panjang teks bersih setelah dikupas masih **≥ 200 karakter**.

5. **Pembuangan Dokumen Templat Sintetis Cacat OCR (Khusus `K1–K3` & `R1–R3`, Pengecualian Mutlak `K4/R4`):**

   * **Aturan untuk `K1, K2, K3` dan `R1, R2, R3` (Non-Kode):** Buang seluruh dokumen JSONL (1 baris objek JSON penuh) apabila teksnya mengandung pola kegagalan ekstraksi tabel/OCR templat seperti `"No nan Tahun"`, `"Nomor nan Tahun"`, `"Pasal nan"`, `"Peraturan Menter!"`, `"Tahun undefined"`, atau kemunculan literal `" nan "` / `" undefined "` sebagai pengganti nomor/kata dalam kalimat naratif/hukum.

   * **Pengecualian Mutlak untuk `K4` dan `R4` (Coding):** Berkas kode pada `K4` dan `R4` **DIKECUALIKAN 100%** dari penyaringan kata `NaN` dan `undefined`, karena `NaN` dan `undefined` adalah sintaksis valid pada bahasa pemrograman (JavaScript, TypeScript, Python, C++, dll.).

6. **Definisi Eksak *All-Lowercase*, Aturan Kapitalisasi Kalimat Deterministik, & Panjang Minimal:**

   * **Definisi Eksak Dokumen *All-Lowercase*:** Sebuah dokumen pada kategori naratif (`K1–K3` atau `R1–R3`) didefinisikan mengalami cacat huruf kecil semua (*all-lowercase*) apabila **jumlah huruf kapital (`A–Z`) di dalam teks dokumen tersebut adalah `0`, ATAU rasio `jumlah_huruf_kapital / total_huruf_alfabet < 0,002` (< 0,2%)**. Dokumen yang sudah memiliki rasio huruf kapital `>= 0,2%` tidak boleh diubah kapitalisasinya.

   * **Algoritma Kapitalisasi Deterministik (Aman Singkatan & Desimal):** Pada dokumen `K1–K3` / `R1–R3` yang terdeteksi *all-lowercase* (< 0,2% huruf kapital):
     1. Ubah huruf alfabet pertama di awal dokumen menjadi huruf kapital.
     2. Ubah huruf alfabet pertama setelah karakter baris baru (`\n`), tanda seru berspasi (`! `), atau tanda tanya berspasi (`? `) menjadi huruf kapital.
     3. Ubah huruf alfabet pertama setelah tanda titik berspasi (`. `) menjadi huruf kapital, **KECUALI** apabila token kata tepat di depan tanda titik tersebut termasuk dalam daftar singkatan umum (*abbreviation stoplist*, tidak peka huruf besar/kecil): `dr`, `prof`, `ir`, `h`, `hj`, `no`, `hlm`, `hal`, `dll`, `dsb`, `dst`, `tsb`, `dkk`, `pt`, `cv`, `ud`, `tbk`, `rp`, `jl`, `jln`, `kec`, `kab`, `prov`, `vs`, `fig`, `eq`, `al`, `eg`, `ie`, `mr`, `mrs`, `ms`, `st`. (Angka desimal seperti `3.14` atau ribuan seperti `10.000` tidak diikuti spasi setelah titik sehingga otomatis tidak terpengaruh).
     4. **Larangan pada `K4` dan `R4`:** Fungsi kapitalisasi ini **DILARANG KERAS** dijalankan pada kategori `K4` dan `R4` (coding) agar tidak merusak identifier variabel atau sintaksis kode.

   * **Ambang Panjang Minimal Pasca-Pembersihan:** Setelah seluruh pembersihan di atas selesai, panjang `len(text.strip())` wajib minimal **200 karakter** untuk `K1, K2, K3, R1, R2, R3`, dan minimal **128 karakter** untuk `K4, R4` (pesan commit satu baris tanpa isi kode dibuang).

## **4.4 Pencatatan Log Dokumen yang Dibuang & Diperbaiki (Audit Counters)**

Dokumen yang dibuang tidak disimpan sebagai berkas sampah di GitHub Releases. Sebagai gantinya, skrip pembersihan wajib mencetak ringkasan metrik audit ke log eksekusi untuk setiap partisi yang diproses:

* `input_docs`: Jumlah dokumen awal sebelum penyaringan.
* `kept_docs`: Jumlah dokumen bersih yang lolos dan disimpan.
* `repaired_url_tail_docs`: Jumlah dokumen yang berhasil diselamatkan lewat pengupasan URL/ekor berita.
* `repaired_truecase_docs`: Jumlah dokumen *all-lowercase* yang berhasil dipulihkan kapitalisasinya.
* `rerouted_lang_docs`: Jumlah dokumen bersih yang dipindahkan lintas bahasa (`K -> penampungan-English R1` atau `R -> penampungan-Indonesian K1`).
* `dropped_short_docs`, `dropped_gambling_docs`, `dropped_ocr_template_docs`, `dropped_benchmark_docs`, `dropped_duplicate_docs`: Jumlah dokumen yang dibuang per alasan.

# **5. ALUR KHUSUS LENGKAP: RAW -> TOKEN BPE (12 TAHAPAN WAJIB & URUTAN PENERBITAN)**

Urutan 12 tahapan di bawah ini adalah alur kronologis mutlak dari penerimaan data mentah hingga data resmi terbit di Rak Final. Tidak ada tahap yang boleh dibalik:

```
[1. RAW] ──> [2. EXTRACT+CLEAN+REPAIR] ──> [3. DEDUPE] ──> [4. FILTER & REROUTE BAHASA] ──> [5. TOKENIZE BPE]
                                                                                                    │
                                                                                                    ▼
[10. GABUNG LOKAL VM] <── [9. UNGGAH PENAMPUNGAN] <── [8. MANIFEST] <── [7. KOMPRESI .gz] <── [6. SPLIT BARIS]
        │
        ▼
[11. RE-AUDIT FISIK (GERBANG 2 & 3)] ──> [12. TERBIT KE RAK FINAL & SINKRONISASI REPO]
```

## **Rincian 12 Tahapan Operasional**

 1. **Tahap 1 — RAW (Penerimaan Data Mentah di Tingkat 1):**

    Arsip data mentah yang baru diunduh ditempatkan pada tag Tingkat 1 (`Data-baru-Indonesian` atau `data-baru-English`) dan dicatat segel awalnya melalui **Gerbang 1** (Bab 6.1).

 2. **Tahap 2 — EXTRACT + CLEAN + IN-PLACE REPAIR (Penerapan Lengkap 6 Aturan Bab 4.3):**

    Mengekstrak teks murni, membuang tag HTML/XML/markup kotor, menormalisasi unicode (`NFC`), lalu menerapkan secara berurutan **seluruh 6 aturan Bab 4.3**:
    * (1) Redaksi PII menjadi `[REDACTED]`,
    * (2) Pembuangan konten toksik & spam judi dengan normalisasi anti-obfuscation,
    * (3) Dekontaminasi tolok ukur (*benchmark decontamination* 13-gram/MinHash),
    * (4) Pengupasan URL inline & ekor navigasi berita (*simpan artikel jika masih ≥200 karakter*),
    * (5) Pembuangan dokumen templat cacat OCR (`"No nan Tahun"`, `"Peraturan Menter!"`) khusus pada `K1–K3` / `R1–R3` (*dengan pengecualian mutlak untuk `K4/R4` coding*),
    * (6) Pemulihan kapitalisasi kalimat deterministik pada dokumen *all-lowercase* (`K1–K3` / `R1–R3`) serta penyaringan panjang minimal (**≥200 karakter** untuk `K1–K3`/`R1–R3`, **≥128 karakter** untuk `K4/R4`),
    kemudian menulis hasilnya ke format JSONL utuh (1 baris fisik = 1 objek JSON `{"text": "..."}`).

 3. **Tahap 3 — DEDUPE (Deduplikasi Eksak + MinHash LSH):**

    Menjalankan deduplikasi dokumen menggunakan hash eksak SHA-256 (atas teks yang dinormalisasi huruf kecil dan spasi tunggal) dilanjutkan MinHash LSH (128 permutasi, ambang kemiripan Jaccard `0.85`) untuk membuang salinan dokumen yang identik atau hampir identik.

 4. **Tahap 4 — FILTER & REROUTE BAHASA (Standar `fastText`, Hitungan Per Dokumen, & Pengecualian `K4/R4`):**

    * **Alat & Satuan Ukur:** Deteksi bahasa dijalankan per dokumen menggunakan model **`fastText` (`lid.176.bin`)** (atau *fallback* deterministik rasio kata fungsi baku Bahasa Indonesia vs Bahasa Inggris jika binari tidak tersedia). Ambang kemurnian bahasa **≥ 95,0%** dihitung dari **jumlah dokumen berbahasa target dibagi total dokumen di dalam satu berkas partisi** (`count(doc_lang == target) / documents_count >= 0.95`).
    * **Aturan Reroute Lintas Jalur (Ke Tingkat Penampungan):**
      * Pada pemrosesan kategori non-kode jalur K (`K1, K2, K3`), dokumen bersih (≥200 karakter) yang terdeteksi berbahasa Inggris (`__label__en`) **dipindahkan (*reroute*) ke berkas `R1-calon-pengetahuan-part*.jsonl.gz` untuk diunggah ke tag `penampungan-English`**.
      * Sebaliknya, pada pemrosesan kategori non-kode jalur R (`R1, R2, R3`), dokumen bersih (≥200 karakter) yang terdeteksi berbahasa Indonesia (`__label__id`) **dipindahkan (*reroute*) ke berkas `K1-calon-pengetahuan-part*.jsonl.gz` untuk diunggah ke tag `penampungan-Indonesian`**.
    * **Pengecualian Mutlak `K4` dan `R4` (Coding):** Kategori **`K4` dan `R4` dikecualikan dari ambang bahasa 95,0%** karena kode pemrograman menggunakan kata kunci bahasa Inggris secara universal.

 5. **Tahap 5 — TOKENIZE BPE (Perhitungan Token BPE Riil & `vocab_size = 32000`):**

    Menghitung jumlah kata (`tokens_word_count`, dipisah whitespace) dan jumlah token BPE (`tokens_bpe`) secara langsung dari teks setiap dokumen menggunakan tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js` dengan konstanta baku `VOCAB_SIZE = 32000`, atau `len(vocab)` aktual apabila memuat berkas `tokenizer.json` kustom). Nilai `tokenizer.vocab_size` di `manifest.json` dicatat sebesar `32000` (mengikuti `VOCAB_SIZE` pada `bpe-shell.js`).

 6. **Tahap 6 — PEMOTONGAN AMAN BARIS (Line-Safe Partitioning Sebelum Kompresi):**

    Memecah berkas `.jsonl` mentah pada **batas baris utuh (`\n`)** menggunakan `split --line-bytes=1450M` (menghasilkan `.jsonl.gz` ~0,5 GB) atau `split --line-bytes=4200M` (menghasilkan `.jsonl.gz` ~1,4 GB) atau penulis baris JSONL terprogram. **Dilarang keras** menggunakan `split --bytes` (`split -b`).

 7. **Tahap 7 — KOMPRESI (`.jsonl.gz`, Maksimum 1,50 GB per Berkas):**

    Mengompresi setiap partisi `.jsonl` menggunakan `gzip` menjadi ekstensi baku **`.jsonl.gz`** (penggunaan ekstensi `.gzip` dilarang). Ukuran setiap berkas `.jsonl.gz` terkompresi wajib memenuhi `0 < size_bytes <= 1.500.000.000` byte (maksimal 1,50 GB; partisi di bawah 1,35 GB tetap sah).

 8. **Tahap 8 — TULIS MANIFEST & SHA256SUMS (Perhitungan Fisik):**

    Menghitung `sha256`, `size_bytes`, `documents_count`, `tokens_bpe`, dan `tokens_word_count` dari setiap berkas fisik `.jsonl.gz` ke dalam `manifest.json` dan `SHA256SUMS`.

 9. **Tahap 9 — UNGGAH KE PENAMPUNGAN (Status: Calon Korpus di Tingkat 2):**

    Berkas `.jsonl.gz`, `manifest.json`, dan `SHA256SUMS` yang telah lulus pemeriksaan ditempatkan pada tag resmi Tingkat 2: **`penampungan-Indonesian`** atau **`penampungan-English`**. Pada tahap ini data berstatus **Calon Korpus** (belum terbit sebagai Rak Final).

10. **Tahap 10 — GABUNG KANONIK DI LOKAL VM (Local Canonical Merge Before Publish):**

    Untuk mempromosikan Calon Korpus ke Rak Final, eksekutor mengunduh aset/manifest Rak Final saat ini ke ruang kerja lokal VM, menggabungkannya dengan partisi baru dari `penampungan`, menjalankan deduplikasi lintas-partisi, menomori partisi secara berurutan (`part1, part2, ...`) tanpa tabrakan nama, serta menyusun `manifest.json` dan `SHA256SUMS` kandidat Rak Final di dalam VM.

11. **Tahap 11 — RE-AUDIT FISIK PRA-TERBIT (Gerbang 2 & Gerbang 3 Wajib Lulus di VM):**

    Di dalam VM lokal—**sebelum mengunggah ke tag Rak Final**—eksekutor wajib menjalankan skrip **Gerbang 2 (Bab 6.2)** dan **Gerbang 3 (Bab 6.3)** untuk memverifikasi secara fisik bahwa seluruh berkas `.jsonl.gz` memiliki 0 baris JSON terpotong, ukuran byte fisik dan hash SHA-256 di disk 100% cocok dengan `manifest.json` serta `SHA256SUMS`, dan jumlah dokumen serta kata di dalam berkas `.jsonl.gz` sama persis dengan angka di `manifest.json`.

12. **Tahap 12 — PUBLIKASI RESMI KE RAK FINAL & SINKRONISASI REPO (Titik Data Resmi Terbit):**

    Setelah Tahap 11 lulus 100% tanpa error:
    * **1. Unggah ke Tag Rak Final:** Unggah seluruh berkas `.jsonl.gz`, `manifest.json`, dan `SHA256SUMS` ke tag **`K-dataset-Indonesian`** atau **`R-dataset-english`**. **Tepat setelah unggahan ini selesai, korpus dinyatakan resmi terbit (*published*).**
    * **2. Bersihkan Aset Penampungan yang Telah Dipromosikan:** Hapus berkas calon korpus yang sudah resmi masuk ke Rak Final dari tag `penampungan-Indonesian` / `penampungan-English` agar tidak terjadi duplikasi penyimpanan.
    * **3. Commit Sinkronisasi ke Git Repo:** Perbarui angka riil terbaru di `docs/STATUS-KORPUS-LISENSI.md` dan `README.md` sesuai `manifest.json` Rak Final yang baru terbit.

# **6. SEGEL SHA-256 — TIGA GERBANG WAJIB (VERIFIKASI FISIK MANDIRI)**

Ketiga gerbang verifikasi kriptografis di bawah ini menggunakan perintah standar Linux dan Python 3 bawaan (*self-contained*, tanpa skrip eksternal) dan **wajib menghitung langsung dari berkas fisik di disk**:

## **6.1 Gerbang 1 — Segel Sumber Mentah (Source Ingestion Hash)**

Setiap berkas data mentah yang diterima pada Tahap 1 langsung dicatat hash SHA-256 fisiknya:

```
# Perintah Gerbang 1: Pembuatan segel hash data mentah
sha256sum raw_source_part*.tar.gz > source_raw.sha256
```

## **6.2 Gerbang 2 — Segel Partisi `.jsonl.gz` & Verifikasi Fisik 0 Baris JSON Terpotong**

Pada Tahap 8 dan Tahap 11, setiap berkas `.jsonl.gz` wajib diverifikasi bahwa seluruh barisnya adalah objek JSON utuh yang memiliki field `"text"` tidak kosong, lalu dibuatkan berkas `SHA256SUMS`:

```
# 1. Verifikasi mandiri: pastikan 0 baris JSON terpotong di seluruh berkas .jsonl.gz
for f in *.jsonl.gz; do
  gzip -dc "$f" | python3 -c '
import sys, json
count = 0
for count, line in enumerate(sys.stdin, 1):
    obj = json.loads(line)
    assert isinstance(obj.get("text"), str) and len(obj["text"].strip()) > 0, f"Baris kosong di baris {count}"
assert count > 0, "Berkas kosong!"
print(f"OK: {count} baris JSON utuh")
' || exit 1
done

# 2. Pembuatan daftar checksum rilis & verifikasi fisik
sha256sum *.jsonl.gz > SHA256SUMS
sha256sum -c SHA256SUMS
```

## **6.3 Gerbang 3 — Verifikasi Fisik & Matematis `manifest.json` terhadap Berkas `.jsonl.gz` dan `SHA256SUMS`**

Pada Tahap 11 (sebelum unggah ke Rak Final), jalankan skrip satu baris di bawah ini. Skrip ini **tidak hanya memeriksa penjumlahan internal `manifest.json`, melainkan juga membuka langsung setiap berkas fisik `.jsonl.gz` di disk** untuk memverifikasi `size_bytes`, `sha256`, `documents_count`, dan `tokens_word_count` secara nyata sehingga mustahil ada angka halusinasi:

```
# Perintah Gerbang 3: Verifikasi fisik berkas .jsonl.gz + konsistensi matematis manifest.json & SHA256SUMS
python3 -c '
import gzip, hashlib, json, os

with open("manifest.json", "r", encoding="utf-8") as fh:
    m = json.load(fh)

sums = {}
with open("SHA256SUMS", "r", encoding="utf-8") as sh:
    for line in sh:
        if line.strip():
            h, fn = line.strip().split(None, 1)
            sums[fn.lstrip("*")] = h

files = m["files"]
assert len(files) == len({f["filename"] for f in files}), "Konflik nama berkas ganda!"

for f in files:
    fn = f["filename"]
    assert fn.endswith(".jsonl.gz"), f"Ekstensi tidak baku: {fn}"
    assert os.path.isfile(fn), f"Berkas fisik tidak ditemukan: {fn}"
    actual_size = os.path.getsize(fn)
    assert 0 < actual_size <= 1_500_000_000, f"Ukuran berkas di luar batas (0..1.5GB): {fn} ({actual_size} B)"
    assert actual_size == f["size_bytes"], f"size_bytes manifest != fisik ({actual_size}) pada {fn}"

    h = hashlib.sha256()
    with open(fn, "rb") as bf:
        for chunk in iter(lambda: bf.read(1024 * 1024), b""):
            h.update(chunk)
    actual_sha = h.hexdigest()
    assert actual_sha == sums.get(fn), f"SHA256 fisik != SHA256SUMS pada {fn}"
    assert actual_sha == f["sha256"], f"SHA256 fisik != manifest pada {fn}"

    actual_docs = 0
    actual_words = 0
    with gzip.open(fn, "rt", encoding="utf-8") as gf:
        for line in gf:
            obj = json.loads(line)
            txt = obj["text"].strip()
            assert len(txt) > 0, f"Teks kosong di {fn}"
            actual_docs += 1
            actual_words += len(txt.split())
    assert actual_docs == f["documents_count"], f"documents_count manifest != fisik ({actual_docs}) pada {fn}"
    assert actual_words == f["tokens_word_count"], f"tokens_word_count manifest != fisik ({actual_words}) pada {fn}"
    assert f["tokens_bpe"] >= actual_words, f"tokens_bpe tidak valid terhadap kata ({actual_words}) pada {fn}"

for cat, info in m["categories"].items():
    cat_files = [f for f in files if f["category"] == cat]
    assert info["partitions"] == len(cat_files), f"Jumlah partisi {cat} tidak cocok"
    assert info["documents_count"] == sum(f["documents_count"] for f in cat_files), f"Jumlah dokumen {cat} tidak cocok"
    assert info["tokens_bpe"] == sum(f["tokens_bpe"] for f in cat_files), f"Jumlah BPE {cat} tidak cocok"
    assert info["tokens_word_count"] == sum(f["tokens_word_count"] for f in cat_files), f"Jumlah kata {cat} tidak cocok"

s = m["summary"]
assert s["total_partitions"] == len(files), "total_partitions tidak cocok"
assert s["total_documents"] == sum(f["documents_count"] for f in files), "total_documents tidak cocok"
assert s["total_tokens_bpe"] == sum(f["tokens_bpe"] for f in files), "total_tokens_bpe tidak cocok"
assert s["total_tokens_word_count"] == sum(f["tokens_word_count"] for f in files), "total_tokens_word_count tidak cocok"
assert s["total_compressed_bytes"] == sum(f["size_bytes"] for f in files), "total_compressed_bytes tidak cocok"
print("LULUS 100%: BERKAS FISIK, SHA256SUMS, DAN MANIFEST.JSON KONSISTEN SECARA MATEMATIS & FISIK!")
'
```

# **7. PERINGATAN BAHAYA SKRIP USANG & SKEMA MANIFEST WAJIB**

## **7.1 Peringatan Kritis: Deprecating `merge-korpus-manifest.py`**

**PERINGATAN MERAH (CRITICAL SYSTEM WARNING):**

Skrip lama bernama `merge-korpus-manifest.py` dinyatakan **USANG, CACAT SKEMA, DAN DILARANG KERAS UNTUK DIGUNAKAN.**

Menjalankan skrip lama tersebut akan menimpa berkas manifest modern dengan skema lama yang menghilangkan rincian `tokens_bpe` dan `documents_count` per berkas di dalam `files[]`, serta memicu kembali *Bug Dual-Field Token* (Insiden 2026-09-09). Seluruh penyusunan dan penggabungan `manifest.json` wajib lulus skrip validasi fisik dan matematis pada **Bab 6.3**.

## **7.2 Skema Manifest Baku (`manifest.json`)**

Setiap paket rilis pada tingkat penampungan maupun rak final wajib menyertakan berkas `manifest.json` dengan struktur di bawah ini.

*(Catatan Anti-Halusinasi: Angka pada blok JSON di bawah ini hanyalah contoh struktur skema untuk 4 berkas. Pada rilis nyata, eksekutor WAJIB mengisi seluruh angka berdasarkan hasil perhitungan skrip langsung atas seluruh berkas fisik `.jsonl.gz` yang ada di rilis tersebut dan memvalidasinya dengan perintah Gerbang 3 pada Bab 6.3).*

```
{
  "release_tag": "K-dataset-Indonesian",
  "version": "2.0.0",
  "language": "id",
  "created_at": "2026-10-17T05:00:00Z",
  "tokenizer": {
    "name": "rategoan-bpe",
    "vocab_size": 32000,
    "encoding_type": "byte-level-bpe-cased"
  },
  "summary": {
    "total_partitions": 4,
    "total_documents": 1950000,
    "total_tokens_bpe": 650000000,
    "total_tokens_word_count": 460000000,
    "total_compressed_bytes": 4100000000,
    "total_uncompressed_bytes": 12800000000,
    "sha256_sealed": true
  },
  "categories": {
    "K1": {
      "label": "pengetahuan",
      "partitions": 1,
      "documents_count": 500000,
      "tokens_bpe": 200000000,
      "tokens_word_count": 140000000
    },
    "K2": {
      "label": "dialog",
      "partitions": 1,
      "documents_count": 450000,
      "tokens_bpe": 150000000,
      "tokens_word_count": 110000000
    },
    "K3": {
      "label": "pelengkap",
      "partitions": 1,
      "documents_count": 700000,
      "tokens_bpe": 180000000,
      "tokens_word_count": 130000000
    },
    "K4": {
      "label": "coding",
      "partitions": 1,
      "documents_count": 300000,
      "tokens_bpe": 120000000,
      "tokens_word_count": 80000000
    }
  },
  "files": [
    {
      "filename": "K1-pengetahuan-part1.jsonl.gz",
      "category": "K1",
      "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      "size_bytes": 1100000000,
      "documents_count": 500000,
      "tokens_bpe": 200000000,
      "tokens_word_count": 140000000,
      "license": "CC-BY-SA-4.0"
    },
    {
      "filename": "K2-dialog-part1.jsonl.gz",
      "category": "K2",
      "sha256": "a1b2c3d498fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b111",
      "size_bytes": 950000000,
      "documents_count": 450000,
      "tokens_bpe": 150000000,
      "tokens_word_count": 110000000,
      "license": "CC-BY-4.0"
    },
    {
      "filename": "K3-pelengkap-part1.jsonl.gz",
      "category": "K3",
      "sha256": "b2c3d4e598fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b222",
      "size_bytes": 1200000000,
      "documents_count": 700000,
      "tokens_bpe": 180000000,
      "tokens_word_count": 130000000,
      "license": "CC0-1.0"
    },
    {
      "filename": "K4-coding-part1.jsonl.gz",
      "category": "K4",
      "sha256": "c3d4e5f698fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b333",
      "size_bytes": 850000000,
      "documents_count": 300000,
      "tokens_bpe": 120000000,
      "tokens_word_count": 80000000,
      "license": "MIT"
    }
  ]
}
```

# **8. STRATEGI TOKENIZER RAK R (PENYELESAIAN GAP TOKENIZER GLOBAL)**

## **8.1 Analisis Masalah: Karakteristik Tokenizer BPE terhadap Teks Inggris**

* **Kondisi Eksisting:** Tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js`, memiliki konstanta baku `VOCAB_SIZE = 32000` dengan pengkodean *byte-level BPE cased*) dioptimalkan untuk morfologi Bahasa Indonesia. Oleh karena itu, nilai `tokenizer.vocab_size` pada `manifest.json` selalu diisi **`32000`** saat menggunakan tokenizer bawaan tersebut (atau diisi jumlah entri `vocab` aktual jika memuat berkas `tokenizer.json` hasil pelatihan kosakata baru).

* **Tantangan Teknis:** Jika teks bahasa Inggris teknis, medis, dan koding pada Rak R (PubMed, peS2o, StackExchange) ditokenisasi menggunakan kosakata yang didominasi Bahasa Indonesia, dapat terjadi fenomena **Token Fragmentation & Inflation** (~1,8x hingga 2,2x lebih banyak token dibanding tokenizer standar internasional). Hal ini perlu diperhitungkan agar jendela konteks (*context window*) dan throughput pelatihan tetap efisien.

## **8.2 Solusi Strategi Tokenizer Dua Arah**

1. **Solusi Fase A (Transisi / Jangka Pendek — Inflation-Budgeting):**

   Tetap menggunakan Tokenizer BPE resmi Rategoan (`vocab_size: 32000`) demi menjaga konsistensi dimensi layer embedding model saat ini, namun pada pelaporan manifest dan budgeting batch training diterapkan faktor normalisasi inflasi token (*token inflation factor*) sehingga perbandingan volume informasi teks Inggris tetap akurat.

2. **Solusi Fase B (Arsitektur Matang / Jangka Panjang — Unified Bilingual Tokenizer 64k):**

   Melakukan ekspansi kosakata terencana menjadi 64.000 token (`vocab_size: 64000`, menambahkan token BPE yang diserap dari korpus Rak R dan sintaksis bahasa pemrograman dunia). Solusi ini menghasilkan efisiensi kompresi tinggi yang seimbang antara Bahasa Indonesia dan Bahasa Inggris tanpa merusak token bahasa Indonesia yang sudah ada.

# **9. STANDARISASI ENAM NAMA TAG DAN NAMA ASET FILE**

Seluruh rilis korpus di GitHub Releases wajib menggunakan **tepat 6 nama tag resmi** berikut (menggunakan tanda hubung `-` tanpa spasi), dan seluruh aset berkas partisi menggunakan ekstensi seragam **`.jsonl.gz`**:

## **9.1 Tingkat 3 — Poros Bahasa Indonesia (Tag 1: `K-dataset-Indonesian`)**

Menyatukan seluruh aset K1, K2, K3, dan K4 yang telah resmi terbit ke dalam satu tag rilis terpadu berstandar mutu *textbook* (bebas bertambah tanpa batas jumlah partisi seiring masuknya data bersih baru).

Format nama aset berkas:

* `K1-pengetahuan-part1.jsonl.gz` (dan seterusnya: `part2`, `part3`, ...)

* `K2-dialog-part1.jsonl.gz` (dan seterusnya...)

* `K3-pelengkap-part1.jsonl.gz` (dan seterusnya — wajib `.jsonl.gz`, bukan `.gzip`)

* `K4-coding-part1.jsonl.gz` (dan seterusnya...)

## **9.2 Tingkat 3 — Poros Bahasa Inggris (Tag 2: `R-dataset-english`)**

Format nama aset berkas:

* `R1-pengetahuan-part1.jsonl.gz` (dan seterusnya...)

* `R2-dialog-part1.jsonl.gz` (dan seterusnya...)

* `R3-pelengkap-part1.jsonl.gz` (dan seterusnya...)

* `R4-coding-part1.jsonl.gz` (dan seterusnya...)

## **9.3 Tingkat 2 — Penampungan Calon Korpus (Tag 3: `penampungan-Indonesian` & Tag 4: `penampungan-English`)**

* Pada `penampungan-Indonesian`: `K1-calon-pengetahuan-part1.jsonl.gz`, `K2-calon-dialog-part1.jsonl.gz`, `K3-calon-pelengkap-part1.jsonl.gz`, `K4-calon-coding-part1.jsonl.gz`, dst.

* Pada `penampungan-English`: `R1-calon-pengetahuan-part1.jsonl.gz`, `R2-calon-dialog-part1.jsonl.gz`, `R3-calon-pelengkap-part1.jsonl.gz`, `R4-calon-coding-part1.jsonl.gz`, dst.

* Menampung seluruh berkas calon korpus hasil Tahap 2–8 beserta hasil reroute lintas bahasa sebelum digabungkan secara lokal di VM (Tahap 10), diaudit fisik (Tahap 11), dan dipromosikan ke Rak Final (Tahap 12).

## **9.4 Tingkat 1 — Data Baru / Mentah (Tag 5: `Data-baru-Indonesian` & Tag 6: `data-baru-English`)**

* Menampung seluruh arsip data mentah yang baru masuk sebelum diolah oleh pipeline Tahap 2.

# **10. STRATEGI PELATIHAN DUAL-KORPUS DENGAN FORMULA MATEMATIS**

## **10.1 Filosofi Dual-Engine**

* **Korpus K (Identity Engine):** Menjamin keluwesan alami, kepatuhan tata bahasa (PUEBI/KBBI), pemahaman konteks sosial-budaya Indonesia, sastra, hukum, dan regulasi nasional.

* **Korpus R (Reasoning Engine):** Menjadi motor nalar logika, pemecahan masalah algoritma/coding, serta wawasan sains dan riset medis global.

## **10.2 Proporsi Sampling DataLoader Saat Pelatihan (Bukan Pembatas Penyimpanan Rak)**

Proporsi di bawah ini hanya mengatur **rasio penarikan batch (sampling weight) oleh DataLoader saat proses training berjalan**, dan **sama sekali tidak membatasi jumlah token yang boleh disimpan di masing-masing rak K1–K4 maupun R1–R4**:

* **Korpus K (Bahasa Indonesia) — 55% hingga 60% dari batch latihan:**

  * K1 (Pengetahuan): 20%

  * K2 (Dialog & Regulasi Formal): 15%

  * K3 (Pelengkap): 10%

  * K4 (Coding ID): 10% – 15%

* **Korpus R (Bahasa Inggris) — 40% hingga 45% dari batch latihan:**

  * R1 (Pengetahuan Global): 10%

  * R2 (Sains, Medis, & Riset Akademik): 15%

  * R3 (Problem Solving & Technical Q&A): 10%

  * R4 (Coding & Systems EN): 10%

## **10.3 Formula Matematis Oversampling & Sampling Probability**

Apabila suatu kategori memiliki volume token yang lebih kecil atau lebih besar dibanding bobot samplingnya pada saat pelatihan dimulai, DataLoader menyesuaikan secara dinamis menggunakan rumus:

```
repeat_factor = ceil(Target_Tokens / Source_Tokens)
P(Domain_i) = (w_i * N_i) / sum_j(w_j * N_j)
```

Di mana `w_i` adalah bobot sampling domain tersebut dan `N_i` adalah jumlah total token pada partisi domain tersebut. Semakin besar jumlah token murni yang berhasil dikumpulkan pada suatu kamar (misalnya K4/R4 coding atau K1/R1 pengetahuan mencapai puluhan miliar token), semakin kaya variasi data yang dipelajari model tanpa perlu mengulang dokumen yang sama.

## **10.4 Kurikulum Dua Tahap (Two-Stage Curriculum Learning)**

1. **Fase 1: Pembangunan Fondasi Nalar (80% Langkah Awal):**

   Rasio seimbang 50% K : 50% R untuk membentuk ruang representasi bersama (*shared latent space*), di mana model menyerap logika abstrak sains dan kode secara mendalam bersamaan dengan teks Indonesia.

2. **Fase 2: Indonesian Alignment & Annealing (20% Langkah Terakhir):**

   Rasio diubah dominan menjadi 75%–80% K : 20%–25% R dengan learning rate melandai (*cosine decay*) menggunakan partisi K1, K2, dan K4 terbaik. Fase ini mengunci preferensi model agar secara bawaan selalu merespons luwes dalam Bahasa Indonesia dengan tetap mempertahankan nalar sains yang telah diserap dari korpus R.

## **10.5 Evaluasi Cross-Lingual Reasoning Transfer**

Kriteria kelulusan model fondasi hasil pelatihan dual-korpus ini:

1. Mampu menerima prompt instruksi kompleks dalam Bahasa Indonesia mengenai domain sains lanjutan, kedokteran, atau algoritma perangkat lunak.

2. Mampu mengeksekusi rantai penalaran logis (*Chain-of-Thought*) berbasis pengetahuan yang diserap dari Rak R (PubMed, peS2o, StackExchange).

3. Mampu merumuskan sintesis jawaban akhir secara presisi, runtut, dan alami dalam Bahasa Indonesia baku (K).

# **11. STANDAR KETERANGAN RESMI SETIAP TAG (RELEASE NOTES)**

Keterangan berikut wajib dipasang pada deskripsi rilis masing-masing dari 6 tag resmi:

## **A. Keterangan pada Tag: `K-dataset-Indonesian`**

**K-dataset-Indonesian**

Tag rilis final untuk korpus bersih mutu *textbook* Bahasa Indonesia (token BPE).

Menyatukan seluruh aset korpus bersih ke dalam satu rak rilis terpadu yang terus bertambah seiring promosi calon korpus baru:

* `K1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan K1

* `K2-dialog-part*.jsonl.gz` : Aset dialog K2

* `K3-pelengkap-part*.jsonl.gz` : Aset pelengkap K3

* `K4-coding-part*.jsonl.gz` : Aset coding K4

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.

## **B. Keterangan pada Tag: `R-dataset-english`**

**R-dataset-english**

Tag rilis final untuk korpus bersih mutu *textbook* Bahasa Inggris (token BPE).

Kategori aset dibuat simetris dengan K untuk materi berbahasa Inggris:

* `R1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan R1

* `R2-dialog-part*.jsonl.gz` : Aset dialog R2

* `R3-pelengkap-part*.jsonl.gz` : Aset pelengkap R3

* `R4-coding-part*.jsonl.gz` : Aset coding R4

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.

## **C. Keterangan pada Tag: `penampungan-Indonesian` & `penampungan-English`**

**Penampungan (Calon Korpus)**

Berisi seluruh data yang sudah melewati proses penyaringan awal dan telah menjadi calon korpus (`K1-calon` s/d `K4-calon` atau `R1-calon` s/d `R4-calon`).

Data di tag ini siap digabungkan dan menjalani re-audit fisik (Gerbang 2 & Gerbang 3) di VM sebelum diterbitkan ke rak final `K-dataset-Indonesian` / `R-dataset-english`.

## **D. Keterangan pada Tag: `Data-baru-Indonesian` & `data-baru-English`**

**Data Baru (Data Mentah)**

Tempat penampungan seluruh data mentah yang baru masuk sebelum masuk ke tahapan pemrosesan dan penyaringan.

# **12. KESIMPULAN & INTEGRITAS SISTEM**

Melalui standar **PRD RELEASE** yang telah disempurnakan ini:

1. **Disiplin Pembagian Peran:** Claude bertanggung jawab atas arsitektur dan audit, sedangkan Grok Build, Manus AI, dan Dirigen memegang otoritas penuh eksekusi penerbitan rilis.

2. **Akumulasi Terbuka Tanpa Batas Atas:** Tidak ada pembatasan kuota maksimal pada kamar K1–K4 maupun R1–R4; seluruh kategori bebas mengumpulkan token *textbook* sebanyak-banyaknya dengan mengutamakan perbaikan deterministik (*in-place repair*) agar data sehat tidak terbuang sia-sia.

3. **100% Deterministik, Bebas Halusinasi, & Bebas Ambiguitas:** Urutan kapan data terbit (Tahap 9–12), rumus pemotongan `.jsonl` mentah vs batas ukuran `.jsonl.gz`, tujuan reroute lintas bahasa ke tingkat penampungan, satuan ukur bahasa 95,0% per dokumen via `fastText` beserta pengecualian mutlak `K4/R4`, definisi `<0,2%` huruf kapital untuk *truecasing* aman-singkatan, hingga skrip Gerbang 3 yang memverifikasi langsung berkas fisik `.jsonl.gz` telah dikunci secara eksak.

4. **Penyelesaian Gap Tokenizer:** Strategi dua tahap disiapkan untuk mengatasi inflasi token bahasa Inggris pada Rak R dengan pencatatan `vocab_size: 32000` yang konsisten terhadap `raget/raget-neural/bpe-shell.js`.

5. **Verifikasi Kriptografis & Fisik Mutlak:** Tiga Gerbang Segel SHA-256 menjamin tidak ada tabrakan berkas partisi, baris JSON terpotong, maupun angka manifest halusinasi.

# **13. MANDAT KHUSUS EKSEKUTOR: PERCEPATAN PENYARINGAN, PERBAIKAN DETERMINISTIK, & PROMOSI PENAMPUNGAN (PRIORITAS P0)**

## **13.1 Latar Belakang & Prinsip Eksekusi**

Agar persiapan data berjalan cepat, tidak membuang data sehat secara sia-sia, dan bebas dari multi-tafsir antar-eksekutor, alur penyaringan `Data-baru` → `penampungan` → `Rak Final` wajib dijalankan terus-menerus dengan aturan deterministik di bawah ini.

## **13.2 Instruksi Operasional P0 bagi Eksekutor (Grok Build / Manus AI / Dirigen)**

1. **Kuras Habis `Data-baru` dan Promosikan `penampungan` Secara Berkelanjutan:**

   Seluruh berkas mentah di `Data-baru-Indonesian` dan `data-baru-English` wajib segera diproses melalui Tahap 2–8 dan diunggah ke `penampungan-Indonesian` dan `penampungan-English`. Berkas calon korpus yang sudah siap di `penampungan-Indonesian` (`K1-calon` s/d `K4-calon`) dan `penampungan-English` (`R1-calon` s/d `R4-calon`) wajib digabungkan di lokal VM (Tahap 10), diverifikasi fisik dengan Gerbang 2 & Gerbang 3 (Tahap 11 / Bab 6.2 & 6.3), lalu diunggah resmi ke `K-dataset-Indonesian` serta `R-dataset-english` (Tahap 12).

2. **Bersihkan Residu di Rak K Secara Deterministik Tanpa Membuang Dokumen Sehat:**

   * **Kupas URL & Ekor Berita (`K3-part1`):** Hapus hanya substring URL (`http://...`, `https://...`) dan kalimat ekor navigasi (*"Baca juga:"*, *"Bagikan:"*, *"Follow..."*), lalu simpan dokumen utamanya yang masih memiliki panjang ≥200 karakter bersih.

   * **Pulihkan Kapitalisasi Kalimat Secara Deterministik (`K3-part3, 4, 5`):** Pada dokumen naratif yang rasio huruf kapitalnya `< 0,2%` (*all-lowercase*), jalankan kapitalisasi huruf pertama awal dokumen dan setelah tanda `. `, `! `, `? `, `\n` dengan mematuhi daftar pengecualian singkatan pada **Bab 4.3 Butir 6**, serta buang dokumen JSONL yang memuat spam judi (`"B a n d a r | J u d i"`).

   * **Buang Dokumen Templat Cacat OCR & Gabungkan Pasokan Penampungan (`K3-part2, 6, 7`):** Hapus dokumen JSONL (baris objek JSON) pada kategori non-kode yang memuat string templat gagal baca `"No nan Tahun"`, `"Nomor nan Tahun"`, atau `"Peraturan Menter!"`, pertahankan seluruh dokumen naratif/hukum yang sehat di dalamnya, dan gabungkan bersama berkas baru dari `penampungan-Indonesian`. *(Ingat: larangan `NaN` dan `undefined` TIDAK berlaku untuk `K4/R4` coding).*

   * **Reroute Dokumen Bahasa Inggris ke `penampungan-English` (`K1-part2`):** Pindahkan dokumen berbahasa Inggris bersih (`__label__en`, ≥200 karakter) yang tersaring dari `K1-part2` ke berkas calon korpus **`R1-calon-pengetahuan-part*.jsonl.gz` pada tag `penampungan-English`** (dan sebaliknya untuk dokumen Bahasa Indonesia bersih di jalur R ke **`K1-calon-pengetahuan-part*.jsonl.gz` pada tag `penampungan-Indonesian`**) agar tidak ada token bersih yang terbuang.

   * **Hitung Penuh Token Riil `K4` & Potong pada Batas Baris (`\n`):** Redaksi email pada header commit `K4-coding-part1` menjadi `[REDACTED]`, buang duplikat identik dan pesan commit satu baris (<128 karakter), kecualikan `K4` dari filter bahasa 95% dan filter `NaN`/`undefined`, hitung token BPE riil `K4` ke dalam `manifest.json`, seragamkan seluruh ekstensi berkas menjadi `.jsonl.gz`, dan potong `.jsonl` mentah pada batas baris utuh (`split --line-bytes=1450M` atau `4200M`) sehingga ukuran setiap `.jsonl.gz` berada pada `0 < size_bytes <= 1.500.000.000` byte dengan 0 baris JSON terpotong.

3. **Kejujuran Mutlak Pelaporan Manifest (Verifikasi Fisik Bab 6.3):**

   Setiap selesai menggabungkan partisi di lokal VM dan sebelum mengunggah ke Rak K maupun Rak R, eksekutor wajib menjalankan skrip validasi fisik **Bab 6.3** hingga mencetak `LULUS 100%`, lalu mencatat angka riil hasil perhitungan berkas fisik tersebut ke dalam `manifest.json`, `docs/STATUS-KORPUS-LISENSI.md`, dan `README.md`.