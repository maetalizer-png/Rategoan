<!-- Sumber: Google Drive "PRD antarmuka 3.0" file 1mpemubzthUoDt3Hp3FaWXGoW47tz21RqwLA1wG5_5iw, diubah 2026-10-05T20:36:04Z. -->

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
