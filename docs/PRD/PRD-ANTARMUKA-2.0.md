<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T18:49:14Z. Versi 2.5.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 2.5.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: FILOSOFI KEDAULATAN MUTLAK & ANATOMI SISTEM
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri: Raget Template (otak deterministik instan berbasis data & FAQ kanonikal) dan Raget Neural (otak jaringan saraf tiruan lokal berdaulat milik Rategoan yang dilatih dari nol menggunakan korpus rilis Rategoan).
Purge Total Entitas Asing: Segala opsi pemilih "Server Mandiri (Ollama)" yang sempat muncul di js/account/settings.js wajib dihapus tuntas. Hanya boleh ada dua mesin sah: Raget Template dan Raget Neural.
Desain Berkelas Industri Bersih: Menghilangkan seluruh teks slogan indie/amatir (seperti "akun lokal berdaulat" atau "ruang kerja mandiri") dari profil pengguna. Tampilan profil disajikan bersih, elegan, dan profesional setara aplikasi kelas dunia: Avatar melingkar, Nama Pengguna tebal, dan Alamat Email abu-abu.
Zero Cloud Dependency for Core UI: Seluruh antarmuka inti, editor studio, lembar lampiran, kanvas kerja, dan mesin inferensi lokal beroperasi 100% mandiri di peramban tanpa ketergantungan API pihak ketiga.
1.3 Standar Ergonomi Seluler & Segmented ControlsKedaulatan Data Terenkripsi: Data percakapan, instruksi proyek, berkas tersemat, dan memori disimpan secara lokal di peramban (IndexedDB dan LocalStorage terenkripsi AES-GCM 256-bit).
## 1.2 Anatomi 4 Pilar Perakitan Rategoan
Rumah (Wadah & Casing): Antarmuka PWA responsif mobile-first, bersih, modern, dan bebas dari animasi atau tata letak canggung.
Kerangka (Sasis & Struktur): Arsitektur penyimpanan bertingkat (LocalStorage untuk preferensi mikro <500KB; IndexedDB idb-gateway.js untuk chat, lampiran, berkas proyek, dan kanvas) serta event bus lokal.
Kabel-Kabel (Wiring Harness & Konektor Aksi): Sistem Client-Side Tool Dispatcher lokal yang menghubungkan otak AI dengan 33 alat lokal nyata (File System, Sensor, Coder Sandbox, Pengolah Data, dan Agenda).
Mesin (Otak AI Siap Colok): Dua slot modular: Raget Template (aktif default, <10ms, deterministik) dan Raget Neural (sedang training korpus rilis, siap dicolok tanpa ubah kerangka).

Batas Sentuh Ramah Jempol: Seluruh tombol aksi, tab, dan chip interaktif wajib memiliki area sentuh minimal 44 × 44 piksel.
Desain Segmented Control Standar Industri: Pemilih opsi biner atau multi-opsi (seperti tema Terang/Sistem/Gelap dan ukuran font) dilarang menggunakan tombol berlebar kaku 34px yang menyebabkan teks meluber. Wajib menggunakan wadah segmented pill control berlatar lembut (background: var(--rg-surface-2)), tombol fleksibel (min-width: 60px; padding: 6px 14px;), dengan tombol aktif berlatar putih/kartu dan bayangan halus (subtle shadow).
Anti-Luber Horizontal Mutlak: Container utama wajib terkunci (overflow-x: hidden). Scrolling horizontal HANYA diperbolehkan pada komponen khusus yang secara eksplisit membutuhkan geser (seperti riwayat obrolan .recent-chips), sedangkan daftar filter artefak wajib menggunakan tata letak adaptif (flex-wrap).
Stabilitas Viewport Seluler (Virtual Keyboard Pinning): Saat keyboard virtual muncul di ponsel, area tulis (composer-box) wajib melekat mulus tepat di atas keyboard menggunakan CSS variable --vvh berbasis window.visualViewport, tanpa menggeser atau memotong header aplikasi.
## 1.4 Hukum Dua Keadaan (The Two-State UI Law)
State Kosong (Empty State): Wajib berupa Hero Card terintegrasi dengan ikon SVG berlatar warna pastel, penjelasan ramah, tombol template cerdas, dan form pembuatan yang menyatu rapi.
State Aktif (Active State): Menampilkan panel kerja terstruktur, daftar berkas tersemat, dan kontrol manajemen tanpa menyembunyikan tombol pembuatan entitas baru.
## 1.5 Standar Mutu Kode, Observabilitas & Kontrol Pembatalan (QC & AbortController)
Nol Blok Catch Kosong: Dilarang keras menulis blok catch (e) {} yang menelan galat dalam diam. Seluruh penanganan galat wajib mencatat konteks secara transparan: console.warn('[Rategoan Fallback] <NamaModul>:', e).
Kendali Pembatalan Inferensi (Abortable Inference): Setiap siklus penjawab AI wajib memiliki objek AbortController. Pengguna berhak menghentikan proses generasi jawaban yang sedang berjalan sewaktu-waktu.
Kelulusan Uji Mutlak: Setiap commit wajib mempertahankan 100% kelulusan pada seluruh unit test (npm test) dan zero error/warning pada linter (npm run lint).

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
2. Bersihkan sampah disk dan cache: rm -rf /tmp/rategoan_* .eslintcache && npm cache clean --force 2>/dev/null || true
3. Pastikan working tree git bersih: git status --porcelain
4. Verifikasi baseline awal: npm test && npm run lint

# BAB 3: REKAYASA TAMPILAN & PENGALAMAN PENGGUNA (COMPREHENSIVE UX OVERHAUL)
## 3.1 Perbaikan Tata Letak Halaman Tampilan & Segmented Control (css/account/settings.css)
Akar Masalah: Pada layar ponsel (360px), wadah .theme-segmented memakan ruang horizontal lebar sehingga label di sebelah kiri (Mode Gelap dan Ukuran Teks) tertekan ke 84px dan patah menjadi 2 baris kaku ("Mode" lalu "Gelap").
Rekayasa Solusi: Terapkan tata letak bertumpuk rapi (Stacked Layout) pada .set-row-theme dan .set-row-font dengan header terpisah dan bar kontrol segmented membentang 100% lebar layar secara fleksibel.
## 3.2 Transformasi Lembar Lampirkan (Ikon SVG Nyata & Anti-Polos)

Akar Masalah: Tombol media saat ini hanya berupa lingkaran warna kosong tanpa ikon di dalamnya (<span class="attach-orb"></span>).
Rekayasa Solusi: Pasang IKON SVG NYATA di dalam lingkaran warna pastel pada index.html dengan ukuran orb 44 × 44 piksel:
Kamera (Orb Biru): SVG kamera presisi (viewBox="0 0 24 24", path aperture + flash).
Foto & Galeri (Orb Ungu): SVG lanskap gambar (viewBox="0 0 24 24", path frame foto + gunung).
Dokumen (Orb Hijau): SVG lembar berkas (viewBox="0 0 24 24", path dokumen berlipat sudut).
Memo Suara (Orb Oranye): SVG mikrofon (viewBox="0 0 24 24", path kapsul mic + tiang penyangga).
## 3.3 Penataan Ulang Halaman Proyek (#view-project — Hero Workspace Card)
Keadaan Kosong (Empty State): Bungkus menjadi satu Hero Creation Card berbingkai halus (.project-hero-card):
Ikon Koper/Folder besar berlatar biru lembut.
Judul: "Ruang Kerja Proyek".
Deskripsi: "Fokuskan AI dengan instruksi khusus dan berkas rujukan permanen untuk topik tertentu."
Bagian Template Cepat: "Mulai dari template:" diikuti chip pills horizontal (Riset akademik, Pengembangan web, Naskah, Dokumen bisnis). Mengklik chip otomatis mengisi nama proyek.
Baris Pembuatan Terpadu: Kolom input nama proyek menyatu elegan dengan tombol pil Buat Proyek.
Keadaan Aktif (Active State):
Header menampilkan tombol + Proyek Baru di sisi kanan yang membuka form pembuatan proyek baru tanpa menghapus proyek yang ada.
Panel Aktif: Menampilkan nama proyek aktif, textarea instruksi bersudut halus, daftar berkas PDF/DOCX tersemat (dengan ukuran KB dan tombol hapus), serta tombol aksi utama Buka di Obrolan →.
## 3.4 Standarisasi Industri Halaman Pengaturan & Eliminasi Teks Amatir (#view-settings)
Profil Bersih Tanpa Slogan: Di js/account/settings.js, HAPUS TOTAL elemen lencana profil mengambang (<div class="profile-badge">Ruang Kerja Mandiri</div> ataupun "akun lokal berdaulat"). Profil disajikan murni standar industri: Avatar melingkar berbingkai halus, Nama Pengguna tebal, dan Alamat Email abu-abu.
Meteran Kapasitas Penyimpanan: Sediakan bar kapasitas visual penyimpanan peramban yang bersih: Penyimpanan: 2.1 MB / 50 MB dengan bar progres hijau lembut.
Model Hub Murni Rategoan (Kategori data-cat="ai"): Hapus total opsi "Server Mandiri (Ollama)". Tampilkan kartu pemilih DUA OTAK RESMI RATEGOAN: ⚡ Raget Template (penalaran instan, deterministik, tanpa halusinasi, dan hemat daya - Aktif Default) dan 🧠 Raget Neural (model bahasa jaringan saraf tiruan lokal berdaulat milik Rategoan sendiri yang sedang dalam proses pelatihan).
## 3.5 Pengalaman Chat Modern: Tombol Hentikan Generasi, Lightbox & Indikator Offline
Tombol Hentikan Generasi (Stop Generating Pill): Saat AI sedang menghasilkan jawaban atau menalar, tombol kirim panah biru otomatis berubah menjadi tombol merah/hitam dengan ikon kotak berhenti [ ⏹️ Berhenti ]. Menekannya memicu abortController.abort() dan menghentikan pengetikan seketika.
Foto Obrolan Modern & Lightbox: Render gambar tajam (minimal 800px) ber-border-radius 16px, lenyapkan nama file teks kamera-xxx.jpg, pasang modal lightbox untuk perbesar layar penuh, dan hilangkan tooltip bulat OCR mengambang.
Indikator Ketenangan Mode Mandiri Offline: Ketika perangkat tidak memiliki internet, tampilkan pil status halus di header obrolan: [ ⚡ Mandiri (Offline) ] untuk meyakinkan pengguna bahwa seluruh kemampuan inti Rategoan tetap bekerja 100%.
Artefak Tanpa Efek Geser (No-Slide): Ganti wadah #artifact-filters menjadi display: flex; flex-wrap: wrap; gap: 8px; overflow-x: visible;. Tampilkan lencana format berkas berwarna (PPTX oranye, DOCX biru, CODE ungu, CSV toska).
Split-Screen Artifact Canvas: Di desktop/tablet, kode dan dokumen terbuka berdampingan dengan obrolan; di ponsel tampil sebagai lembar bawah geser dengan tab alih cepat [ Chat | Kanvas ].

# BAB 4: SKENARIO OPERASIONAL FITUR AI MODERN & KABEL-KABEL KONEKTOR
## 4.1 Skenario Cowork (Kanvas Kolaborasi / Split-Screen Workspace)
Konsep & Alur Kerja:
Pengguna meminta pembuatan naskah, laporan kerja, dokumen hukum, atau tabel perencanaan.
Rategoan TIDAK menimbun teks panjang di dalam gelembung obrolan, melainkan secara otomatis membuka panel kanvas artefak di sisi kanan (Split-Screen pada layar >= 1024px, atau tab [ Chat | Kanvas ] pada layar seluler).
Teks dokumen dialirkan (streamed) langsung ke dalam editor kanvas.
Kolaborasi Langsung (Interactive Coworking):
Pengguna dapat mengklik dan mengedit teks kanvas secara langsung (live contentEditable / rich-text).
Pengguna dapat memilih blok teks di kanvas dan menekan tombol kontekstual: "Minta AI Perbaiki Bagian Ini" / "Perluas Pembahasan", yang otomatis mengirim instruksi kembali ke panel obrolan kiri untuk memperbarui kanvas.
Ekspor Dokumen Mandiri:
Toolbar kanvas menyediakan tombol ekspor instan 1-klik: Salin Teks, Unduh Markdown (.md), Unduh Dokumen (.docx), dan Cetak Rapi (.pdf). Seluruh berkas kanvas tersimpan otomatis di IndexedDB.
## 4.2 Skenario Coder (Studio Koding, Syntax Highlighting, Diff Viewer, & Sandbox Eksekusi)
Konsep & Alur Kerja:
Pengguna meminta solusi koding, pembuatan skrip data, atau perbaikan algoritma.
Blok kode dirender dengan penomoran baris (line numbers), syntax highlighting presisi, dan lencana bahasa (JavaScript, Python, HTML/CSS, SQL, JSON).
Tampilan Perbandingan Kode (Diff Viewer):
Ketika AI merevisi fungsi atau berkas kode yang sudah ada, tampilan otomatis menyediakan tab alih: [ Kode Final | Tinjau Perubahan (Diff) ].
Tab Diff menampilkan baris yang dihapus dengan latar merah muda (- baris) dan baris baru dengan latar hijau muda (+ baris), memberi transparansi penuh bagi programmer.
Sandbox Eksekusi Lokal Terisolasi (Web Worker Execution):
Setiap blok kode JavaScript/JSON dilengkapi tombol [ ▶️ Uji Kode (Run) ].
Menekan tombol ini mengirim kode ke dalam Web Worker lokal terisolasi (sandbox).
Hasil keluaran skrip (stdout, nilai kembalian, atau galat) dirender langsung pada konsol mini di bawah blok kode secara instan tanpa internet dan tanpa membahayakan sesi utama peramban.
## 4.3 Skenario Sistem Skills (Modul Keahlian Mandiri & Sovereign Skill Registry)
Konsep & Alur Kerja:
Mengadopsi arsitektur keahlian modular, Rategoan menyediakan pemilih Skill aktif di samping bar composer: [ 🎯 Keahlian: Umum ▾ ].
Pengguna dapat memilih paket keahlian spesifik:
Skill Analis Data & Finansial: Fokus pada angka, validasi tabel CSV, dan kalkulasi presisi math-engine.
Skill Auditor Kode & Coder: Fokus pada arsitektur perangkat lunak, refactoring aman, dan unit testing.
Skill Penulis Teknis & PRD: Mengunci format baku spesifikasi industri, use-case, dan diagram alir.
Skill Peneliti & RAG Vault: Fokus pada ekstraksi fakta dari dokumen tersemat tanpa spekulasi.
Mekanisme Kerja Saraf Lokal:
Penggantian Skill secara instan menyuntikkan template prompt sistem ke dalam memori sesi lokal dan membatasi set alat lokal (local tools) yang relevan untuk meminimalkan latensi dan menjaga akurasi respons.
## 4.4 Skenario Kendali Komputer & Akses Berkas Lokal (Local OS Bridge)
Integrasi File System Access API:
Pengguna di desktop/laptop dapat menekan tombol [ 📂 Hubungkan Folder Lokal ] di menu Proyek atau Lampiran.
Peramban memanggil window.showDirectoryPicker() untuk mendapatkan izin akses ke folder kerja pengguna di hard drive lokal.
Rategoan memetakan struktur berkas secara aman di memori sesi lokal, membaca isi berkas kode/naskah tanpa mengirimnya ke jaringan, dan dapat menyimpan kembali hasil revisi langsung ke berkas fisik atas konfirmasi pengguna.
Penghubung Perangkat Keras Lokal:
Jembatan Web APIs lokal (Web Audio API untuk perekaman mikrofon, MediaDevices API untuk kamera, dan Clipboard API untuk pertukaran teks cepat) disatukan di bawah satu protokol izin ramah privasi.
## 4.5 Katalog 6 Ekosistem Bawaan Baru (33 Alat Lokal Nyata)
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
index.html, css/account/settings.css, css/ui/overhaul.css, js/account/settings.js
1. Pasang ikon SVG nyata di dalam .attach-orb (Kamera, Foto, Dokumen, Mic).
2. Terapkan tata letak bertumpuk .set-row-theme agar label 'Mode Gelap' dan 'Ukuran Teks' utuh 1 baris.
3. Satukan form Proyek ke dalam Hero Creation Card (.project-hero-card).
4. Hapus lencana profil mengambang 'Ruang Kerja Mandiri' di profil Pengaturan.
5. Hapus tuntas opsi Ollama dari pemilih mesin AI di settings.js.
Fase 3
Kanvas Cowork & Studio Coder
js/artifacts/, js/chat/, css/ui/overhaul.css
1. Bangun split-screen live kanvas untuk dokumen/naskah panjang dengan tombol ekspor (.md/.docx/.pdf).
2. Pasang syntax highlighter, penomoran baris, dan komponen Diff Viewer (perubahan merah/hijau).
3. Integrasikan Web Worker terisolasi untuk tombol [ ▶️ Uji Kode (Run) ] lokal.
Fase 4
Sistem Skills & Akses Berkas Lokal
js/connectors/, js/state/, js/project/
1. Daftarkan 6 Ekosistem Bawaan Baru (33 Alat Lokal) di connector-state.js dan pasang Client-Side Tool Dispatcher di tool-card.js.
2. Pasang pemilih Skill aktif di bar obrolan.
3. Hubungkan File System Access API untuk integrasi folder kerja lokal di Proyek.
Fase 5
Pembersihan QC & Verifikasi Mandiri
Seluruh berkas JavaScript & Unit Test
Ganti seluruh 29 blok catch kosong dengan log transparan console.warn, jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error).

1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).
4. Pemindaian regex catch\s*\([^\)]*\)\s*\{\s*\} menghasilkan angka 0 di seluruh repositori.
5. Tombol pemilih tema tampil rapi dengan label "Mode Gelap" dan "Ukuran Teks" utuh dalam 1 baris tanpa patah kata.
6. Lembar lampiran menampilkan 4 ikon SVG nyata yang jelas di dalam lingkaran warna pastel (Kamera, Foto, Dokumen, Memo Suara).
7. Halaman Proyek menyajikan Hero Creation Card yang rapi tanpa ruang putih canggung.
8. Profil Pengaturan berpenampilan bersih standar industri murni: Avatar, Nama, dan Email, bebas dari teks slogan amatir.
9. Tidak ada lagi sebutan atau opsi Ollama maupun model pihak ketiga di seluruh antarmuka aplikasi.
10. Kanvas Cowork, Coder Diff/Run, dan 33 Alat Lokal terhubung penuh dan siap dioperasikan.
