<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-05T15:37:23Z. Versi 6.2.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 6.2.0-SOVEREIGN-PRISTINE-CANONICAL | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 & PRD antarmuka 2.0 v6.0.0 (STATUS: DITINGKATKAN)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: IDENTITAS KEDAULATAN, DOKTRIN MODEL RAGET 1.0 & KEAMANAN SIBER
## 1.1 Doktrin Kedaulatan & Penyatuan Otak Raget 1.0 (Auto-Router: Fast-Path Sistem 1 & Neural Sistem 2)
Standardisasi Pemilihan Model Berdasarkan Benchmark Industri Nyata (Audit 5 Tangkapan Layar Global):
Bukti Nyata Screenshot Industri: Evaluasi antarmuka model AI global terkemuka mengonfirmasi pola baku:
Claude: Opsi Tier (Haiku / Tercepat, Sonnet / Efisien, Opus / Fable) dilengkapi kontrol 'Effort' dan toggle 'Thinking'.
Gemini: Tier Flash-Lite vs Flash vs Pro dengan toggle 'Penalaran yang diperluas'.
Qwen: Tier Omni-Flash vs Plus vs Max.
Grok: Mode 'Auto (Chooses Fast or Expert)' vs 'Fast' vs 'Expert' vs 'Build'.
Eliminasi Total Islah Kuno: TIDAK ADA satu pun penyedia AI global yang menggunakan nama 'Template'. Oleh karena itu, istilah 'Raget Template' dihapus total dari seluruh antarmuka pengguna (#model-sheet dan settings.js).
Spesifikasi Antarmuka Model Raget 1.0 (Standar Grok & Gemini):
Di js/sheets/model-sheet.js dan js/account/settings.js:305, terapkan susunan model presisi:
🚀 Auto (Direkomendasikan): Otomatis memilih Jalur Kilat (<10ms) atau Penalaran Mendalam sesuai kompleksitas kueri.
⚡ Raget 1.0 Kilat (Flash): Jawaban instan di perangkat, hemat daya, dan bebas halusinasi.
🧠 Raget 1.0 Cerdas (Pro / Neural): Model bahasa lokal mandiri untuk penalaran mendalam, koding, dan penulisan naskah.
[Garis Pembatas / Divider]
Toggle 'Berpikir Lebih Keras' (Extended Thinking): Penalaran bertahap transparan untuk tugas kompleks.
Struktur di Balik Layar (Behind-the-Scenes Compound AI): Raget 1.0 mengadopsi standar arsitektur kognitif industri AI modern (Sistem 1 & Sistem 2):
⚡ Sistem 1 (Refleks Cepat / Fast-Path <10ms): Bertugas menjawab sapaan ("Halo", "Selamat malam"), hitungan matematika eksak (toolsMath/kalkulator), konversi kurs/unit, dan 260 database pengetahuan kanonikal (JSON sains/sejarah/wisata). Bekerja instan (<20ms), hemat daya baterai, dan 100% bebas halusinasi.
🧠 Sistem 2 (Penalaran Generatif / Neural Brain): Bertugas menyusun analisis bebas, sintesis riset mendalam, penulisan dokumen kreatif, dan koding kompleks. Bekerja menggunakan bobot jaringan saraf tiruan lokal Raget 1.0.
Alur Orkestrasi 'Auto' di Balik Layar (Behind-the-Scenes Routing):
Ketika mode 'Auto' aktif, router otomatis (raget/raget-agents/engine-router.js) mengevaluasi kueri pengguna secara instan:
Kueri sapaan ("Halo", "Selamat malam") dan kueri matematika eksak ("Hitung 25 * 4 + 10") otomatis dialirkan ke Sistem 1 Fast-Path (<10ms, kalkulator eksak/database kanonikal), memberikan respons instan dan 100% akurat.
Kueri analitis, pembuatan dokumen, koding, dan naskah bebas otomatis dialirkan ke Sistem 2 (Raget 1.0 Neural Generative).
Pengguna mendapatkan respons terbaik secara optimal tanpa perlu beralih model secara manual.
Penugasan Grok Build di Bab 5:
Refaktorisasi js/sheets/model-sheet.js, js/account/settings.js:305, dan raget/raget-agents/engine-router.js: Terapkan antarmuka model presisi [🚀 Auto | ⚡ Raget 1.0 Kilat | 🧠 Raget 1.0 Cerdas] + Toggle Extended Thinking dan router otomatis hibrida di balik layar.
Pertahankan 100% kelulusan 17 unit test (npm test) dan linter 0 error (npm run lint).
## 1.2 Buku Besar Verifikasi Mandiri (Milestone 3.5 Lulus 100% Terverifikasi)
Audit independen dan pengecekan kode sumber nyata (commit b8387bc) mengonfirmasi 5 pencapaian rekayasa telah beroperasi nyata:
✅ Render Dokumen Terformat: renderDocument() aktif memanggil markdownView.render(content) + markdownView.decorate(box). Laporan riset dan dokumen di Kanvas Artefak kini terformat rapi.
✅ Dynamic Chain-of-Thought (CoT): Fungsi generateCoT(query, domain) aktif menghasilkan langkah penalaran dinamis sesuai 4 domain (matematika, perbandingan, koding, konsep) dan mengutip fokus pertanyaan pengguna.
✅ Autonomous Deep Research: buildResearch() aktif mengekstrak fakta dari Vault lokal & web, serta menyusun naskah kajian eksekutif lengkap (Abstrak, Analisis Komparatif, Tabel Temuan, dan Kesimpulan Aksi).
✅ Gerbang Linter Anti-Placeholder: Skrip lint-check.mjs berhasil mengunci aturan penolakan fungsi dummy statis (Anti-placeholder: 0).
✅ Generator Dokumen Word: Berkas shared/docx-local.js (1.964 byte) terverifikasi aktif dan lulus uji unit #5.
## 1.3 Tugas Eksekusi Rampingkan Gelembung Pesan Pengguna (.msg.user)
1. Akar Masalah:
Bubble pesan pengguna (.msg.user) saat ini memakan ruang vertikal yang sangat besar untuk pesan pendek (Screenshot 09:15 WIB).
Terdapat tombol teks mentah kuno bertuliskan "Ubah" (<button class="msg-edit">Ubah</button>) dengan min-height 44px di bawah bubble, membuat antarmuka tampak kuno seperti forum internet lama.
2. Rekayasa Solusi Mutlak (Standar ChatGPT / Claude / Gemini):
HAPUS TOTAL elemen <button class="msg-edit">Ubah</button> dari bubble pesan di js/chat/chat.js baris 343–365.
Aksi "Ubah" (Edit Pesan) DIKEMBALIKAN KE TEMPATNYA yang benar: di dalam menu opsi titik tiga (⋮) yang sudah tersedia di js/history/msgmenu.js.
Kompakkan Bubble Pengguna (.msg.user di css/chat/messages.css):
Ubah max-width dari 90% menjadi maksimal 75% di ponsel dan 65% di desktop.
Padding dibuat proporsional dan elegan: padding: 8px 14px;.
Timestamp jam ("08.59") dan tombol menu (⋮) diletakkan sejajar atau di pojok bawah secara halus tanpa menambah baris kosong.
Bubble pesan pengguna seketika menjadi ramping, modern, dan minimalis kelas dunia.
## 1.4 Mitigasi 6 Celah Keamanan Siber Riil
1. Celah Keamanan #1 (Kritis) — Stored DOM XSS di shared/markdown.js:escape:
Temuan Celah: Fungsi escape(s) saat ini mengganti '<' dengan '<' (bukan '&lt;'), sehingga tag HTML seperti <img src=x onerror=...> langsung dieksekusi di DOM via innerHTML di artifact.js dan chat.js.
Solusi: Wajib diperbaiki menjadi penggantian entitas HTML standar (&amp;, &lt;, &gt;, &quot;).
2. Celah Keamanan #2 (Tinggi) — Sandbox Escape Web Worker ke IndexedDB & Jaringan Luar:
Temuan Celah: Web Worker di shared/markdown.js dan vault/code/js-sandbox.js dibuat via Blob URL di same-origin sehingga memiliki akses ke self.indexedDB (bisa menghapus/mencuri data rategoan_db) dan self.fetch (melanggar kedaulatan offline).
Solusi: Isolasi penuh lingkungan sandbox Web Worker dengan menetralkan API penyimpanan dan jaringan di awal wrapper:

self.indexedDB = undefined;
self.fetch = undefined;
self.XMLHttpRequest = undefined;
self.importScripts = undefined;

3. Celah Keamanan #3 (Sedang) — Delimiter Collision di shared/markdown.js:
Temuan Celah: Penggantian blok kode menggunakan pola / F(\d+) /g rentan menimpa teks biasa pengguna (seperti "F0" atau "F99") atau memunculkan string 'undefined'.
Solusi: Wajib diganti dengan sentinel token unik \u0000__RATEGOAN_FENCE_${i}__\u0000.
4. Celah Keamanan #4 (Sedang) — ReDoS pada CSV Regex rowsFrom:
Temuan Celah: Penggunaan regex kompleks pada fungsi CSV rowsFrom rentan backtracking pada masukan teks panjang.
5. Celah Keamanan #5 (Tinggi) — Bom Kuota 5 MB localStorage di js/state/store.js:
Temuan Celah: Penyimpanan riwayat obrolan dan gambar base64 langsung ke localStorage tanpa mekanisme fallback ke IndexedDB dan tanpa penanganan error QuotaExceededError, menyebabkan aplikasi crash total saat kuota 5 MB habis.
Solusi: Migrasikan penyimpanan riwayat obrolan dan sampel berat secara otomatis ke IndexedDB (rategoan_db) dengan fallback transparan.
6. Celah Keamanan #6 (Tinggi) — Kelemahan Kriptografi & Brute-Force PIN di js/state/pin.js:
Temuan Celah: Hash PIN menggunakan algoritma DJB2 32-bit tanpa salt, tanpa mekanisme penundaan (lockout delay) untuk percobaan gagal, serta data sensitif di database tidak terenkripsi.
Solusi: Implementasikan hashing aman berbasis Web Crypto API (PBKDF2/SHA-256) dengan salt acak, batasan percobaan PIN (lockout 30 detik setelah 5 kali gagal), dan enkripsi simetris AES-GCM untuk data vault sensitif.
Solusi: Wajib diganti parser CSV sekuensial aman.
# BAB 2: PROTOKOL KERJA OTONOM & REFAKTORISASI STRUKTUR MODUL
## 2.1 Pola Sesi Maraton Otonom (Deep Sprint Engine)
1. Eksekusi Mandiri Terpadu: Agen (Grok Build) menyelesaikan seluruh paket pekerjaan dalam satu putaran kerja utuh tanpa berhenti sepotong-sepotong.
2. Lingkaran Verifikasi Mandiri (Self-Healing Loop): Wajib menjalankan npm test dan npm run lint secara otomatis hingga 100% hijau sebelum melapor.
3. Catatan Detak Jantung: Dokumentasi status dicatat ke sprint-run.log.
## 2.2 Prosedur Sanitasi Pra-Eksekusi (Pre-Flight Clean Run)

# 1. Hentikan proses zombie
pkill -f "node.*test" || true

# 2. Bersihkan cache temporer
rm -rf /tmp/rategoan_* .eslintcache
npm cache clean --force 2>/dev/null || true

# 3. Verifikasi baseline awal
git status --porcelain
npm test
npm run lint
## 2.3 Pedoman Refaktorisasi 6 Berkas Monolit di Folder js/ (<400 Baris)
Untuk menjaga maintainability, keterbacaan, dan performa aplikasi, diterapkan empat pedoman utama refaktorisasi arsitektur modul:
1. Pemecahan 6 Berkas Raksasa di Folder js/ (Batas Maksimal 400 Baris):
js/collection/collection.js (743 baris) → Dipecah menjadi modul render kartu (collection-render.js) dan modul dialog catatan (collection-modal.js).
js/chat/composer.js (692 baris) → Dipecah menjadi modul penanganan event input (composer-events.js) dan modul pengelola mode/lampiran (composer-mode.js).
js/account/settings.js (609 baris) → Dipecah menjadi modul preferensi (settings-pref.js) dan modul backup/profil (settings-backup.js).
js/chat/chat.js (507 baris) → Fungsi pembuat elemen pesan dipisahkan ke modul pembantu (chat-elements.js).
js/ui/artifact.js (449 baris) → Pengendali aksi ekspor dan kanvas dipisahkan ke modul terpisah (artifact-export.js & artifact-canvas.js).
js/studio/studio.js (422 baris) → Logika CodeMirror/runner dan pengelola berkas virtual dipisahkan (studio-runner.js & studio-vfs.js).
## 2.4 Pemutusan 4 Siklus Dependensi Sirkular & Pengaktifan Modul vault/chunk.js
Putus total siklus dependensi sirkular antara js/chat/voice.js, js/chat/composer.js, dan js/chat/chat.js menggunakan CustomEvent terpusat. Aktifkan modul vault/chunk.js untuk memecah berkas rujukan Proyek dan Vault secara adaptif berbasis semantik.
## 2.5 Strategi Caching PWA 100% Luring untuk 260 Berkas JSON Pengetahuan di sw.js
Pastikan sw.js mencakup prekondisi cache dan dynamic caching untuk seluruh 260 berkas di raget-data/json/ agar fungsi loadRegionFromJson() pada dataries-registry.js bekerja 100% stabil saat luring (offline).

# BAB 3: PENYEMPURNAAN TATA LETAK HALAMAN PROYEK & RESPONSIVITAS REAL
## 3.1 Desain Ulang Halaman Proyek (#view-project — Screenshot 09:14 WIB)
1. Template Cepat Sebagai Carousel 1 Baris:
Ubah .project-templates agar tidak melipat 2 baris canggung di layar ponsel:

.project-templates {
display: flex;
gap: 8px;
overflow-x: auto;
white-space: nowrap;
padding-bottom: 4px;
-webkit-overflow-scrolling: touch;
}
2. Formulir Pembuatan Terpadu (Unified Action Input):
Kolom teks nama proyek dan tombol "Buat" disatukan dalam satu baris pil berbingkai halus: input nama di kiri, tombol panah/pil "Buat" di kanan.
3. Dasbor Proyek Aktif (.project-active-panel):
Saat proyek aktif, tampilkan kartu ikhtisar proyek yang elegan:
Nama Proyek & Lencana Aktif.
Ringkasan Instruksi Sistem (dapat diedit langsung).
Daftar Berkas Rujukan Permanen dengan ukuran KB dan tombol hapus.
Tombol Aksi Utama: [ Buka di Obrolan → ] dan [ + Sematkan Berkas ].
4. Kisi Kartu Proyek (.project-grid): Menampilkan daftar proyek yang tersimpan dalam bentuk kartu minimalis modern.
## 3.2 Uji Nyata Responsivitas Lintas Perangkat (Android, Mobile, Desktop)
1. Android & Ponsel Layar Sempit (360px - 480px):
Kunci viewport tinggi keyboard virtual (--vvh berbasis window.visualViewport) agar composer melekat mulus di atas keyboard tanpa memotong header obrolan.
Margin horizontal obrolan diatur 12px, bubble pengguna maksimal 75% lebar layar.
Seluruh dialog modal dan sheet lampiran memiliki batas maksimal 92vw dan padding sentuh jempol minimal 44px.
2. Tablet & Layar Menengah (641px - 1023px):
Kanvas Dokumen dan Chat menggunakan mode Split-Screen adaptif (50% obrolan, 50% kanvas artefak) atau tab alih cepat [ Chat | Kanvas ].
3. Desktop (>= 1024px):
Tata letak grid 2 kolom baku (Sidebar permanen di kiri 280px, area kerja obrolan 1fr di kanan).
Kanvas Dokumen membuka sebagai kolom ke-3 (Tri-Pane Layout) di sisi kanan tanpa menutupi obrolan chat utama.

# BAB 4: ARSITEKTUR WORKSTATION MODERN, STUDI KASUS NYATA & KATALOG 29 ALAT
## 4.1 Peta Mental 6 Pilar Kedaulatan Sistem
1. Obrolan (Chat): Interaksi harian cepat dan eksplorasi dinamis.
2. Proyek (Project): Ruang kerja berkonteks tetap (instruksi permanen + berkas rujukan permanen).
3. Studio Kode: Lingkungan pengembangan 3 zona terisolasi untuk pembuatan Web App & Skrip Python.
4. Kanvas Artefak: Editor dokumen, slide presentasi, dan lembar kerja terformat side-by-side.
5. Koleksi: Brankas pengetahuan & kutipan hasil kurasi.
6. Konektor: Eksekusi 29 alat lokal otonom tanpa cloud.
## 4.3 Restrukturisasi Studio Kode (3 Tab Segmentasi Mobile & Split-Pane 55/45 Desktop)
Mode Perangkat Seluler (Mobile): Tab segmentasi eksplisit [ 📝 Editor ] [ 👁️ Pratinjau ] [ 💻 Konsol ]. Tidak menumpuk vertikal.
Mode Desktop (>= 1024px): Split pane 55% Editor di kiri, 45% Pratinjau/Konsol di kanan.
Panduan Langkah Jelas di Header Studio: '1. Tulis kode → 2. Uji di Konsol → 3. Lihat Pratinjau Web'.
## 4.4 Resolusi Output Riset Mendalam (Kartu Laporan Riset Interaktif di Chat)
Cegah naskah riset menghilang ke panel tersembunyi dengan menampilkan Kartu Laporan Riset Interaktif di dalam percakapan chat yang mencakup:
1. Judul Laporan & Estimasi Baca.
2. Ringkasan Eksekutif Temuan Kunci.
3. Tombol Aksi Nyata: [ 📖 Buka di Kanvas ], [ 📥 Unduh DOCX ], [ 📥 Unduh MD ].
## 4.5 Integrasi Fungsional Mode Kilat (Prompt 2-3 Kalimat Padat)
Sambungkan status Mode Kilat di attach-sheet ke prompt instruksi Raget: saat aktif, sisipkan arahan 'Jawab ringkas dalam maksimal 2-3 kalimat padat, to-the-point, tanpa basa-basi'.
## 4.6 Konsolidasi Akordeon Berpikir Keras (Satu Komponen Penalaran Elegan)
Satukan tampilan thought-card.js dan think-trace menjadi satu kartu akordeon tunggal yang elegan, bergaris tipis, dengan tipografi proporsional (bukan <pre> monospace mentah yang berantakan).
## 4.6 Penyempurnaan Konteks Proyek, Kanvas Dokumen & Interaksi Suara
1. Eliminasi Pemotongan Kaku Berkas Rujukan Proyek: Berkas rujukan yang disematkan pada Proyek tidak boleh dipotong secara kasar pada batas 400 karakter. Terapkan strategi ekstraksi konteks pintar berbasis semantik agar bagian penting dokumen tidak hilang saat dibaca oleh sistem AI.
2. Preservasi Format Struktur Kanvas Dokumen: Saat pengguna menyunting dokumen pada Kanvas Artefak, cegah kehilangan format visual. Sistem dilarang mengekstrak `textContent` mentah secara langsung saat proses ekspor, melainkan harus mempertahankan AST (Abstract Syntax Tree) / tag HTML terformat agar dokumen hasil suntingan tetap rapi.
3. Jeda Konfirmasi Pengiriman Pesan Suara: Hentikan perilaku pengiriman pesan otomatis secara instan begitu deteksi suara berhenti. Berikan antarmuka tinjauan sementara dengan jeda konfirmasi (misalnya 2 detik) sehingga pengguna memiliki kesempatan memeriksa dan menyunting teks hasil pengenalan suara sebelum dikirimkan ke AI.
## 4.7 Navigasi Cabang Percakapan [ < 1 / 2 > ] & Indikator Memori Konteks
1. Navigasi Cabang Percakapan (Message Branch Forking): Saat pengguna mengedit pesan sebelumnya lewat menu (⋮), sediakan tombol navigasi cabang visual di bawah bubble pesan: `[ < 1 / 2 > ]` agar pengguna bisa melompat antara draf pesan lama dan draf pesan baru.
2. Indikator Penggunaan Konteks Sesi: Tampilkan penghitung karakter/token lokal secara halus di info obrolan: `Memori Sesi: ~3.2 KB (IndexedDB lokal)`.
3. Jembatan Studio Kode ke Proyek: Tombol [ 📁 + Jadikan Rujukan Proyek ] di Studio Kode untuk mengunci berkas yang diedit langsung ke Proyek aktif.
## 4.8 Katalog Lengkap 29 Alat Lokal Berdaulat Tanpa Cloud
Daftar resmi 29 alat lokal berdaulat (28 alat spesifik kategori + 1 alat agenda_daily_briefing) yang dieksekusi via Client-Side Tool Dispatcher tanpa backend:

1. Vault Dokumen & RAG Pribadi (6 Alat): vault_index_document, vault_semantic_search, vault_summarize_doc, vault_qna_document, vault_compare_docs, vault_export_knowledge.
2. Mata & Vision OCR Mandiri (4 Alat): vision_extract_text, vision_parse_table, vision_color_palette, vision_qr_barcode.
3. Asisten Suara & Audio Overview (4 Alat): audio_speech_to_text, audio_text_to_speech, audio_generate_overview, audio_voice_notes.
4. Mesin Kalkulus, Finansial & Data (5 Alat): math_calculate_expression, math_statistics_summary, math_currency_converter, math_date_calculator, math_unit_conversion.
5. Penyusun Artefak & Visualisasi Grafis (5 Alat): canvas_render_chart, canvas_generate_diagram, canvas_export_presentation, canvas_export_document, canvas_export_data.
6. Agenda, Pengingat & Rutinitas Kedaulatan (5 Alat): agenda_add_task, agenda_list_upcoming, agenda_parse_ics, agenda_export_calendar, agenda_daily_briefing.

## 4.9 Audit Forensik 9 Tangkapan Layar Nyata (Resolusi 7 Titik Friksi Ponsel Pengguna)
Evaluasi kritis dan rekayasa solusi terhadap 9 tangkapan layar ponsel nyata:
1. Layar Lampiran (#attach-sheet):
Masalah Nyata: Toggle 'Mode kilat' dan 'Hubungkan Folder' terpotong di batas bawah layar (offscreen cut-off). Tidak ada scroll indicator. Terjadi kontradiksi logika: pengguna bisa mengaktifkan 'Mode kilat' dan 'Riset mendalam' secara bersamaan padahal fungsinya bertolak belakang.
Solusi: Buat kategori toggle saling mengunci (mutual exclusive): Kecepatan [ Normal | Kilat ] vs Kedalaman [ Standar | Berpikir Keras | Riset Mendalam ]. Berikan max-height: 85vh dan overflow-y: auto dengan padding bawah 24px.
2. Layar Keahlian (#skill-sheet):
Masalah Nyata: Pilihan Umum, Analis Data, Auditor Kode, Penulis Teknis, Peneliti hanya berupa kotak teks polos tanpa ikon, tanpa deskripsi fungsi, dan tanpa contoh kegunaan. Pengguna bingung apa bedanya.
Solusi: Ubah menjadi kartu deskriptif: Ikon + Judul + 1 kalimat fungsi + alat yang dibuka (misal: 'Analis Data · Spesialis kalkulasi tabel, statistik, & grafik lokal').
3. Layar Studio Kode (#view-studio):
Masalah Nyata: Kontras warna tabrakan (editor gelap di atas halaman putih terang), 5 tombol aksi tersebar canggung dalam 2 baris, dan iframe Pratinjau berada jauh di bawah konsol di luar layar sehingga saat ditekan 'Pratinjau' pengguna mengira tombol rusak.
Solusi: Terapkan 3 Tab Segmentasi Ponsel [ 📝 Editor ] [ 👁️ Pratinjau ] [ 💻 Konsol ]. Saat tekan 'Pratinjau', otomatis pindah tab ke Pratinjau. Selaraskan tema editor agar konsisten (Light/Dark).
4. Layar Artefak (#view-artifacts):
Masalah Nyata: Halaman kosong hanya menampilkan kartu teks pasif 'Belum ada artefak' dengan sisa layar putih hampa.
Solusi: Sediakan tombol aksi cepat (Quick Creation Chips): [ + Buat Dokumen Word ], [ + Buat Presentasi Slide ], [ + Buat Tabel Data ] yang langsung mengarahkan ke pembuatan kanvas.
5. Layar Konektor (#view-connect):
Masalah Nyata: Menggunakan istilah 'alat eksternal' dan menampilkan kartu 'Google Drive Workspace' dengan tombol 'Hubungkan' dan 'Token'. Ini melanggar rasa kedaulatan offline Rategoan.
Solusi: Ganti narasi menjadi 'Alat Mandiri Perangkat'. Tampilkan 29 alat lokal secara bangga di bagian atas (Kalkulator, OCR, Audio, Vault, Agenda) daripada opsi cloud pihak ketiga.
6. Layar Obrolan Utama (#view-chat):
Masalah Nyata: Layar kosong hanya tulisan besar 'Rategoan' tanpa contoh prompt pemicu (starter prompts). Menu titik tiga atas memuat 'Bagi tautan' yang membingungkan untuk aplikasi lokal.
Solusi: Tambahkan 4 kartu starter interaktif di atas composer: [ Riset Mendalam ], [ Buat Slide Presentasi ], [ Analisis Berkas ], [ Koding di Studio ]. Ubah 'Bagi tautan' menjadi 'Salin Obrolan'.
7. Layar Pengaturan (#view-settings):
Masalah Nyata: Kapsul Memori tersembunyi jauh di dalam sub-menu, padahal memori pribadi adalah fitur kedaulatan utama.
Solusi: Angkat Kapsul Memori ke baris teratas Pengaturan dengan indikator jumlah fakta langsung.
# BAB 5: BLUEPRINT EKSEKUSI 38 BUTIR REKAYASA PRESISI & KRITERIA KELULUSAN AKHIR
## 5.1 Matriks Tugas Menyeluruh Sektor A s.d. Sektor H (38 Butir Rekayasa Presisi)
## 4.10 Benchmark Komparatif 6 Model Global (Claude, Gemini, Grok, Qwen, ChatGPT, Manus) & 4 Pilar Repackaging UX
Evaluasi objektif dan jujur membandingkan Rategoan terhadap 6 ekosistem AI terkemuka dunia di 6 dimensi utama antarmuka dan kedaulatan sistem:
Dimensi
Standar Global Pesaing
Kondisi Rategoan Saat Ini
Target Target Target Target v5.0 Standard Target
1. Kanvas & Artefak
Claude Artifacts & ChatGPT Canvas (Split view side-by-side, live rendering, markdown/code editor).
Sudah ada di #view-artifacts, namun di seluler masih pasif dan kehilangan format saat ekspor.
Kanvas Artefak interaktif dengan Quick Creation Chips, preservasi format AST visual, & split-pane adaptif.
2. Proyek & Memori
Claude Projects & ChatGPT Memory (Set instruksi permanen, rujukan berkas, memori jangka panjang auto-update).
Proyek memotong teks rujukan di 400 karakter; Kapsul Memori tersembunyi dalam Pengaturan.
Carousel Proyek 1 baris, ekstraksi konteks pintar tanpa potong kaku, & Live Memory Pill langsung di topbar.
3. Penalaran & Riset
Grok Think / DeepSearch & Perplexity (Langkah penalaran CoT dinamis & laporan riset eksekutif terstruktur).
CoT dan Deep Research aktif, tetapi hasil laporan sering tersembunyi tanpa jangkar di chat.
Akordeon CoT tunggal ramping & Kartu Laporan Riset Interaktif bertombol aksi langsung di obrolan.
4. Eksekusi Mandiri
Manus Agent Deliverables (Penyiapan berkas siap pakai, penyusunan dokumen, & eksekusi alur kerja otonom).
Fungsi generator lokal DOCX/ZIP sudah aktif via unit test, namun minim integrasi visual UI.
Eksekusi generator lokal client-side 100% mandiri tanpa server, lengkap dengan opsi unduh DOCX/PPTX/ZIP/CSV.
5. Katalog Perkakas
Gemini Extensions & Local Tools (Panggilan fungsi eksternal/internal otomatis untuk tugas spesifik).
29 Alat lokal lengkap, namun tertimbun di bawah istilah 'alat eksternal' & integrasi Drive.
Redesain Konektor berorientasi 'Alat Mandiri Perangkat' dengan 29 alat lokal otonom di baris teratas.
6. Kedaulatan & Kecepatan
Qwen Local Weights (Kecepatan tinggi tetapi butuh VRAM besar/GPU lokal, ketergantungan API cloud).
Murni 100% luring client-side via Raget Auto-Router (<10ms Fast-Path & Raget Neural Brain) tanpa GPU mahal.
Kedaulatan mutlak: Zero cloud telemetry, latensi <10ms, tanpa biaya token API selamanya.
1. Kedaulatan Data 100% Luring (Zero Cloud Telemetry): Seluruh percakapan, berkas, dan memori tersimpan eksklusif di peranti pengguna (IndexedDB/localStorage) tanpa kebocoran data atau telemetri ke server pihak ketiga.
2. Kecepatan Instan (<10ms via Raget Template): Jawaban untuk kueri FAQ dan basis pengetahuan kanonikal diberikan secara seketika tanpa latensi jaringan internet.
3. Nol Biaya Langganan / Token API: Pengguna mendapatkan kapabilitas workstation AI berkelas enterprise secara gratis tanpa kuota bulanan atau tagihan API.
4. Generator Berkas Lokal Mandiri: Pembuatan dokumen DOCX, presentasi PPTX, arsip ZIP, dan tabel CSV diproses murni di browser pengguna tanpa membutuhkan backend penyusun.
1. Masalah Penemuan Fitur (Discoverability): Fitur hebat seperti 29 alat lokal tertimbun di bawah narasi 'eksternal', dan Kapsul Memori tersembunyi di kedalaman menu Pengaturan. Solusi: Reorganisasi tata letak dengan mengangkat Kapsul Memori ke topbar/header dan menyorot 29 alat lokal secara utama di Konektor.
2. Umpan Balik Tertutup (Closed Feedback Loop): Proses riset dan eksekusi kode seringkali tidak meninggalkan jejak visual interaktif di obrolan chat utama. Solusi: Wajibkan setiap aksi eksekusi/alat/riset menghasilkan Anchor Cards interaktif di dalam alur percakapan.
3. Hambatan Layar Kosong (Empty State Friction): Tampilan obrolan dan artefak baru terasa hampa tanpa petunjuk awal pemicu aksi. Solusi: Terapkan Guided Empty States berupa starter prompt chips dan Quick Creation Chips di seluruh layar utama.
Pilar 1: Anchor Cards di Chat: Setiap eksekusi riset mendalam, pemanggilan alat lokal, atau pembaruan memori selalu meninggalkan kartu jangkar interaktif yang kaya informasi di obrolan utama dengan tombol aksi cepat (misal: [ 📖 Buka di Kanvas ], [ 📥 Unduh DOCX ]).
Pilar 2: Segmented Studio: Penataan ulang Studio Kode berbasis 3 tab segmentasi jelas di ponsel [ 📝 Editor ] [ 👁️ Pratinjau ] [ 💻 Konsol ] dan split-pane adaptif 55%/45% di desktop untuk alur kerja koding yang mulus.
Pilar 3: Live Memory Pill: Lencana indikator memori personal yang aktif dan dapat diklik secara langsung di topbar/header aplikasi (`🧠 Memori: X Fakta`), memberikan akses instan ke Kapsul Memori tanpa membuka sub-menu.
Pilar 4: Guided Empty States: Eliminasi total layar kosong mati dengan menghadirkan kartu prompt pemicu interaktif di obrolan utama serta Quick Creation Chips di Kanvas Artefak untuk memandu pengguna bertindak.

1. Screenshot 1 (Rategoan Eksisting): Campur aduk media fisik dengan 4 toggle penalaran bertumpuk dan tombol folder; terpotong di layar bawah; kontradiksi logika antara Riset Mendalam vs Mode Kilat.
2. Screenshot 2 (Qwen): Pemisahan tegas media atas, baris kontrol (Thinking: Auto & Tools), dan daftar kapabilitas vertikal (Deep Research, Slides, Artifacts, Web Dev).
3. Screenshot 3 (Claude): Standar emas tata kelola konteks 'Tambahkan ke chat' (3 Media atas: Kamera, Foto, File + Pengait Proyek langsung + Toggle Pencarian Web + Akses Konektor + Status Memori).
4. Screenshot 4 (Grok): Menu mengambang ringkas (Camera, Gallery, Files, Skills, Connectors) langsung dari tombol plus (+).
5. Screenshot 5 (Perplexity): Menu aksi ringkas bertingkat dengan pemisahan plugin dan tombol berpikir lebih keras.
## 4.2 Desain Ulang Lembar Aksi Lampiran (#attach-sheet: 2 Zona Rapi Berbasis Claude & Qwen)
Strukturkan ulang #attach-sheet menjadi 2 Zona Rapi:
Tajuk: 'Tambahkan ke chat' lengkap dengan handle geser dan tombol tutup (×).
ZONA 1 (Media Input - 3 Kotak Rapi): [ 📷 Kamera ] [ 🖼️ Galeri / Foto ] [ 📄 Berkas Dokumen ] (Eliminasi tombol memo suara ganda karena tombol mic sudah ada di composer utama).
ZONA 2 (Konteks Kerja & Alat Lokal - Baris Interaktif Seperti Claude):
🗂️ Kaitkan ke Proyek: Menampilkan status proyek aktif ('Proyek: Nama Proyek >' atau 'Tidak ada >'). Ketuk langsung membuka pemilih proyek.
🌐 Pencarian Web: Toggle switch ON/OFF mandiri ('Cari di internet saat butuh informasi mutakhir').
🔗 Alat Mandiri (Konektor): Menampilkan pintasan ('29 alat lokal aktif >').
🧠 Kapsul Memori: Toggle switch ON/OFF ('Gunakan fakta memori personal').
📁 Hubungkan Folder Lokal: Baris tombol bersih ('Buka folder di perangkat ini tanpa unggah').
1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
## 5.2 Kriteria Kelulusan Akhir (Definition of Done)
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).

Sektor
Cakup Pekerjaan
Berkas Utama
32 Poin Pekerjaan Konkret + Penyatuan Model Raget 1.0
Sektor A
Pertahanan & Keamanan Siber
shared/markdown.js, vault/code/js-sandbox.js, js/state/pin.js
1. Sanitasi escape() HTML entitas lengkap.
2. Isolasi penuh Web Worker sandbox.
3. Token sentinel unik fence kode.
4. Parser CSV sekuensial anti-ReDoS.
5. Hash PIN PBKDF2/SHA-256 + Salt.
6. Lockout delay 30s & Enkripsi AES-GCM data PIN.
Sektor B
Integritas Penyimpanan & Arsitektur Data
js/state/store.js, shared/db.js
7. Migrasi otomatis store.js ke IndexedDB.
8. Penanganan QuotaExceededError di localStorage.
9. Kompresi gambar base64 sebelum simpan.
10. Skema transisi & verifikasi integritas DB.
Sektor C
Ruang Kerja Obrolan, Bubble, Lampiran & CoT
js/chat/chat.js, css/chat/messages.css, js/history/msgmenu.js, js/ui/attach-sheet.js
11. Rampingkan bubble pengguna (.msg.user).
12. Hapus tombol mentah "Ubah" dari bubble.
13. Pindahkan aksi "Ubah" ke menu titik tiga (⋮).
14. Konsolidasi CoT ke akordeon tunggal.
15. Integrasi Mode Kilat (2-3 kalimat padat).
16. UX Lampiran (#attach-sheet): Restrukturisasi 2 Zona Rapi (Zona 1: 3 Media Input + Zona 2: Konteks & Alat Lokal) serta pemindahan toggle Berpikir Lebih Keras & Riset Mendalam ke selector model/composer.
17. UX Obrolan: Starter prompts & 'Salin Obrolan'.
Sektor D
Mesin Riset Mandiri, Kanvas Dokumen & Artefak
js/chat/research.js, js/ui/artifact-card.js, shared/docx-local.js, js/artifacts/artifacts.js
18. Kartu Laporan Riset Interaktif di chat.
19. Tombol aksi Kanvas, DOCX, MD di kartu riset.
20. Preservasi AST/format visual Kanvas saat sunting.
21. Optimasi ekspor DOCX & PDF lokal.
22. Quick Creation Chips di halaman Artefak kosong.
Sektor E
Restrukturisasi Studio Kode & Keahlian
js/studio/studio.js, css/ui/overhaul.css, js/ui/skill-sheet.js
23. Tab segmentasi mobile [Editor|Pratinjau|Konsol].
24. Split-pane 55/45 desktop di Studio Kode.
25. Header langkah petunjuk penggunaan Studio.
26. Tombol semat hasil Studio ke Proyek.
27. Kartu deskriptif pilihan Keahlian (Ikon + Deskripsi + Alat).
Sektor F
Proyek, Penyatuan Model Raget 1.0 & Kapsul Memori
js/project/project.js, js/sheets/model-sheet.js, raget/raget-template/template-adapter.js, js/settings/settings.js
28. Redesain #view-project carousel 1 baris.
29. Formulir input nama + tombol "Buat" terpadu.
30. Penyatuan model & Auto-Router di js/sheets/model-sheet.js, js/account/settings.js (baris 305-320) & engine-router.js (Opsi [🚀 Auto | ⚡ Kilat | 🧠 Cerdas] + Toggle Extended Thinking; Hapus label 'Template' total dari seluruh UI).
31. Angkat Kapsul Memori ke baris teratas Pengaturan.
Sektor G
Optimalisasi Konektor 29 Alat Lokal & Suara
js/tools/dispatcher.js, js/audio/voice.js, js/connect/connect.js
32. Verifikasi eksekusi offline 29 alat lokal.
33. Integrasi agenda_daily_briefing tanpa backend.
34. Jeda konfirmasi pada pengenalan suara.
35. Narasi 'Alat Mandiri Perangkat' & prioritas 29 alat lokal.
Sektor H
Kedaulatan Luring, Service Worker & Jaminan Mutu
sw.js, test/unit/*.test.js
36. Cache offline Service Worker komprehensif.
37. Pertahankan 100% kelulusan 17 unit test (`npm test`).
38. Linter kode 0 error & 0 warning (`npm run lint`).
4. Bubble pesan pengguna (.msg.user) tampil ramping dan modern dengan padding: 8px 14px, max-width 75% (mobile) / 65% (desktop), tanpa tombol mentah "Ubah" mengambang di bawah bubble.
5. Aksi edit pesan ("Ubah") dipindahkan sepenuhnya ke dalam menu titik tiga (⋮) pada js/history/msgmenu.js.
6. Fungsi escape() pada shared/markdown.js melakukan sanitasi entitas HTML standar (&, <, >, ") untuk mencegah Stored DOM XSS.
7. Sandbox Web Worker pada shared/markdown.js dan vault/code/js-sandbox.js mengisolasi lingkungan penuh dengan menetralkan self.indexedDB, self.fetch, self.XMLHttpRequest, dan self.importScripts.
8. Delimiter blok kode menggunakan token sentinel unik \u0000__RATEGOAN_FENCE_${i}__\u0000 untuk mencegah tabrakan string teks biasa.
9. Parser CSV pada rowsFrom menggunakan algoritma pemindaian sekuensial aman tanpa regex backtracking kompleks untuk mencegah ancaman ReDoS.
10. Halaman Proyek (#view-project) menyediakan carousel template 1 baris horizontal (.project-templates), formulir input nama & tombol "Buat" terpadu dalam satu baris pil, serta dasbor proyek aktif (.project-active-panel).
11. Antarmuka teruji responsif lintas perangkat: viewport keyboard virtual (--vvh) terkunci mulus di Android (360px–480px), split-screen adaptif di tablet, dan tri-pane layout di desktop (>=1024px).
12. Studio Kode menyajikan mode tab [ Editor | Pratinjau | Konsol ] di seluler dan split pane 55%/45% di desktop, lengkap dengan tombol [ 📁 + Jadikan Rujukan Proyek ].
13. Output Deep Research menampilkan Kartu Laporan Riset Interaktif langsung di obrolan dengan tombol aksi [ 📖 Buka di Kanvas ], [ 📥 Unduh DOCX ], dan [ 📥 Unduh MD ].
14. Mode Kilat menyisipkan arahan respons ringkas maks 3 kalimat, serta tampilan CoT disatukan ke dalam satu akordeon tunggal yang bersih.
15. Seluruh 29 alat lokal otonom di Konektor (termasuk agenda_daily_briefing), fitur navigasi cabang `[ < 1 / 2 > ]`, dan indikator memori sesi terintegrasi serta berfungsi stabil 100%.
