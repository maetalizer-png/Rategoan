# **PRD RELEASE**

**Spesifikasi Standar Rilis Korpus Data Mutu Textbook, Tata Kelola Rak, Tata Nama Aset, Protokol Integritas, dan Strategi Pelatihan**

*Status: Standar Operasional Baku Sistem Rilis Data Rategoan (100% Deterministik, Satu Sumber Aturan Kanonik, Bebas Ambiguitas, & Anti-Halusinasi)*

*Berlaku Per: Oktober 2026*

# **0. PEMBAGIAN PERAN KERJA, SUMBER KEBENARAN TUNGGAL, & TITIK SERAH TERIMA**

Untuk memastikan disiplin operasional dan mencegah perbedaan tafsir antar-AI maupun tabrakan eksekusi pada sistem rilis data, ditetapkan aturan sumber kebenaran tunggal dan pembagian peran kerja yang tegas:

## **0.1 Sumber Kebenaran Tunggal (Single Source of Truth)**

* Naskah **PRD RELEASE** di Google Drive (`PRD RELEASE`) dan salinan identiknya di repositori Git (`docs/PRD-RELEASE.md`) adalah **satu-satunya spesifikasi hukum operasional yang berlaku**. Dokumen `docs/STATUS-KORPUS-LISENSI.md` hanya berfungsi mencatat laporan posisi saldo berkas terbaru dan wajib selalu tunduk pada aturan di dokumen ini.

* **Prinsip Satu Definisi Kanonik (Anti-Pengulangan Berbeda Kalimat):** Agar tidak ada aturan yang ditafsirkan ganda akibat perbedaan kalimat antar-bab, setiap aturan teknis hanya didefinisikan secara lengkap pada satu bab kanonik:

  * Kriteria pemetaan 4 kamar (`K1–K4` dan `R1–R4`) didefinisikan secara kanonik di **Bab 2.2**.

  * Aturan pembersihan teks, perbaikan deterministik (*in-place repair*), redaksi PII, spam judi, cacat OCR, kapitalisasi kalimat, dan batas panjang minimal didefinisikan secara kanonik di **Bab 4.3**.

  * Parameter deduplikasi (Tahap 3), penyaringan & *reroute* bahasa (Tahap 4), tokenisasi BPE (Tahap 5), ukuran pemotongan baris `split` (Tahap 6), batas ukuran `.jsonl.gz` (Tahap 7), serta urutan penerbitan rilis (Tahap 9–12) didefinisikan secara kanonik di **Bab 5**.

  * Perintah verifikasi fisik dan kriptografis didefinisikan secara kanonik di **Bab 6**.

Bab-bab lain wajib merujuk langsung ke bab kanonik tersebut tanpa mengubah atau mempersempit definisinya.

## **0.2 Claude (Perumus Arsitektur & Auditor Kualitas)**

* **Kewenangan & Tanggung Jawab:** Menyusun dokumen spesifikasi PRD, merancang skema taksonomi, menganalisis perbandingan data, mengaudit integritas skema manifest serta kemurnian mutu *textbook*, memverifikasi kepatuhan terhadap preseden kasus, serta menyortir keterangan usang.

* **Batasan Mutlak:** Claude secara teknis dibatasi aksesnya dari sistem penerbitan rilis. Claude **DILARANG KERAS** mempublikasikan aset rilis secara langsung ke tag rilis.

## **0.3 Grok Build / Manus AI / Dirigen (Eksekutor Produksi & Publisher)**

* **Kewenangan & Tanggung Jawab:** Mengeksekusi penyerapan benih data skala masif di lingkungan VM, menjalankan perbaikan teks deterministik (*in-place repair*) dan penyaringan mutu *textbook* sesuai **Bab 4.3**, memilah partisi berkas dan mengompresinya sesuai **Bab 5**, menghitung token BPE riil dari berkas fisik, memverifikasi segel SHA-256 dan fisik berkas di lokal VM sesuai **Bab 6**, serta mengeksekusi publikasi resmi (*Publish Release*) ke 6 tag rilis korpus resmi.

## **0.4 Protokol Titik Serah Terima (Handoff Protocol)**

1. Claude merumuskan dokumen PRD dan memverifikasi skema kelayakan data hingga 100% bebas anomali.

2. Naskah diserahterimakan kepada Grok Build, Manus AI, atau Dirigen.

3. Eksekutor menjalankan pipeline pengolahan berkas, pengemasan partisi, verifikasi fisik kriptografis di VM, dan melakukan penerbitan rilis sesuai standar dokumen ini.

# **1. PENDAHULUAN & PRINSIP AKUMULASI KORPUS TANPA BATAS**

## **1.1 Tujuan Dokumen**

Dokumen Product Requirements Document (PRD) ini menetapkan standar operasional baku berpresisi tinggi untuk:

1. **Penataan struktur penempatan berkas data pada sistem rilis** ke dalam tepat **6 tag rilis resmi** yang terbagi atas 3 tingkatan (Data Baru, Penampungan, dan Rak Final K & R) beserta pohon keputusan pemetaan 4 kamar (`K1–K4` dan `R1–R4`).

2. **Penerapan 5 Pemeriksaan 'Pagar' untuk data baru**, daftar lisensi yang diperbolehkan, serta 6 aturan kualitas mutu *textbook* yang deterministik.

3. **Prinsip penyelamatan data bersih (Deterministic In-Place Repair) dan akumulasi token terbuka tanpa batas atas**, agar data bermutu tidak terbuang sia-sia saat pembersihan dan volume token terus bertambah.

4. **Standarisasi alur konversi data mentah menjadi token BPE resmi** melalui 12 tahapan berurutan tanpa ambiguitas urutan penerbitan.

5. **Penerapan Tiga Gerbang Segel SHA-256 Wajib** dengan perintah shell mandiri (*self-contained*) yang memverifikasi langsung berkas fisik `.jsonl.gz` tanpa tautologi checksum.

6. **Pencegahan penggunaan skrip penggabungan usang** serta penetapan **Skema Manifest Wajib (`manifest.json`)** yang dihitung murni dari berkas fisik (anti-halusinasi angka).

7. **Penyelesaian gap tokenizer untuk Korpus R (Bahasa Inggris)** guna mengatasi risiko inflasi token.

8. **Standarisasi format tata nama aset berkas rilis** K1–K4 dan R1–R4 secara simetris dan teratur.

9. **Format keterangan resmi (Release Notes)** yang wajib dicantumkan pada setiap tag rilis.

10. **Strategi pemanfaatan data pada tahap pelatihan (Training Strategy)** dilengkapi formula matematis oversampling dan kurikulum dua tahap.

## **1.2 Prinsip Akumulasi Terbuka, Perbaikan Deterministik, & Anti-Halusinasi**

**KETENTUAN PASTI:**

1. **Bebas Mengumpulkan Token Sebanyak-banyaknya (Tanpa Batas Atas Per Kategori/Rak):**

   Dokumen ini **DILARANG** membatasi jumlah maksimal token pada kategori mana pun (`K1, K2, K3, K4` maupun `R1, R2, R3, R4`). Setiap rak dan setiap kategori bebas mengumpulkan token BPE bersih **sebanyak-banyaknya tanpa plafon/batas atas** selama memenuhi standar mutu *textbook*.

2. **Larangan Keras Halusinasi Teks & Halusinasi Angka Manifest:**

   * **Larangan Mengarang/Mengubah Isi Teks dengan AI Generatif:** Seluruh proses pembersihan dan perbaikan teks (*in-place repair*) wajib menggunakan **operasi string/regex deterministik** yang ditetapkan pada **Bab 4.3**. Eksekutor **DILARANG KERAS** menggunakan LLM untuk menulis ulang (*paraphrase*) atau mengarang dokumen karena dapat memicu halusinasi fakta.

   * **Larangan Mengarang/Menebak Angka di `manifest.json`:** Setiap angka `documents_count`, `size_bytes`, `tokens_word_count`, `tokens_bpe`, dan `sha256` di dalam `manifest.json` **WAJIB merupakan hasil perhitungan skrip langsung atas berkas fisik `.jsonl.gz` yang sesungguhnya**. Dilarang keras menyalin angka contoh dari dokumen PRD ini, menebak jumlah token dengan pembagian byte kasar, atau memalsukan angka.

3. **Definisi Unit JSONL & Prinsip Utamakan Perbaikan Deterministik (In-Place Repair):**

   * **1 Baris Fisik = 1 Dokumen JSONL:** Dalam seluruh berkas `.jsonl` dan `.jsonl.gz` pada sistem ini, **1 baris fisik yang diakhiri `\n` adalah tepat 1 objek JSON dokumen (`{"text": "..."}`)**. Oleh karena itu, "membuang baris JSONL" dan "membuang dokumen" berarti **menghapus 1 objek JSON dokumen tersebut dari berkas partisi** (bukan menghapus seluruh berkas `.jsonl.gz`).

   * **Selamatkan Dokumen Sehat Melalui Aturan Kanonik Bab 4.3 & Bab 5:** Dokumen yang memuat URL inline atau ekor navigasi berita, dokumen naratif yang cacat huruf kecil semua (*all-lowercase*), serta dokumen bersih yang salah kamar bahasa **wajib diselamatkan** mengikuti prosedur deterministik pada **Bab 4.3 (Butir 4 & 6)** dan **Bab 5 (Tahap 4)**.

   * **Buang Dokumen yang Memenuhi Kondisi Penolakan Bab 4.3 & Catat di Log:** Dokumen JSONL hanya dibuang (dihapus dari keluaran dan tidak disimpan ke tag rilis mana pun) apabila memenuhi salah satu kondisi penolakan pada **Bab 4.3** (mengandung spam judi online sesuai Bab 4.3 Butir 2, mengandung frasa templat cacat OCR pada kategori non-kode sesuai Bab 4.3 Butir 5, terdeteksi kontaminasi benchmark sesuai Bab 4.3 Butir 3, berupa boilerplate cookie/error murni sesuai Bab 4.3 Butir 4, merupakan duplikat sesuai Bab 5 Tahap 3, tidak berbahasa target `id`/`en` sesuai Bab 5 Tahap 4, atau panjang bersihnya di bawah ambang minimal sesuai Bab 4.3 Butir 6). Jumlah dokumen yang dibuang wajib dicatat per alasan di log terminal sesuai **Bab 4.4**.

# **2. ARSITEKTUR TIGA TINGKAT & ENAM TAG RILIS RESMI (TIERED RELEASE SYSTEM)**

Seluruh korpus data pada GitHub Releases dikelola menggunakan **tepat 6 nama tag rilis resmi** yang tersusun dalam 3 tingkatan berjenjang dari Tingkat 1 hingga Tingkat 3. Penggunaan tag tambahan di luar ke-6 tag ini (termasuk pembuatan "rilis draf" terpisah atau tag dokumentasi tersendiri di GitHub Releases) dilarang keras; berkas spesifikasi `docs/PRD-RELEASE.md` dan `docs/STATUS-KORPUS-LISENSI.md` disimpan langsung di cabang Git repositori:

```
+-------------------------------------------------------------------------------+
|                       TINGKAT 1: DATA BARU (DATA MENTAH)                      |
|  Tag 1: Data-baru-Indonesian           |  Tag 2: data-baru-English            |
|  -> Tempat seluruh data mentah yang baru masuk/diunduh ditaruh di sini.       |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Melewati 5 Pemeriksaan Pagar & Tahap 2–8, lalu unggah Tahap 9)
+-------------------------------------------------------------------------------+
|                     TINGKAT 2: PENAMPUNGAN (CALON KORPUS)                     |
|  Tag 3: penampungan-Indonesian         |  Tag 4: penampungan-English          |
|  -> Berkas calon korpus (.jsonl.gz + manifest.json + SHA256SUMS) hasil        |
|     penyaringan, perbaikan deterministik, deduplikasi, & reroute bahasa.      |
+----------------------------------------+--------------------------------------+
                                         |
                                         v (Melewati Tahap 10–12: Gabung Lokal VM,
                                            Lulus Gerbang 2 & 3, Unggah ke Rak Final)
+-------------------------------------------------------------------------------+
|                 TINGKAT 3: RAK FINAL TEXTBOOK (KORPUS BERSIH TERBIT)          |
|  Tag 5: K-dataset-Indonesian           |  Tag 6: R-dataset-english            |
|  -> Korpus bersih final token BPE      |  -> Korpus bersih final token BPE    |
|     kualitas mutu textbook Indonesia   |     kualitas mutu textbook English   |
|     (K1, K2, K3, K4 disatukan)         |     (R1, R2, R3, R4 disatukan)       |
+-------------------------------------------------------------------------------+
```

**PERINGATAN KEPEKAAN HURUF BESAR/KECIL (CASE-SENSITIVITY) NAMA TAG:**

Karena tag Git dan URL GitHub Releases peka huruf besar/kecil (*case-sensitive*), eksekutor **wajib menyalin persis (byte-for-byte) ke-6 string nama tag resmi di atas** tanpa mengubah kapitalisasinya:

1. `Data-baru-Indonesian` (huruf `D` dan `I` kapital)

2. `data-baru-English` (huruf `d` kecil, `E` kapital)

3. `penampungan-Indonesian` (huruf `p` kecil, `I` kapital)

4. `penampungan-English` (huruf `p` kecil, `E` kapital)

5. `K-dataset-Indonesian` (huruf `K` dan `I` kapital)

6. `R-dataset-english` (huruf `R` kapital, `e` kecil)

## **2.1 Peran dan Batas Tiap Tingkatan**

1. **Tingkat 1 — Data Baru (`Data-baru-Indonesian` & `data-baru-English`):** Pintu masuk utama penampungan arsip mentah sebelum tersentuh pipeline pengolahan. Skrip pelatihan dilarang keras mengambil data dari tingkat ini.

2. **Tingkat 2 — Penampungan (`penampungan-Indonesian` & `penampungan-English`):** Tempat penyimpanan *Calon Korpus* (`K1-calon-...`, `R1-calon-...`, dst.) yang telah melewati Tahap 2–8 dan diunggah pada Tahap 9. Data pada tingkat ini belum dianggap terbit untuk produksi hingga digabungkan di VM (Tahap 10), lulus audit fisik Gerbang 2 & 3 (Tahap 11), dan selesai diunggah ke Tingkat 3 (Tahap 12).

3. **Tingkat 3 — Rak Final Mutu Textbook (`K-dataset-Indonesian` & `R-dataset-english`):** Rak rilis produksi akhir yang berisi korpus bersih terverifikasi mutu *textbook*. **Data korpus dinyatakan resmi terbit (published) hanya ketika berkas `.jsonl.gz`, `manifest.json`, dan SHA256SUMS telah lulus re-audit fisik di VM (Tahap 11) dan selesai terunggah ke tag K-dataset-Indonesian atau R-dataset-english (Tahap 12).**

## **2.2 Pohon Keputusan & Urutan Prioritas Pemetaan 4 Kamar (K1–K4 & R1–R4)**

Agar tidak ada ambiguitas apabila sebuah dokumen tampak cocok ke lebih dari satu kamar, pemetaan setiap dokumen ke dalam kamar `1, 2, 3, atau 4` wajib dievaluasi menggunakan **urutan prioritas berjenjang (mutually exclusive decision tree) dari Prioritas 1 hingga Prioritas 4** berikut:

1. **Prioritas 1 (Tertinggi) — Kamar 4: Kode Sumber & Rekayasa Perangkat Lunak (`K4-coding` / `R4-coding`):**

   * **Aturan Pemetaan:** Periksa terlebih dahulu apakah dokumen berasal dari repositori kode/dokumentasi API pemrograman ATAU teksnya memuat struktur sintaksis kode sumber (minimal 2 indikator sintaksis seperti `def `, `function `, `const `, `let `, `import `, `export `, `class `, `public static `, `SELECT ... FROM`, `#include`, atau blok kurung kurawal `{...}` dengan titik koma `;`).

   * **Keputusan:** Jika YA, dokumen **wajib masuk ke K4 atau R4** (dan tidak boleh masuk ke Kamar 1, 2, atau 3 meskipun kode tersebut membahas rumus matematika, hukum, atau sains). Pemisahan antara `K4` dan `R4` ditentukan oleh bahasa komentar/docstring penjelasan di dalam kode (`K4` jika komentar/penjelasan berbahasa Indonesia; `R4` jika komentar/penjelasan berbahasa Inggris atau hanya kode murni).

2. **Prioritas 2 — Kamar 2: Dialog, Riset Sains/Medis Akademik, & Regulasi Formal (`K2-dialog` / `R2-dialog`):**

   * **Aturan Pemetaan:** Jika dokumen **bukan kode** (tidak masuk Prioritas 1), periksa apakah dokumen memenuhi salah satu dari tiga ciri berikut:

     (a) Berformat transkrip percakapan multi-giliran (*multi-turn dialogue*), tanya-jawab instruksional (`Tanya: ... Jawab: ...`, `Q: ... A: ...`), atau wawancara terstruktur;

     (b) Berasal dari korpus makalah riset akademik, sains tingkat lanjut, atau kedokteran/biomedis (`PubMed`, `peS2o`, `arXiv`, jurnal ilmiah ber-DOI/abstrak);

     (c) Merupakan naskah regulasi, perundang-undangan, putusan pengadilan, atau lembaran negara formal (seperti dokumen `JDIH`, Undang-Undang, Peraturan Pemerintah, Peraturan Presiden/Menteri yang utuh dan bebas cacat OCR).

   * **Keputusan:** Jika memenuhi salah satu dari (a), (b), atau (c), dokumen **wajib masuk ke K2 (Indonesia) atau R2 (Inggris)**.

3. **Prioritas 3 — Kamar 1: Pengetahuan Ensiklopedis & Buku Teks (`K1-pengetahuan` / `R1-pengetahuan`):**

   * **Aturan Pemetaan:** Jika dokumen tidak masuk Prioritas 1 maupun Prioritas 2, periksa apakah dokumen berasal dari ensiklopedia (`Wikipedia`), buku teks pelajaran/universitas, diktat kuliah, monograf keilmuan, kamus/glosarium, atau artikel referensi pemaparan konsep faktual (sejarah, geografi, ekonomi, biologi dasar, fisika dasar).

   * **Keputusan:** Jika YA, dokumen **wajib masuk ke K1 (Indonesia) atau R1 (Inggris)**.

4. **Prioritas 4 (Default Naratif) — Kamar 3: Pelengkap & Pemecahan Masalah Umum (`K3-pelengkap` / `R3-pelengkap`):**

   * **Aturan Pemetaan:** Seluruh dokumen naratif sehat lainnya yang lulus standar mutu *textbook* Bab 4.3 tetapi tidak termasuk dalam Prioritas 1, 2, maupun 3—meliputi artikel berita/jurnalisme bersih (setelah dikupas URL & ekor navigasinya), esai sosial-budaya, sastra/prosa umum, serta forum diskusi pemecahan masalah teknis non-kode—**wajib dipetakan ke K3 (Indonesia) atau R3 (Inggris)**.

## **2.3 Aturan Operasional Pembaruan Aset, Penamaan Kanonik, & Penghapusan Tag Lama**

1. **Penambahan Volume & Perbaikan Partisi Eksisting:** Setiap pembaruan Rak Final wajib dilakukan dengan mengunduh aset Rak Final eksisting ke VM lokal, membersihkan residu (jika ada) sesuai **Bab 4.3**, menggabungkannya dengan partisi calon korpus dari `penampungan` sesuai **Bab 5 (Tahap 10)**, menjalankan verifikasi fisik **Gerbang 2 & Gerbang 3** di VM (Tahap 11), lalu mengunggah hasilnya ke tag Rak Final (Tahap 12).

2. **Kewajiban Penyeragaman Nama Aset Non-Kanonik Saat Promosi:** Apabila di tingkat `penampungan` masih terdapat berkas dari rilis lama yang namanya belum mengikuti pola kanonik Bab 9 (contohnya `textbook-en-part01.jsonl.gz` dan `textbook-en-part02.jsonl.gz` pada `penampungan-English`), berkas tersebut **wajib diganti namanya (rename) menjadi format kanonik (`R1-pengetahuan-part1.jsonl.gz`, `R1-pengetahuan-part2.jsonl.gz`, dst.)** pada saat penggabungan lokal di Tahap 10 sebelum dibuatkan `manifest.json` dan `SHA256SUMS`.

3. **Protokol Hapus Rilis Tag Lama (Delete Retired Releases):** Tag rilis lama di luar 6 nama tag resmi (seperti `korpus-*-bersih`, `penampung`, `data-baru`, `data-baru-20261002`, dan `prd-data-release`) yang seluruh asetnya telah dipindahkan ke dalam 6 tag resmi **wajib dihapus rilis dan tag-nya dari GitHub Releases (`gh release delete <tag> --cleanup-tag --yes`)**, bukan sekadar dibiarkan menganggur dengan label "dipensiunkan".

# **3. PRESEDEN NYATA & SEJARAH ANOMALI SISTEM (LESSONS LEARNED)**

Setiap aturan dan protokol ketat dalam PRD ini disusun berdasarkan insiden teknis nyata yang pernah terjadi pada proses rilis sebelumnya:

1. **Insiden JDIH (Pemisahan Kamar Domain Mutlak):** Berkas pindaian dari JDIH (Jaringan Dokumentasi dan Informasi Hukum) hampir salah diklasifikasikan sebagai kandidat K4 koding. Kategori K4 dikunci mutlak hanya untuk domain ilmu komputer, algoritma, dan rekayasa perangkat lunak. Teks hukum, regulasi, dan kedinasan yang sehat dikunci masuk ke kamar K2.

2. **Insiden K3 94% en-simple (Keputusan-014):** Partisi K3 sempat terinfiltrasi teks bahasa Inggris sederhana (*en-simple*) hingga mencapai 94% dari volume berkas. Diterapkan ambang batas deteksi bahasa otomatis minimal 95,0% dokumen berbahasa Indonesia untuk setiap berkas partisi `K1, K2, K3` (dengan pengecualian untuk `K4` coding). Seluruh dokumen berbahasa Inggris yang bersih dipindahkan (*reroute*) ke `R1-calon-pengetahuan` di `penampungan-English`.

3. **Insiden MADLAD-400 (Pensiun 8,1 Miliar Kata Akibat Sampah Web):** Sekitar 8,1 miliar kata dari dump korpus web publik MADLAD-400 terpaksa dipensiunkan (retired) secara massal karena audit pasca-unduh menemukan keberadaan spam SEO, teks mesin rusak, dan duplikasi tak terkendali. Seluruh data mentah wajib melewati gerbang pembersihan boilerplate dan deduplikasi MinHash LSH sebelum diizinkan masuk ke tahap penampungan calon korpus.

4. **Bug Dual-Field Manifest (Insiden 2026-09-09):** Terjadi tabrakan skema metadata di mana berkas manifest memuat dua field token yang saling tumpang tindih dan dihitung dengan rumus berbeda. Skema manifest dibakukan secara tunggal (Bab 7) dan skrip penggabungan manifest lama dilarang keras untuk digunakan kembali.

5. **Temuan Audit Korpus K (Penyempurnaan Standar Mutu Textbook Oktober 2026):** Audit isi partisi menemukan bahwa pemotongan menggunakan `split --bytes` memutus 1–2 baris JSON di ujung berkas, serta masih adanya URL inline dan ekor berita di `K3-part1`, teks huruf kecil semua (*all-lowercase*) di `K3-part3..5`, spam judi yang disamarkan dengan spasi (`"B a n d a r | J u d i"`), dan cetakan templat cacat OCR (`"Pasal ... Menter! ... No nan Tahun"`) di `K3-part2/6/7`. Seluruh celah tersebut kini ditutup secara deterministik pada Bab 4 dan Bab 5.

# **4. LIMA PEMERIKSAAN 'PAGAR', ATURAN LISENSI, & STANDAR MUTU TEXTBOOK (DEFINISI KANONIK)**

## **4.1 Lima Pemeriksaan Checklist 'Pagar' (Untuk Data Baru)**

*(Catatan Terminologi: Istilah* ***"Pagar"*** *digunakan khusus untuk 5 pemeriksaan kelayakan awal data mentah pada Bab 4.1 ini, sedangkan istilah* ***"Gerbang"*** *pada Bab 6 digunakan khusus untuk 3 verifikasi segel kriptografis SHA-256).*

Sebelum data baru diizinkan masuk ke pipeline pengolahan tingkat lanjut, data wajib lulus 5 pemeriksaan 'Pagar':

1. **Pagar 1 — Pagar Lisensi (License Check):** Memverifikasi bahwa sumber data memiliki lisensi terbuka yang sah dan termasuk dalam daftar lisensi yang diperbolehkan pada Bab 4.2.

2. **Pagar 2 — Pagar Provenance / Asal-Usul (Provenance Check):** Mencatat riwayat asal data secara presisi (URL asal, waktu pengambilan, metode pengambilan, dan hash arsip mentah).

3. **Pagar 3 — Pagar Isolasi Sistem (Storage Isolation Check):** Berkas data korpus dilarang di-commit ke branch kode Git; seluruh berkas korpus wajib diunggah ke 6 tag resmi di GitHub Releases. *(Catatan: Berkas non-teks yang berada di luar cakupan korpus teks BPE, seperti aset suara/audio aplikasi jika ada, tidak disentuh oleh pipeline rilis korpus teks ini).*

4. **Pagar 4 — Pagar Format & Integritas (Format Integrity Check):** Memastikan arsip mentah tidak rusak (bebas error CRC/gzip) dan dapat diekstrak secara konsisten dengan setiap baris JSONL utuh tanpa pemotongan baris.

5. **Pagar 5 — Pagar Sanitasi Awal (Initial Hygiene Check):** Memastikan teks dapat didekodekan ke UTF-8 murni tanpa karakter pengganti rusak (`\ufffd`).

## **4.2 Daftar Eksak Lisensi yang Diperbolehkan (Greenlist) vs Dilarang (Blacklist)**

* **Lisensi yang DIPERBOLEHKAN (Greenlist — 13 Kode Identifier Sah untuk Field license di `manifest.json`):**

  1. Domain Publik & CC0: `CC0-1.0`, `Public-Domain`

  2. Creative Commons Permisif: `CC-BY-4.0`, `CC-BY-SA-4.0`, `CC-BY-3.0`, `CC-BY-SA-3.0`

  3. Perangkat Lunak Permisif: `MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`

  4. Data Terbuka Permisif: `ODC-By`, `PDDL`, `CDLA-Permissive-2.0`

* **Lisensi yang DILARANG KERAS (Blacklist):**

  * Seluruh lisensi Non-Komersial (`CC-BY-NC`, `CC-BY-NC-SA`, `CC-BY-NC-ND`) dan Tanpa Turunan (`CC-BY-ND`).

  * Konten berhak cipta tertutup/berbayar (*paywalled*/bajakan) tanpa izin terbuka.

  * Konten dengan klausul larangan pelatihan AI (*AI training prohibition*).

## **4.3 Enam Aturan Kanonik Pembersihan & Perbaikan Deterministik (Data Hygiene & Textbook Gate)**

Seluruh berkas pada Tahap 2 wajib melewati tepat 6 aturan deterministik di bawah ini secara berurutan (tanpa menggunakan LLM generatif):

1. **Aturan 1 — Redaksi PII (Personally Identifiable Information):**

   Ganti dengan string `[REDACTED]` menggunakan regex deterministik untuk:

   * NIK/KTP (16 digit angka berurutan `\b\d{16}\b`), nomor paspor, dan nomor telepon pribadi;

   * Alamat email personal non-publik (`[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}`), termasuk mengupas email penulis pada baris header commit (`Author:`, `Signed-off-by:`) di `K4/R4` tanpa membuang isi kodenya;

   * Kunci rahasia/kredensial API (`AKIA[0-9A-Z]{16}`, `ghp_[0-9a-zA-Z]{36}`, `sk-[0-9a-zA-Z]{32,}`, blok `-----BEGIN [A-Z ]*PRIVATE KEY-----`).

2. **Aturan 2 — Pembuangan Konten Toksik, Ilegal, & Spam Judi (Dengan Perlindungan Identifier Kode K4/R4):**

   * **Untuk Kategori Naratif (`K1, K2, K3` dan `R1, R2, R3`):**

     Buat salinan teks uji sementara dalam huruf kecil, lalu rapatkan urutan huruf tunggal yang dipisah spasi atau karakter pemisah (`|`, `-`, `_`, `.`)—misalnya `"B a n d a r | J u d i | Q Q"` menjadi `"bandar judi qq"`. **Buang seluruh dokumen JSONL** apabila salinan teks uji tersebut memuat ujaran kebencian ekstrem, instruksi senjata/bahan peledak, atau salah satu dari **frasa spesifik promosi judi online** berikut:

     `("slot gacor", "judi slot", "situs slot", "link gacor", "bocoran rtp", "rtp live", "bandar togel", "togel online", "judi togel", "judi bola", "bandar judi", "situs judi", "agen judi", "domino qq", "poker online", "kasino online", "casino online", "maxwin slot", "depo pulsa")`.

   * **Perlindungan Khusus Kategori Kode (`K4` dan `R4` Coding):**

     Pada `K4` dan `R4`, **jangan lakukan perapatan karakter pemisah \_ atau .** (agar nama variabel/properti kode tidak rusak), dan jangan membuang kode hanya karena memuat kata umum seperti `slot`, `poker`, atau `maxWin`. Dokumen kode di `K4/R4` hanya dibuang oleh filter judi apabila memuat **minimal 2 frasa eksplisit judi online** dari daftar `("slot gacor", "bandar judi", "situs judi", "togel online", "judi bola", "rtp live")`.

3. **Aturan 3 — Dekontaminasi Tolok Ukur (Benchmark Decontamination):**

   Buang dokumen JSONL yang memiliki kecocokan substring eksak **13-gram kata** (13 kata berurutan setelah normalisasi huruf kecil) terhadap himpunan soal/jawaban uji pada tolok ukur evaluasi standar: `HumanEval`, `MBPP`, `GSM8k`, `MMLU`, `ARC`, dan `IndoMMLU`.

4. **Aturan 4 — Pembuangan Boilerplate Murni vs Pengupasan In-Place URL & Ekor Navigasi Berita:**

   * **Buang Dokumen Boilerplate Murni:** Buang dokumen JSONL apabila teksnya semata-mata berisi pemberitahuan persetujuan cookie (*cookie consent banner*, termasuk terjemahan mesin rusak yang memuat frasa *"menggunakan kue untuk meningkatkan pengalaman"*), daftar menu navigasi situs, atau pesan HTTP Error `404 Not Found` / `403 Forbidden` / `500 Internal Server Error`.

   * **Kupas In-Place URL & Ekor Navigasi pada `K1–K3` / `R1–R3` (Simpan Artikelnya):**

     Pada kategori non-kode (`K1–K3` dan `R1–R3`), jangan buang artikel yang memuat tautan atau kalimat penutup redaksi. Hapus hanya substring/baris berikut menggunakan regex *case-insensitive*:

     * Substring URL: `https?://[^\s)\]"']+`

     * Baris atau kalimat ekor navigasi yang diawali frasa kanonik: `^(?:baca juga|simak juga|lihat juga|artikel terkait|berita terkait|selanjutnya di halaman|halaman selanjutnya|klik untuk lanjut|bagikan artikel ini|bagikan\s*:|share\s*:|follow kami|ikuti kami di|simak selengkapnya|artikel ini telah tayang di|sumber\s*:\s*https?)[^\n]*$`

     Setelah substring tersebut dihapus, **simpan dokumen utamanya** jika panjang bersihnya memenuhi ambang minimal pada Aturan 6. *(Catatan: Pada K4/R4 coding, URL di dalam kode/dokumentasi teknis tidak dihapus kecuali merujuk ke situs daftar hitam).*

5. **Aturan 5 — Pembuangan Templat Sintetis Cacat OCR (Aman Kata Sastra "nan" & Pengecualian Mutlak K4/R4):**

   * **Larangan Hanya pada Frasa Templat Cacat Ekstraksi (Bukan Kata "nan" Mandiri):**

     Dalam Bahasa Indonesia sastra/baku, kata `"nan"` (yang berarti *"yang"*, seperti pada *"bunga nan indah"*) adalah kata yang 100% sah; demikian pula kata `"undefined"` dalam pembahasan matematika/sains. Oleh karena itu, eksekutor **DILARANG KERAS** membuang dokumen hanya karena kemunculan kata tunggal `"nan"` atau `"undefined"`.

   * **Daftar Eksak Frasa Cacat OCR yang Wajib Dibuang pada `K1–K3` dan `R1–R3`:**

     Pada kategori non-kode (`K1, K2, K3` dan `R1, R2, R3`), buang dokumen JSONL **hanya apabila teksnya (dalam pencocokan case-insensitive) mengandung salah satu dari 9 string frasa cacat templat/OCR spesifik berikut**:

     1. `"no nan tahun"`

     2. `"nomor nan tahun"`

     3. `"pasal nan"`

     4. `"ayat nan"`

     5. `"tahun nan"`

     6. `"peraturan menter!"`

     7. `"no undefined tahun"`

     8. `"nomor undefined tahun"`

     9. `"pasal undefined"`

   * **Pengecualian Mutlak `K4` dan `R4` (Coding):** Kategori **`K4 dan R4 DIKECUALIKAN 100%`** dari Aturan 5 ini.

6. **Aturan 6 — Definisi Matematis All-Lowercase, Algoritma Kapitalisasi Deterministik, & Ambang Panjang Minimal:**

   * **Rumus Matematis Deteksi Cacat All-Lowercase (Bebas Pembagian Nol & Bebas Salah Sasaran):**

     Untuk setiap dokumen pada kategori naratif (`K1, K2, K3` dan `R1, R2, R3`), hitung jumlah huruf ASCII kapital `upper_count = sum(1 for c in text if 'A' <= c <= 'Z')` dan huruf ASCII kecil `lower_count = sum(1 for c in text if 'a' <= c <= 'z')`, serta `alpha_count = upper_count + lower_count`.

     * Jika `alpha_count == 0`, lewati proses kapitalisasi (mencegah pembagian dengan nol).

     * Sebuah dokumen naratif ditetapkan mengalami cacat *all-lowercase* **hanya jika**:

       `upper_count == 0` **ATAU** (`(upper_count / alpha_count) < 0.001` **DAN** huruf alfabet ASCII pertama di dalam dokumen adalah huruf kecil `'a' <= first_alpha <= 'z'`).

     * Dokumen yang tidak memenuhi syarat di atas (misalnya sudah diawali huruf kapital dan memiliki rasio huruf kapital `>= 0.1%`) **dilarang diubah kapitalisasinya**.

   * **Algoritma Kapitalisasi Awal Kalimat (Aman Singkatan Indonesia & Inggris):**

     Pada dokumen `K1–K3` / `R1–R3` yang terdeteksi cacat *all-lowercase* berdasarkan rumus di atas:

     1. Ubah huruf alfabet ASCII pertama di awal dokumen menjadi huruf kapital.

     2. Ubah huruf alfabet ASCII pertama setelah karakter baris baru (`\n`), tanda seru berspasi (`! `), atau tanda tanya berspasi (`? `) menjadi huruf kapital.

     3. Ubah huruf alfabet ASCII pertama setelah tanda titik berspasi (`. `) menjadi huruf kapital, **KECUALI** apabila token tepat sebelum tanda titik tersebut adalah:

        * Satu huruf alfabet tunggal (`a` s/d `z`, seperti pada inisial nama `m. hatta` atau `j. k. rowling`),

        * Singkatan bertitik internal (`e.g`, `i.e`, `ph.d`, `m.sc`, `b.sc`, `s.h`, `m.h`, `u.s`, `u.k`), atau

        * Termasuk dalam himpunan singkatan gelar/rujukan baku Indonesia & Inggris berikut (*case-insensitive*):

          `{"dr", "prof", "ir", "hj", "hlm", "dkk", "dll", "dsb", "dst", "tsb", "pt", "cv", "tbk", "jl", "jln", "kec", "kab", "prov", "vs", "fig", "eq", "vol", "ch", "sec", "pp", "mr", "mrs", "ms", "jr", "sr", "inc", "ltd", "corp"}`.

          *(Catatan: Kata umum yang bisa berada di akhir kalimat seperti "no", "hal", "al", "st" tidak dimasukkan ke daftar pengecualian bebas ini agar tidak menghalangi kapitalisasi kalimat berikutnya; sedangkan jika diikuti angka seperti "no. 5" atau angka desimal "3.14", karakter setelahnya bukan huruf kecil sehingga otomatis aman).*

     4. **Larangan Mutlak pada K4 dan R4:** Algoritma kapitalisasi ini **DILARANG KERAS** dijalankan pada `K4` dan `R4` (coding).

   * **Ambang Panjang Minimal Pasca-Pembersihan:**

     Setelah Aturan 1 s/d 6 dijalankan, hitung `len(text.strip())`:

     * Untuk **`K1, K2, K3, R1, R2, R3`**: wajib **`>= 200` karakter** (jika `< 200`, buang dokumen dan catat ke `dropped_short_docs`).

     * Untuk **`K4, R4` (Coding)**: wajib **`>= 128` karakter** (jika `< 128`, buang dokumen dan catat ke `dropped_short_docs`).

## **4.4 Pencatatan Log Audit Pembersihan (Rejection & Repair Counters)**

Dokumen yang dibuang tidak disimpan sebagai berkas di GitHub Releases. Skrip pembersihan wajib mencetak penghitung audit berikut ke log terminal pada setiap eksekusi partisi:

1. `input_docs`: Jumlah dokumen awal sebelum penyaringan.

2. `kept_docs`: Jumlah dokumen bersih yang lolos dan disimpan.

3. `repaired_url_tail_docs`: Jumlah dokumen yang berhasil diselamatkan lewat pengupasan URL/ekor berita.

4. `repaired_truecase_docs`: Jumlah dokumen *all-lowercase* yang berhasil dipulihkan kapitalisasinya.

5. `rerouted_lang_docs`: Jumlah dokumen bersih yang dipindahkan lintas bahasa (`K -> penampungan-English R1` atau `R -> penampungan-Indonesian K1`).

6. `dropped_gambling_docs`, `dropped_benchmark_docs`, `dropped_boilerplate_docs`, `dropped_ocr_template_docs`, `dropped_short_docs`, `dropped_duplicate_docs`, `dropped_other_lang_docs`: Rincian jumlah dokumen yang dibuang per alasan.

# **5. ALUR KHUSUS LENGKAP: RAW -> TOKEN BPE (12 TAHAPAN WAJIB & DEFINISI PARAMETER KANONIK)**

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

1. **Tahap 1 — RAW (Penerimaan Data Mentah di Tingkat 1):** Arsip data mentah yang baru diunduh ditempatkan pada tag Tingkat 1 (`Data-baru-Indonesian` atau `data-baru-English`), diperiksa dengan 5 Pagar (Bab 4.1), dan dicatat segel awalnya melalui **Gerbang 1 (Bab 6.1)**.

2. **Tahap 2 — EXTRACT + CLEAN + IN-PLACE REPAIR (Eksekusi 6 Aturan Kanonik Bab 4.3):** Mengekstrak teks murni, membuang tag HTML/XML/markup kotor, menormalisasi unicode (`NFC`), lalu menerapkan secara berurutan **Aturan 1 s/d Aturan 6 pada Bab 4.3**, dan menulis dokumen yang lolos ke format JSONL utuh (`{"text": "..."}`, 1 baris fisik per dokumen).

3. **Tahap 3 — DEDUPE (Ruang Lingkup, Prioritas Salinan, & Parameter Lengkap MinHash LSH):**

   * **Ruang Lingkup Deduplikasi (Scope):** Deduplikasi dijalankan **di dalam poros bahasa yang sama**—yaitu lintas seluruh partisi dan lintas seluruh kamar `K1–K4` pada Poros Indonesia (K), serta lintas seluruh partisi dan lintas seluruh kamar `R1–R4` pada Poros Inggris (R).

   * **Aturan Pemilihan Salinan yang Disimpan (Tie-Breaker):**

     1. Apabila duplikat ditemukan di dalam kamar yang sama (mis. sesama `K3`), **simpan dokumen yang pertama kali ditemui (first-seen)** sesuai urutan nomor partisi (`part1, part2, ...`) dan buang salinan berikutnya.

     2. Apabila duplikat ditemukan lintas kamar berbeda (mis. dokumen yang sama ada di `K1` dan `K3`), gunakan urutan prioritas kamar **`K1 > K2 > K4 > K3`** (dan **`R1 > R2 > R4 > R3`**): simpan salinan pada kamar berprioritas lebih tinggi dan buang salinan pada kamar berprioritas lebih rendah.

   * **Spesifikasi Teknis Deduplikasi Dua Lapis:**

     1. **Lapis 1 (Deduplikasi Eksak):** Hitung hash SHA-256 atas teks yang telah dinormalisasi (`text.lower()`, seluruh urutan whitespace diganti 1 spasi `' '`, lalu `.strip()`). Buang setiap dokumen dengan hash yang sudah pernah tercatat.

     2. **Lapis 2 (Deduplikasi MinHash LSH):**

        * **Shingle:** Gunakan *word 5-gram* (5 kata berurutan dari teks yang dinormalisasi huruf kecil; apabila dokumen memiliki `< 5` kata, gunakan *character 5-gram*).

        * **Fungsi Hash & Seed:** `xxhash64` atau `mmh3` 64-bit deterministik dengan **`seed = 42`**.

        * **Permutasi & Pita LSH:** **`num_perm = 128`**, dibagi menjadi **`bands = 16`** pita dengan **`rows_per_band = 8`** (`16 × 8 = 128`), dan ambang kemiripan Jaccard **`threshold = 0.85`**. Setiap pasangan dokumen kandidat dengan kemiripan Jaccard `>= 0.85` dibuang salinan keduanya mengikuti aturan *tie-breaker* di atas dan dicatat ke `dropped_duplicate_docs`.

4. **Tahap 4 — FILTER & REROUTE BAHASA (Skor Keyakinan fastText, Nasib Bahasa Asing, & Verifikasi Pasca-Reroute):**

   * **Pengecualian Mutlak K4 dan R4 (Coding):** Berkas pada kamar **`K4 dan R4 dikecualikan sepenuhnya dari penyaringan bahasa Tahap 4 ini`** karena sintaksis pemrograman menggunakan kata kunci bahasa Inggris secara universal.

   * **Alat & Ambang Skor Keyakinan (Confidence Threshold) untuk K1–K3 dan R1–R3:**

     Jalankan deteksi bahasa per dokumen menggunakan model **`fastText (lid.176.bin)`** dengan memanggil `model.predict(text.replace("\n", " "), k=1)` (jika binari `lid.176.bin` tidak tersedia di lingkungan lokal, gunakan *fallback* deterministik pencocokan rasio kata fungsi baku Bahasa Indonesia vs Bahasa Inggris). Sebuah dokumen dinyatakan berbahasa Indonesia (`id`) jika label teratas adalah `__label__id` dengan skor keyakinan **`prob >= 0.65`**, dan berbahasa Inggris (`en`) jika label teratas adalah `__label__en` dengan **`prob >= 0.65`**.

   * **Tindakan Deterministik per Dokumen (Sebelum Pengemasan Partisi):**

     1. **Saat Memproses Jalur K (K1, K2, K3):**

        * Jika dokumen terdeteksi **`id (prob >= 0.65)`** → **Simpan** di partisi jalur K yang sedang diproses.

        * Jika dokumen terdeteksi **`en (prob >= 0.65)`** dan panjangnya `>= 200` karakter → **Pindahkan (reroute)** baris JSONL tersebut ke berkas antrean **`R1-calon-pengetahuan-part*.jsonl.gz untuk diunggah ke tag Tingkat 2 penampungan-English`**, lalu tambahkan penghitung `rerouted_lang_docs`. *(Apabila dokumen yang di-reroute belum pernah melewati kapitalisasi kalimat di Tahap 2 karena faktor bahasa, jalankan pemeriksaan Aturan 6 Bab 4.3 saat masuk ke antrean R1-calon).*

        * Jika dokumen terdeteksi **bahasa lain di luar id dan en** ATAU memiliki skor keyakinan **`prob < 0.65`** → **Buang dokumen tersebut** dan tambahkan penghitung `dropped_other_lang_docs`.

     2. **Saat Memproses Jalur R (R1, R2, R3):**

        * Jika dokumen terdeteksi **`en (prob >= 0.65)`** → **Simpan** di partisi jalur R yang sedang diproses.

        * Jika dokumen terdeteksi **`id (prob >= 0.65)`** dan panjangnya `>= 200` karakter → **Pindahkan (reroute)** baris JSONL tersebut ke berkas antrean **`K1-calon-pengetahuan-part*.jsonl.gz untuk diunggah ke tag Tingkat 2 penampungan-Indonesian`**, lalu tambahkan penghitung `rerouted_lang_docs`.

        * Jika dokumen terdeteksi **bahasa lain di luar en dan id** ATAU memiliki skor keyakinan **`prob < 0.65`** → **Buang dokumen tersebut** dan tambahkan penghitung `dropped_other_lang_docs`.

   * **Verifikasi Ambang Kemurnian Bahasa Partisi (>= 95,0% Dihitung SESUDAH Reroute):**

     Setelah pemilahan dan *reroute* per dokumen di atas selesai, hitung rasio dokumen berbahasa target di dalam setiap berkas partisi `K1–K3` dan `R1–R3` (`jumlah_dokumen_bahasa_target / documents_count`). Rasio ini dihitung **sesudah reroute** dan wajib **`>= 95,0%`**. Apabila saat mengaudit berkas partisi lama ditemukan partisi yang rasio bahasa targetnya `< 95,0%`, partisi tersebut **dilarang diunggah** dan **wajib disaring ulang melewati prosedur per dokumen pada Tahap 4 ini** hingga mencapai `>= 95,0%`.

5. **Tahap 5 — TOKENIZE BPE (Perhitungan Token BPE Riil & Ketetapan vocab_size: 32000):** Menghitung jumlah kata (`tokens_word_count`, dipisah whitespace `len(text.split())`) dan jumlah token BPE (`tokens_bpe`) secara langsung dari teks setiap dokumen menggunakan tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js`, fungsi `encodeBytes`). Untuk seluruh rilis Fase A saat ini, field `tokenizer` di dalam `manifest.json` **dikunci secara tunggal tanpa syarat** pada nilai:

   `"name": "rategoan-bpe"`, `"vocab_size": 32000`, `"encoding_type": "byte-level-bpe-cased"`.

6. **Tahap 6 — PEMOTONGAN AMAN BARIS (Aturan Pilihan Mode split pada Berkas `.jsonl` Mentah):** Pemecahan berkas `.jsonl` mentah menjadi partisi bernomor (`part1, part2, ...`) wajib dilakukan pada **batas baris utuh (`\n`)** sebelum dikompresi (`split --bytes` / `-b` dilarang keras):

   * **Mode Standar Utama (Default): Gunakan `split -d -a 2 --line-bytes=3800M --additional-suffix=.jsonl`** pada berkas `.jsonl` mentah (dengan rasio kompresi `gzip` teks ~3x, mode ini menghasilkan berkas `.jsonl.gz` sekitar `1,10 GB – 1,40 GB`).

   * **Mode Disk Terbatas (Jika Ruang Disk VM < 15 GB): Gunakan `split -d -a 2 --line-bytes=1450M --additional-suffix=.jsonl`** (menghasilkan berkas `.jsonl.gz` sekitar `0,45 GB – 0,55 GB`).

7. **Tahap 7 — KOMPRESI `.jsonl.gz` & Penegakan Langsung Batas Ukuran <= 1.500.000.000 Byte:**

   * Kompresi setiap partisi `.jsonl` menggunakan `gzip` menjadi ekstensi baku **`.jsonl.gz`** (penggunaan ekstensi `.gzip` dilarang).

   * **Penegakan Ukuran Langsung di Tahap 7:** Segera setelah `gzip` selesai, periksa ukuran byte setiap berkas `.jsonl.gz` (`size_bytes`). Setiap berkas wajib memenuhi **`0 < size_bytes <= 1.500.000.000` byte (maksimal 1,50 GB)**. Partisi `.jsonl.gz` yang berukuran di bawah 1,35 GB (misalnya hasil mode `1450M` atau partisi sisa terakhir) adalah **100% sah**.

   * **Prosedur Wajib Jika Ada `.jsonl.gz` yang Melebihi 1.500.000.000 Byte:** Apabila ada berkas `.jsonl.gz` yang ukurannya `> 1.500.000.000` byte (akibat rasio kompresi berkas tersebut lebih rendah), eksekutor **wajib saat itu juga di Tahap 7** mendekompresi berkas tersebut (`gzip -d`), memotong ulang `.jsonl`-nya dengan `split --line-bytes=2000M`, mengompresinya kembali menjadi `.jsonl.gz`, dan menomori ulang urutan `part1..partN` hingga seluruh berkas `.jsonl.gz` berukuran `<= 1.500.000.000` byte sebelum lanjut ke Tahap 8.

8. **Tahap 8 — TULIS MANIFEST & SHA256SUMS PENAMPUNGAN:** Menghitung `sha256`, `size_bytes`, `documents_count`, `tokens_bpe`, dan `tokens_word_count` dari setiap berkas fisik `.jsonl.gz`, menulis `manifest.json` sesuai skema **Bab 7.2**, dan membuat berkas `SHA256SUMS` (`sha256sum *.jsonl.gz > SHA256SUMS`).

9. **Tahap 9 — UNGGAH KE PENAMPUNGAN (Status: Calon Korpus di Tingkat 2):** Berkas `.jsonl.gz`, `manifest.json`, dan `SHA256SUMS` yang telah lulus pemeriksaan ditempatkan pada tag resmi Tingkat 2: **`penampungan-Indonesian`** atau **`penampungan-English`**. Pada tahap ini data berstatus **Calon Korpus** (belum terbit sebagai Rak Final).

10. **Tahap 10 — GABUNG KANONIK DI LOKAL VM & PEMBUATAN MANIFEST/SHA256SUMS KANDIDAT RAK FINAL:** Untuk mempromosikan Calon Korpus ke Rak Final, eksekutor mengunduh aset Rak Final eksisting ke direktori kerja lokal VM, menggabungkannya dengan partisi baru dari `penampungan` (termasuk mengubah nama berkas lama non-kanonik seperti `textbook-en-part01/02` menjadi `R1-pengetahuan-part*.jsonl.gz`), menjalankan deduplikasi lintas-partisi (Tahap 3), memastikan penomoran `part1..partN` berurutan tanpa tabrakan nama, lalu **membuat berkas `manifest.json` dan SHA256SUMS (`sha256sum *.jsonl.gz > SHA256SUMS`) kandidat Rak Final di dalam VM**.

11. **Tahap 11 — RE-AUDIT FISIK PRA-TERBIT (Verifikasi Baca-Saja Gerbang 2 & Gerbang 3 Tanpa Menimpa SHA256SUMS):** Di dalam VM lokal—**sebelum mengunggah ke tag Rak Final**—eksekutor wajib menjalankan verifikasi baca-saja (**Gerbang 2 pada Bab 6.2** dan **Gerbang 3 pada Bab 6.3**). **PENTING:** Pada Tahap 11 ini, eksekutor **DILARANG membuat ulang/menimpa SHA256SUMS**; Gerbang 2 dan Gerbang 3 memverifikasi secara independen bahwa berkas fisik `.jsonl.gz`, berkas `SHA256SUMS` hasil Tahap 10, dan berkas `manifest.json` hasil Tahap 10 benar-benar cocok 100%. Jika ada satu saja pemeriksaan yang gagal, proses unggah dibatalkan.

12. **Tahap 12 — PUBLIKASI RESMI KE RAK FINAL & SINKRONISASI REPO (Titik Data Resmi Terbit):**

    Hanya setelah Tahap 11 mencetak `LULUS 100%`:

    1. **Unggah ke Tag Rak Final:** Unggah seluruh berkas `.jsonl.gz`, `manifest.json`, dan `SHA256SUMS` ke tag **`K-dataset-Indonesian`** atau **`R-dataset-english`**. **Tepat setelah unggahan ini selesai, korpus dinyatakan resmi terbit (published).**

    2. **Bersihkan Aset Penampungan yang Telah Dipromosikan:** Hapus berkas calon korpus yang sudah resmi masuk ke Rak Final dari tag `penampungan-Indonesian` / `penampungan-English`.

    3. **Commit Sinkronisasi ke Git Repo:** Perbarui angka riil terbaru di `docs/STATUS-KORPUS-LISENSI.md` dan `README.md` sesuai `manifest.json` Rak Final yang baru terbit.

# **6. SEGEL SHA-256 — TIGA GERBANG WAJIB (VERIFIKASI FISIK MANDIRI BEBAS TAUTOLOGI)**

Ketiga gerbang verifikasi kriptografis di bawah ini menggunakan perintah standar Linux dan Python 3 bawaan (*self-contained*, tanpa skrip eksternal). Pembuatan berkas `SHA256SUMS` (`sha256sum *.jsonl.gz > SHA256SUMS`) dilakukan pada **Tahap 8 dan Tahap 10**, sedangkan pada **Tahap 11 (Re-Audit)** perintah di bawah ini dijalankan dalam **mode verifikasi murni (baca-saja)** agar tidak terjadi tautologi:

## **6.1 Gerbang 1 — Segel Sumber Mentah (Source Ingestion Hash pada Tahap 1)**

```
# Perintah Gerbang 1: Mencatat segel hash arsip data mentah yang baru masuk
sha256sum raw_source_part*.tar.gz > source_raw.sha256
sha256sum -c source_raw.sha256
```

## **6.2 Gerbang 2 — Verifikasi Fisik 0 Baris JSON Terpotong & Kecocokan SHA256SUMS**

```
# 1. Verifikasi fisik: pastikan 0 baris JSON terpotong di seluruh berkas .jsonl.gz di direktori kerja
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

# 2. Verifikasi baca-saja checksum fisik terhadap berkas SHA256SUMS (tanpa menimpa SHA256SUMS)
sha256sum -c SHA256SUMS
```

## **6.3 Gerbang 3 — Verifikasi Fisik & Matematis Menyeluruh (`manifest.json` vs SHA256SUMS vs Berkas Fisik Disk)**

Jalankan skrip satu baris di bawah ini pada Tahap 11 sebelum mengunggah ke Rak Final. Skrip ini memeriksa:

1. Kesamaan 1:1 antara seluruh berkas `*.jsonl.gz` yang ada di disk dengan daftar berkas di `SHA256SUMS` dan `manifest.json` (mencegah adanya berkas `.jsonl.gz` yatim yang tidak tercatat di manifest);

2. Keabsahan lisensi terhadap 13 kode **Greenlist Bab 4.2** dan ketetapan `vocab_size == 32000`;

3. Ukuran byte fisik (`0 < actual_size <= 1.500.000.000` dan cocok dengan `size_bytes`) serta hash SHA-256 fisik;

4. Panjang karakter minimal setiap dokumen (`>= 200` untuk `K1–K3`/`R1–R3`, `>= 128` untuk `K4/R4`), jumlah dokumen fisik (`documents_count`), jumlah kata fisik (`tokens_word_count`), batas kewajaran fisik `tokens_bpe` (`actual_words <= tokens_bpe <= actual_utf8_bytes`), serta penjumlahan matematis `categories` dan `summary`:

```
# Perintah Gerbang 3: Verifikasi fisik menyeluruh .jsonl.gz di disk terhadap SHA256SUMS & manifest.json
python3 -c '
import glob, gzip, hashlib, json, os

ALLOWED_LICENSES = {
    "CC0-1.0", "Public-Domain", "CC-BY-4.0", "CC-BY-SA-4.0",
    "CC-BY-3.0", "CC-BY-SA-3.0", "MIT", "Apache-2.0",
    "BSD-2-Clause", "BSD-3-Clause", "ODC-By", "PDDL", "CDLA-Permissive-2.0"
}

with open("manifest.json", "r", encoding="utf-8") as fh:
    m = json.load(fh)

assert m.get("tokenizer", {}).get("vocab_size") == 32000, "vocab_size wajib 32000"

sums = {}
with open("SHA256SUMS", "r", encoding="utf-8") as sh:
    for line in sh:
        if line.strip():
            h, fn = line.strip().split(None, 1)
            sums[fn.lstrip("*")] = h

files = m["files"]
manifest_fns = [f["filename"] for f in files]
assert len(manifest_fns) == len(set(manifest_fns)), "Konflik nama berkas ganda di manifest!"
disk_fns = sorted(glob.glob("*.jsonl.gz"))
assert sorted(manifest_fns) == disk_fns, f"Himpunan berkas di disk ({disk_fns}) != manifest ({sorted(manifest_fns)})"
assert sorted(sums.keys()) == disk_fns, "Daftar berkas di SHA256SUMS != berkas di disk!"

for f in files:
    fn = f["filename"]
    cat = f["category"]
    min_len = 128 if cat in ("K4", "R4") else 200
    assert fn.endswith(".jsonl.gz"), f"Ekstensi tidak baku: {fn}"
    assert f.get("license") in ALLOWED_LICENSES, f"Lisensi tidak sah pada {fn}"
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
    actual_utf8_bytes = 0
    with gzip.open(fn, "rt", encoding="utf-8") as gf:
        for line in gf:
            obj = json.loads(line)
            txt = obj["text"].strip()
            assert len(txt) >= min_len, f"Dokumen di bawah {min_len} karakter pada {fn} (len={len(txt)})"
            actual_docs += 1
            actual_words += len(txt.split())
            actual_utf8_bytes += len(txt.encode("utf-8"))
    assert actual_docs == f["documents_count"], f"documents_count manifest != fisik ({actual_docs}) pada {fn}"
    assert actual_words == f["tokens_word_count"], f"tokens_word_count manifest != fisik ({actual_words}) pada {fn}"
    assert actual_words <= f["tokens_bpe"] <= actual_utf8_bytes, f"tokens_bpe di luar rentang fisik [kata..byte] pada {fn}"

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
print("LULUS 100%: SELURUH BERKAS FISIK DISK, SHA256SUMS, LISENSI, PANJANG KARAKTER, DAN MANIFEST.JSON VALID!")
'
```

# **7. PERINGATAN BAHAYA SKRIP USANG & SKEMA MANIFEST WAJIB**

## **7.1 Peringatan Kritis: Deprecating merge-korpus-manifest.py**

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

1. **Kondisi Eksisting:** Tokenizer resmi Rategoan (`raget/raget-neural/bpe-shell.js`, konstanta baku `VOCAB_SIZE = 32000` dengan pengkodean *byte-level BPE cased*) dioptimalkan untuk morfologi Bahasa Indonesia. Sesuai ketetapan **Bab 5 Tahap 5**, nilai `tokenizer.vocab_size` pada `manifest.json` selalu dikunci sebesar **`32000`**.

2. **Tantangan Teknis:** Jika teks bahasa Inggris teknis, medis, dan koding pada Rak R (PubMed, peS2o, StackExchange) ditokenisasi menggunakan kosakata yang didominasi Bahasa Indonesia, dapat terjadi fenomena **Token Fragmentation & Inflation** (~1,8x hingga 2,2x lebih banyak token dibanding tokenizer standar internasional). Hal ini perlu diperhitungkan agar jendela konteks (*context window*) dan throughput pelatihan tetap efisien.

## **8.2 Solusi Strategi Tokenizer Dua Arah**

1. **Solusi Fase A (Berlaku Saat Ini — Inflation-Budgeting pada vocab_size: 32000):** Menggunakan Tokenizer BPE resmi Rategoan (`vocab_size: 32000`) demi menjaga konsistensi dimensi layer embedding model saat ini, dengan menerapkan faktor normalisasi inflasi token (*token inflation factor*) pada budgeting batch DataLoader sehingga perbandingan volume informasi teks Inggris tetap akurat.

2. **Solusi Fase B (Arsitektur Jangka Panjang — Unified Bilingual Tokenizer 64k):** Melakukan ekspansi kosakata terencana menjadi 64.000 token (`vocab_size: 64000`, menambahkan token BPE dari korpus Rak R dan sintaksis pemrograman) pada generasi arsitektur berikutnya.

# **9. STANDARISASI ENAM NAMA TAG DAN NAMA ASET FILE (PENOMORAN SELARAS BAB 2)**

Seluruh rilis korpus di GitHub Releases wajib menggunakan **tepat 6 nama tag resmi** berikut (dengan penomoran Tag 1 s/d Tag 6 yang selaras 1:1 dengan diagram **Bab 2**), dan seluruh aset berkas partisi wajib menggunakan ekstensi **`.jsonl.gz`**:

## **9.1 Tingkat 1 — Data Baru / Mentah (Tag 1: `Data-baru-Indonesian` & Tag 2: `data-baru-English`)**

1. **Tag 1 (Data-baru-Indonesian):** Menampung seluruh arsip data mentah Bahasa Indonesia yang baru masuk sebelum diolah oleh pipeline Tahap 2.

2. **Tag 2 (data-baru-English):** Menampung seluruh arsip data mentah Bahasa Inggris yang baru masuk sebelum diolah oleh pipeline Tahap 2.

## **9.2 Tingkat 2 — Penampungan Calon Korpus (Tag 3: `penampungan-Indonesian` & Tag 4: `penampungan-English`)**

1. **Tag 3 (penampungan-Indonesian):**

   * `K1-calon-pengetahuan-part1.jsonl.gz` (dan seterusnya: `part2`, `part3`, ...)

   * `K2-calon-dialog-part1.jsonl.gz` (dan seterusnya...)

   * `K3-calon-pelengkap-part1.jsonl.gz` (dan seterusnya...)

   * `K4-calon-coding-part1.jsonl.gz` (dan seterusnya...)

2. **Tag 4 (penampungan-English):**

   * `R1-calon-pengetahuan-part1.jsonl.gz` (dan seterusnya...)

   * `R2-calon-dialog-part1.jsonl.gz` (dan seterusnya...)

   * `R3-calon-pelengkap-part1.jsonl.gz` (dan seterusnya...)

   * `R4-calon-coding-part1.jsonl.gz` (dan seterusnya...)

Disertai `manifest.json` dan `SHA256SUMS` tingkat penampungan. Menampung seluruh berkas calon korpus hasil Tahap 2–8 beserta hasil *reroute* lintas bahasa (Tahap 4) sebelum digabungkan secara lokal di VM (Tahap 10).

## **9.3 Tingkat 3 — Rak Final Bahasa Indonesia (Tag 5: `K-dataset-Indonesian`)**

Menyatukan seluruh aset K1, K2, K3, dan K4 yang telah lulus Tahap 11 dan resmi terbit di Tahap 12 ke dalam satu tag rilis terpadu berstandar mutu *textbook*:

* `K1-pengetahuan-part1.jsonl.gz` (dan seterusnya: `part2`, `part3`, ...)

* `K2-dialog-part1.jsonl.gz` (dan seterusnya...)

* `K3-pelengkap-part1.jsonl.gz` (dan seterusnya — wajib `.jsonl.gz`, bukan `.gzip`)

* `K4-coding-part1.jsonl.gz` (dan seterusnya...)

Disertai berkas pendamping wajib `manifest.json` dan `SHA256SUMS`.

## **9.4 Tingkat 3 — Rak Final Bahasa Inggris (Tag 6: `R-dataset-english`)**

Menyatukan seluruh aset R1, R2, R3, dan R4 yang telah lulus Tahap 11 dan resmi terbit di Tahap 12:

* `R1-pengetahuan-part1.jsonl.gz` (dan seterusnya...)

* `R2-dialog-part1.jsonl.gz` (dan seterusnya...)

* `R3-pelengkap-part1.jsonl.gz` (dan seterusnya...)

* `R4-coding-part1.jsonl.gz` (dan seterusnya...)

Disertai berkas pendamping wajib `manifest.json` dan `SHA256SUMS`.

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

Di mana `w_i` adalah bobot sampling domain tersebut dan `N_i` adalah jumlah total token pada partisi domain tersebut. Semakin besar jumlah token murni yang berhasil dikumpulkan pada suatu kamar, semakin kaya variasi data yang dipelajari model tanpa perlu mengulang dokumen yang sama.

## **10.4 Kurikulum Dua Tahap (Two-Stage Curriculum Learning)**

1. **Fase 1: Pembangunan Fondasi Nalar (80% Langkah Awal):** Rasio seimbang 50% K : 50% R untuk membentuk ruang representasi bersama (*shared latent space*), di mana model menyerap logika abstrak sains dan kode secara mendalam bersamaan dengan teks Indonesia.

2. **Fase 2: Indonesian Alignment & Annealing (20% Langkah Terakhir):** Rasio diubah dominan menjadi 75%–80% K : 20%–25% R dengan learning rate melandai (*cosine decay*) menggunakan partisi K1, K2, dan K4 terbaik. Fase ini mengunci preferensi model agar secara bawaan selalu merespons luwes dalam Bahasa Indonesia dengan tetap mempertahankan nalar sains yang telah diserap dari korpus R.

## **10.5 Evaluasi Cross-Lingual Reasoning Transfer**

Kriteria kelulusan model fondasi hasil pelatihan dual-korpus ini:

1. Mampu menerima prompt instruksi kompleks dalam Bahasa Indonesia mengenai domain sains lanjutan, kedokteran, atau algoritma perangkat lunak.

2. Mampu mengeksekusi rantai penalaran logis (*Chain-of-Thought*) berbasis pengetahuan yang diserap dari Rak R (PubMed, peS2o, StackExchange).

3. Mampu merumuskan sintesis jawaban akhir secara presisi, runtut, dan alami dalam Bahasa Indonesia baku (K).

# **11. STANDAR KETERANGAN RESMI SETIAP TAG (RELEASE NOTES)**

Keterangan berikut wajib dipasang pada deskripsi rilis masing-masing dari 6 tag resmi (selaras dengan urutan Tag 1 s/d Tag 6 pada Bab 2 dan Bab 9):

## **A. Keterangan pada Tag 1 & Tag 2: `Data-baru-Indonesian` & `data-baru-English`**

**Data Baru (Data Mentah — Tingkat 1)**

Tempat penampungan seluruh arsip data mentah yang baru masuk sebelum diolah melewati 5 Pemeriksaan Pagar (Bab 4.1) dan pipeline penyaringan mutu *textbook* (Bab 5 Tahap 2–8). Dilarang digunakan secara langsung oleh DataLoader pelatihan.

## **B. Keterangan pada Tag 3 & Tag 4: `penampungan-Indonesian` & `penampungan-English`**

**Penampungan (Calon Korpus — Tingkat 2)**

Berisi berkas calon korpus (`K1-calon` s/d `K4-calon` atau `R1-calon` s/d `R4-calon`) beserta `manifest.json` dan `SHA256SUMS` yang telah melewati ekstraksi, perbaikan deterministik (Bab 4.3), deduplikasi (Bab 5 Tahap 3), dan *reroute* bahasa (Bab 5 Tahap 4). Data di tag ini siap digabungkan secara lokal di VM (Tahap 10) dan menjalani re-audit fisik Gerbang 2 & Gerbang 3 (Tahap 11) sebelum diterbitkan ke Rak Final.

## **C. Keterangan pada Tag 5: `K-dataset-Indonesian`**

**K-dataset-Indonesian (Rak Final Mutu Textbook — Tingkat 3)**

Tag rilis produksi final untuk korpus bersih mutu *textbook* Bahasa Indonesia (token BPE `vocab_size: 32000`). Menyatukan seluruh aset korpus bersih yang terus bertambah seiring promosi calon korpus baru:

* `K1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan K1

* `K2-dialog-part*.jsonl.gz` : Aset dialog, penalaran, & regulasi formal K2

* `K3-pelengkap-part*.jsonl.gz` : Aset pelengkap K3

* `K4-coding-part*.jsonl.gz` : Aset kode sumber & rekayasa perangkat lunak K4

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi yang telah lulus verifikasi fisik Gerbang 2 & Gerbang 3.

## **D. Keterangan pada Tag 6: `R-dataset-english`**

**R-dataset-english (Rak Final Mutu Textbook — Tingkat 3)**

Tag rilis produksi final untuk korpus bersih mutu *textbook* Bahasa Inggris (token BPE `vocab_size: 32000`). Kategori aset dibuat simetris dengan Rak K:

* `R1-pengetahuan-part*.jsonl.gz` : Aset pengetahuan R1

* `R2-dialog-part*.jsonl.gz` : Aset riset akademik, sains, medis, & dialog R2

* `R3-pelengkap-part*.jsonl.gz` : Aset pemecahan masalah & pelengkap R3

* `R4-coding-part*.jsonl.gz` : Aset kode sumber & rekayasa perangkat lunak R4

Disertai berkas verifikasi integritas `SHA256SUMS` serta `manifest.json` resmi yang telah lulus verifikasi fisik Gerbang 2 & Gerbang 3.

# **12. KESIMPULAN & INTEGRITAS SISTEM**

Melalui standar **PRD RELEASE** ini:

1. **Satu Sumber Aturan Kanonik:** Setiap aturan teknis didefinisikan satu kali secara eksak (pohon keputusan kamar di Bab 2.2, 6 aturan pembersihan di Bab 4.3, parameter deduplikasi/bahasa/partisi di Bab 5, dan skrip verifikasi fisik bebas tautologi di Bab 6), sehingga mustahil ditafsirkan berbeda oleh dua AI eksekutor mana pun.

2. **Akumulasi Terbuka Tanpa Batas Atas:** Tidak ada pembatasan kuota maksimal pada kamar K1–K4 maupun R1–R4; seluruh kategori bebas mengumpulkan token *textbook* sebanyak-banyaknya dengan menyelamatkan dokumen sehat melalui perbaikan deterministik (*in-place repair*).

3. **Verifikasi Kriptografis & Fisik Mutlak:** Tiga Gerbang Segel SHA-256 memverifikasi langsung himpunan berkas fisik di disk, lisensi Greenlist, panjang karakter minimal, jumlah dokumen, jumlah kata, dan rentang token BPE sebelum satu byte pun diunggah ke Rak Final.

# **13. MANDAT KHUSUS EKSEKUTOR: EKSEKUSI PENYARINGAN, PERBAIKAN PARTISI EKSISTING, & PROMOSI PENAMPUNGAN (PRIORITAS P0)**

Eksekutor (**Grok Build / Manus AI / Dirigen**) wajib segera menjalankan tugas operasional P0 berikut dengan mematuhi definisi kanonik pada **Bab 2.2, Bab 4.3, Bab 5, dan Bab 6**:

1. **Alirkan Data-baru ke penampungan dan Promosikan penampungan ke Rak Final:**

   * Proses seluruh arsip mentah di `Data-baru-Indonesian` (Tag 1) dan `data-baru-English` (Tag 2) melewati **Tahap 2 s/d Tahap 8**, lalu diunggah pada **Tahap 9** ke `penampungan-Indonesian` (Tag 3) dan `penampungan-English` (Tag 4).

   * Gabungkan berkas calon korpus yang telah siap di `penampungan-Indonesian` (`K1-calon` s/d `K4-calon`) dan `penampungan-English` (`R1-calon` s/d `R4-calon`, termasuk mengubah nama berkas lama `textbook-en-part01.jsonl.gz` dan `textbook-en-part02.jsonl.gz` menjadi nama kanonik `R1-pengetahuan-part*.jsonl.gz`) bersama partisi Rak Final di lokal VM sesuai **Tahap 10**, jalankan verifikasi fisik **Tahap 11 (Gerbang 2 & Gerbang 3)**, lalu terbitkan ke `K-dataset-Indonesian` (Tag 5) dan `R-dataset-english` (Tag 6) sesuai **Tahap 12**.

2. **Tuntaskan Pembersihan Residu Partisi Eksisting Rak K Tanpa Membuang Dokumen Sehat:**

   * **`K3-pelengkap-part1.jsonl.gz`:** Jalankan **Bab 4.3 Aturan 4 & Aturan 6** (kupas substring URL dan kalimat ekor navigasi berita, pertahankan dokumen yang panjang bersihnya `>= 200` karakter).

   * **`K3-pelengkap-part3, part4, part5.jsonl.gz`:** Jalankan **Bab 4.3 Aturan 2 & Aturan 6** (buang dokumen spam judi dengan normalisasi anti-obfuscation, dan pulihkan kapitalisasi kalimat pada dokumen yang memenuhi rumus cacat *all-lowercase*).

   * **`K3-pelengkap-part2, part6, part7.jsonl.gz`:** Jalankan **Bab 4.3 Aturan 5** (buang dokumen yang memuat salah satu dari 9 frasa cacat ekstraksi tabel/OCR spesifik seperti `"no nan tahun"` atau `"peraturan menter!"` tanpa membuang dokumen sastra sehat yang memuat kata `"nan"`), lalu gabungkan dengan pasokan baru dari `penampungan-Indonesian`.

   * **`K1-pengetahuan-part2.jsonl.gz`:** Jalankan **Bab 5 Tahap 4** (pindahkan dokumen berbahasa Inggris `__label__en` dengan `prob >= 0.65` dan panjang `>= 200` karakter ke `R1-calon-pengetahuan-part*.jsonl.gz` pada tag `penampungan-English`).

   * **`K4-coding-part1.jsonl.gz` dan Seluruh Partisi:** Jalankan redaksi email header commit sesuai **Bab 4.3 Aturan 1**, terapkan perlindungan kode `K4/R4` sesuai **Bab 4.3 Aturan 2, 5, & 6** serta **Bab 5 Tahap 4**, pastikan ekstensi seluruh berkas adalah `.jsonl.gz` dengan ukuran `0 < size_bytes <= 1.500.000.000` byte pada batas baris utuh (`\n`) sesuai **Bab 5 Tahap 6–7**, hitung penuh token BPE riil `K4` ke dalam `manifest.json`, dan hapus rilis tag-tag usang di luar 6 tag resmi sesuai **Bab 2.3 Butir 3**.
