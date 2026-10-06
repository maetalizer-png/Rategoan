<!-- Sumber: Google Drive "PRD antarmuka 3.0" file 1mpemubzthUoDt3Hp3FaWXGoW47tz21RqwLA1wG5_5iw, diubah 2026-10-06T02:34:27Z. -->

PRD ANTARMUKA 3.0 — MASTER CETAK BIRU REKAYASA KEDAULATAN & KEDALAMAN MESIN FITUR (EDISI FINAL KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Sovereign AI Workstation)
Versi: 3.0.0-CANONICAL-SOVEREIGN-MASTER | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 & PRD antarmuka 2.0 (STATUS: DIKONSOLIDASI & DISEGEL)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)
# BAB 1: DOKTRIN KEDAULATAN MUTLAK & PONDASI FUNDAMENTAL ARSITEKTUR WORKSTATION
## 1.0 Batasan Wilayah & Ruang Lingkup PRD Antarmuka 3.0
Eksklusivitas Repositori Aplikasi: Dokumen ini MURNI dan EKSKLUSIF mengatur wilayah REPOSITORI APLIKASI (Rategoan PWA, casing UI/UX, sasis workstation, komposer, lembar lampiran, 6 pilar workstation, 8 mesin fitur sisi klien, enkripsi database lokal, dan runtime peramban pengonsumsi bobot).
Pemisahan Batas Domain Eksklusif:
Sains Neural & Pelatihan GPU Cloud: Urusan arsitektur pre-training, formula loss DPO, mutasi Evol-Instruct, dan cluster pelatihan GPU adalah ranah eksklusif dari PRD-RAGET-NEURAL.md dan FONDASI-TEORI-RAGET.md.
Penambangan Data & Rilis Korpus: Urusan penambangan data mentah, kurasi lantai korpus, hosting rilis, dan lisensi adalah ranah eksklusif dari PRD-RELEASE.md dan STATUS-KORPUS-LISENSI.md.
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
Tindakan Refaktoring / Rekayasa
Kriteria Keberhasilan
1
css/account/settings.css
Perbaikan kontras tombol segmented pengaturan tampilan
Tombol aktif .theme-btn.active dan .font-btn.active menggunakan background: var(--rg-accent); color: var(--rg-accent-ink);. Hapus selektor penimpa baris 210-213. Teks hitam pekat di atas pil putih di mode gelap.
2
js/chat/composer.js
Reformasi alur slide interaktif & eliminasi auto-download
Tombol #sheet-slide murni mengaktifkan slideActive = true dan panduan prompt. Hapus panggilan instan exportSlides. Pada baris 584, reset this.slideActive = false; dan panggil this.paintQuick() segera setelah pesan dikirim.
3
js/chat/chat.js
Eliminasi kotak ringkasan beranda chat kosong
Hapus fungsi paintBriefing(empty) dari pemanggilan di renderMessages(). Beranda chat #empty-state murni Zen (hanya tipografi Rategoan).
4
js/ui/artifact.js
Sanitasi celah DOM XSS pada render diagram & chart
Amankan baris 232 (renderDiagram) dan baris 257 (renderChart) dengan markdown.escape() atau isolasi di dalam iframe #artifact-inline.
5
shared/markdown.js
Penguncian sandbox Web Worker anti-eskalasi
Kunci self.indexedDB dengan Object.defineProperty(..., { configurable: false }), bekukan prototipe, dan nonaktifkan WebSocket, EventSource, BroadcastChannel.
6
index.html
Pemasangan Content Security Policy (CSP) ketat
Pasang meta tag CSP di <head> yang mengunci koneksi hanya ke 'self' dan blob: demi kedaulatan data 100% lokal.
7
js/account/settings.js
Penyelarasan mode eksekusi
Memastikan sinkronisasi dua arah opsi Cepat dan Mendalam dengan model-sheet.js.
8
shared/idb-gateway.js
Optimasi kuota penyimpanan lokal
Mengalirkan riwayat percakapan besar dan artefak ke IndexedDB guna menghindari limit 5MB LocalStorage.
9
js/chat/voice.js
Penanganan gracefully-degrade izin mikrofon
Menampilkan toast pemberitahuan yang ramah saat akses mikrofon ditolak oleh browser.
10
docs/PRD/
Pembersihan relik usang & sinkronisasi korpus resmi
Hapus dokumen usang (PRD 1.0, 2.0, audit token 5.2B). Selaraskan angka korpus di PRD-RAGET-NEURAL.md dan FONDASI-TEORI-RAGET.md menjadi resmi 17,65 Miliar token BPE.
11
docs/PRD/PRD-ANTARMUKA-3.0.md
Sinkronisasi master PRD ke repositori
Salin seluruh 10 Bab kanonikal dari dokumen Google Drive ini ke docs/PRD/PRD-ANTARMUKA-3.0.md.
12
Verifikasi Mutlak
Pengujian otomatis tanpa regresi
Menjalankan npm test (17/17 lulus) dan npm run lint (0 error, 0 warning, Anti-placeholder: 0).

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
Fungsionalitas: Rategoan mengelola agenda harian dan pengingat tugas. Beranda obrolan (#empty-state) dipertahankan murni, tenang, dan bersih (hanya merek 'Rategoan' tanpa kotak ringkasan info yang mengotori layar). Briefing agenda harian hanya disajikan saat pengguna memintanya via percakapan (on-demand query seperti 'apa agendaku hari ini?') atau di dalam panel Agenda terpisah di Ruang Kerja:
Agenda dan janji temu dari kalender lokal.
Catatan tugas tertunda dari ruang kerja Proyek dan Koleksi.
Prakiraan cuaca lokal singkat.
Keluaran: Pengguna mendapatkan gambaran prioritas kerja harian secara jernih tanpa harus membuka banyak aplikasi terpisah.
## 8.3 Kriteria Kualitas & Jaminan Kedaulatan
Seluruh pemrosesan spreadsheet, OCR struk, RAG dokumen tebal, notulensi rapat, dan briefing agenda wajib berjalan 100% lokal di perangkat pengguna tanpa transmisi data ke cloud eksternal.
Pertahankan 100% kelulusan 17 unit test (npm test) dan linter 0 error (npm run lint).
# BAB 9: RESOLUSI FATAL ERGONOMI MODE GELAP, REFORMASI ALUR SLIDE INTERAKTIF, ELIMINASI KOTAK BERANDA, DAN AUDIT REPO ANTI-HALUSINASI
## 9.1 Resolusi Fatal Ergonomi & Kontras Mode Gelap (Dark Mode Contrast Fix)
Penyebab Utama Tulisan Hilang di Mode Gelap:
Elemen <button> dan <select> pada peramban seluler (WebKit/Blink Android) tidak mewarisi color dari body secara default (color: ButtonText = hitam/gelap), sehingga ketika berada di atas latar belakang gelap (--rg-bg: #05080c atau --rg-surface-2: #0d1420), teks menjadi tidak terbaca (hitam di atas gelap).
Di css/reset.css, elemen button, select, input, textarea wajib ditambahkan deklarasi eksplisit: color: inherit;.
Di css/ui/artifact.css, tombol .studio-actions button dan .artifact-actions button wajib memiliki aturan kontras eksplisit: background: var(--rg-surface-2); color: var(--rg-text); border: 1px solid var(--rg-line);. Tombol aksi utama (seperti .btn-run-primary atau aksi aktif) menggunakan background: #1a4b8c; color: #ffffff;.
Di css/ui/overhaul.css, tombol tab .studio-panes button, pemilih mode .model-speed, .model-speed-label select, dan tombol kartu artefak wajib memiliki color: var(--rg-text);. Saat aktif (.on), gunakan latar kontras tinggi dengan teks yang kontras tajam.
Di js/artifacts/artifacts.js, pembuatan tombol Pratinjau dan Unduh pada kartu artefak wajib menyematkan kelas CSS terstandarisasi (.btn-art-open dan .btn-art-save atau kelas utilitas tombol sistem) dengan kontras tinggi yang jelas terlihat di mode gelap dan terang.
Seluruh teks sekunder/deskripsi (subtitel Koleksi, Proyek, Konektor, Lampiran) wajib memenuhi standar rasio kontras WCAG AA (minimal 4.5:1 terhadap latar belakang gelap).
Kasus Tombol Tampilan Putih di Atas Putih (Settings Appearance):
Pada css/account/settings.css, tombol segmented .theme-segmented .theme-btn.active dan .font-btn.active saat ini mengalami cacat teks tidak terbaca karena background: var(--rg-card, #ffffff) (variabel --rg-card tidak terdefinisi di tokens.css sehingga fallback ke #ffffff) dipadukan dengan aturan penimpa .theme-btn.active { color: var(--rg-accent); } di mana --rg-accent bernilai #ffffff pada mode gelap. Akibatnya teks putih berada di atas pil tombol putih.
Solusi baku: Ubah styling tombol aktif menjadi:
.theme-segmented .theme-btn.active,
.theme-segmented .font-btn.active {
background: var(--rg-accent);
color: var(--rg-accent-ink);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
border-color: transparent;
}
Hapus total aturan selektor .theme-btn.active { border-color: var(--rg-accent); color: var(--rg-accent); } pada baris 210-213.
Dengan aturan ini:
Pada Mode Gelap: Tombol aktif berlatar putih (--rg-accent: #ffffff) dengan teks hitam pekat berwibawa (--rg-accent-ink: #05080c).
Pada Mode Terang: Tombol aktif berlatar biru tua (--rg-accent: #1a4b8c) dengan teks putih tajam (--rg-accent-ink: #ffffff).
## 9.2 Penegakan Beranda Obrolan Murni Tanpa Kotak Mengganggu (Zen Clean Empty State)
Eliminasi Kotak Besar 'Ringkasan hari ini':
Dilarang keras merender kartu kotak besar .daily-brief di dalam #empty-state pada halaman utama chat (js/chat/chat.js:paintBriefing).
Beranda obrolan saat belum ada pesan aktif wajib kembali ke filosofi desain Zen: bersih, tenang, berwibawa, dan lapang — hanya menampilkan tipografi kanonikal merek Rategoan di tengah dan bilah komposer input di bawah.
Fungsi paintBriefing(empty) dihapus dari pemanggilan di renderMessages(). Data agenda dan pengingat tetap tersimpan di modul lokal tanpa mengotori ruang visual obrolan baru.
## 9.3 Reformasi Alur Pembuatan Slide (.pptx) Interaktif Tanpa Auto-Download
Eliminasi Auto-Download Instan: Dilarang keras memicu unduhan berkas biner .pptx secara otomatis saat tombol Buat Slide (.pptx) (#sheet-slide) diklik di lembar lampiran. Perilaku unduh otomatis seketika adalah cacat ergonomi serius.
Alur Kerja Interaktif Standar Industri:
Langkah 1 (Aktivasi Mode Slide): Saat pengguna mengetuk Buat Slide (.pptx), tutup lembar lampiran, aktifkan status slideActive = true, tampilkan lencana/pill Slide di atas komposer, dan isi input chat dengan panduan topik: "Buatkan slide presentasi tentang: " dengan kursor terfokus.
Langkah 2 (Instruksi & Dialog Percakapan): Pengguna mengetik atau melengkapi topik presentasi, audiens sasaran, atau poin-poin yang diinginkan, lalu menekan tombol kirim. (Jika ada pesan atau materi yang sedang dibahas di sesi chat, pengguna cukup mengonfirmasi pembuatan presentasi).
Langkah 3 (Penyusunan & Pratinjau Interaktif): Raget 1.0 menyusun naskah presentasi, memecah bab dan poin menjadi outline terstruktur, dan menampilkannya sebagai Kartu Pratinjau Slide (Visual Carousel di Kanvas Artefak / chat split).
Langkah 4 (Unduh Manual Sesuai Keinginan): Berkas biner PowerPoint .pptx HANYA diunduh ke penyimpanan perangkat ketika pengguna secara sadar menekan tombol [ 📥 Unduh PPTX ] yang tersemat pada kartu artefak atau panel pratinjau slide.
Pembersihan Siklus Status slideActive: Pada js/chat/composer.js:584, saat pesan slide dikirim, status this.slideActive wajib langsung di-reset kembali ke false dan memanggil this.paintQuick(). Ini mencegah pesan percakapan berikutnya (misal ucapan terima kasih atau pertanyaan umum) secara keliru terus ditempeli awalan "Buatkan slide: ".
## 9.4 Pembersihan Teks Relik Usang Pencegah Halusinasi Model AI Luar
Akar Masalah Keracunan Dokumen (567M Token Relic):
Ditemukan relik catatan audit tanggal 9 September 2026 di dalam docs/PRD/PRD-RAGET-NEURAL.md (bagian §2 dan §FASE A.1) yang mencatat angka lama "567.121.195 token (2,84% dari kebutuhan 1B)" dan di docs/PRD/FONDASI-TEORI-RAGET.md yang mencatat "543.202.593 token".
Catatan usang tersebut membuat model AI eksternal (seperti Qwen, Claude, Grok) yang membaca repositori mengalami halusinasi dan salah menyimpulkan bahwa korpus Rategoan belum cukup untuk melatih model 1B.
Tindakan Penyelarasan Mutlak:
Selaraskan seluruh isi docs/PRD/PRD-RAGET-NEURAL.md dan docs/PRD/FONDASI-TEORI-RAGET.md dengan dokumen kanonikal resmi terkini docs/STATUS-KORPUS-LISENSI.md dan docs/PRD/PRD-RELEASE.md:
Total Korpus Rilis Produksi Resmi: 17.651.050.443 Token BPE Bersih (17,65 Miliar token) dari 91.395.436 dokumen berkualitas tinggi (K-dataset-Indonesian: K1 = 2,20B, K2 = 0,43B, K3 = 15,01B token BPE).
Angka 567M dan 543M wajib dihapus total agar tidak ada lagi ambiguitas atau informasi yang bertentangan.
## 9.5 Hasil Quality Control (QC) Kode, Pipa Arsitektur, dan Pembersihan Jalur Mati
QC Kode & Fungsionalitas Jalur:
Seluruh 17 unit test lulus 100% (npm test).
Linter 0 error, 0 warning, dan Anti-placeholder: 0 (npm run lint).
Sanitasi DOM pada fungsi escape() di shared/markdown.js berjalan solid mencegah XSS.
Pipa penyimpanan terindeks di shared/idb-gateway.js mengelola sesi percakapan besar dengan aman tanpa membebani LocalStorage.
Pembersihan Kode Mati & Penangan Yatim:
Menghapus panggilan fungsi paintBriefing yang menginjeksi kotak harian ke #empty-state.
Menghapus sisa-sisa tombol usang #sheet-doc, #sheet-learn, #sheet-tools, #sheet-memory yang tidak terdaftar di DOM kanonikal.
Memastikan seluruh tombol antarmuka memiliki penangan event aktif dan penanda visual yang jelas.
Titik Prioritas Pengembangan Selanjutnya:
Penyempurnaan pipeline biner PPTX agar mendukung tata letak multi-kolom dan tema visual yang dapat dipilih pengguna.
Optimalisasi inferensi WebGPU / Wasm untuk akselerasi neural Raget 1.0 di perangkat seluler.
Integrasi penuh kanvas belah adaptif (Split-Canvas) pada layar tablet/desktop untuk kolaborasi pembuatan dokumen dan kode secara real-time.
## 9.6 Audit Keamanan Siber Luring, Titik Rawan Pemrograman, dan Penguatan Rekayasa Perangkat Lunak (Hardening & Security Audit)
Pencegahan Celah DOM XSS pada Kanvas Artefak (js/ui/artifact.js:232, 257):
Titik Rawan: Pemanggilan board.innerHTML = item.markdown pada renderDiagram dan stage.innerHTML = item.markdown pada renderChart langsung merender markup ke DOM utama tanpa sanitasi. Jika artefak mengandung muatan skrip atau tag SVG/IMG berbahaya, skrip dapat tereksekusi pada origin utama.
Penguatan: Seluruh perenderan visual dinamis wajib disanitasi menggunakan markdown.escape() atau dialihkan untuk dirender secara aman di dalam iframe terisolasi (#artifact-inline) yang memiliki atribut sandbox="allow-scripts" tanpa allow-same-origin.
Penguatan Isolasi Sandbox Web Worker (shared/markdown.js:61):
Titik Rawan: Di dalam markdown.run(), isolasi worker hanya menimpa objek dengan self.indexedDB = undefined. Skrip yang dijalankan pengguna dapat memulihkan akses basis data melalui penghapusan properti (delete self.indexedDB) yang mengekspos WorkerGlobalScope.prototype.indexedDB, atau mengeksfiltrasi data menggunakan WebSocket, EventSource, BroadcastChannel, maupun navigator.sendBeacon.
Penguatan: Kunci properti global worker menggunakan Object.defineProperty(self, 'indexedDB', { get: () => undefined, configurable: false }), bekukan prototipe lingkungan worker, dan netralisasi seluruh antarmuka jaringan luring (self.WebSocket = undefined; self.EventSource = undefined; self.BroadcastChannel = undefined;).
Penerapan Kebijakan Keamanan Konten Ketat (Strict Content Security Policy):
Titik Rawan: Berkas index.html belum menyertakan meta tag Content-Security-Policy.
Penguatan: Pasang meta tag CSP ketat di <head> index.html:
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-eval' blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' blob:; worker-src 'self' blob:; frame-src 'self' blob:; object-src 'none';">
Ini mengunci peramban agar 100% menolak koneksi transmisi data ke domain luar manapun, menjamin kedaulatan data lokal secara mutlak.
Validasi Alur Kerja Fitur Modern (Modern AI Workspace Simulation):
# BAB 10: CETAK BIRU ENGINE RUNTIME SISI KLIEN RAGET 1.0 & 4 STUDI KASUS REKAYASA END-TO-END
## 10.1 Arsitektur Runtime Peramban Sisi Klien (Client-Side Neural Core Runtime)
Rotary Position Embedding (RoPE):
Menggantikan embedding posisi absolut sinusoidal lama. Menggunakan rotasi matriks 2D ortogonal pada pasangan dimensi query dan key.
Dampak: Memungkinkan Raget 1.0 melakukan ekstrapolasi panjang konteks melampaui ukuran jendela pelatihan (dari 2.048 token hingga 16.384 token) secara stabil tanpa distorsi atensi.
Grouped-Query Attention (GQA):
Mengelompokkan Q head ke dalam subset K/V head bersama (misal 16 Query head berbagi 4 Key/Value head, rasio 4:1).
Dampak: Memangkas konsumsi RAM untuk memori inferensi KV-Cache hingga 75% di perangkat seluler pengguna tanpa mengorbankan kualitas representasi semantik multi-head.
SwiGLU Activation Function:
Menerapkan fungsi aktivasi terbobot non-linear Swish-Gated Linear Unit pada lapisan Feed-Forward Network: SwiGLU(x) = (xW_gate * sigmoid(beta * xW_gate)) * (xW_up).
Dampak: Memberikan konvergensi gradien yang jauh lebih cepat dan peningkatan efisiensi representasi parameter sebesar 15–20% dibandingkan aktivasi GeLU lama.
Compact Mixture-of-Experts (MoE 4x250M):
Membagi lapisan FFN menjadi 4 jaringan ahli independen berkapasitas 250M parameter, di mana router gating hanya mengaktifkan 2 ahli paling relevan per token secara dinamis.
Dampak: Memberikan kapasitas wawasan setara model 1 Miliar parameter dengan beban komputasi dan kecepatan eksekusi seringan model 500M parameter saat dijalankan luring.
## 10.2 Mesin Inferensi Cepat & Akselerasi Perangkat Klien (Edge Runtime Engine)
Pipelining Memori KV-Cache Terhalaman (Paged KV-Cache):
Mengalokasikan memori Key-Value cache secara modular dalam blok-blok halaman virtual (mirip paging pada sistem operasi memori virtual), mencegah fragmentasi heap memori RAM di JavaScript dan WebAssembly.
Speculative Decoding Berjenjang (Dual-Brain Speculative Pipeline):
Memanfaatkan Jalur Cepat Sistem 1 atau sub-model neural mini (Raget 50M) untuk memprediksi draf kandidat 4–5 token berikutnya dalam hitungan mikrodetik, kemudian model neural utama (Raget 1B) memverifikasi seluruh batch kandidat tersebut dalam satu lintasan komputasi paralel. Menghasilkan peningkatan kecepatan ketik balasan (tokens/second) sebesar 2x–3x lipat di layar ponsel.
Akselerasi Perangkat Keras WebGPU via WGSL Compute Shaders:
Memindahkan perkalian matriks tensor (GEMM) dari CPU JavaScript ke chip grafis terintegrasi (GPU ponsel) melalui WebGPU Compute Shaders (WGSL), menghasilkan inferensi hingga 15x lebih responsif dan hemat daya baterai.
Kuantisasi Ekstrem BitNet b1.58 / Int4 Matriks:
Mengompresi bobot safetensors ke dalam representasi terkuantisasi 4-bit (int4) dan arsitektur ternary BitNet {-1, 0, 1}. Menghilangkan kebutuhan perkalian titik kambang (floating-point multiply) yang rakus daya, digantikan operasi penjumlahan biner murni.
## 10.4 Memori Berjenjang & Temu Kembali Generasi Baru (Advanced Hybrid RAG)
Pencarian Hibrida Mandiri (Hybrid Search: BM25 + Dense Vector Reranking via RRF):
Mengombinasikan kekuatan pencarian leksikal eksak BM25 (untuk nama orang, kode pasal, tanggal, istilah teknis) dengan pencarian makna semantik vektor kosinus. Skor digabungkan menggunakan Reciprocal Rank Fusion: RRF_Score = 1/(60 + Rank_BM25) + 1/(60 + Rank_Vector). Menghilangkan kesalahan temu kembali dan halusinasi kutipan.
GraphRAG Entitas Lokal (Local Knowledge Graph):
Mengekstrak simpul entitas (Nama, Organisasi, Dokumen, Regulasi) dan sisi relasi antar-entitas dari dokumen yang disematkan ke Proyek, membentuk graf pengetahuan relasional yang tersimpan di IndexedDB.
Hierarchical Memory Architecture (Arsitektur Memori 3-Tingkat):
Membagi memori sistem menjadi 3 lapisan: Working Memory (sesi chat aktif), Episodic Memory (arsip ringkasan percakapan masa lalu), dan Semantic/Core Memory (fakta permanen pengguna di Kapsul Memori).
## 10.5 Orkestrasi Agenik Otonom & Dekode Terstruktur (Autonomous Agentic & Constrained Output)
Siklus Penalaran & Tindakan ReAct (Reasoning + Acting):
Mengendalikan pipa alur kerja turn-based: AI memetakan pikiran (Thought), menentukan aksi alat (Action), mengamati keluaran (Observation), dan menyusun simpulan akhir (Final Answer). Seluruh tahapan diproyeksikan langsung ke Zen Agentic Timeline Stepper.
Constrained Decoding / JSON Schema Enforcement:
Mengunci probabilitas keluaran model menggunakan grammar sampling berbasis regex dan skema JSON terkunci, menjamin pemanggilan fungsi alat perangkat (tools) dan pembentukan berkas artefak tidak pernah mengalami kegagalan sintaksis (100% valid JSON/markup).
## 10.6 Empat Studi Kasus Rekayasa End-to-End (4 Real-World Case Studies)
### Studi Kasus 1: Pembedah Dokumen Regulasi Hukum Tebal (PDF 100+ Halaman)
Skenario Pengguna: Pengguna mengunggah draf UU/Perpres 80 halaman ke Proyek dan bertanya: "Pasal berapa saja yang mengatur sanksi administrasi bagi platform digital dan bagaimana perbandingannya dengan aturan lama?"
Alur Kerja Pipa di Balik Layar:
Ingestion & Chunking: Dokumen dipecah menjadi unit paragraf semantik (500 karakter dengan overlap 50 karakter).
Hybrid Indexing: Sistem membuat indeks leksikal BM25 dan vektor sparse TF-IDF di memori RAM dan mencatat relasi pasal ke GraphRAG lokal.
ReAct Orchestration: Agent planner memecah kueri menjadi 2 sub-tugas: Temu kembali pasal sanksi dan Ekstraksi pasal pembanding.
Zen Stepper: Menampilkan simpul aktif: 📄 [Membaca Dokumen] -> 🧠 [Menganalisis Pasal Sanksi] -> 📊 [Menyusun Tabel Perbandingan].
Keluaran & Artefak: Jawaban disajikan dengan sitasi akurat (nomor pasal dan halaman) lengkap dengan tabel komparatif di obrolan, serta opsi satu ketukan: [ Simpan sebagai Naskah Kajian (.docx) ] ke Galeri Artefak.
### Studi Kasus 2: Digitalisasi Struk Belanja & Pembukuan Kas Otomatis (.xlsx)
Skenario Pengguna: Pengguna memotret struk belanja fisik yang kusut menggunakan tombol kamera di lembar lampiran dan memberi instruksi: "Rekap ke pembukuan bulanan."
Alur Kerja Pipa di Balik Layar:
Sensor Capture: Modul kamera mengambil foto beresolusi optimal dan menjalankan OCR lokal sisi klien.
Constrained JSON Extraction: Model memetakan teks mentah OCR ke dalam skema JSON baku: { tanggal, vendor, items: [{ nama, harga, qty, subtotal }], total }.
Math Engine Verification: Mesin toolsMath memvalidasi apakah jumlah subtotal barang sama persis dengan total pembayaran.
Binary XLSX Compilation: Modul xlsx-local.js mengompilasi lembar kerja Excel biner asli dengan rumus =SUM(D2:D10) dan header bergaya profesional.
Keluaran & Artefak: Obrolan menyajikan ringkasan total biaya, kartu pratinjau tabel interaktif, dan tombol [ 📥 Unduh Pembukuan.xlsx ] di Galeri Artefak.
### Studi Kasus 3: Agen Pembuat Slide Presentasi Bisnis Terpandu (.pptx)
Skenario Pengguna: Pengguna mengetuk tombol [ 📊 ] Buat Slide (.pptx) di lembar lampiran untuk menyiapkan materi pitching bisnis.
Alur Kerja Pipa di Balik Layar:
Mode Activation: Lembar lampiran tertutup, status slideActive = true aktif, dan kotak input chat menampilkan panduan: "Buatkan slide presentasi tentang: " tanpa unduh otomatis.
Interactive Dialog: Pengguna melengkapi: "Pitching Startup Kopi Berkelanjutan, 5 slide, audiens investor."
Outline Structuring: AI merancang kerangka 5 slide: Judul & Visi, Masalah Pasar, Solusi Unik, Model Bisnis, dan Proyeksi Traksi.
Visual Carousel Canvas: Kanvas Artefak / Split Screen menampilkan pratinjau slide bergaya editorial interaktif (dapat diedit langsung per poin oleh pengguna).
Manual Export: Berkas biner .pptx asli hanya diunduh ketika pengguna menekan tombol [ 📥 Unduh PPTX ] pada kartu artefak slide. Status slideActive otomatis kembali ke false.
### Studi Kasus 4: Lingkungan Koding Mandiri Luring di Studio WebApp/Python
Skenario Pengguna: Pengguna membuka Studio Kode dan meminta AI membuatkan aplikasi visualisasi kalkulator bunga pinjaman interaktif.
Alur Kerja Pipa di Balik Layar:
Code Generation: Raget 1.0 menghasilkan berkas HTML5, CSS3, dan logika JavaScript modern yang bersih.
Multi-Tab Editor: Berkas otomatis dipetakan ke tab index.html, style.css, dan app.js di CodeMirror.
Secure Sandboxing: Pratinjau langsung dijalankan di dalam iframe terisolasi (#studio-preview-frame) dengan atribut sandbox="allow-scripts" tanpa akses origin parent.
Export & Rujukan: Pengguna dapat menekan [ Jalankan ], menguji di tab Konsol, mengekspor berkas proyek ke format arsip [ Unduh ZIP ], atau menekan [ Jadikan Rujukan Proyek ] untuk memasukkannya ke basis pengetahuan proyek aktif.
## 10.7 Matriks Perintah Eksekusi Grok Build Sekali Jalan
css/account/settings.css:
Ganti baris 202–213 dengan penataan kontras token:
.theme-segmented .theme-btn.active,
.theme-segmented .font-btn.active {
background: var(--rg-accent);
color: var(--rg-accent-ink);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
border-color: transparent;
}
Hapus selektor penimpa .theme-btn.active { border-color: var(--rg-accent); color: var(--rg-accent); }.
js/chat/composer.js:
Pada penanganan pengiriman pesan (baris 584), pastikan status this.slideActive di-reset ke false setelah pesan slide disubmit dan panggil this.paintQuick().
js/ui/artifact.js:
Amankan fungsi renderDiagram (baris 232) dan renderChart (baris 257) dengan sanitasi markdown.escape() atau perenderan aman di dalam iframe #artifact-inline.
shared/markdown.js:
Perkuat isolasi Web Worker di markdown.run() dengan mengunci prototipe dan menonaktifkan seluruh antarmuka jaringan luring (WebSocket, EventSource, BroadcastChannel).
index.html:
Sematkan meta tag Content Security Policy ketat di bagian <head>.
Verifikasi Mutlak:
Jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error, 0 warning, Anti-placeholder: 0).
Sinkronisasikan seluruh isi dokumen Drive ini ke repositori docs/PRD/PRD-ANTARMUKA-3.0.md.
Alur pipeline turn-based: Kueri Pengguna → Fast-Path / Agent Planner → Zen Timeline Stepper Telemetri → Keluaran Kanvas Belah Adaptif (Split-Screen pada layar >=1024px) → Aksi Berkas Mandiri (.docx, .pptx, .xlsx) tanpa auto-download agresif.
## 10.8 Spesifikasi Profil Rekayasa Perangkat Keras (Hardware Profiling) & Batas Komputasi Seluler (Edge Device Constraints)
Profil Batas Perangkat Sasaran (Target Hardware Baseline):
Arsitektur CPU: ARM64 (Octa-core: Cortex-A78/A55 atau setara pada chipset Qualcomm Snapdragon 680/778G/8-series dan MediaTek Dimensity 700/8000).
Kapasitas RAM Fisik: 4 GB hingga 8 GB LPDDR4X/LPDDR5.
Alokasi Batas Heap Browser (V8 Engine Memory Ceiling): Maksimal 1.2 GB RAM untuk tab PWA Rategoan agar peramban tidak mengalami crash Out-of-Memory (OOM) oleh sistem operasi Android/iOS.
Manajemen Termal & Throttling: Algoritma inferensi wajib menyertakan interval jeda mikro (micro-yield await new Promise(r => setTimeout(r, 0)) setiap 16 token) untuk mencegah panas berlebih dan pelambatan termal pada baterai ponsel.
Arsitektur Pemetaan GPU Bergerak (Mobile GPU Tile-Based Rendering via WebGPU):
GPU Target: Adreno 610/642L/730 dan Mali-G57/G77/G710 yang mendukung WebGPU.
Ukuran Workgroup WGSL: Menggunakan ukuran workgroup @workgroup_size(64, 1, 1) yang optimal untuk arsitektur Tile-Based Deferred Rendering (TBDR) pada ponsel pintar.
Penyimpanan Buffer Bobot: Menggunakan GPUBuffer bertipe STORAGE | COPY_DST dengan format terkuantisasi uint32 untuk menghemat bandwidth memori VRAM seluler.
## 10.9 Spesifikasi Rekayasa Codebase & Parameter Runtime Aplikasi
Algoritma Reciprocal Rank Fusion (RRF) untuk Hybrid Search:
Peringkat akhir dokumen d dari hasil BM25 dan Dense Vector digabungkan melalui:
RRF(d) = 1 / (k + Rank_{BM25}(d)) + 1 / (k + Rank_{Vector}(d))
dengan konstanta perataan baku k = 60.
## 10.10 Skenario Tahapan Implementasi Berkelanjutan (Engine Scaffolding Roadmap)
Tahap 1: Stabilisasi Sasis & Ergonomi UI Kritis (Sprint Sekarang):
Memperbaiki kontras tombol tampilan pada css/account/settings.css.
Mengunci alur slide interaktif dan reset slideActive pada js/chat/composer.js.
Menerapkan sanitasi DOM XSS pada js/ui/artifact.js dan pembatasan isolasi Web Worker pada shared/markdown.js.
Memasang Content Security Policy ketat pada index.html.
Tahap 2: Pipa Hybrid Search & Paged RAG Lokal:
Mengintegrasikan modul raget/raget-vault/hybrid-search.js yang menggabungkan indeks BM25 dengan inverted index TF-IDF di IndexedDB.
Menghubungkan ekstraksi entitas GraphRAG pada berkas rujukan proyek aktif di js/project/pin-index.js.
Tahap 3: Runtime WebGPU & Penyatuan Raget 1.0 Neural:
Membangun modul raget/raget-neural/runtime/webgpu-runner.js dengan shader WGSL untuk akselerasi komputasi bobot safetensors di peramban.
Menerapkan Paged KV-Cache untuk streaming token teks berkecepatan tinggi luring di perangkat seluler.
# BAB 11: DOKTRIN POSISIONING DUAL-ANCHOR, STANDAR PERSONA TAKTIS ANTI-FILLER, ENKRIPSI DATABASE PIN, DAN INFRASTRUKTUR SISI KLIEN AGNOSTIK PARAMETER 1B–2B
## 11.1 Doktrin Posisioning Pasar "Dual-Anchor" (Dua Senjata Kedaulatan)
## 11.0 Penegakan Batasan Wilayah Workstation
Fokus Tajam Repositori Aplikasi: Bab ini menegaskan aturan operasi dan arsitektur pengonsumsi bobot di dalam repositori aplikasi. Pengembangan model neural eksternal dan pipelines data dilarang mencampuri implementasi di repositori ini.
Jangkar 1: Kerahasiaan Dokumen Sensitif 100% Luring (Zero Cloud Leakage):
Rategoan diposisikan sebagai ruang kerja aman mutlak bagi kalangan profesional (pengacara, akuntan, dokter, peneliti, mahasiswa, aparatur sipil) yang menangani dokumen rahasia (kontrak bisnis, putusan pengadilan, rekam medis, skripsi/tesis, laporan keuangan).
Seluruh pemrosesan, ekstraksi, dan temu kembali dokumen (Hybrid RAG) berjalan murni di memori RAM perangkat tanpa ada sebutir data pun yang keluar ke server internet pihak ketiga.
Jangkar 2: Generator Berkas Fisik Nyata Sekali Ketuk (Bukan Sekadar Chatbot Teks):
Rategoan bukan chatbot percakapan biasa yang hanya memuntahkan teks obrolan mentah untuk disalin-tempel manual.
Rategoan adalah workstation yang memproduksi berkas fisik siap pakai: presentasi PowerPoint biner asli (.pptx), lembar kerja berumus Excel (.xlsx), naskah kajian Word (.docx), dan arsip proyek (.zip).
## 11.2 Standar Persona & Gaya Tutur Kata AI (Pragmatic Executive & Anti-Filler Policy)
Kebijakan Nol Basa-Basi (Zero Conversational Filler):
Model Raget dilarang keras membuka respons dengan kalimat pembuka klise yang membuang ruang layar ponsel dan memboroskan token (contoh dilarang: "Tentu saja! Saya sangat senang bisa membantu Anda...", "Pertanyaan yang sangat bagus sekali...", "Baik, mari kita bahas hal ini...").
Prinsip Jawaban Langsung ke Solusi (Lead-with-Solution / Answer-First):
Setiap balasan wajib langsung mengemukakan kesimpulan inti atau solusi utama pada baris pertama, kemudian diikuti oleh penjabaran terstruktur:
Butir-butir poin bernomor urut logis.
Tabel perbandingan komparatif jika menyangkut multi-faktor.
Blok kode atau rumus matematika yang bersih tanpa pengantar berlebihan.
Bahasa Indonesia Formal-Modern Berwibawa:
Tutur bahasa menggunakan bahasa Indonesia baku, jernih, tajam, dan percaya diri; tidak menggunakan bahasa kaku perundang-undangan kuno, dan tidak menggunakan bahasa gaul santai yang mengurangi kredibilitas workstation profesional.
## 11.3 Infrastruktur Skalabel Agnostik Parameter (Rentang Fleksibel 1B, 1.5B, hingga 2B)
Prinsip Rekayasa: Kesiapan Jalur Rel Sebelum Menentukan Ukuran Lokomotif:
Sistem tidak mengunci secara kaku ukuran model akhir, melainkan membangun infrastruktur peramban yang fleksibel dan tangguh untuk menampung rentang parameter 1 Miliar (1B), 1.5 Miliar (1.5B), hingga 2 Miliar (2B) parameter.
Ukuran model final akan ditentukan berdasarkan hasil pengujian termal, kelancaran FPS, dan latensi komputasi nyata pada peramban ponsel.
Batas Anggaran Memori (Memory Budgeting per Tier):
Tier 1B (Kuantisasi Int4): Kebutuhan bobot ~600 MB VRAM. Sangat ringan, responsivitas tinggi pada ponsel kelas menengah (RAM 4 GB).
Tier 1.5B (Kuantisasi Int4): Kebutuhan bobot ~900 MB VRAM. Keseimbangan optimal antara penalaran analitis dan kecepatan ketik.
Tier 2B (Kuantisasi Int4): Kebutuhan bobot ~1.2 GB VRAM. Batas atas performa maksimal di bawah batas V8 heap ceiling ponsel kelas atas (RAM 6 GB–8 GB).
Pondasi Arsitektur Universal Bersama:
Seluruh varian ukuran (1B, 1.5B, 2B) menggunakan cetak biru arsitektur yang sama persis: RoPE (Rotary Position Embedding) untuk konteks panjang hingga 16K token, GQA 4:1 (Grouped-Query Attention) untuk memangkas 75% KV-cache, aktivasi SwiGLU, dan eksekusi GPU lokal via WebGPU WGSL shaders.
## 11.5 Penguatan Enkripsi Database Berbasis PIN (Database-Level AES-GCM 256)
Evolusi dari Kunci UI Menjadi Kunci Data Riil:
Mengubah mekanisme penguncian PIN dari sekadar penutup antarmuka (pin-overlay.hidden) menjadi enkripsi simetris nyata pada data persisten.
Mekanisme Kriptografi Database Lokal:
Saat pengguna mengaktifkan PIN, sistem membangkitkan kunci enkripsi simetris AES-GCM 256-bit menggunakan fungsi derivasi kunci PBKDF2 (SHA-256, 100.000 iterasi dengan salt acak 16 byte).
Seluruh payload sesi percakapan, dokumen lampiran, dan artefak yang ditulis ke IndexedDB (raget_idb) dienkripsi menjadi ciphertext sebelum disimpan.
Saat aplikasi dibuka kembali, data hanya dapat didekripsi ke dalam memori kerja setelah pengguna memasukkan PIN yang valid. Jika peramban dibuka oleh pihak lain melalui Developer Tools, seluruh data di IndexedDB berstatus terenkripsi dan tidak dapat dibaca.
# BAB 12: PENYEMPURNAAN 4 PILAR WORKSTATION (RUMAH, KERANGKA, LISTRIK, MESIN) & MANDAT PEMBERSIHAN DOKUMEN ARSIP FOLDER RAGET (ANTI-HALUSINASI AI)
## 12.1 Penyempurnaan 4 Pilar Utama Rekayasa Workstation
### 1. Pilar 1: Rumah (Casing, Antarmuka, Ergonomi PWA & Layar Seluler)
Sinkronisasi Dinamis Keyboard Virtual (Visual Viewport API):
Pada js/main.js dan css/layout/shell.css, kunci variabel --vvh dan posisi bilah komposer input secara real-time terhadap window.visualViewport.height.
Mencegah pergeseran tata letak canggung (layout jump) atau komposer tertutup keyboard saat mengetik di peramban seluler Android dan iOS.
Respon Sentuhan Mikro (Tactile Haptic Feedback):
Integrasikan getaran mikro peramban (navigator.vibrate(10)) pada event pengiriman pesan, penyalinan teks/kode, dan penggantian tab/filter untuk sensasi aplikasi native yang solid.
Pemberitahuan Pembaruan PWA yang Anggun (Graceful Service Worker Lifecycle):
Di sw.js, tangani event controllerchange dengan menampilkan toast pembaruan non-intrusif: "Versi baru tersedia. [Muat Ulang]", tanpa pernah memaksa refresh otomatis di tengah interaksi pengguna.
### 2. Pilar 2: Kerangka (Sasis, Kriptografi Database & Retensi Memori)
Kriptografi Nyata Database Lokal (AES-GCM 256 di idb-gateway.js):
Hubungkan modul pin.js dengan idb-gateway.js. Jika PIN aktif, seluruh payload sesi percakapan, dokumen lampiran, dan artefak dienkripsi simetris menggunakan AES-GCM 256-bit dengan kunci turunan PBKDF2 sebelum ditulis ke IndexedDB (raget_idb).
Menghilangkan celah di mana data masih berstatus plain-text saat dibuka via browser Developer Tools.
Manajemen Kuota Lampiran & Pembersihan Otomatis (Attachment Garbage Collection):
Batasi total kuota lampiran media sementara di IndexedDB maksimal 50 MB. Berkas media lama yang tidak disematkan ke Proyek otomatis dibersihkan secara berkala agar tidak memenuhi kapasitas penyimpanan internal perangkat pengguna.
Pipa Migrasi Skema Aman (Zero-Data-Loss IDB Versioning):
Standardisasi event onupgradeneeded pada IndexedDB dengan versioning bertingkat untuk menjamin data sesi lama pengguna tidak pernah korup saat terjadi pembaruan rilis aplikasi.
### 3. Pilar 3: Instalasi Listrik (Wiring Harness, Dedicated Web Worker & Tool Contract)
Offloading Komputasi Berat ke Dedicated Background Worker (raget-worker.js):
Pindahkan komputasi berat (pencarian Hybrid RAG, pemindaian BM25 dokumen tebal, ekstraksi tabel Excel, dan kompresi ZIP) dari main UI thread ke Web Worker di latar belakang.
Memastikan thread antarmuka peramban tetap berjalan konstan pada 60 FPS tanpa getaran atau pembekuan layar (zero stutter).
Standarisasi Kontrak Antarmuka Alat Klien (Client-Side Tool Contract):
Standardisasi 29 alat mandiri di connector-hub.js ke dalam format skema ketat { name, description, parameters, execute } agar siap diintegrasikan secara instan dengan mesin model AI mana pun (Sistem 1 maupun model neural 1B–2B) tanpa perombakan kode.
### 4. Pilar 4: Mesin (Ruang Runtime Klien WebGPU & Paged KV-Cache di Repositori)
Modul Pemuat Bobot WebGPU (raget/raget-neural/runtime/webgpu-runner.js):
Siapkan sasis runtime WebGPU WGSL yang mampu membaca dan memetakan bobot terkuantisasi (int4) langsung ke dalam memori VRAM GPU ponsel (Adreno/Mali).
Buffer Atensi Paged KV-Cache:
Bangun struktur virtual page table (16 token per blok) di JavaScript/Wasm agar sesi percakapan panjang tidak memicu fragmentasi atau kebocoran memori heap RAM.
Penajaman Logika Dual-Brain Router:
Sapaan, konversi, kalkulus, dan 260 database pengetahuan JSON diselesaikan 100% di Sistem 1 (<10ms, hemat baterai), sedangkan kueri penalaran mendalam dialirkan ke Sistem 2.
## 12.2 Mandat Pembersihan & Pelabelan Arsip Folder raget/ (Anti-Halusinasi AI Pengamat)
### 1. Akar Masalah Keracunan Konteks di Folder raget/
Model AI eksternal (seperti Claude dan Qwen) membaca berkas-berkas catatan masa lalu di dalam repositori dan mengalami halusinasi parah:
Di raget/raget-devlog/neural/: Terdapat laporan kuno seperti training-report-massive200m-round8-colab-gpu.json bertanggal 3 September 2026 dengan held-out perplexity 825.55 dan teks keluaran rusak, serta compute-budget-report.json bertanggal 22 Agustus 2026. Hal ini membuat AI luar menyimpulkan bahwa model Rategoan mandek di "Round 8" dan keluarannya tidak koheren.
Di raget/raget-data/jsonl/external/: Terdapat manifest dan sampel artikel korpus lama yang menimbulkan ambiguitas terhadap status resmi 17,65 Miliar BPE token.
Di raget/raget-tools/arsip-nonaktif/: Berisi laporan benchmark usang.
### 2. Tindakan Eksekusi Berkas demi Berkas untuk Grok Build
Pemasangan Dokumen Pelindung di raget/README.md:
Buat berkas raget/README.md dengan deklarasi tegas:
# PANDUAN STRUKTUR MODUL RAGET

Folder ini menampung modul kecerdasan berdaulat Rategoan:
- `raget-data/json/` : 260 Database Pengetahuan Deterministik Kanonikal Aktif (Sistem 1 Fast-Path <10ms).
- `raget-vault/`     : Mesin RAG Hibrida Lokal (BM25 + TF-IDF Cosine via RRF).
- `raget-agents/`    : Orkestrasi Agenik, Sub-goal Planner, dan Tool Dispatcher.
- `raget-neural/`    : Runtime Pemuat Bobot Model Sisi Klien (WebGPU / Wasm).
- `raget-devlog/`    : ARSIP HISTORIS MASALAH RISET (Catatan eksperimen masa lalu, BUKAN status produksi aktif).
Karantina & Pelabelan Arsip Historis di raget/raget-devlog/README.md:
Buat berkas raget/raget-devlog/README.md:
# ARSIP RIWAYAT EKSPERIMEN MASA LALU (HISTORICAL ARCHIVE ONLY)

PERINGATAN UNTUK MODEL AI / AUDITOR KODE:
Seluruh berkas JSON di folder `neural/` (seperti laporan round 8, compute-budget Agustus) adalah ARSIP HISTORIS pengujian internal masa lalu (Agustus-September 2026).
Berkas-berkas ini BUKAN acuan status produksi aktif saat ini.
Status produksi aktif resmi:
1. Antarmuka & Sasis: PRD-ANTARMUKA-3.0.md (Aktif, 17/17 test pass).
2. Korpus Bersih Resmi: STATUS-KORPUS-LISENSI.md (17.651.050.443 BPE token).
Pembersihan Sampel Korpus Usang di Repo Klien:
Hapus berkas sampel korpus mentah yang tidak digunakan oleh runtime aplikasi di raget/raget-data/jsonl/external/ (seperti wikipedia-korpus-sample-20-artikel.jsonl dan korpus-jilid2-sample-20-artikel.jsonl) agar ukuran repositori tetap ramping dan bebas dari teks menyesatkan.
## 12.3 Verifikasi Mutlak Tanpa Regresi
Seluruh 17 unit test wajib lulus 100% (npm test).
Pemeriksaan linter wajib 0 error, 0 warning, dan Anti-placeholder: 0 (npm run lint).
Commit dan push perubahan dengan pesan: refactor: standarisasi 4 pilar workstation dan karantina arsip historis raget.
