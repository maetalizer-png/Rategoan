<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T20:35:05Z. Versi 3.1.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 3.1.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 (STATUS: ARSIP TERTUTUP & SELESAI)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: ARSITEKTUR TATA LETAK, IDENTITAS MODUL & INTEGRITAS REKAYASA
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri:
⚡ Raget Template: Otak deterministik instan (<10ms), berbasis basis data & FAQ kanonikal, zero-halusinasi, 100% offline (Aktif / Default).
🧠 Raget Neural: Otak jaringan saraf tiruan lokal mandiri Rategoan yang dilatih dari korpus rilis Rategoan.
Pembersihan Total: Tidak boleh ada opsi Ollama atau server luar di seluruh aplikasi.
## 1.2 Peta Tata Letak Lengkap, Fungsi & Cara Kerja Komponen
A. BILAH PENGETIKAN (COMPOSER BOX — BAGIAN BAWAH CHAT)
Area Input Teks (chat-input): Di tengah wadah composer, otomatis membesar (auto-grow) sesuai panjang teks.
Tombol Lampirkan (+ / btn-attach): Di sisi kiri bawah input, membuka lembar lampiran (#attach-sheet).
Tombol Pemilihan Model Otak (btn-model — Ikon Chip CPU):
WAJIB TAMPIL AKTIF di samping tombol (+). Dilarang diberi atribut hidden.
Mengkliknya membuka modal pilihan: [⚡ Raget Template] atau [🧠 Raget Neural].
Tombol Suara (btn-voice-input — Ikon Mikrofon 🎤): Di sisi kanan bawah input untuk perekaman suara lokal.
Tombol Kirim Pesan (btn-send — Ikon Pesawat Kertas ➤):
Dilarang dihilangkan total (dilarang display: none). Saat input kosong, tombol kirim berstatus redup (disabled, opacity 0.45). Begitu ada teks diketik, menyala biru tegas siap kirim.
Tombol Berhenti (btn-stop — Ikon Kotak Merah/Hitam ⏹️): Menggantikan tombol kirim saat AI sedang menyusun jawaban (is-generating), memicu abortController.abort().
B. HEADER OBROLAN (BAGIAN ATAS CHAT)
1. Tombol Menu (☰): Membuka Sidebar Drawer.
2. Judul Sesi Aktif / Status: Menampilkan judul obrolan aktif.
3. Indikator Mode Mandiri: Pil status [ ⚡ Mandiri (Offline) ] saat jaringan mati.
4. Pemilih Keahlian Terintegrasi (Skill Selector): Terpasang sebagai tombol pil elegan di Header atas [ 🎯 Umum ▾ ]. Mengkliknya membuka sheet pemilihan spesialisasi (Umum, Analis Data, Auditor Kode, Penulis Teknis, Peneliti) tanpa membuat bilah ketik keyboard sesak.
5. Tombol Obrolan Baru (Ikon Pena Edit) & Menu Opsi (⋮).
C. SIDEBAR DRAWER (#sidebar — NAVIGASI UTAMA ASLI)
Mempertahankan penamaan asli ringkas Rategoan:
1. Chat Baru: Membuka percakapan baru.
2. Studio kode: Lingkungan rekayasa perangkat lunak mandiri (setara Claude Code / Codex). Mendukung integrasi folder lokal (File System Access), penjelajah berkas, Diff Viewer (perubahan merah/hijau), dan eksekusi skrip Web Worker lokal.
3. Proyek: Ruang kerja berbasis topik dengan berkas rujukan permanen (PDF/DOCX) dan instruksi sistem khusus.
4. Koleksi: Galeri penyimpanan catatan dan memo pengguna.
5. Konektor: Rumah bagi 33 alat lokal berdaulat (Client-Side Dispatcher).
6. Artefak: Galeri meja kerja dokumen hidup hasil kolaborasi Cowork (naskah, laporan, slide).
7. Riwayat Chat & Profil Pengguna di footer drawer.
D. LEMBAR LAMPIRAN (#attach-sheet — POPUP TOMBOL +)
Murni berisi: 4 Orb Media ber-SVG nyata (Kamera, Foto, Dokumen, Memo Suara) + 4 Toggle Mode Penalaran + 1 Baris Aksi [ Hubungkan Folder Lokal ]. Seksi duplikat 'Studio' (Studio Kode, Kaitkan ke Proyek, Belajar terpandu) telah dihapus total.
## 1.3 Hukum Integritas Rekayasa & Verifikasi Kode Sumber Nyata
1. Mandat Verifikasi Kode Nyata (Anti-Asumsi): Dilarang keras menulis audit UI atau merekayasa instruksi hanya berdasarkan asumsi atau tangkapan layar visual tanpa terlebih dahulu memverifikasi baris kode riil di repositori (git grep / inspeksi berkas).
2. Status Arsip PRD 1.0 (Tuntas & Terkunci): Seluruh 43 bab pada PRD Antarmuka 1.0 (khususnya §38.1 Audit Kapsul Memori yang sudah diperbaiki kodenya) dinyatakan SELESAI, DITUTUP, dan DIARSIPKAN per 4 Oktober 2026. Grok Build dilarang mengeksekusi ulang bab lama PRD 1.0 agar tidak menimpa kode yang sudah sehat.

# BAB 2: PROTOKOL KERJA OTONOM & SANITASI PRE-FLIGHT (CONTINUOUS RUN ENGINE)
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

# BAB 3: PERBAIKAN ERGONOMI, BILAH TULIS & KONTROL TAMPILAN
## 3.1 Pemulihan Ikon Pemilihan Model & Tombol Kirim di Composer
Hapus atribut hidden pada <button id="btn-model"> di index.html.
Jangan menyembunyikan #btn-send saat kolom kosong; tampilkan redup (disabled, opacity: 0.45) berdampingan dengan mikrofon, dan menyala tegas saat ada teks.
Tombol [ ⏹️ Berhenti ] otomatis menggantikan tombol kirim/mic saat respons sedang diketik AI.
## 3.2 Pemindahan Pemilih Keahlian ke Header Atas
Terpasang sebagai <button id="header-skill-pill" class="header-pill">Umum ▾</button> di header atas.
Mengkliknya memunculkan #skill-sheet untuk memilih 5 spesialisasi tanpa memakan area keyboard.
## 3.3 Penataan Ulang Halaman Pengaturan & Segmented Controls (css/account/settings.css)
Terapkan Stacked Layout pada .set-row-theme dan .set-row-font agar label "Mode Gelap" dan "Ukuran Teks" tidak patah kata di layar ponsel.
Profil bersih tanpa slogan mengambang, meter penyimpanan Penyimpanan: x MB / 50 MB, dan hanya 2 otak resmi.

# BAB 4: REFACTORING STRUKTURAL, KOMPONEN BERSAMA & EKOSISTEM ALAT
## 4.1 Tugas Terjadwal Eksplisit: Pemecahan 2 File Raksasa (1.446 Baris)
Untuk mengeliminasi utang teknis monolitik yang telah lama diabaikan, Grok Build diwajibkan memecah 2 file raksasa berikut menjadi modul terisolasi berkohesi tinggi:
1. Pemecahan raget/raget-agents/agent-tools.js (800 baris):
Pecah menjadi 3 sub-modul di bawah direktori raget/raget-agents/tools/:
tool-registry.js (~250 baris): Pendaftaran katalog, metadata, skema parameter JSON, dan validasi tipe alat.
tool-executor.js (~350 baris): Logika eksekutor pemanggilan fungsi lokal (math, vault, vision, canvas, audio, agenda).
tool-security.js (~200 baris): Validasi batas keamanan, sanitasi payload, dan pembatasan wewenang eksekusi.
agent-tools.js dipertahankan sebagai fasad publik ringkas (< 80 baris) yang mengekspor ulang API untuk menjaga kompatibilitas.
2. Pemecahan raget/raget-agents/agent.js (646 baris):
Pecah menjadi 3 sub-modul di bawah direktori raget/raget-agents/core/:
agent-loop.js (~250 baris): Siklus loop penalaran ReAct, orkestrasi pemanggilan alat berantai, dan penanganan sinyal abort.
agent-context.js (~200 baris): Perakitan prompt sistem, pemangkasan riwayat percakapan (context window management), dan penyuntikan dokumen RAG.
agent-stream.js (~150 baris): Pemformatan luaran streaming, parser token parsial, dan callback UI pengetikan.
agent.js dipertahankan sebagai fasad pengendali instan (< 60 baris).
## 4.2 Pembangunan Helper Bersama: shared/filter-tabs.js
Untuk membasmi duplikasi kode manual pada pola pemilihan tab aktif di seluruh aplikasi:
1. Buat berkas baru shared/filter-tabs.js:
export function bindFilterTabs(container, onSelect) {
if (!container) return;
container.addEventListener('click', (e) => {
const btn = e.target.closest('button');
if (!btn || !container.contains(btn)) return;
container.querySelectorAll('button').forEach((b) => {
const isActive = (b === btn);
b.classList.toggle('on', isActive);
b.setAttribute('aria-selected', isActive ? 'true' : 'false');
});
if (typeof onSelect === 'function') {
onSelect(btn.dataset.tab || btn.dataset.ctab || btn.textContent.trim(), btn);
}
});
}
2. Refactor 5 Titik Duplikasi:
Ganti duplikasi seleksi tab manual di js/collection/collection.js (3 titik) dan js/ui/memory-capsule.js (2 titik) dengan pemanggilan bindFilterTabs().
## 4.3 Studio kode & Artefak
Studio kode: Pertahankan integrasi window.showDirectoryPicker() (tombol Folder lokal), Diff Viewer (tombol Tinjau Perubahan), dan eksekusi Web Worker.
Artefak: Pertahankan kanvas kerja split-screen / tab alih ponsel dengan tombol ekspor (.docx, .md, .pdf).
## 4.4 Katalog 33 Alat Lokal di Konektor
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
Pemulihan UI & Ergonomi Bilah Tulis
index.html, js/chat/composer.js, css/ui/overhaul.css
1. Pertahankan #btn-model aktif di samping (+).
2. Pertahankan tombol kirim redup saat kosong dan menyala saat ada teks.
3. Pertahankan pemilih Keahlian di Header Atas [ 🎯 Umum ▾ ].
4. Pertahankan lembar lampiran bersih tanpa seksi 'Studio'.
Fase 3
Refactoring File Raksasa & Helper Bersama
raget/raget-agents/, shared/filter-tabs.js, js/collection/, js/ui/
1. Pecah agent-tools.js (800 baris) menjadi 3 sub-modul tools/ (< 300 baris per file).
2. Pecah agent.js (646 baris) menjadi 3 sub-modul core/ (< 300 baris per file).
3. Buat shared/filter-tabs.js dan terapkan di collection.js & memory-capsule.js untuk menghapus 5 titik duplikasi logika tab.
Fase 4
Studio kode, Artefak & 33 Alat
js/studio/, js/artifacts/, js/connectors/
Pastikan Diff Viewer, Folder lokal, ekspor artefak, dan 33 alat lokal di Client-Side Dispatcher beroperasi stabil.
Fase 5
Pembersihan QC & Verifikasi Mandiri
Seluruh berkas JavaScript & Unit Test
Ganti blok catch kosong dengan log transparan, jalankan npm test (wajib 17/17 lulus) dan npm run lint (wajib 0 error).
Kriteria Kelulusan Akhir (Definition of Done):
1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).
4. Tidak ada berkas di raget/raget-agents/ yang melebihi 400 baris (agent-tools.js dan agent.js berhasil dipecah menjadi modul independen).
5. Berkas shared/filter-tabs.js aktif digunakan di collection.js dan memory-capsule.js, memangkas seluruh duplikasi toggle tab.
6. Ikon Chip CPU Model (#btn-model) dan Tombol Kirim (#btn-send) tampil harmonis di bilah pengetikan.
7. Pemilih Keahlian berada di Header Atas secara rapi, tidak membuat bilah ketik keyboard sesak.
8. Nama sidebar tetap ringkas asli: Chat Baru, Studio kode, Proyek, Koleksi, Konektor, Artefak.
9. PRD 1.0 §38.1 dikunci sebagai SELESAI & DITUTUP.
