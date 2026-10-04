<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T16:46:49Z. Menimpa PRD antarmuka 1.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI KONSOLIDASI LENGKAP)
Status: Cetak Biru Induk Tunggal Aktif (Next-Gen Sovereign AI Workstation)
Versi: 2.1.0-CONSOLIDATED-MASTER | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: FILOSOFI KEDAULATAN & PRINSIP DESAIN GENERASI 2.0
## 1.1 Kedaulatan Sistem & Arsitektur Offline-First
Zero Cloud Dependency for Core UI: Seluruh fungsionalitas antarmuka inti, penyimpanan berkas, dan mesin inferensi lokal wajib dapat beroperasi 100% mandiri di peramban tanpa ketergantungan API pihak ketiga.
Zero Bloatware: Tetap setia pada Vanilla JavaScript modern (ES Modules) murni tanpa framework raksasa yang membebani memori seluler.
Kedaulatan Data: Data percakapan, instruksi proyek, berkas tersemat, dan kredensial OAuth pengguna disimpan secara lokal di peramban (IndexedDB dan LocalStorage terenkripsi AES-GCM 256-bit).
## 1.2 Standar Ergonomi Seluler (Mobile-First Standards)

Batas Sentuh Ramah Jempol: Seluruh tombol aksi, tab, dan chip interaktif wajib memiliki area sentuh minimal 44 × 44 piksel.
Anti-Luber Horizontal Mutlak: Container utama wajib terkunci (overflow-x: hidden). Scrolling horizontal HANYA diperbolehkan pada komponen khusus yang secara eksplisit membutuhkan geser (seperti riwayat obrolan .recent-chips), sedangkan daftar filter wajib menggunakan tata letak adaptif (flex-wrap).
Tipografi & Kontras: Mendukung tema gelap dan terang secara konsisten dengan rasio kontras teks minimum 4.5:1 (WCAG AA).
## 1.3 Hukum Dua Keadaan (The Two-State UI Law)
Setiap modul antarmuka wajib menerapkan pemisahan keadaan yang tegas:
State Kosong (Empty State): Menampilkan kartu edukatif dengan ikon SVG elegan, penjelasan singkat yang bersahabat, dan satu tombol pemicu tindakan (CTA) utama. Dilarang menampilkan teks mentah tanpa gaya atau elemen konfigurasi lanjutan (seperti textarea instruksi) jika belum ada entitas yang dibuat.
State Aktif (Active State): Menampilkan panel kerja terstruktur, daftar berkas tersemat, dan kontrol manajemen tanpa menyembunyikan tombol pembuatan entitas baru.
## 1.4 Standar Mutu Kode, Observabilitas & Migrasi Kuota (QC & Storage Resilience)
Nol Blok Catch Kosong: Dilarang keras menulis blok catch (e) {} yang menelan galat dalam diam. Seluruh penanganan galat wajib mencatat konteks secara transparan: console.warn('[Rategoan Fallback] <NamaModul>:', e).
Arsitektur Penyimpanan Bertingkat (Tiered Storage Architecture):
LocalStorage: Dibatasi HANYA untuk preferensi konfigurasi mikro (< 500 KB, misal: tema, id sesi aktif, setting suara).
IndexedDB (idb-gateway.js): Digunakan untuk seluruh muatan data berat (riwayat chat lengkap, lampiran foto, teks berkas pinnedFiles proyek, dan basis pengetahuan RAG). Ini menjamin aplikasi kebal dari galat fatal peramban QuotaExceededError.
Kelulusan Uji Mutlak: Setiap commit wajib mempertahankan 100% kelulusan pada seluruh unit test (npm test) dan zero error/warning pada linter (npm run lint).
# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
Mengadopsi metodologi eksekusi latar belakang otonom (sebagaimana diterapkan pada Manus AI), agen pengembang (Grok Build) wajib mematuhi protokol maraton 2–5 jam tanpa henti berikut:
## 2.2 Prosedur Sanitasi Pra-Eksekusi & Skrip Watchdog (Pre-Flight Clean Run)
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
## 3.1 Halaman Proyek (#view-project — Bebas Kunci & Interaktif)
Pembebasan Tombol Pembuatan: Pindahkan baris pembuatan proyek agar tidak terkunci di #project-empty-state. Sediakan tombol pemicu <button id="project-new-toggle" class="project-new-btn">+ Proyek Baru</button> di bawah header yang selalu tampil saat proyek sudah ada (≥ 1).
Seleksi Tanpa Tendang Keluar: Ubah fungsi activate(project) di js/project/project.js agar hanya memperbarui #project-active-panel di halaman proyek tanpa memicu navigasi paksa router.go('chat'). Sediakan tombol aksi eksplisit Buka di Obrolan → di panel aktif.
Ekstraksi Berkas Cerdas (PDF & DOCX): Sambungkan ekstraktor extractPdfText dari shared/pdf-extract.js dan readZipText dari shared/zip-local.js ke dalam readFileText() di project.js. Berkas .pdf dan .docx yang disematkan ke proyek wajib terekstraksi teks aslinya dan terinjeksi ke memori prompt chat.
## 3.2 Modul Chat & Media Foto (Tampilan Modern AI)
Resolusi Penuh & Anti-Pecah: Di js/sheets/attach.js, naikkan resolusi dasar makeThumb(file, max) dari 96px menjadi minimal 800px (kualitas JPEG 0.85). Di js/chat/chat.js, gunakan gambar beresolusi tinggi tersebut.
Lenyapkan Teks Nama File Teknis: Hapus elemen teks mentah 📎 kamera-xxx.jpg dari gelembung obrolan. Foto tampil bersih sebagai subjek utama dengan sudut melengkung halus (border-radius: 16px) dan bingkai tipis transparan.
Fitur Tap-to-Lightbox: Klik pada gambar di chat membuka modal penampil layar penuh (#image-lightbox di index.html) berlatar gelap untuk zoom dan inspeksi detail.
Lenyapkan Tooltip Bulat OCR: Hapus gelembung speech bubble mengambang yang menutupi composer; ganti dengan kartu status ramping di bawah foto atau pemindaian latar belakang transparan.
Nama Kutipan Obrolan Dinamis: Ganti penamaan statis 'Kutipan obrolan' menjadi potongan teks kalimat awal cuplikan: 'Kutipan: ' + text.slice(0, 28).trim().replace(/\n/g, ' ') + '...'.
Vision Hybrid Multimodal Pipeline: Saat gambar dikirimkan, teks hasil OCR langsung diekstraksi ke memori konteks inferensi. Jika pengguna bertanya tentang gambar, sistem menjawab berbasis isi teks dan analisis gambar tersebut (menghilangkan pesan penolakan kaku "Maaf saya belum punya jawaban").
## 3.3 Halaman Pengaturan (#view-settings — Modern Grouped Cards)
Rombak tampilan kartu putih polos menjadi tata letak Grouped Cards terstruktur:
Kartu Header Profil: Avatar melingkar berbingkai gradien halus, identitas [ 🛡️ Akun Lokal Berdaulat ], serta bar visual kapasitas penyimpanan peramban (LocalStorage + IndexedDB status meter).
Grup 1 — Kecerdasan & Model: Baris mesin inferensi dengan badge [ Raget Neural v3 ], Kapsul Memori dengan badge [ X Fakta ], dan Suara TTS [ ID-Aktif ].
Grup 2 — Tampilan & Ergonomi: Saklar cepat tema [ Terang | Gelap | Sistem ] dan pengatur ukuran font.
Grup 3 — Konektor & Alat: Ringkasan status alat aktif [ X Lokal • Y Cloud ].
Grup 4 — Cadangan & Privasi: Ekspor cadangan ZIP/JSON, impor data, dan pembersihan cache berpengaman.
## 3.4 Halaman Artefak (#view-artifacts — Anti-Slide & Bersih)
Eliminasi Geser Horizontal: Ubah wadah filter #artifact-filters dari .coll-filters (yang memiliki overflow-x: auto) menjadi tata letak fleksibel display: flex; flex-wrap: wrap; gap: 8px; overflow-x: visible;. Seluruh tombol filter mengunci pas dengan lebar layar ponsel tanpa efek geser horizontal yang canggung.
Filter Dinamis: Hanya tampilkan tombol kategori yang artefaknya benar-benar ada di perangkat (ditambah tombol Semua).
Lencana Format Warna: Berikan penanda format visual yang khas (PPTX oranye, DOCX biru, CODE ungu, CSV toska, SVG hijau).
## 3.5 Lembar Lampirkan (#attach-sheet — Arsitektur 3 Zona Terpadu)
Pisahkan isi lembar lampiran menjadi 3 zona hierarki visual yang jelas dengan MEMPERTAHANKAN seluruh ID DOM lama agar event binding di composer.js tidak rusak:
Zona 1: Media & Masukan Cerdas: Grid 4 kartu melengkung: #sheet-camera (Kamera), #sheet-photo (Foto), #sheet-file (Dokumen), dan #sheet-voice (Memo Suara).
Zona 2: Mode Penalaran AI (Murni Saklar Switch): Seluruhnya berupa toggle switch dengan subteks edukatif: #sheet-websearch (Pencarian Web), #sheet-think (Berpikir Lebih Keras), #sheet-research (Riset Mendalam), dan #sheet-fast (Mode Kilat/Hemat).
Zona 3: Studio Pembuatan & Alat Kerja (Tombol Aksi Berpanah): Tombol tindakan berpanah tanpa switch: #sheet-slide (Buat Slide .pptx), #sheet-doc (Buat Dokumen .docx), #sheet-code-studio (Studio Kode), #sheet-project (Kaitkan ke Proyek dengan badge nama aktif), dan #sheet-learn (Belajar Terpandu).
## 3.6 Studio Kode & Split-Screen Artifact Canvas (Generasi Baru)
Studio Kode: Sembunyikan tombol Pratinjau secara otomatis saat tab Python aktif (if (previewBtn) previewBtn.hidden = next === 'python';). Satukan tombol aksi utilitas pada toolbar kanan atas.
Split-Screen Artifact Canvas: Di layar tablet/desktop, artefak kode dan dokumen yang dihasilkan langsung terbuka di panel kanvas berdampingan (side-by-side) dengan chat; di seluler tampil sebagai lembar bawah geser dengan tab alih cepat [ Chat | Kanvas ].
Kartu Sitasi Sumber Terbuka (Source Citation Cards): Saat pencarian web atau vault RAG aktif, tampilkan chip sumber terverifikasi di bawah jawaban (Favicon + Domain + Ringkasan) yang bisa diklik untuk membaca cuplikan referensi asli.
Percabangan Obrolan (Chat Branching): Dukungan edit pesan pengguna di tengah sesi percakapan yang membentuk cabang alternatif (1/2, 2/2) tanpa menghapus riwayat sebelumnya.
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
## 4.3 Jembatan Google Workspace Dual-Mode (OAuth PKCE & Ketahanan Offline)
Mode Terhubung (Online): Menghubungkan Google Drive, Google Calendar, dan Gmail secara langsung dari peramban pengguna menggunakan Google Identity Services (GIS) token client murni tanpa server perantara. Token disimpan terenkripsi AES-GCM 256-bit di rategoan_connectors_vault.
Mode Ketahanan Mandiri (Offline): Jika perangkat kehilangan koneksi, sistem secara otomatis beralih ke padanan lokal (Drive → Vault Dokumen Lokal; Calendar → Kalender ICS Lokal; Gmail → Draf Kapsul Memori Lokal) tanpa memutus produktivitas pengguna.

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
index.html, css/ui/overhaul.css
Terapkan 3 Zona pada #attach-sheet, tambahkan tombol #project-new-toggle, buat wadah #image-lightbox, ubah filter artefak jadi flex-wrap, pasang gaya Grouped Cards pada Pengaturan, siapkan wadah Split Canvas.
Fase 3
Refaktor Logika Frontend
js/project/, js/chat/, js/sheets/, js/artifacts/, js/account/, js/state/
Naikkan resolusi foto ke 800px di attach.js, lenyapkan teks nama file kamera mentah dan pasang klik lightbox di chat.js, integrasi vision hybrid, hubungkan ekstraksi nyata PDF/DOCX di project.js, alihkan berkas besar ke IndexedDB, dan render Pengaturan modern.
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
Aplikasi web berjalan mulus, responsif, dan bebas kebocoran scroll horizontal pada resolusi seluler 360px s/d 412px.
