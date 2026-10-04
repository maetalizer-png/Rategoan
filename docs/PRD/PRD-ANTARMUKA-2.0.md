<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-04T21:25:12Z. Versi 3.3.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 3.3.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 (STATUS: ARSIP TERTUTUP & SELESAI)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: IDENTITAS KEDAULATAN ASLI, RESOLUSI BUG KRITIS & MATRIKS NILAI PENGGUNA
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri:
⚡ Raget Template: Otak deterministik instan (<10ms), berbasis basis data & FAQ kanonikal, zero-halusinasi, 100% offline (Aktif / Default).
🧠 Raget Neural: Otak jaringan saraf tiruan lokal mandiri Rategoan yang dilatih dari korpus rilis Rategoan.
Pembersihan Total: Tidak ada lagi opsi Ollama atau server luar di seluruh aplikasi.
## 1.2 Resolusi 3 Bug Kritis & Cacat Tampilan (Hasil Investigasi Nyata)
Berdasarkan pengujian langsung pada tangkapan layar ponsel pengguna (04:12 WIB), ditemukan 3 cacat fungsional fatal yang wajib diperbaiki seketika:
Bug Saklar Mode Kilat Macet (Screenshot 1000003963):
Masalah: Klik pada tombol switch "Mode kilat" (#sheet-fast) tidak memindahkan tombol saklar visual.
Akar Masalah Kode: Di js/chat/composer.js:641, klik fastCard hanya memanggil hemat.toggle() dan mengubah aria-checked, tetapi LUPA menambahkan/menghapus kelas CSS .active. Padahal css/sheets/sheets.css:118 mengharuskan kelas .attach-plain.active agar animasi toggle bergeser.
Solusi: Panggil this._toggleSwitch('sheet-fast', on) di dalam klik fastCard dan sinkronkan kelas .active saat lembar lampiran dibuka.
Bug Cacat Render Riset Mendalam (Screenshot 1000003967):
1.3 Matriks Nilai & Peruntukan Menu (Panduan Memilih Fitur Bagi Pengguna)Masalah: Fitur Riset Mendalam menghasilkan kartu putih kosong bertuliskan angka "1." dengan navigasi "< Slide 0 / 0 >" yang tidak jelas arah dan maksudnya.
Akar Masalah Kode: Di js/chat/composer.js:372, riset mendalam mengirim payload { type: 'report', markdown: body, title: 'Berkas riset' }. Namun di js/ui/artifact.js:210 pada fungsi renderCurrent(), cabang pengecekan TIDAK memiliki kondisi untuk type === 'report'. Akibatnya sistem jatuh ke blok fallback terakhir: else renderSlide(), sehingga dokumen laporan riset dipaksa dirender sebagai presentasi Slide kosong yang rusak.
Solusi: Tambahkan penanganan eksplisit if (current.type === 'report') renderDocument(current.markdown, current.title) di renderCurrent(), sehingga laporan riset tampil sebagai naskah dokumen kajian ilmiah yang utuh, rapi, dan dapat dibaca serta diekspor ke Word (.docx) atau Markdown (.md).
Penataan Tipografi Fitur Berpikir Keras (Screenshot 1000003965 & 1000003966):
Masalah: Blok "Proses berpikir" tampil kaku dengan font monospaced mesin tik di dalam elemen <pre>, dan kontennya hanya berupa teks template kaku 4 baris.
Solusi: Perbaiki tipografi di css/ui/connect.css: gunakan font sans-serif proporsional (ukuran 13px, warna abu-abu lembut var(--rg-muted), line-height 1.6), bungkus dalam kartu ringkas berlatar var(--rg-surface-2), dan buat animasi akordeon buka-tutup yang mulus.

Untuk menghilangkan kebingungan pengguna mengenai fungsi dan perbedaan antar fitur, ditetapkan matriks panduan jelas:

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

# BAB 3: PERBAIKAN STRUKTUR & TATA LETAK STUDIO KODE (#view-studio)
## 3.1 Penyederhanaan Tata Letak Studio Kode (Dari 10 Tombol Menjadi 3 Zona Jelas)
Akar Masalah: Halaman Studio Kode saat ini membingungkan pengguna karena tombol-tombolnya berserakan di atas dan bawah editor ("JavaScript/Python", "index/style/script", "Salin", "Tinjau Perubahan", "Folder lokal", "Ekspor ZIP", "Jalankan", "Pratinjau", "Buka di panel", "Jadikan artefak").
Rekayasa Solusi — Susun Menjadi 3 Zona Kerja Inti yang Intuitif:
Zona 1 — Toolbar Atas (Konteks Proyek & Berkas):
Kiri: Pemilih Tipe Lingkungan: Tab segmented bersih `[ 🌐 Web App (HTML/CSS/JS) | 🐍 Skrip Python ]`.
Kanan: Aksi Penyimpanan & Berkas: Tombol `[ 📂 Buka Folder / ZIP ]` dan `[ 💾 Ekspor ZIP ]`.
Zona 2 — Tab Berkas & Editor Utama:
Baris Tab Berkas: Hanya menampilkan berkas yang relevan dengan tipe lingkungan yang dipilih (misal mode Web App: index.html, style.css, script.js; mode Python: main.py).
Area Editor: Textarea CodeMirror bernomor baris yang luas, bersih, dan nyaman diketik.
Zona 3 — Bilah Eksekusi & Terminal Hasil (Bawah):
Hanya 2 Tombol Tindakan Utama: `[ ▶️ Jalankan Kode ]` (Tombol utama hijau/biru — mengeksekusi skrip di Web Worker lokal) dan `[ 👁️ Pratinjau Web ]` (Tampil jika mode Web App dipilih — membuka iframe pratinjau langsung).
Toolbar Sekunder (Rata Kanan): Tombol `[ 📋 Salin ]` dan `[ ⚖️️ Tinjau Perubahan (Diff) ]`.
Hapus Tombol Membingungkan: Hapus tombol "Buka di panel" dan "Jadikan artefak" yang tidak jelas tujuannya bagi pengguna.
Kotak Terminal Konsol: Menampilkan hasil log eksekusi secara bersih dengan tombol [ Bersihkan ].

# BAB 4: REKAYASA KANVAS ARTEFAK & PENANGANAN BERKAS RISET LENGKAP
## 4.1 Perbaikan Penanganan Tipe Artefak 'report' di js/ui/artifact.js
Tambahkan Penanganan Tipe Laporan Riset: Pada fungsi renderCurrent(), tambahkan kondisi `else if (current.type === 'document' || current.type === 'docx' || current.type === 'report')` untuk memanggil `renderDocument(current.markdown, current.title);`.
Manfaat Bagi Pengguna: Saat "Riset Mendalam" selesai, Kanvas Artefak akan menampilkan dokumen kajian yang tertata rapi: Judul Riset, Abstrak, Poin Temuan Kunci, dan Pohon Kueri Analisis, dengan tombol ekspor [ Unduh MD ], [ Unduh DOCX ], dan [ Cetak PDF ], tanpa lagi menampilkan navigasi Slide kosong yang rusak.
## 4.2 Perbaikan Logika Switch "Mode kilat" di js/chat/composer.js
Perbaiki Fungsi fastCard.onclick: Panggil `this._toggleSwitch('sheet-fast', on)` agar saklar visual berpindah kelas CSS `.active` secara aktif.
Sinkronkan Status Visual Saat Lembar Dibuka: Di dalam plus.onclick, jalankan `this._toggleSwitch('sheet-fast', hemat.enabled());`.
## 4.3 Penataan Tipografi Thought Stream ("Proses berpikir")
Ubah Gaya .think-trace di css/ui/connect.css: Jangan gunakan font monospaced mesin tik di <pre>. Gunakan font sans-serif proporsional reguler (13px, font-family: inherit), berikan padding rapi (12px), garis batas lembut (border: 1px solid var(--rg-line)), dan ikon akordeon yang elegan.

# BAB 5: BLUEPRINT EKSEKUSI MEGA SPRINT & VERIFIKASI AKHIR
Grok Build diwajibkan mengeksekusi perbaikan ini dalam 5 fase linier terpadu tanpa interupsi:
Fase
Fokus Modul
Berkas Sasaran
Pekerjaan Kunci
Fase 1
Sanitasi Lingkungan
Lingkungan Terminal / Sandbox
Bunuh proses zombie (pkill -f node), bersihkan /tmp/ dan .eslintcache, pastikan npm test & npm run lint 100% hijau.
Fase 2
Perbaikan Bug Saklar & Render Riset
js/chat/composer.js, js/ui/artifact.js
1. Perbaiki switch Mode kilat: panggil _toggleSwitch('sheet-fast', on) agar kelas .active aktif dan tombol saklar bergerak visual.
2. Perbaiki render Riset Mendalam: tambahkan kondisi current.type === 'report' di renderCurrent() pada artifact.js agar naskah riset tidak jatuh ke renderSlide() yang rusak.
Fase 3
Perapian Tipografi Berpikir Keras
css/ui/connect.css, js/ui/artifact-card.js
Perbaiki styling .think-trace pre menjadi font sans-serif proporsional 13px yang rapi, spasi garis 1.6, dan warna teks lembut.
Fase 4
Restrukturisasi Halaman Studio Kode
index.html, js/studio/studio.js, css/ui/overhaul.css
1. Susun ulang Studio Kode menjadi 3 zona: Toolbar Atas (Web App / Python + Buka/Ekspor), Editor Tengah, dan Bilah Eksekusi Bawah.
2. Hapus tombol membingungkan 'Buka di panel' dan 'Jadikan artefak'. Pertahankan tombol utama: Jalankan, Pratinjau, Salin, dan Tinjau Perubahan.
Fase 5
Pembersihan QC & Verifikasi Mandiri
Seluruh berkas JavaScript & Unit Test
Pertahankan kelulusan seluruh 17 unit test (`npm test`) dan 0 error linter (`npm run lint`).
Kriteria Kelulusan Akhir (Definition of Done):
1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Saklar "Mode kilat" di lembar lampiran bergerak visual aktif/mati saat ditekan (kelas .active bertambah/berkurang).
4. Hasil "Riset Mendalam" tampil sebagai naskah dokumen kajian utuh di Kanvas Artefak, bebas dari kartu rusak "< Slide 0 / 0 >".
5. Akordeon "Proses berpikir" memiliki tipografi teks yang rapi dan proporsional.
6. Halaman Studio Kode memiliki tata letak terstruktur 3 zona yang mudah dipahami alur kerjanya.
7. Seluruh navigasi sidebar, bilah pengetikan, dan tombol model tetap stabil dan berdaulat 100%.

Fitur / Menu
Kapan Harus Digunakan?
Masalah Apa yang Diselesaikan?
Bentuk Output yang Dihasilkan
Chat Standar
Pertanyaan cepat harian, obrolan santai, definisi instan.
Mendapatkan jawaban langsung dalam hitungan detik tanpa jeda.
Gelembung teks di obrolan utama.
Mode Kilat (⚡)
Saat baterai ponsel hemat daya, atau butuh jawaban to-the-point 1 paragraf.
Menghilangkan penjelasan bertele-tele dan menghemat memori perangkat.
Jawaban teks ringkas dan padat.
Berpikir Lebih Keras (🧠)
Soal logika, matematika, analisis perbandingan, penalaran bertingkat.
Memberikan transparansi penalaran langkah-demi-langkah sebelum menjawab.
Akordeon "Proses berpikir" yang bisa dibuka + jawaban terstruktur.
Riset Mendalam (🌐/📚)
Investigasi topik besar, analisis pasar, perbandingan multi-dokumen.
Mengumpulkan fakta komprehensif dari berbagai sudut pandang tanpa halusinasi.
Berkas Riset Lengkap di Kanvas Artefak (Abstrak, Cabang Analisis, Kesimpulan) yang siap diunduh ke Word/PDF.
Studio kode (</>)
Pemrograman aplikasi, inspeksi berkas kode lokal, pengujian skrip.
Tempat coding mandiri tanpa ketergantungan cloud, dengan Diff Viewer dan uji eksekusi lokal.
Editor multi-file + Terminal eksekusi Web Worker + Pratinjau Web.
Proyek (📁)
Pekerjaan jangka panjang dengan topik spesifik (misal: Skripsi, Toko Online).
Mengunci berkas rujukan permanen (PDF/DOCX) agar AI selalu paham konteks.
Ruang kerja terisolasi dengan memori rujukan tetap.
Artefak (⊞)
Meninjau atau mengedit kembali seluruh dokumen/slide/kode yang pernah dibuat.
Mencegah dokumen penting hilang tertimbun riwayat chat yang panjang.
Galeri berkas kerja hidup yang bisa diedit dan diekspor ulang kapan saja.
