<!-- Sumber: Google Drive "PRD antarmuka 2.0" file 1Hu5wUEcHnFUMCu0vwwo05Z19rV881Xz6qb2QKQSomUE, diubah 2026-10-05T01:40:12Z. Versi 3.5.0. -->

PRD ANTARMUKA 2.0 — MASTER CETAK BIRU REKAYASA & KEDAULATAN SISTEM (EDISI STANDAR INDUSTRI KANONIKAL)
Status: Cetak Biru Induk Tunggal Aktif (Enterprise-Grade Sovereign AI Workstation)
Versi: 3.5.0-CANONICAL-SOVEREIGN | Tanggal: Oktober 2026
Dokumen Kanonikal Terdahulu: PRD antarmuka 1.0 (STATUS: ARSIP TERTUTUP & SELESAI)
Repositori Sasaran: Rategoan (egoan.vercel.app / rategoan-main)

# BAB 1: IDENTITAS KEDAULATAN ASLI, RESOLUSI CELAH LOGIKA & ARSITEKTUR WORKFLOW
## 1.1 Kedaulatan Mutlak Tanpa Model Asing (Strict Sovereign Mandate)
Larangan Mutlak Model AI Pihak Ketiga: Sistem Rategoan DILARANG KERAS mencolok atau mengintegrasikan model AI eksternal pihak ketiga (seperti OpenAI, Gemini, Claude) maupun runtime model luar seperti Ollama. Rategoan adalah sistem AI berdaulat penuh yang beroperasi murni di atas dua otak ciptaan sendiri:
⚡ Raget Template: Otak deterministik instan (<10ms), berbasis basis data & FAQ kanonikal, zero-halusinasi, 100% offline (Aktif / Default).
🧠 Raget Neural: Otak jaringan saraf tiruan lokal mandiri Rategoan yang dilatih dari korpus rilis Rategoan.
Pembersihan Total: Tidak ada lagi opsi Ollama atau server luar di seluruh aplikasi.
## 1.2 Resolusi 4 Celah Logika & Tampilan (Hasil Audit Forensik Tingkat Lanjut)
Berdasarkan investigasi kode sumber (commit dcb6466 / v33), ditemukan 4 celah fundamental yang menyebabkan kebingungan pengguna:
Celah Dummy "Proses Berpikir" (raget/raget-agents/flow-hub.js):
Masalah: Fungsi thinkBlock(topic) hanya mencetak 4 baris teks statis ("1. Baca pertanyaan... 2. Ambil fakta..."). Ini bukan penalaran nyata, melainkan placeholder kaku.
Solusi: Bangun Dynamic Chain-of-Thought (CoT) Engine lokal yang menghasilkan dekomposisi langkah analitis sesuai domain pertanyaan (Matematika: identifikasi variabel & langkah hitung; Konseptual: definisi, premis, dan struktur jawaban; Koding: rancangan algoritma dan edge cases).
Celah Dummy "Riset Mendalam" (raget/raget-agents/deep-research.js & composer.js):
Masalah: queryTree(topic) hanya berupa array 7 baris string template kaku ('t — definisi', 't — data'). Dokumen riset yang dihasilkan tidak memiliki struktur sintesis multi-sudut pandang nyata.
Solusi: Orkestrasikan Autonomous Deep Research Workflow nyata: 1) Dekomposisi 4 sudut pandang kueri nyata, 2) Ekstraksi fakta dari Vault lokal & web, 3) Penyusunan naskah kajian eksekutif lengkap (Abstrak, Analisis Komparatif, Tabel Temuan, dan Kesimpulan Aksi) yang otomatis tersimpan ke Artefak.
Celah Render Teks Mentah di Kanvas Dokumen (js/ui/artifact.js:173):
PRIORITAS TERTINGGI: Ubah box.textContent = markdown menjadi:
box.innerHTML = markdown.render(content || '');
markdown.decorate(box);
Penegasan Status Modul Ekspor Word (shared/docx-local.js):Naskah laporan riset dan dokumen Cowork seketika tampil berkelas dengan judul h1-h3 yang tegas, teks berparagraf rapi, tabel bergaris halus, dan kutipan bersudut elegan.

FAKTA TERVERIFIKASI: Berkas shared/docx-local.js (1.964 byte) sudah ADA dan AKTIF di repositori serta lulus pada unit test #5. Grok Build DILARANG membuat ulang generator docx dari nol; gunakan buildDocxBytes() yang sudah ada.

A. BILAH PENGETIKAN (COMPOSER BOX)
Tombol (+) di kiri bawah membuka lembar lampiran media & folder lokal.
Tombol [🧠 Chip CPU] aktif permanen di samping (+) untuk memilih otak Raget Template / Raget Neural.
Kolom teks input membesar otomatis (auto-grow) dengan placeholder bersih "Tanya Rategoan".
Tombol [🎤] dan [➤ Kirim] berdampingan di kanan bawah; tombol kirim redup saat kosong (disabled, opacity 0.45) dan menyala tegas saat ada teks.
Tombol [⏹️ Berhenti] menggantikan kirim/mic saat inferensi berlangsung.
D. LEMBAR LAMPIRAN (#attach-sheet — POPUP TOMBOL +)
Murni berisi: 4 Orb Media ber-SVG nyata (Kamera, Foto, Dokumen, Memo Suara) + 4 Toggle Mode Penalaran + 1 Baris Aksi [ Hubungkan Folder Lokal ]. Seksi duplikat 'Studio' telah dihapus total.
B. HEADER OBROLAN
Tombol Menu (☰), Judul Percakapan, dan status [ ⚡ Mandiri (Offline) ].
Pemilih Keahlian: Terpasang di header atas sebagai tombol pil [ 🎯 Umum ▾ ], membuka modal sheet 5 spesialisasi tanpa mengganggu area keyboard.

C. SIDEBAR DRAWER (NAVIGASI ASLI RINGKAS)
1. Chat Baru: Percakapan harian interaktif.
2. Studio kode: Ruang rekayasa kode mandiri (setara Claude Code / Codex).
3. Proyek: Ruang kerja berbasis topik dengan berkas rujukan permanen.
4. Koleksi: Galeri penyimpanan catatan dan memo pengguna.
5. Konektor: Rumah bagi 28 alat lokal berdaulat (Client-Side Dispatcher).
6. Artefak: Meja kerja dokumen hidup hasil kolaborasi Cowork.

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

# BAB 3: PANDUAN STRUKTUR KERJA STUDIO KODE & ALUR PENGGUNA TERPADU
## 3.1 Restrukturisasi Tata Letak Studio Kode (#view-studio — 3 Zona Kerja Intuitif)
Untuk menghilangkan kebingungan pengguna (yang sebelumnya dihadapkan pada 10 tombol berserakan), Studio Kode disusun dalam 3 zona kerja yang berurutan secara logis:
1. Zona 1 — Toolbar Atas (Konteks Proyek & Berkas):
Kiri: Pilihan Lingkungan: Tab segmented `[ 🌐 Web App (HTML/CSS/JS) | 🐍 Skrip Python ]`.
Kanan: Manajemen Berkas:
`[ 📂 Buka Folder / ZIP ]` (Membuka folder lokal di PC atau dialog unggah ZIP di ponsel).
2. Zona 2 — Tab Berkas & Editor Utama:`[ 💾 Ekspor ZIP ]` (Mengunduh seluruh berkas proyek dalam satu arsip ZIP bersih).
`[ 📁 + Jadikan Rujukan Proyek ]` (Menyematkan berkas yang sedang diedit ke dalam Proyek aktif).

Baris Tab Berkas: Menampilkan berkas aktif (misal: index.html, style.css, script.js, atau main.py) dengan tombol tutup dan penanda status berkas yang belum disimpan (*dirty indicator*).
Area Editor: Textarea CodeMirror bernomor baris, penyorotan sintaks cerdas, dan spasi lega.
3. Zona 3 — Panel Eksekusi & Hasil (Bawah):
Tombol Tindakan Utama:
`[ ▶️ Jalankan Kode ]` (Tombol utama hijau — mengeksekusi kode di Web Worker lokal).
`[ 👁️ Pratinjau Web ]` (Khusus mode Web App — menampilkan hasil render langsung di iframe).
Toolbar Utilitas: `[ 📋 Salin ]` dan `[ ⚖️ Tinjau Perubahan (Diff) ]`.
Jendela Konsol Terminal: Menampilkan hasil log eksekusi secara bersih dengan tombol [ Bersihkan ].

## 3.2 Alur Lintas-Modul: Dari Chat ke Studio Kode dan Proyek
1. Saat obrolan chat menghasilkan solusi kode:
Blok kode di chat dilengkapi tombol `[ 🚀 Buka di Studio kode ]`.
Mengklik tombol ini otomatis memindahkan kode tersebut ke tab editor di Studio Kode.
2. Saat pengguna selesai mengedit kode di Studio:
Pengguna dapat mengklik `[ 📁 + Jadikan Rujukan Proyek ]` untuk mengunci berkas tersebut sebagai dokumen referensi di Proyek aktif.

# BAB 4: REKAYASA KANVAS ARTEFAK & ENGINE PENALARAN TINGKAT LANJUT
## 4.1 Rich Markdown Rendering pada Kanvas Dokumen (js/ui/artifact.js)
1. Perbaikan Fungsi renderDocument:
2. Tipografi Naskah Dokumen:
function renderDocument(content, title) {
const stage = $('artifact-stage');
const head = $('artifact-title');
if (head) head.textContent = title || 'Dokumen';
if (!stage) return;
stage.innerHTML = '';
const box = document.createElement('div');
box.className = 'art-doc markdown-body';
box.contentEditable = 'true';
// Render markdown terformat, bukan raw text
box.innerHTML = markdown.render(content || '');
markdown.decorate(box);
stage.appendChild(box);
}
Ganti implementasi box.textContent dengan parser terformat:
Terapkan gaya CSS `.art-doc.markdown-body`: font serif/sans elegan, judul h1-h3 berjarak proporsional, paragraf dengan line-height 1.7, dan tabel berbingkai halus dengan selang-seling warna latar lembut.
## 4.2 Dynamic Chain-of-Thought (CoT) Engine untuk "Berpikir Lebih Keras"
1. Alur Penalaran Dinamis (raget/raget-agents/flow-hub.js):
Alih-alih 4 baris teks template statis, bangun fungsi `generateCoT(query, domain)`:
Jika domain Matematika/Sains: Dekomposisi variabel, formula yang berlaku, tahapan perhitungan, dan verifikasi batas angka.
Jika domain Perbandingan: Matriks parameter, kelebihan/kekurangan masing-masing opsi, dan sintesis kesimpulan.
Jika domain Koding: Analisis spesifikasi input/output, rancangan algoritma, kompleksitas waktu, dan penanganan galat.
2. Tipografi Akordeon "Proses berpikir":
Gunakan font sans-serif 13px proporsional, teks abu-abu lembut (*muted*), jarak baris 1.6, berlatar `var(--rg-surface-2)` dengan transisi ekspansi yang mulus.

## 4.3 Gerbang Anti-Placeholder pada Linter (raget/raget-tools/lint-check.mjs)
Tambahkan pemeriksaan otomatis pada lint-check.mjs untuk mendeteksi dan menolak fungsi dummy yang hanya mengembalikan array string statis tanpa memproses argumen secara substantif.
## 4.4 Katalog 28 Alat Lokal di Konektor
Daftar resmi 28 alat lokal berdaulat yang dieksekusi via Client-Side Tool Dispatcher tanpa backend:
1. Vault Dokumen & RAG Pribadi (6 Alat): vault_index_document, vault_semantic_search, vault_summarize_doc, vault_qna_document, vault_compare_docs, vault_export_knowledge.
2. Mata & Vision OCR Mandiri (4 Alat): vision_extract_text, vision_parse_table, vision_color_palette, vision_qr_barcode.
3. Asisten Suara & Audio Overview (4 Alat): audio_speech_to_text, audio_text_to_speech, audio_generate_overview, audio_voice_notes.
4. Mesin Kalkulus, Finansial & Data (5 Alat): math_calculate_expression, math_statistics_summary, math_currency_converter, math_date_calculator, math_unit_conversion.
5. Penyusun Artefak & Visualisasi Grafis (5 Alat): canvas_render_chart, canvas_generate_diagram, canvas_export_presentation, canvas_export_document, canvas_export_data.
6. Agenda, Pengingat & Rutinitas Kedaulatan (4 Alat): agenda_add_task, agenda_list_upcoming, agenda_parse_ics, agenda_export_calendar.

# BAB 5: BLUEPRINT EKSEKUSI MEGA SPRINT & VERIFIKASI AKHIR
Grok Build diwajibkan mengeksekusi perbaikan ini dalam urutan prioritas:

Fase
Prioritas & Modul
Berkas Sasaran
Pekerjaan Kunci
Fase 1
Sanitasi Lingkungan
Terminal Sandbox
pkill proses zombie, bersihkan /tmp/ dan cache, verifikasi npm test & lint hijau.
Fase 2
Quick-Win Visual Utama (Prioritas #1)
js/ui/artifact.js, css/ui/overhaul.css
1. Ganti box.textContent dengan box.innerHTML = markdown.render(content) + markdown.decorate(box). Dokumen dan laporan riset seketika tampil terformat indah dan berkelas.
2. Terapkan styling tipografi dokumen .art-doc.markdown-body.
Fase 3
Dynamic Reasoning & Riset (Prioritas #2)
raget/raget-agents/flow-hub.js, raget/raget-agents/deep-research.js
1. Ganti 4 baris template dummy thinkBlock dengan CoT dinamis sesuai domain.
2. Sempurnakan sintesis laporan Riset Mendalam menjadi dokumen eksekutif terstruktur (Abstrak, Analisis, Tabel, Kesimpulan).
Fase 4
Studio Kode 3 Zona & Jembatan Proyek
index.html, js/studio/studio.js, css/ui/overhaul.css
1. Susun ulang Studio Kode menjadi 3 zona kerja (Toolbar Atas, Editor Tengah, Panel Eksekusi Bawah).
2. Tambahkan tombol jembatan [ 📁 + Jadikan Rujukan Proyek ] di Studio Kode.
3. Pastikan fallback ZIP ramah ponsel beroperasi mulus.
Fase 5
QC & Gerbang Anti-Placeholder
raget/raget-tools/lint-check.mjs, Unit Test
Tambahkan aturan anti-placeholder di lint-check.mjs, pertahankan 17 unit test lulus (`npm test`) dan 0 error linter (`npm run lint`).
Kriteria Kelulusan Akhir (Definition of Done):
1. Seluruh 17 pengujian unit lulus 100% tanpa kegagalan (npm test).
2. Linter kode menghasilkan 0 error dan 0 warning (npm run lint).
3. Sintaks seluruh berkas JavaScript valid tanpa galat sintaks (node --check).
4. Hasil "Riset Mendalam" dan dokumen di Kanvas Artefak tampil berformat Rich Markdown indah (bukan teks mentah dan bukan Slide 0/0).
5. "Proses berpikir" menampilkan penalaran dinamis nyata sesuai domain pertanyaan.
6. Halaman Studio Kode memiliki tata letak 3 zona terstruktur yang jelas dan mudah dipahami cara pakainya.
7. Gerbang linter menolak kode dummy/placeholder.
8. Seluruh 28 alat lokal, bilah pengetikan, tombol model, dan navigasi sidebar tetap beroperasi stabil 100%.
