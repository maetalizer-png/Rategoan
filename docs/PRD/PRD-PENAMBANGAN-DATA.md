<!-- Sumber: Google Drive "penambangan data" file 1k233ru32HTG3NcZi5W_qOSr2aruJ11pKeQVlbxZyn6I, diubah 2026-10-04T11:51:22Z. Aset yang sama di tag prd-data-release. -->

PRD PENAMBANGAN & SINTESIS DATA SKALA BESAR: CETAK BIRU OPERASIONAL MANUS AI
(Autonomous Deep Research, Recursive Web Scraping & Big Data Mining Blueprint)
Dokumen Spesifikasi Kebutuhan Produk (PRD) ini merupakan standar operasional definitif untuk pelaksanaan akuisisi data, pemrosesan teks, dan sintesis korpus berskala industri. Dokumen dirancang agar dapat dieksekusi secara otonom penuh oleh sistem agen cerdas Manus AI tanpa memerlukan supervisi manusia berkala.

# BAB 1: RINGKASAN EKSEKUTIF & ARSITEKTUR MISI
## 1.1 Latar Belakang & Urgensi
Pengembangan ekosistem AI Rategoan—mencakup arsitektur Retrieval-Augmented Generation (RAG) lokal, mesin penalaran domain, dan Model Bahasa Besar (LLM) dwibahasa—membutuhkan fondasi data yang masif, bersih, dan berbobot tinggi. Keterbatasan dataset publik yang kerap dipenuhi noise, duplikasi, dan format tidak konsisten menjadi hambatan utama. Misi ini menetapkan standar akuisisi data mentah skala besar (High-Throughput Raw Acquisition) untuk menyedot korpus pengetahuan global berbahasa Inggris dan Bahasa Indonesia baku sebanyak-banyaknya secara cepat dan efisien.
## 1.2 Visi Operasional
Mewujudkan pipa pemrosesan data mandiri ujung-ke-ujung (end-to-end pipeline) yang digerakkan oleh agen otonom Manus AI dengan fokus murni pada Penyedotan Data Mentah Skala Besar (High-Throughput Raw Data Ingestion). Agen bertugas melakukan eksplorasi web secara mendalam, mengekstrak data mentah sebanyak-banyaknya dengan kecepatan tinggi, serta menyusun data ke dalam pembungkusan/partisi mentah yang ringan (lightweight packaging) untuk langsung diunggah ke tag rilis Tingkat 1 (Data Baru). Pembersihan mendalam, tokenisasi, deduplikasi berat, dan kurasi sepenuhnya dialihkan ke pipeline pengolahan di Tingkat 2 (Penampungan) dan Tingkat 3 (Rak K & R) sesuai standar PRD RELEASE.
## 1.3 Karakteristik Pokok Sistem
Otonom Penuh: Mampu mengambil keputusan navigasi, eksplorasi URL, dan mitigasi kendala jaringan tanpa intervensi manusia.
Perayapan Dual-Engine: Mengombinasikan cURL/HTTP stream cepat untuk dokumen statis dan Headless Browser (Playwright) untuk web modern dinamis.
Toleransi Kegagalan Tinggi (Self-Healing): Menerapkan mekanisme pemulihan mandiri terhadap kegagalan koneksi, pembatasan akses (rate limiting HTTP 429), dan proteksi situs.
Efisiensi Biaya & Komputasi (Zero API-Cost & High-Throughput): Mengutamakan penambangan sumber daya terbuka (Open Access) dan eksekusi cepat tanpa membuang daya komputasi pada pembersihan berat atau perhitungan skor kualitas yang mempeberat throughput.
Luaran Terstandarisasi: Menghasilkan partisi terkompresi berukuran besar (400 MB – 1.5 GB) yang siap pakai untuk rilis publik.

# BAB 2: PROTOKOL MANDAT EKSEKUSI OTONOM MANUS
## 2.1 Filosofi "Execute in Silence"
Untuk menjaga efisiensi ruang konteks (context window) dan memastikan fokus penuh pada pemrosesan data, Manus AI diwajibkan beroperasi di bawah prinsip Execute in Silence. Sistem dilarang mengirimkan pesan obrolan perantara, pertanyaan konfirmasi skala kecil, atau laporan kemajuan parsial selama proses berlangsung. Seluruh log internal dan penanganan error dikelola mandiri hingga seluruh target terpenuhi.
## 2.2 Master Directive / Perintah Baku Siap Salin untuk Manus AI

[MANDAT EKSEKUSI PENUH: MANUS HIGH-THROUGHPUT RAW DATA INGESTION]

PERAN & OTORITAS:
Anda bertindak sebagai Lead Data Acquisition Engineer Otonom untuk Ekosistem AI Rategoan. Tugas utama Anda adalah menyedot data mentah sebanyak-banyaknya (High-Throughput Raw Acquisition), mengejar volume, kecepatan, dan cakupan domain global (English & Indonesian). Pembersihan mendalam (seperti tokenisasi BPE, MinHash deduplication berat, dekontaminasi benchmark, dan kurasi) BUKAN tugas Anda di tahap ini, melainkan tugas pipeline pengolahan di Tingkat 2 (Penampungan) dan Tingkat 3 (Rak K & R) sesuai PRD RELEASE.

FASE 0: AUDIT INVENTARIS ASET RILIS EKSISTING (WAJIB SEBELUM CRAWLING):
1. SEBELUM MENYEDOT DATA SATU BIT PUN, BACA & PERIKSA SELURUH ASET DI SEMUA TIER RELEASE:
- Tingkat 1 (Data Baru): tag "Data baru Indonesian" & "data baru English"
- Tingkat 2 (Penampungan): tag "penampungan Indonesian" & "penampungan English"
- Tingkat 3 (Rak Final): tag Rak K ("K1", "K2", "K3", "K4") & Rak R ("R1", "R2", "R3", "R4")
- Baca file manifest.json dan release notes pada tag rilis untuk mengidentifikasi dataset yang sudah pernah diambil.
2. SUSUN DAFTAR PENGECUALIAN (EXCLUSION LIST):
- Kunci semua domain/dataset yang sudah ada ke dalam memori kerja sebagai daftar terlarang.
- DILARANG KERAS menambang atau memproses ulang data yang sudah ada di Release!
- HANYA cari dan tambang data yang 100% BARU dan belum ada di sistem rilis.

ULTIMATUM TATA KELOLA TAG RILIS & KELAYAKAN DASAR:
1. BACA & PATUHI PRD RELEASE:
https://docs.google.com/document/d/1OEC971gQC-T5sQREPAzU_Yl4nsnzu8kp8flQapZggr0/edit
2. RUTE TAG RILIS WAJIB:
- Seluruh data mentah baru Bahasa Indonesia WAJIB masuk HANYA ke: "Data baru Indonesian"
- Seluruh data mentah baru Bahasa Inggris WAJIB masuk HANYA ke: "data baru English"
- DILARANG mengunggah ke Penampungan apalagi ke Rak Final K dan Rak Final R!
3. Pagar Kelayakan Dasar: Hanya ambil lisensi GREENLIST (CC0, CC-BY, MIT, Apache 2.0, BSD, ODC-By) dan pastikan teks terbaca (bukan biner korup/gambar kosong). DILARANG KERAS mengambil lisensi Non-Komersial (CC-BY-NC) atau situs ber-klausul Anti-AI.

ALUR KERJA MURNI PENYEDOT DATA (SIKLUS EPHEMERAL SEDOT MENTAH 50–100 GB):
1. Mode Operasi: Latar belakang senyap (silent background), durasi 120–300 menit (2–5 jam nonstop). DILARANG mengirimkan obrolan basa-basi atau laporan parsial di tengah jalan.
2. Siklus Ephemeral Sedot Mentah:
- Sedot data mentah BARU sebanyak mungkin dari allowlist domain (target 50–100 GB).
- Lakukan pembungkusan/partisi mentah yang ringan (400 MB s.d. 1.5 GB per file, misal: raw_en_stem_part_001.tar.gz atau .jsonl.gz) tanpa membuang komputasi pada pembersihan berat.
- Tembak langsung ke tag Tingkat 1 (Data Mentah):
* Data ID: gh release upload "Data baru Indonesian" <file> --clobber
* Data EN: gh release upload "data baru English" <file> --clobber
- Hapus berkas lokal (rm -f <file>) segera setelah terunggah agar disk sandbox tetap kosong.
- Ulangi siklus ini secara berkesinambungan selama 2 s.d. 5 jam nonstop.
3. Laporan Akhir Tunggal:
Hanya berikan SATU laporan eksekutif di akhir sesi setelah seluruh partisi mentah berhasil diunggah dan manifest rilis selesai dibuat.
## 2.3 Rangkuman Ultimatum Kepatuhan PRD RELEASE
Sebelum memulai eksekusi penyedotan data mentah, agen wajib memastikan kepatuhan mutlak terhadap 3 pilar kelayakan dasar:
Pagar Lisensi: Menolak seluruh sumber berlisensi Non-Komersial (NC) atau platform yang melarang perayapan untuk pelatihan kecerdasan buatan.
Pagar Kelayakan dasar & Teks Terbaca: Memastikan teks dapat dibaca (bukan file biner korup atau gambar kosong) tanpa terbebani tugas pembersihan mendalam.
Pagar Isolasi Tag: Mengunci pengunggahan data baru hanya pada tag rilis Tingkat 1 (Data baru Indonesian dan data baru English).

# BAB 3: TAKSONOMI & TARGET DOMAIN PENAMBANGAN DATA
Penambangan data dialokasikan ke dalam 6 pilar domain utama untuk menjamin keseimbangan antara kedalaman teknis global dan kekayaan wacana nasional:

## 1. Domain DOM-01: STEM & Rekayasa Kecerdasan Buatan (Bahasa Inggris)
Cakupan Materi: Arsitektur LLM, Retrieval-Augmented Generation (RAG), fisika terapan, komputasi kuantum, algoritma, telekomunikasi, sistem terdistribusi.
Allowlist Seed URLs: arXiv.org, paperswithcode.com, huggingface.co/papers, en.wikipedia.org/wiki/Portal:Science.
Format Target: PDF ilmiah open-access, dokumen HTML jurnal, dan repositori riset terbuka.
## 2. Domain DOM-02: Matematika Lanjutan & Logika Formal (Bahasa Inggris)
Cakupan Materi: Kalkulus multivariabel, aljabar linear, probabilitas & statistik, logika simbolik, teori graf, filsafat sains.
Allowlist Seed URLs: open.mit.edu (MIT OpenCourseWare), plato.stanford.edu (Stanford Encyclopedia of Philosophy).
Format Target: Diktat kuliah perguruan tinggi, modul teorema, dan publikasi akademis terverifikasi.
## 3. Domain DOM-03: Dokumentasi Perangkat Lunak & Rekayasa Kode (Bahasa Inggris)
Cakupan Materi: Dokumentasi resmi framework modern, manual referensi bahasa (Python, Rust, JavaScript/TypeScript, Go), web specifications, RFC standar, kurasi Q&A teknis.
Allowlist Seed URLs: developer.mozilla.org (MDN), docs.python.org, doc.rust-lang.org, github.com (README, Wiki, RFC resmi).
Format Target: Markdown mentah, dokumentasi teknis HTML, dan spesifikasi API resmi.
## 4. Domain DOM-04: Bahasa Indonesia Baku & Linguistik (Bahasa Indonesia)
Cakupan Materi: Tata bahasa formal (EYD V, PUEBI), morfologi, leksikografi, semantik, analisis wacana akademik, korpus kebahasaan baku.
Allowlist Seed URLs: badanbahasa.kemdikbud.go.id, kamus linguistik resmi, jurnal tata bahasa nasional.
Format Target: Artikel kebahasaan baku, publikasi ilmiah linguistik, dan glosarium istilah resmi.
## 5. Domain DOM-05: Humaniora, Tata Negara & Sosial-Budaya (Bahasa Indonesia)
Cakupan Materi: Sejarah kepulauan nusantara, perundang-undangan dan konstitusi Indonesia, sosiologi, kebudayaan daerah, studi kebijakan publik.
Allowlist Seed URLs: jdih.kemenkeu.go.id (dan jaringan JDIH kementerian resmi), repositori perpustakaan nasional, jurnal sosial-politik terakreditasi.
Format Target: Dokumen regulasi resmi teks digital, arsip sejarah terverifikasi, dan monograf sosial.
## 6. Domain DOM-06: Pendidikan Tinggi & Ensiklopedis Terverifikasi (Bilingual)
Cakupan Materi: Bahan ajar terstruktur perguruan tinggi, modul sains terkurasi, ensiklopedia terbuka terverifikasi.
Allowlist Seed URLs: Repositori Open Access perguruan tinggi Indonesia (UI, ITB, UGM, ITS), portal buku Kemdikbud (kemdikbud.go.id/buku-kemdikbud), id.wikipedia.org.
Format Target: Buku teks elektronik legal, materi ajar universitas terbuka, dan artikel ensiklopedis berkualitas tinggi.

# BAB 4: METODOLOGI PERAYAPAN & REKURSIVITAS
## 4.1 Alur Pemrosesan Perayapan (Pipeline Flow)
Proses penelusuran data dirancang mengalir melalui 5 tahapan berurutan:
Tahap Input: Menerima seed URLs terverifikasi sesuai taksonomi Bab 3.
Tahap Filtering: Memvalidasi domain allowlist, kepatuhan robots.txt, dan mengecek daftar pengecualian (Exclusion List).
Tahap Dual-Engine Fetcher: Mengarahkan rute pengambilan teks ke Fast Stream Engine (untuk teks statis) atau Headless Browser (untuk aplikasi berbasis JavaScript dinamis).
Tahap Document Parser: Mengurai format HTML via parser Readability, PDF via penataan layout teks, atau Markdown murni.
Tahap Main-Text Extractor: Memisahkan konten teks inti dari elemen dekoratif, navigasi, dan iklan.
## 4.2 Strategi Ekstraksi Teks Bersih
Mesin perayap wajib memisahkan konten substantif dari elemen bising halaman web menggunakan algoritma Content-Density. Komponen berikut wajib dibuang:
Bilah navigasi, header situs, footer, dan sidebar menu.
Spanduk iklan, pop-up promosi, dan widget jejaring sosial.
Kotak persetujuan cookie (cookie banners) dan kolom komentar publik.
Skrip pelacak analitik, stylesheet CSS inline, dan markup dekoratif.
## 4.3 Protokol Pemulihan Mandiri Jaringan
Penanganan Rate-Limiting (HTTP 429/503): Terapkan jeda Exponential Backoff otomatis (2 detik, 4 detik, 8 detik, hingga 16 detik) sebelum mencoba kembali atau beralih ke mirror domain.
Deteksi Hambatan Akses (CAPTCHA / Paywall): Langsung tinggalkan URL tersebut tanpa mencoba membobol, catat ke berkas log kesalahan, dan lanjutkan penelusuran ke antrean tautan berikutnya.
Deteksi Tautan Rusak (Broken Links / Error 404): Lewati secara senyap tanpa menghentikan thread eksekusi utama.
## 4.4 Rekognisi Inventaris Rilis Eksisting (Fase 0)
Sebelum penambangan dijalankan, periksa inventaris berkas rilis menggunakan GitHub CLI:

gh release view "Data baru Indonesian" --json assets
gh release view "data baru English" --json assets
gh release view "penampungan Indonesian" --json assets
gh release view "penampungan English" --json assets
gh release view "K1" --json assets
gh release view "R1" --json assets
Seluruh nama dataset dan domain yang sudah terdaftar otomatis diisolasi ke dalam memori kerja sebagai daftar terlarang (Exclusion Filter) guna mencegah penambangan ganda.

# BAB 5: KELAYAKAN DASAR & PARTISI DATA MENTAH
## 5.1 Skema Data Mentah & Pembungkusan Ringan
Setiap dokumen mentah dibungkus dengan struktur ringan dalam format JSONL atau arsip compressed `.tar.gz` / `.jsonl.gz` untuk menjaga efisiensi throughput penyedotan data:

5.2 Filter Kelayakan Dasar & Penapisan Non-Invasif
{
"id": "raw_en_stem_9f8a2b1c",
"domain": "stem",
"title": "Quantum Computing Architecture and Error Mitigation",
"source_url": "https://arxiv.org/abs/2301.xxxxx",
"crawled_at": "2026-10-03T14:30:00Z",
"language": "en",
"raw_content": "Isi teks mentah hasil penyedotan..."
}
## 
Untuk menjaga kecepatan penyedotan data (High-Throughput), Manus AI hanya mengaplikasikan tiga filter kelayakan dasar secara non-invasif tanpa melakukan pembersihan berat:
Lisensi Open Access / Greenlist: Memastikan sumber data tidak berlisensi Non-Komersial (NC) atau membentur klausul Anti-AI.
Integritas Teks Terbaca: Menyaring berkas biner korup, tangkapan layar/gambar tanpa teks, atau kegagalan unduh HTTP.
Eksklusi Domain Eksisting (Fase 0): Menghindari penyedotan ulang terhadap domain atau dataset yang sudah terdaftar pada rilis sebelumnya.

# BAB 6: ARSITEKTUR PIPELINE ROLLING RELEASE & PURGE DISK LOKAL
## 6.1 Mengatasi Keterbatasan Disk Sandbox via Ephemeral Buffer
Kapasitas disk penyimpanan lokal pada lingkungan kerja agen otonom (sandbox VM) sangat terbatas (umumnya berkisar 10 GB – 30 GB). Menambang data berskala 50 GB hingga 100 GB secara terus-menerus akan memicu kegagalan fatal Disk Out of Space jika seluruh data disimpan di lokal hingga akhir sesi.
Untuk meniadakan risiko tersebut, agen menerapkan siklus berulang Streaming Ephemeral Buffer:
Penambangan Bertahap: Kumpulkan data mentah hingga mencapai kapasitas 1 partisi standar sebesar 400 MB hingga 1.5 GB per chunk.
Pembungkusan Ringan: Kemas batch tersebut ke dalam format JSONL atau TAR terkompresi GZIP (raw_en_stem_part_001.tar.gz atau .jsonl.gz).
Rolling Upload ke GitHub Release: Langsung unggah berkas partisi tersebut ke tag rilis Tingkat 1 yang sah menggunakan GitHub CLI:
• Untuk Korpus Indonesia: gh release upload "Data baru Indonesian" chunk_id_part_xxx.jsonl.gz --clobber
• Untuk Korpus English: gh release upload "data baru English" chunk_en_part_xxx.jsonl.gz --clobber
Verifikasi Keberhasilan Unggah: Pastikan respons pengunggahan sukses (HTTP 200/201 dan ukuran berkas di release tervalidasi).
Purge Disk Lokal Segera: Eksekusi perintah penghapusan berkas lokal di sandbox (rm -f <file>) untuk mengembalikan 100% ruang disk yang terpakai.
Ulangi Siklus: Lanjutkan penambangan batch berikutnya secara berkesinambungan selama 2 hingga 5 jam.
## 6.2 Keunggulan Strategis Pipeline Ephemeral
Kapasitas Nyaris Tanpa Batas (Zero Disk Overflow): Sandbox mampu menambang data puluhan hingga ratusan gigabyte tanpa pernah mengalami kehabisan disk.
Perhitungan Data Mutlak (Zero Work Lost): Jika sesi terputus atau container mengalami terminasi pada jam ke-4, seluruh partisi yang telah terunggah pada jam-jam sebelumnya tetap 100% aman dan utuh di GitHub Release.
Pemanfaatan Paralel: Aset data yang sudah masuk ke rilis dapat langsung diunduh oleh pipeline prapelatihan model tanpa harus menunggu seluruh sesi 5 jam selesai.

# BAB 7: CHECKLIST DEFINITION OF DONE & HANDOVER GATE
Sebelum Manus AI mengakhiri tugas dan mengirimkan laporan akhir, seluruh 12 kriteria kelulusan di bawah ini wajib terpenuhi secara mutlak:

[✓ LULUS 01] Target Kuantitas Dokumen
Kriteria: Mencapai target maraton 2–5 jam penyedotan data mentah sebesar 50 GB s.d. 100 GB dari allowlist domain global.
[✓ LULUS 02] Standarisasi Ukuran Partisi Release
Kriteria: Seluruh berkas partisi mentah yang terunggah berukuran terstandarisasi antara 400 MB hingga 1.5 GB per file aset (`raw_en_stem_part_001.tar.gz` atau `.jsonl.gz`).
[✓ LULUS 03] Verifikasi Tag Rilis Tingkat 1
Kriteria: Seluruh data mentah Bahasa Indonesia terbukti masuk HANYA ke tag Data baru Indonesian dan data mentah Bahasa Inggris HANYA ke tag data baru English. Nol aset yang salah kamar ke Penampungan atau Rak Final K/R.
[✓ LULUS 04] Kepatuhan Pagar Lisensi PRD RELEASE
Kriteria: Kepatuhan 100% terhadap lisensi Greenlist (CC0, CC-BY, MIT, Apache 2.0, BSD, ODC-By). Terverifikasi nol data dari sumber berlisensi Non-Komersial (NC) atau platform anti-AI.
[✓ LULUS 05] Penapisan Teks Terbaca & Bebas File Korup
Kriteria: Seluruh data mentah terverifikasi sebagai teks yang dapat dibaca dan bebas dari file biner korup atau konten gambar kosong tanpa membuang komputasi pada pembersihan berat.
[✓ LULUS 06] Efisiensi Pembungkusan Ringan (Lightweight Packaging)
Kriteria: Data mentah dikemas menggunakan skema pembungkusan yang ringan tanpa pemrosesan mendalam untuk memaksimalkan throughput penyedotan data.
[✓ LULUS 07] Efektivitas Purge Disk Lokal
Kriteria: Berkas chunk lokal berhasil dihapus segera setelah terunggah; kapasitas disk sandbox tetap longgar dan bersih di akhir sesi.
[✓ LULUS 08] Kepatuhan Alokasi Tugas Pembersihan Ke Tingkat 2 & 3
Kriteria: Terverifikasi bahwa pembersihan berat (BPE, MinHash, dekontaminasi) tidak dilakukan pada tahap ini dan dialihkan sepenuhnya ke Tingkat 2 (Penampungan) dan Tingkat 3 (Rak K & R).
[✓ LULUS 09] Validitas Sintaks JSONL
Kriteria: Setiap baris pada seluruh partisi data terverifikasi sebagai format JSON yang valid (parseable tanpa error sintaks).
[✓ LULUS 10] Maksimalisasi Throughput Ingestion
Kriteria: Pipa eksekusi terbukti beroperasi pada kecepatan dan volume maksimum tanpa adanya kendala kemacetan akibat kalkulasi komputasi lokal berlebih.
[✓ LULUS 11] Non-Redundansi Lintas-Sesi (Fase 0)
Kriteria: Terbukti bahwa seluruh dataset baru yang ditambang tidak ada yang tumpang-tindih atau mengulang aset yang sudah terdaftar di tag rilis sebelumnya.
[✓ LULUS 12] Format Laporan Akhir Tunggal
Kriteria: Menyajikan laporan eksekutif tunggal yang padat, mencantumkan tautan langsung ke aset GitHub Release dan ringkasan metrik data tanpa ada obrolan basa-basi perantara.

# BAB 8: PENEGASAN TEKNIS MUTLAK: MANDAT LIVE BACKGROUND JOB TERPANTAU (ANTI-BERHENTI & ANTI-BAWEL)
## 8.1 Evaluasi & Akar Masalah Perilaku Agen
Berdasarkan evaluasi eksekusi lapangan, ditemukan bahwa agen (Manus AI) kerap mengalami salah tafsir operasional:
1. Agen mengira tugasnya hanya merancang berkas skrip pengunduh (misal: membuat file `.py` atau `.sh`), lalu berhenti dan mengirimkan pesan obrolan perantara kepada pengguna.
2. Agen menjalankan skrip di foreground terminal, sehingga proses terhenti begitu batas waktu interaktif habis (timeout 1-2 menit), lalu agen buru-buru melapor padahal data yang tersedot baru beberapa megabyte.
## 8.2 Mandat Operasional Baku: "Live Background Job Terpantau 2–5 Jam"
Ditegaskan secara instruktif dan mutlak kepada Manus AI:
1. Wajib Memindahkan Eksekusi ke Background Daemon:
• Setelah berkas skrip ekstraksi/unduhan selesai ditulis, agen DILARANG BERHENTI dan DILARANG MEMBALAS OBROLAN.
• Skrip tersebut WAJIB LANGSUNG DIEKSEKUSI detik itu juga ke dalam mode Live Background Job terpantau (menggunakan mekanisme background job bawaan Manus, atau perintah shell daemon: nohup python3 script.py > run.log 2>&1 &).
2. Karakteristik Background Job Terpantau (Seperti Job: job_xxxx):
• Proses pengunduhan, pemfilteran lisensi permisif (MIT, Apache, BSD, CC0), pengunggahan partisi (400 MB–1,5 GB) ke GitHub Release Data baru Indonesian / data baru English, dan pembersihan disk lokal (rm -f) harus berjalan terus-menerus di latar belakang secara otonom selama 2 hingga 5 jam nonstop.
• Agen hanya memantau berkala (monitoring loop) status job tanpa menghentikan proses unduhan.
3. Larangan Interupsi Obrolan:
• Agen DILARANG mengirimkan respons obrolan yang hanya berisi laporan rencana, ringkasan dataset yang ditemukan di Hugging Face, atau konfirmasi basa-basi.
• Respons teks kepada pengguna HANYA DIKIRIM SATU KALI setelah target puluhan/ratusan gigabyte selesai diunggah dan sesi background job 2–5 jam tuntas.
