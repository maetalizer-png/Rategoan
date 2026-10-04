<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T17:51:07Z. Versi 2.3.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI LENGKAP)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 2.3.0-DEFINITIVE-MASTER | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: FILOSOFI KEDAULATAN & PRINSIP DESAIN STANDAR INDUSTRI
## 1.1 Kedaulatan Sistem & Desain Berkelas Industri
Standar Aplikasi Profesional: Antarmuka Rategoan harus memancarkan estetika standar industri setara Apple, Google, dan OpenAI. Dilarang menggunakan teks slogan amatir/indie (seperti "akun lokal berdaulat") pada kartu profil pengguna. Seluruh elemen identitas disajikan secara bersih, elegan, dan profesional.
Zero Cloud Dependency for Core UI: Seluruh antarmuka inti, editor studio, lembar lampiran, dan mesin inferensi lokal beroperasi 100% mandiri di peramban tanpa ketergantungan API pihak ketiga.
Zero Bloatware: Tetap menggunakan Vanilla JavaScript modern (ES Modules) murni tanpa framework raksasa yang memperlambat rendering ponsel.
Kedaulatan Data Terenkripsi: Data percakapan, instruksi proyek, berkas tersemat, dan kredensial OAuth disimpan secara lokal di peramban (IndexedDB dan LocalStorage terenkripsi AES-GCM 256-bit).

Batas Sentuh Ramah Jempol: Seluruh tombol aksi, tab, dan chip interaktif wajib memiliki area sentuh minimal 44 × 44 piksel.
Desain Segmented Control Standar Industri: Pemilih opsi biner atau multi-opsi (seperti tema Terang/Sistem/Gelap dan ukuran font) dilarang menggunakan tombol berlebar kaku 34px yang menyebabkan teks meluber. Wajib menggunakan wadah segmented pill control berlatar lembut (background: var(--rg-surface-2)), tombol fleksibel (min-width: 60px; padding: 6px 14px;), dengan tombol aktif berlatar putih/kartu dan bayangan halus (subtle shadow).
Anti-Luber Horizontal Mutlak: Container utama wajib terkunci (overflow-x: hidden). Scrolling horizontal HANYA diperbolehkan pada komponen khusus yang secara eksplisit membutuhkan geser (seperti riwayat obrolan .recent-chips), sedangkan daftar filter artefak wajib menggunakan tata letak adaptif (flex-wrap).
Stabilitas Viewport Seluler (Virtual Keyboard Pinning): Saat keyboard virtual muncul di ponsel, area tulis (composer-box) wajib melekat mulus tepat di atas keyboard menggunakan CSS variable --vvh berbasis window.visualViewport, tanpa menggeser atau memotong header aplikasi.
## 1.3 Hukum Dua Keadaan (The Two-State UI Law)
State Kosong (Empty State): Wajib berupa Hero Card terintegrasi dengan ikon SVG berlatar warna pastel, penjelasan ramah, tombol template cerdas, dan form pembuatan yang menyatu rapi.
State Aktif (Active State): Menampilkan panel kerja terstruktur, daftar berkas tersemat, dan kontrol manajemen tanpa menyembunyikan tombol pembuatan entitas baru.
## 1.4 Standar Mutu Kode, Observabilitas & Kontrol Pembatalan (QC & AbortController)
Nol Blok Catch Kosong: Dilarang keras menulis blok catch (e) {} yang menelan galat dalam diam. Seluruh penanganan galat wajib mencatat konteks secara transparan: console.warn('[Rategoan Fallback] <NamaModul>:', e).
Arsitektur Penyimpanan Bertingkat (Tiered Storage Architecture):
LocalStorage: Dibatasi HANYA untuk preferensi konfigurasi mikro (< 500 KB, misal: tema, id sesi aktif, setting suara).
IndexedDB (idb-gateway.js): Digunakan untuk seluruh muatan data berat (riwayat chat lengkap, lampiran foto, teks berkas pinnedFiles proyek, dan basis pengetahuan RAG). Ini menjamin aplikasi kebal dari galat fatal peramban QuotaExceededError.
Kendali Pembatalan Inferensi (Abortable Inference): Setiap siklus penjawab AI wajib memiliki objek AbortController. Pengguna berhak menghentikan proses generasi jawaban yang sedang berjalan sewaktu-waktu.
Kelulusan Uji Mutlak: Setiap commit wajib mempertahankan 100% kelulusan pada seluruh unit test (npm test) dan zero error/warning pada linter (npm run lint).
# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
Mengadopsi metodologi eksekusi latar belakang otonom (sebagaimana diterapkan pada Manus AI), agen pengembang (Grok Build) wajib mematuhi protokol maraton 2–5 jam tanpa henti berikut:
## 2.2 Prosedur Sanitasi Pra-Eksekusi (Pre-Flight Clean Run)
## 2.1 Pola Sesi Maraton Otonom (Deep Sprint Engine)
Eksekusi Mandiri Terpadu: Agen dilarang berhenti sepotong-sepotong di setiap berkas. Seluruh paket pekerjaan harus diselesaikan dalam satu putaran kerja utuh.
Protokol Anti-Bawel (Zero Premature Chatter): Dilarang memotong alur kerja hanya untuk menanyakan konfirmasi gaya CSS atau penamaan variabel minor. Agen memiliki otoritas teknis penuh selama berada dalam koridor PRD 2.0.
Lingkaran Verifikasi Mandiri (Self-Healing Loop): Agen wajib menjalankan npm test dan npm run lint secara otomatis. Jika ditemukan kegagalan kode, agen wajib memperbaikinya sendiri hingga 100% hijau sebelum melapor.
Catatan Detak Jantung (Heartbeat Ledger): Dokumentasi status berkala dicatat ke berkas log lokal sprint-run.log tanpa memutus aliran kerja.
Sebelum memulai sesi maraton, Grok Build WAJIB membersihkan lingkungan kerja untuk mencegah kegagalan akibat disk penuh atau proses zombie:
*Catatan Keamanan*: Dilarang keras mereset atau menghapus direktori .git/, berkas konfigurasi inti (package.json), berkas dokumentasi (docs/PRD/), atau data korpus rilis (raget-data/).
# 1. Hentikan proses zombie liar di latar belakang
pkill -f "node.*test" || true

# 2. Bersihkan sampah disk dan cache temporer
rm -rf /tmp/rategoan_* .eslintcache
npm cache clean --force 2>/dev/null || true

# 3. Pastikan working tree git bersih
git status --porcelain

# 4. Verifikasi baseline awal (wajib 100% hijau sebelum modifikasi dimulai)
npm test
npm run lint

# BAB 3: REKAYASA TAMPILAN & PENGALAMAN PENGGUNA (COMPREHENSIVE UX OVERHAUL)
## 3.1 Perbaikan Segmented Control Mode Gelap & Tampilan (js/account/settings.js & css/account/settings.css)
Akar Masalah: Tombol tema saat ini menggunakan fixed width 34px dengan teks penuh (Terang, Sistem, Gelap), sehingga teks meluber dan tombol bertumpuk kaku.
Rekayasa Solusi:
Ubah wadah .font-btns untuk tema menjadi .theme-segmented:
3.2 Transformasi Lembar Lampirkan (#attach-sheet — Kaya Ikon & Anti-Polos)
.theme-segmented {
display: flex;
background: var(--rg-surface-2, #f1f5f9);
padding: 3px;
border-radius: 12px;
gap: 2px;
border: 1px solid var(--rg-line);
}
.theme-btn {
flex: 1;
min-width: 64px;
height: 32px;
border: none;
border-radius: 9px;
font-size: 12.5px;
font-weight: 600;
color: var(--rg-muted);
background: transparent;
cursor: pointer;
transition: all 0.15s ease;
text-align: center;
}
.theme-btn.active {
background: var(--rg-card, #ffffff);
color: var(--rg-text, #0f172a);
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
font-weight: 700;
}
Terapkan struktur segmented control serupa pada baris Ukuran Teks (Kecil, Normal, Besar).

Akar Masalah: Lembar lampiran saat ini tampak kosong dan polos (hanya teks di dalam kotak putih tanpa ikon dan tanpa warna penegas).
Rekayasa Solusi (Arsitektur 3 Zona Kaya Visual):
Zona 1: Media Masukan Ber-Ikon Lingkaran Pastel:
Zona 2: Mode Penalaran Ber-Ikon & Saklar Switch:Kamera: Lingkaran biru lembut (#eff6ff), ikon SVG kamera biru (#2563eb).
Foto/Galeri: Lingkaran ungu lembut (#f5f3ff), ikon SVG galeri ungu (#7c3aed).
Dokumen: Lingkaran hijau lembut (#f0fdf4), ikon SVG berkas hijau (#16a34a).
Memo Suara: Lingkaran oranye lembut (#fff7ed), ikon SVG mikrofon oranye (#ea580c).

Zona 3: Studio Pembuatan & Ruang Kerja Berpanah Chevron:Setiap baris memiliki ikon berwarna di sebelah kiri, label tebal, subteks deskripsi abu-abu, dan saklar switch iOS di sebelah kanan.
🌐 Pencarian Web (Ikon Bola Dunia Biru, subteks: "Menelusuri informasi mutakhir di internet").
🧠 Berpikir Lebih Keras (Ikon Otak/Bohlam Oranye, subteks: "Menampilkan proses penalaran bertahap (CoT)").
🔬 Riset Mendalam (Ikon Kaca Pembesar Ungu, subteks: "Investigasi multi-sumber & laporan komprehensif").
⚡ Mode Kilat (Ikon Petir Kuning, subteks: "Jawaban ringkas cepat hemat daya").

*Penting*: Seluruh ID elemen DOM eksisting (#sheet-camera, #sheet-photo, #sheet-file, #sheet-websearch, #sheet-think, #sheet-research, #sheet-slide, #sheet-project, #sheet-learn) wajib dipertahankan.📊 Buat Slide Presentasi (.pptx).
📄 Buat Dokumen Word (.docx).
💻 Buka Studio Kode (JS/Python).
📁 Kaitkan ke Proyek (dengan badge pill nama proyek aktif).
📖 Belajar Terpandu (Socratic Tutor).

## 3.3 Penataan Ulang Halaman Proyek (#view-project — Hero Workspace Card)
Akar Masalah: Form input mengambang kaku di atas kartu template, menyisakan ruang putih kosong yang masif.
Rekayasa Solusi:
Keadaan Kosong (Empty State):
Keadaan Aktif (Active State):Bungkus menjadi satu Hero Creation Card berbingkai halus (.project-hero-card):
Ikon Koper/Folder besar berlatar biru lembut.
Judul: "Ruang Kerja Proyek".
Deskripsi: "Fokuskan AI dengan instruksi khusus dan berkas rujukan permanen untuk topik tertentu."
Bagian Template Cepat: "Mulai dari template:" diikuti chip pills horizontal (Riset akademik, Pengembangan web, Naskah, Dokumen bisnis). Mengklik chip otomatis mengisi nama proyek.
Baris Pembuatan Terpadu: Kolom input nama proyek menyatu elegan dengan tombol pil Buat Proyek.

Header menampilkan tombol + Proyek Baru di sisi kanan yang membuka dialog/accordion pembuatan proyek baru tanpa menghapus proyek yang ada.
Panel Aktif: Menampilkan nama proyek aktif, textarea instruksi bersudut halus, daftar berkas PDF/DOCX tersemat (dengan ukuran KB dan tombol hapus), serta tombol aksi utama Buka di Obrolan →.
## 3.4 Standarisasi Industri Halaman Pengaturan & Model Hub (#view-settings)
Profil Profesional Bersih:
Meteran Kapasitas Penyimpanan:Avatar melingkar berbingkai halus, nama pengguna tebal, dan alamat email abu-abu.
Hapus teks slogan "akun lokal berdaulat". Ganti dengan lencana profesional ramping di samping nama: [ Ruang Kerja Mandiri ].

Meteran Kapasitas Penyimpanan: Di bawah profil, sediakan bar kapasitas visual yang bersih: Penyimpanan Lokal: 2.1 MB / 50 MB (IndexedDB Aktif) dengan bar progres hijau lembut.

Model Hub di Pengaturan (Kategori data-cat="ai"): Jangan hanya menampilkan baris server kustom! Sediakan kartu pemilih mesin inferensi visual: Raget Template (mesin penalaran deterministik instan), Raget Neural (model bahasa jaringan saraf tiruan lokal berdaulat), dan Server Mandiri (Ollama / Localhost API) untuk koneksi langsung ke endpoint AI lokal komputer pengguna.
## 3.5 Pengalaman Chat Modern: Tombol Hentikan Generasi, Lightbox & Indikator Offline
Tombol Hentikan Generasi (Stop Generating Pill): Saat AI sedang menghasilkan jawaban atau menalar, tombol kirim panah biru otomatis berubah menjadi tombol merah/hitam dengan ikon kotak berhenti [ ⏹️ Berhenti ]. Menekannya memicu abortController.abort() dan menghentikan pengetikan seketika.
Foto Obrolan Modern & Lightbox: Render gambar tajam (minimal 800px) ber-border-radius 16px, lenyapkan nama file teks kamera-xxx.jpg, pasang modal lightbox untuk perbesar layar penuh, dan hilangkan tooltip bulat OCR mengambang.
Indikator Ketenangan Mode Mandiri Offline: Ketika perangkat tidak memiliki internet, tampilkan pil status halus di header obrolan: [ ⚡ Mandiri (Offline) ] untuk meyakinkan pengguna bahwa seluruh kemampuan inti Rategoan tetap bekerja 100%.
Artefak Tanpa Efek Geser (No-Slide): Ganti wadah #artifact-filters menjadi display: flex; flex-wrap: wrap; gap: 8px; overflow-x: visible;. Tampilkan lencana format berkas berwarna (PPTX oranye, DOCX biru, CODE ungu, CSV toska).
Split-Screen Artifact Canvas: Di desktop/tablet, kode dan dokumen terbuka berdampingan dengan obrolan; di ponsel tampil sebagai lembar bawah geser dengan tab alih cepat [ Chat | Kanvas ].
# BAB 4: EKOSISTEM KONEKTOR BAWAAN LOKAL & HYBRID GOOGLE
## 4.1 Client-Side Tool Dispatcher di tool-card.js
Fungsi runConnectorTool(name, parameters) di js/connectors/tool-card.js wajib disuntikkan percabangan eksekusi lokal sebelum pemanggilan fetch():
Jika nama alat berawalan math_, vault_, vision_, canvas_, audio_, atau agenda_: Sistem langsung mengeksekusi fungsi JavaScript lokal di peramban tanpa melempar permintaan ke server backend.
## 4.2 Katalog 6 Ekosistem Bawaan Baru (33 Alat Lokal Nyata)
Daftarkan ke dalam CATALOG di js/connectors/connector-state.js dengan konfigurasi system_native: true, connected: true:
Vault Dokumen & RAG Pribadi (local_document_vault — 6 Alat): Penyimpanan dan pencarian semantik dokumen (PDF, DOCX, TXT, MD, CSV) 100% offline via IndexedDB dan local-rag.js (vault_index_document, vault_semantic_search, vault_summarize_doc, vault_qna_document, vault_compare_docs, vault_export_knowledge).
Mata & Vision OCR Mandiri (local_vision_ocr — 4 Alat): Ekstraksi teks foto struk/naskah via Tesseract WebAssembly lokal, deteksi tabel gambar ke CSV/Markdown, ekstraksi palet warna, dan pembacaan QR/Barcode (vision_extract_text, vision_parse_table, vision_color_palette, vision_qr_barcode).
Asisten Suara & Audio Overview (local_voice_audio — 4 Alat): Transkripsi suara pengguna tanpa jeda server, pembacaan TTS suara alami, pembuatan naskah audio rangkuman dokumen bergaya podcast, dan memo suara (audio_speech_to_text, audio_text_to_speech, audio_generate_overview, audio_voice_notes).
Mesin Kalkulus, Finansial & Data (local_math_compute — 5 Alat): Kalkulasi aljabar/matriks presisi tinggi via math-engine.js, ringkasan statistik tabel, konversi mata uang ter-cache, kalkulator tanggal/hari kerja, dan konversi satuan ilmiah (math_calculate_expression, math_statistics_summary, math_currency_converter, math_date_calculator, math_unit_conversion).
Penyusun Artefak & Visualisasi Grafis (local_artifact_canvas — 5 Alat): Render grafik batang/garis/pai interaktif di chat, generator diagram alir logika Mermaid, ekspor presentasi (.pptx), ekspor dokumen (.docx/.pdf cetak), dan ekspor data (.csv) (canvas_render_chart, canvas_generate_diagram, canvas_export_presentation, canvas_export_document, canvas_export_data).
Agenda, Pengingat & Rutinitas Kedaulatan (local_agenda_routine — 5 Alat): Manajemen tugas lokal, pengingat jadwal peramban, parser kalender universal .ics, ekspor kalender, dan Daily Briefing pagi cerdas (agenda_add_task, agenda_list_upcoming, agenda_parse_ics, agenda_export_calendar, agenda_daily_briefing).
## 4.3 Jembatan Google Workspace Dual-Mode & Server Lokal Eksternal (Ollama)
Mode Terhubung (Online): Menghubungkan Google Drive, Google Calendar, dan Gmail secara langsung dari peramban pengguna menggunakan Google Identity Services (GIS) token client murni tanpa server perantara. Token disimpan terenkripsi AES-GCM 256-bit di rategoan_connectors_vault.
Mode Ketahanan Mandiri (Offline): Jika perangkat kehilangan koneksi, sistem secara otomatis beralih ke padanan lokal (Drive → Vault Dokumen Lokal; Calendar → Kalender ICS Lokal; Gmail → Draf Kapsul Memori Lokal) tanpa memutus produktivitas pengguna.
Dukungan Ollama / Localhost (Server Mandiri): Memungkinkan pengguna mengarahkan konektor eksternal ke http://localhost:11434 untuk mengeksekusi model lokal berdaya besar di mesin lokal mereka secara aman.

# BAB 5: BLUEPRINT EKSEKUSI MEGA SPRINT & VERIFIKASI AKHIR
Grok Build diwajibkan mengeksekusi seluruh pekerjaan dalam 5 fase linier terpadu tanpa interupsi:
Fase
Fokus Modul
Berkas Sasaran
Pekerjaan Kunci
Fase 1
Sanitasi Lingkungan
Lingkungan Terminal / Sandbox
Bunuh proses zombie (pkill -f node), bersihkan /tmp/ dan .eslintcache, pastikan npm test & npm run lint 100% hijau.
Fase 2
Struktur HTML & Gaya CSS
index.html, css/ui/overhaul.css, css/account/settings.css
Pasang .theme-segmented pada tombol tema dan font, pasang kartu media ber-ikon lingkaran pastel dan ber-subteks pada #attach-sheet, rancang Hero Card terpadu pada Proyek, pasang wadah #image-lightbox, tombol Stop Generasi di composer, ubah filter artefak jadi flex-wrap, pasang gaya Grouped Cards pada Pengaturan tanpa teks amatir.
Fase 3
Refaktor Logika Frontend
js/project/, js/chat/, js/sheets/, js/artifacts/, js/account/, js/state/
Naikkan resolusi foto ke 800px di attach.js, lenyapkan teks nama file kamera mentah dan pasang klik lightbox di chat.js, integrasi AbortController pada pengetikan obrolan, hubungkan ekstraksi nyata PDF/DOCX di project.js, alihkan berkas besar ke IndexedDB, render Pengaturan profesional dengan Model Hub dan meteran kuota penyimpanan.
Fase 4
Engine Konektor Lokal
js/connectors/connector-state.js, js/connectors/tool-card.js
Daftarkan 6 Ekosistem Bawaan Baru di CATALOG dan pasang Client-Side Tool Dispatcher di tool-card.js untuk mengeksekusi seluruh 33 alat lokal di peramban.
Fase 5
Pembersihan QC & Verifikasi
Seluruh 15 berkas modul teridentifikasi
Ganti seluruh 29 blok catch (e) {} kosong menjadi console.warn('[Rategoan Fallback]...', e), jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error).
## Kriteria Kelulusan Akhir (Definition of Done):
Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
Sintaks seluruh 292 berkas JavaScript valid tanpa galat sintaks (node --check).
Pemindaian regex catch\s*\([^\)]*\)\s*\{\s*\} menghasilkan angka 0 di seluruh repositori.
Seluruh tombol pemilih tema dan ukuran teks tampil rapi dalam segmented control tanpa teks terpotong atau tumpang tindih.
Lembar lampiran menampilkan ikon berwarna elegan dan subteks penjelas pada setiap butirnya.
Halaman Proyek menyajikan Hero Creation Card yang rapi tanpa ruang putih canggung.
Profil Pengaturan berpenampilan bersih standar industri tanpa teks amatir.
Tersedia tombol Hentikan Generasi yang aktif saat AI sedang mengetik.
