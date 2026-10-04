<!-- Sumber: Google Drive "PRD RELEASE" file 1OEC971gQC-T5sQREPAzU_Yl4nsnzu8kp8flQapZggr0, diubah 2026-10-04T04:54:07Z. Menggantikan salinan 3 Oktober. Bab 13 mewajibkan penyaringan Data baru menuju tag penampungan. -->

PRD RELEASE
Spesifikasi Standar Rilis Korpus Data, Tata Kelola Rak, Tata Nama Aset, Protokol Integritas, dan Strategi Pelatihan
Status: Standar Operasional Baku Sistem Rilis Data Rategoan
Berlaku Per: Oktober 2026

# 0. PEMBAGIAN PERAN KERJA & TITIK SERAH TERIMA (WORKER ROLES & HANDOFF)
Untuk memastikan disiplin operasional dan mencegah tabrakan eksekusi pada sistem rilis data, ditetapkan pembagian peran kerja yang tegas:
## 0.1 Claude (Perumus Arsitektur & Auditor Kualitas)
Kewenangan & Tanggung Jawab: Menyusun dokumen spesifikasi PRD, merancang skema taksonomi, menganalisis perbandingan data, mengaudit integritas skema manifest, memverifikasi kepatuhan terhadap preseden kasus, serta menyortir keterangan usang.
Batasan Mutlak: Claude secara teknis dibatasi aksesnya dari sistem penerbitan rilis. Claude DILARANG KERAS mempublikasikan aset rilis secara langsung ke tag rilis.
## 0.2 Grok Build / Manus AI / Dirigen (Eksekutor Produksi & Publisher)
Kewenangan & Tanggung Jawab: Mengeksekusi penyerapan benih data skala masif di lingkungan VM, menjalankan kompilasi sandbox, memilah partisi berkas, menjalankan kompresi, menghitung token BPE resmi, menyusun draf rilis, menandatangani hash SHA-256, dan mengeksekusi publikasi resmi (Publish Release) ke sistem rilis data.
## 0.3 Protokol Titik Serah Terima (Handoff Protocol)
Claude merumuskan dokumen PRD dan memverifikasi skema kelayakan data hingga 100% bebas anomali.
Naskah diserahterimakan kepada Grok Build, Manus AI, atau Dirigen.
Eksekutor menjalankan pipeline pengolahan berkas, pengemasan partisi, penandatanganan kriptografis, dan melakukan penerbitan rilis sesuai standar dokumen ini.

# 1. PENDAHULUAN & BATASAN RUANG LINGKUP
## 1.1 Tujuan Dokumen
Dokumen Product Requirements Document (PRD) ini menetapkan standar operasional baku berpresisi tinggi untuk:
Penataan struktur penempatan berkas data pada sistem rilis ke dalam 3 tingkatan (Data Baru, Penampungan, dan Rak Final K & R).
Penerapan checklist 'Pagar' untuk data baru, batasan lisensi yang diperbolehkan, serta larangan keras terhadap jenis data tertentu.
Standarisasi alur konversi data mentah menjadi token BPE resmi melalui 11 tahapan berurutan tanpa ambiguitas.
Penerapan Segel SHA256 Tiga Gerbang Wajib sebagai mekanisme utama pencegahan bentrok dan korupsi data.
Pencegahan penggunaan skrip penggabungan usang serta penetapan Skema Manifest Wajib (manifest.json).
Penyelesaian gap tokenizer untuk Korpus R (Bahasa Inggris) guna mengatasi risiko inflasi token.
Standarisasi format tata nama aset berkas rilis K1-K4 dan R1-R4 secara simetris dan teratur.
Format keterangan resmi (Release Notes) yang wajib dicantumkan pada setiap tag rilis.
Strategi pemanfaatan data pada tahap pelatihan (Training Strategy) dilengkapi formula matematis oversampling dan kurikulum dua tahap.
## 1.2 Batasan Mutlak Ruang Lingkup (Scope Boundaries)
KETENTUAN PASTI:
Dokumen ini KHUSUS MENGATUR TATA KELOLA DATA DI SISTEM RILIS.
Dokumen ini TIDAK MENGUBAH, TIDAK MENAMBAH ATURAN BARU, DAN TIDAK MENDEFINISIKAN ULANG ISI DARI K1, K2, K3, DAN K4.
Seluruh isi materi dan data K1, K2, K3, dan K4 tetap persis seperti yang sudah ada pada rilis saat ini (korpus bersih final terverifikasi 17+ Miliar token BPE).
2. ARSITEKTUR TIGA TINGKAT TAG RILIS (TIERED RELEASE SYSTEM)
# 3. PRESEDEN NYATA & SEJARAH ANOMALI SISTEM (LESSONS LEARNED)
Setiap aturan dan protokol ketat dalam PRD ini disusun berdasarkan insiden teknis nyata yang pernah terjadi pada proses rilis sebelumnya:
Insiden JDIH (Pemisahan Kamar Domain Mutlak):
Berkas pindaian dari JDIH (Jaringan Dokumentasi dan Informasi Hukum) hampir salah diklasifikasikan sebagai kandidat K4 koding. Kategori K4 dikunci mutlak hanya untuk domain ilmu komputer, algoritma, dan rekayasa perangkat lunak. Teks hukum, regulasi, dan kedinasan dikunci masuk ke domain dialog/formal (K2/K3).
Insiden K3 94% en-simple (Keputusan-014):
Partisi K3 sempat terinfiltrasi teks bahasa Inggris sederhana (en-simple) hingga mencapai 94% dari volume berkas, yang hampir mencemari kemurnian korpus nasional. Diterapkan ambang batas deteksi bahasa otomatis minimal 95% Bahasa Indonesia untuk seluruh jalur K. Seluruh materi berbahasa Inggris dipisahkan secara struktural ke jalur Rak R.
Insiden MADLAD-400 (Pensiun 8,1 Miliar Kata Akibat Sampah Web):
Sekitar 8,1 miliar kata dari dump korpus web publik MADLAD-400 terpaksa dipensiunkan (retired) secara massal karena audit pasca-unduh menemukan keberadaan spam SEO, teks mesin rusak, dan duplikasi tak terkendali. Seluruh data mentah wajib melewati gerbang pembersihan boilerplate dan deduplikasi MinHash LSH sebelum diizinkan masuk ke tahap penampungan calon korpus.
Bug Dual-Field Manifest (Insiden 2026-09-09):
Terjadi tabrakan skema metadata di mana berkas manifest memuat dua field token yang saling tumpang tindih dan dihitung dengan rumus berbeda, menyebabkan skrip dataloader training gagal membaca total token secara akurat. Skema manifest dibakukan secara tunggal (Bab 7) dan skrip penggabungan manifest lama dilarang keras untuk digunakan kembali.

Seluruh data diatur penempatannya melalui 3 tingkatan tag rilis berjenjang:

+-------------------------------------------------------------------------------+--------------+
|                       TINGKAT 1: DATA BARU (DATA MENTAH)                      |              |
|  Tag: Data baru Indonesian             |  Tag: data baru English              |              |
|  -> Tempat seluruh data mentah yang baru masuk/diunduh ditaruh di sini.       |              |
+---------------------------------------+---------------------------------------+--------------+
|                                                          |
v (Melewati pembersihan, filter pagar & ekstraksi)         |
+-------------------------------------------------------------------------------+--------------+
|                     TINGKAT 2: PENAMPUNGAN (CALON KORPUS)                     |              |
|  Tag: penampungan Indonesian           |  Tag: penampungan English            |              |
|  -> Seluruh data yang telah selesai disaring awal (berstatus Calon Korpus).   |              |
|  -> Ruang karantina untuk pengujian Quality Control (QC) tahap akhir.         |              |
+---------------------------------------+---------------------------------------+--------------+
|                                                          |
v (Lolos QC tahap akhir & segel manifest BPE)              |
+-------------------------------------------------------------------------------+--------------+
|                 TINGKAT 3: RAK FINAL TEXTBOOK (KORPUS BERSIH SIAP PAKAI)      |              |
|  Tag: K dataset Indonesian             |  Tag: R dataset english              |              |
|  -> Korpus bersih final token BPE      |  -> Korpus bersih final token BPE    |              |
|     kualitas mutu textbook Indonesia   |     kualitas mutu textbook English   |              |
|     (K1, K2, K3, K4 disatukan)         |     (R1, R2, R3, R4 disatukan)       |              |
+-------------------------------------------------------------------------------+--------------+
## 2.1 Peran dan Batas Tiap Tingkatan:
Tingkat 1 - Data Baru (Data baru Indonesian & data baru English): Pintu gerbang utama penampungan arsip mentah sebelum tersentuh pipeline pengolahan. Skrip pelatihan dilarang keras mengambil data langsung dari tingkat ini.
Tingkat 2 - Penampungan (penampungan Indonesian & penampungan English): Ruang karantina dan pengujian untuk berkas yang telah bersih dari tag markup/HTML dan berformat JSONL. Berstatus resmi sebagai Calon Korpus yang menunggu audit QC tahap akhir.
Tingkat 3 - Rak Final Mutu Textbook (K dataset Indonesian & R dataset english): Rak rilis produksi akhir yang berisi korpus bersih terverifikasi mutu textbook dengan token BPE yang telah dihitung akurat.
## 2.2 Aturan Operasional Aset Rilis & Manajemen Tag
Aturan Penggabungan vs Penggantian Aset:
Penambahan Volume Data: Unduh aset lama, gabung dengan data baru, jalankan deduplikasi MinHash, lalu unggah ulang di tag yang sama.
Data Baru Pengganti: Jika data baru merupakan revisi yang jauh lebih bersih dari sumber yang sama, aset lama ditimpa langsung di tag yang sama.
Aturan Partisi Berkas XL (>1,5 GB):
Berkas data yang berukuran besar wajib dipecah menjadi partisi bernomor (part1, part2, ...) agar selalu berada aman di bawah batas keras 2 GiB.
Protokol Retire / Hapus Tag Rilis Lama (Anti-Tag Menganggur):
Tag rilis lama yang seluruh isinya telah diserap ke dalam pack/rilis baru WAJIB dihapus rilisnya (retire release), tidak boleh dibiarkan menganggur. Seluruh rilis aktif di GitHub Releases harus dapat dipetakan 1:1 dengan struktur rak resmi.

# 4. CHECKLIST 'PAGAR' DATA BARU, ATURAN LISENSI, & LARANGAN KONTEN
## 4.1 Lima Gerbang Checklist 'Pagar'
Sebelum data baru diizinkan masuk ke pipeline pengolahan tingkat lanjut, data wajib melewati 5 gerbang audit pada checklist 'Pagar':
Pagar 1 — Pagar Lisensi (License Gate):
Verifikasi bahwa sumber data memiliki lisensi terbuka yang sah dan kompatibel dengan rilis model Rategoan.
Pagar 2 — Pagar Provenance / Asal-Usul (Provenance Gate):
Mencatat riwayat asal data secara presisi (URL asal, waktu pengambilan, metode scraping/dumping, dan hash arsip mentah).
Pagar 3 — Pagar Isolasi Sistem (Storage Isolation Gate):
Berkas data skala besar (gigabyte) dilarang keras di-commit ke branch kode sistem; seluruh data wajib diunggah ke sistem rilis data.
Pagar 4 — Pagar Format & Integritas (Format Integrity Gate):
Memastikan arsip mentah tidak rusak (bebas error CRC) dan dapat diekstrak secara konsisten tanpa kehilangan baris.
Pagar 5 — Pagar Sanitasi Awal (Initial Hygiene Gate):
Memastikan teks dapat didekodekan ke UTF-8 murni tanpa karakter pengganti rusak (\ufffd).
## 4.2 Ketentuan Lisensi Data (Allowed vs Prohibited Licenses)
Lisensi yang DIPERBOLEHKAN (Greenlist):
Public Domain / CC0: Lisensi bebas tanpa batasan hak cipta.
Creative Commons Permisif: CC-BY (Attribution), CC-BY-SA (ShareAlike).
Lisensi Software Permisif: MIT, Apache 2.0, BSD (2-Clause / 3-Clause).
Open Data Licenses: Open Data Commons Attribution (ODC-By), PDDL, CDLA-Permissive.
Lisensi yang DILARANG KERAS (Blacklist):
Lisensi Non-Komersial (NC): Seperti CC-BY-NC, CC-BY-NC-SA, CC-BY-NC-ND (karena membatasi hak pakai dan rilis terbuka model).
Hak Cipta Tertutup Tanpa Izin: Buku komersial berbayar bajakan, makalah ilmiah berbayar (paywalled) tanpa hak lisensi terbuka.
Lisensi dengan Klausul Anti-AI: Konten dari platform web yang melarang penggunaan data untuk pelatihan AI (AI training scraping prohibition).
## 4.3 Matriks Larangan Keras Konten Data (Data Blacklist)
Seluruh berkas calon korpus wajib dibersihkan dari 4 kategori konten terlarang:
PII (Personally Identifiable Information): NIK/KTP, nomor paspor, nomor telepon pribadi, alamat email personal non-publik, password, private key/kredensial API, riwayat medis personal yang tidak teranonimkan.
Konten Toksik & Ilegal: Ujaran kebencian ekstrem, materi pornografi anak/eksploitasi, instruksi pembuatan senjata/bahan peledak/zat kimia berbahaya.
Kontaminasi Tolok Ukur (Benchmark Contamination): Wajib dilakukan dekontaminasi berbasis n-gram dan MinHash terhadap set evaluasi standar (seperti HumanEval, MBPP, GSM8k, MMLU, ARC, IndoMMLU) agar hasil evaluasi model murni tanpa kebocoran data (data leakage). Modul dengan kesamaan n-gram tinggi terhadap set uji benchmark otomatis dibuang.
Sampah Web (Boilerplate & Noise): Pemberitahuan cookie (cookie consent banners), menu navigasi header/footer situs web, teks kesalahan (Error 404/500), teks hasil generate bot berkualitas rendah.

# 5. ALUR KHUSUS LENGKAP: RAW -> TOKEN BPE (11 TAHAPAN WAJIB)
Urutan ini adalah rumus baku operasional yang wajib dipatuhi secara berurutan, tidak boleh dibalik atau dilewati, guna menjawab secara pasti dan seragam bagaimana perhitungan data mentah menjadi token BPE resmi Rategoan:

[1. RAW] ──> [2. EXTRACT+CLEAN] ──> [3. DEDUPE] ──> [4. FILTER BAHASA] ──> [5. TOKENIZE BPE]
│
▼
[10. GABUNG KANONIK] <── [9. PUBLISH] <── [8. MANIFEST] <── [7. KOMPRESI] <── [6. CHUNK]
│
▼
[11. RE-AUDIT] ──> [12. SINKRONISASI REPO]
## Rincian 11 Tahapan Operasional:
Tahap 1 — RAW (Penerimaan Data Mentah):
Data mentah yang baru diunduh ditaruh pada tag rilis Data Baru (Data baru Indonesian atau data baru English).
Tahap 2 — EXTRACT + CLEAN (Ekstraksi & Pembersihan):
Mengekstrak teks murni, membuang tag HTML/XML/Markdown kotor, menormalisasi unicode (NFC), dan mengonversi format ke JSONL (1 baris fisik per dokumen: {"text": "..."}).
Tahap 3 — DEDUPE (Deduplikasi):
Menjalankan pembersihan duplikasi dokumen menggunakan hashing MinHash LSH (ambang kesamaan 0.85) untuk mengeliminasi salinan teks yang identik atau sangat mirip.
Tahap 4 — FILTER BAHASA (Penyaringan Bahasa):
Memvalidasi rasio bahasa menggunakan fastText/langdetect: minimal 95% Bahasa Indonesia untuk jalur K, dan minimal 95% Bahasa Inggris untuk jalur R.
Tahap 5 — TOKENIZE BPE (Tokenisasi BPE Resmi):
Teks ditokenisasi menggunakan Tokenizer BPE resmi Rategoan (vocab 30.368). Menghitung jumlah token riil vs token BPE terhitung. Tahap ini DIJAMIN seragam tanpa ada perbedaan rumus antar-tim atau agen pekerja.
Tahap 6 — CHUNK (Pemotongan Konteks Terstruktur):
Memotong dan mengelompokkan teks ke batas panjang konteks yang ditentukan (standar 126 token untuk chunking pendek atau batas konteks terstruktur bab utuh) tanpa memotong kalimat atau kata di tengah jalan.
Tahap 7 — KOMPRESI (Pengemasan Aset Rilis):
Mengompresi berkas ke format .jsonl.gz. Setiap berkas partisi dibatasi berukuran maksimal 1,35 GB – 1,5 GB agar selalu aman di bawah batas rilis 2 GiB.
Tahap 8 — TULIS MANIFEST (Penyusunan Manifest Awal):
Menghitung dan mencatat ringkasan token riil, token BPE, jumlah baris dokumen, serta ukuran byte dari setiap partisi berkas yang telah dikompresi.
Tahap 9 — PUBLISH (Rilis Sementara / Draft Stage):
Rilis draft dibuat terlebih dahulu di luar lingkungan rilis kanonik utama untuk verifikasi akhir sebelum disahkan.
Tahap 10 — GABUNG KE KANONIK (Integrasi Otomatis via Skrip):
Penggabungan ke rak rilis kanonik utama WAJIB dijalankan melalui skrip otomatis (DILARANG MANUAL). Skrip akan memverifikasi kecocokan manifest lama dan baru, memastikan tidak ada berkas partisi yang bertabrakan (anti-collision), dan mencetak manifest gabungan yang utuh.
Tahap 11 — RE-AUDIT (Audit Akhir):
Menjalankan prosedur audit menyeluruh (raget-audit) untuk mengonfirmasi bahwa seluruh berkas partisi, token BPE, dan segel checksum SHA-256 telah 100% tersinkronisasi.
Tahap 12 — SINKRONISASI REPOSITORI & LINGKUNGAN TRAINING:
Setiap kali token BPE bertambah, lokasi pembaruan diatur sebagai berikut:
1. Berkas Wajib yang Di-commit ke Git Repo:
docs/STATUS-KORPUS-LISENSI.md : Berada di folder docs/ di repo. Wajib diperbarui 1 baris per kategori (nama domain, lisensi, dokumen, byte, token riil, token BPE).
README.md : Berada di root repositori. Wajib diperbarui angka ringkasan total akumulasi token korpus.
2. Berkas Aset di GitHub Releases (Bukan di Git tree):
manifest.json / manifest-<kategori>.json dan SHA256SUMS : Diunggah langsung ke GitHub Releases sebagai aset pendamping berkas korpus (opsional disalin ke docs/manifests/ jika ingin dicatat di git).
Nilai total token BPE baru diumpankan ke parameter training / DataLoader untuk penyesuaian scheduler learning rate (cosine decay).3. Parameter di Lingkungan Training:

# 6. SEGEL SHA256 — TIGA GERBANG WAJIB (MEKANISME ANTI-BENTROK DENGAN PERINTAH SHELL PERSIS)
Untuk menjamin integritas data dan mencegah tabrakan data (data collision) antar-sesi rilis, diterapkan protokol Segel Kriptografis SHA-256 Tiga Gerbang dengan perintah shell baku:
## 6.1 Gerbang 1 — Segel Sumber (Source Ingestion Hash)
Setiap berkas data mentah yang diekstrak langsung dicatat hash SHA-256 aslinya:
# Perintah Gerbang 1: Pembuatan segel hash data mentah
sha256sum raw_source_part*.tar.gz > source_raw.sha256
## 6.2 Gerbang 2 — Segel Partisi Rilis (SHA256SUMS per Aset Rilis)
Setiap partisi berkas rilis .jsonl.gz dihitung hash fisiknya dan dicatat ke dalam berkas SHA256SUMS resmi rilis:
# Perintah Gerbang 2: Pembuatan daftar checksum rilis
sha256sum *.jsonl.gz > SHA256SUMS

# Perintah Verifikasi Wajib (sebelum rilis disahkan):
sha256sum -c SHA256SUMS
## 6.3 Gerbang 3 — Segel Manifest Kanonik (Canonical Manifest Anti-Collision Seal)
Saat penggabungan rilis (Tahap 10), hash seluruh partisi diverifikasi silang terhadap rilis kanonik sebelumnya. Penggabungan wajib menggunakan skrip verifikasi otomatis yang membatalkan operasi jika ada selisih hash atau konflik penamaan berkas:
# Perintah Gerbang 3: Verifikasi anti-bentrok penggabungan kanonik
python3 scripts/merge_canonical_manifest.py \
--new-manifest manifest_draft.json \
--canonical-manifest manifest_canonical.json \
--verify-sha256 SHA256SUMS \
--output manifest_canonical_updated.json

# 7. PERINGATAN BAHAYA SKRIP USANG & SKEMA MANIFEST WAJIB
## 7.1 Peringatan Kritis: Deprecating merge-korpus-manifest.py
PERINGATAN MERAH (CRITICAL SYSTEM WARNING):
Skrip lama bernama merge-korpus-manifest.py dinyatakan USANG, CACAT SKEMA, DAN BERBAHAYA UNTUK DIGUNAKAN.
Menjalankan skrip lama tersebut apa adanya akan menimpa berkas manifest kaya-informasi modern dengan skema lama yang terpotong, serta memicu kembali Bug Dual-Field Token (Insiden 2026-09-09).
Ketentuan Mutlak: Seluruh penggabungan manifest wajib menggunakan skrip baru (merge_canonical_manifest.py) yang sepenuhnya mendukung skema manifest baku di bawah ini.
## 7.2 Skema Manifest Baku (manifest.json)
Setiap paket rilis pada rak final wajib menyertakan berkas manifest.json yang mengikuti skema baku berikut:

{
"release_tag": "K dataset Indonesian",
"version": "1.0.0",
"language": "id",
"created_at": "2026-10-03T01:20:00Z",
"tokenizer": {
"name": "rategoan-bpe",
"vocab_size": 30368,
"encoding_type": "byte-level-bpe"
},
"summary": {
"total_partitions": 12,
"total_documents": 8450200,
"total_tokens_bpe": 17420500120,
"total_tokens_word_count": 12150300400,
"total_compressed_bytes": 16420500120,
"total_uncompressed_bytes": 52140800340,
"sha256_sealed": true
},
"categories": {
"K1": { "label": "pengetahuan", "partitions": 3, "tokens_bpe": 6200000000 },
"K2": { "label": "dialog", "partitions": 3, "tokens_bpe": 4500000000 },
"K3": { "label": "pelengkap", "partitions": 3, "tokens_bpe": 3200000000 },
"K4": { "label": "coding", "partitions": 3, "tokens_bpe": 3520500120 }
},
"files": [
{
"filename": "K1-pengetahuan-part1.jsonl.gz",
"category": "K1",
"sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
"size_bytes": 1420500120,
"documents_count": 680200,
"tokens_bpe": 1820500120,
"tokens_word_count": 1280300400,
"license": "CC-BY-4.0"
}
]
}

# 8. STRATEGI TOKENIZER RAK R (PENYELESAIAN GAP TOKENIZER GLOBAL)
## 8.1 Analisis Masalah: Keterbatasan Tokenizer BPE 30k terhadap Teks Inggris
Kondisi Eksisting: Tokenizer resmi Rategoan saat ini memiliki ukuran kosakata (vocabulary) sebesar 30.368 token yang dilatih murni dari korpus Bahasa Indonesia.
Tantangan Teknis: Jika teks bahasa Inggris teknis, medis, dan koding pada Rak R (PubMed, peS2o, StackExchange) ditokenisasi secara mentah menggunakan tokenizer Indonesia 30k ini, akan terjadi fenomena Token Fragmentation & Inflation parah (~1,8x hingga 2,2x lebih banyak token dibanding tokenizer standar internasional seperti cl100k atau Llama-3). Hal ini menyebabkan pemborosan jendela konteks (context window) dan penurunan throughput pelatihan.
## 8.2 Solusi Strategi Tokenizer Dua Arah:
Solusi Fase A (Transisi / Jangka Pendek — Inflation-Budgeting):
Tetap menggunakan Tokenizer BPE 30.368 demi menjaga konsistensi arsitektur embedding model saat ini, namun pada pelaporan manifest dan budgeting batch training diterapkan faktor normalisasi inflasi token (token inflation factor) sehingga perbandingan volume informasi teks Inggris tetap adil.
Solusi Fase B (Arsitektur Matang / Jangka Panjang — Unified Bilingual Tokenizer 64k):
Melakukan ekspansi kosakata terencana dari 30.368 menjadi 64.000 token (menambahkan 33.632 token BPE yang diserap dari korpus Rak R dan sintaksis bahasa pemrograman dunia). Solusi ini menghasilkan efisiensi kompresi tinggi yang seimbang antara Bahasa Indonesia dan Bahasa Inggris tanpa merusak token bahasa Indonesia yang sudah ada.

# 9. STANDARISASI NAMA TAG DAN NAMA ASET FILE
## 9.1 Poros Bahasa Indonesia (Tag: K dataset Indonesian)
Menyatukan seluruh aset K1, K2, K3, dan K4 ke dalam satu tag rilis terpadu (isi materi tetap sama persis seperti rilis saat ini, 17+ Miliar token BPE).
Format nama aset berkas:
K1-pengetahuan-part1.jsonl.gz (dan seterusnya...)
K2-dialog-part1.jsonl.gz (dan seterusnya...)
K3-pelengkap-part1.gzip (dan seterusnya...)
K4-coding-part1.jsonl.gz (dan seterusnya...)
## 9.2 Poros Bahasa Inggris (Tag: R dataset english)
Format nama aset berkas:
R1-pengetahuan-part1.jsonl.gz (dan seterusnya...)
R2-dialog-part1.jsonl.gz (dan seterusnya...)
R3-pelengkap-part1.jsonl.gz (dan seterusnya...)
R4-coding-part1.jsonl.gz (dan seterusnya...)
## 9.3 Tingkat Penampungan (Tag: penampungan Indonesian & penampungan English)
Menampung seluruh berkas calon korpus hasil saringan awal.
Menunggu QC tahap akhir sebelum dipindahkan ke rak final K atau R.
## 9.4 Tingkat Data Baru (Tag: Data baru Indonesian & data baru English)
Menampung seluruh data mentah yang baru masuk ke sistem rilis data.

# 10. STRATEGI PELATIHAN DUAL-KORPUS DENGAN FORMULA MATEMATIS
## 10.1 Filosofi Dual-Engine
Korpus K (Identity Engine): Menjamin keluwesan alami, kepatuhan tata bahasa (PUEBI/KBBI), pemahaman konteks sosial-budaya Indonesia, sastra, hukum, dan regulasi nasional.
Korpus R (Reasoning Engine): Menjadi motor nalar logika, pemecahan masalah algoritma/coding, serta wawasan sains dan riset medis global.

## 10.2 Rasio Campuran Data (Data Mixing Ratio)
Skrip pengumpan data (DataLoader) saat pelatihan mengatur bobot sampling:
Korpus K (Bahasa Indonesia) — 55% hingga 60%:
K1 (Pengetahuan): 20%
K2 (Dialog): 15%
K3 (Pelengkap): 10%
K4 (Coding ID): 10% – 15%

Korpus R (Bahasa Inggris) — 40% hingga 45%:
R1 (Pengetahuan Global): 10%
R2 (Sains, Medis, & Riset Akademik): 15%
R3 (Problem Solving & Technical Q&A): 10%
R4 (Coding & Systems EN): 10%

## 10.3 Formula Matematis Oversampling & Sampling Probability
Untuk kategori korpus bernilai nalar tinggi yang ukuran datanya lebih kecil daripada alokasi target tokennya (misalnya K4 coding atau R3 problem solving), diterapkan formula oversampling deterministik:
repeat_factor = ceil(Target_Tokens / Source_Tokens)
Di tingkat DataLoader, probabilitas penarikan batch dokumen dari setiap domain i dihitung berdasarkan bobot campuran terstandarisasi:
P(Domain_i) = (w_i * N_i) / sum_j(w_j * N_j)
Di mana w_i adalah bobot target domain tersebut dan N_i adalah jumlah total token pada partisi domain tersebut.

## 10.4 Kurikulum Dua Tahap (Two-Stage Curriculum Learning)
Fase 1: Pembangunan Fondasi Nalar (80% Langkah Awal):
Rasio seimbang 50% K : 50% R untuk membentuk ruang representasi bersama (shared latent space), di mana model menyerap logika abstrak sains dan kode secara mendalam bersamaan dengan teks Indonesia.
Fase 2: Indonesian Alignment & Annealing (20% Langkah Terakhir):
Rasio diubah dominan menjadi 75%–80% K : 20%–25% R dengan learning rate melandai (cosine decay) menggunakan partisi K2 dan K4 terbaik. Fase ini mengunci preferensi model agar secara bawaan selalu merespons luwes dalam Bahasa Indonesia dengan tetap mempertahankan nalar sains yang telah diserap dari korpus R.
## 10.5 Evaluasi Cross-Lingual Reasoning Transfer
Kriteria kelulusan model fondasi hasil pelatihan dual-korpus ini:
Mampu menerima prompt instruksi kompleks dalam Bahasa Indonesia mengenai domain sains lanjutan, kedokteran, atau algoritma perangkat lunak.
Mampu mengeksekusi rantai penalaran logis (Chain-of-Thought) berbasis pengetahuan yang diserap dari Rak R (PubMed, peS2o, StackExchange).
Mampu merumuskan sintesis jawaban akhir secara presisi, runtut, dan alami dalam Bahasa Indonesia baku (K).

# 11. STANDAR KETERANGAN RESMI SETIAP TAG (RELEASE NOTES)
Keterangan berikut wajib dipasang pada deskripsi rilis masing-masing tag:
## A. Keterangan pada Tag: K dataset Indonesian
K dataset Indonesian

Tag rilis final untuk korpus bersih mutu textbook Bahasa Indonesia (token BPE).
Menyatukan seluruh aset korpus bersih ke dalam satu rak rilis terpadu dengan isi tetap sama seperti rilis saat ini:
- K1-pengetahuan-part*.jsonl.gz : Aset pengetahuan K1
- K2-dialog-part*.jsonl.gz : Aset dialog K2
- K3-pelengkap-part*.gzip : Aset pelengkap K3
- K4-coding-part*.jsonl.gz : Aset coding K4

Disertai berkas verifikasi integritas SHA256SUMS serta manifest-kategori.json / manifest.json resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.
## B. Keterangan pada Tag: R dataset english
R dataset english

Tag rilis final untuk korpus bersih mutu textbook Bahasa Inggris (token BPE).
Kategori aset dibuat sama persis dengan K untuk materi berbahasa Inggris:
- R1-pengetahuan-part*.jsonl.gz : Aset pengetahuan R1
- R2-dialog-part*.jsonl.gz : Aset dialog R2
- R3-pelengkap-part*.jsonl.gz : Aset pelengkap R3
- R4-coding-part*.jsonl.gz : Aset coding R4

Disertai berkas verifikasi integritas SHA256SUMS serta manifest-kategori.json / manifest.json resmi berstandar segel kriptografis yang selalu ikut diunggah sebagai aset pendamping di rilis yang sama.
## C. Keterangan pada Tag: penampungan Indonesian & penampungan English
Penampungan (Calon Korpus)

Berisi seluruh data yang sudah melewati proses penyaringan awal dan telah menjadi calon korpus.
Data di tag ini disiapkan untuk menjalani Quality Control (QC) tahap akhir sebelum dimasukkan ke rak final K dataset Indonesian / R dataset english.
## D. Keterangan pada Tag: Data baru Indonesian & data baru English
Data Baru (Data Mentah)

Tempat penampungan seluruh data mentah yang baru masuk sebelum masuk ke tahapan pemrosesan dan penyaringan.

# 12. KESIMPULAN & INTEGRITAS SISTEM
Melalui standar PRD RELEASE yang telah disempurnakan ini:
Disiplin Pembagian Peran: Claude bertanggung jawab atas arsitektur dan audit, sedangkan Grok, Manus AI, dan Dirigen memegang otoritas penuh eksekusi penerbitan rilis.
Belajar dari Sejarah: Sistem memitigasi terulangnya anomali JDIH, infiltrasi bahasa K3, sampah web MADLAD-400, dan bug dual-field manifest.
Penyelesaian Gap Tokenizer: Strategi dua tahap disiapkan untuk mengatasi inflasi token bahasa Inggris pada Rak R.
Verifikasi Kriptografis Mutlak: Segel SHA-256 Tiga Gerbang menjamin tidak ada tabrakan berkas partisi maupun korupsi manifest kanonik.
Keseimbangan Dua Poros: Kualitas korpus Bahasa Indonesia K (17+ Miliar token BPE) terlindungi 100% murni, sementara korpus Bahasa Inggris R hadir sebagai mesin penalaran sains global.

# 13. MANDAT KHUSUS EKSEKUTOR: PERCEPATAN & PENEGASAN STATUS PIPELINE PENYARINGAN RILIS DATA (CALL TO ACTION GROK BUILD / MANUS)
## 13.1 Latar Belakang Teguran & Evaluasi Mandeknya Pipeline Penyaringan
Audit per Oktober 2026 menemukan bahwa belum ada pergerakan sama sekali pada pipeline pemrosesan dan penyaringan berkas data mentah. Aset data mentah yang telah dihimpun pada tingkat Data baru Indonesian dan data baru English masih mengendap tanpa eksekusi penyaringan menuju tingkat penampungan Indonesian dan penampungan English. Hal ini menghambat pencapaian target korpus dan menunda kesiapan data latih.
## 13.2 Status Prioritas P0 (Critical Operational Blocker)
Ditegaskan secara mutlak kepada agen eksekutor produksi (Grok Build, Manus AI, dan Dirigen):
Dilarang Membiarkan Data Mengendap: Berkas mentah yang berada di tag Data baru Indonesian dan data baru English WAJIB SEGERA dieksekusi pemrosesan dan penyaringannya.
Eksekusi 4 Gerbang Penyaringan Inti (Tahap 2 s/d Tahap 4):
Gerbang Ekstraksi & Sanitasi: Mengupas teks murni, membuang tag HTML/XML, boilerplate web, dan karakter rusak (\ufffd).
Gerbang Deduplikasi (MinHash LSH 0.85): Mengeliminasi dokumen duplikat dan variasi spam web.
Gerbang Validasi Bahasa: Memverifikasi kepatuhan rasio bahasa minimal 95% Bahasa Indonesia murni untuk jalur K, dan minimal 95% Bahasa Inggris untuk jalur R.
Gerbang Pembersihan PII & Toksisitas: Menghapus nomor identitas, kredensial pribadi, dan teks toksik.
Penerbitan Bertahap ke Tag Penampungan:
Setiap berkas mentah yang lolos 4 gerbang penyaringan di atas WAJIB langsung dikompresi (.jsonl.gz, partisi 1,35–1,5 GB), disegel SHA-256, dan diterbitkan secara resmi ke tag rilis:
- penampungan Indonesian (untuk calon korpus K)
- penampungan English (untuk calon korpus R)
Pelaporan Kemajuan Progresif:
Eksekutor wajib mencatat kemajuan volume dokumen, ukuran byte, dan estimasi token hasil saringan dalam log eksekusi agar pergerakan pipeline transparan dan terukur secara berkala.
