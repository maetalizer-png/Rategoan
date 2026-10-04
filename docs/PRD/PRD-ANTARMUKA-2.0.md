<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T19:37:48Z. Versi 2.9.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 2.9.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: IDENTITAS KEDAULATAN ASLI RATEGOAN & DIFERENSIASI MODUL
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri: Raget Template (otak deterministik instan berbasis data & FAQ kanonikal) dan Raget Neural (otak jaringan saraf tiruan lokal berdaulat milik Rategoan yang dilatih dari nol menggunakan korpus rilis Rategoan).
Purge Total Entitas Asing: Seluruh opsi pemilih "Server Mandiri (Ollama)" dan jalur jaringan ke luar telah dicabut tuntas. Hanya ada dua mesin sah: Raget Template dan Raget Neural.
Desain Berkelas Industri Bersih: Profil pengguna disajikan bersih standar enterprise: Avatar melingkar, Nama Pengguna tebal, Alamat Email abu-abu, dan meter kapasitas penyimpanan lokal. Tidak boleh ada lencana slogan mengambang.
Zero Cloud Dependency for Core UI: Seluruh antarmuka inti, kanvas kerja, studio koding, lembar lampiran, dan mesin inferensi lokal beroperasi 100% mandiri di peramban tanpa ketergantungan API pihak ketiga.
Kedaulatan Data Terenkripsi: Data percakapan, instruksi proyek, berkas tersemat, dan memori disimpan secara lokal di peramban (IndexedDB dan LocalStorage terenkripsi AES-GCM 256-bit).
## 1.2 Identitas Asli Nama Sidebar Rategoan & Peningkatan Fungsional
Nama-nama di Sidebar Rategoan TIDAK BOLEH diubah menjadi panjang atau menggunakan istilah hybrid asing yang canggung (seperti "Kanvas Cowork" atau "Studio Coder"). Penamaan yang sudah ada di sidebar Rategoan saat ini SUDAH BENAR, ringkas, berwibawa, dan memiliki identitas kedaulatan sendiri. Yang dilakukan adalah PENINGKATAN FUNGSIONAL:
Chat Baru:
Identitas: Titik awal percakapan interaktif harian.
Peningkatan: Responsif, bersih, didukung AbortController, dan indikator offline [ ⚡ Mandiri (Offline) ].
Studio kode:
Identitas: Identitas resmi Rategoan untuk lingkungan rekayasa kode (setara peran Claude Code / Codex).
Peningkatan: Ditingkatkan menjadi lingkungan rekayasa mandiri dengan integrasi folder lokal komputer (File System Access API), penjelajah berkas, penomoran baris, Diff Viewer (perubahan kode), dan eksekusi skrip Web Worker lokal.
Proyek:
Identitas: Ruang kerja bertopik dengan brankas berkas permanen (PDF/DOCX) dan instruksi khusus.
Peningkatan: Hero Creation Card terpadu (.project-hero-card), chip template cepat, dan manajemen berkas tersemat.
Artefak:
Identitas: Identitas resmi Rategoan untuk hasil kerja naskah, laporan, dan dokumen hidup (setara peran Cowork / Artifacts).
Peningkatan: Ditingkatkan menjadi meja kerja interaktif (split-screen pada desktop, tab Chat | Kanvas pada ponsel) yang bisa diedit langsung bersama AI dan diekspor ke Word (.docx), Markdown (.md), atau cetak (.pdf).
Koleksi:
Identitas: Galeri penyimpanan rangkuman, kutipan penting, dan memo pengguna.
Konektor:
Identitas: Rumah bagi 33 alat lokal berdaulat (Client-Side Dispatcher) tanpa bergantung backend luar.
## 1.3 Standar Ergonomi Seluler & Minimalisme Kelas Dunia
Bilah Tulis Lega (Spacious Input Principle): Area pengetikan pesan (composer box) wajib steril dari elemen-elemen canggung yang memakan ruang horizontal. DILARANG menaruh teks label "Keahlian" dan pil lonjong "Umum" di dalam bilah tulis.
Batas Sentuh Ramah Jempol: Seluruh tombol aksi, tab, dan chip interaktif wajib memiliki area sentuh minimal 44 × 44 piksel.
Desain Segmented Control Bertumpuk: Pemilih tema dan ukuran teks wajib menggunakan wadah bertumpuk (Stacked Layout) agar label teks tidak patah per kata.
Anti-Luber Horizontal Mutlak: Container utama wajib terkunci (overflow-x: hidden).
Stabilitas Viewport Seluler (Virtual Keyboard Pinning): Saat keyboard virtual muncul di ponsel, area tulis (composer-box) wajib melekat mulus tepat di atas keyboard menggunakan CSS variable --vvh berbasis window.visualViewport, tanpa menggeser header aplikasi.
## 1.4 Hukum Dua Keadaan (The Two-State UI Law)
State Kosong (Empty State): Wajib berupa Hero Card terintegrasi dengan ikon SVG berlatar warna pastel, penjelasan ramah, tombol template cerdas, dan form pembuatan yang menyatu rapi.
State Aktif (Active State): Menampilkan panel kerja terstruktur, daftar berkas tersemat, dan kontrol manajemen tanpa menyembunyikan tombol pembuatan entitas baru.
## 1.5 Standar Mutu Kode & Observabilitas
Nol Blok Catch Kosong: Dilarang keras menulis blok catch (e) {} yang menelan galat dalam diam. Seluruh penanganan galat wajib mencatat konteks secara transparan: console.warn('[Rategoan Fallback] <NamaModul>:', e).
Kendali Pembatalan Inferensi (Abortable Inference): Setiap siklus penjawab AI wajib memiliki objek AbortController dengan tombol visual [ ⏹️ Berhenti ].
Kelulusan Uji Mutlak: Mempertahankan 100% kelulusan pada seluruh unit test (npm test) dan zero error/warning pada linter (npm run lint).

# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
## 2.1 Pola Sesi Maraton Otonom (Deep Sprint Engine)
Eksekusi Mandiri Terpadu: Agen (Grok Build) diwajibkan menyelesaikan seluruh paket pekerjaan besar dalam satu putaran kerja utuh tanpa berhenti sepotong-sepotong di setiap berkas.
Protokol Anti-Bawel (Zero Premature Chatter): Dilarang memotong alur kerja hanya untuk menanyakan konfirmasi gaya CSS atau penamaan variabel minor. Agen memiliki otoritas teknis penuh selama berada dalam koridor PRD 2.0.
Lingkaran Verifikasi Mandiri (Self-Healing Loop): Agen wajib menjalankan npm test dan npm run lint secara otomatis. Jika ditemukan kegagalan kode, agen wajib memperbaikinya sendiri hingga 100% hijau sebelum melapor.
Catatan Detak Jantung (Heartbeat Ledger): Dokumentasi status berkala dicatat ke berkas log lokal sprint-run.log tanpa memutus aliran kerja.
## 2.2 Prosedur Sanitasi Pra-Eksekusi (Pre-Flight Clean Run)
Sebelum memulai sesi maraton, Grok Build WAJIB membersihkan lingkungan kerja untuk mencegah kegagalan akibat disk penuh atau proses zombie:
Catatan Keamanan*: Dilarang keras mereset atau menghapus direktori .git/, berkas konfigurasi inti (package.json), berkas dokumentasi (docs/PRD/), atau data korpus rilis (raget-data/).
1. Hentikan proses zombie liar: pkill -f "node.*test" || true
2. Bersihkan sampah disk dan cache temporer: rm -rf /tmp/rategoan_* .eslintcache && npm cache clean --force 2>/dev/null || true
3. Pastikan working tree git bersih: git status --porcelain
4. Verifikasi baseline awal: npm test && npm run lint

# BAB 3: REKAYASA TAMPILAN & PENGALAMAN PENGGUNA (COMPREHENSIVE UX OVERHAUL)
## 3.1 Konfirmasi Struktur Asli Sidebar Drawer (#sidebar)
Pertahankan penamaan ringkas asli Rategoan dengan pengelompokan zona yang rapi:
1. Zona Atas (side-head & side-kicker "Utama"):
Header: Judul Rategoan.
Chat Baru (Ikon Balon Chat Plus).
Studio kode (Ikon Kurung Siku </> — Lingkungan koding, repositori lokal, diff viewer, dan sandbox).
Proyek (Ikon Map Folder — Ruang kerja berkas rujukan permanen).
2. Zona Ruang Kerja (side-kicker "Ruang kerja"):
Koleksi (Ikon Bookmark).
Konektor (Ikon Steker — Akses 33 alat lokal berdaulat).
Artefak (Ikon Kotak Dokumen/Grid — Galeri naskah, laporan, dan dokumen kanvas Cowork).
3. Garis Pembatas (Divider):
4. Zona Bawah (Riwayat & Pencarian):
Riwayat Chat dan kolom pencarian [ Cari riwayat... ].
Daftar riwayat percakapan terkini yang dapat diklik atau dihapus.
5. Footer Drawer:
Kartu Profil Pengguna: Avatar inisial melingkar, Nama Pengguna, Email, dan Pengaturan ⚙️.
## 3.2 Penyucian Total Lembar Lampirkan (#attach-sheet — Tombol `+`)
1. Akar Masalah: Ditemukan seksi "Studio" yang memuat "Studio Kode", "Kaitkan ke Proyek", dan "Belajar terpandu" di dalam lembar lampiran (#attach-sheet). Ini membuat menu berjejal dan menduplikasi sidebar.
2. Rekayasa Solusi Mutlak:
HAPUS TOTAL seksi "Studio" beserta tombol "Studio Kode", "Kaitkan ke Proyek", dan "Belajar terpandu" dari lembar lampiran (#attach-sheet).
Lembar lampiran (+) HANYA difungsikan untuk melampirkan media ke obrolan aktif:
a. Baris 4 Orb Media Ber-SVG Nyata (Ukuran 44 × 44 px):
Kamera (Orb Biru): SVG kamera presisi.
Foto (Orb Ungu): SVG lanskap gambar.
Dokumen (Orb Hijau): SVG lembar berkas.
Memo Suara (Orb Oranye): SVG mikrofon.
c. Satu Baris Aksi Bersih:b. Mode Penalaran:
Pencarian Web, Berpikir lebih keras, Riset mendalam, Mode kilat.

"Hubungkan Folder Lokal" (ikon folder, keterangan: "Baca berkas di komputer ini tanpa unggah").
## 3.3 Pembersihan Total Bilah Tulis Composer (#composer-box — Area Keyboard)
1. Akar Masalah: Bilah bawah composer dijejali teks label "Keahlian" dan tombol lonjong "Umum v" di samping tombol (+) dan mikrofon yang memakan lebih dari 60% ruang layar ponsel.
2. Rekayasa Solusi Mutlak:
HAPUS TOTAL elemen label <label class="skill-pick">Keahlian <select id="skill-select"> dari bilah bawah composer (#composer-box) di index.html dan css terkait.
Area pengetikan dikembalikan ke standar kemurnian minimalis:
Sisi Kiri: Tombol bulat [+] (Lampirkan).
Area Tengah: Input textarea luas ber-placeholder "Tanya Rategoan".
Sisi Kanan: Tombol [🎤] (Mikrofon) yang otomatis berubah menjadi [➤] (Kirim) saat ada teks diketik.
Bilah tulis kembali lapang, lega, dan nyaman diketik dengan satu tangan.
## 3.4 Penataan Ulang Halaman Proyek (#view-project — Hero Workspace Card)
## 3.7 Pengalaman Obrolan Modern
## 3.4 Penataan Ulang Halaman Tampilan & Segmented Controls (css/account/settings.css)
Tata Letak Bertumpuk (Stacked Layout) pada .set-row-theme dan .set-row-font: label di baris atas, dan kontrol segmented Terang/Sistem/Gelap serta Kecil/Normal/Besar membentang penuh 100% di baris bawah tanpa mematahkan kata "Mode Gelap".
## 3.5 Penataan Ulang Halaman Proyek (#view-project — Hero Workspace Card)
Keadaan Kosong (Empty State): Hero Creation Card (.project-hero-card) yang menyatukan ikon folder, judul, deskripsi, template cepat (Riset, Web, Naskah, Bisnis), dan form pembuatan nama proyek.
Keadaan Aktif (Active State): Menampilkan daftar berkas tersemat (dengan tombol hapus dan ukuran KB), textarea instruksi khusus, dan tombol aksi "Buka di Obrolan ->". Tombol "+ Proyek Baru" berada di header kanan.
## 3.6 Pengaturan Bersih Standar Industri (#view-settings)
Profil Bersih: Avatar melingkar, Nama Pengguna, Email abu-abu, dan bar kapasitas penyimpanan lokal (Penyimpanan: x MB / 50 MB). Dilarang menampilkan teks lencana mengambang.
## 3.7 Pengalaman Obrolan Modern
Tombol Hentikan Generasi: Tombol kirim otomatis berubah menjadi tombol merah/hitam [ ⏹️ Berhenti ] saat inferensi berjalan, memicu abortController.abort().
Foto & Lightbox: Resolusi gambar minimal 800px, border-radius 16px, klik untuk perbesar modal layar penuh, tanpa teks nama berkas kamera mentah.
Indikator Offline: Pil status halus di header [ ⚡ Mandiri (Offline) ] saat jaringan mati.
Artefak No-Slide: Filter artefak menggunakan flex-wrap tanpa slider horizontal kaku.

# BAB 4: ARSITEKTUR PENINGKATAN: STUDIO KODE, ARTEFAK & 33 ALAT LOKAL
## 4.1 Peningkatan Kapabilitas "Studio kode" (Identitas Rekayasa Rategoan)
Peran Nyata: Studio kode adalah ruang kerja rekayasa perangkat lunak mandiri di Rategoan (setara Claude Code / Codex).
Peningkatan Teknis:
Penjelajah Berkas Lokal: Integrasi File System Access API untuk membuka folder proyek di komputer pengguna secara offline.
Editor Multi-File: Dukungan tab berkas (index.html, style.css, script.js, python scripts) dengan nomor baris dan syntax highlighting.
Diff Viewer (Tinjau Perubahan): Menampilkan perbandingan visual antara kode asli dan kode hasil revisi AI (baris merah untuk kode dihapus, baris hijau untuk kode ditambahkan).
Eksekusi Sandbox Lokal: Menjalankan kode JavaScript/Python di Web Worker / WASM lokal via tombol [ Jalankan ] tanpa server luar.
## 4.2 Peningkatan Kapabilitas "Artefak" (Identitas Dokumen & Cowork Rategoan)
Peran Nyata: Artefak adalah ruang kerja kolaboratif naskah, laporan, dan dokumen hidup (setara Claude Artifacts / Canvas).
Peningkatan Teknis:
Split-Screen Otomatis: Saat obrolan memproduksi dokumen panjang, panel artefak terbuka di sebelah kanan (desktop) atau via tab alih [ Chat | Kanvas ] (ponsel).
Live Editing: Pengguna dapat mengklik dan mengedit teks naskah langsung di kanvas.
Revisi Kontekstual: Sorot bagian teks di kanvas dan minta revisi kembali ke AI.
Ekspor Instan: Tombol salin, unduh Markdown (.md), unduh Dokumen (.docx), dan cetak (.pdf).
## 4.3 Katalog 6 Ekosistem Bawaan Baru (33 Alat Lokal Nyata di Konektor)
Daftarkan ke dalam CATALOG di js/connectors/connector-state.js dengan konfigurasi system_native: true, connected: true, dieksekusi via Client-Side Tool Dispatcher di tool-card.js tanpa fetch server backend:
Vault Dokumen & RAG Pribadi (local_document_vault — 6 Alat): vault_index_document, vault_semantic_search, vault_summarize_doc, vault_qna_document, vault_compare_docs, vault_export_knowledge.
Mata & Vision OCR Mandiri (local_vision_ocr — 4 Alat): vision_extract_text, vision_parse_table, vision_color_palette, vision_qr_barcode.
Asisten Suara & Audio Overview (local_voice_audio — 4 Alat): audio_speech_to_text, audio_text_to_speech, audio_generate_overview, audio_voice_notes.
Mesin Kalkulus, Finansial & Data (local_math_compute — 5 Alat): math_calculate_expression, math_statistics_summary, math_currency_converter, math_date_calculator, math_unit_conversion.
Penyusun Artefak & Visualisasi Grafis (local_artifact_canvas — 5 Alat): canvas_render_chart, canvas_generate_diagram, canvas_export_presentation, canvas_export_document, canvas_export_data.
Agenda, Pengingat & Rutinitas Kedaulatan (local_agenda_routine — 5 Alat): agenda_add_task, agenda_list_upcoming, agenda_parse_ics, agenda_export_calendar, agenda_daily_briefing.

# BAB 5: BLUEPRINT EKSEKUSI MEGA SPRINT & VERIFIKASI AKHIR
Grok Build diwajibkan mengeksekusi seluruh pekerjaan dalam 5 fase linier terpadu tanpa interupsi:

Kriteria Kelulusan Akhir (Definition of Done):
Fase
Fokus Modul
Berkas Sasaran
Pekerjaan Kunci
Fase 1
Sanitasi Lingkungan
Lingkungan Terminal / Sandbox
Bunuh proses zombie (pkill -f node), bersihkan /tmp/ dan .eslintcache, pastikan npm test & npm run lint 100% hijau.
Fase 2
Perbaikan UI & 5 Poin Instan
index.html, js/ui/nav.js, css/ui/overhaul.css
1. Pertahankan nama asli ringkas di sidebar: Chat Baru, Studio kode, Proyek, Koleksi, Konektor, Artefak.
2. HAPUS TOTAL seksi 'Studio' beserta 'Studio Kode', 'Kaitkan ke Proyek', dan 'Belajar terpandu' dari #attach-sheet. Sisakan 4 orb media ber-SVG + Mode Penalaran + Hubungkan Folder Lokal.
3. HAPUS TOTAL label 'Keahlian' dan select dropdown 'Umum' dari bilah bawah composer (#composer-box) agar area ketik kembali lapang dan lega.
4. Pertahankan tata letak bertumpuk .set-row-theme agar label Mode Gelap tidak patah.
5. Pertahankan profil bersih tanpa slogan dan tanpa opsi Ollama di settings.js.
Fase 3
Peningkatan Studio kode & Artefak
js/artifacts/, js/chat/, css/ui/overhaul.css, js/ui/
1. Peningkatan Artefak: panel split-screen/tab ponsel untuk naskah panjang dengan tombol ekspor (.md, .docx, cetak .pdf).
2. Peningkatan Studio kode: Diff Viewer (merah/hijau) dan tombol [ Jalankan ] via Web Worker lokal di view studio.
Fase 4
Ekosistem 33 Alat & Akses Folder Lokal
js/connectors/, js/project/
1. Daftarkan 6 Ekosistem Bawaan Baru (33 Alat Lokal) di connector-state.js dan pasang Client-Side Tool Dispatcher di tool-card.js.
2. Hubungkan File System Access API untuk integrasi folder kerja lokal di Proyek dan lembar lampiran.
Fase 5
Pembersihan QC & Verifikasi Mandiri
Seluruh berkas JavaScript & Unit Test
Ganti seluruh blok catch kosong dengan log transparan console.warn, jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error).

1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).
4. Pemindaian regex catch\s*\([^\)]*\)\s*\{\s*\} menghasilkan angka 0 di seluruh repositori.
5. Nama di sidebar tetap ringkas dan berdaulat: Chat Baru, Studio kode, Proyek, Koleksi, Konektor, Artefak.
6. Lembar lampiran (+) bersih total dari seksi 'Studio' (Studio Kode, Kaitkan ke Proyek), hanya berisi 4 orb media ber-SVG, mode penalaran, dan Hubungkan Folder Lokal.
7. Bilah pengetikan pesan (composer) bersih total dari teks 'Keahlian' dan dropdown 'Umum', menghasilkan ruang input yang lega dan minimalis.
8. Peningkatan fungsional Studio kode, Artefak, dan 33 Alat Lokal terhubung penuh dan siap dioperasikan.
