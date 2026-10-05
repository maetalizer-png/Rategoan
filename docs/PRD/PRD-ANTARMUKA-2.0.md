<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-05T19:03:00Z. Versi 8.0 bab 8.5. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 8.0.0-SOVEREIGN-CANONICAL-FINAL-SEAL | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 & PRD antarmuka 2.0 v7.5.0 (STATUS: DITINGKATKAN)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: IDENTITAS KEDAULATAN, DOKTRIN MODEL RAGET 1.0 & KEAMANAN SIBER
## 1.0 DOKTRIN KANONIKAL TATA KELOLA ANTARMUKA RATEGOAN (BATAS WILAYAH MUTLAK)
1. Koreksi Teks Model: HAPUS KATA '(Aktif)':
Di kartu model (#model-sheet dan halaman Pengaturan), teks resmi adalah murni 'Raget 1.0' (DILARANG mencantumkan kata '(Aktif)').
Subtitle resmi: 'Satu model berdaulat penuh. Kecepatan menyesuaikan tugas.'
2. Batas Wilayah Tanggung Jawab 4 Area Utama:
A. ICON MODEL (Chip CPU di Composer) — KHUSUS URUSAN OTAK AI:
Menampilkan satu model: 'Raget 1.0'.
Di bawahnya terdapat satu tombol pengatur upaya/kecepatan otak: [ Cepat ▾ ] dengan 3 tingkatan murni:
'Otomatis' (Menyeimbangkan kecepatan dan kedalaman sesuai tugas).
'Cepat' (Respons instan <10ms, hemat daya baterai).
'Tinggi' (Berpikir keras untuk tugas rumit, riset, dan penalaran analitis mendalam).
Di balik layar:
Mode Cepat menghubungkan 'kabel' ke Fast-Path Sistem 1 (<10ms).
Mode Tinggi menghubungkan 'kabel' ke Sistem 2 Neural + CoT + Deep Research synthesizer.
Seluruh detail rekayasa rumit ini bekerja otonom di balik layar tanpa perlu tombol/tulisan bertumpuk di layar pengguna.
B. ICON + (Lembar Lampiran) — KHUSUS URUSAN KONTEKS MASUKAN PESAN:
Judul permanen: 'Lampiran' dengan tombol tutup (×).
ZONA 1 (Media Berkas): [ 📷 Kamera ] [ 🖼️ Foto ] [ 📄 Dokumen ].
ZONA 2 (Konteks Kerja):
[ 🗂️ Kaitkan ke Proyek ]: Perbaiki bug teks ganda di composer.js:518 agar menampilkan 'Belum ada proyek terpilih (Pilih)' jika kosong, atau 'Proyek aktif: [Nama Proyek]' jika aktif.
[ 🌐 Pencarian Web ]: Sakelar ON/OFF untuk mencari informasi segar di internet jika data lokal kurang.
[ 📁 Hubungkan Folder Lokal ]: Membaca berkas di komputer/perangkat lokal tanpa unggah.
LARANGAN MUTLAK DI ICON +:
Dilarang menaruh tombol 'Alat mandiri' (karena Konektor sudah ada di Sidebar).
Dilarang menaruh tombol 'Kapsul Memori' (karena memori sudah tertanam di otak Raget 1.0 dan diatur di Pengaturan).
Dilarang menaruh tombol penalaran/kecepatan di sini (karena itu milik Icon Model).
C. SIDEBAR DRAWER — KHUSUS URUSAN NAVIGASI RUANG KERJA:
Menampung 6 pilar workstation: Chat Baru, Studio kode, Proyek, Koleksi, Konektor, Artefak, serta Riwayat Chat dan Profil Akun.
D. PENGATURAN — KHUSUS PREFERENSI & DATA SISTEM:
Menampilkan profil pengguna, Tampilan, Model Aktif (Raget 1.0), Kapsul Memori, dan Pencadangan Data.
## 1.0 BAB 1.0: TINDAKAN DARURAT & PEMBUANGAN TOTAL 11 CACAT FATAL (AUDIT TANGKAPAN LAYAR 23:00 WIB)
Cacat Fatal 1 - Teks Mentah 'Muat ulang' di Seluruh Halaman:
Akar Masalah: Pada js/main.js baris 159-163, skrip service worker mengeksekusi document.body.appendChild(btn) dengan teks 'Muat ulang' tanpa CSS, sehingga tombol mentah tercecer di bagian bawah setiap layar.
Solusi: HAPUS TOTAL document.body.appendChild(btn) dari js/main.js. Pemberitahuan pembaruan cukup memakai toast.show('Versi baru tersedia. Ketuk untuk memuat ulang', { onClick: () => location.reload() }).
Cacat Fatal 2 & 8 - Pembersihan Header Topbar (Hilangkan 'Memori: 0 fakta' dan 'Umum'):
Akar Masalah: Header dipenuhi gelembung #header-memory-pill ('Memori: 0 fakta') dan #header-skill-pill ('Umum') yang membuat tampilan sesak, berantakan, dan amatir. Padahal kecerdasan sudah tertanam di otak Raget 1.0.
Solusi: HAPUS TOTAL elemen #header-memory-pill dan #header-skill-pill dari header di index.html dan chat.js. Header atas obrolan HANYA memuat: [ ☰ Menu ] | Raget 1.0 (nama model) | [ ✏️ Chat Baru ] [ ⋮ Menu Tindakan ]. Tampilan seketika menjadi lega, luas, dan bersih berkelas dunia.
Cacat Fatal 3, 5, & 10 - Penyatuan Model Tunggal Raget 1.0 & Penghapusan Tumpukan Kartu Model:
Akar Masalah: Pada #model-sheet dan Pengaturan > Model (settings.js:305), Grok Build menumpuk kartu Auto, Raget 1.0 Kilat, Raget 1.0 Cerdas, dan Berpikir keras seolah-olah ada banyak model berbeda.
Solusi: Model HANYA SATU: 'Raget 1.0'.
Di #model-sheet: Tampilkan nama model 'Raget 1.0 (Aktif)'. Di bawahnya sediakan satu tombol kontrol kecepatan/upaya terpadu: [ 🚀 Otomatis ▾ ]. Ketika diklik, baru muncul pilihan dropdown:
🚀 Otomatis (Rekomendasi - cepat untuk sapaan/math, mendalam untuk analisis).
⚡ Cepat (Respons instan <10ms, hemat daya).
🧠 Mendalam (Berpikir keras untuk tugas rumit).
Di Pengaturan > Model: Cukup tampilkan satu kartu status: 'Model Utama: Raget 1.0' dengan pengaturan kecepatan aktif. DILARANG mendaftar banyak model terpisah.
Cacat Fatal 4 - Pembuangan Teks Cakar Ayam di Halaman Konektor:
Akar Masalah: Pada js/connectors/connector-hub.js:93, Grok Build mencetak string mentah 'Vault dokumen', 'OCR', 'Suara', 'Kalkulus', 'Kanvas', 'Agenda' ke dalam elemen p tanpa CSS sehingga tampil berantakan.
Solusi: HAPUS TOTAL blok perulangan teks mentah tersebut dari connector-hub.js. Tampilkan kartu konektor resmi yang sudah tertata rapi.
Cacat Fatal 6 & 7 - Eliminasi Duplikasi & Pembersihan Lembar Lampiran (#attach-sheet):
Kunci nama permanen lembar tombol plus (+): 'Lampiran' (Hapus nama gonta-ganti 'Konteks', 'Tambahkan ke chat', 'MEDIA').
Hapus tombol duplikasi 'Alat mandiri' dari lembar lampiran (yang hanya membuka halaman konektor).
Hapus tombol duplikasi 'Kapsul memori' dari lembar lampiran.
Lembar Lampiran HANYA memuat:
Media: [ 📷 Kamera ] [ 🖼️ Foto ] [ 📄 Dokumen ]
[ 🗂️ Kaitkan ke Proyek ] (Menampilkan status proyek aktif)
[ 🌐 Pencarian Web ] (Toggle switch ON/OFF)
[ 📁 Hubungkan Folder Lokal ]
Cacat Fatal 9 - Pembersihan Tombol Mengambang di Layar Chat Kosong:
Hapus 4 tombol pil mengambang (.starter-grid: Riset mendalam, Buat slide, Analisis berkas, Koding di Studio) yang mengotori tengah layar obrolan di index.html:65-75. Biarkan layar chat bersih dan tenang.
Cacat Fatal di Studio Kode:
Hapus teks cakar ayam unstyled '1. Tulis kode... Editor Pratinjau Konsol' dari index.html:183. Rapikan navigasi 3 zona dengan CSS yang layak.
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
Kapabilitas Riset Mendalam (Deep Research): Riset Mendalam BUKAN lampiran berkas, sehingga TIDAK BOLEH diletakkan sebagai toggle di lembar icon (+) Lampiran. Riset Mendalam adalah kapabilitas penalaran tingkat tinggi bawaan dari Otak AI (Raget 1.0) yang bekerja secara otonom di balik layar via pemicu alami: (1) Pengaturan Otak saat memilih tingkat upaya 'Tinggi' atau 'Otomatis' pada kueri kompleks, atau (2) Bahasa Alami (Intent-Based) ketika kueri meminta investigasi/kajian/riset mendalam. Dengan demikian, lembar icon (+) Lampiran tetap bersih 100% untuk berkas fisik.
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
Riset Mendalam (Deep Research) bekerja secara otonom di balik layar sebagai bagian dari kecerdasan bawaan Raget 1.0 (aktif via tingkat upaya 'Tinggi'/'Otomatis' atau instruksi bahasa alami). Ketika aktif, sistem mengeksekusi alur multi-sudut dan menyematkan Kartu Laporan Riset Interaktif langsung di dalam percakapan chat yang mencakup:
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
## 5.1 Blueprint Eksekusi Standardisasi Kanonikal & Penguncian Doktrin Batas Wilayah
Penguncian Standar Final Grok Build: Grok Build dikunci untuk mematuhi Doktrin Kanonikal Tata Kelola Antarmuka Rategoan secara permanen. Dilarang melakukan perubahan acak pada struktur 4 area utama (Icon Model, Icon +, Sidebar, Pengaturan) atau menambahkan kata '(Aktif)' pada nama model Raget 1.0.
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
## 4.2 Rekonstruksi Presisi Lembar Lampiran (Icon +) & Batas Wilayah Antarmuka Kanonikal
1. Evaluasi Keberhasilan Pembersihan Terakhir:
Topbar bersih total: Gelumbung 'Memori: 0 fakta' dan tombol 'Umum' telah hilang. Header kini lega dan profesional ([ ☰ ] | Raget 1.0 | [ ✏️ ] [ ⋮ ]).
Teks mentah 'Muat ulang' di bagian bawah layar telah berhasil dieliminasi.
Model Sheet telah rapi mengadopsi model tunggal Raget 1.0 (Aktif) dengan dropdown kecepatan [ Cepat ▾ ] (Otomatis, Cepat, Mendalam).
Layar chat bersih dari 4 tombol pil mengambang.
2. Identifikasi Fitur Kritis yang HILANG di Icon + dan Sangat Dibutuhkan Pengguna:
Saat Grok Build membersihkan lembar Lampiran (#attach-sheet), terjadi pemangkasan yang terlalu agresif sehingga fitur-fitur vital hilang tanpa alternatif akses:
KEHILANGAN 1: Toggle 'Riset Mendalam' (Deep Research):
Dampak: Pengguna kehilangan kendali visual untuk mengaktifkan mode riset multi-sumber sebelum bertanya.
Solusi: Kembalikan toggle 'Riset Mendalam' dengan deskripsi jelas: 'Investigasi multi-sudut dan susun laporan kanvas'.
KEHILANGAN 2: Toggle 'Kapsul Memori' (Gunakan Memori Personal):
Dampak: Pengguna tidak bisa mematikan/menyalakan memori personal untuk obrolan privat (incognito).
Solusi: Kembalikan toggle 'Kapsul Memori' dengan deskripsi: 'Gunakan fakta memori personal di obrolan ini' (Default: ON).
KEHILANGAN 3: Akses 'Alat Mandiri' (Konektor 29 Alat Lokal):
Dampak: Pengguna tidak bisa melihat status 29 perkakas lokal dari dalam obrolan.
Solusi: Sediakan baris 'Alat Mandiri' ('29 perkakas lokal aktif >') yang membuka sheet daftar alat lokal secara anggun.
KEHILANGAN 4: Tombol 'Rancang Slide Presentasi (.pptx)':
Akar Masalah: Mesin pembuatan presentasi (shared/pptx-local.js, buildOutline, exportSlides di composer.js:751) masih aktif 100%, namun elemen tombol visualnya (#sheet-slide) terhapus dari index.html saat pembersihan lembar lampiran, sehingga pengguna kehilangan akses tombol pembuatan slide di icon (+).
Solusi Rekayasa: Kembalikan tombol visual 'Rancang Slide' di lembar Lampiran (#attach-sheet) dengan baris aksi '📊 Rancang Slide Presentasi (.pptx)', subtitle 'Rangkai materi percakapan atau topik baru menjadi berkas PowerPoint'. Saat diketuk, mengaktifkan mode slide (this.slideActive = true) dan menyiapkan input 'Buatkan slide presentasi tentang: ' atau memproses materi chat aktif ke kanvas slide.
BUG TEKS: Pengulangan Teks 'Kaitkan ke Proyek' dua kali di tombol proyek:
Perbaikan: Perbaiki composer.js baris 518: Jika cur kosong, tulis 'Belum ada proyek terpilih (Pilih)'. Jika ada, tulis 'Proyek aktif: ' + cur.name.
3. Doktrin Batas Wilayah 4 Area Utama Antarmuka:
1. Icon Model (Chip CPU): Khusus pengaturan model tunggal 'Raget 1.0' dan selector kecepatan [ Otomatis | Cepat | Tinggi ].
2. Icon + (Lampiran): Khusus media (Kamera, Foto, Dokumen) dan konteks masukan (Proyek, Pencarian Web, Folder Lokal). Dilarang memasukkan tombol Alat Mandiri, Kapsul Memori, atau pengatur kecepatan.
3. Sidebar Drawer: Navigasi utama 6 pilar workstation, riwayat obrolan, dan profil pengguna.
4. Pengaturan: Preferensi sistem, profil, status model Raget 1.0, Kapsul Memori, dan backup data.
Tajuk: 'Lampiran' dengan tombol tutup (×).
Media Input (3 Kotak Atas): [ 📷 Kamera ] [ 🖼️ Foto ] [ 📄 Dokumen ].
Opsi Kerja & Konteks:
1. [ 🗂️ Kaitkan ke Proyek ] -> 'Belum ada proyek terpilih (Pilih) >' (atau 'Proyek aktif: Nama >').
2. [ 🌐 Pencarian Web ] -> [Toggle ON/OFF] ('Menelusuri informasi mutakhir di internet').
3. [ 🔬 Riset Mendalam ] -> [Toggle ON/OFF] ('Investigasi multi-sudut dan susun laporan kanvas').
4. [ 🧠 Kapsul Memori ] -> [Toggle ON/OFF] ('Gunakan fakta memori personal di obrolan ini').
5. [ 📊 Rancang Slide Presentasi (.pptx) ] -> 'Rangkai materi percakapan atau topik baru menjadi berkas PowerPoint'.
7. [ 📁 Hubungkan Folder Lokal ] -> 'Baca berkas di perangkat ini, tanpa unggah'.6. [ 🔗 Alat Mandiri ] -> '29 perkakas lokal aktif >'.

1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
## 5.2 Kriteria Kelulusan Akhir (Definition of Done)
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).

Sektor
Cakup Pekerjaan
Berkas Utama
32 Poin Pekerjaan Konkret + Prioritas Pembersihan 11 Cacat Fatal
Sektor Utama (Prioritas 1)
Pembersihan Total 11 Cacat Fatal UI & Penyatuan Model
js/main.js, index.html, js/chat/chat.js, js/sheets/model-sheet.js, js/account/settings.js, js/connectors/connector-hub.js, js/ui/attach-sheet.js
1. [PRIORITAS UTAMA COMMIT NEXT] Hapus document.body.appendChild(btn) 'Muat ulang' di main.js & ganti dengan toast.
2. Hapus total #header-memory-pill & #header-skill-pill dari header obrolan.
3. Satukan model menjadi 'Raget 1.0' dengan kontrol kecepatan [🚀 Otomatis ▾] di #model-sheet & Pengaturan.
4. Hapus string mentah unstyled p di connector-hub.js.
5. Kunci nama 'Lampiran', hapus tombol duplikasi 'Alat mandiri' & 'Kapsul memori' dari #attach-sheet.
6. Hapus 4 tombol starter-grid mengambang dari layar chat kosong.
7. Hapus teks unstyled di Studio Kode index.html:183 & rapikan navigasi 3 zona dengan CSS.
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
13. Pindahkan aksi "Ubah" to menu titik tiga (⋮).
14. Konsolidasi CoT ke akordeon tunggal.
15. Integrasi Mode Kilat (2-3 kalimat padat).
16. UX Lampiran (#attach-sheet): Restrukturisasi Presisi, pemulihan elemen #sheet-slide ('Rancang Slide Presentasi (.pptx)'), terhubung ke composer.js:751, serta Pemulihan Toggle Riset Mendalam, Kapsul Memori, & Alat Mandiri.
17. Perbaikan bug teks proyek ganda di composer.js.
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
30. Penyatuan model & Auto-Router di js/sheets/model-sheet.js, js/account/settings.js (Opsi [🚀 Auto | ⚡ Kilat | 🧠 Cerdas]).
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

# BAB 8.3: SPESIFIKASI RESTORASI FITUR HILANG (MEMO SUARA, SLIDE PPTX, DOKUMEN DOCX, KUIS INTERAKTIF, DAN INTEGRITAS KONTROL MODEL)
## 1. Analisis Forensik Tangkapan Layar Historis (Pukul 22.29 WIB)
1. Header Obrolan Lama: Kapsul menu [Umum ▾] di header dihapus permanen. Header resmi: [ ☰ Menu ] | Raget 1.0 | [ ✏️ Chat Baru ] [ ⋮ Menu Tindakan ].
2. Fungsi Kartu 'Memo Suara' (#sheet-voice): Menggunakan Web Speech API browser (SpeechRecognition id-ID) via js/chat/voice.js. Mengubah ucapan suara pengguna langsung menjadi teks di #chat-input dan mengirim otomatis setelah jeda 2 detik. Pulihkan tombol #sheet-voice ke Grid Media di #attach-sheet sehingga menjadi 4 kartu bulat: Kamera (Biru), Foto (Ungu), Dokumen (Hijau), dan Memo Suara (Oranye).
3. Penataan Mode Penalaran: Sakelar 'Berpikir lebih keras' dan 'Mode kilat' dipindahkan ke kontrol upaya Ikon Model Raget 1.0. 'Pencarian Web' dan 'Riset Mendalam' dipertahankan di lembar lampiran sebagai kontrol konteks penelusuran.
## 2. Restorasi Aksi Pembuatan Berkas di Lembar Lampiran (#attach-sheet)
Grok Build wajib memulihkan tombol berikut di index.html karena handler JavaScript-nya di js/chat/composer.js sudah aktif:
#sheet-slide: [Rancang Slide Presentasi (.pptx)] terhubung ke composer.js:751 dan shared/pptx-local.js.
#sheet-doc: [Buatkan Dokumen (.docx)] terhubung ke composer.js:743 dan shared/docx-local.js.
#sheet-learn: [Belajar & Kuis Interaktif] terhubung ke composer.js:671 dan quiz-session.js.
## 3. Perbaikan Bug Teks Ganda Proyek di js/chat/composer.js:518
Perbaiki label proyek: jika kosong tampilkan 'Belum ada proyek terpilih (Pilih)', jika ada proyek aktif tampilkan 'Proyek aktif: [Nama Proyek]'.
## 4. Pembersihan Nama Model Raget 1.0
Di js/sheets/model-sheet.js:62, hapus kata '(Aktif)', gunakan murni 'Raget 1.0'. Subtitle: 'Satu model berdaulat penuh. Kecepatan menyesuaikan tugas.' Pilihan kecepatan: Otomatis, Cepat, Mendalam.
## 5. Pemulihan Tombol Simpan ke Artefak di Studio Kode (#studio-to-artifact)
Tambahkan kembali tombol <button type="button" id="studio-to-artifact" class="plain">Simpan ke Artefak</button> pada toolbar aksi Studio Kode di index.html.
## 6. Standar Kualitas
Pertahankan 100% kelulusan npm test (17/17) dan npm run lint (0 error, 0 warning, Anti-placeholder: 0).
# BAB 8.4: MATRIKS PENYELARASAN TOTAL, REKONSILIASI KONTRAK ANTARMUKA & CHECKLIST EKSEKUSI TUNGGAL SEKALI JALAN (GROK BUILD MASTER SPRINT DIRECTIVE)
## 1. Klausul Harmonisasi & Resolusi Kontradiksi Internal Dokumen
Instruksi pada bab ini secara resmi MENYELARASKAN dan MENGGANTIKAN (override) seluruh klausul parsial terdahulu yang sempat bertentangan, agar Grok Build tidak mengalami keraguan atau salah hapus:
1. Penyelarasan Lembar Lampiran (#attach-sheet):
Klausul awal yang menyatakan 'Lembar Lampiran HANYA memuat 3 media + Proyek + Web + Folder' resmi diperluas menjadi format kanonikal utuh yang menampung 4 Media (termasuk Memo Suara), 3 Aksi Berkas Deliverables (Slide PPTX, Dokumen DOCX, Kuis Interaktif), dan 4 Konteks/Alat (Proyek, Web, Riset Mendalam, Folder Lokal).
Larangan pada lembar lampiran HANYA berlaku untuk:
a. DILARANG menaruh tombol 'Alat mandiri' (karena Konektor sudah ada di Sidebar).
b. DILARANG menaruh tombol 'Kapsul Memori' (karena memori sudah diatur di Pengaturan).
c. DILARANG menaruh sakelar kecepatan/upaya model seperti 'Berpikir lebih keras' dan 'Mode kilat' (karena kedua hal ini adalah urusan Otak AI di Ikon Model).
2. Penyelarasan Teks Model Raget 1.0:
Seluruh teks di #model-sheet dan Pengaturan dikunci murni: 'Raget 1.0' (HAPUS kata '(Aktif)' secara mutlak).
Bentuk antarmuka model HANYA SATU: satu kartu model 'Raget 1.0' dengan satu tombol dropdown kecepatan [ Otomatis ▾ ] berisi: Otomatis, Cepat, Mendalam. DILARANG menumpuk 3 kartu terpisah.
## 2. Checklist Eksekusi Berkas demi Berkas Sekali Jalan (Single-Pass Directives)
### Berkas A: index.html
1. Lembar Lampiran (#attach-sheet):
Grid Media (4 tombol): #sheet-camera (Kamera), #sheet-photo (Foto), #sheet-file (Dokumen), dan #sheet-voice (Memo Suara).
Baris Aksi Berkas: #sheet-slide (Rancang Slide Presentasi .pptx), #sheet-doc (Buatkan Dokumen .docx), dan #sheet-learn (Belajar & Kuis Interaktif).
Baris Konteks & Alat: #sheet-project (Kaitkan ke Proyek), #sheet-websearch (Pencarian Web - switch), #sheet-research (Riset Mendalam - switch), dan #sheet-folder (Hubungkan Folder Lokal).
2. Bilah Aksi Studio Kode (#view-studio .studio-actions):
Tambahkan tombol: <button type="button" id="studio-to-artifact" class="plain">Simpan ke Artefak</button>.
3. Bilah Atas Obrolan (#topbar):
Pastikan bersih: <button id="btn-menu">, <h1>Raget 1.0</h1>, <button id="btn-new-chat-top">, dan <button id="btn-chat-more">.
### Berkas B: js/chat/composer.js
1. Perbaikan Teks Ganda Proyek:
Baris 518: Ganti label.textContent = cur ? ('Kaitkan ke Proyek · ' + cur.name) : 'Kaitkan ke Proyek'; menjadi:
label.textContent = cur ? ('Proyek aktif: ' + cur.name) : 'Belum ada proyek terpilih (Pilih)';
2. Pengikatan Event Aksi Berkas:
Pastikan #sheet-slide, #sheet-doc, #sheet-learn, dan #sheet-voice terikat rapi ke fungsinya masing-masing dan menutup sheet saat diklik.
### Berkas C: js/sheets/model-sheet.js
1. Pembersihan Kata (Aktif):
Baris 62: Ubah name.textContent = 'Raget 1.0 (Aktif)'; menjadi murni name.textContent = 'Raget 1.0';.
2. Penegasan Dropdown:
Tetap gunakan tombol dropdown kecepatan tunggal: Otomatis, Cepat, Mendalam.
### Berkas D: js/account/settings.js
1. Kartu Model di Pengaturan:
Pastikan kartu status model menampilkan 'Model Utama: Raget 1.0' dengan dropdown kecepatan yang selaras dengan model-sheet.
### Berkas E: css/ui/overhaul.css
1. Ergonomi Layar Ponsel untuk #attach-sheet:
Pastikan modal #attach-sheet memiliki max-height: 80vh dan overflow-y: auto agar di ponsel berlayar kecil seluruh 11 elemen dapat di-scroll dengan mulus tanpa terpotong.
## 3. Gerbang Validasi Akhir (Definition of Done)
1. npm test: 17/17 unit test lulus 100%.
2. npm run lint: 0 error, 0 warning, Anti-placeholder: 0.
3. Seluruh elemen HTML yang memiliki penangan JavaScript terpasang utuh tanpa ada yang berstatus yatim (orphaned handler).
# BAB 8.5: RESOLUSI FATAL AUDIT REPOSITORI (RESTORASI IKON LAMPIRAN, ELIMINASI PENUMPUKAN TEKS SLIDE, PENYEDERHANAAN KONTROL MODE MODEL 'CEPAT & MENDALAM', DAN AUDIT KELAYAKAN SEMUA SEKTOR)
## 1. Resolusi Fatal 1 & 2: Restorasi Ikon SVG & Eliminasi Penumpukan Teks di Lembar Lampiran (#attach-sheet)
1. Restorasi Ikon SVG Mutlak: Grok Build DILARANG KERAS menampilkan baris lampiran berupa teks mentah tanpa ikon. Setiap baris tombol (.attach-plain) WAJIB memiliki elemen <svg width="20" height="20"> di sebelah kiri teks label.
2. Eliminasi Penumpukan Teks & Pemecahan Berlebih: Hapus pemecahan teks panjang dan paragraf deskripsi berlebih yang membuat antarmuka sesak dan membingungkan pengguna. Kembalikan ke nama menu yang ringkas, bersih, dan fungsional seperti sebelumnya:
Grid Atas Media (4 tombol bulat): [ 📷 Kamera ] [ 🖼️ Foto ] [ 📄 Dokumen ] [ 🎙️ Memo Suara ].
Baris di Bawah Media (Wajib Berikon SVG & Bersih Tanpa Paragraf Panjang):
a. <button class="attach-plain" id="sheet-slide" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="13" rx="2"/><line x1="6" y1="8" x2="14" y2="8"/><line x1="6" y1="11.5" x2="18" y2="11.5"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span class="attach-plain-label">Buat Slide (.pptx)</span></button>
b. <button class="attach-plain" id="sheet-project" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><span class="attach-plain-label">Kaitkan ke Proyek<small id="sheet-project-label">Belum ada proyek terpilih (Pilih)</small></span></button>
c. <button class="attach-plain" id="sheet-websearch" type="button" role="switch" aria-checked="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><line x1="3" y1="12" x2="21" y2="12"/><path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18z"/></svg><span class="attach-plain-label">Pencarian Web</span><span class="switch" aria-hidden="true"><span class="switch-thumb"></span></span></button>
d. <button class="attach-plain" id="sheet-research" type="button" role="switch" aria-checked="false"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><span class="attach-plain-label">Riset mendalam</span><span class="switch" aria-hidden="true"><span class="switch-thumb"></span></span></button>
e. <button class="attach-plain" id="sheet-folder" type="button"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><span class="attach-plain-label">Hubungkan Folder Lokal</span></button>
## 2. Resolusi Fatal 4: Penyederhanaan Model Raget 1.0 (Hapus Slogan & Hapus Opsi Otomatis)
1. Hapus Total Slogan di Bawah Raget 1.0:
Di js/sheets/model-sheet.js:63 dan js/account/settings.js, HAPUS TOTAL elemen <small>Satu model berdaulat penuh. Kecepatan menyesuaikan tugas.</small>.
Cukup tampilkan nama model bersih dan elegan: Raget 1.0.
2. Ubah Tombol Menjadi Berlabel 'Mode' & Hapus Opsi 'Otomatis':
Tombol pengatur mode wajib diberi label jelas, bukan hanya nama kecepatan mengambang: tampilkan Mode: Cepat ▾ atau Mode: Mendalam ▾.
HAPUS opsi Otomatis dari SPEEDS di model-sheet.js, dari select di settings.js, dan dari js/state/engine-preference.js.
Pilihan murni dua opsi yang tegas dan tidak membuat pusing:
a. Cepat (Respons instan, hemat daya - default).
b. Mendalam (Berpikir keras untuk tugas rumit).
## 3. Matriks Audit & Penutupan Celah di Semua Sektor (File-by-File Sprint)
1. index.html: Terapkan markup #attach-sheet bersih berikon SVG di atas. Pastikan #header-model-name tetap ramping dan tombol #studio-to-artifact tetap aktif.
2. js/sheets/model-sheet.js: Hapus subteks slogan, ubah daftar SPEEDS hanya berisi template (label: 'Cepat') dan neural (label: 'Mendalam'), serta ubah tombol menjadi 'Mode: ' + labelOf(pref) + ' ▾'.
3. js/state/engine-preference.js: Set nilai default menjadi 'template'. Validasi nilai hanya mengizinkan 'template' atau 'neural'.
4. js/account/settings.js: Hapus subteks slogan pada kartu model dan hapus <option value="auto"> dari select #engine-speed.
5. js/chat/composer.js: Pastikan klik sheet-slide langsung memicu pembuatan slide tanpa teks berbelit-belit.
6. css/ui/overhaul.css: Pastikan ruang vertikal #attach-sheet lega, tinggi ikon pas 20x20px, dan tidak memicu overflow sempit.
## 4. Gerbang Kualitas (Definition of Done)
npm test: 17/17 lulus.
npm run lint: 0 error, 0 warning, Anti-placeholder: 0.
Tidak ada teks slogan indie di kartu model.
Tidak ada tombol lampiran tanpa ikon SVG.
## 5. Prinsip Enkapsulasi Fitur Tunggal (Eliminasi Tombol Dokumen & Kuis dari Lampiran)
1. Fitur Slide adalah satu kesatuan utuh yang di dalamnya sudah mampu menyusun naskah, merancang tata letak, dan mengekspor berkas PPTX.
2. Dilarang memecah fitur menjadi deretan tombol teks panjang seperti 'Rancang Slide', 'Buatkan Dokumen (.docx)', dan 'Belajar dan Kuis Interaktif' di lembar lampiran (+).
3. Hapus tombol '#sheet-doc' dan '#sheet-learn' dari index.html.
4. Cukup tampilkan satu tombol berwibawa: 'Buat Slide (.pptx)' dengan ikon SVG asli.
5. Lembar lampiran terkunci hanya berisi: 4 Media di atas (Kamera, Foto, Dokumen, Memo Suara) dan 5 Baris berikon SVG di bawah: Buat Slide (.pptx), Kaitkan ke Proyek, Pencarian Web, Riset mendalam, dan Hubungkan Folder Lokal. Bebas dari penumpukan teks.
