<!-- Sumber: Google Drive "PRD antarmuka 3.0" file 1mpemubzthUoDt3Hp3FaWXGoW47tz21RqwLA1wG5_5iw, diubah 2026-10-05T21:56:32Z. -->

PRD ANTARMUKA 3.0 — MASTER CETAK BIRU REKAYASA KEDAULATAN & KEDALAMAN MESIN FITUR (EDISI FINAL KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Sovereign AI Workstation)
Versi: 3.0.0-CANONICAL-SOVEREIGN-MASTER | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 & PRD antarmuka 2.0 (STATUS: DIKONSOLIDASI & DISEGEL)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)
# BAB 1: DOKTRIN KEDAULATAN MUTLAK & PONDASI FUNDAMENTAL ARSITEKTUR
## 1.1 Doktrin Kedaulatan Tanpa Model Pihak Ketiga (Zero External AI API)
Satu Model Berdaulat: Rategoan beroperasi murni di atas model ciptaan sendiri bernama Raget 1.0. Dilarang keras menghubungkan API pihak ketiga (OpenAI, Gemini, Claude) maupun runtime luar seperti Ollama.
Pondasi Arsitektur Dual-Brain (Dua Mesin di Balik Layar):
Jalur Cepat (Fast-Path Sistem 1 <10ms): Mesin refleks deterministik berbasis aturan dan data kanonikal. Bertugas menangani sapaan ("Halo", "Selamat malam"), hitungan matematika eksak (toolsMath), konversi unit/kurs, dan 260 database pengetahuan kanonikal JSON. Beroperasi instan (<10ms), hemat daya baterai, dan 100% bebas halusinasi.
Jalur Mendalam (Neural Generative Sistem 2): Jaringan saraf tiruan lokal Rategoan yang dilatih dari nol menggunakan korpus rilis. Bertugas menyusun analisis mendalam, penulisan bebas, koding, dan penalaran bertahap (Chain-of-Thought / CoT).
Penyederhanaan Kontrol Model di Antarmuka:
Di kartu modal model (#model-sheet) dan Pengaturan: Cukup tampilkan nama model murni Raget 1.0 (bebas dari slogan dan kata 'Aktif').
Kontrol kecepatan/upaya menggunakan tombol tunggal: Mode: [Cepat | Mendalam] ▾.
Hapus opsi 'Otomatis'. Pilihan murni dua: Cepat (Fast-Path Sistem 1) dan Mendalam (Neural Sistem 2).
## 1.2 Pondasi Arsitektur 4 Pilar Rategoan
Rumah (Wadah & Casing Antarmuka): PWA responsif mobile-first, bersih, tenang, tanpa animasi canggung, ramah jempol seluler (sentuh min 44x44px), dan anti-luber horizontal.
Kerangka (Sasis & Struktur Data): Penyimpanan berjenjang (IndexedDB shared/idb-gateway.js untuk riwayat chat, lampiran, dan artefak; LocalStorage hanya untuk preferensi mikro <100KB).
Kabel (Wiring Harness & Client-Side Tool Dispatcher): Menghubungkan otak AI secara luring dengan 29 alat mandiri perangkat (File System, Sensor Suara/Kamera, Sandbox Kode, Pengolah Data, Agenda).
Mesin (Otak AI Mandiri): Raget 1.0 beroperasi 100% di browser klien.
# BAB 2: SPESIFIKASI BAKU ANTARMUKA PENGGUNA TERKUNCI (UI SPECIFICATION)
## 2.1 Bilah Atas Obrolan (#topbar)
Tampilan header atas obrolan terkunci minimalis dan berkelas dunia:

[ ☰ Menu Drawer ] | <h1>Raget 1.0</h1> | [ ✏️ Chat Baru ] [ ⋮ Menu Titik Tiga ]
|---|

Bebas dari tombol kuno 'Umum' dan gelembung fakta memori.
Menu Titik Tiga (#btn-chat-more) menampung: Cari di obrolan, Salin obrolan, Ekspor Markdown, Ekspor siap cetak (PDF), dan Bersihkan percakapan.
## 2.2 Lembar Lampiran (#attach-sheet) — Enkapsulasi Fitur Tunggal & Ikon SVG Asli
Lembar lampiran pada tombol plus (+) terkunci bersih dengan susunan kanonikal:

Grid Media Atas (4 Tombol Bulat Berwarna):
[ 📷 Kamera ] (#sheet-camera, Biru) — Akses kamera & OCR fisik.
[ 🖼️ Foto ] (#sheet-photo, Ungu) — Pemilih gambar galeri.
[ 📄 Dokumen ] (#sheet-file, Hijau) — Unggah berkas dokumen multi-format (PDF, DOCX, TXT, CSV).
[ 🎙️ Memo Suara ] (#sheet-voice, Oranye) — Dikte suara instan ke input obrolan via Web Speech API.
Baris Fitur di Bawah Grid (Wajib Berikon SVG & Ringkas Tanpa Teks Panjang):
[ 📊 ] Buat Slide (.pptx) (#sheet-slide) — Generator presentasi PowerPoint mandiri.
[ 📁 ] Kaitkan ke Proyek (#sheet-project) — Subtitle pendek status proyek (Belum ada proyek terpilih (Pilih) atau Proyek aktif: [Nama]).
[ 🌐 ] Pencarian Web (#sheet-websearch) — Sakelar toggle ON/OFF penelusuran internet.
[ 🔍 ] Riset mendalam (#sheet-research) — Sakelar toggle ON/OFF investigasi multi-sumber.
[ 📁 ] Hubungkan Folder Lokal (#sheet-folder) — Akses folder lokal perangkat via File System Access API.
Doktrin Enkapsulasi: Dilarang memecah fitur menjadi teks bertele-tele (seperti tombol buatan 'Buatkan Dokumen Word' atau 'Kuis Belajar' di lampiran). Pembuatan dokumen teks dan bimbingan kuis dilakukan secara alami melalui obrolan chat atau Kanvas Artefak.
## 2.3 Bilah Samping Navigasi (Sidebar 6 Pilar Workstation)
Sidebar drawer (#sidebar) mengelompokkan 6 pilar workstation:

UTAMA: Chat Baru (#btn-new-chat), Studio kode (#btn-studio), Proyek (#btn-project).
RUANG KERJA: Koleksi (#btn-collection), Konektor (#btn-connect), Artefak (#btn-artifact).
Riwayat Chat: Input pencarian riwayat (#hist-search) dan daftar sesi tersimpan (#hist-list).
Footer Akun: Avatar bulat, Nama Akun, Email, dan Tombol Pengaturan Gear (#btn-settings).
# BAB 3: BEDAH KEDALAMAN 8 MESIN FITUR DI BALIK LAYAR & KEUNGGULANNYA
## 3.1 Mesin 1: Slide Engine & Visual Carousel (shared/pptx-local.js)
Fungsi: Mesin perakit presentasi biner langsung di browser klien. Membaca materi obrolan (pickSlideMaterial), menyusun kerangka bab/slide (buildOutline), mengompilasi berkas PowerPoint asli format .pptx (exportSlides), dan membuka pratinjau di Kanvas Artefak.
Keunggulan: Menghasilkan berkas presentasi Office nyata tanpa server backend, lengkap dengan palet editorial modern.
## 3.2 Mesin 2: Second Brain RAG Lokal & Vault (raget/raget-vault/local-rag.js)
Fungsi: Mesin pencarian semantik dan temu kembali dokumen pribadi luring (TF-IDF + Cosine Similarity lokal) dari berkas PDF, DOCX, TXT, dan catatan obrolan.
Keunggulan: Kerahasiaan 100% terjaga (Zero Data Leakage). Dokumen tidak pernah dikirim ke awan pihak ketiga.
## 3.3 Mesin 3: Studio Multi-Bahasa (js/studio/studio.js)
Fungsi: Lingkungan IDE terintegrasi dengan 3 zona [Editor | Pratinjau | Konsol], mendukung Web App (HTML/CSS/JS) dengan iframe sandbox live preview dan Skrip Python lokal berbasis WebAssembly (Pyodide). Dilengkapi fitur Ekspor ZIP dan tombol Simpan ke Artefak.
Keunggulan: Pengembang dapat merancang dan menguji aplikasi web serta algoritma Python saat luring tanpa menginstal runtime compiler eksternal.
## 3.4 Mesin 4: Mesin Riset Bertingkat Mandiri (Deep Research - js/chat/research.js)
Fungsi: Loop investigasi multi-hop otonom yang mengekstrak informasi dari web atau dokumen lokal, membandingkan data, dan menyusun laporan eksekutif lengkap (Abstrak, Analisis Komparatif, Tabel Temuan, dan Rekomendasi Aksi) ke dalam Kanvas Artefak.
Keunggulan: Menghasilkan kajian komprehensif terstruktur yang siap diekspor ke Word (.docx) atau Markdown.
## 3.5 Mesin 5: Sensor Suara Dwiarah & Kamera OCR (js/chat/voice.js & camera-overlay)
Fungsi: Menggunakan Web Speech API native peramban (SpeechRecognition id-ID) untuk dikte suara instan ke input chat dengan hitung mundur otomatis 2 detik, serta Text-to-Speech untuk membacakan balasan. Kamera memotret berkas dan mengekstrak teks via OCR lokal.
Keunggulan: Aksesibilitas hands-free cepat di perangkat bergerak tanpa biaya API suara pihak ketiga.
## 3.6 Mesin 6: Koleksi & Importir Pengetahuan Pribadi (js/collection/collection.js)
Fungsi: Pustaka penyimpanan terstruktur untuk menyimpan jawaban bernilai tinggi, prompt favorit, dan catatan pribadi dengan filter kategori. Mendukung pengimpor arsip WhatsApp, Evernote (.enex), Notion, dan Kalender (.ics).
Keunggulan: Mengonsolidasikan data pribadi yang tercerai-berai menjadi satu basis pengetahuan terpusat.
## 3.7 Mesin 7: Client-Side Tool Dispatcher 29 Alat Lokal (js/connectors/connector-hub.js)
Fungsi: Orkestrator pemanggilan alat mandiri peranti (Vault RAG, kalkulator eksak, kalkulus, manipulasi data JSON/CSV, sensor, dan agenda harian).
Keunggulan: AI memiliki tangan dan kaki nyata untuk mengeksekusi perhitungan dan manipulasi berkas secara deterministik di peramban.
## 3.8 Mesin 8: Galeri Artefak & Kanvas Belah Lentur (js/ui/artifact.js & js/cowork/cowork.js)
Fungsi: Dasbor penyimpan seluruh berkas keluaran Rategoan (Slide, Dokumen, Tabel Data, Skrip Kode) dengan kemampuan penyuntingan teks langsung di tempat (in-place editing) dan ekspor multi-format (DOCX via docx-local.js, PPTX, PDF, MD, ZIP).
Keunggulan: Hasil kerja tidak hilang begitu obrolan berakhir, melainkan menjadi aset berkas siap pakai.
# BAB 4: STANDAR REKAYASA KODE, KEAMANAN SIBER & PENCEGAHAN REGRESI
Pencegahan Stored DOM XSS: Fungsi escape() di shared/markdown.js wajib melakukan sanitasi entitas HTML standar (&, <, >, ") sebelum perenderan innerHTML.
Sandbox Isolasi Web Worker: Skrip eksekusi kode pengguna dinetralkan dari akses jaringan dan penyimpanan (self.fetch, self.indexedDB, self.importScripts).
Pencegahan ReDoS: Pemindaian parser CSV dan markdown wajib menggunakan algoritma sekuensial aman tanpa regex backtracking eksponensial.
Gerbang Kualitas Wajib (Definition of Done):
100% kelulusan 17 unit test (npm test).
Linter wajib 0 error, 0 warning, dan Anti-placeholder: 0 (npm run lint).
Tidak ada elemen HTML berstatus yatim atau tombol tanpa penangan event.
# BAB 5: MATRIKS PENYEMPURNAAN BERKAS SEKALI JALAN (SINGLE-PASS MASTER CHECKLIST)
No
Modul Target
Tindakan Refaktoring / Penyempurnaan
Kriteria Keberhasilan
1
js/chat/composer.js
Pembersihan kode mati & handler deprecated
Menghapus referensi #sheet-doc, #sheet-learn, #sheet-fast, #sheet-think, #sheet-tools, #sheet-memory.
2
js/chat/composer.js:763
Penanganan kasus chat kosong pada fitur slide
Mencegah unduhan berkas hampa; mengarahkan fokus ke #chat-input dengan preset teks panduan dan toast UI.
3
js/account/settings.js
Penyelarasan mode eksekusi
Memastikan sinkronisasi dua arah opsi Cepat dan Mendalam dengan model-sheet.js.
4
shared/idb-gateway.js
Optimasi kuota penyimpanan lokal
Mengalirkan riwayat percakapan besar dan artefak ke IndexedDB guna menghindari limit 5MB LocalStorage.
5
js/chat/voice.js
Penanganan gracefully-degrade izin mikrofon
Menampilkan toast pemberitahuan yang ramah saat akses mikrofon ditolak oleh browser.

# BAB 6: MANDAT PEMBERSIHAN DOKUMEN REPOSITORI DARI KERACUNAN TEKS USANG (DOCUMENTATION HYGIENE & REPO CLEANUP)
## 6.1 Latar Belakang & Urgensi Pembersihan
Keberadaan dokumen usang berukuran besar di dalam repositori telah memicu keracunan konteks (documentation poisoning) bagi model AI eksternal yang menganalisis repositori. AI luar cenderung membaca berkas lama yang besar dan mengabaikan arsitektur aktif saat ini. Oleh karena itu, Grok Build diwajibkan melakukan pembersihan total terhadap berkas-berkas kadaluarsa di dalam repositori.
## 6.2 Instruksi Eksekusi Berkas demi Berkas untuk Grok Build
Penghapusan Berkas Usang (Hapus Total dari Repositori):
Hapus docs/PRD/PRD-ANTARMUKA-1.0.md (254 KB teks usang dari awal Oktober).
Hapus docs/PRD/PRD-ANTARMUKA-2.0.md (dokumen transisi lama yang sudah digantikan).
Hapus docs/PRD/PENGEMBANGAN-RATEGOAN.md (catatan coretan lama yang memicu salah paham).
Hapus raget/raget-devlog/neural/corpus-token-audit.md (audit lama yang mencatat 5.2 Miliar token, menyesatkan pembaca dari total korpus rilis resmi 17+ Miliar token BPE).
Pemasangan Cetak Biru Tunggal Baru:
Buat berkas baru di repositori: docs/PRD/PRD-ANTARMUKA-3.0.md.
Salin seluruh isi dari dokumen Google Drive 'PRD antarmuka 3.0' ini ke dalam berkas docs/PRD/PRD-ANTARMUKA-3.0.md tersebut.
Penyelarasan Berkas docs/PRD/README.md:
Perbarui isi docs/PRD/README.md menjadi ringkas dan padat:
# PANDUAN DOKUMEN RESMI RATEGOAN (PRD)

Repositori ini dikelola secara ketat dengan pemisahan wilayah dokumentasi kanonikal:

1. **Antarmuka, Casing & Mesin Aplikasi**:
- `PRD-ANTARMUKA-3.0.md` — Cetak biru induk tunggal aktif untuk UI/UX, Komposer, Lembar Lampiran, 6 Pilar Workstation, dan 8 Mesin Fitur.
2. **Data, Rilis Korpus & Lisensi**:
- `PRD-RELEASE.md` — Standar baku tata kelola rilis 3 tingkat (Data Baru, Penampungan, Rak K & R).
- `../STATUS-KORPUS-LISENSI.md` — Status kuantitatif lantai korpus resmi (17.651.050.443 token BPE).
- `PRD-PENAMBANGAN-DATA.md` — Spesifikasi penambangan data web.
3. **Sains AI & Arsitektur Otak**:
- `FONDASI-TEORI-RAGET.md` — Landasan teori, matematika, dan struktur AI Raget.
- `PRD-RAGET-TEMPLATE.md` — Otak deterministik Fast-Path Sistem 1.
- `PRD-RAGET-NEURAL.md` — Otak transformer neural Sistem 2.
4. **Standar Kode**:
- `PRD-ATURAN-KERJA.md` — Aturan rekayasa kode bersih dan tanpa komentar redundan.
Verifikasi Kualitas:
Jalankan npm test dan pastikan 17/17 lulus.
Jalankan npm run lint dan pastikan 0 error, 0 warning, serta Anti-placeholder: 0.
Commit perubahan dengan pesan: docs: adopsi PRD-ANTARMUKA-3.0 dan bersihkan dokumen usang lalu push ke repositori.
# BAB 7: SPESIFIKASI ARSITEKTUR VISUALISASI PROSES AGENIK MODERN (ZEN AGENTIC TIMELINE STEPPER), PERENCANA SUB-GOAL OTONOM & KANVAS BELAH ADAPTIF
## 7.1 Latar Belakang & Tolok Ukur Visual Frontier AI Modern
Berdasarkan evaluasi komparatif terhadap aplikasi AI frontier dunia (Gemini Spark, Manus AI, Grok Build, dan Claude), interaksi manusia-AI modern tidak lagi menyajikan proses berpikir sebagai daftar teks mentah. Pengguna membutuhkan pengalaman visual yang hidup, terstruktur, dan transparan saat AI mengeksekusi tugas multi-langkah di balik layar.
Rategoan wajib merombak modul telemetri visualnya dari <details> polos menjadi Zen Agentic Timeline Stepper, sebuah garis waktu vertikal berantai dengan simpul-simpul berikon tematik yang mencerminkan kecerdasan mandiri berkelas dunia.
## 7.2 Spesifikasi Rekayasa Zen Agentic Timeline Stepper (js/ui/thought-card.js & css/ui/thought.css)
Struktur Garis Waktu Vertikal (Connected Timeline Track):
Kontainer utama menggunakan .agentic-stepper dengan garis vertikal tipis penghubung (::before track line berwarna lembut var(--rg-line)).
Setiap aksi direpresentasikan sebagai simpul .stepper-node yang tertambat pada garis waktu.
Lencana Simpul Ikon Berwarnai SVG (Action-Specific Orbs):
Setiap langkah memiliki ikon SVG lingkaran tematik berdiameter 24px:
🌐 Web / Riset: Ikon bola dunia berlingkar biru lembut (#2563eb).
📄 Berkas / RAG: Ikon dokumen berlingkar hijau (#16a34a).
💻 Alat / Terminal / Sandbox: Ikon layar komputer berlingkar slate (#475569).
🧠 Nalar / Refleksi / CoT: Ikon otak/jam berlingkar ungu (#7c3aed).
📊 Slide / Artefak: Ikon presentasi berlingkar oranye (#ea580c).
Simpul Aktif Berpendar (Live Shimmer / Pulse Indicator):
Tahap yang sedang berjalan menampilkan ikon bintang/sparkle dengan animasi denyut napas halus (breathing pulse) dan teks: "Sedang memproses...".
Penutupan Bersih Otomatis (Graceful Auto-Collapse):
Saat seluruh proses selesai dan jawaban akhir siap, garis waktu terlipat otomatis menjadi kartu ringkas elegan: ▸ Selesai · [X] langkah eksekusi · [Y] detik (Ketuk untuk detail)
Pengguna dapat mengetuk kartu tersebut kapan saja untuk membuka kembali riwayat tahapan eksekusi secara penuh.
## 7.3 Jalur Perencana Sub-Goal Otonom (raget/raget-agents/core/agent-planner.js)
Dekomposisi Kueri Majemuk:
Jika kueri pengguna memerlukan beberapa tindakan berurutan (contoh: "Cari data inflasi terbaru, rangkum analisanya, lalu buatkan slide"), modul planner secara otonom memecahnya menjadi tahapan:
Tahap 1: Eksekusi penelusuran web & ekstraksi data.
Tahap 2: Sintesis penalaran & pembuatan draf naskah.
Tahap 3: Perancangan kerangka dan kompilasi berkas Slide PowerPoint (.pptx).
Proyeksi Dinamis ke Timeline:
Setiap sub-tugas otomatis terproyeksikan menjadi simpul baru pada Zen Agentic Stepper secara berurutan, memberikan umpan balik langsung kepada pengguna tentang kemajuan tugas.
## 7.4 Jalur Kanvas Belah Adaptif (Adaptive Split-Canvas Workspace)
Tata Letak Desktop & Tablet (Lebar Layar >= 1024px):
Saat pengguna membuka Artefak, Slide, atau Studio Kode, antarmuka otomatis membelah menjadi tata letak berdampingan 50%/50%:
Sisi Kiri: Ruang percakapan chat aktif dan riwayat pesan.
Sisi Kanan: Kanvas interaktif untuk pratinjau slide, dokumen Word, atau editor kode.
Pengguna dapat terus mengobrol atau meminta revisi di sisi kiri sambil melihat hasil berkas diperbarui secara langsung di sisi kanan.
Tata Letak Ponsel (< 1024px):
Kanvas tetap beroperasi sebagai lembar geser bawah (bottom sheet) yang ergonomis dan mudah ditutup.
## 7.5 Jalur Indeks Vektor Otomatis Berkas Proyek (Auto-Vectorization RAG)
Ekstraksi & Vektorisasi Latar Belakang:
Saat pengguna menyematkan berkas (PDF, DOCX, TXT) ke dalam Proyek, pipa latar belakang langsung mengekstrak teks dan membuat indeks semantik vektor lokal (TF-IDF + Cosine di local-rag.js).
Penyuntikan Konteks Proyek Otomatis:
Pertanyaan di dalam ruang kerja proyek secara otomatis diperkaya dengan kutipan paling relevan dari berkas rujukan tanpa perlu instruksi berulang dari pengguna.
## 7.6 Standar Kualitas & Kriteria Kelulusan (Definition of Done)
Seluruh 17 unit test wajib lulus 100% (npm test).
Pemeriksaan linter wajib 0 error, 0 warning, dan Anti-placeholder: 0 (npm run lint).
Animasi timeline stepper berjalan mulus pada 60 FPS di peramban seluler tanpa menyebabkan getaran tata letak (layout shift).
# BAB 8: SPESIFIKASI 5 MESIN PRODUKTIVITAS HARIAN NYATA (PENGOLAH EXCEL LOKAL, EKSTRAKSI STRUK/FORMULIR, Q&A DOKUMEN TEBAL, SEKRETARIS RAPAT, DAN BRIEFING AGENDA HARIAN)
## 8.1 Prinsip Desain: Produktivitas Nyata Tanpa Merusak Ketenangan Antarmuka
Seluruh 5 kapabilitas produktivitas harian di bawah ini beroperasi murni di balik layar (encapsulated engine). Sistem TIDAK menambah tombol baru yang mengotori antarmuka luar; seluruh mesin dipicu secara alami melalui teks kueri pengguna, berkas lampiran, kamera, atau audio yang sudah ada di antarmuka kanonikal.
## 8.2 Rincian 5 Mesin Produktivitas Harian
Mesin Pengolah Spreadsheet & Tabel Cerdas Lokal (.xlsx Engine):
Teknologi: Menggunakan modul kompilasi spreadsheet biner sisi klien terintegrasi dengan mesin perhitungan toolsMath.
Fungsionalitas: Saat pengguna meminta rekap penjualan, pembukuan kas, anggaran biaya, atau analisis data tabel, sistem secara otonom menyusun tabel berumus (SUM, AVERAGE, IF) dan mengompilasi berkas Excel asli format .xlsx.
Keluaran: Menampilkan pratinjau tabel interaktif di obrolan dan menyimpan berkas .xlsx siap unduh ke Galeri Artefak.
Mesin Ekstraksi Nota, Struk & Formulir Terstruktur (Smart Document & Receipt Extractor):
Teknologi: Mengintegrasikan modul camera-overlay dan OCR lokal dengan pemroses pola semantik di raget-agents.
Fungsionalitas: Saat pengguna memotret struk belanja, kuitansi fisik, nota warung, invoice, atau kartu nama, AI secara otomatis mengekstrak entitas kunci: Tanggal Transaksi, Nama Toko/Vendor, Rincian Barang & Harga Satuan, serta Total Pembayaran.
Keluaran: Disajikan dalam format tabel rapi atau CSV terstruktur yang siap disalin ke pembukuan atau diekspor ke Excel.
Mesin Pembedah & Penjawab Dokumen PDF Tebal Instan (High-Speed Offline PDF Q&A):
Teknologi: Mengoptimalkan mesin pencarian semantik vektor lokal raget/raget-vault/local-rag.js (algoritma BM25 + TF-IDF Cosine Similarity di memori RAM).
Fungsionalitas: Pengguna melampirkan berkas PDF dokumen tebal (skripsi, jurnal ilmiah, laporan tahunan keuangan, atau regulasi hukum UU/Perpres 50–100 halaman). Pengguna dapat langsung menanyakan rincian pasal, metodologi riset, atau perbandingan data.
Keluaran: AI merespons instan (<2 detik) dengan menyertakan sitasi nomor halaman dan paragraf aslinya secara akurat, dengan kerahasiaan 100% luring (Zero Cloud Leakage).
Sekretaris Suara Rapat & Perkuliahan Luring (Segmented Meeting & Lecture Summarizer):
Teknologi: Mengembangkan modul audio js/chat/voice.js untuk perekaman kontinu bertahap (segmented audio chunking) yang tersimpan aman di IndexedDB.
Fungsionalitas: Merekam jalannya rapat kerja atau perkuliahan, lalu secara otomatis menyusun notulensi terstruktur:
Butir-butir Keputusan Kunci (Key Decisions).
Daftar Tindak Lanjut (Action Items & Penanggung Jawab).
Ringkasan Eksekutif 3 Paragraf.
Keluaran: Hasil notulensi dapat langsung diekspor menjadi berkas naskah Word (.docx) melalui satu ketukan.
Briefing Agenda Harian & Pengingat Tugas Otonom (Local Daily Briefing & Task Scheduler):
Teknologi: Mengaktifkan modul agenda_daily_briefing dan tools-reminder.js yang terhubung dengan Service Worker Notification API.
Fungsionalitas: Setiap pagi, Rategoan memunculkan kartu ringkasan harian di beranda obrolan:
Agenda dan janji temu dari kalender lokal.
Catatan tugas tertunda dari ruang kerja Proyek dan Koleksi.
Prakiraan cuaca lokal singkat.
Keluaran: Pengguna mendapatkan gambaran prioritas kerja harian secara jernih tanpa harus membuka banyak aplikasi terpisah.
## 8.3 Kriteria Kualitas & Jaminan Kedaulatan
Seluruh pemrosesan spreadsheet, OCR struk, RAG dokumen tebal, notulensi rapat, dan briefing agenda wajib berjalan 100% lokal di perangkat pengguna tanpa transmisi data ke cloud eksternal.
Pertahankan 100% kelulusan 17 unit test (npm test) dan linter 0 error (npm run lint).
