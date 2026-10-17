# **PRD RELEASE**

**Spesifikasi Standar Rilis Korpus Data Mutu Textbook, Tata Kelola Rak, Tata Nama Aset, Protokol Integritas, dan Strategi Pelatihan**  
*Status: Standar Operasional Baku Sistem Rilis Data Rategoan (Bebas Ambiguitas & Anti-Halusinasi)*  
*Berlaku Per: Oktober 2026*  

---

# **0. PEMBAGIAN PERAN KERJA & TITIK SERAH TERIMA (WORKER ROLES & HANDOFF)**

Untuk memastikan disiplin operasional dan mencegah tabrakan eksekusi pada sistem rilis data, ditetapkan pembagian peran kerja yang tegas:

## **0.1 Claude (Perumus Arsitektur & Auditor Kualitas)**

* **Kewenangan & Tanggung Jawab:** Menyusun dokumen spesifikasi PRD, merancang skema taksonomi, menganalisis perbandingan data, mengaudit integritas skema manifest serta kemurnian mutu *textbook*, memverifikasi kepatuhan terhadap preseden kasus, serta menyortir keterangan usang.  
* **Batasan Mutlak:** Claude secara teknis dibatasi aksesnya dari sistem penerbitan rilis. Claude **DILARANG KERAS** mempublikasikan aset rilis secara langsung ke tag rilis.

## **0.2 Grok Build / Manus AI / Dirigen (Eksekutor Produksi & Publisher)**

* **Kewenangan & Tanggung Jawab:** Mengeksekusi penyerapan benih data skala masif di lingkungan VM, menjalankan perbaikan teks deterministik (*in-place repair*) dan penyaringan mutu *textbook*, memilah partisi berkas pada batas baris utuh (`\n`), menjalankan kompresi `.jsonl.gz`, menghitung token BPE riil dari berkas fisik, menyusun draf rilis, menandatangani hash SHA-256, dan mengeksekusi publikasi resmi (*Publish Release*) ke sistem rilis data.

## **0.3 Protokol Titik Serah Terima (Handoff Protocol)**

1. Claude merumuskan dokumen PRD dan memverifikasi skema kelayakan data hingga 100% bebas anomali.  
2. Naskah diserahterimakan kepada Grok Build, Manus AI, atau Dirigen.  
3. Eksekutor menjalankan pipeline pengolahan berkas, pengemasan partisi, penandatanganan kriptografis, dan melakukan penerbitan rilis sesuai standar dokumen ini.

---

# **1. PENDAHULUAN & PRINSIP AKUMULASI KORPUS TANPA BATAS**

## **1.1 Tujuan Dokumen**

Dokumen Product Requirements Document (PRD) ini menetapkan standar operasional baku berpresisi tinggi untuk:

1. **Penataan struktur penempatan berkas data pada sistem rilis** ke dalam 3 tingkatan (Data Baru, Penampungan, dan Rak Final K & R).  
2. **Penerapan checklist 'Pagar' untuk data baru**, batasan lisensi yang diperbolehkan, serta standar kualitas mutu *textbook* yang deterministik.  
3. **Prinsip penyelamatan data bersih (*Deterministic In-Place Repair*) dan akumulasi token terbuka tanpa batas atas**, agar data bermutu tidak terbuang sia-sia saat pembersihan dan volume token terus bertambah.  
4. **Standarisasi alur konversi data mentah menjadi token BPE resmi** melalui 12 tahapan berurutan tanpa ambiguitas.  
5. **Penerapan Segel SHA256 Tiga Gerbang Wajib** dengan perintah shell mandiri (*self-contained*) sebagai mekanisme utama pencegahan bentrok dan korupsi data.  
6. **Pencegahan penggunaan skrip penggabungan usang** serta penetapan **Skema Manifest Wajib (`manifest.json`)** yang dihitung murni dari berkas fisik (anti-halusinasi angka).  
7. **Penyelesaian gap tokenizer untuk Korpus R (Bahasa Inggris)** guna mengatasi risiko inflasi token.  
8. **Standarisasi format tata nama aset berkas rilis** K1–K4 dan R1–R4 secara simetris dan teratur.  
9. **Format keterangan resmi (Release Notes)** yang wajib dicantumkan pada setiap tag rilis.  
10. **Strategi pemanfaatan data pada tahap pelatihan (Training Strategy)** dilengkapi formula matematis oversampling dan kurikulum dua tahap.

## **1.2 Prinsip Akumulasi Terbuka, Perbaikan Deterministik, & Anti-Halusinasi**

**KETENTUAN PASTI:**

1. **Bebas Mengumpulkan Token Sebanyak-banyaknya (Tanpa Batas Atas Per Kategori/Rak):**  
   Dokumen ini **DILARANG** membatasi jumlah maksimal token pada kategori mana pun (`K1, K2, K3, K4` maupun `R1, R2, R3, R4`). Setiap rak dan setiap kategori (termasuk `K4/R4` coding, `K1/R1` pengetahuan, `K2/R2` dialog/sains, dan `K3/R3` pelengkap) bebas mengumpulkan token BPE bersih **sebanyak-banyaknya tanpa plafon/batas atas** (baik mencapai puluhan miliar token sekalipun) selama memenuhi standar mutu *textbook*.  
2. **Larangan Keras Halusinasi Teks & Halusinasi Angka Manifest:**  
   * **Larangan Mengarang/Mengubah Isi Teks dengan AI Generatif:** Seluruh proses pembersihan dan perbaikan teks (*in-place repair*) wajib menggunakan **operasi string/regex deterministik**. Eksekutor **DILARANG KERAS** menggunakan LLM untuk menulis ulang (*paraphrase*) atau mengarang dokumen karena dapat memicu halusinasi fakta.  
   * **Larangan Mengarang/Menebak Angka di `manifest.json`:** Setiap angka `documents_count`, `size_bytes`, `tokens_word_count`, `tokens_bpe`, dan `sha256` di dalam `manifest.json` **WAJIB merupakan hasil perhitungan skrip langsung atas berkas fisik `.jsonl.gz` yang sesungguhnya**. Dilarang keras menyalin angka contoh dari dokumen PRD ini, menebak jumlah token dengan pembagian byte kasar, atau memalsukan angka demi memenuhi target tertentu.  
3. **Utamakan Perbaikan Deterministik (*In-Place Repair*), Jangan Buang Dokumen Sehat:**  
   Agar data yang sudah disaring dari ratusan gigabyte arsip mentah tidak terbuang sia-sia:  
   * **Artikel dengan URL atau Ekor Navigasi Berita:** Jangan buang artikelnya. Gunakan regex untuk menghapus baris/prefiks URL (`http://...`, `https://...`) dan kalimat ekor navigasi (*"Baca juga:"*, *"Bagikan:"*, *"Follow..."*, *"Selanjutnya di halaman..."*), lalu simpan isi paragraf utamanya jika panjang bersihnya masih ≥200 karakter.  
   * **Dokumen Naratif Huruf Kecil Semua (*All-Lowercase*):** Jangan buang dokumennya. Jalankan fungsi kapitalisasi awal kalimat deterministik (mengubah huruf pertama di awal dokumen dan huruf pertama setelah tanda `. `, `! `, `? `, atau `\n` menjadi huruf kapital tanpa mengubah kata apa pun).  
   * **Dokumen Bersih yang Salah Kamar Bahasa:** Jika ditemukan dokumen Bahasa Inggris yang bersih (≥200 karakter) di dalam partisi jalur K (seperti pada `K1-part2`), jangan dihapus—pindahkan (*reroute*) baris JSONL tersebut ke berkas calon `R1-pengetahuan` pada jalur Bahasa Inggris (dan sebaliknya).  
   * **Sampah Murni yang Wajib Dibuang:** Hanya dokumen yang murni berisi sampah tanpa nilai pengetahuan yang wajib dihapus, yaitu: spam judi online (`slot gacor`, `togel`, `"B a n d a r | J u d i"`), baris templat rusak hasil gagal baca tabel/OCR yang memuat string `"No nan Tahun"` atau `"Peraturan Menter!"`, banner kebijakan cookie terjemahan mesin rusak, duplikat identik, serta fragmen pendek di bawah batas minimal (<200 karakter untuk K1–K3/R1–R3, <128 karakter untuk K4/R4).

---

# **2. ARSITEKTUR TIGA TINGKAT TAG RILIS (TIERED RELEASE SYSTEM)**

Seluruh data diatur penempatannya melalui 3 tingkatan tag rilis berjenjang:

```
+-------------------------------------------------------------------------------+
|                       TINGKAT 1: DATA BARU (DATA MENTAH)                      |
|  Tag: Data-baru-Indonesian             |  Tag: data-baru-English              |
|  -> Tempat seluruh data mentah yang baru masuk/diunduh ditaruh di sini.       |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Melewati ekstraksi, perbaikan teks & filter pagar)
+-------------------------------------------------------------------------------+
|                     TINGKAT 2: PENAMPUNGAN (CALON KORPUS)                     |
|  Tag: penampungan-Indonesian           |  Tag: penampungan-English            |
|  -> Seluruh data yang telah selesai disaring awal (berstatus Calon Korpus).   |
|  -> Ruang karantina untuk pengujian Quality Control (QC) tahap akhir.         |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Lolos QC mutu textbook & segel manifest BPE)
+-------------------------------------------------------------------------------+
|                 TINGKAT 3: RAK FINAL TEXTBOOK (KORPUS BERSIH SIAP PAKAI)      |
|  Tag: K-dataset-Indonesian             |  Tag: R-dataset-english              |
|  -> Korpus bersih final token BPE      |  -> Korpus bersih final token BPE    |
|     kualitas mutu textbook Indonesia   |     kualitas mutu textbook English   |
|     (K1, K2, K3, K4 disatukan)         |     (R1, R2, R3, R4 disatukan)       |
+-------------------------------------------------------------------------------+
```

## **2.1 Peran dan Batas Tiap Tingkatan**

1. **Tingkat 1 — Data Baru (`Data-baru-Indonesian` & `data-baru-English`):**  
   Pintu gerbang utama penampungan arsip mentah sebelum tersentuh pipeline pengolahan. Skrip pelatihan dilarang keras mengambil data langsung dari tingkat ini.  
2. **Tingkat 2 — Penampungan (`penampungan-Indonesian` & `penampungan-English`):**  
   Ruang karantina dan pengujian untuk berkas yang telah bersih dari tag markup/HTML dan berformat JSONL utuh. Berstatus resmi sebagai *Calon Korpus* yang menunggu audit QC tahap akhir sebelum digabungkan ke rak final.  
3. **Tingkat 3 — Rak Final Mutu Textbook (`K-dataset-Indonesian` & `R-dataset-english`):**  
   Rak rilis produksi akhir yang berisi korpus bersih terverifikasi mutu *textbook* dengan token BPE yang telah dihitung akurat dan terus bertambah seiring masuknya partisi baru dari tingkat penampungan.

## **2.2 Aturan Operasional Aset Rilis & Manajemen Tag**

1. **Aturan Penggabungan dan Pembaruan Aset:**  
   * **Penambahan Volume Data:** Unduh aset/manifest lama, gabung dengan partisi baru yang lolos QC dari `penampungan`, jalankan deduplikasi lintas-partisi, lalu unggah ke tag yang sama.  
   * **Perbaikan Partisi Eksisting:** Jika suatu partisi pada Rak K/R dibersihkan dari residu menggunakan aturan Bab 4.3, kemas ulang partisi yang telah bersih tersebut bersama promosi berkas dari `penampungan`, lalu perbarui `manifest.json` dan `SHA256SUMS` sesuai angka riil hasil pembersihan dan penggabungan.  
2. **Aturan Partisi Berkas XL (>1,5 GB) Berbasis Baris Utuh:**  
   Berkas data berukuran besar wajib dipecah menjadi partisi bernomor (`part1`, `part2`, ...) berukuran **1,35 GB – 1,5 GB** agar selalu berada aman di bawah batas keras 2 GiB, dengan wajib memotong pada **batas baris utuh (`\n` / `split --line-bytes=1450M`)** agar tidak ada baris JSON yang terpotong di tengah jalan.  
3. **Protokol Retire / Hapus Tag Rilis Lama (Anti-Tag Menganggur):**  
   Tag rilis lama yang seluruh isinya telah diserap ke dalam rilis baru WAJIB dihapus rilisnya (*retire release*), tidak boleh dibiarkan menganggur. Seluruh rilis aktif di GitHub Releases harus dapat dipetakan 1:1 dengan 6 nama tag resmi (menggunakan tanda hubung tanpa spasi).

---

# **3. PRESEDEN NYATA & SEJARAH ANOMALI SISTEM (LESSONS LEARNED)**

Setiap aturan dan protokol ketat dalam PRD ini disusun berdasarkan insiden teknis nyata yang pernah terjadi pada proses rilis sebelumnya:

1. **Insiden JDIH (Pemisahan Kamar Domain Mutlak):**  
   Berkas pindaian dari JDIH (Jaringan Dokumentasi dan Informasi Hukum) hampir salah diklasifikasikan sebagai kandidat K4 koding. Kategori K4 dikunci mutlak hanya untuk domain ilmu komputer, algoritma, dan rekayasa perangkat lunak. Teks hukum, regulasi, dan kedinasan dikunci masuk ke domain dialog/formal (K2/K3).  
2. **Insiden K3 94% en-simple (Keputusan-014):**  
   Partisi K3 sempat terinfiltrasi teks bahasa Inggris sederhana (*en-simple*) hingga mencapai 94% dari volume berkas, yang hampir mencemari kemurnian korpus nasional. Diterapkan ambang batas deteksi bahasa otomatis minimal 95% Bahasa Indonesia untuk setiap berkas partisi jalur K. Seluruh materi berbahasa Inggris yang bersih dipindahkan secara struktural ke jalur Rak R.  
3. **Insiden MADLAD-400 (Pensiun 8,1 Miliar Kata Akibat Sampah Web):**  
   Sekitar 8,1 miliar kata dari dump korpus web publik MADLAD-400 terpaksa dipensiunkan (*retired*) secara massal karena audit pasca-unduh menemukan keberadaan spam SEO, teks mesin rusak, dan duplikasi tak terkendali. Seluruh data mentah wajib melewati gerbang pembersihan boilerplate dan deduplikasi MinHash LSH sebelum diizinkan masuk ke tahap penampungan calon korpus.  
4. **Bug Dual-Field Manifest (Insiden 2026-09-09):**  
   Terjadi tabrakan skema metadata di mana berkas manifest memuat dua field token yang saling tumpang tindih dan dihitung dengan rumus berbeda, menyebabkan skrip dataloader training gagal membaca total token secara akurat. Skema manifest dibakukan secara tunggal (Bab 7) dan skrip penggabungan manifest lama dilarang keras untuk digunakan kembali.  
5. **Temuan Audit Korpus K (Penyempurnaan Standar Mutu Textbook Oktober 2026):**  
   Audit isi partisi menemukan bahwa pemotongan menggunakan `split --bytes` memutus 1–2 baris JSON di ujung berkas, serta masih adanya URL inline dan ekor berita di `K3-part1`, teks huruf kecil semua (*all-lowercase*) di `K3-part3..5`, spam judi yang disamarkan dengan spasi (`"B a n d a r | J u d i"`), dan cetakan templat cacat OCR (`"Pasal ... Menter! ... No nan Tahun"`) di `K3-part2/6/7`. Seluruh celah tersebut kini ditutup secara deterministik pada Bab 4 dan Bab 5.

---

# **4. CHECKLIST 'PAGAR' DATA BARU, ATURAN LISENSI, & STANDAR MUTU TEXTBOOK**

## **4.1 Lima Gerbang Checklist 'Pagar'**

Sebelum data baru diizinkan masuk ke pipeline pengolahan tingkat lanjut, data wajib melewati 5 gerbang audit pada checklist 'Pagar':

1. **Pagar 1 — Pagar Lisensi (License Gate):**  
   Verifikasi bahwa sumber data memiliki lisensi terbuka yang sah dan kompatibel dengan rilis model Rategoan.  
2. **Pagar 2 — Pagar Provenance / Asal-Usul (Provenance Gate):**  
   Mencatat riwayat asal data secara presisi (URL asal, waktu pengambilan, metode scraping/dumping, dan hash arsip mentah).  
3. **Pagar 3 — Pagar Isolasi Sistem (Storage Isolation Gate):**  
   Berkas data skala besar (gigabyte) dilarang keras di-commit ke branch kode sistem; seluruh data wajib diunggah ke sistem rilis data.  
4. **Pagar 4 — Pagar Format & Integritas (Format Integrity Gate):**  
   Memastikan arsip mentah tidak rusak (bebas error CRC) dan dapat diekstrak secara konsisten dengan setiap baris JSONL utuh tanpa pemotongan baris.  
5. **Pagar 5 — Pagar Sanitasi Awal (Initial Hygiene Gate):**  
   Memastikan teks dapat didekodekan ke UTF-8 murni tanpa karakter pengganti rusak (`\ufffd`).

## **4.2 Ketentuan Lisensi Data (Allowed vs Prohibited Licenses)**

* **Lisensi yang DIPERBOLEHKAN (Greenlist):**  
  * Public Domain / CC0: Lisensi bebas tanpa batasan hak cipta.  
  * Creative Commons Permisif: CC-BY (Attribution), CC-BY-SA (ShareAlike).  
  * Lisensi Software Permisif: MIT, Apache 2.0, BSD (2-Clause / 3-Clause).  
  * Open Data Licenses: Open Data Commons Attribution (ODC-By), PDDL, CDLA-Permissive.  
* **Lisensi yang DILARANG KERAS (Blacklist):**  
  * **Lisensi Non-Komersial (NC):** Seperti CC-BY-NC, CC-BY-NC-SA, CC-BY-NC-ND (karena membatasi hak pakai dan rilis terbuka model).  
  * **Hak Cipta Tertutup Tanpa Izin:** Buku komersial berbayar bajakan, makalah ilmiah berbayar (*paywalled*) tanpa hak lisensi terbuka.  
  * **Lisensi dengan Klausul Anti-AI:** Konten dari platform web yang melarang penggunaan data untuk pelatihan AI (*AI training scraping prohibition*).

## **4.3 Matriks Larangan Konten & Aturan Perbaikan Deterministik (Data Hygiene & Textbook Gate)**

Seluruh berkas calon korpus dan rak final wajib memenuhi 6 aturan deterministik berikut (tanpa menggunakan LLM generatif yang dapat memicu halusinasi):

1. **PII (Personally Identifiable Information):**  
   Hapus atau lakukan redaksi (`[REDACTED]`) pada NIK/KTP, nomor paspor, nomor telepon pribadi, alamat email personal non-publik (termasuk header email penulis pada log commit di K4 tanpa membuang kode utamanya), password, private key/kredensial API, dan riwayat medis personal yang tidak teranonimkan.  
2. **Konten Toksik, Ilegal, & Spam Judi (Anti-Obfuscation):**  
   Buang dokumen yang memuat ujaran kebencian ekstrem, materi eksploitasi, instruksi pembuatan senjata/bahan peledak, serta promosi perjudian online (slot gacor, togel, kasino, judi bola, poker/QQ, RTP live). Sebelum pencocokan kata kunci spam judi, teks wajib dinormalisasi secara sementara dengan menghapus spasi tunggal berulang dan tanda pemisah (`|`, `-`, `_`, `.`) agar pola samaran seperti `"B a n d a r | J u d i | Q Q"` terdeteksi 100% dan dokumennya dibuang.  
3. **Kontaminasi Tolok Ukur (Benchmark Contamination):**  
   Lakukan dekontaminasi berbasis n-gram (13-gram) dan MinHash terhadap set evaluasi standar (HumanEval, MBPP, GSM8k, MMLU, ARC, IndoMMLU) agar evaluasi model bebas kebocoran data (*data leakage*).  
4. **Sampah Web, URL Inline, & Ekor Navigasi Berita (Kupas Sampahnya, Simpan Artikelnya):**  
   * Buang dokumen yang isinya didominasi pemberitahuan cookie (*cookie consent banners*, termasuk terjemahan mesin rusak yang menerjemahkan *cookie* menjadi *"kue"*), menu navigasi header/footer, atau pesan Error 404/500.  
   * Untuk artikel berita/pengetahuan yang memuat baris atau prefiks URL (`http://...`, `https://...`) atau kalimat ekor navigasi portal (*"Baca juga:"*, *"Selanjutnya di halaman..."*, *"Bagikan:"*, *"Follow..."*, *"Simak selengkapnya"*), **hapus bagian URL dan kalimat ekor tersebut dengan regex**, lalu **simpan isi artikel utamanya** apabila panjang bersihnya masih ≥200 karakter.  
5. **Larangan Templat Sintetis Cacat OCR (`"No nan Tahun"`, `"Menter!"`):**  
   Buang seluruh baris dokumen hasil cetakan templat otomatis yang mengandung string gagal baca tabel/OCR seperti `"No nan Tahun"`, `"Peraturan Menter!"`, `NaN`, atau `undefined`.  
6. **Kapitalisasi Kalimat Deterministik (*Rule-Based Truecasing*) & Panjang Minimal:**  
   * Karena tokenizer Rategoan bersifat *byte-level BPE cased* (peka huruf besar/kecil), dokumen naratif (K1–K3 / R1–R3) yang seluruh hurufnya kecil (*100% lowercase*) wajib diperbaiki secara deterministik dengan mengubah huruf alfabet pertama di awal dokumen serta huruf alfabet pertama setelah tanda akhir kalimat (`. `, `! `, `? `, `\n`) menjadi huruf kapital (*tanpa* mengubah kata apa pun).  
   * Setelah pembersihan, setiap dokumen pada `K1, K2, K3` (dan `R1, R2, R3`) wajib memiliki panjang minimal **200 karakter bersih**, sedangkan pada `K4` (dan `R4` coding) wajib minimal **128 karakter bersih** berisi kode atau dokumentasi teknis (pesan commit satu baris tanpa kode dibuang).

---

# **5. ALUR KHUSUS LENGKAP: RAW -> TOKEN BPE (12 TAHAPAN WAJIB)**

Urutan ini adalah rumus baku operasional yang wajib dipatuhi secara berurutan, tidak boleh dibalik atau dilewati, guna menjamin konversi data mentah menjadi token BPE resmi Rategoan secara konsisten:

```
[1. RAW] ──> [2. EXTRACT+CLEAN+REPAIR] ──> [3. DEDUPE] ──> [4. FILTER & REROUTE BAHASA] ──> [5. TOKENIZE BPE]
                                                                                                    │
                                                                                                    ▼
[10. GABUNG KANONIK] <── [9. PUBLISH] <── [8. MANIFEST] <── [7. KOMPRESI .jsonl.gz] <── [6. LINE-SAFE CHUNK]
        │
        ▼
[11. RE-AUDIT] ──> [12. SINKRONISASI REPO]
```

## **Rincian 12 Tahapan Operasional**

1. **Tahap 1 — RAW (Penerimaan Data Mentah):**  
   Data mentah yang baru diunduh ditaruh pada tag rilis Data Baru (`Data-baru-Indonesian` atau `data-baru-English`).  
2. **Tahap 2 — EXTRACT + CLEAN + IN-PLACE REPAIR (Ekstraksi, Perbaikan Deterministik, & Pembersihan):**  
   Mengekstrak teks murni, membuang tag HTML/XML/Markdown kotor, menormalisasi unicode (NFC), menerapkan 6 aturan Bab 4.3 (mengupas URL inline & ekor berita, kapitalisasi awal kalimat deterministik pada teks *all-lowercase*, membuang spam judi & templat `"No nan Tahun"`, serta menyaring panjang minimal ≥200 karakter untuk K1–K3 / ≥128 karakter untuk K4), lalu mengonversi ke JSONL utuh (1 baris fisik per dokumen: `{"text": "..."}`).  
3. **Tahap 3 — DEDUPE (Deduplikasi Eksak + MinHash LSH):**  
   Menjalankan pembersihan duplikasi dokumen menggunakan hash eksak SHA-256 (atas teks yang dinormalisasi huruf kecil dan spasi tunggal) dilanjutkan MinHash LSH (ambang kesamaan 0.85) untuk mengeliminasi salinan teks yang identik atau berulang.  
4. **Tahap 4 — FILTER & REROUTE BAHASA (Penyaringan Bahasa Tanpa Buang Sia-Sia):**  
   Memvalidasi rasio bahasa menggunakan fastText/langdetect pada setiap berkas partisi: minimal 95% Bahasa Indonesia untuk setiap berkas di jalur K, dan minimal 95% Bahasa Inggris untuk setiap berkas di jalur R. Dokumen Bahasa Inggris bersih (≥200 karakter) yang tersaring dari jalur K wajib langsung dipindahkan (*reroute*) ke antrean `R1-pengetahuan` di jalur R (dan sebaliknya) agar tidak ada data bermutu yang terbuang.  
5. **Tahap 5 — TOKENIZE BPE (Perhitungan Token BPE Riil):**  
   Teks ditokenisasi menggunakan tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js` atau tabel BPE kanonik `rategoan-bpe`). Jumlah token kata riil (`tokens_word_count`, dipisah spasi) dan jumlah token BPE (`tokens_bpe`) wajib dihitung langsung dari isi teks setiap dokumen untuk seluruh kategori (`K1, K2, K3, K4` dan `R1, R2, R3, R4`), serta mencatat ukuran kosakata tokenizer yang digunakan secara jujur pada field `tokenizer.vocab_size` di `manifest.json`.  
6. **Tahap 6 — CHUNK & PEMOTONGAN AMAN BARIS (Line-Safe Partitioning):**  
   Memotong dan mengelompokkan teks ke batas konteks terstruktur tanpa memotong kalimat di tengah jalan. Pemecahan berkas `.jsonl` besar menjadi beberapa partisi wajib dilakukan pada **batas baris utuh (`\n`)** menggunakan `split --line-bytes=1450M` atau pembaca baris JSONL. **Dilarang keras** menggunakan `split --bytes` (`split -b`) karena memutus baris JSON di tengah objek.  
7. **Tahap 7 — KOMPRESI (Pengemasan Aset Rilis `.jsonl.gz`):**  
   Mengompresi berkas ke format baku **`.jsonl.gz`** (penggunaan ekstensi `.gzip` dilarang). Setiap berkas partisi terkompresi dibatasi berukuran **maksimal 1,35 GB – 1,5 GB** agar selalu aman di bawah batas rilis 2 GiB.  
8. **Tahap 8 — TULIS MANIFEST (Penyusunan Manifest Riil per Berkas & Kategori):**  
   Menghitung dan mencatat secara eksak `documents_count`, `tokens_bpe`, `tokens_word_count`, `size_bytes`, dan `sha256` dari **setiap partisi berkas (`files[]`)**, lalu menjumlahkannya secara matematis ke dalam blok `categories` (`K1–K4` / `R1–R4`) dan `summary`.  
9. **Tahap 9 — PUBLISH (Rilis Penampungan / Draft Stage):**  
   Berkas yang telah lolos Tahap 1–8 ditempatkan pada tag `penampungan-Indonesian` atau `penampungan-English` (atau rilis draf) untuk verifikasi akhir sebelum digabungkan ke rak kanonik utama.  
10. **Tahap 10 — GABUNG KE KANONIK (Integrasi Otomatis & Verifikasi Skema):**  
    Penggabungan partisi baru ke rak rilis kanonik utama (`K-dataset-Indonesian` dan `R-dataset-english`) wajib memverifikasi kecocokan hash SHA-256, memastikan tidak ada nama berkas partisi yang bertabrakan (*anti-collision*), dan menjamin nilai `summary` sama persis dengan penjumlahan seluruh elemen `files[]`.  
11. **Tahap 11 — RE-AUDIT (Audit Akhir Sebelum Publikasi):**  
    Menjalankan verifikasi mandiri (lihat perintah shell pada Bab 6.2 dan 6.3) untuk mengonfirmasi bahwa seluruh berkas partisi memiliki 0 baris JSON terpotong, lulus standar mutu *textbook*, dan segel checksum `SHA256SUMS` 100% cocok dengan `manifest.json`.  
12. **Tahap 12 — SINKRONISASI REPOSITORI & LINGKUNGAN TRAINING:**  
    Setiap kali rilis diperbarui, lokasi sinkronisasi diatur sebagai berikut:  
    * **1. Berkas Wajib yang Di-commit ke Git Repo:**  
      * `docs/STATUS-KORPUS-LISENSI.md`: Wajib diperbarui sesuai angka riil terbaru di `manifest.json`.  
      * `README.md`: Wajib diperbarui angka ringkasan total akumulasi token korpus.  
    * **2. Berkas Aset di GitHub Releases (Bukan di Git tree):**  
      * `manifest.json` dan `SHA256SUMS`: Diunggah langsung ke GitHub Releases sebagai aset pendamping berkas korpus.  
    * **3. Parameter di Lingkungan Training:**  
      * Nilai total token BPE baru diumpankan ke parameter training / DataLoader untuk penyesuaian scheduler learning rate (*cosine decay*).

---

# **6. SEGEL SHA256 — TIGA GERBANG WAJIB (PERINTAH SHELL MANDIRI & BEBAS DEPENDENSI EKSTERNAL)**

Untuk menjamin integritas data dan mencegah error akibat skrip eksternal yang tidak ditemukan di VM, ketiga gerbang verifikasi di bawah ini menggunakan perintah standar Linux dan Python 3 bawaan (*self-contained*):

## **6.1 Gerbang 1 — Segel Sumber (Source Ingestion Hash)**

Setiap berkas data mentah yang diekstrak langsung dicatat hash SHA-256 aslinya:

```sh
# Perintah Gerbang 1: Pembuatan segel hash data mentah
sha256sum raw_source_part*.tar.gz > source_raw.sha256
```

## **6.2 Gerbang 2 — Segel Partisi Rilis & Verifikasi 0 Baris JSON Terpotong**

Setiap partisi berkas rilis `.jsonl.gz` wajib diverifikasi bahwa seluruh barisnya adalah JSON valid yang memiliki field `"text"` tidak kosong, lalu dihitung hash fisiknya ke dalam `SHA256SUMS`:

```sh
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

## **6.3 Gerbang 3 — Verifikasi Konsistensi Matematis `manifest.json` vs `SHA256SUMS`**

Sebelum `manifest.json` diunggah ke rilis kanonik, jalankan verifikasi satu baris berikut untuk memastikan tidak ada angka halusinasi, tidak ada nama berkas ganda, dan jumlah token di `summary` serta `categories` sama persis dengan penjumlahan `files[]`:

```sh
# Perintah Gerbang 3: Validasi konsistensi matematis manifest.json & SHA256SUMS
python3 -c '
import json

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
    assert sums.get(fn) == f["sha256"], f"Hash SHA256 tidak cocok untuk {fn}"
    assert f["documents_count"] > 0 and f["tokens_bpe"] > 0, f"Metrik 0 pada {fn}"

for cat, info in m["categories"].items():
    cat_files = [f for f in files if f["category"] == cat]
    assert info["partitions"] == len(cat_files), f"Jumlah partisi {cat} tidak cocok"
    assert info["documents_count"] == sum(f["documents_count"] for f in cat_files), f"Jumlah dokumen {cat} tidak cocok"
    assert info["tokens_bpe"] == sum(f["tokens_bpe"] for f in cat_files), f"Jumlah BPE {cat} tidak cocok"

s = m["summary"]
assert s["total_partitions"] == len(files), "total_partitions tidak cocok"
assert s["total_documents"] == sum(f["documents_count"] for f in files), "total_documents tidak cocok"
assert s["total_tokens_bpe"] == sum(f["tokens_bpe"] for f in files), "total_tokens_bpe tidak cocok"
assert s["total_tokens_word_count"] == sum(f["tokens_word_count"] for f in files), "total_tokens_word_count tidak cocok"
assert s["total_compressed_bytes"] == sum(f["size_bytes"] for f in files), "total_compressed_bytes tidak cocok"
print("MANIFEST & SHA256SUMS 100% VALID DAN KONSISTEN SECARA MATEMATIS!")
'
```

---

# **7. PERINGATAN BAHAYA SKRIP USANG & SKEMA MANIFEST WAJIB**

## **7.1 Peringatan Kritis: Deprecating `merge-korpus-manifest.py`**

**PERINGATAN MERAH (CRITICAL SYSTEM WARNING):**  
Skrip lama bernama `merge-korpus-manifest.py` dinyatakan **USANG, CACAT SKEMA, DAN DILARANG KERAS UNTUK DIGUNAKAN.**  
Menjalankan skrip lama tersebut akan menimpa berkas manifest modern dengan skema lama yang menghilangkan rincian `tokens_bpe` dan `documents_count` per berkas di dalam `files[]`, serta memicu kembali *Bug Dual-Field Token* (Insiden 2026-09-09). Seluruh penyusunan dan penggabungan `manifest.json` wajib lulus skrip validasi matematis pada **Bab 6.3**.

## **7.2 Skema Manifest Baku (`manifest.json`)**

Setiap paket rilis pada rak final wajib menyertakan berkas `manifest.json` dengan struktur di bawah ini.  
*(Catatan Anti-Halusinasi: Angka pada blok JSON di bawah ini hanyalah ilustrasi yang konsisten secara matematis untuk 4 contoh berkas. Pada rilis nyata, eksekutor WAJIB mengisi seluruh angka berdasarkan hasil perhitungan riil atas seluruh berkas `.jsonl.gz` yang ada di rilis tersebut, dan dilarang keras menyalin angka ilustrasi ini).*

```json
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

---

# **8. STRATEGI TOKENIZER RAK R (PENYELESAIAN GAP TOKENIZER GLOBAL)**

## **8.1 Analisis Masalah: Karakteristik Tokenizer BPE terhadap Teks Inggris**

* **Kondisi Eksisting:** Tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js`, kapasitas runtime 32.000 token *byte-level BPE cased* dengan fondasi kosakata 30.368 token Bahasa Indonesia) dioptimalkan untuk morfologi Bahasa Indonesia.  
* **Tantangan Teknis:** Jika teks bahasa Inggris teknis, medis, dan koding pada Rak R (PubMed, peS2o, StackExchange) ditokenisasi secara mentah menggunakan kosakata yang didominasi Bahasa Indonesia, dapat terjadi fenomena **Token Fragmentation & Inflation** (~1,8x hingga 2,2x lebih banyak token dibanding tokenizer standar internasional). Hal ini perlu diperhitungkan agar jendela konteks (*context window*) dan throughput pelatihan tetap efisien.

## **8.2 Solusi Strategi Tokenizer Dua Arah**

1. **Solusi Fase A (Transisi / Jangka Pendek — Inflation-Budgeting):**  
   Tetap menggunakan Tokenizer BPE resmi Rategoan saat ini demi menjaga konsistensi arsitektur embedding model, namun pada pelaporan manifest dan budgeting batch training diterapkan faktor normalisasi inflasi token (*token inflation factor*) sehingga perbandingan volume informasi teks Inggris tetap akurat.  
2. **Solusi Fase B (Arsitektur Matang / Jangka Panjang — Unified Bilingual Tokenizer 64k):**  
   Melakukan ekspansi kosakata terencana menjadi 64.000 token (menambahkan token BPE yang diserap dari korpus Rak R dan sintaksis bahasa pemrograman dunia). Solusi ini menghasilkan efisiensi kompresi tinggi yang seimbang antara Bahasa Indonesia dan Bahasa Inggris tanpa merusak token bahasa Indonesia yang sudah ada.

---

# **9. STANDARISASI NAMA TAG DAN NAMA ASET FILE**

Seluruh nama tag Git di GitHub Releases wajib menggunakan tanda hubung (`-`) tanpa spasi, dan seluruh aset berkas partisi menggunakan ekstensi seragam **`.jsonl.gz`**:

## **9.1 Poros Bahasa Indonesia (Tag: `K-dataset-Indonesian`)**

Menyatukan seluruh aset K1, K2, K3, dan K4 ke dalam satu tag rilis terpadu berstandar mutu *textbook* (bebas bertambah tanpa batas jumlah partisi seiring masuknya data bersih baru).  
Format nama aset berkas:

* `K1-pengetahuan-part1.jsonl.gz` (dan seterusnya...)  
* `K2-dialog-part1.jsonl.gz` (dan seterusnya...)  
* `K3-pelengkap-part1.jsonl.gz` (dan seterusnya — wajib `.jsonl.gz`, bukan `.gzip`)  
* `K4-coding-part1.jsonl.gz` (dan seterusnya...)

## **9.2 Poros Bahasa Inggris (Tag: `R-dataset-english`)**

Format nama aset berkas:

* `R1-pengetahuan-part1.jsonl.gz` (dan seterusnya...)  
* `R2-dialog-part1.jsonl.gz` (dan seterusnya...)  
* `R3-pelengkap-part1.jsonl.gz` (dan seterusnya...)  
* `R4-coding-part1.jsonl.gz` (dan seterusnya...)

## **9.3 Tingkat Penampungan (Tag: `penampungan-Indonesian` & `penampungan-English`)**

* Menampung seluruh berkas calon korpus hasil saringan awal (`K1-calon-pengetahuan-part1.jsonl.gz`, `R1-calon-pengetahuan-part1.jsonl.gz`, dst.).  
* Menunggu QC tahap akhir sebelum dipromosikan dan digabungkan ke rak final K atau R.

## **9.4 Tingkat Data Baru (Tag: `Data-baru-Indonesian` & `data-baru-English`)**

* Menampung seluruh data mentah yang baru masuk ke sistem rilis data.

---

# **10. STRATEGI PELATIHAN DUAL-KORPUS DENGAN FORMULA MATEMATIS**

## **10.1 Filosofi Dual-Engine**

* **Korpus K (Identity Engine):** Menjamin keluwesan alami, kepatuhan tata bahasa (PUEBI/KBBI), pemahaman konteks sosial-budaya Indonesia, sastra, hukum, dan regulasi nasional.  
* **Korpus R (Reasoning Engine):** Menjadi motor nalar logika, pemecahan masalah algoritma/coding, serta wawasan sains dan riset medis global.

## **10.2 Proporsi Sampling DataLoader Saat Pelatihan (Bukan Pembatas Penyimpanan Rak)**

Proporsi di bawah ini hanya mengatur **rasio penarikan batch (sampling weight) oleh DataLoader saat proses training berjalan**, dan **sama sekali tidak membatasi jumlah token yang boleh disimpan di masing-masing rak K1–K4 maupun R1–R4**:

* **Korpus K (Bahasa Indonesia) — 55% hingga 60% dari batch latihan:**  
  * K1 (Pengetahuan): 20%  
  * K2 (Dialog): 15%  
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

---

# **11. STANDAR KETERANGAN RESMI SETIAP TAG (RELEASE NOTES)**

Keterangan berikut wajib dipasang pada deskripsi rilis masing-masing tag:

## **A. Keterangan pada Tag: `K-dataset-Indonesian`**

**K-dataset-Indonesian**

Tag rilis final untuk korpus bersih mutu *textbook* Bahasa Indonesia (token BPE).  
Menyatukan seluruh aset korpus bersih ke dalam satu rak rilis terpadu yang terus bertambah seiring promosi calon korpus baru:  
- `K1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan K1  
- `K2-dialog-part*.jsonl.gz` : Aset dialog K2  
- `K3-pelengkap-part*.jsonl.gz` : Aset pelengkap K3  
- `K4-coding-part*.jsonl.gz` : Aset coding K4  

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.

## **B. Keterangan pada Tag: `R-dataset-english`**

**R-dataset-english**

Tag rilis final untuk korpus bersih mutu *textbook* Bahasa Inggris (token BPE).  
Kategori aset dibuat simetris dengan K untuk materi berbahasa Inggris:  
- `R1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan R1  
- `R2-dialog-part*.jsonl.gz` : Aset dialog R2  
- `R3-pelengkap-part*.jsonl.gz` : Aset pelengkap R3  
- `R4-coding-part*.jsonl.gz` : Aset coding R4  

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.

## **C. Keterangan pada Tag: `penampungan-Indonesian` & `penampungan-English`**

**Penampungan (Calon Korpus)**

Berisi seluruh data yang sudah melewati proses penyaringan awal dan telah menjadi calon korpus.  
Data di tag ini disiapkan untuk menjalani Quality Control (QC) tahap akhir sebelum dimasukkan ke rak final `K-dataset-Indonesian` / `R-dataset-english`.

## **D. Keterangan pada Tag: `Data-baru-Indonesian` & `data-baru-English`**

**Data Baru (Data Mentah)**

Tempat penampungan seluruh data mentah yang baru masuk sebelum masuk ke tahapan pemrosesan dan penyaringan.

---

# **12. KESIMPULAN & INTEGRITAS SISTEM**

Melalui standar **PRD RELEASE** yang telah disempurnakan ini:

1. **Disiplin Pembagian Peran:** Claude bertanggung jawab atas arsitektur dan audit, sedangkan Grok, Manus AI, dan Dirigen memegang otoritas penuh eksekusi penerbitan rilis.  
2. **Akumulasi Terbuka Tanpa Batas Atas:** Tidak ada pembatasan kuota maksimal pada kamar K1–K4 maupun R1–R4; seluruh kategori bebas mengumpulkan token *textbook* sebanyak-banyaknya dengan mengutamakan perbaikan deterministik (*in-place repair*) agar data sehat tidak terbuang sia-sia.  
3. **Bebas Halusinasi & Bebas Ambiguitas:** Seluruh aturan pembersihan menggunakan logika regex/string deterministik (bukan parafrasa LLM), dan seluruh angka di `manifest.json` wajib diverifikasi dengan skrip mandiri Bab 6.3 terhadap berkas fisik `.jsonl.gz`.  
4. **Penyelesaian Gap Tokenizer:** Strategi dua tahap disiapkan untuk mengatasi inflasi token bahasa Inggris pada Rak R.  
5. **Verifikasi Kriptografis Mutlak:** Segel SHA-256 Tiga Gerbang menjamin tidak ada tabrakan berkas partisi maupun korupsi manifest kanonik.

---

# **13. MANDAT KHUSUS EKSEKUTOR: PERCEPATAN PENYARINGAN, PERBAIKAN DETERMINISTIK, & PROMOSI PENAMPUNGAN (PRIORITAS P0)**

## **13.1 Latar Belakang & Prinsip Eksekusi**

Agar persiapan data berjalan cepat, tidak membuang data sehat secara sia-sia, dan bebas dari halusinasi, eksekutor wajib menjalankan alur penyaringan `Data-baru` → `penampungan` → `Rak Final` secara terus-menerus dengan aturan deterministik di bawah ini.

## **13.2 Instruksi Operasional P0 bagi Eksekutor (Grok Build / Manus AI / Dirigen)**

1. **Kuras Habis `Data-baru` dan Promosikan `penampungan` Secara Berkelanjutan:**  
   Seluruh berkas mentah di `Data-baru-Indonesian` dan `data-baru-English` wajib segera diproses melalui Tahap 2–8 dan dialirkan ke `penampungan-Indonesian` dan `penampungan-English`. Berkas calon korpus yang sudah siap di `penampungan-Indonesian` (`K1-calon` s/d `K4-calon`) dan `penampungan-English` (`R1-calon` s/d `R4-calon`) wajib segera diverifikasi dengan Gerbang 2 & Gerbang 3 (Bab 6.2 & 6.3) lalu digabungkan ke `K-dataset-Indonesian` serta `R-dataset-english`.  
2. **Bersihkan Residu di Rak K Secara Deterministik Tanpa Membuang Dokumen Sehat:**  
   * **Kupas URL & Ekor Berita (`K3-part1`):** Hapus hanya baris/prefiks URL (`http://...`, `https://...`) dan kalimat ekor navigasi (*"Baca juga"*, *"Bagikan"*, *"Follow"*), lalu simpan isi berita utamanya yang masih ≥200 karakter.  
   * **Pulihkan Kapitalisasi Kalimat Secara Deterministik (`K3-part3, 4, 5`):** Jalankan kapitalisasi huruf pertama awal dokumen dan setelah tanda `. `, `! `, `? `, `\n` pada dokumen *all-lowercase* (tanpa mengubah kata), serta buang dokumen spam judi (`"B a n d a r | J u d i"`).  
   * **Buang Baris Templat Cacat OCR & Gabungkan Pasokan Penampungan (`K3-part2, 6, 7`):** Hapus baris templat gagal baca yang memuat string `"No nan Tahun"` atau `"Peraturan Menter!"`, pertahankan seluruh dokumen naratif/hukum yang sehat di dalamnya, dan gabungkan bersama berkas baru dari `penampungan-Indonesian`.  
   * **Reroute Dokumen Bahasa Inggris (`K1-part2`):** Pindahkan dokumen berbahasa Inggris bersih (≥200 karakter) yang tersaring dari `K1-part2` langsung ke `R1-pengetahuan` di Rak R agar tidak ada token bersih yang terbuang.  
   * **Hitung Penuh Token Riil `K4` & Potong pada Batas Baris (`\n`):** Redaksi email pada header commit `K4-coding-part1`, buang duplikat identik dan pesan commit satu baris (<128 karakter), hitung token BPE riil K4 ke dalam `manifest.json`, seragamkan seluruh ekstensi berkas menjadi `.jsonl.gz`, dan potong partisi menggunakan `split --line-bytes=1450M` sehingga 0 baris JSON terpotong.  
3. **Kejujuran Mutlak Pelaporan Manifest (Anti-Halusinasi Angka):**  
   Setiap selesai memperbarui atau menggabungkan partisi ke Rak K maupun Rak R, eksekutor wajib menjalankan skrip validasi Bab 6.3 dan mencatat angka riil hasil perhitungan berkas fisik tersebut ke dalam `manifest.json` serta `docs/STATUS-KORPUS-LISENSI.md`.