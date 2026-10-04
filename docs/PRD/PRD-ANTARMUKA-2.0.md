<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T20:06:05Z. Versi 3.0.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 3.0.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: ARSITEKTUR TATA LETAK, IDENTITAS MODUL & PANDUAN PENGGUNA
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri:
⚡ Raget Template: Otak deterministik instan (<10ms), berbasis basis data & FAQ kanonikal, zero-halusinasi, 100% offline (Aktif / Default).
🧠 Raget Neural: Otak jaringan saraf tiruan lokal mandiri Rategoan yang dilatih dari korpus rilis Rategoan.
Pembersihan Total: Tidak boleh ada opsi Ollama atau server luar di seluruh aplikasi.
## 1.2 Peta Tata Letak Lengkap, Fungsi & Cara Kerja Komponen (Komprehensif)
Setiap elemen di Rategoan memiliki tata letak, fungsi, dan cara pakai yang jelas tanpa saling menindih:
A. BILAH PENGETIKAN (COMPOSER BOX — BAGIAN BAWAH CHAT)
Area Input Teks (chat-input):
Tata Letak: Di tengah wadah composer, otomatis membesar (auto-grow) sesuai panjang teks.
Fungsi: Mengetik pertanyaan, instruksi naskah, atau kode.
Tombol Lampirkan (+ / btn-attach):
Tata Letak: Di sisi kiri bawah input.
Fungsi: Membuka lembar lampiran (#attach-sheet).
Cara Pakai: Diklik untuk melampirkan Kamera, Foto, Dokumen, Memo Suara, atau Menghubungkan Folder Lokal.
Tombol Pemilihan Model Otak (btn-model — Ikon Chip CPU):
KOREKSI FATAL: DILARANG KERAS DI-HIDDEN. Tombol ini WAJIB TAMPIL AKTIF di samping tombol (+).
Tata Letak: Tepat di sebelah kanan tombol (+).
Fungsi: Menampilkan indikator otak aktif dan membuka dialog cepat pemilihan mesin inferensi.
Cara Pakai: Diklik untuk memilih antara [⚡ Raget Template] atau [🧠 Raget Neural].
Tombol Suara (btn-voice-input — Ikon Mikrofon 🎤):
Tata Letak: Di sisi kanan bawah input.
Fungsi: Merekam suara dan mengubah suara menjadi teks via Web Speech API / local audio tool.
Tombol Kirim Pesan (btn-send — Ikon Pesawat Kertas ➤):
KOREKSI FATAL: DILARANG DIHILANGKAN TOTAL.
Tata Letak: Di samping kanan tombol mikrofon (atau bertukar visual secara jelas).
Perilaku: Saat kolom ketik kosong, tombol kirim tampil dalam status redup/nonaktif (disabled, opacity 0.45). Begitu pengguna mengetik satu karakter saja, tombol kirim langsung menyala biru tegas. Pengguna tidak akan bingung mencari tombol kirim.
Tombol Berhenti (btn-stop — Ikon Kotak Merah/Hitam ⏹️):
Tata Letak: Menggantikan tombol kirim saat AI sedang menghasilkan jawaban (is-generating).
Fungsi: Menghentikan proses generasi seketika via AbortController.
B. HEADER OBROLAN (BAGIAN ATAS CHAT)
1. Tombol Menu (☰): Membuka Sidebar Drawer.
2. Judul Sesi Aktif / Status: Menampilkan judul obrolan aktif.
3. Indikator Mode Mandiri: Pil status [ ⚡ Mandiri (Offline) ] saat tidak ada jaringan.
4. Pemilih Keahlian Terintegrasi (Keahlian / Skill Selector):
TATA LETAK BARU: Tidak boleh ditaruh di atas keyboard ponsel! Diletakkan di Header atas sebagai pil elegan: [ 🎯 Umum ▾ ].
# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
## 2.1 Pola Sesi Maraton Otonom (Deep Sprint Engine)
1. Eksekusi Mandiri Terpadu: Agen (Grok Build) diwajibkan menyelesaikan seluruh paket pekerjaan dalam satu putaran kerja utuh tanpa berhenti sepotong-sepotong.
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

# BAB 3: PERBAIKAN ERGONOMI, BILAH TULIS & KONTROL TAMPILAN
## 3.1 Pemulihan Ikon Pemilihan Model & Tombol Kirim di Composer
1. Pulihkan Tombol Model (btn-model):
Hapus atribut hidden dari <button id="btn-model"> pada index.html.
Beri SVG chip prosesor yang tajam.
Saat diklik, panggil modal pemilihan otak: Raget Template (Aktif Default) dan Raget Neural.
2. Perilaku Tombol Kirim (btn-send) & Mikrofon (btn-voice-input):
Di sisi kanan composer, tampilkan tombol Mikrofon dan tombol Kirim secara harmonis:
Jika kolom ketik kosong: Tombol kirim berstatus disabled (opacity: 0.45; cursor: default), tombol mikrofon aktif.
Jika kolom ketik ada teks: Tombol kirim menyala penuh (opacity: 1; color: var(--rg-accent)), siap diklik atau ditekan Enter.
Saat generasi berjalan (is-generating): Tombol kirim dan mikrofon digantikan oleh tombol [ ⏹️ Berhenti ].
Dengan demikian pengguna tidak pernah merasa tombol kirim hilang!
## 3.2 Pemindahan Pemilih Keahlian ke Header Atas
Jangan menaruh dropdown keahlian di samping tombol lampiran keyboard.
Letakkan chip/pill keahlian di header atas obrolan: <button id="header-skill-pill" class="header-pill">🎯 Umum ▾</button>.
Mengkliknya membuka sheet ringkas untuk memilih spesialisasi (Umum, Analis Data, Auditor Kode, Penulis Teknis, Peneliti).
## 3.3 Pemurnian Lembar Lampiran (#attach-sheet)
Pastikan seksi "Studio" (Studio Kode, Kaitkan ke Proyek, Belajar terpandu) tetap terhapus dari #attach-sheet.
Pertahankan 4 orb media ber-SVG presisi + 4 toggle penalaran + 1 tombol Hubungkan Folder Lokal.
## 3.4 Penataan Ulang Halaman Pengaturan & Segmented Controls (css/account/settings.css)
Terapkan Stacked Layout pada .set-row-theme dan .set-row-font: label di baris atas, dan tombol segmented Terang/Sistem/Gelap serta Kecil/Normal/Besar di baris bawah selebar 100% tanpa mematahkan kata "Mode Gelap".
Profil bersih tanpa lencana mengambang, meter penyimpanan Penyimpanan: x MB / 50 MB, dan hanya 2 otak resmi.

# BAB 4: REKAYASA SISTEM STUDIO KODE, ARTEFAK & 33 ALAT LOKAL
## 4.1 Studio kode (Lingkungan Rekayasa Perangkat Lunak Mandiri)
Integrasi File System Access: Tombol [ Folder lokal ] membuka folder kerja di komputer pengguna, memetakan berkas di panel kiri, dan mengedit berkas di textarea editor.
Diff Viewer: Tombol [ Tinjau Perubahan ] mengaktifkan tampilan visual perbandingan kode sebelum/sesudah revisi dengan garis hijau (+) dan merah (-).
Uji Eksekusi Mandiri: Tombol [ Jalankan ] mengeksekusi skrip JavaScript/Python via Web Worker / WebAssembly lokal tanpa internet.
## 4.2 Artefak (Meja Kolaborasi Dokumen & Naskah Hidup)
Split-screen otomatis di desktop saat obrolan menghasilkan naskah/dokumen panjang; tab alih [ Chat | Kanvas ] di ponsel.
Live editor yang memungkinkan pengguna mengedit teks bersama AI dan tombol ekspor instan (.docx, .md, cetak .pdf).
## 4.3 Katalog 33 Alat Lokal di Konektor
Daftarkan ke dalam CATALOG di js/connectors/connector-state.js dan jalankan via Client-Side Tool Dispatcher di tool-card.js:
1. Vault Dokumen & RAG Pribadi (6 Alat)
2. Mata & Vision OCR Mandiri (4 Alat)
3. Asisten Suara & Audio Overview (4 Alat)
4. Mesin Kalkulus, Finansial & Data (5 Alat)
5. Penyusun Artefak & Visualisasi Grafis (5 Alat)
6. Agenda, Pengingat & Rutinitas Kedaulatan (5 Alat)

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
Pemulihan Tombol & Ergonomi Bilah Tulis
index.html, js/chat/composer.js, css/ui/overhaul.css
1. Buka kunci tombol model: Hapus atribut `hidden` pada #btn-model agar ikon chip CPU tampil aktif di samping (+).
2. Perbaiki tombol kirim: Tombol kirim (#btn-send) tidak boleh lenyap total, melainkan tampil redup (disabled) saat input kosong dan menyala saat ada teks.
3. Pindahkan pemilih Keahlian ke header atas sebagai pill [ 🎯 Umum ▾ ].
4. Pertahankan lembar lampiran bersih tanpa seksi 'Studio'.
Fase 3
Studio kode & Artefak
js/ui/, js/artifacts/, js/chat/, index.html
1. Sempurnakan Studio kode dengan Diff Viewer dan Folder lokal.
2. Sempurnakan Artefak dengan live canvas dan ekspor (.docx, .md, .pdf).
Fase 4
Ekosistem 33 Alat & Konektor
js/connectors/, js/project/
Daftarkan 6 Ekosistem Bawaan Baru (33 Alat Lokal) di connector-state.js dan Client-Side Dispatcher.
Fase 5
Pembersihan QC & Verifikasi Mandiri
Seluruh berkas JavaScript & Unit Test
Ganti blok catch kosong dengan log transparan, jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error).
Kriteria Kelulusan Akhir (Definition of Done):
1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).
4. Ikon Chip CPU Pemilihan Model (#btn-model) TAMPIL AKTIF di bilah composer di samping tombol (+), membuka modal pilihan Raget Template & Raget Neural.
5. Tombol Kirim (#btn-send) selalu terlihat dan intuitif (redup saat kosong, menyala saat ada teks, berubah jadi Stop saat inferensi).
6. Pemilih Keahlian berada di Header Atas secara rapi, tidak membuat bilah ketik keyboard sesak.
7. Nama sidebar tetap ringkas asli: Chat Baru, Studio kode, Proyek, Koleksi, Konektor, Artefak.
8. Lembar lampiran (+) bersih dari duplikasi seksi Studio.
9. Studio kode dan Artefak terpasang dengan fungsionalitas rekayasa dan kolaborasi dokumen penuh.Fungsi: Menyesuaikan persona penalaran (Umum, Analis Data, Auditor Kode, Penulis Teknis, Peneliti).
Cara Pakai: Diklik untuk memunculkan modal sheet pemilihan keahlian tanpa memakan ruang pengetikan pesan.
5. Tombol Obrolan Baru (Ikon Pena Edit): Membuka percakapan baru yang segar.
6. Tombol Menu Opsi (⋮): Opsi ekspor obrolan, hapus sesi, dan info sistem.
C. SIDEBAR DRAWER (#sidebar — NAVIGASI UTAMA STANDAR INDUSTRI)
Penamaan di sidebar mempertahankan nama asli yang ringkas dan berwibawa:
1. Chat Baru: Membuka sesi obrolan baru.
2. Studio kode:
Fungsi: Lingkungan rekayasa perangkat lunak mandiri (setara Claude Code / Codex).
Cara Pakai: Membuka studio editor kode lengkap, mendukung integrasi folder lokal di komputer via File System Access API (tombol [ Folder lokal ]), melihat perbedaan revisi kode (tombol [ Tinjau Perubahan ] Diff merah/hijau), dan mengeksekusi skrip di Web Worker lokal (tombol [ Jalankan ]).
3. Proyek:
Fungsi: Ruang kerja berbasis topik khusus dengan berkas rujukan permanen (PDF/DOCX) dan instruksi sistem permanen.
Cara Pakai: Masuk ke menu Proyek -> Buat proyek dari template atau nama baru -> Lampirkan berkas rujukan -> Klik "Buka di Obrolan ->".
4. Koleksi: Galeri penyimpanan catatan, kutipan, dan memo hasil percakapan.
5. Konektor: Rumah bagi 33 alat lokal berdaulat (Client-Side Tool Dispatcher: kalkulus, vision OCR, audio overview, agenda rutin, dan vault).
6. Artefak:
Fungsi: Galeri penampung seluruh naskah, laporan kerja, dokumen proposal, dan slide hasil kerja kolaboratif (Cowork).
Cara Pakai: Mengklik artefak yang tersimpan untuk melihat, mengedit ulang, atau mengunduhnya kembali.
7. Riwayat Chat: Daftar riwayat obrolan masa lalu lengkap dengan kolom pencarian cepat.
8. Profil Pengguna (Footer): Avatar melingkar, Nama Pengguna, Email, meter penyimpanan lokal, dan tombol Pengaturan (⚙️).
D. KANVAS ARTEFAK / COWORK (SAAT INTERAKSI CHAT BERLANGSUNG)
Tata Letak:
Layar Desktop (>= 1024px): Split-screen otomatis di sebelah kanan obrolan saat dokumen/naskah panjang dihasilkan AI.
Layar Ponsel: Tab alih cepat di header [ 💬 Chat | 📄 Kanvas ].
Fungsi: Meja kerja dokumen hidup. Pengguna bisa langsung membaca, mengedit teks secara live, menyorot bagian teks untuk minta revisi ke AI, serta mengunduh berkas sebagai Markdown (.md), Word (.docx), atau Cetak (.pdf).
E. LEMBAR LAMPIRAN (#attach-sheet — POPUP TOMBOL +)
Tata Letak: Muncul saat tombol (+) diklik.
Isi Resmi:
1. Seksi Media (4 Orb Ber-SVG Nyata 44x44px): Kamera, Foto, Dokumen, Memo Suara.
2. Seksi Mode Penalaran: Pencarian Web, Berpikir lebih keras, Riset mendalam, Mode kilat.
3. Baris Aksi Berkas: [ Hubungkan Folder Lokal ] (File System Access API).
DILARANG ADA: Seksi "Studio", tombol "Studio Kode", tombol "Kaitkan ke Proyek", dan "Belajar terpandu" (karena fitur ini berada di Sidebar & Proyek).

# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
