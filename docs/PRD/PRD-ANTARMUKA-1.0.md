<!-- Sumber: Google Drive "PRD antarmuka 1.0" file 19hZU_nAuS0-ITciFeNFtAu_W8AqtPLs_kG_YHXwGwuw, diubah 2026-10-04T12:58:34Z. -->
[STATUS: VERSI 1.0 KANONIKAL - DISEGEL TUNTAS (SEALED)]

# 38. SPESIFIKASI PEROMBAKAN TOTAL KAPSUL MEMORI & MASTER PEMOLESAN EKOSISTEM ANTARMUKA (KERJA BESAR OKTOBER 2026)
## 38.1 Latar Belakang & Analisis Forensik Halaman Kapsul Memori (Tangkapan Layar 11:45 WIB)
Berdasarkan audit tangkapan layar langsung pengguna pada perangkat bergerak (halaman Kapsul Memori pukul 11:45 WIB), halaman #memory-capsule mengalami degradasi estetika dan struktural yang cukup parah dibandingkan halaman Rategoan lainnya:
Header Berantakan & Tanpa Ikon Panah: Header menampilkan teks mentah biru Kembali yang menempel canggung langsung di sebelah judul Kapsul memori (<button>Kembali</button><h1>Kapsul memori</h1>). Tidak menggunakan tombol panah kembali standar (.back-btn.plain dengan ikon SVG) yang dipakai di seluruh halaman lain.
Statistik Fakta Mengambang Mentah: Elemen hitungan fakta menampilkan teks polos 0 fakta tersimpan tanpa tipografi subjudul atau kartu pembatas yang layak.
Tab Filter Melipat 2 Baris: Tombol filter (Semua, Identitas, Preferensi, Kebiasaan, Instruksi) terbungkus secara kaku dan terpotong menjadi dua baris vertikal yang tidak simetris, bukan satu baris geser horizontal mulus (.coll-filters).
Formulir Tambah Fakta Tanpa Gaya (Unstyled Inputs & Raw Button):
Dropdown <select> dan input teks <input> tidak memiliki batas sudut (border-radius) dan bayangan yang konsisten.
Tombol kirim Tambah fakta hanya berupa tombol teks mentah tanpa latar belakang warna, tanpa padding, dan tanpa batas, tampak seperti tulisan biasa yang terlempar di antara input dan area konten.
Keadaan Kosong (Empty State) Berupa Teks Polos Mentah: Saat belum ada fakta, sistem hanya mencetak kalimat mentah host.textContent = 'Kapsul masih kosong...' langsung ke layar putih tanpa kartu visual, tanpa ikon otak/bohlam, dan tanpa perataan tengah.
Tombol "Kosongkan Semua" Mengambang & Berbahaya: Tombol pembersihan memori berada di bagian bawah sebagai teks mentah tanpa penanda visual destruktif (merah) dan tanpa dialog konfirmasi pengaman (confirm()), sangat rentan tertekan secara tidak sengaja oleh sentuhan jari di ponsel.
Kartu Fakta Terisi Kurang Informatif: Kartu fakta yang sudah ada tidak menampilkan lencana kategori (category badge), tidak ada pemisahan tegas antara kata kunci (key) dan isi (value), serta tombol hapus hanya berupa teks polos.
## 38.2 Audit Kedalaman Ekosistem: Titik Friksi Tambahan untuk "Kerja Besar" Grok Build
Selain Kapsul Memori, audit komprehensif terhadap seluruh layar antarmuka menemukan 4 area penyempurnaan penting lainnya agar dilakukan sekaligus dalam satu siklus kerja besar (deep pass):
Halaman Proyek (#view-project):
Tombol Buat proyek saat ini berupa blok biru gelap besar yang kurang harmonis dengan masukan nama. Ubah menjadi tombol pil proporsional yang menyatu dengan kolom input.
Daftar template proyek (Riset akademik, Pengembangan web, dll.) perlu dijadikan baris chip geser horizontal satu baris (overflow-x: auto; white-space: nowrap;) agar tidak memakan ruang vertikal.
Wadah instruksi proyek wajib menggunakan struktur .project-instruction-box dengan label dan textarea bersudut halus.
Studio Kode (#view-studio):
Di perangkat seluler, deretan tombol kontrol (JavaScript/Python, index.html/style.css/script.js, Salin kode, Ekspor zip) memakan 3 baris vertikal penuh sebelum editor kode terlihat.
Satukan tombol aksi utilitas (Salin kode dan Ekspor zip) ke baris toolbar kanan atas, sehingga area layar ponsel maksimal diperuntukkan bagi editor CodeMirror.
Pastikan status eksekusi terminal ("Selesai dalam 14 ms") tampil dalam badge status pill hijau yang bersih.
Halaman Artefak (#view-artifact):
Setiap kartu artefak (.artifact-card-page) wajib menampilkan cap waktu relatif pembuatan (misal: "Baru saja", "4 Okt 11:15") dan ekstensi berkas visual (PPTX, CODE, DOCX, HTML), tidak hanya teks judul statis "Kode" atau "Studio".
Jika belum ada artefak yang dibuat, sediakan kartu keadaan kosong (empty state card) berikon dokumen dengan panduan cara menghasilkan artefak dari chat atau studio.
Pembaruan Lencana Fakta di Pengaturan (#btn-settings-memory):
Pada baris Kapsul Memori di halaman Pengaturan (#view-settings), tampilkan badge jumlah fakta dinamis di sebelah kanan (misal: [0 fakta] atau [5 fakta]) sebelum ikon panah chevron, memberikan umpan balik langsung kepada pengguna tanpa harus membuka lembar kapsul.
## 38.3 Matriks Penugasan Kerja Besar (Tugas No. 188 s/d 195)
No
Modul Target
Kondisi Eksisting
Rekayasa Baru yang Wajib Diterapkan
Status
188
Header Kapsul Memori
Teks mentah Kembali Kapsul memori berdampingan tanpa ikon.
Standarisasi memakai <header class="settings-header"> dengan tombol panah SVG <button id="memory-back" class="back-btn plain"> dan judul <h1>Kapsul memori</h1>.
MANDAT WAJIB
189
Filter & Subjudul Kapsul
Subjudul polos; filter tabs melipat 2 baris kaku.
Subjudul menggunakan .coll-tab-desc; filter tabs menggunakan kontainer .coll-filters.memory-tabs satu baris geser horizontal (.coll-filter-chip).
MANDAT WAJIB
190
Formulir Tambah Fakta
Input polos tanpa batas rapi; tombol Tambah fakta berupa teks mentah tanpa latar.
Dibungkus dalam kartu .memory-form-card, dropdown .memory-select, input .memory-input, dan tombol aksi pil primer .memory-submit-btn dengan ikon +.
MANDAT WAJIB
191
Keadaan Kosong & Kartu Fakta Kapsul
Hanya teks polos host.textContent = ...; kartu fakta tanpa badge kategori.
Keadaan kosong memakai .coll-empty-card dengan ikon otak/bohlam; kartu fakta terisi memakai lencana warna .coll-badge (identitas, preferensi, kebiasaan, instruksi), kunci tebal, dan tombol hapus rapi.
MANDAT WAJIB
192
Tombol Kosongkan Semua
Teks polos di bawah layar tanpa pengaman dialog.
Tombol destruktif sekunder .memory-clear-btn dengan ikon tempat sampah dan dialog konfirmasi confirm() sebelum penghapusan.
MANDAT WAJIB
193
Harmonisasi Halaman Proyek
Tombol buat proyek kaku; template melipat; instruksi menempel mentah.
Template proyek dibuat satu baris geser horizontal; wadah instruksi menggunakan .project-instruction-box berlabel .project-label.
MANDAT WAJIB
194
Kompak Toolbar Studio Kode
Tombol utilitas memakan 3 baris vertikal di ponsel.
Salin kode dan Ekspor zip dirapatkan ke sisi kanan baris berkas; bilah web otomatis hilang saat tab Python aktif; pintasan Ctrl-Enter aktif di CodeMirror.
MANDAT WAJIB
195
Metadata Artefak & Badge Pengaturan
Kartu artefak minim konteks waktu; baris Pengaturan belum memuat hitungan fakta.
Kartu artefak memuat waktu relatif dan ekstensi format; baris Pengaturan memuat badge hitungan memori real-time.
MANDAT WAJIB
## 38.4 Cetak Biru DOM HTML & CSS untuk Grok Build
### 1. Struktur DOM Baru Kapsul Memori (js/ui/memory-capsule.js)
<section id="memory-capsule" class="settings-page" hidden>
<header class="settings-header">
<button type="button" id="memory-back" class="back-btn plain" aria-label="Kembali">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
<line x1="19" y1="12" x2="5" y2="12"/>
<polyline points="12 19 5 12 12 5"/>
</svg>
</button>
<h1>Kapsul memori</h1>
</header>
<p id="memory-count" class="coll-tab-desc">0 fakta tersimpan</p>

<!-- Filter Tabs 1 Baris Geser -->
<div class="coll-filters memory-tabs" id="memory-tabs">
<button type="button" data-memory-tab="semua" class="coll-filter-chip on">Semua</button>
<button type="button" data-memory-tab="identitas" class="coll-filter-chip">Identitas</button>
<button type="button" data-memory-tab="preferensi" class="coll-filter-chip">Preferensi</button>
<button type="button" data-memory-tab="kebiasaan" class="coll-filter-chip">Kebiasaan</button>
<button type="button" data-memory-tab="instruksi" class="coll-filter-chip">Instruksi</button>
</div>

<!-- Kartu Formulir Tambah Fakta -->
<form id="memory-form" class="memory-form-card">
<div class="memory-form-row">
<select id="memory-kind" class="memory-select">
<option value="identitas">Identitas Diri</option>
<option value="preferensi">Preferensi AI</option>
<option value="kebiasaan">Kebiasaan Kerja</option>
<option value="instruksi">Instruksi Khusus</option>
</select>
</div>
<div class="memory-form-grid">
<input id="memory-key" class="memory-input" placeholder="Kunci (misal: kota, nama, kopi favorit)" autocomplete="off">
<input id="memory-value" class="memory-input" placeholder="Nilai (misal: Surabaya, Maetalizer, americano)" autocomplete="off">
</div>
<button type="submit" class="memory-submit-btn">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
Simpan ke Kapsul
</button>
</form>

<!-- Daftar Fakta / Keadaan Kosong -->
<div id="memory-list" class="memory-list"></div>

<!-- Tombol Bersihkan Terproteksi -->
<div class="memory-footer">
<button type="button" id="memory-clear" class="memory-clear-btn">
<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
Kosongkan Semua Fakta
</button>
</div>
</section>
### 2. Aturan CSS Baru (css/ui/overhaul.css)
/* Kapsul Memori Modern */
#memory-capsule {
position: fixed;
inset: 0;
z-index: 200;
background: var(--rg-bg, #fafaf8);
display: flex;
flex-direction: column;
padding: 16px 20px calc(24px + env(safe-area-inset-bottom));
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
#memory-capsule[hidden] { display: none !important; }
.memory-form-card {
background: var(--rg-surface, #fff);
border: 1px solid var(--rg-line, #e5e7eb);
border-radius: 16px;
padding: 14px;
display: flex;
flex-direction: column;
gap: 10px;
margin: 12px 0 16px;
box-shadow: 0 1px 3px rgba(0,0,0,0.03);
}
.memory-select, .memory-input {
width: 100%;
border: 1px solid var(--rg-line, #e4e4e4);
border-radius: 10px;
padding: 9px 12px;
font: inherit;
font-size: 13px;
background: var(--rg-surface-2, #f9fafb);
color: var(--rg-text, #111);
}
.memory-form-grid {
display: flex;
gap: 8px;
}
@media (max-width: 480px) {
.memory-form-grid { flex-direction: column; }
}
.memory-submit-btn {
align-self: flex-start;
display: inline-flex;
align-items: center;
gap: 6px;
background: #1a4b8c;
color: #fff;
border: 0;
border-radius: 999px;
padding: 8px 18px;
font-size: 12.5px;
font-weight: 600;
cursor: pointer;
}
.memory-card {
display: flex;
align-items: center;
justify-content: space-between;
gap: 12px;
border: 1px solid var(--rg-line);
border-radius: 12px;
padding: 10px 14px;
margin-bottom: 8px;
background: var(--rg-surface);
}
.memory-card-body {
display: flex;
flex-direction: column;
gap: 4px;
}
.memory-card-body strong {
font-size: 13px;
color: var(--rg-text);
}
.memory-card-body span {
font-size: 12.5px;
color: var(--rg-muted);
}
.memory-del-btn {
background: transparent;
color: #b42318;
border: 0;
font-size: 12px;
font-weight: 600;
cursor: pointer;
padding: 4px 8px;
}
.memory-footer {
margin-top: 24px;
display: flex;
justify-content: center;
}
.memory-clear-btn {
display: inline-flex;
align-items: center;
gap: 6px;
background: transparent;
color: #b42318;
border: 1px solid #fecdd3;
border-radius: 999px;
padding: 7px 16px;
font-size: 12px;
font-weight: 600;
cursor: pointer;
}
.memory-clear-btn:hover {
background: #fff1f2;
}
## 38.5 Instruksi Eksekusi Presisi untuk Grok Build
Agen pengembang (Grok Build) diwajibkan menerapkan seluruh perubahan di Bab 38 secara langsung pada repositori:
Perbarui js/ui/memory-capsule.js dan css/ui/overhaul.css sesuai cetak biru DOM & styling Bab 38.4.
Tambahkan dialog konfirmasi pengaman if (!confirm('Kosongkan seluruh fakta yang tersimpan di Kapsul Memori?')) return; pada event klik tombol #memory-clear.
Di js/account/settings.js, suntikkan indikator jumlah fakta aktif pada baris #btn-settings-memory.
Jalankan npm test (17 test lulus) dan npm run lint (100% lulus tanpa error).
PRD ANTARMUKA 1.0 — ARSIP KANONIKAL EVOLUSI SISTEM (BAB 1 s/d 43)
Spesifikasi Kebutuhan Produk (Product Requirements Document) — Cetak Biru Master Arsitektur UI/UX, Harness Operasional 100% Nyata, dan Ekosistem Konektor Terpadu
Status: Dokumen Acuan Kanonikal Versi 1.0 (Disegel Menuju Konsolidasi Versi 2.0) | Tanggal: Oktober 2026

# 1. LATAR BELAKANG, PENDAHULUAN & FILOSOFI ARSITEKTURAL FUNDAMENTAL
## 1.1 Latar Belakang Masalah & Lanskap Disrupsi AI Agenik
Perkembangan pesat model kecerdasan buatan generatif (Generative AI) telah membawa industri ke titik balik krusial: pergeseran paradigma dari sekadar Conversational Chatbot pasif (kotak teks statis yang hanya menerima prompt dan mencetak teks balasan) menuju Autonomous Agentic Systems (sistem agen otonom berbasis eksekusi dan tindakan nyata). Sebagian besar antarmuka AI yang beredar saat ini terjebak sebagai "AI Wrapper" pasif yang terisolasi—tidak memiliki akses langsung ke lingkungan kerja pengguna, tidak mampu menyunting dokumen, tidak dapat mengelola repositori, dan tidak memiliki instrumen kendali tugas di peramban.
Pada saat yang sama, standar industri global telah dirombak oleh agen otonom terdepan:
Manus AI: Memelopori eksekusi tugas siklus penuh (Full Lifecycle Management) pada file system, repositori kode, dan orkestrasi alat multi-langkah.
Claude: Menghadirkan sistem penemuan konektor otonom (Autonomous Tool Selection) dan transparansi indikator jumlah alat (Tool Count Badges).
Grok: Menerapkan manajemen status konektor aktif vs katalog, serta deteksi proaktif token OAuth yang kedaluwarsa (Reconnect Required).
ChatGPT: Mempopulerkan kemudahan alur otorisasi sekali klik (One-Click Direct OAuth).
Rategoan dirancang untuk mengambil lompatan arsitektural ini: mentransformasikan antarmuka dari penonton pasif menjadi Mesin Operasional Otonom Berkemampuan Penuh (Action-Oriented Autonomous Harness) yang beroperasi mandiri, tanpa biaya API pihak ketiga, dan sepenuhnya menghormati kedaulatan data pengguna.
## 1.2 Evaluasi Sistem Eksisting & Bottleneck Arsitektur Lama Rategoan
Sebelum perombakan arsitektural ini, Rategoan memiliki kendala struktural yang menghambat skalabilitas dan pengalaman pengguna:
Bottleneck Antrean Server Mandiri (Self-Hosted Queue Bottleneck):
Implementasi lama mengandalkan konfigurasi manual ke endpoint server eksternal (https://server-anda dengan pencatatan log teks mentah drive-export · antrian). Pendekatan ini rentan kegagalan koneksi jaringan, menimbulkan latensi tinggi, menciptakan Single Point of Failure (SPOF), dan membebani pengguna biasa dengan keharusan mengonfigurasi serta merawat server pribadi.
Ketergantungan Biaya & Kebocoran Privasi pada API Pihak Ketiga:
Banyak aplikasi AI bergantung pada API key komersial berbayar (OpenAI, Anthropic) yang membebankan biaya per token dan mengirimkan data dokumen sensitif ke cloud pihak ketiga.
Ketiadaan Mesin Sintesis Berkas Lokal:
Pembuatan berkas kerja nyata (.pptx, .docx, .pdf, .csv, .zip) sebelumnya memerlukan modul konverter backend yang berat, bukan sintesis instan langsung di peramban pengguna.
Kelemahan-kelemahan sistem lama ini diputuskan untuk DIHAPUS TOTAL dan digantikan oleh arsitektur modern berbasis Vercel Serverless Functions + Direct OAuth 2.0 PKCE, sintesis berkas 100% Client-Side Blob, dan sistem penyerapan data lokal (On-Device Vector RAG).
## 1.3 Visi Solusi Rategoan & Matriks Kelayakan Teknis (Feasibility Matrix)
Rategoan mengusung arsitektur yang 100% realistis dan dapat diwujudkan langsung di atas web modern tanpa komputasi server yang membengkak:
Parameter Arsitektur
Sistem Lama (Legacy Rategoan)
Solusi Baru Rategoan (PRD v2.0)
Dasar Kelayakan Teknis (Realizability)
Integrasi Cloud (Drive, GitHub, Mail)
Antrean manual server (https://server-anda)
Direct OAuth 2.0 PKCE + Vercel Serverless Proxy
Token tersimpan aman di localStorage; panggilan API langsung stateless via HTTP Bearer.
Model AI & Biaya Inferensi
Ketergantungan API eksternal komersial
Model RAGET In-House (Raget Template & Raget 1.0)
Beroperasi mandiri tanpa API Key berbayar; Raget Template berjalan 100% lokal / serverless.
Sintesis Berkas (.pptx, .docx, .zip)
Dikonversi di backend atau tidak didukung
100% Client-Side Blob Synthesis
Memanfaatkan native Web APIs (Blob, URL.createObjectURL, OpenXML parser) tanpa server cost.
Pencarian Dokumen Tebal (RAG)
Bergantung pada Embedding API eksternal
Triada On-Device (Okapi BM25 + PPMI Local Vector)
Berjalan langsung di RAM peramban pengguna; mampu memproses berkas 40+ halaman offline.
UI/UX Eksekusi Latar Belakang
Dialog statis menunggu balasan
Web Worker Latar Belakang + Live Thought Streaming
Thread terpisah via js/agent/agent-worker.js dan kartu akordeon #thought-accordion.
Struktur Kode & Runtime
Kompleksitas build server
Native ES Modules murni di folder js/ (Zero-Build)
Berjalan instan di peramban tanpa dependensi compiler Webpack/Vite yang rapuh.
## 1.4 Pemisahan Arsitektur: "Tubuh/Mesin Aplikasi (Harness)" vs "Otak AI (Model Training)"
Rategoan dibangun di atas pemisahan peran yang tegas antara dua pilar utama:
Urusan "Otak AI":
Pelatihan korpus masif 17+ Miliar Token BPE (Rak K Bahasa Indonesia & Rak R Bahasa Inggris), pembuatan tokenizer BPE 30.368 / 64k, kurikulum pelatihan dua tahap, dan optimasi bobot model diproses di lingkungan cluster GPU terpisah. Ini bukan beban langsung antarmuka web.
Arsitektur Korpus Dua Rak (Rak K Indonesia & Rak R English) & Kurikulum Dua Tahap:
Rak K (17,9+ Miliar token BPE): Terdiri murni 100% Bahasa Indonesia untuk memastikan penguasaan tata bahasa, nuansa budaya, dan struktur kalimat lokal.
Rak R (~109 GB): Menghimpun materi dari peS2o, PubMed Central, dan StackExchange yang dialokasikan dalam bahasa Inggris native tanpa pemaksaan terjemahan mesin massal, mencegah fenomena translationese.
Kurikulum Pelatihan Dua Tahap: Tahap 1 menyerap penalaran sains & koding global dari Rak R, dilanjutkan Tahap 2 yang memantapkan dialektika dan bahasa instruksi Indonesia via Rak K.
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│     PILAR 1: OTAK AI & PELATIHAN     │       │     PILAR 2: TUBUH & MESIN APLIKASI   │
│         (Training & Intelligence)    │       │        (The Application Harness)     │
├──────────────────────────────────────┤       ├──────────────────────────────────────┤
│ • Tempat: Server GPU / Cluster Latih │       │ • Tempat: Aplikasi Web di Vercel     │
│ • Tugas: Pre-training Korpus K & R   │       │ • Tugas: Menyediakan Tangan, Mata,   │
│   (17+ Miliar Token BPE)             │       │   dan Alat Kerja Nyata bagi Pengguna │
│ • Hasil: Bobot Model (Model Weights) │       │ • Komponen: 7 Menu Sidebar &         │
│ • Sifat: Plug-and-Play (Swappable)   │       │   9 Fitur di Lembar Lampirkan (+)    │
└──────────────────┬───────────────────┘       └──────────────────┬───────────────────┘
│                                              │
└───────────────► [TERHUBUNG] ◄────────────────┘
Otak AI dicolokkan ke Mesin Aplikasi
Otak AI Rategoan yang dipasang—baik Raget Template bawaan sistem maupun Model Neural Raget 1.0 hasil pre-training korpus K/R (17+ Miliar token BPE)—akan langsung memiliki tangan dan alat kerja yang lengkap untuk bertindak secara mandiri dan otonom tanpa bergantung pada model luar atau API key pihak ketiga.
Urusan "Tubuh & Mesin Aplikasi" (Rategoan di Vercel):
Merupakan platform operasional harian yang diakses pengguna.
PRINSIP MUTLAK PENGGUNA: Seluruh menu yang ada di Sidebar dan seluruh tombol pada modal Lampirkan (+) WAJIB 100% NYATA, BERFUNGSI, DAN TERINTEGRASI. Dilarang keras ada tombol pajangan, menu kosmetik tanpa fungsi, atau penampung teks statis.
PRINSIP MANDIRI TANPA API KEY: Model operasional utama yang digunakan Rategoan saat ini adalah murni model RAGET buatan sendiri (in-house), tanpa ketergantungan pada model eksternal dan TANPA memerlukan API Key pihak ketiga apa pun. Seluruh ekosistem antarmuka, toolset, dan konektor dibangun sebagai 'Tangan dan Alat Kerja Otonom (Autonomous Actuators & Tooling Layer)' yang siap sedia. Pilihan model Rategoan terdiri secara eksklusif dari dua pilar utama: Raget Template bawaan sistem dan Model Neural Raget 1.0 hasil pre-training korpus K/R (17+ Miliar token BPE). Kedua model ini langsung memiliki tangan dan alat kerja yang lengkap untuk bertindak secara mandiri dan otonom tanpa bergantung pada model luar atau API key pihak ketiga.
## 1.6 Jalur Giliran Tunggal (The Unified Turn Pipeline)
Pemrosesan respon obrolan pada Rategoan mengeksekusi alur pemrosesan 6 tahap linier yang terpadu, sebagaimana didefinisikan dalam docs/KERANGKA-MESIN.md dan dikendalikan oleh raget/raget-agents/turn-pipeline.js:
intent (router-intent.js): Menganalisis niat utama pertanyaan pengguna secara presisi untuk menentukan kategori respons.
context (turn-pipeline.js): Menghimpun riwayat percakapan, dokumen terlampir, dan memori kognitif relevan sebagai konteks masukan.
route (turn-pipeline.js): Menentukan jalur eksekusi terbaik berdasarkan parameter aktif (alat, pencarian web, atau model spesifik).
compose (engine-router.js): Mengarahkan permintaan ke modul penalaran spesialisasi domain yang sesuai di direktori raget/ untuk penyusunan draf respon awal.
qc (vault/web/web-qc.js): Menjalankan fungsi kontrol kualitas (QC) lokal otomatis yang memvalidasi integritas sitasi, mencocokkan fakta dengan sumber rujukan, serta mencegah halusinasi sebelum teks disajikan ke pengguna.
act (composer.js & chat.js): Merender hasil respon akhir secara halus ke antarmuka obrolan beserta pemanggilan alat atau pembuatan artefak jika ada.
## 1.5 Keunggulan Paradigma "Brain-Swappable Harness"
Ketika seluruh mesin antarmuka (editor kode, pembuat slide .pptx, konektor Google Drive/GitHub, file parser dokumen, riset web, dan sistem proyek) telah nyata berfungsi:
Otak AI Rategoan yang dipasang—baik Raget Template bawaan sistem maupun Model Neural Raget 1.0 hasil pre-training korpus K/R (17+ Miliar token BPE)—akan langsung memiliki tangan dan alat kerja yang lengkap untuk bertindak secara mandiri dan otonom tanpa bergantung pada model luar atau API key pihak ketiga.
# 2. BEDAH KOMPARASI VISUAL DENGAN FRONTIER AI LAINNYA
Berdasarkan analisis tangkapan layar nyata antarmuka industri:
3. TIGA TINGKAT KEMATANGAN KONEKTOR (CONNECTOR MATURITY LEVELS)
Layanan Referensi
Karakteristik Kunci Antarmuka
Standar yang Diadopsi Rategoan
Grok (Tangkapan Layar 1)
• Subtitle penjelas fungsi konektor eksternal.
• Banner peringatan "Reconnect required" saat token kedaluwarsa.
• Pemisahan kategori Connected (aktif) dan Featured (katalog).
Adopsi struktur kategori Connected vs Featured dan sistem deteksi token kedaluwarsa otomatis.
Manus AI (Tangkapan Layar 2)
• Orientasi aksi agenik nyata: Penggunaan Komputer (OS), Video Editor, GitHub (kelola repo), Instagram (publish), Gmail (buat balasan).
• Tanda navigasi panah > untuk membuka sub-halaman penjelajah data.
Adopsi kapabilitas Full Lifecycle Management (bisa baca, tulis, dan kelola) serta sub-view penjelajah data.
Claude (Tangkapan Layar 3)
• Sakelar toggle "Penemuan konektor" (AI otomatis memilih tool).
• Badge jumlah fungsi/alat spesifik pada tiap layanan (misal: GitHub [45], Gmail [30], Drive [11]).
Adopsi toggle penemuan konektor otonom dan transparansi badge jumlah alat (tool count badge).
ChatGPT (Tangkapan Layar 4)
• Katalog terbagi: Sudah Terinstal, Populer, dan Baru.
• Ikon gembok otorisasi dan pencarian terintegrasi.
Adopsi alur otorisasi satu klik (One-Click OAuth) langsung dari kartu layanan.
Rategoan Eksisting (Layar Lama)
• Teks manual "Antrian ke server sendiri", input https://server-anda, dan log teks mentah "drive-export · antrian".
DIHAPUS TOTAL & DIGANTIKAN oleh Vercel Serverless + Direct OAuth 2.0 PKCE.

Agar AI tidak sekadar membaca cuplikan teks, setiap konektor wajib memenuhi 3 level kematangan:
Level 1 — Membaca (Read): Menelusuri berkas, mencari email, membaca riwayat commit, dan mengekstrak teks dokumen.
Level 2 — Menulis (Write): Membuat file Google Docs baru, menulis rumus di Google Sheets, membuat branch baru, menyusun draf email balasan, dan mendaftarkan event kalender.
Level 3 — Mengurus Langsung (Manage & Orchestrate): Mengelola siklus hidup data:
Google Drive: AI dapat merapikan direktori, memindahkan berkas antar-folder, menyunting bab dokumen, dan mengekspor laporan.
GitHub: AI dapat menginspeksi bug, membuat branch, melakukan commit perbaikan kode, menjalankan validasi linter di sandbox, dan membuka Pull Request lengkap.
Gmail: AI dapat menyortir inbox, melabeli email prioritas, mengarsipkan spam, dan menyusun balasan otomatis.
Google Calendar: AI dapat menganalisis beban jadwal, mendeteksi bentrok agenda, dan menjadwalkan ulang pertemuan.
# 4. SPESIFIKASI MENU 'KONEKTOR' TERPUSAT (SIDEBAR)
Halaman Konektor dirombak total mengadopsi standar Grok, Manus, dan Claude:
5. SPESIFIKASI FUNGSIONAL 9 FITUR MODAL 'LAMPIRKAN' (+)

┌────────────────────────────────────────────────────────────────────────┐
│  ←  Konektor                                                      +    │
├────────────────────────────────────────────────────────────────────────┤
│  Konektor memungkinkan Rategoan menggunakan alat eksternal dan sumber  │
│  data pribadi Anda untuk membaca, menulis, dan mengelola tugas nyata. │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ ⚠️ Perlu Dihubungkan Ulang                                       │  │
│  │ Token Google Drive telah kedaluwarsa.        [ Hubungkan Ulang ] │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ 🎛️ Penemuan Konektor Otonom                          [ Toggle: ON]│  │
│  │ Izinkan Rategoan memilih dan mengeksekusi alat yang sesuai secara │  │
│  │ otomatis saat Anda bertanya di ruang percakapan.                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
│  [ 🔍 Cari konektor atau alat...                                    ]  │
│                                                                        │
│  TERHUBUNG & ESENSIAL (100% BEBAS BIAYA API)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ [🔺] Google Drive Workspace (OAuth 2.0 Pribadi)        [11 tools]│  │
│  │      Membaca, membuat dokumen baru, dan mengelola berkas Drive > │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ [🐙] GitHub Developer (OAuth / Token Gratis)            [45 tools]│  │
│  │      Kelola repositori, lacak perubahan kode, dan buka PR      > │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ [✉️] Gmail Assistant (OAuth 2.0 Akun Google)          [30 tools]│  │
│  │      Buat balasan, cari di kotak masuk, dan rangkum rangkaian  > │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ [📅] Google Calendar (OAuth 2.0 Akun Google)            [6 tools]│  │
│  │      Kelola agenda, periksa jadwal bentrok, dan atur meeting   > │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ [🌐] Web Search & Reader Mandiri (Non-API Scraper)      [4 tools]│  │
│  │      Pencarian DuckDuckGo & ekstraksi HTML via Vercel proxy    > │  │
│  ├──────────────────────────────────────────────────────────────────┤  │
│  │ [🖥️] Sandbox Komputer & Kode (Lokal Browser WASM)       [5 tools]│  │
│  │      Eksekusi JS/HTML iframe sandbox dan Python via Pyodide    > │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
# 5. SPESIFIKASI FUNGSIONAL 9 FITUR MODAL 'LAMPIRKAN' (#attach-sheet)
Lembar modal bottom sheet Lampirkan (#attach-sheet) pada kolom input obrolan dipertahankan tetap murni dan 100% berfungsi dengan pemetaan presisi terhadap elemen DOM HTML aslinya:
Grid Atas (3 Kartu Aksi Utama):
#sheet-camera [ 📷 Kamera ]: Memicu fungsi #pick-camera dan modul overlay kamera (#camera-overlay) memanfaatkan API native navigator.mediaDevices.getUserMedia untuk memotret dokumen fisik dan mengekstrak teksnya via OCR instan.
#sheet-photo [ 🖼️ Foto ]: Memicu pemilih galeri gambar native #pick-photo (<input type="file" accept="image/*">) dengan pratinjau thumbnail sebelum dikirim ke sesi chat.
#sheet-file [ 📁 File ]: Memicu pemilih file dokumen lokal #pick-file dengan filter ekstensi lengkap (.pdf, .docx, .txt, .csv, .ics, .enex, .zip). Diolah oleh parser PDF (pdf.js), Word (mammoth.js), WhatsApp (vault/whatsapp/importer.js), Evernote (vault/evernote/importer.js), Notion (vault/notion/importer.js), dan Kalender ICS (vault/calendar/ics-parser.js).
Daftar Bawah Tipe Toggle Switch (role="switch" dengan Thumb ON/OFF):
#sheet-websearch [ 🌐 Pencarian Web ]: Sakelar toggle interaktif untuk mengaktifkan pencarian web real-time via Vercel proxy /api/connectors/web/search lengkap dengan sitasi tautan sumber.
#sheet-think [ 😊 Berpikir lebih keras ]: Sakelar toggle untuk mengaktifkan alur penalaran terstruktur dengan pelacakan pemikiran visual yang dapat dilipat (Collapsible Thinking Trace Box).
#sheet-research [ 🔍 Riset mendalam ]: Sakelar toggle untuk mengaktifkan loop riset otonom multi-langkah (pencarian multi-kueri, sintesis puluhan artikel, dan penyusunan laporan komprehensif).
Daftar Bawah Tipe Action Button (Tombol Eksekusi Langsung):
#sheet-slide [ 🖥️ Buat Slide (.pptx) ]: Tombol aksi langsung yang memicu pembuatan dan pengunduhan berkas presentasi PowerPoint asli via mesin biner shared/pptx-local.js bawaan repositori.
6. SPESIFIKASI FUNGSIONAL 7 MENU SIDEBAR (#sidebar)#sheet-project [ 📁 Masukkan ke proyek ]: Tombol aksi langsung untuk membuka lembar pemilih ruang kerja proyek aktif (#project-sheet).
#sheet-learn [ 📱 Belajar terpandu ]: Tombol aksi langsung untuk mengubah mode instruksi menjadi Socratic Tutor yang tersambung ke modul quiz-session.js dan stem-engine.js.
#attach-close [ Tombol Silang Penutup ]: Tombol penutup modal yang berada di posisi bawah lembar lampirkan untuk menutup modal kembali ke antarmuka obrolan.

Seluruh menu navigasi di panel samping (#sidebar) Rategoan dipetakan secara presisi berdasarkan hirarki elemen DOM dan urutan navigasi aslinya:
Header Sidebar: Menampilkan judul berciri khas tipografi serif elegan Rategoan sebagai penanda identitas platform.
Navigasi Utama Menu Samping:
#btn-new-chat [ 💬 Chat Baru ]: Membuka sesi obrolan baru yang bersih dengan UUID unik.
#btn-studio [ 💻 Studio kode ]: Ruang kerja pemrograman terpadu berbasis CodeMirror, tab Live Preview, dan eksekutor Python WebAssembly (Pyodide).
#btn-collection [ 🔖 Koleksi ]: Pustaka penyimpanan terstruktur untuk menyimpan jawaban bernilai tinggi dan template prompt emas.
#btn-project [ 📁 Proyek ]: Manajemen multi-workspace terisolasi dengan system prompt khusus dan berkas rujukan permanen.
#btn-connect [ 🔗 Konektor ]: Hub integrasi awan (Google Drive, GitHub, Gmail, Calendar) berbasis OAuth 2.0 PKCE dengan kapabilitas BACA, TULIS, dan MENGURUS langsung.
#btn-artifact [ 📦 Artefak ]: Pusat penyimpanan seluruh berkas yang diproduksi oleh Rategoan (slide .pptx, dokumen .pdf/.docx/.csv/.zip, skrip kode).
Bagian Riwayat Sesi Chat:
#btn-history [ 🕒 Riwayat Chat ]: Label bagian riwayat obrolan yang tersimpan persisten di IndexedDB.
#hist-search [ Bilah Pencarian ]: Input rounded pill dengan placeholder "Cari riwayat..." untuk memfilter percakapan secara terpisah.
#hist-list [ Kontainer Daftar Sesi ]: Area penampung dinamis daftar sesi obrolan (menampilkan pesan default 'Belum ada chat' saat kosong).
Footer Navigasi Bawah:
#btn-settings [ ⚙️ Ikon Gear Pengaturan ]: Mengarahkan pengguna langsung ke halaman Pengaturan Aplikasi (#view-settings).
#btn-account [ 👤 Lingkaran Avatar Profil 'M' ]: Tombol profil pengguna Maetalizer untuk melihat atau mengelola akun.
## 6.1 Arsitektur Universal Client-Side Artifact Engine & Generator Berkas Multi-Format
Prinsip Dasar Client-Side Blob Synthesis:
Seluruh pembuatan berkas pada Rategoan diproses 100% di sisi peramban pengguna (client-side) menggunakan Web API native (Blob, URL.createObjectURL). Pendekatan ini menjamin pembuatan berkas berlangsung instan, tanpa membebani kuota server Vercel, dan tanpa bergantung pada API key atau layanan eksternal bernilai tambah.
Rincian Mesin Generator Multi-Format:
Kode & Skrip (.html, .js, .py, .css, .json): Konversi teks mentah secara langsung menjadi Blob MIME sesuai ekstensi. Dilengkapi fitur Live Preview melalui iframe sandbox dan eksekusi lokal (jsSandbox di js/ui/artifact.js).
Slide Presentasi (.pptx): Integrasi langsung dengan mesin biner OpenXML lokal shared/pptx-local.js bawaan repositori untuk menghasilkan berkas presentasi PowerPoint asli.
Dokumen Word (.docx): Pembuatan dokumen berformat via template OpenXML WordprocessingML / HTML-Word Envelope (shared/docx-local.js) yang langsung kompatibel dengan Microsoft Word dan Google Docs.
Dokumen Cetak (.pdf): Render tata letak rapi A4 berbasis CSS @media print dan pembungkus PDF lokal yang siap cetak atau diunduh instan dalam 1 klik.
Tabel Data Spreadsheet (.csv): Serialisasi matriks tabel ke format CSV standar RFC 4180 untuk dibuka langsung di Microsoft Excel atau Google Sheets.
Paket Proyek Multi-Berkas (.zip): Pembungkus ZIP client-side murni (shared/zip-local.js) untuk memaketkan banyak file proyek (misalnya proyek web lengkap HTML, CSS, dan JS) menjadi satu unduhan arsip .zip.
## 6.2 Protokol Respon AI & Alur Pengalaman Pengguna (UX Visual Artefak)
Format Tag Respon Model: Ketika pengguna meminta pembuatan file, model Raget mengeluarkan tag artefak terstruktur:
<artifact type="html|code|document|slide|table|zip" title="Judul Berkas" filename="nama_berkas.ext">
...isi konten berkas...
</artifact>
Kartu Artefak Interaktif di Obrolan (Inline Chat Card): Obrolan tidak menumpahkan kode mentah ratusan baris, melainkan merender kartu elegan (dikelola oleh js/ui/artifact-card.js) dengan ikon tipe berkas, nama file, estimasi ukuran, serta 2 tombol aksi: [ 👁️ Pratinjau Langsung ] dan [ ⬇️ Unduh Berkas ].
Panel Samping Interaktif (Side Stage Split-View): Mengetuk tombol pratinjau akan membuka panel samping #artifact-panel (js/ui/artifact.js) untuk menampilkan live-preview atau penyuntingan langsung secara instan (contentEditable).
Integrasi Penyimpanan Persisten: Seluruh artefak yang dihasilkan otomatis disimpan secara permanen di IndexedDB lokal dan terdaftar pada halaman Artefak di Sidebar (#artifact-page-list).
## 6.3 Mesin Penyerapan Data Pribadi Offline (Personal Data Vault Importers)
Rategoan menyediakan modul penyerapan data mandiri berbasis klien murni di direktori vault/ yang memungkinkan pengguna mengimpor riwayat digital mereka secara gratis dan tanpa melibatkan perantara server:
WhatsApp Chat Importer (vault/whatsapp/importer.js): Menganalisis file ekspor obrolan .txt, memisahkan pengirim, stempel waktu, dan konteks percakapan untuk diindeks ke dalam memori pencarian.
Evernote Importer (vault/evernote/importer.js): Mengekstrak file .enex berformat XML menjadi catatan terstruktur lengkap dengan tag dan lampiran teks.
Notion Archive Importer (vault/notion/importer.js): Memproses ekspor arsip ZIP atau file Markdown (.md) Notion, merapikan tautan antar-halaman dan struktur hirarki dokumen.
Calendar ICS Parser (vault/calendar/ics-parser.js): Membaca berkas standar kalender .ics untuk mengekstrak agenda acara, waktu, dan catatan rapat langsung ke memori lokal.
## 6.4 Mesin RAG & Pencarian Semantik Vektor Lokal (On-Device Vector Retrieval)
Untuk memproses dokumen berukuran besar (40+ halaman) tanpa bergantung pada API embedding pihak ketiga, Rategoan menggunakan triada mesin pencarian lokal di peramban:
Okapi BM25 Lexical Engine (bm25.js): Algoritma pemeringkatan relevansi teks berbasis frekuensi kata (TF-IDF terbobot) untuk menemukan kata kunci presisi tinggi secara instan.
PPMI Local Vector Generator (ppmi-embedding.js): Menerapkan Positive Pointwise Mutual Information untuk menghasilkan representasi vektor semantik ringan langsung di RAM peramban.
In-Memory Semantic Index (semantic-index.js): Penggabung pencarian hibrida (BM25 + Vektor PPMI) yang memotong dokumen panjang menjadi pecahan-pecahan (chunks) relevan sebagai konteks kaya bagi model RAGET.
## 6.5 Fitur Interaksi Suara Dwiarah & Pencarian Pesan Dalam Chat
Interaksi Suara Dwiarah Native (js/chat/voice.js): Menyediakan pengenalan suara masukan (Speech-to-Text / STT) Bahasa Indonesia (id-ID) secara native melalui Web Speech API yang dipicu via tombol #btn-voice-input. Dilengkapi pembaca respon otomatis (Text-to-Speech / TTS) via SpeechSynthesisUtterance yang dapat dikontrol lewat tombol #btn-stop, dengan pembersihan otomatis karakter/sintaks markdown agar pengucapan terdengar alami.
Pencarian Pesan Dalam Obrolan (js/chat/chatsearch.js): Memungkinkan pencarian teks real-time di dalam sesi obrolan yang sedang aktif dengan sorotan visual pada hasil pencarian dan tombol navigasi untuk melompat antar-pesan yang cocok secara instan.
# 7. KUMPULAN ALAT SIKLUS PENUH (CRUD TOOLSETS)
Setiap konektor didukung oleh kumpulan alat (toolsets) berstandar Model Context Protocol (MCP):
8. GERBANG KEAMANAN & KONFIRMASI PENGGUNA (HUMAN-IN-THE-LOOP)
## 7.1 Spesifikasi Kontrak API & Protokol Tool-Calling Raget
Kontrak API & Autentikasi Klien: Klien mengirimkan token akses OAuth yang tersimpan di localStorage ke Vercel Serverless Functions melalui HTTP Header standar: Authorization: Bearer <token>.
Format Tag Pemanggilan Alat (Tool-Calling Protocol): Model Raget Template dan Raget 1.0 melakukan pemanggilan alat secara terstruktur menggunakan format tag penutup berikut:
<tool_call>{"name": "drive_search_files", "parameters": {"query": "Laporan Keuangan 2026"}}</tool_call>
Siklus Render UI Kartu Alat (Tool UI Execution Lifecycle): Saat tag pemanggilan alat terdeteksi dalam aliran respon, antarmuka obrolan secara dinamis merender kartu status lipat (collapsible UI card):
Fase Loading: Menampilkan indikator animasi halus [⏳ Menelusuri Google Drive...].
Fase Sukses: Berubah menjadi badge hijau [✓ 3 berkas ditemukan] yang dapat diklik pengguna untuk melihat log eksekusi teknis detail.

[
{
"service": "google_drive",
"tools": [
{ "name": "drive_search_files", "description": "Mencari file dan folder di Google Drive." },
{ "name": "drive_read_content", "description": "Membaca teks dari Google Docs, Sheets, atau PDF." },
{ "name": "drive_create_file", "description": "Membuat dokumen Google Docs/Sheets atau folder baru." },
{ "name": "drive_update_file", "description": "Mengubah nama atau memindahkan file antar-folder." },
{ "name": "drive_copy_file", "description": "Menduplikasi file dokumen yang ada." }
]
},
{
"service": "github",
"tools": [
{ "name": "github_read_file", "description": "Membaca isi berkas kode repositori." },
{ "name": "github_get_tree", "description": "Membaca pohon struktur berkas dan folder repo." },
{ "name": "github_commit_changes", "description": "Menyimpan perubahan kode ke branch repositori." },
{ "name": "github_create_pull_request", "description": "Membuka PR baru dengan ulasan lengkap." },
{ "name": "github_create_issue", "description": "Mendaftarkan tiket bug baru." }
]
},
{
"service": "gmail",
"tools": [
{ "name": "gmail_search_threads", "description": "Mencari email masuk berdasarkan filter kueri." },
{ "name": "gmail_get_thread", "description": "Membaca seluruh pesan dalam rangkaian percakapan." },
{ "name": "gmail_create_draft", "description": "Menyusun draf balasan email secara otomatis." },
{ "name": "gmail_send_email", "description": "Mengirimkan email setelah dikonfirmasi pengguna." }
]
},
{
"service": "google_calendar",
"tools": [
{ "name": "calendar_list_events", "description": "Membaca jadwal agenda pengguna." },
{ "name": "calendar_suggest_time", "description": "Menemukan slot waktu kosong untuk pertemuan." },
{ "name": "calendar_create_event", "description": "Mendaftarkan jadwal rapat baru beserta link Meet." },
{ "name": "calendar_update_event", "description": "Menjadwal ulang atau memperbarui agenda rapat." }
]
},
{
"service": "web_search_reader",
"tools": [
{ "name": "web_search", "description": "Pencarian web bebas biaya API via DuckDuckGo HTML scraper." },
{ "name": "web_fetch_page", "description": "Ekstraksi konten bersih halaman web via Vercel fetch proxy." }
]
},
{
"service": "local_sandbox",
"tools": [
{ "name": "run_javascript_sandbox", "description": "Eksekusi JS/HTML aman di iframe sandbox lokal peramban." },
{ "name": "run_python_wasm", "description": "Eksekusi kode Python 100% lokal via Pyodide WebAssembly." }
]
}
]
## 7.2 Spesialisasi Mesin Penalaran Raget Template (Specialized Domain Engines)
Model Raget Template dilengkapi dengan seperangkat modul penalaran terdefinisi di direktori raget/ untuk mengeksekusi tugas-tugas spesifik domain secara tepat dan otonom:
STEM & Math Precision Engines (stem-engine.js & math-engine.js): Mengeksekusi kalkulasi eksak rumus matematika, persamaan fisika, dan analisis sains tanpa risiko halusinasi angka numerik.
Social & Humanities Engine (social-engine.js): Modul penalaran khusus ilmu sosial, analisis etika, serta wawasan kebudayaan lokal Indonesia.
Bilingual Engine (bilingual.js): Penyeimbang alih-bahasa otomatis yang memastikan kualitas tata bahasa baku Bahasa Indonesia dan Bahasa Inggris tetap konsisten.
Daily Briefing Generator (daily-briefing.js): Penyusun ringkasan pagi otonom yang memadukan agenda kalender pribadi, informasi cuaca realtime (vault/web/weather.js), dan kabar berita terkini (vault/web/news.js).
## 7.3 Mesin Terjemahan Realtime & Response Language Lock
Mesin Terjemahan Inferensi (vault/translate/translator.js): Menggunakan modul ONNX Xenova/opus-mt-en-id dan Xenova/opus-mt-mul-en via transformers.js.
Peran Tunggal: Dikhususkan untuk rule-engine pencarian web real-time (vault/web/web-search.js dan read-web.js), sehingga materi sumber web berbahasa Inggris otomatis diterjemahkan ke Bahasa Indonesia sebelum disintesis.
Response Language Lock (raget/raget-agents/answer-composer.js): Jaring pengaman terakhir yang memastikan jawaban akhir selalu terkunci dalam Bahasa Indonesia baku.

Aksi Level 1 (Baca): Berjalan otomatis secara transparan dengan sitasi tautan URL sumber klikable.
Aksi Level 2 (Draf / Berkas Baru): Eksekusi otomatis dengan pemberitahuan ringkas dan tautan langsung ke berkas yang baru dibuat.
Aksi Level 3 (Kirim / Hapus / Timpa Data): Sistem wajib menampilkan kartu konfirmasi interaktif di obrolan sebelum perintah API dieksekusi:
Menampilkan detail penerima, subjek, dan ringkasan isi (untuk email).
Menampilkan diff kode dan branch target (untuk commit/PR GitHub).
Menyediakan tombol jelas: [ Batalkan ] dan [ Setujui & Jalankan ].
# 9. SPESIFIKASI HALAMAN PENGATURAN (#view-settings) & JANGKAR PROFIL PENGGUNA
Berdasarkan analisis tangkapan layar antarmuka Pengaturan (#view-settings) dan implementasi berkas js/account/settings.js:
## 9.1 Jangkar Kartu Identitas Akun Pengguna (#profile-head)
Kartu header profil (#profile-head) menampilkan avatar lingkaran besar huruf 'M', nama tampilan #profile-name (Maetalizer), serta email #profile-mail (maetalizer@gmail.com).
Menjadi jangkar Single Sign-On (SSO) untuk otorisasi Google Drive, Gmail, dan Calendar tanpa meminta pengguna mengetik ulang email mereka.
## 9.2 Rincian 6 Sub-Kategori Menu Navigasi Kartu Pengaturan
🌙 Tampilan (data-cat="tampilan") >: Mengatur tema visual Mode Gelap (Opsi: T=Terang, A=Auto, G=Dark) dan Ukuran Teks (Opsi: K=Kecil, N=Normal, B=Besar).
🖥 Model (data-cat="ai") >: Status 2 model in-house Rategoan (Raget Template dan Raget 1.0) serta pengaturan konfigurasi URL server inference sendiri via #row-llm-mode.
🔒 Privasi & Keamanan (data-cat="privasi") >: Menyediakan penguncian aplikasi dengan PIN 4-6 digit (#row-pin), sakelar penyiapan Memori Kognitif (#row-memori), dan opsi Hapus memori tersimpan dari IndexedDB (#row-hapus-memori).
🗄️ Data (data-cat="data") >: Menampilkan informasi statistik penyimpanan lokal (#storage-info), Cadangkan Chat (#row-backup), Pulihkan Chat (#row-restore), Unduhan Fitur offline OCR/Terjemahan/PDF (#row-unduhan-fitur), Lembar Diagnostik Kesehatan Data (#row-data-health), serta Buka Koleksi (#row-pengetahuan-saya).
🔊 Preferensi (data-cat="preferensi") >: Pengaturan Baca Otomatis pembaca suara TTS (#row-tts) dan sakelar Mode Hemat baterai/kuota (#row-hemat).
ℹ️ Lainnya (data-cat="lainnya") >: Informasi Tentang Rategoan v1.0, opsi Hapus Semua Chat (#row-clear-chat), dan tombol Keluar Sesi (#row-logout).
## 9.3 Konsol Keamanan, Diagnostik, dan Ketahanan Sistem (System Resilience & Health)
Kunci Keamanan Sesi PIN Fisik (js/state/pin.js & #pin-overlay): Penguncian layar aplikasi menggunakan PIN numerik fisik dengan enkripsi hash DJB2 yang tersimpan lokal di localStorage untuk melindungi privasi sesi dan data pengguna di perangkat.
Lembar Diagnostik Kesehatan & Pembelajaran Mandiri (js/sheets/data-health-sheet.js & #data-health-sheet): Panel diagnostik terpadu yang mengekstraksi daftar pertanyaan tidak cocok/gagal via ragetDb.allUnmatched() serta statistik umpan balik suka/tidak suka pengguna via feedbackStore.statsByIntent() sebagai bahan evaluasi perbaikan korpus mandiri.
Mode Hemat Baterai & Kuota (js/state/hemat.js): Sakelar status raget_hemat untuk mengoptimalkan kinerja di perangkat spesifikasi rendah (low-end) dengan menonaktifkan efek animasi berat dan membatasi beban komputasi latar belakang.
Cadangan & Pemulihan Nir-Awan (js/system/backup.js & #pick-restore): Fitur ekspor dan pemulihan instan 1-klik untuk seluruh riwayat obrolan, proyek, dan koleksi ke/dari file JSON lokal (rategoan-backup-YYYY-MM-DD.json) secara penuh offline tanpa ketergantungan pada layanan cloud pihak ketiga.
# 10. SPESIFIKASI QUICK MODEL SWITCHER (IKON KOTAK DI SAMPING TOMBOL +)
Berdasarkan analisis tangkapan layar bilah input obrolan (egoan.vercel.app):
Peran: Mengganti model yang aktif dalam 1 ketukan langsung saat mengetik obrolan. Mesin bawaan dan utama adalah model RAGET buatan sendiri (in-house) yang berjalan secara mandiri tanpa memerlukan API Key pihak ketiga apa pun.
Status: Raget Template (aktif bawaan) dan Raget 1.0 (aktif saat endpoint server GPU terhubung).
Indikator Visual & Opsi Model: Pilihan model dibatasi secara ketat hanya pada 2 model otonom: Raget Template dan Raget 1.0. Ikon kotak menampilkan label mikro model aktif.

Aturan Auto-Fallback Otonom (3-Second SLA Threshold): Jika pengguna memilih model neural Raget 1.0 namun endpoint server GPU mengalami kendala jaringan atau tidak merespons dalam batas waktu 3 detik, sistem antarmuka akan secara otomatis mengalihkan inferensi secara mulus ke Raget Template dengan notifikasi mikro-toast halus "Mengalihkan sementara ke Raget Template...", menjamin sesi obrolan tidak pernah macet atau terputus.

┌─────────────────────────────────────────────────────────────┐
│ Pilih Otak AI                                           [X] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ●  Raget Template (Bawaan Sistem)                       │ │
│ │    Mesin hibrida cepat berbasis aturan & pencarian web   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ ○  Raget 1.0 (Model Neural Korpus K & R)                │ │
│ │    Penalaran mendalam terlatih dari 17+ Miliar token BPE │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ⚙️ Kelola Parameter Model di Menu Pengaturan >              │
└─────────────────────────────────────────────────────────────┘

## 10.1 Distribusi Checkpoint Neural Hugging Face Hub
Kebijakan Distribusi Bobot Model Neural Nir-Git: Checkpoint biner .safetensors disimpan di Hugging Face Hub (huggingface.co/Maetalizer19/rategoan-neural) yang mendukung header CORS access-control-allow-origin: *.
Tiga Tier Model Neural:
Tier Ringan (50M): raget-neural-massive50m.safetensors
Tier Berat (100M): raget-neural-massive100m.safetensors (dibatasi hanya jika deviceMemory >= 4GB)
Tier Super (200M): raget-neural-massive200m.safetensors (diprefetch secara diam-diam via prefetchBest())
# 11. CETAK BIRU IMPLEMENTASI TEKNIS TANPA AMBIGUITAS (ZERO-AMBIGUITY BLUEPRINT)
## 11.1 Batasan Mutlak Tech Stack
Arsitektur Frontend: Wajib menggunakan Vanilla JavaScript Native ES Modules (ESM) dengan standar peramban modern (<script type="module">).
Larangan Keras: Dilarang mengimpor atau menggunakan compiler framework seperti React, JSX, Vue, atau Svelte, serta dilarang menambahkan build tools bundler berat (Webpack/Vite/Parcel).
Komponen Visual: Dibangun menggunakan manipulasi DOM murni (document.createElement) atau Template Literals yang aman dari XSS.
Arsitektur Backend: Menggunakan Vercel Serverless Functions berbasis Node.js standard runtime di direktori /api/.
## 11.2 Peta Direktori Berkas Fisik (Concrete Target File Tree)

Rategoan/
├── index.html                           # Entrypoint utama web
├── js/
│   ├── account/
│   │   └── settings.js                  # Pengaturan akun pengguna
│   ├── ui/
│   │   ├── artifact.js                  # Handler panel samping #artifact-panel & sandbox
│   │   └── artifact-card.js             # Komponen kartu artefak obrolan
│   └── connectors/                      # Modul antarmuka konektor
│       ├── connector-hub.js             # Render tampilan utama Hub & direktori kartu
│       ├── connector-explorer.js        # Render sub-view (Drive Explorer, Repo Browser)
│       ├── connector-state.js           # Manajemen state kredensial & deteksi token expired
│       └── connector-events.js          # Dispatcher CustomEvent ke chat window
├── raget/                               # Mesin kecerdasan & penalaran Raget
│   ├── stem-engine.js                   # Modul kalkulasi sains & eksak
│   ├── math-engine.js                   # Modul kalkulasi matematika presisi
│   ├── social-engine.js                 # Modul penalaran humaniora & sosial
│   ├── bilingual.js                     # Penyeimbang dwibahasa baku
│   ├── daily-briefing.js                # Generator ringkasan harian
│   ├── quiz-session.js                  # Modul kuis interaktif tutor
│   └── raget-memory/                    # Sistem memori kognitif
│       ├── memory-long.js               # Memori kognitif jangka panjang
│       └── streak-store.js              # Penyiapan riwayat dan aktivitas
├── vault/                               # Bank data & penyerapan lokal
│   ├── whatsapp/importer.js             # Importir chat WhatsApp (.txt)
│   ├── evernote/importer.js             # Importir catatan Evernote (.enex)
│   ├── notion/importer.js               # Importir arsip Notion (.zip/.md)
│   ├── calendar/ics-parser.js           # Parser berkas kalender (.ics)
│   ├── rag/                             # Mesin pencarian & vektor lokal
│   │   ├── bm25.js                      # Okapi BM25 Lexical Engine
│   │   ├── ppmi-embedding.js            # Embedder PPMI vektor ringan
│   │   └── semantic-index.js            # Indeks hibrida RAG lokal
│   └── web/                             # Modul data web lokal
│       ├── weather.js                   # Ekstraktor data cuaca
│       └── news.js                      # Ekstraktor berita harian
├── shared/                              # Library pembantu client-side
│   ├── pptx-local.js                    # Generator PowerPoint murni
│   ├── docx-local.js                    # Generator Word murni
│   └── zip-local.js                     # Pengompres ZIP murni
├── api/                                 # Vercel Serverless API Routes
│   ├── auth/                            # OAuth Google & GitHub
│   └── connectors/                      # Handler Drive, GitHub, Gmail, Calendar
├── vault/connectors/                    # Adaptor MCP sisi klien
└── raget-agents/                        # Router dan composer jawaban
## 11.3 Skema Baku Penyimpanan State Klien
Status konektor disimpan di peramban pada localStorage dengan kunci baku: rategoan_connectors_state.
Format objek data yang wajib digunakan:

{
"version": "1.0",
"autonomous_discovery": true,
"services": {
"google_drive": {
"connected": true,
"account_email": "user@gmail.com",
"display_name": "Google Drive Workspace",
"token_expires_at": 1727982000000,
"reconnect_required": false,
"tools_count": 11,
"scopes": ["drive.readonly", "drive.file"]
},
"github": {
"connected": true,
"account_username": "maetalizer",
"display_name": "GitHub Developer",
"auth_type": "oauth",
"tools_count": 45,
"scopes": ["repo", "read:user"]
},
"gmail": {
"connected": false,
"reconnect_required": false,
"tools_count": 30
},
"google_calendar": {
"connected": false,
"tools_count": 6
},
"web_search_reader": {
"connected": true,
"system_native": true,
"tools_count": 4
}
}
}
## 11.4 Protokol Komunikasi Antar-Komponen
Komunikasi antar-komponen menggunakan native CustomEvent:
rategoan:attach-context: Menyematkan berkas Drive atau file GitHub ke chat input.
rategoan:reconnect-required: Menampilkan banner peringatan token kedaluwarsa.
rategoan:model-switched: Mengirim sinyal saat model ditukar lewat Quick Model Switcher.
# 12. RENCANA KERJA PENYELESAIAN MESIN (HARNESS SPRINT ROADMAP)
Sprint 1 — Fondasi Riwayat, State & File Parser:
Mengaktifkan IndexedDB untuk Riwayat Chat persisten, membuat modul connector-state.js, dan memasang parser pdf.js/mammoth.js pada tombol File lokal.
Sprint 2 — Generator Slide & Kamera:
Mengintegrasikan modul mandiri bawaan shared/pptx-local.js pada tombol Buat Slide dan menghubungkan Web API kamera perangkat.
Sprint 3 — Hub Konektor Awan & OAuth Vercel:
Menerapkan antarmuka Hub Konektor standar Grok/Manus dan mengaktifkan rute serverless OAuth Google & GitHub di Vercel.
Sprint 4 — Studio Kode & Quick Model Switcher:
Membangun Code Playground terintegrasi dan menghubungkan modal Quick Model Switcher ke backend inferensi.

# 13. MATRIKS EKSEKUSI TEKNIS & CHECKLIST DEFINITION OF DONE (PANDUAN LANGSUNG UNTUK AI PENGEMBANG)
Bagi pekerjaan implementasi secara terstruktur ke dalam 4 kuadran tindakan nyata:
1. APA YANG HARUS DIPERBAIKI & DIBERSIHKAN (FIX & CLEANUP):
Standar Kode Produksi Berkualitas Tinggi Standar Industri & Bebas Komentar (Zero-Comment Clean Code): Setiap pembuatan berkas baru maupun pembaruan berkas eksisting wajib memenuhi standar rekayasa perangkat lunak industri tinggi (robust, semantik, modular, self-documenting). DILARANG KERAS menyertakan komentar penjelasan, catatan TODO, komentar baris (//), blok komentar (/* ... */), maupun komentar HTML (<!-- ... -->). Kode harus ekspresif dan berbicara sendiri melalui penamaan variabel dan fungsi yang jelas.
Tugas Pembersihan Komentar Repositori (Codebase Comment Purge Sprint): Lakukan penyisiran dan pembersihan total terhadap 40+ berkas eksisting di seluruh direktori repositori (js/, shared/, raget/, vault/, api/, css/, dan index.html) dari segala sampah komentar pengembang, blok kode usang yang dimatikan, dan catatan internal agar seluruh berkas 100% berstatus Production Ready.
Berkas index.html & js/connect/connect.js: Hapus formulir antrean lama ('https://server-anda', tombol antrian ekspor drive/WA, dan pre console outbox). Gantikan dengan container Hub Konektor modern.
Berkas js/sheets/model-sheet.js: Kunci array VISIBLE_ENGINE_IDS hanya berisi ['template', 'neural']. Pasang mekanisme graceful fallback 3 detik ke template jika neural offline.
Berkas js/ui/artifact.js: Bersihkan ketergantungan teks mentah, pastikan langsung terhubung ke generator lokal.
2. APA YANG HARUS DIPERBARUI & DI-UPGRADE (UPDATE & UPGRADE):
Berkas js/sheets/attach.js & css/sheets/sheets.css: Upgrade logic toggle switch (Pencarian Web, Berpikir Keras, Riset Mendalam) agar saat aktif langsung me-render badge 'Active Mode Chips' dengan tombol (x) di elemen #attach-row tepat di atas #chat-input.
Berkas shared/slides-export.js: Sambungkan tombol #sheet-slide langsung ke mesin lokal shared/pptx-local.js agar klik tombol langsung mengunduh file .pptx nyata.
Berkas js/collection/collection.js: Sambungkan tombol importir di halaman Koleksi ke modul parser vault/whatsapp, vault/notion, vault/evernote, dan vault/calendar.
3. APA YANG HARUS DIKERJAKAN DARI NOL (NEW IMPLEMENTATIONS):
Berkas js/connectors/connector-hub.js: Buat modul UI Hub Konektor modern standar Grok/Manus (Kategori Terhubung vs Unggulan, badge jumlah tool, tombol hubungkan/putuskan).
Berkas api/auth/google/ & api/auth/github/: Buat Vercel Serverless Function penangan alur OAuth 2.0 PKCE.
Berkas api/connectors/drive/, api/connectors/github/, api/connectors/gmail/, api/connectors/calendar/: Buat endpoint serverless pemanggil Google & GitHub API menggunakan Bearer token klien.
Berkas shared/docx-local.js & shared/zip-local.js: Buat modul pembungkus Word XML dan ZIP client-side murni.
Berkas js/ui/artifact-card.js: Buat komponen kartu artefak interaktif di chat (<artifact> parser).
4. CHECKLIST PENGUJIAN AKHIR (DEFINITION OF DONE):
[ ] Tombol Buat Slide (.pptx) menghasilkan file PowerPoint asli yang bisa dibuka di MS PowerPoint/Google Slides.
[ ] Menyalakan Pencarian Web memunculkan chip biru di atas input chat.
[ ] Mengetik pesan yang meminta dokumen Word (.docx) menghasilkan kartu di chat dengan tombol unduh berkas yang valid.
[ ] Menu Konektor menampilkan status real-time 6 konektor tanpa ada form server-anda lama.
[ ] Sesi chat tersimpan di IndexedDB dan bisa dicari di riwayat.
[ ] Terkonfigurasi workflow CI/CD .github/workflows/lint.yml berbasis Node 22 linter.
[ ] Seluruh suite unit test node:test di raget/raget-tools/unit/ (menguji answer-lock, bm25, router-intent, dan syntax-validator) lulus 100%.
# 14. TABEL MASTER DAFTAR KERJA & STATUS PROGRESS IMPLEMENTASI (LIVING EXECUTION TRACKER)
Tabel ini berfungsi sebagai living document acuan kerja agar developer dan AI pelaksana dapat memantau progres secara transparan:

No
Klaster Sistem
Fitur / Komponen
Berkas Target
Jenis Tindakan
Status Implementasi
Rincian Pekerjaan Teknis Nyata
1
Lembar Lampirkan (+)
Kamera (#sheet-camera)
js/sheets/camera.js
index.html
UPGRADE
[✓] SUDAH SELESAI
Terhubung ke navigator.mediaDevices.getUserMedia, #camera-overlay, kamera switch, dan pembuatan file instan untuk OCR.
2
Lembar Lampirkan (+)
Foto (#sheet-photo)
js/sheets/attach.js
index.html
UPGRADE
[✓] SUDAH SELESAI
Terhubung ke pemilih galeri gambar native #pick-photo (accept="image/*") dengan pratinjau thumbnail di #attach-row.
3
Lembar Lampirkan (+)
File (#sheet-file)
js/sheets/attach.js
shared/pdf-extract.js
UPGRADE
[✓] SUDAH SELESAI
Filter ekstensi lengkap (.pdf, .docx, .txt, .csv, .ics, .enex, .zip) terhubung ke parser docx OpenXML dan PDF extractor.
4
Lembar Lampirkan (+)
Pencarian Web (#sheet-websearch)
js/chat/composer.js
api/connectors/web/search.js
UPGRADE
[✓] SUDAH SELESAI
Toggle switch aktif terhubung ke Vercel proxy DuckDuckGo HTML scraper dengan badge sitasi sumber klikable di chat.
5
Lembar Lampirkan (+)
Buat Slide (.pptx) (#sheet-slide)
js/chat/composer.js
shared/slides-export.js
UPGRADE
[✓] SUDAH SELESAI
Tombol aksi langsung memicu ekstraksi outline dan ekspor file PowerPoint asli via shared/pptx-local.js.
6
Lembar Lampirkan (+)
Berpikir Keras (#sheet-think)
js/chat/composer.js
raget/raget-agents/turn-pipeline.js
UPGRADE
[✓] SUDAH SELESAI
Toggle switch aktif menyisipkan blok pemikiran terstruktur flowHub.thinkBlock() dengan trace collapsible di chat.
7
Lembar Lampirkan (+)
Riset Mendalam (#sheet-research)
js/chat/composer.js
vault/web/web-search.js
UPGRADE
[✓] SUDAH SELESAI
Toggle switch aktif memicu loop riset otonom multi-langkah flowHub.researchPlan() dan otomatis menyalakan pencarian web.
8
Lembar Lampirkan (+)
Masukkan ke Proyek (#sheet-project)
js/chat/composer.js
js/project/project.js
UPGRADE
[✓] SUDAH SELESAI
Tombol aksi langsung membuka #project-sheet untuk menautkan sesi aktif ke workspace proyek tertentu.
9
Lembar Lampirkan (+)
Belajar Terpandu (#sheet-learn)
js/chat/composer.js
raget/raget-agents/stem-engine.js
UPGRADE
[✓] SUDAH SELESAI
Mengubah mode menjadi Socratic Tutor flowHub.lesson(), evaluasi langkah, dan rujukan ke kuis interaktif.
10
Lembar Lampirkan (+)
Active Mode Chips
js/sheets/attach.js
css/sheets/sheets.css
UPGRADE
[✓] SUDAH SELESAI
Merender badge visual .mode-chip dengan tombol penutup (x) di atas textarea saat mode web/think/research aktif.
11
Navigasi Sidebar
Chat Baru (#btn-new-chat)
js/chat/chat.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Membuat sesi obrolan bersih baru dengan UUID unik dan mereset tampilan pesan.
12
Navigasi Sidebar
Studio Kode (#btn-studio)
js/studio/studio.js
UPGRADE
[✓] SUDAH SELESAI
Ruang kerja pemrograman terpadu berbasis CodeMirror, tab Live Preview, dan runner Python Pyodide WebAssembly.
13
Navigasi Sidebar
Koleksi (#btn-collection)
js/collection/collection.js
UPGRADE
[✓] SUDAH SELESAI
Pustaka penyimpanan terstruktur (Tersimpan & Perpustakaan) terhubung ke 4 importir data pribadi (WA, Evernote, Notion, ICS).
14
Navigasi Sidebar
Proyek (#btn-project)
js/project/project.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Manajemen multi-workspace terisolasi dengan system prompt khusus dan berkas rujukan permanen.
15
Navigasi Sidebar
Konektor (#btn-connect)
index.html
js/connect/connect.js
PERBAIKAN
[✓] SUDAH SELESAI
Form server-anda lama dihapus total, navigasi didelegasikan langsung ke Hub Konektor modern connector-hub.js.
16
Navigasi Sidebar
Artefak (#btn-artifact)
js/ui/artifact.js
UPGRADE
[✓] SUDAH SELESAI
Pusat penyimpanan seluruh berkas buatan Rategoan (.pptx, .docx, .pdf, .csv, .zip, skrip) terintegrasi ke IndexedDB.
17
Navigasi Sidebar
Riwayat Chat (#btn-history)
js/history/history.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Penampil daftar riwayat percakapan persisten yang tersimpan di IndexedDB lokal.
18
Navigasi Sidebar
Cari Riwayat (#hist-search)
js/history/history.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Input pencarian terfilter untuk menyaring daftar sesi percakapan berdasarkan kata kunci topik.
19
Navigasi Sidebar
Pengaturan (#btn-settings)
js/account/settings.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Mengarahkan navigasi antarmuka langsung ke tampilan pusat Pengaturan Aplikasi (#view-settings).
20
Navigasi Sidebar
Avatar Profil (#btn-account)
js/account/settings.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Tombol profil akun Maetalizer (maetalizer@gmail.com) sebagai jangkar Single Sign-On.
21
Input Chat & Switcher
Chat Input Textarea
js/chat/chat.js
js/chat/composer.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Bilah masukan teks serbaguna dengan dukungan auto-expand, drag-and-drop file, dan shortcut Enter/Shift+Enter.
22
Input Chat & Switcher
Quick Model Switcher
js/sheets/model-sheet.js
PERBAIKAN
[✓] SUDAH SELESAI
Terkunci hanya pada ['template', 'neural'] dengan aturan auto-fallback 3 detik jika model neural belum siap.
23
Input Chat & Switcher
Input Suara (STT id-ID)
js/chat/voice.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Pengenalan suara masukan Bahasa Indonesia (id-ID) native via Web Speech API (#btn-voice-input).
24
Input Chat & Switcher
Output Suara (TTS id-ID)
js/chat/voice.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Pembaca respon otomatis via SpeechSynthesisUtterance dengan filter pembersihan karakter markdown alami.
25
Input Chat & Switcher
In-Chat Message Search
js/chat/chatsearch.js
UPGRADE
[✓] SUDAH SELESAI
Floating search bar di dalam obrolan aktif dengan pencocokan fuzzy Levenshtein, sorotan teks, dan navigasi hit.
26
Artifact Engine
Generator PPTX Lokal
shared/pptx-local.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Mesin biner OpenXML murni client-side untuk membuat dan mengekspor berkas presentasi PowerPoint .pptx.
27
Artifact Engine
Generator DOCX Lokal
shared/docx-local.js
BARU
[✓] SUDAH SELESAI
Generator dokumen WordprocessingML murni di peramban terintegrasi dengan mesin ZIP untuk ekspor berkas .docx.
28
Artifact Engine
Generator ZIP Lokal
shared/zip-local.js
BARU
[✓] SUDAH SELESAI
Modul kompresi arsip ZIP client-side murni dengan CRC32 untuk memaketkan multi-file proyek menjadi satu .zip.
29
Artifact Engine
Sandbox HTML/JS/PY
js/ui/artifact.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Pratinjau langsung via iframe sandbox aman untuk HTML/JS/CSS dan eksekusi Python via Pyodide WebAssembly.
30
Artifact Engine
Generator Tabel CSV
js/ui/artifact.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Serialisasi matriks tabel obrolan ke format RFC 4180 CSV untuk diunduh dan dibuka di Excel/Sheets.
31
Artifact Engine
Kartu Artefak Chat
js/ui/artifact-card.js
BARU
[✓] SUDAH SELESAI
Parser tag <artifact> dan komponen kartu interaktif di chat dengan tombol Pratinjau & Unduh Berkas.
32
Hub Konektor & Vercel
UI Hub Konektor Modern
js/connectors/connector-hub.js
BARU
[✓] SUDAH SELESAI
Modul UI Hub Konektor modern dengan pemisahan status Terhubung vs Unggulan dan badge tool count.
33
Hub Konektor & Vercel
Google Drive OAuth & Tools
api/connectors/drive.js
api/auth/google.js
BARU
[✓] SUDAH SELESAI
Serverless endpoint untuk 11 alat Google Drive (baca, buat dokumen, kelola direktori, ekspor file).
34
Hub Konektor & Vercel
GitHub OAuth & Tools
api/connectors/github.js
api/auth/github.js
BARU
[✓] SUDAH SELESAI
Serverless endpoint untuk 45 alat GitHub (baca repo, buat commit, buka PR, kelola issue, linter).
35
Hub Konektor & Vercel
Gmail OAuth & Tools
api/connectors/gmail.js
BARU
[✓] SUDAH SELESAI
Serverless endpoint untuk 30 alat Gmail (cari inbox, baca thread, susun draf, kirim email).
36
Hub Konektor & Vercel
Google Calendar OAuth & Tools
api/connectors/calendar.js
BARU
[✓] SUDAH SELESAI
Serverless endpoint untuk 6 alat Google Calendar (baca agenda, analisa jadwal bentrok, buat meeting).
37
Hub Konektor & Vercel
Web Search Scraper
api/connectors/web/search.js
BARU
[✓] SUDAH SELESAI
Handler proxy scraper DuckDuckGo HTML non-API bebas biaya untuk pencarian web real-time.
38
Halaman Pengaturan
Kartu Profil Maetalizer
js/account/settings.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Header profil #profile-head dengan avatar 'M', nama Maetalizer, dan email maetalizer@gmail.com.
39
Halaman Pengaturan
Mode Gelap & Ukuran Teks
js/account/settings.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Pengaturan tema visual Mode Gelap (Terang/Auto/Dark) serta penyesuaian ukuran teks (Kecil/Normal/Besar).
40
Halaman Pengaturan
Kunci PIN Fisik Sesi
js/state/pin.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Penguncian layar aplikasi dengan PIN 4-6 digit hash DJB2 yang tersimpan lokal di localStorage.
41
Halaman Pengaturan
Memori Kognitif Jangka Panjang
raget/raget-memory/memory-long.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Sistem penyimpanan fakta dan preferensi pengguna jangka panjang yang terhubung ke IndexedDB.
42
Halaman Pengaturan
Storage Info & Backup/Restore
js/system/backup.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Informasi kuota penyimpanan lokal dan fitur ekspor/impor cadangan JSON offline 1-klik.
43
Halaman Pengaturan
Mode Hemat Kuota/Baterai
js/state/hemat.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Optimasi kinerja perangkat spesifikasi rendah dengan menonaktifkan animasi berat dan komputasi latar.
44
Halaman Pengaturan
Data Health Sheet
js/sheets/data-health-sheet.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Panel diagnostik ekstraksi pertanyaan tidak cocok/gagal dan rekapitulasi umpan balik pengguna.
45
Mesin Inti RAGET
Turn Pipeline (6 Tahap)
raget/raget-agents/turn-pipeline.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Jalur giliran tunggal pemrosesan obrolan 6 tahap linier: intent -> context -> route -> compose -> qc -> act.
46
Mesin Inti RAGET
Okapi BM25 & PPMI RAG Lokal
raget/raget-retrieval/bm25.js
vault/rag/semantic-index.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Pencarian hibrida gabungan pemetaan kata leksikal BM25 dan vektor PPMI ringan langsung di RAM peramban.
47
Mesin Inti RAGET
Specialized Domain Engines
raget/raget-agents/stem-engine.js
raget/raget-agents/social-engine.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Seperangkat modul penalaran spesialisasi domain (STEM, matematika eksak, ilmu sosial, dan dwibahasa).
48
Mesin Inti RAGET
Translator Xenova/opus-mt-en-id
vault/translate/translator.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Model penerjemahan ONNX lokal transformers.js untuk menerjemahkan materi web Inggris ke Indonesia.
49
Mesin Inti RAGET
Response Language Lock
raget/raget-agents/answer-composer.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Aturan penjamin jawaban akhir agar selalu terkunci secara konsisten dalam Bahasa Indonesia baku.
50
Mesin Inti RAGET
Hugging Face Checkpoint Provider
raget/raget-neural/neural-provider.js
SUDAH SELESAI
[✓] SUDAH SELESAI
Provider unduhan checkpoint biner .safetensors multi-tier via Hugging Face Hub (CORS).
51
Repositori & CI/CD
CI/CD GitHub Actions
.github/workflows/lint.yml
SUDAH SELESAI
[✓] SUDAH SELESAI
Workflow pemeriksaan otomatis berbasis Node 22 linter untuk validasi sintaks dan integritas kode.
52
Repositori & CI/CD
Unit Test Suite
raget/raget-tools/unit/
SUDAH SELESAI
[✓] SUDAH SELESAI
Suite pengujian unit node:test (14 test cases) lulus 100% tanpa error.
53
Seluruh Repositori
Pembersihan Total Komentar
Seluruh berkas di js/, shared/, raget/, vault/, api/, css/
PERBAIKAN
[!] PERLU PERBAIKAN
Audit ZIP menemukan masih terdapat sisa komentar di 98 berkas repositori yang perlu disisir bersih.
54
Mesin Latar Belakang
Web Worker & Thought Card (Bab 16)
js/agent/agent-worker.js
js/ui/thought-card.js
css/ui/thought.css
BARU
[ ] BELUM DIKERJAKAN
Bangun Web Worker ReAct di thread terpisah dan kartu akordeon Thoughts di chat UI sesuai spesifikasi Bab 16.

# 15. BAB 15: PROTOKOL EKSEKUSI OTONOM (GROK BUILD RUNTIME DIRECTIVE & BACKGROUND MARATHON SPRINT)
## 15.1 Latar Belakang & Filosofi Eksekusi Tanpa Friksi
Bab ini merupakan mandat baku (Executive System Prompt & Operational Protocol) yang mengikat secara mutlak bagi agen pengembang otonom (khususnya Grok Build, Cursor Agent, Claude Code, maupun autonomous AI developer lainnya). Selama ini, produktivitas sering terhambat oleh laporan parsial setengah jalan, obrolan basa-basi yang tidak perlu, dan pertanyaan sepele yang memutus fokus kerja. Protokol ini mematenkan standar kerja maraton otonom: sekali mandat diberikan, AI bekerja mandiri di latar belakang hingga tuntas tanpa interupsi.
## 15.2 Master Directive / Template Perintah Siap Pakai (Salin Langsung ke Grok Build)
Gunakan instruksi baku tingkat industri berikut saat memicu Grok Build:

[MANDAT EKSEKUSI PENUH: GROK BUILD AUTONOMOUS RUNTIME]

Peran & Otoritas:
Anda bertindak sebagai Principal Software Engineer otonom dengan akses penuh ke workspace dan terminal repositori Rategoan. Anda membaca dan tunduk sepenuhnya pada spesifikasi di Dokumen PRD Antarmuka Versi 2.0.0 (Bab 1 s.d. Bab 14).

Aturan Main & Format Operasional Mutlak:
1. Mode Operasi Latar Belakang Senyap (Silent Background Marathon):
- Jalankan seluruh proses kompilasi, penulisan kode, refactoring, dan pengujian di background secara live dan senyap.
- Alokasi waktu kerja: 90 hingga 180 menit kerja maraton intensif tanpa henti.
- Selesaikan seluruh paket pekerjaan besar dalam satu siklus eksekusi penuh (single uninterrupted deep-work pass).

2. Inisialisasi Workspace Penuh:
- Ekstrak seluruh berkas repositori ke dalam lingkungan kerja aktif.
- Analisis dependensi, struktur berkas (js/, shared/, vault/, raget/, api/, css/), dan pastikan tidak ada dependensi eksternal berbayar yang bocor.
- Jalankan baseline linter (`npm test` atau `node --test`) sebelum memulai perubahan.

3. STANDAR KODE PRODUKSI BERSIH & ZERO-COMMENT (MUTLAK):
- Setiap berkas yang dibuat atau diperbarui WAJIB berkualitas tinggi standar industri, terstruktur rapi, dan BERSIH TOTAL TANPA KOMENTAR (Zero Comments). Hapus seluruh komentar `//` dan `/* */` yang masih tersisa di seluruh berkas repositori. Semua file wajib berstatus production-ready tanpa ada sampah catatan pengembang atau kode yang dikomentari.

4. Protokol Anti-Chit-Chat & Zero Mid-Turn Interruptions:
- DILARANG KERAS membalas pesan obrolan dengan penjelasan panjang lebar, laporan perantara, atau pertanyaan sepele di tengah proses eksekusi.
- Jangan berhenti untuk meminta izin pada detail teknis yang sudah jelas panduannya di Bab 13 dan 14 PRD.
- Terapkan siklus swakoreksi mandiri (self-healing loop): jika kode gagal diuji atau terjadi error sintaks, perbaiki sendiri secara otonom di latar belakang.

5. Cakupan Eksekusi Wajib (Berdasarkan Matriks Bab 14 PRD):
- [!] PEMBERSIHAN TOTAL: Hapus form lama 'https://server-anda', antrean ekspor lama di `index.html` & `connect.js`, serta kunci router 2 model di `model-sheet.js`.
- [!] PEMBERSIHAN KOMENTAR GLOBAL: Hapus seluruh komentar di 40+ file repositori (`js/`, `shared/`, `raget/`, `vault/`, `api/`, `css/`) hingga nol komentar.
- [ ] PEMBUATAN MODUL BARU: Bangun `connector-hub.js`, `connector-state.js`, Vercel serverless OAuth/API endpoints, `docx-local.js`, `zip-local.js`, dan `artifact-card.js`.
- [~] PENYAMBUNGAN UI KE MESIN: Hubungkan Active Mode Chips di `#attach-row`, sambungkan `#sheet-slide` langsung ke `pptx-local.js`, aktifkan importir di Koleksi, dan pasang runner Pyodide di Studio Kode.
- [✓] INTEGRITAS AKHIR: Jalankan kembali linter dan unit testing suite hingga 100% hijau/lulus tanpa warning.

6. Format Laporan Akhir Tunggal (Final Deliverable Only):
Hanya berikan balasan teks SATU KALI SETELAH SELURUH PEKERJAAN SELESAI TUNTAS 100%, dengan format laporan padat:
- Daftar Berkas Baru yang Dibuat.
- Daftar Berkas yang Dimodifikasi/Dibersihkan.
- Bukti Eksekusi Pengujian (Log output linter & unit tests).
- Panduan Singkat Uji Coba Antarmuka Langsung (Live Testing Checklist).
## 15.3 Aturan Swakoreksi & Toleransi Kegagalan (Self-Healing Loop)
Agen dilarang menyerah saat menemui kendala eksekusi. Jika pustaka browser (misalnya generator ZIP/Word) memicu konflik sintaks atau tipe data biner, agen diwajibkan:
Menganalisis pesan error secara lokal di terminal runtime.
Melakukan fallback ke struktur OpenXML / ArrayBuffer murni standar peramban.
Memastikan fungsi pembungkus (wrapper) memiliki penanganan error try...catch yang ramah pengguna.
Melanjutkan ke tugas berikutnya tanpa menunda atau menghentikan alur maraton.
## 15.4 Kriteria Penutupan Mandat (Handover Gate)
Sesi kerja maraton 90–180 menit dinyatakan tuntas dan berhak menyerahkan hasil hanya jika:
Seluruh 52 item pada Bab 14 terverifikasi statusnya.
Tidak ada broken links, variabel tak terdefinisi (undefined globals), atau error konsol pada antarmuka utama (index.html).
Seluruh unit test lulus secara otomatis.

# 16. BAB 16: SPESIFIKASI MESIN EKSEKUSI LATAR BELAKANG & LIVE THOUGHT STREAMING (AUTONOMOUS AGENT HARNESS)
Cetak biru arsitektur teknis definitif untuk mengimplementasikan kemampuan eksekusi otonom di latar belakang (client-side background execution) dan pelaporan status kerja secara langsung (live thought streaming) pada antarmuka Rategoan (mengadopsi standar industri kelas dunia seperti Grok Build, Manus AI, dan Devin) dengan jaminan 100% bebas biaya server dan nir-pembekuan antarmuka (zero UI freeze).
## 16.1 Pengenalan & Terminologi Baku AI Engineering
Di industri rekayasa agen kecerdasan buatan modern, eksekusi latar belakang didefinisikan melalui tiga pilar konseptual:
Long-Horizon Autonomous Agent (Agen Otonom Horison Panjang):
Sistem agen yang mampu mengeksekusi serangkaian tugas berdurasi panjang (memindai puluhan berkas, menambang data, menjalankan sandbox kode, atau menyusun laporan multi-halaman) tanpa memerlukan konfirmasi manual pengguna pada setiap mikro-langkah.
Paradigma ReAct (Reasoning + Acting):
Siklus kognitif terpadu yang memisahkan antara proses penalaran internal (Reasoning) dan eksekusi alat (Acting):
Pikirkan (Thought) -> Panggil Alat (Action) -> Observasi Hasil (Observation) -> Pikirkan Langkah Berikutnya.
Live Execution Trace & Thought Streaming:
Komponen visual transparan yang memancarkan arus pemikiran (thoughts) dan telemetri tindakan secara real-time kepada pengguna, memberikan kepastian visual bahwa sistem sedang aktif bekerja dan mengeliminasi kecemasan sistem macet (UI freeze).
## 16.2 Anatomi Siklus Eksekusi Otonom 5 Tahap Tertutup
Setiap proses kerja latar belakang wajib mengikuti siklus 5 tahap linier tertutup:
16.3 Desain Arsitektur Teknis Client-Side Rategoan
No
Tahapan Siklus
File/Modul Penanggung Jawab
Deskripsi Operasional & Kontrak Kerja
1
Dekomposisi Target (Plan Breakdown)
js/agent/agent-worker.js
Membaca sasaran pengguna, menguraikan instruksi ke dalam daftar subtugas linier terukur (task queue), dan menetapkan batas iterasi (maks 30 siklus).
2
Inspeksi Lingkungan (Reconnaissance)
js/agent/agent-worker.js
Menelusuri dokumen aktif, membaca isi memori lokal (IndexedDB), atau memverifikasi kesiapan konektor eksternal.
3
Telemetri Berkelanjutan (Live Event Stream)
js/ui/thought-card.js
Memancarkan status mikro ke antarmuka pengguna setiap kali satu langkah kecil dimulai dan diselesaikan melalui Web Worker postMessage.
4
Siklus Swakoreksi (Self-Healing Loop)
js/agent/agent-worker.js
Menangkap galat eksekusi secara mandiri (misal: parsing gagal, format JSON tidak valid), lalu mencoba strategi alternatif tanpa menginterupsi pengguna.
5
Serah Terima Akhir (Final Handover)
js/chat/chat.js
Menutup thread latar belakang, menyegel log akordeon Thoughts, dan merender jawaban atau artefak akhir ke obrolan pengguna.

### 16.3.1 Peta Berkas Fisik Target Implementasi
Berkas Baru:
js/agent/agent-worker.js: Modul Web Worker native yang mengeksekusi loop penalaran ReAct di thread terpisah.
js/ui/thought-card.js: Modul perender kartu akordeon dinamis dan pengelola event streaming di DOM utama.
css/ui/thought.css: Gaya tata letak modern, indikator denyut (pulse animation), transisi lipat, dan palet warna dark/light mode.
Kait Integrasi Berkas Eksisting:
js/chat/composer.js: Mendeteksi sakelar toggle #sheet-think (role="switch") untuk memicu pengiriman pesan via mode agen latar belakang.
js/chat/chat.js: Menyisipkan komponen .thought-accordion ke dalam kontainer #messages tepat sebelum respon balasan AI (typeReply).
index.html: Penautan lembar gaya <link rel="stylesheet" href="css/ui/thought.css">.
### 16.3.2 Kontrak Data Telemetri & Struktur Event (Activity Event Protocol)
Komunikasi antara Web Worker dan Thread Utama menggunakan struktur pesan berbasis event standar:
EMIT_THOUGHT: Untuk penalaran dan perumusan langkah (ikon lightbulb, indikator denyut).
EMIT_COMMAND: Untuk eksekusi kode internal dan linter (ikon terminal, format monospace).
EMIT_EXPLORE: Untuk pemindaian direktori dan pembacaan berkas (ikon search, badge hitungan).
EMIT_ACTION: Untuk penulisan berkas dan pembuatan artefak (ikon edit, status aktif).
EMIT_STATUS: Untuk pembaruan persentase kemajuan tugas (ikon chart, progress bar).
EMIT_ERROR: Untuk galat non-fatal yang sedang di-swakoreksi (ikon alert, peringatan kuning).
### 16.3.3 Desain Komponen Antarmuka Pengguna: Collapsible "Thoughts" Accordion
Saat Berjalan (.thought-accordion.running): Akordeon otomatis terbuka penuh (expanded), teks aktivitas terbaru mengalir dengan animasi denyut (pulsing dot), dan kontainer otomatis menggulir ke bawah mengikuti aktivitas terkini.
Saat Tuntas (.thought-accordion.completed): Akordeon secara halus menciut (auto-collapse) menjadi bilah pil ringkas satu baris, misalnya: ▶ Selesai dalam 3,2 dtk · 14 berkas ditelusuri · 2 aksi dijalankan (Ketuk untuk detail). Pengguna dapat mengetuk kartu tersebut kapan saja untuk membuka kembali audit trail lengkap.
### 16.3.4 Penyimpanan Jejak Sesi Persisten di IndexedDB
Untuk memastikan riwayat proses kerja tidak hilang saat pengguna melakukan refresh halaman atau berpindah tab:

Format Data: Menyimpan ID sesi, ID pesan obrolan, target instruksi, status eksekusi, larik rekaman tahapan telemetri (steps array), metrik waktu eksekusi, serta stempel waktu mulai dan selesai.
## 16.4 Protokol Keamanan, Watchdog Timer, dan Toleransi Kegagalan (Resilience Guardrails)
Watchdog Timer (Batas Anti-Gantung): Setiap langkah memiliki batas waktu (step timeout) maksimal 45 detik. Jika worker tidak memancarkan pesan selama 45 detik, sistem otomatis memicu swakoreksi atau menandai tugas sebagai kedaluwarsa guna mencegah pemborosan baterai perangkat mobile.
Interupsi & Pembatalan Otonom (Abort Capability): Tombol stop pada antarmuka (#btn-stop) langsung mengeksekusi agentWorker.terminate(), mengubah status kartu menjadi Dibatalkan oleh Pengguna, dan mengembalikan fokus antarmuka ke mode input biasa.
Graceful Fallback (Kompatibilitas Peramban Lawas): Jika peramban pengguna tidak mengizinkan inisialisasi Web Worker modul, sistem secara transparan mengalihkan eksekusi ke generator fungsi asinkron pada thread utama via setTimeout(0) atau requestIdleCallback sehingga antarmuka tetap berjalan tanpa error.
## 16.5 Nilai Strategis & Kriteria Keberhasilan Implementasi (Definition of Done)
Zero UI Freeze: Beban komputasi parsing regex, pemindaian teks tebal, dan perumusan rencana tidak menyebabkan drop frame (60 FPS tetap terjaga).
Transparansi Penuh (Zero Mystery AI): Pengguna selalu mengetahui apa yang dilakukan agen di setiap detik kerja.
Auditabilitas Total: Tersedia rekaman kronologis lengkap dari setiap pemanggilan alat dan keputusan logika yang diambil sistem.Nama Store: agent_runs pada IndexedDB rategoan_db.
# 17. AUDIT KOMPREHENSIF KEKURANGAN, KELEMAHAN SISTEM & CETAK BIRU PENYEMPURNAAN (IMPROVEMENT MATRIX) RATEGOAN
Bagian ini merupakan hasil audit teknis mendalam terhadap implementasi fisik basis kode Rategoan (Oktober 2026), memetakan secara presisi seluruh jurang fungsional (gaps), kerapuhan arsitektural (fragilities), titik friksi pengalaman pengguna (UX friction points), serta cetak biru spesifikasi teknis penyempurnaan yang wajib dieksekusi oleh GROK BUILD secara otonom.

## 17.1 Analisis Kekurangan Kritis (Critical Gaps & Missing Capabilities)
Berdasarkan penelusuran menyeluruh pada modul-modul sistem, ditemukan 5 kekurangan fungsional utama yang belum terpenuhi:
### 1. Keterbatasan Lampiran Tunggal pada Komposer (Single-Attachment Bottleneck)
Kondisi Eksisting: Berkas js/sheets/attach.js hanya mengelola objek tunggal (this.current = { name, type, size, thumb, ... }). Jika pengguna memilih berkas kedua, berkas pertama langsung tertimpa dan terhapus dari memori komposer.
Dampak: Pengguna tidak dapat membandingkan dua dokumen (misal: membandingkan draf kontrak A dan B), tidak dapat mengunggah gambar pendukung bersamaan dengan data CSV, atau tidak dapat menyertakan beberapa berkas referensi sekaligus.
Kebutuhan Produk: Komposer wajib mendukung attachments: [] (multi-file chip hingga 5 berkas sekaligus) dengan tombol hapus per berkas, indikator tipe berkas, dan ekstraksi teks simultan.
### 2. Ketiadaan Isolasi Konteks & Instruksi Kustom Proyek (Project Context & System Prompt Gaps)
Kondisi Eksisting: Berkas js/state/workspace.js hanya menyimpan metadata dangkal { id, name, created }. Riwayat obrolan (rategoan_history) bersifat global flat, dan tidak ada kaitan antara obrolan aktif dengan proyek yang dipilih.
Dampak: Pengguna tidak memiliki ruang kerja terisolasi. Jika pengguna sedang mengerjakan proyek riset hukum, agen tidak memiliki memori instruksi khusus (misal: "Gunakan bahasa hukum formal dan sertakan pasal KUHP"), dan berkas referensi harus diunggah ulang setiap sesi obrolan baru.
Kebutuhan Produk: Setiap entitas proyek harus memiliki:
systemPrompt: Instruksi perilaku kustom per proyek.
pinnedFiles: Berkas rujukan permanen yang langsung diindeks ke dalam BM25/PPMI Retrieval proyek.
sessionIds: Daftar obrolan yang terafiliasi dengan proyek tersebut.
Selector aktif di Topbar Chat yang menunjukkan proyek yang sedang berjalan.
### 3. Ketiadaan Pratinjau Interaktif Slide & Visualisasi Grafik Native (Interactive Preview & Charting Gaps)
Kondisi Eksisting: Ketika agen menghasilkan presentasi (.pptx), pengguna hanya disajikan kartu tombol unduh statis. Pengguna tidak bisa melihat isi slide sebelum mengunduh. Tidak ada pula kemampuan merender grafik statistik (diagram batang, garis, lingkaran).
Dampak: Pengalaman visual tertinggal dibanding Claude Artifacts yang menampilkan live rendering langsung di samping obrolan.
Kebutuhan Produk:
Live Slide Deck Carousel Viewer di dalam panel artefak (js/ui/artifact.js) yang memungkinkan pengguna menggeser dan membaca pratinjau slide secara visual.
Generator grafik SVG murni (Native SVG Chart Engine) tanpa dependensi eksternal untuk diagram batang (bar chart), garis (line chart), dan lingkaran (pie chart).
### 4. Ketiadaan Fitur Pencarian Cepat Dalam Obrolan (In-Chat Search Bar)
Kondisi Eksisting: Menu #btn-chat-search di topbar obrolan belum terhubung dengan bilah pencarian aktif yang dapat melakukan penyorotan (highlighting) kata kunci kuning pada pesan chat dan navigasi lompat pesan (Next/Prev).
Dampak: Pada percakapan panjang dengan 50+ giliran pesan, pengguna kesulitan mencari kembali rumus, kode, atau jawaban penting sebelumnya.
Kebutuhan Produk: Bilah pencarian melayang (floating search bar) dengan input teks, tombol navigasi hasil pencarian [<] [>], dan penyorotan tag <mark> pada elemen DOM pesan yang cocok.
### 5. Ketiadaan Enkripsi Token & Diagnostik Mandiri pada Konektor Cloud
Kondisi Eksisting: Token otorisasi OAuth pada js/connectors/connector-state.js disimpan dalam localStorage mentah. Belum ada tombol uji koneksi (Ping / Health Check) untuk memverifikasi validitas token tanpa memicu prompt AI.
Dampak: Risiko keamanan terhadap script berbahaya di peramban, serta ketidakpastian pengguna apakah integrasi Google Drive atau GitHub masih aktif atau sudah kedaluwarsa.
Kebutuhan Produk: Enkripsi token menggunakan Web Crypto API (SubtleCrypto AES-GCM) serta tombol Uji Sambungan pada modal Connector Explorer.
## 17.2 Analisis Kelemahan Sistem & Titik Friksi UX (Architectural Fragilities & Friction Points)
### 1. Ketiadaan Eksekusi Thread Latar Belakang (Main-Thread UI Freezing)
Akar Masalah: Meskipun Bab 16 PRD mendesain arsitektur Web Worker (js/agent/agent-worker.js), berkas ini belum diwujudkan di repositori. Akibatnya, seluruh pipeline komputasi (pencarian teks BM25 pada dokumen tebal, parsing XML Docx/Zip, kalkulasi rumus rumit, dan kompilasi template) berjalan langsung pada UI Thread utama peramban.
Manifestasi: Pada ponsel pintar spesifikasi menengah ke bawah, peramban mengalami stutter (jank), animasi loading terputus-putus, dan tombol kirim membeku selama 1-3 detik saat memproses kueri berat.
Solusi Mutlak: Wajib merealisasikan js/agent/agent-worker.js dan memindahkan seluruh beban komputasi berat ke worker thread dengan pola komunikasi non-blocking postMessage.
### 2. Tabrakan Keyboard Virtual pada Antarmuka Ponsel (Mobile Visual Viewport Collision)
Akar Masalah: Pada peramban mobile (Chrome Android & Safari iOS), pemunculan keyboard virtual mengubah tinggi area pandang (window.innerHeight), namun kontainer #chat-messages dan composer #composer sering kali tidak mengimbangi perubahan tinggi tersebut secara dinamis.
Manifestasi: Kotak input teks tertutup oleh keyboard virtual sehingga pengguna mengetik secara buta (blind typing), atau pesan terakhir tersembunyi di bawah komposer.
Solusi Mutlak: Mengimplementasikan pemantauan window.visualViewport di js/chat/composer.js untuk secara otomatis mengatur padding bawah dan menggulirkan pesan terakhir ke area pandang aktif saat keyboard muncul.
### 3. Desinkronisasi Tombol Kembali Ponsel (Android Physical Back Button Broken Navigation)
Akar Masalah: Navigasi antar halaman (Chat -> Pengaturan -> Studio -> Konektor) mengandalkan perubahan location.hash langsung tanpa manajemen history.pushState yang rapi.
Manifestasi: Ketika pengguna membuka Studio Kode atau Pengaturan lalu menekan tombol Back fisik/gesture ponsel Android, peramban justru keluar dari web atau melompat tak terduga, alih-alih kembali ke tampilan Obrolan (view-chat).
Solusi Mutlak: Standardisasi js/core/router.js dengan history.pushState dan listener window.addEventListener('popstate') terpadu.
### 4. Ketiadaan Riwayat Versi Artefak (Artifact Version Overwrite)
Akar Masalah: Setiap kali pengguna meminta perbaikan kode atau dokumen yang sama, artefak baru menimpa artefak lama di memori tanpa mencatat riwayat perubahan.
Manifestasi: Pengguna tidak dapat membatalkan revisi atau membandingkan perbedaan (diff) antara draf pertama dan draf kedua.
Solusi Mutlak: Struktur data artefak wajib menyertakan array versions: [{ version: 1, content, timestamp }] dan dropdown pemilih versi pada header artefak.
### 5. Penumpukan Cache & Ketiadaan Notifikasi Pembaruan PWA
Akar Masalah: Berkas sw.js menyimpan berkas di CacheStorage tanpa kebijakan rotasi umur berkas (TTL) dan tidak menyiarkan event pembaruan ketika versi baru dideploy ke Vercel.
Manifestasi: Pengguna lama sering kali masih melihat kode antarmuka lama hingga mereka menghapus cache secara manual.
Solusi Mutlak: Tambahkan event updatefound pada registrasi Service Worker di js/main.js yang memunculkan banner toast halus: "Versi baru Rategoan tersedia. Ketuk untuk memuat ulang."
## 17.3 Spesifikasi Teknis Cetak Biru Penyempurnaan untuk Grok Build
Grok Build diinstruksikan untuk mengimplementasikan modul-modul penyempurnaan berikut secara terstruktur:
### Spesifikasi 1: Multi-Attachment Engine (js/sheets/attach.js)
Struktur State: Ubah properti attach.current menjadi attach.files: [] (array objek berkas, maks 5 berkas).
Tampilan UI: Render kontainer .attach-chip-list horizontal scrollable di atas komposer. Tiap chip menampilkan ikon tipe berkas, nama berkas terpotong rapi, ukuran, dan tombol silang (x).
Pemrosesan Paralel: Gunakan Promise.all saat membaca beberapa berkas sekaligus (PDF, DOCX, TXT, Gambar).
Integrasi Pipeline: Masukkan teks dari seluruh berkas terlampir ke dalam payload giliran obrolan dengan pembatas jelas:
[Berkas 1: laporan.docx]
...isi...

[Berkas 2: data.csv]
...isi...
### Spesifikasi 2: Project Studio & Knowledge Isolation (js/state/workspace.js & js/project/project.js)
Skema Proyek Diperluas:
{
id: string,
name: string,
description: string,
systemPrompt: string,
pinnedFiles: [{ id, name, textContent, type }],
sessions: [sessionId],
created: number,
updated: number
}
Integrasi Chat: Saat proyek aktif dipilih, ai.js secara otomatis menyisipkan project.systemPrompt ke dalam konteks penalaran dan memasukkan ringkasan pinnedFiles ke dalam memori kerja turn-pipeline.
UI Indikator Proyek di Topbar: Tampilkan badge pil di samping judul aplikasi saat berada di dalam proyek aktif: [Proyek: Nama Proyek] (x) yang dapat diklik untuk membuka ringkasan proyek.
### Spesifikasi 3: Live Slide Carousel & Native SVG Chart Engine
Carousel Viewer (js/ui/artifact.js):
Buat wadah .slide-carousel dengan rasio 16:9, tombol navigasi [<] dan [>], serta penomoran slide Slide X / Y.
Parsing teks slide dari sintesis OpenXML/JSON untuk menampilkan elemen judul, bullet point, dan nomor slide secara visual dengan tipografi rapi sebelum diekspor ke .pptx.
Native SVG Chart Generator (shared/charts-local.js):
Modul mandiri tanpa library luar yang menerima JSON:
{ type: 'bar' | 'line' | 'pie', title: string, labels: [], datasets: [{ label, data: [] }] }
Menghasilkan string <svg ...> responsif yang dapat langsung dipratinjau di panel artefak dan diunduh sebagai berkas .svg atau disalin ke clipboard.
### Spesifikasi 4: Mobile Ergonomics & Viewport Resilience
In-Chat Search Bar (js/chat/chatsearch.js & css/chat/search.css):
Bilah mengambang di atas list pesan dengan input pencarian, tombol navigasi atas/bawah, counter pencocokan (misal 3 dari 12), dan tombol tutup (x).
Melakukan highlight kata kunci pada elemen pesan .msg-text tanpa merusak rendering markdown atau blok kode.
Viewport Resize Handler (js/chat/composer.js):
if (window.visualViewport) {
window.visualViewport.addEventListener('resize', () => {
const offset = window.innerHeight - window.visualViewport.height;
document.documentElement.style.setProperty('--keyboard-offset', offset + 'px');
if (offset > 100) scrolldown.toBottom(false);
});
}
Unified Popstate Handler (js/core/router.js):
Setiap perpindahan router.go(view) memanggil history.pushState({ view }, '', '#/' + view).
Pada event popstate, jika berada di luar chat, kembalikan ke view-chat dengan mulus tanpa menutup aplikasi.
### Spesifikasi 5: Web Worker Long-Horizon Engine (js/agent/agent-worker.js)
Berkas Dedicated Worker:
Mengisolasi kalkulasi berat (BM25 search, regex tokenizing, deep retrieval, template resolution) ke dalam Worker.
Menerbitkan event berkala: THINKING_CHUNK, TOOL_CALL_START, TOOL_CALL_FINISH, FINAL_RESPONSE.
Watchdog Resilience:
Jika worker tidak merespons dalam 15 detik, picu timeout event, hentikan worker dengan worker.terminate(), lakukan fallback ke respons deterministik aman, dan inisialisasi ulang worker baru.
## 17.4 Pembaruan Matriks Pelacak Kerja Bab 14 (Item Tambahan 55 s/d 70)
Berikut daftar tugas tambahan yang wajib masuk ke dalam Living Execution Tracker untuk dikerjakan oleh Grok Build:
No
Modul Target
Nama Fitur / Tugas
Status
55
js/sheets/attach.js
Multi-Attachment Engine (Mendukung hingga 5 berkas simultan dengan preview chip)
Siap Dikerjakan
56
css/chat/composer.css
Penataan layout multi-chip lampiran horizontal dengan scroll halus
Siap Dikerjakan
57
js/state/workspace.js
Skema Proyek Lanjut (System Prompt kustom, Pinned Files, Session Isolation)
Siap Dikerjakan
58
js/project/project.js
Antarmuka Pengelolaan Proyek Terpadu (Editor prompt, daftar berkas sematan)
Siap Dikerjakan
59
js/chat/chatsearch.js
Bilah Pencarian Pesan Dalam Obrolan dengan penyorotan teks kuning dan panah lompat
Siap Dikerjakan
60
css/chat/search.css
Gaya visual bilah pencarian mengambang dan penandaan <mark> pesan chat
Siap Dikerjakan
61
shared/charts-local.js
Native SVG Chart Engine (Pembuat diagram batang, garis, lingkaran berbasis vektor)
Siap Dikerjakan
62
js/ui/artifact.js
Live Slide Deck Carousel Viewer (Pratinjau visual presentasi 16:9 sebelum unduh)
Siap Dikerjakan
63
js/ui/artifact.js
Artifact Versioning Engine (Riwayat versi draf artefak v1, v2, v3 dengan pemilih)
Siap Dikerjakan
64
js/agent/agent-worker.js
Pembuatan berkas Web Worker otonom untuk isolasi komputasi dari UI Thread
Siap Dikerjakan
65
js/agent/worker-bridge.js
Jembatan komunikasi event bus antara UI chat dengan Web Worker
Siap Dikerjakan
66
js/chat/composer.js
Integrasi Visual Viewport API untuk mencegah komposer tertutup keyboard mobile
Siap Dikerjakan
67
js/core/router.js
Sinkronisasi History API & Popstate untuk penanganan tombol Back fisik Android
Siap Dikerjakan
68
js/connectors/connector-state.js
Enkripsi Token OAuth lokal menggunakan Web Crypto API (SubtleCrypto AES-GCM)
Siap Dikerjakan
69
js/connectors/connector-explorer.js
Tombol Diagnostik 'Uji Sambungan' (Ping API) pada dialog konektor
Siap Dikerjakan
70
sw.js & js/main.js
Deteksi Pembaruan Versi PWA dengan Banner Toast 'Ketuk untuk Memuat Ulang'
Siap Dikerjakan
## 17.5 Pembaruan Mandat Eksekusi Grok Build (Master Directive Update)
Grok Build diinstruksikan untuk menjalankan siklus pengembangan maraton senyap dengan prioritas kerja berikut:
Prioritas 1 (Kestabilan & Ergonomi Ponsel): Selesaikan Item 66 (Viewport Keyboard), Item 67 (Popstate Back Button), dan Item 55-56 (Multi-Attachment Engine).
Prioritas 2 (Performa & Thread Latar Belakang): Realisasikan Item 64-65 (agent-worker.js dan jembatan event bus) agar UI thread bebas dari pembekuan (freeze).
Prioritas 3 (Fitur Unggulan Proyek & Visual): Selesaikan Item 57-58 (Project Studio & Custom Prompts), Item 59-60 (In-Chat Search Bar), dan Item 61-63 (Slide Carousel & SVG Charts).
Prioritas 4 (Keamanan & Ketahanan Sistem): Implementasikan Item 68-70 (Enkripsi Token OAuth, Uji Sambungan Konektor, dan Notifikasi Pembaruan PWA).
# 18. DOKUMENTASI RESMI TEMUAN TANGKAPAN LAYAR PENGGUNA & SPESIFIKASI RESOLUSI DEFEK (USER SCREENSHOT DEFECTS RESOLUTION)
Bagian ini mendokumentasikan secara eksplisit dan rinci 3 (tiga) temuan masalah nyata yang dilaporkan pengguna melalui tangkapan layar (screenshot) antarmuka Rategoan pada perangkat mobile. Masalah-masalah ini merupakan prioritas perbaikan mendesak yang wajib dieksekusi oleh GROK BUILD hingga tuntas sesuai spesifikasi di bawah ini.

## 18.1 Masalah Screenshot 1: Ketiadaan Ikon/Gambar Resmi Aplikasi pada Halaman Konektor (#view-connect)
### A. Deskripsi & Gejala Visual yang Dilaporkan Pengguna
Keluhan Pengguna: "Halaman konektor kok gak ada gambar setiap aplikasinya. Soalnya di login sebelumnya sudah ada gambar Google-nya."
Tampilan Layar Bermasalah: Seluruh kartu layanan konektor (Google Drive, GitHub, Gmail, Google Calendar, Web Search, Local Sandbox) hanya menampilkan kotak abu-abu polos dengan 1 huruf pertama nama layanan di dalamnya (misal: "G" untuk Google Drive, "G" untuk GitHub, "G" untuk Gmail, "G" untuk Google Calendar, "W" untuk Web Search, "S" untuk Sandbox). Tidak ada identitas visual grafis/brand sama sekali.
### B. Analisis Akar Masalah Teknis (Root Cause)
Pada berkas js/connectors/connector-hub.js di dalam fungsi pembuatan kartu card(root, id, svc):
const mark = el('span', 'hub-mark', (svc.display_name || id).slice(0, 1));
Implementasi tersebut hanya memotong huruf depan nama layanan dan memasukkannya ke dalam teks polos hub-mark. Sistem belum mendefinisikan peta visual ikon vektor (SVG) untuk masing-masing ID layanan eksternal.
### C. Spesifikasi Solusi Mutlak untuk GROK BUILD
Definisi Peta Vektor CONNECTOR_ICONS di js/connectors/connector-hub.js:
Wajib mendefinisikan kamus ikon SVG resmi berukuran 24x24 px dengan viewbox proporsional:
google_drive: Vektor SVG resmi 4 warna Google Drive (#0066da, #00ac47, #ffba00, #ea4335).
github: Vektor SVG resmi siluet Octocat/Invertocat GitHub (fill="currentColor").
gmail: Vektor SVG resmi amplop 'M' Google Mail 4 warna (#4285F4, #EA4335, #FBBC05, #34A853).
google_calendar: Vektor SVG resmi Google Calendar biru dengan tanggal 31 di tengah dan strip merah di atas.
web_search_reader: Vektor SVG bola dunia jaringan biru laut (#0284c7) dengan latar lingkar #e0f2fe.
local_sandbox: Vektor SVG konsol terminal prompt kode indigo (#4f46e5) dengan latar kartu #eef2ff.
Penyisipan Ikon pada DOM Kartu:
const mark = el('span', 'hub-mark');
if (CONNECTOR_ICONS[id]) {
mark.innerHTML = CONNECTOR_ICONS[id];
} else {
mark.textContent = (svc.display_name || id).slice(0, 1);
}
Styling Wadah Ikon (css/ui/connect.css):
.hub-mark {
width: 42px;
height: 42px;
flex: none;
border-radius: 12px;
display: flex;
align-items: center;
justify-content: center;
background: var(--rg-surface-2, #f8f9fa);
border: 1px solid var(--rg-line, #eef0f3);
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}
.hub-mark svg {
display: block;
}
## 18.2 Masalah Screenshot 2: Tata Letak Halaman Konektor yang Berantakan pada Layar Ponsel
### A. Deskripsi & Gejala Visual yang Dilaporkan Pengguna
Keluhan Pengguna: "Halaman konektor masih berantakan."
Tampilan Layar Bermasalah:
Badge Jumlah Alat Terlipat Aneh: Label jumlah alat (seperti 4 alat atau 11 alat) terdesak di layar ponsel sempit sehingga teks terlipat secara vertikal (angka di atas, kata 'alat' di bawah) di dalam lingkaran oval yang lonjong dan tidak enak dipandang.
Tombol Status Hanyalah Teks Mentah: Sisi kanan kartu hanya menampilkan tulisan teks biru polos mengambang ("Hubungkan", "Bawaan", "Kelola") tanpa bingkai tombol atau indikator interaktif yang jelas.
Perataan Kartu Tidak Seimbang: Baris kartu menggunakan perataan tengah vertikal sehingga saat nama atau deskripsi panjang melipat ke baris baru, letak ikon di kiri dan teks di kanan menjadi turun ke tengah secara asimetris.
Toggle Switch dan Kotak Pencarian Tidak Standar: Kontainer penemuan otonom di atas dan input pencarian tidak rapi serta belum terpadu dengan komponen antarmuka Rategoan lainnya.
### B. Analisis Akar Masalah Teknis (Root Cause)
.hub-badge tidak memiliki deklarasi white-space: nowrap; dan flex-shrink: 0;.
.hub-card-title menggunakan display: flex; tanpa flex-wrap: wrap;, memaksa badge tertekan saat judul aplikasi panjang.
.hub-card menggunakan align-items: center; alih-alih align-items: flex-start;.
Tombol aksi di sisi kanan (.hub-card-side) tidak memiliki kelas tombol bergaya pil (pill button).
### C. Spesifikasi Solusi Mutlak untuk GROK BUILD
Perbaikan Tata Letak Kartu di css/ui/connect.css:
.hub-card {
display: flex;
align-items: flex-start;
gap: 12px;
width: 100%;
text-align: left;
padding: 14px 16px;
border: 0;
border-bottom: 1px solid var(--rg-line, #f0f2f5);
background: transparent;
cursor: pointer;
transition: background 0.15s ease;
}
.hub-card-body {
flex: 1;
min-width: 0;
display: flex;
flex-direction: column;
gap: 3px;
}
.hub-card-title {
display: flex;
align-items: center;
flex-wrap: wrap;
gap: 8px;
line-height: 1.35;
}
.hub-card-name {
font-size: 14px;
font-weight: 600;
color: var(--rg-text, #111827);
}
.hub-badge {
display: inline-flex;
align-items: center;
white-space: nowrap;
font-size: 11px;
font-weight: 500;
color: var(--rg-muted, #5c6570);
background: var(--rg-surface-2, #f1f3f5);
border: 1px solid var(--rg-line, #e5e7eb);
border-radius: 999px;
padding: 2px 7px;
line-height: 1.25;
flex-shrink: 0;
}
.hub-card-desc {
font-size: 12px;
color: var(--rg-muted, #6b7280);
line-height: 1.45;
margin-top: 2px;
}
Standardisasi Tombol Aksi di Sisi Kanan (.hub-card-side):
Tombol "Hubungkan": Terapkan kelas .hub-btn-connect dengan gaya pil biru muda yang mengundang klik (background: #eef5fd; color: #1a73e8; border: 1px solid #cce1fb; padding: 6px 14px; border-radius: 999px; font-weight: 600; font-size: 12px;).
Label "Bawaan": Terapkan kelas .hub-tag-builtin dengan gaya badge netral abu-abu halus (background: var(--rg-surface-2); color: var(--rg-muted); padding: 4px 10px; border-radius: 999px; font-size: 11px;).
Tombol "Kelola": Terapkan kelas .hub-btn-manage dengan gaya outline rapi (background: var(--rg-surface-2); color: var(--rg-text); border: 1px solid var(--rg-line); padding: 6px 14px; border-radius: 999px; font-size: 12px;).
Tombol "Putuskan": Terapkan tombol teks merah halus .hub-btn-disconnect yang terletak rapi di bawah tombol kelola.
Standardisasi Kontainer Pencarian & Toggle Otonom:
Kotak pencarian menggunakan pembungkus .hub-search-box berikon SVG kaca pembesar dan input teks .hub-search-input.
Baris toggle penemuan otonom (.hub-toggle) dirancang sebagai kartu bersih dengan judul tebal Penemuan konektor otonom, subjudul penjelasan abu-abu, dan tombol switch modern .hub-switch.on.
## 18.3 Masalah Screenshot 3: Navigasi Menu "Studio kode" Tidak Otomatis Menutup Sidebar Drawer
### A. Deskripsi & Gejala Visual yang Dilaporkan Pengguna
Keluhan Pengguna: "Kalau saya klik studio kode kenapa gak langsung ke halamannya.. seharusnya langsung nutup otomatis seperti yang lainnya."
Tampilan Layar Bermasalah: Ketika pengguna membuka menu samping (Sidebar Drawer) lalu mengetuk pilihan "Studio kode", URL hash berubah menjadi #/studio dan tampilan Studio termuat di latar belakang, namun panel samping hitam/overlay menu tidak menutup. Pengguna tetap terjebak melihat menu samping dan harus mengetuk area luar backdrop secara manual untuk melihat halaman Studio.
### B. Analisis Akar Masalah Teknis (Root Cause)
Pada berkas js/studio/studio.js:
Berkas ini tidak mengimpor modul drawer dari ../ui/drawer.js.
Pada penanganan klik tombol menu samping #btn-studio:
const side = $('btn-studio');
if (side) side.onclick = () => {
this.paint();
router.go('studio');
};
Pada metode publik open():
open() {
this.paint();
router.go('studio');
}
Di kedua blok kode di atas, fungsi drawer.close() tidak pernah dipanggil! Berbeda dengan berkas menu lain (misal #btn-new-chat, #btn-collection, #btn-project, #btn-connect, #btn-artifact, #btn-settings) yang semuanya secara eksplisit memanggil drawer.close() sebelum berpindah rute.
### C. Spesifikasi Solusi Mutlak untuk GROK BUILD
Tambahkan Impor drawer pada Baris Awal js/studio/studio.js:
import { drawer } from '../ui/drawer.js';
Panggil drawer.close() pada Event Listener #btn-studio:
const side = $('btn-studio');
if (side) side.onclick = () => {
drawer.close();
this.paint();
router.go('studio');
};
Panggil drawer.close() pada Metode open():
open() {
drawer.close();
this.paint();
router.go('studio');
},
## 18.4 Matriks Tugas Khusus Resolusi Masalah Screenshot di Bab 14 (Item 71, 72, 73)
Untuk memastikan pelacakan yang ketat tanpa kehilangan konteks, ketiga perbaikan di atas dimasukkan sebagai item tugas kanonikal:
No
Modul Target
Nama Fitur / Tugas
Status
71
js/connectors/connector-hub.js
Resolusi Screenshot 1: Integrasi Peta Vektor Resmi CONNECTOR_ICONS (Drive, GitHub, Gmail, Calendar, Search, Sandbox)
Wajib Dieksekusi
72
css/ui/connect.css & js/connectors/connector-hub.js
Resolusi Screenshot 2: Perbaikan Tata Letak Halaman Konektor, Lock White-Space Badge, Tombol Pil Aksi, dan Search Bar
Wajib Dieksekusi
73
js/studio/studio.js
Resolusi Screenshot 3: Integrasi drawer.close() pada Handler #btn-studio dan open() Studio Kode
Wajib Dieksekusi

# 19. SPESIFIKASI FITUR TINGKAT TINGGI GENERASI BERIKUTNYA (NEXT-GEN EXPANSION BLUEPRINT)
Bagian ini memformalkan 3 (tiga) pilar kemampuan mutakhir yang disepakati sebagai kebutuhan nyata pengguna modern: (1) Mesin Pemulihan Galat Mandiri & Fallback Otonom, (2) Bilah Perintah Terpadu Cepat (Unified Command Palette / Cmd+K), dan (3) Generator Laporan Siap Cetak & Diagram Vektor Native. Spesifikasi ini dirancang agar kerangka mesin Rategoan memiliki keandalan tingkat industri dan siap menerima integrasi model otak AI penuh tanpa hambatan teknis.

## 19.1 Mesin Pemulihan Galat Mandiri & Logika Fallback Otonom (Autonomous Self-Correction Engine)
### A. Latar Belakang & Filosofi
Pada sistem agen AI tradisional, kegagalan eksekusi alat (misal: sintaks kode Python error, batas kuota konektor terlampaui, berkas korup, atau token OAuth kedaluwarsa) biasanya langsung menghentikan giliran dan mencetak pesan galat kaku berwarna merah ke hadapan pengguna. Ini merusak kenyamanan dan menurunkan kepercayaan pengguna. Rategoan mengadopsi prinsip Resilient Agentic Self-Healing: mesin harus mampu mendeteksi kegagalan secara otonom, merefleksikan penyebabnya, melakukan satu kali upaya perbaikan otomatis (auto-retry with modified parameters), dan jika tetap terbentur batas, menyajikan kartu dialog klarifikasi yang ramah (Human-in-the-Loop Clarification Card).
### B. Spesifikasi Alur Kerja Self-Correction (raget/raget-agents/turn-pipeline.js & js/agent/agent-worker.js)
Loop Tangkap Galat Eksekusi (Execution Error Interceptor):
Setiap pemanggilan alat (alat konektor, eksekusi kode Pyodide/JS, sintesis berkas) dibungkus dalam blok pelindung try-catch.
Jika eksekusi alat melempar error, sistem tidak langsung memutus pipeline, melainkan merekam objek galat: { tool: string, error: string, attempt: number }.
Refleksi & Percobaan Perbaikan Mandiri (Single-Attempt Reflection & Auto-Fix):
Kasus Kode Error di Sandbox (Python/JS): Tangkap traceback error, susun ulang prompt internal: "Kode sebelumnya menghasilkan error berikut: [Traceback]. Analisis kesalahannya, perbaiki sintaksnya, dan jalankan kembali hanya blok kode yang telah dibetulkan."
Kasus Token Kedaluwarsa (HTTP 401): Jika pemanggilan API Google Drive/Gmail/GitHub mengembalikan 401, tangkap event rategoan:reconnect-required, tandai status konektor, dan beralih ke mode penjelasan santun bahwa izin akses perlu diperbarui.
Kasus Format Berkas Tidak Didukung: Jika pengguna melampirkan berkas yang gagal diekstraksi, mesin secara otomatis menawarkan membaca teks mentah fallback (plain-text raw dump) atau meminta format alternatif.
Kartu Dialog Klarifikasi (Human-in-the-Loop Card):
Jika setelah 1 kali percobaan perbaikan masalah masih belum terpecahkan, agen berhenti dengan elegan dan memunculkan kartu aksi interaktif berlatar lembut:
Deskripsi masalah dalam bahasa manusia awam (bukan stack trace teknis).
Dua atau tiga tombol opsi tindakan cepat (misal: [Coba Format Lain], [Lewati Langkah Ini], [Periksa Izin Konektor]).
## 19.2 Bilah Perintah Terpadu Cepat (Unified Command Palette — Cmd/Ctrl + K & Mobile Gesture)
### A. Latar Belakang & Filosofi
Pengguna modern membutuhkan akses instan tanpa harus mengklik menu berulang kali. Seperti pada platform produktivitas papan atas (Spotlight di macOS, Linear, Notion, Raycast), Rategoan menghadirkan Unified Command Palette: pusat kendali global yang dapat dipanggil dari mana saja dalam sekejap.
### B. Spesifikasi Teknis Komponen (js/ui/command-palette.js & css/ui/command-palette.css)
Pemicu Pemanggilan (Trigger Mechanism):
Desktop: Pintasan tombol global Cmd + K (macOS) atau Ctrl + K (Windows/Linux).
Mobile: Gestur usap dua jari ke bawah (two-finger swipe down) atau tombol ikon pencarian kilat di samping bilah judul Topbar.
Antarmuka & Pencarian Kilat (<10ms Fuzzy Search):
Modal mengambang dengan latar semi-transparan (glassmorphism backdrop blur).
Input teks terfokus otomatis dengan placeholder "Ketik perintah atau cari apa saja...".
Mengindeks data lokal secara real-time:
Navigasi Cepat: Buka Studio Kode, Buka Konektor, Buka Pengaturan, Buka Riwayat Koleksi.
Manajemen Proyek: Beralih ke Proyek: [Nama Proyek], Buat Proyek Baru.
Aksi Cepat AI: Ganti ke Mode Penalaran Berpikir Keras, Ganti Model ke Raget Neural, Buat Dokumen Word Baru, Buat Presentasi Baru.
Pencarian Riwayat Percakapan: Mencari judul sesi obrolan lama dan langsung melompat ke percakapan tersebut.
Navigasi Keyboard Penuh:
Tombol panah atas/bawah (↑ / ↓) untuk memilih hasil perintah.
Tombol Enter untuk mengeksekusi perintah terpilih.
Tombol Esc untuk menutup bilah perintah seketika.
## 19.3 Generator Laporan Siap Cetak & Diagram Vektor Native (Print-Ready Reports & Rich SVG Diagrams)
### A. Latar Belakang & Filosofi
Pekerjaan nyata pengguna sering kali menuntut hasil akhir yang siap dibagikan ke atasan, klien, dosen, atau rekan tim. Di samping berkas DOCX dan PPTX yang dapat disunting, pengguna sangat membutuhkan dokumen rangkuman berdesain rapi yang langsung siap dicetak ke PDF (Print-Ready HTML/PDF) serta diagram alur visual yang menjelaskan konsep rumit secara intuitif.
### B. Spesifikasi Generator Laporan Siap Cetak (shared/report-export.js)
Penyusunan Tata Letak Standar Dokumen Formal:
Sintesis dokumen HTML modular dengan styling CSS media print @media print.
Memuat kop dokumen formal, judul proyek, tanggal otomatis, penomoran halaman dinamis (Halaman X dari Y), dan penataan tabel data bersih.
Menggunakan tipografi resmi Rategoan: Fraunces Variable untuk heading elegan dan Plus Jakarta Sans untuk keterbacaan teks tubuh.
Mekanisme Ekspor 1-Klik:
Tombol "Cetak / Simpan PDF" pada kartu artefak obrolan membuka jendela pratinjau cetak browser (window.print()) dengan CSS khusus print yang menyembunyikan seluruh sidebar, header, dan elemen UI web, menghasilkan PDF bersih tanpa watermark.
### C. Spesifikasi Generator Diagram Vektor Native (shared/diagrams-local.js)
Mesin Sintesis Vektor Mandiri (Zero-Dependency):
Modul peramban murni tanpa dependensi library eksternal yang besar seperti Mermaid atau D3.
Menerima payload struktur data hierarkis sederhana:
{
type: 'flowchart' | 'sequence' | 'mindmap',
nodes: [{ id: 'A', label: 'Mulai', shape: 'pill' | 'rect' | 'diamond' }],
edges: [{ from: 'A', to: 'B', label: 'Alur 1' }]
}
Keluaran Visual Interaktif:
Menghasilkan string <svg viewBox="..." class="rategoan-diagram"> murni yang langsung disematkan pada kartu pesan chat atau panel artefak.
Dilengkapi fitur zoom dan geser visual (pan-and-zoom), tombol salin kode SVG, serta tombol unduh berkas .svg instan.
## 19.4 Matriks Tugas Khusus Bab 19 di Living Execution Tracker (Item 74 s/d 81)
No
Modul Target
Nama Fitur / Tugas
Status
74
raget/raget-agents/turn-pipeline.js
Interceptor Penanganan Galat & Mekanisme Self-Correction 1-Kali Percobaan Ulang
Siap Dikerjakan
75
js/ui/clarification-card.js
Kartu Dialog Klarifikasi Ramah Pengguna saat Eksekusi Alat Gagal
Siap Dikerjakan
76
js/ui/command-palette.js
Logika Bilah Perintah Terpadu Global (Cmd+K / Ctrl+K) & Indeks Fuzzy Cepat
Siap Dikerjakan
77
css/ui/command-palette.css
Tampilan Modal Mengambang Command Palette bergaya Glassmorphism Minimalis
Siap Dikerjakan
78
shared/report-export.js
Generator Laporan Formal Siap Cetak (HTML-to-Print PDF dengan Kop & Nomor Halaman)
Siap Dikerjakan
79
shared/diagrams-local.js
Mesin Diagram Vektor Native (Flowchart & Mindmap SVG Murni Zero-Dependency)
Siap Dikerjakan
80
js/ui/artifact.js
Integrasi Pratinjau Diagram Interaktif (Zoom, Pan, Ekspor SVG) di Panel Artefak
Siap Dikerjakan
81
js/chat/composer.js
Pintasan Pemanggilan Command Palette via Gestur Usap Layar Mobile
Siap Dikerjakan

# 20. LAPORAN SINKRONISASI EKSEKUSI GROK BUILD (COMMIT da23b7c) & REKONSILIASI STATUS OPERASIONAL
Bagian ini mencatat secara resmi pencapaian bridges fisik basis kode Rategoan yang telah berhasil diselesaikan oleh GROK BUILD pada repositori utama (main branch), commit hash da23b7c, mengacu pada direktif PRD Antarmuka Bab 16, 17, dan 18.

## 20.1 Rangkuman Fitur yang Telah Aktif di Aplikasi (Production Live)
Seluruh fitur berikut telah terverifikasi aktif, terhubung ke antarmuka, dan lulus pengujian integritas teknis (14/14 unit test pass):
Jejak Pikiran Otonom di Thread Terpisah (Web Worker ReAct Loop):
Eksekusi komputasi berat telah dipindahkan ke Web Worker latar belakang dengan kartu akordeon pemikiran interaktif yang dapat dilipat/dibuka (#thought-accordion), batas pengawas waktu (watchdog timer) 45 detik, dan kemampuan pembatalan instan melalui tombol Stop.
Multi-Attachment Engine (Hingga 5 Berkas Sekaligus):
Komposer obrolan kini mendukung pengunggahan simultan hingga 5 berkas (PDF, DOCX, CSV, TXT, dan gambar) dengan daftar chip horizontal interaktif dan tombol penghapusan per berkas.
Instruksi Khusus & Konteks Per Proyek (Project Studio):
Pengguna dapat menetapkan system prompt khusus untuk masing-masing proyek yang secara otomatis diinjeksi ke dalam penalaran model, dilengkapi isolasi sesi percakapan.
Pencarian Cepat Dalam Obrolan dengan Sorotan Kuning (In-Chat Search Bar):
Bilah pencarian pesan aktif dengan penyorotan teks <mark> warna kuning dan navigasi panah atas/bawah antar kecocokan kata kunci.
Generator Grafik Vektor Native (Batang, Garis, dan Lingkaran):
Mesin visualisasi grafik SVG murni (shared/charts-local.js) tanpa ketergantungan library eksternal, mampu merender data statistik langsung di dalam kartu obrolan.
Pratinjau Slide 16:9 & Riwayat Versi Artefak:
Wadah carousel pratinjau slide presentasi berasio standar 16:9 sebelum diunduh ke .pptx, serta pencatatan riwayat revisi artefak bertingkat (v1, v2, v3).
Resiliensi Antarmuka Mobile (Viewport Keyboard & Tombol Back Android):
Pencegahan komposer tertutup keyboard virtual melalui visualViewport listener, serta penanganan rute popstate agar tombol kembali fisik/gesture pada ponsel Android kembali ke obrolan secara alami tanpa menutup aplikasi.
Keamanan Konektor Cloud & Uji Sambungan (Diagnostics):
Token OAuth kini tersimpan dalam kondisi terenkripsi lokal menggunakan Web Crypto API, dilengkapi tombol interaktif 'Uji Sambungan' (Ping API) pada dialog konektor.
Resolusi Penuh 3 Masalah Tangkapan Layar (Screenshot Defects):
Peta ikon vektor resmi CONNECTOR_ICONS berwarna (Google Drive, GitHub, Gmail, Calendar, Search, Sandbox) telah aktif.
Tata letak kartu konektor telah diperbaiki dengan penguncian white-space: nowrap pada badge jumlah alat dan tombol pil aksi.
Menu "Studio kode" pada sidebar drawer kini otomatis menutup panel samping saat diklik.
Notifikasi Pembaruan PWA:
Banner toast pemberitahuan pembaruan versi aplikasi telah aktif saat ada pembaruan kode baru di server.

## 20.2 Catatan Kebijakan Teknis: Pengecualian Pembersihan Komentar (Item 53)
Keputusan Teknis: Mandat pembersihan komentar massal pada 98 berkas repositori DITAHAN SECARA SENGAJA (POLICY EXEMPTION).
Justifikasi Arsitektural: Analisis mendalam menunjukkan bahwa penyisiran regex otomatis terhadap komentar di modul shader grafis, parser formula, dan catatan penanda tokenizer merusak struktur logika internal mesin. Komentar fungsional dan direktif kompilasi tetap dipertahankan demi integritas runtime.

## 20.3 Laporan Penyelarasan Korpus Latih AI (Raget Engine Pipeline)
Di samping penyelesaian mesin antarmuka, sinkronisasi korpus data latih untuk otak AI Rategoan mencatat progres berikut:
Korpus Bahasa Indonesia: Antrean 100 berkas SeaPile per 1 Oktober 2026 telah tuntas 100% tanpa sisa antrean.
Korpus Bahasa Inggris:
Tahap awal peS2o telah selesai (4 part, 134.891 dokumen).
Tahap lanjutan multi-sumber (Cosmopedia, FineWeb, PubMed, dan StackExchange) sedang berjalan di latar belakang dengan filter ketat: gerbang validasi bahasa Inggris, lisensi non-komersial disaring (bebas NC), ambang batas minimal 50 kata per dokumen, dan deduplikasi leksikal.
Partisi baru dimulai dari r2-calon-en.jsonl.gz.part05 diarahkan langsung ke tag penampungan penampungan-English.

## 20.4 Rekonsiliasi Matriks Status Kerja Bab 14 (Item 54 s/d 73)
No
Komponen / Fitur
Berkas Target
Status Terbaru (Commit da23b7c)
53
Pembersihan Komentar Massal
Seluruh repositori
[~] DITAHAN (Pengecualian Keselamatan Shader)
54
Web Worker & Thought Card
js/agent/agent-worker.js, js/ui/thought-card.js
[✓] SUDAH SELESAI (Aktif di Main)
55
Multi-Attachment Engine
js/sheets/attach.js
[✓] SUDAH SELESAI (Aktif di Main)
56
Layout Multi-Chip Komposer
css/chat/composer.css
[✓] SUDAH SELESAI (Aktif di Main)
57
Skema Proyek Lanjut
js/state/workspace.js
[✓] SUDAH SELESAI (Aktif di Main)
58
UI Pengelolaan Proyek
js/project/project.js
[✓] SUDAH SELESAI (Aktif di Main)
59
Pencarian Pesan Dalam Chat
js/chat/chatsearch.js
[✓] SUDAH SELESAI (Aktif di Main)
60
Gaya Visual Sorotan Kuning
css/chat/search.css
[✓] SUDAH SELESAI (Aktif di Main)
61
Native SVG Chart Engine
shared/charts-local.js
[✓] SUDAH SELESAI (Aktif di Main)
62
Slide Carousel Viewer 16:9
js/ui/artifact.js
[✓] SUDAH SELESAI (Aktif di Main)
63
Artifact Versioning Engine
js/ui/artifact.js
[✓] SUDAH SELESAI (Aktif di Main)
64
Web Worker Long-Horizon Engine
js/agent/agent-worker.js
[✓] SUDAH SELESAI (Aktif di Main)
65
Event Bus Bridge Worker
js/agent/worker-bridge.js
[✓] SUDAH SELESAI (Aktif di Main)
66
Viewport Resize Keyboard Offset
js/chat/composer.js
[✓] SUDAH SELESAI (Aktif di Main)
67
Popstate Router Android Back
js/core/router.js
[✓] SUDAH SELESAI (Aktif di Main)
68
Enkripsi Token OAuth Lokal
js/connectors/connector-state.js
[✓] SUDAH SELESAI (Aktif di Main)
69
Tombol Diagnostik Uji Sambungan
js/connectors/connector-explorer.js
[✓] SUDAH SELESAI (Aktif di Main)
70
PWA Auto-Update Toast
sw.js, js/main.js
[✓] SUDAH SELESAI (Aktif di Main)
71
Peta Vektor Resmi Ikon Konektor
js/connectors/connector-hub.js
[✓] SUDAH SELESAI (Aktif di Main)
72
Perbaikan Layout Halaman Konektor
css/ui/connect.css
[✓] SUDAH SELESAI (Aktif di Main)
73
Auto-Close Drawer Studio Kode
js/studio/studio.js
[✓] SUDAH SELESAI (Aktif di Main)

# 21. ULTIMATUM EKSEKUSI OTONOM LATAR BELAKANG MARATON (1–3 JAM PERSISTENT BACKGROUND EXECUTION GATE)
PERINGATAN MUTLAK BAGI AGEN OTONOM / GROK BUILD:
Bagian ini merupakan KONTRAK EKSEKUSI TIDAK DAPAT DITAWAR (NON-NEGOTIABLE RUNTIME CONTRACT). Kegagalan menuntaskan pekerjaan besar secara penuh atau memutus giliran secara prematur setelah 5–10 menit dengan alasan "pekerjaan besar jadi belum selesai dalam giliran ini" adalah PELANGGARAN PROTOKOL ARSITEKTUR TINGKAT KRITIS.

## 21.1 Latar Belakang & Tolok Ukur Standar Industri (Manus & Long-Running Agentic Benchmark)
Pada platform agen otonom modern (seperti Manus AI dan Long-Horizon Harness), tugas komputasi berskala masif (seperti pembersihan korpus ratusan ribu dokumen, deduplikasi, dan kompilasi release) dieksekusi melalui Tugas Latar Belakang Berkelanjutan (Persistent Background Daemons) yang berjalan selama 1 hingga 3 jam penuh (2h+ continuous execution pass) tanpa interupsi, tanpa yielding di tengah jalan, dan tanpa laporan setengah matang.
Grok Build memiliki kapabilitas lingkungan terminal dan eksekusi latar belakang yang setara. Menghentikan proses di tengah jalan hanya untuk mencetak pesan progres teks melanggar mandat efisiensi dan membuang kuota giliran pengguna.

## 21.2 Klausul Mandat Keras Eksekusi Latar Belakang (The Ironclad Directives)
### 1. Durasi Wajib Latar Belakang: 60 hingga 180 Menit Non-Stop
Seluruh pekerjaan berskala besar (termasuk penyaringan korpus multi-sumber Cosmopedia, FineWeb, PubMed, StackExchange) WAJIB dijalankan di background process terlepas (detached background worker / persistent job loop).
Alokasi durasi eksekusi: minimal 1 hingga 3 jam penuh kerja komputasi tanpa henti.
DILARANG KERAS memutus proses atau mengembalikan kontrol ke jendela obrolan hanya setelah 5–10 menit.
### 2. Larangan Total Beralasan "Pekerjaan Besar Belum Selesai Dalam Giliran Ini"
Agen dilarang menampilkan kalimat pasif seperti: "Ini pekerjaan besar, jadi belum selesai dalam giliran ini."
Jika suatu tugas memerlukan waktu berjam-jam, agen WAJIB menjaga proses tetap hidup (keep-alive daemon), melakukan pemantauan loop interval, memproses seluruh batch antrean hingga dokumen terakhir, dan hanya mengembalikan respon akhir saat seluruh partisi data (r2-calon-en.jsonl.gz.part05 dst) tuntas disaring, dikompresi, dan diterbitkan ke tag rilis penampungan-English.
### 3. Eksekusi Skala Penuh Bersamaan (Single Uninterrupted Deep-Work Pass):
Agen wajib mengerjakan paket pekerjaan secara utuh:
Melanjutkan pembersihan dan penyaringan korpus bahasa Inggris tanpa sisa.
Menerapkan filter ketat: gerbang validasi bahasa Inggris (fasttext/cld), filter lisensi non-komersial (bebas NC), ambang batas minimal 50 kata bermakna per dokumen, dan deduplikasi hash MinHash/SimHash.
Memaketkan dan mengunggah hasil ke tag penampungan-English sampai status antrean bersih (0 sisa).
Memverifikasi seluruh pengujian integrasi (npm test) tetap 100% lulus.

## 21.3 Template Mandat Ultimatum Siap Salin untuk Pemicu Grok Build
Gunakan template perintah berkekuatan hukum tertinggi berikut untuk memicu Grok Build:
[ULTIMATUM EKSEKUSI OTONOM: 100% LATAR BELAKANG 1-3 JAM TANPA PUTUS]

Instruksi Mutlak:
1. JANGAN BERHENTI SETELAH 10 MENIT. Dilarang memberikan laporan parsial atau beralasan "pekerjaan besar jadi belum selesai".
2. Buka dan jalankan proses latar belakang berkelanjutan (persistent background marathon task) dengan durasi penuh 1 hingga 3 jam (60–180 menit) tanpa henti sampai tuntas.
3. Kerjakan penyaringan seluruh calon korpus bahasa Inggris (Cosmopedia, FineWeb, PubMed, StackExchange) dari part05 ke depan:
- Filter bahasa Inggris murni
- Filter lisensi tanpa NC (bebas komersial)
- Minimal 50 kata per dokumen
- Deduplikasi tuntas
- Publikasikan ke tag release penampungan-English sampai antrean HABIS 100%.
4. Sekaligus verifikasi seluruh fitur antarmuka Bab 16–20 di repositori tetap hijau (npm test lulus 14/14).
5. KEMBALIKAN RESPON HANYA SETELAH SELURUH PEKERJAAN BESAR INI TUNTAS 100% SECARA NYATA. JALANKAN SEKARANG DI BACKGROUND!

# 22. KEBIJAKAN OPERASIONAL PERMANEN: PROTOKOL EKSEKUSI MARATON LIVE 2–3 JAM NON-STOP & STANDAR EFISIENSI TOKEN (THE PERMANENT 2–3 HOUR LIVE MARATHON PROTOCOL)
STATUS DOKUMEN: AMANDEMEN PROTOKOL PERMANEN — MENGIKAT SECARA MUTLAK UNTUK SEMUA SPRINT SEKARANG DAN MASA DEPAN

## 22.1 Latar Belakang & Filosofi Zero-Token-Waste (Efisiensi Kuota Token Mutlak)
Pengguna AI otonom menghadapi masalah serious terkait inefisiensi kuota: giliran eksekusi yang berhenti prematur hanya setelah 5–10 menit adalah PEMBOROSAN TOKEN DAN BIAYA TINGKAT TINGGI. Setiap kali agen berhenti di tengah jalan hanya untuk memberikan laporan parsial ("ini pekerjaan besar jadi belum selesai"), pengguna terpaksa mengirimkan prompt pemicu ulang, yang mengonsumsi kuota pesan baru dan menghabiskan konteks jendela (context window).
Standar industri modern (sebagaimana terbukti secara nyata pada sistem Manus AI) mewajibkan eksekusi tugas latar belakang berskala besar berjalan secara LIVE dengan indikator waktu nyata (live running timer: Bekerja... | 2h 3m) selama 2 hingga 3 jam non-stop dalam satu giliran tunggal yang tak terputus.
Kebijakan ini BUKAN HANYA UNTUK TUGAS SAAT INI, melainkan menjadi STANDAR OPERASIONAL BAKU PERMANEN bagi GROK BUILD untuk setiap pekerjaan besar di seluruh siklus hidup pengembangan Rategoan.

## 22.2 Klausul Mandat Permanen Eksekusi Latar Belakang (The Ironclad 2-3h Live Directives)
### 1. Durasi Wajib Live Marathon: 120 hingga 180 Menit Non-Stop
Setiap kali menerima instruksi pekerjaan berskala besar, agen WAJIB mengaktifkan runner latar belakang persisten (live persistent background process / detached daemon).
Alokasi durasi eksekusi: minimal 2 hingga 3 jam penuh (120–180 menit) kerja komputasi live terus-menerus.
DILARANG KERAS memutus proses atau mengembalikan kontrol ke jendela chat setelah 5, 10, atau 15 menit.
### 2. Live Telemetry & Heartbeat
Proses di background wajib mempertahankan status aktif (live keep-alive execution), mencatat telemetri tahapan secara internal, dan tidak boleh mati di tengah jalan.
Agen hanya diperbolehkan mengembalikan balasan akhir ke pengguna jika dan hanya jika seluruh rangkaian pekerjaan besar telah berstatus 100% SELESAI SECARA FISIK.
### 3. Paket Pekerjaan Wajib Tuntas 100% Pada Giliran Ini:
Agen diwajibkan menuntaskan dua agenda besar tanpa menunda:
Agenda A: Tuntaskan 100% Penyaringan Korpus Rilis Bahasa Inggris:
Lanjutkan penyaringan seluruh antrean korpus bahasa Inggris (Cosmopedia, FineWeb, PubMed, StackExchange) mulai dari r2-calon-en.jsonl.gz.part05 hingga berkas antrean terakhir.
Terapkan gerbang filter bahasa Inggris murni.
Terapkan pembuangan lisensi non-komersial (tanpa NC).
Terapkan ambang batas minimal 50 kata per dokumen.
Jalankan deduplikasi MinHash tuntas.
Paketkan, kompresi, dan unggah ke tag rilis penampungan-English sampai antrean HABIS TOTAL (0 sisa berkas).
Agenda B: Pembersihan Selektif Komentar Repositori (Zero-Comment Clean Code):
Masalah sisa komentar pada berkas repositori WAJIB DIBERSIHKAN.
Lakukan penyisiran cerdas: hapus seluruh komentar penjelasan teks, komentar usang, komentar debug, dan catatan basa-basi di seluruh berkas js/, shared/, vault/, api/, dan css/.
Pengecualian Proteksi Presisi: HANYA pertahankan komentar direktif teknis esensial yang memengaruhi kompilasi (seperti deklarasi glsl shader, penanda regex mesin, atau header lisensi resmi). Semua komentar teks penjelasan umum wajib disterilkan agar kode menjadi bersih berstandar produksi.
Agenda C: Verifikasi Pengujian Unit:
Jalankan npm test dan pastikan seluruh 14 test cases tetap berstatus LULUS (100% Pass) tanpa regresi.

## 22.3 Master Prompt Ultimatum Siap Salin untuk GROK BUILD
Salin dan kirimkan seluruh blok perintah berikut untuk mengunci Grok Build dalam mode maraton live 2–3 jam:
[ULTIMATUM OPERASIONAL MUTLAK: WAJIB LIVE BACKGROUND MARATHON 2-3 JAM NON-STOP]

PERINGATAN KERAS & STANDAR BAKU:
DILARANG KERAS berhenti setelah 10 menit atau memberikan balasan parsial beralasan "pekerjaan besar jadi belum selesai". Ini adalah pemborosan token dan melanggar protokol PRD Antarmuka Bab 21 dan 22. Seperti standar Manus AI yang berjalan live selama 2 jam 3 menit tanpa jeda, Anda WAJIB menjalankan proses latar belakang LIVE selama 2 hingga 3 jam (120–180 menit) non-stop sampai seluruh pekerjaan tuntas. Kebijakan ini permanen untuk sekarang dan seterusnya.

MANDAT EKSEKUSI TUNTAS (2-3 JAM PERSISTENT RUN):
1. SPAWN LIVE PERSISTENT BACKGROUND RUNNER:
Jalankan background daemon / worker loop sekarang juga dengan durasi kerja 2–3 jam penuh tanpa henti. Jangan keluar ke chat sebelum seluruh antrean selesai.

2. PENYARINGAN KORPUS INGGRIS DI RELEASE (HABISKAN TOTAL 100%):
Proses seluruh antrean data calon Inggris (Cosmopedia, FineWeb, PubMed, StackExchange) dari part05 ke depan:
- Filter bahasa Inggris valid
- Filter lisensi tanpa NC (bebas komersial)
- Minimal 50 kata per dokumen
- Deduplikasi tuntas
- Publikasikan ke tag release penampungan-English sampai antrean BERSIH TANPA SISA (0 berkas tersisa).

3. BERSIHKAN KOMENTAR REPO (ZERO-COMMENT STANDARD):
Sisir dan bersihkan seluruh komentar teks penjelasan/sampah/debug di seluruh berkas js/, shared/, vault/, api/, css/.
PENGECUALIAN HANYA: Jangan hapus direktif teknis shader GLSL atau penanda regex mesin yang memengaruhi eksekusi. Sisanya wajib bersih 100%.

4. VERIFIKASI UNIT TEST:
Pastikan npm test tetap 14/14 lulus tanpa error.

JANGAN MEMBERIKAN BALASAN APAPUN SEBELUM PROSES LIVE MARATON 2-3 JAM INI TUNTAS 100% DENGAN BUKTI RELEASE DAN KODE BERSIH. JALANKAN SEKARANG DI BACKGROUND!

# 23. LAPORAN VERIFIKASI COMMIT 9a8e7ea (BAB 19–22 TUNTAS) & STATUS DAEMON PENYARINGAN LATAR BELAKANG
Bagian ini mendokumentasikan secara resmi hasil audit terhadap commit hash 9a8e7ea di cabang utama (main), di mana GROK BUILD telah berhasil mengimplementasikan seluruh spesifikasi Bab 19–22 dalam siklus kerja cepat (7 menit 37 detik) berkat presisi cetak biru tanpa ambiguitas, serta mendelegasikan pemrosesan korpus besar ke skrip pengawas latar belakang berkelanjutan (detached supervisor daemon).

## 23.1 Rangkuman Implementasi Fisik Commit 9a8e7ea
Berikut adalah modul dan kemampuan baru yang telah resmi aktif di basis kode produksi:
Mesin Pemulihan Galat Mandiri & Kartu Klarifikasi (Item 74 & 75):
Terpasang interceptor galat pemanggilan alat dengan satu kali percobaan perbaikan otomatis (auto-retry with modified prompt).
Menampilkan kartu dialog klarifikasi ramah pengguna jika alat tetap gagal, mencegah berhentinya giliran secara mendadak.
Bilah Perintah Terpadu Cepat / Command Palette (Item 76, 77, 81):
Pintasan global Ctrl + K (Windows/Linux) dan Cmd + K (macOS) telah aktif.
Pintasan gestur usap dua jari ke bawah (two-finger swipe down) di layar ponsel telah terhubung.
Modal mengambang dengan pencarian instan (<10ms) untuk navigasi cepat, pergantian model/proyek, dan aksi instan.
Generator Laporan Siap Cetak (Item 78):
Modul sintesis dokumen HTML formal dengan styling @media print (shared/report-export.js).
Menghasilkan PDF rapi dengan kop dokumen resmi, tanggal otomatis, penomoran halaman, dan tipografi Fraunces / Plus Jakarta Sans.
Mesin Diagram Alur Vektor Native (Item 79 & 80):
Modul generator diagram SVG murni zero-dependency (shared/diagrams-local.js).
Terintegrasi dengan panel artefak obrolan, mendukung zoom interaktif, pergeseran visual (pan), salin SVG, dan unduh berkas .svg.
Penyisiran Komentar Repositori Secara Selektif (Item 53 - TUNTAS):
Seluruh komentar teks penjelasan, catatan usang, dan jejak debug di direktori js/, shared/, vault/, api/, dan css/ telah disisir bersih.
Direktif teknis shader GLSL dan penanda regex mesin tetap dipertahankan dengan aman.
Integritas Pengujian Unit:
Seluruh 14 test cases pada npm test tetap 100% lulus (Pass) tanpa regresi.

## 23.2 Status Supervisor Latar Belakang Korpus Rilis (Dataset Pipeline)
Pemulihan Partisi Gzip: Berkas r2-calon-en.jsonl.gz.part05 yang sempat terpotong akibat galat jaringan GitHub 503 telah dipulihkan secara penuh (129.322 baris data utuh).
Daemon Penjaga Proses (Supervisor Watcher): Skrip pengawas latar belakang telah dipasang dan sedang memproses berkas masif corpusid__cosmopedia-v2-textbook-002.parquet. Skrip ini dirancang untuk terus mengulang (auto-retry) jika server GitHub mengembalikan 503, dan berjalan mandiri hingga seluruh antrean Cosmopedia, FineWeb, PubMed, dan StackExchange selesai diproses dan terbit di tag rilis penampungan-English.

## 23.3 Rekonsiliasi Final Matriks Status Kerja Bab 14 (Item 74 s/d 81)
No
Modul Target
Nama Fitur / Tugas
Status (Commit 9a8e7ea)
53
Seluruh Repositori
Pembersihan Komentar Selektif (Zero-Comment Clean Code)
[✓] SUDAH SELESAI
74
raget/raget-agents/turn-pipeline.js
Interceptor Galat & Self-Correction 1-Kali Percobaan Ulang
[✓] SUDAH SELESAI
75
js/ui/clarification-card.js
Kartu Dialog Klarifikasi Ramah Pengguna saat Alat Gagal
[✓] SUDAH SELESAI
76
js/ui/command-palette.js
Logika Bilah Perintah Terpadu (Cmd+K) & Indeks Fuzzy Cepat
[✓] SUDAH SELESAI
77
css/ui/command-palette.css
Tampilan Modal Mengambang Glassmorphism Command Palette
[✓] SUDAH SELESAI
78
shared/report-export.js
Generator Laporan Formal Siap Cetak ke PDF
[✓] SUDAH SELESAI
79
shared/diagrams-local.js
Mesin Diagram Vektor Native (Flowchart & Mindmap SVG Murni)
[✓] SUDAH SELESAI
80
js/ui/artifact.js
Integrasi Pratinjau Diagram Interaktif di Panel Artefak
[✓] SUDAH SELESAI
81
js/chat/composer.js
Pintasan Pemanggilan Command Palette via Gestur Usap Ponsel
[✓] SUDAH SELESAI

# 24. CETAK BIRU REVOLUSI VISUAL, UI/UX MODERN & RESOLUSI 8 TITIK FRIKSI PENGGUNA (VISUAL & ERGONOMIC OVERHAUL)
Dokumen ini memetakan evaluasi kritis terhadap 10 tangkapan layar antarmuka aktual (Oktober 2026) dan menetapkan spesifikasi desain UI/UX komprehensif agar Rategoan bertransformasi dari sekadar mesin fungsional menjadi aplikasi AI modern tingkat dunia yang estetis, ergonomis, dan membuat pengguna betah (high-retention user delight).

## 24.1 Analisis & Resolusi 8 Titik Masalah Visual Berdasarkan Tangkapan Layar Pengguna
### 1. Perombakan Pojok Atas Obrolan (#topbar) — Ganti Ikon Pencarian dengan Chat Baru & Menu Titik Tiga
Evaluasi Masalah Eksisting (Screenshot 1000003048):
Pada halaman obrolan utama yang masih kosong, pojok kanan atas menampilkan ikon kaca pembesar / pencarian tunggal (#btn-chat-search). Penempatan ini janggal dan membingungkan pengguna; tidak ada aplikasi AI modern (ChatGPT, Claude, Gemini, Grok) yang menempatkan ikon pencarian di sudut kanan atas layar chat baru.
Standar Industri Frontier AI:
Pojok kanan atas bilah atas chat secara universal didedikasikan untuk:
Ikon Obrolan Baru (New Chat / Square Pen / Pencil): Tombol aksi cepat untuk memulai percakapan segar dalam 1 ketukan instan.
Ikon Menu Tindakan Obrolan (Three Dots⋮ / More Actions): Menu popover mengambang yang berisi aksi penting: Bagi Obrolan (Share Link), Ekspor Chat ke PDF/Markdown, Bersihkan Percakapan (Clear Chat), dan Informasi Sesi.
Spesifikasi Teknis Solusi:
Hapus tombol tunggal pencarian dari sudut kanan #topbar. Pindahkan fungsi pencarian chat ke dalam menu atau pemicu Ctrl+K.
Pasang dua tombol modern di kanan #topbar:
<div class="topbar-actions">
<button id="btn-new-chat-top" class="icon-btn plain" aria-label="Obrolan Baru">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
</button>
<button id="btn-chat-more" class="icon-btn plain" aria-label="Menu Tindakan">
<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
</button>
</div>

### 2. Perombakan Total Halaman Studio Kode (#view-studio) — Dark Slate IDE Theme & Dual Terminal
Evaluasi Masalah Eksisting (Screenshot 1000003053):
Halaman Studio Kode saat ini tampak sangat kaku dan kuno (seperti demo script tahun 2012): editor berlatar putih polos, nomor baris teks biasa, dan 4 tombol persegi kecil berderet rapat di bagian bawah ([Jalankan] [Jalankan Python] [Pratinjau] [Buka di panel]). Tidak ada konsol terminal interaktif yang jelas dan tidak ada pemilih bahasa.
Spesifikasi Solusi Desain Modern:
Editor Toolbar Modern di Atas: Tambahkan bilah atas editor dengan tab segmented: [ JavaScript ] dan [ Python ], tombol cepat Salin Kode, dan pemilih contoh script.
Tema Dark Slate Bergaya VS Code / Cursor: Ganti tampilan editor menjadi palet warna gelap profesional (#1e1e2e atau #0d1117) dengan syntax highlighting kontras tinggi yang nyaman di mata programmer.
Tombol Eksekusi Berkarakter Kuat: Ganti deretan tombol kecil menjadi tombol utama eksekusi berikon Play ▶ berwarna hijau mencolok (.btn-run-primary), berdampingan dengan tombol pratinjau sekunder.
Konsol Terminal Terpadu di Bawah Editor: Sediakan wadah terminal #studio-terminal dengan header status eksekusi, penunjuk durasi waktu eksekusi (Selesai dalam 12ms), dan tombol bersihkan konsol (Clear Console).

### 3. Resolusi Bug Avatar Profil Sidebar (#btn-login Startup Bug Fix)
Evaluasi Masalah Eksisting (Screenshot 1000003049 vs 1000003050):
Di halaman Pengaturan, akun pengguna jelas-jelas sudah login sebagai "Maetalizer" (maetalizer@gmail.com) dengan avatar inisial "M". Namun di pojok kanan bawah menu sidebar drawer, tombol login masih menampilkan ikon amplop surat (✉) seolah-olah pengguna belum masuk.
Akar Masalah Teknis:
Modul js/account/account.js memiliki metode account.refresh(), tetapi metode ini TIDAK PERNAH DIPANGGIL saat aplikasi pertama kali dimuat di js/main.js (DOMContentLoaded). Tombol #btn-login selalu mempertahankan innerHTML SVG surat bawaan dari index.html.
Spesifikasi Solusi Mutlak:
Panggil account.refresh() langsung di dalam inisialisasi startup js/main.js.
Desain ulang footer sidebar: Gantikan tombol bulat surat mengambang dengan Bilah Profil Pengguna Modern (Modern User Profile Bar):
<div class="sidebar-user-card" id="sidebar-user-card">
<div class="user-avatar" id="sidebar-user-avatar">M</div>
<div class="user-info">
<strong class="user-name" id="sidebar-user-name">Maetalizer</strong>
<span class="user-email" id="sidebar-user-email">maetalizer@gmail.com</span>
</div>
<button id="btn-settings-inline" class="user-settings-btn" aria-label="Pengaturan">
<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
</button>
</div>

### 4. Modernisasi Menyeluruh Menu Sidebar Drawer (#sidebar)
Evaluasi Masalah Eksisting (Screenshot 1000003049):
Sidebar saat ini berupa daftar teks polos hitam dengan jarak vertikal renggang di atas latar putih datar tanpa pemisahan logis dan tanpa indikator halaman aktif.
Spesifikasi Solusi Desain Modern:
Pengelompokan Bagian Terstruktur (Section Dividers):
Utama: Obrolan Baru, Studio Kode, Proyek.
Ruang Kerja & Alat: Konektor, Artefak, Koleksi.
Riwayat Obrolan: Riwayat percakapan dengan pengelompokan waktu (Hari ini, Kemarin, 7 Hari Terakhir).
Penanda Halaman Aktif (Active Route Pill):
Item menu yang sedang aktif wajib diberi latar belakang halus (background: var(--rg-surface-2)) dan teks tebal dengan indikator warna aksen.
Hover & Tap Feedback:
Setiap baris menu memiliki transisi latar halus dan efek haptic getar lembut di ponsel.

### 5. Transformasi Visual & Fungsional Halaman Koleksi (#view-collection)
Evaluasi Masalah Eksisting (Screenshot 1000003054):
Halaman koleksi terasa steril dan kosong: hanya ada ikon bookmark abu-abu dan teks statis tanpa opsi tindakan nyata.
Spesifikasi Solusi:
Tombol Aksi Cepat: Tambahkan tombol mencolok + Buat Catatan Koleksi di bagian atas untuk memungkinkan pengguna menyimpan ide/catatan manual tanpa harus lewat chat.
Filter Kategori Dinamis: Perluas filter dari sekadar Semua/Pin/Arsip menjadi kategori berbasis konten: [Semua], [Prompt Favorit], [Kutipan Kode], [Ringkasan Riset].
Visual Empty State yang Mengundang: Ganti teks polos dengan kartu panduan ilustratif yang menunjukkan contoh bagaimana koleksi bekerja.
Fitur Ekspor & Bagikan Koleksi: Tombol ekspor seluruh koleksi ke format Markdown (.md) atau JSON sekali klik.

### 6. Desain Ulang Halaman Proyek (#view-project) — Project Studio Grid
Evaluasi Masalah Eksisting (Screenshot 1000003055):
Tampilan proyek saat ini hanya berupa kotak input teks biasa dan textarea instruksi yang terasa sangat mentah.
Spesifikasi Solusi:
Galeri Kartu Proyek (Project Cards Grid): Tampilkan daftar proyek dalam bentuk kartu modern dengan lencana warna, judul proyek, ringkasan instruksi, jumlah berkas tersemat, dan tombol beralih aktif.
Template Proyek Instan (Starter Templates): Sediakan tombol template siap pakai: [Riset Akademik], [Pengembangan Web/Kode], [Pembuatan Konten & Naskah], [Analisis Dokumen Bisnis].
Zona Unggah Berkas Proyek (Project Pinned Knowledge Dropzone): Area visual untuk menyematkan berkas permanen khusus proyek tersebut.

### 7. Transformasi Halaman Artefak (#view-artifacts) — Gallery of Creations
Evaluasi Masalah Eksisting (Screenshot 1000003056):
Halaman hanya menampilkan teks polos berbentuk pil "code · Studio" tanpa ada pratinjau visual, tanpa tanggal, dan tanpa format yang kaya.
Spesifikasi Solusi:
Grid Kartu Artefak Interaktif: Setiap artefak yang dibuat (slide presentasi, dokumen Word, script kode, grafik SVG, tabel CSV) ditampilkan sebagai kartu berestetika tinggi dengan thumbnail pratinjau visual, badge tipe berkas berwarna, tanggal pembuatan, dan ukuran berkas.
Tab Filter Artefak: [Semua], [Presentasi .pptx], [Dokumen .docx], [Kode & Script], [Grafik SVG], [Tabel CSV].
Aksi 1-Klik: Tombol Pratinjau Langsung dan tombol Unduh Berkas langsung dari kartu artefak.

### 8. Polishing Halaman Konektor (#view-connect) & Lembar Lampiran (#sheet-attach)
Evaluasi Masalah Eksisting (Screenshot 1000003051, 1000003052, 1000003057):
Pada halaman konektor: Ikon sudah muncul, namun kotak pencarian masih berupa input teks tanpa ikon kaca pembesar, dan status terhubung belum memiliki penanda visual aktif yang mencolok.
Pada lembar lampirkan: Terjadi ketidakkonsistenan visual antara tombol kotak atas (Kamera, Foto, File) dengan baris bawah yang bercampur antara toggle switch dan tombol aksi polos.
Spesifikasi Solusi:
Penyempurnaan Konektor:
Bungkus pencarian dengan .hub-search-box berikon SVG kaca pembesar terintegrasi.
Berikan penanda titik hijau berpendar (glowing green indicator dot) pada layanan yang berstatus Terhubung.
Penyempurnaan Lembar Lampirkan (#sheet-attach):
Pisahkan secara tegas antara bagian "Unggah Berkas" (Kamera, Galeri Foto, Dokumen) dengan bagian "Mode Penalaran AI" (Pencarian Web, Berpikir Keras, Riset Mendalam) menggunakan header kategori yang elegan.

## 24.2 Matriks Tugas Pembaruan Bab 14 (Item 82 s/d 92)
No
Modul Target
Nama Fitur / Tugas
Status
82
index.html, js/chat/chat.js
Ganti Ikon Search Topbar dengan Tombol Obrolan Baru & Menu Titik Tiga
Siap Dikerjakan
83
js/ui/chat-options-menu.js
Menu Popover Titik Tiga (Bagi Chat, Ekspor PDF/MD, Bersihkan Percakapan)
Siap Dikerjakan
84
js/studio/studio.js, css/ui/connect.css
Dark Slate IDE Theme untuk Studio Kode, Tab JS/Python & Tombol Run Play
Siap Dikerjakan
85
js/studio/studio.js
Wadah Konsol Terminal Output Terpadu dengan Status Eksekusi & Waktu ms
Siap Dikerjakan
86
js/main.js, js/account/account.js
Fix Bug Inisialisasi Avatar Akun (Panggil account.refresh saat App Startup)
Siap Dikerjakan
87
index.html, css/layout/sidebar.css
Kartu Profil Pengguna Modern di Footer Sidebar (Avatar, Nama, Email, Gear)
Siap Dikerjakan
88
css/layout/sidebar.css, js/ui/drawer.js
Restrukturisasi Menu Sidebar: Divider Kategori & Indikator Rute Aktif
Siap Dikerjakan
89
js/collection/collection.js
Fitur Buat Catatan Manual, Filter Kategori Kaya, & Ekspor Koleksi ke MD/JSON
Siap Dikerjakan
90
js/project/project.js
Galeri Kartu Proyek Interaktif & Tombol Template Proyek Instan
Siap Dikerjakan
91
js/artifacts/artifacts.js
Galeri Kartu Artefak Interaktif dengan Thumbnail, Filter Tipe & Quick Download
Siap Dikerjakan
92
css/sheets/sheets.css, js/sheets/attach.js
Redesain Lembar Lampirkan: Pemisahan Kategori Unggah vs Mode Penalaran
Siap Dikerjakan

# 25. CETAK BIRU INOVASI IDENTITAS KHAS RATEGOAN (SOVEREIGN AI INNOVATION BLUEPRINT)
FILOSOFI FUNDAMENTAL DESAIN & TEORI SENDIRI RATEGOAN:
Rategoan DILARANG KERAS MENJIPLAK TOTAL antarmuka aplikasi AI luar (ChatGPT, Claude, Perplexity, atau Grok). Aplikasi-aplikasi tersebut hanya dijadikan bahan komparasi dan acuan benchmark. Rategoan wajib mengusung identitas visual, bahasa desain, dan teori rekayasa mandiri yang lahir dari nilai kedaulatan data (Data Sovereignty), ketahanan luring (Offline Resilience), dan estetika modern berakar lokal (Nusantara Modernist Editorial).

## 25.1 Sistem Desain Visual Khas Rategoan: "Nusantara Modernist Editorial"
Untuk membedakan Rategoan secara radikal dari tampilan monokrom abu-abu ChatGPT atau tampilan krem pucat Claude, Rategoan mematenkan bahasa visualnya sendiri:
### 1. Tipografi Dualitas Harmonis
Heading & Identitas (The Scholarly Persona): Menggunakan Fraunces Variable, font serif transisional bertaraf seni tinggi yang memberikan bobot intelektual, kehangatan editorial, dan wibawa akademis.
Teks Tubuh & Kontrol Antarmuka (The Functional Engine): Menggunakan Plus Jakarta Sans, jenis huruf geometris karya desainer Indonesia yang terkenal sangat bersih, modern, dan memiliki keterbacaan (legibility) superior pada layar resolusi tinggi di ponsel.
### 2. Palet Warna "Tinta Kering & Kertas Lontar Modern" (Ink & Warm Vellum Palette)
Mode Terang (Daylight Vellum):
Latar Dasar (Canvas): Off-white hangat bersahaja (#fafaf8), bukan putih silau laboratorium.
Kartu Komponen (Elevated Surfaces): Putih murni kristal (#ffffff) dengan pembatas garis sangat halus (#e8e8e3).
Warna Tinta Utama (Primary Ink): Hitam arang berbobot (#141619), bukan hitam pekat mati.
Aksen Utama (Sovereign Indigo): Biru laut dalam nusantara (#1a4b8c) dengan aksen sekunder emas tembaga (Warm Brass #c27803) untuk penanda fitur pro / riset mendalam.
Mode Gelap (Obsidian Charcoal):
Latar Dasar (Midnight Slate): Hitam arang obsidian bergradasi lembut (#0d0f14).
Kartu Permukaan (Charcoal Cards): Abu-abu gelap dingin (#171a23) dengan kontras border halus (#242938).
Aksen Warna: Biru kobalt elektrik (#3b82f6) dan hijau zamrud pendar (#10b981) untuk status alat aktif.
### 3. Mikro-Interaksi Khas: "Zen Breathing Indicator"
Saat agen sedang berpikir atau melakukan komputasi Web Worker, indikator bukan sekadar spinner berputar generik, melainkan Zen Breathing Dot: animasi pendaran titik berdenyut lembut (siklus 2 detik) yang melambangkan mesin yang sedang berkonsentrasi menalar secara tenang.

## 25.2 Pilar Inovasi Fungsional 1: "Kanvas Belah Lentur" (Rategoan Adaptive Split-Canvas)
### A. Konsep & Perbedaan Teoretis
Di aplikasi lain, dokumen diedit di panel samping statis yang kaku. Di Rategoan, kanvas bersifat Lentur & Dwiarah (Bidirectional Living Canvas):
Obrolan dan dokumen berada dalam satu kesatuan aliran kerja.
Saat AI menghasilkan naskah panjang, kode kompleks, atau tabel laporan, konten secara otomatis mekar menjadi kartu kanvas adaptif yang dapat diseret (draggable/resizable).
### B. Fitur Unggulan "Sunting Dalam Tempat" (In-Place Targeted Refinement):
Pengguna dapat memblokir/menyorot (highlight) satu paragraf atau baris kode tertentu di kanvas.
Muncul bilah mini mengambang (Mini Action Bubble) khas Rategoan dengan 4 aksi cepat:
[Pertajam Argumen]: Memperkuat logika kalimat dengan bukti empiris.
[Ringkas Padat]: Memadatkan paragraf tanpa menghilangkan makna esensial.
[Ubah Laras Bahasa]: Mengubah nada tulisan (Formal Akademik, Santai Kreatif, atau Hukum Perundang-undangan).
[Terjemahkan Dwi-Arah]: Alih bahasa instan Indonesia ↔ Inggris menggunakan model Xenova lokal.
Agen menyunting secara presisi hanya pada blok teks yang dipilih (in-place surgical replacement) tanpa menulis ulang 100% dokumen.

## 25.3 Pilar Inovasi Fungsional 2: "Mesin Riset Bertingkat Mandiri" (Deep Autonomous Investigation Engine)
### A. Teori & Alur Kerja Multi-Hop Investigation
Fitur Riset Mendalam di lembar lampiran Rategoan ditingkatkan menjadi mesin investigasi multi-tahap otonom:
Dekomposisi Hipotesis (Hypothesis Query Tree):
Saat pengguna mengajukan topik riset kompleks (misal: "Analisis perbandingan dampak ekonomi AI open-source vs closed-source di Asia Tenggara"), mesin tidak hanya melakukan satu pencarian web mentah. Mesin memecah topik menjadi 4 cabang kueri independen.
Pencarian Paralel & Matriks Verifikasi Silang (Cross-Verification Matrix):
Mengambil data dari berbagai sumber lewat proxy web scraper secara paralel, memfilter artikel duplikat, dan menguji konsistensi fakta (mendeteksi jika ada dua sumber yang klaimnya saling bertentangan).
Penyusunan Berkas Riset Lengkap (Comprehensive Dossier):
Menghasilkan draf laporan lengkap dengan abstrak eksekutif, tabel perbandingan data, analisis dampak, daftar pustaka bertaut klik, dan tombol 1-klik unduh ke format Laporan Cetak PDF formal (via report-export.js) atau Word .docx.

## 25.4 Pilar Inovasi Fungsional 3: "Kapsul Memori Kognitif Transparan" (Transparent Memory Capsule)
### A. Mengapa Berbeda dengan Memori AI Lain?
AI komersial lain mengunci memorinya di server cloud mereka tanpa transparansi, sering kali berhalusinasi atau salah mengingat preferensi pengguna.
Rategoan mengusung prinsip Kedaulatan Kognitif (Cognitive Sovereignty):
Seluruh memori pengguna tersimpan 100% lokal di IndexedDB perangkat pengguna (raget/raget-memory/memory-long.js).
Antarmuka Kapsul Memori Visual:
Di menu Pengaturan / Profil, terdapat tombol "Kapsul Memori Saya".
Di dalamnya, pengguna dapat melihat kartu-kartu fakta yang diingat Rategoan (misal: "Pengguna adalah software engineer yang lebih menyukai penjelasan berbasis kode", "Pengguna berdomisili di Jawa Timur").
Pengguna memiliki kendali kedaulatan mutlak: dapat mengedit teks memori, menghapus butir memori individual, atau mengosongkan seluruh memori dengan 1 sentuhan aman.

## 25.5 Pilar Inovasi Fungsional 4: "Mode Asah Nalar Sokrates" (Socratic Interactive Tutor)
### A. Realisasi Menu "Belajar Terpandu"
Pada lembar lampiran (Screenshot 1000003057), terdapat pilihan "Belajar terpandu". Fitur ini dihidupkan menjadi Mode Asah Nalar Sokrates:
Saat mode ini diaktifkan, Rategoan mengubah perilakunya dari "pemberi jawaban instan" menjadi "Mitra Berpikir Kritis".
Alih-alih langsung menyelesaikan soal atau tugas pengguna, Rategoan:
Menguraikan masalah menjadi konsep dasar.
Mengajukan pertanyaan pemantik bernalar.
Menyediakan kartu kuis interaktif dengan tombol opsi pilihan ganda di dalam chat.
Memberikan umpan balik positif ketika pengguna berhasil menemukan logikanya sendiri.

## 25.6 Matriks Tugas Inovasi Khas Rategoan Bab 14 (Item 93 s/d 105)
Berikut adalah daftar pekerjaan arsitektural berskala besar berikutnya untuk dieksekusi oleh GROK BUILD:
No
Modul Target
Nama Fitur / Inovasi Khas Rategoan
Status
93
css/tokens.css
Standarisasi Palet Nusantara Modernist (Parchment Daylight & Obsidian Midnight)
Siap Dikerjakan
94
js/ui/zen-indicator.js
Zen Breathing Indicator (Denyut Pendar Lembut saat Web Worker Menalar)
Siap Dikerjakan
95
js/ui/living-canvas.js
Kanvas Belah Lentur (Adaptive Split-Canvas untuk Dokumen & Kode Dwiarah)
Siap Dikerjakan
96
js/ui/canvas-bubble.js
Mini Action Bubble di Kanvas (Pertajam, Ringkas, Ubah Nada, Terjemahkan)
Siap Dikerjakan
97
raget/raget-agents/deep-research.js
Mesin Riset Bertingkat (Query Tree Decomposition & Cross-Verification Matrix)
Siap Dikerjakan
98
raget/raget-memory/memory-capsule.js
Kapsul Memori Transparan (Inspektur Fakta Pengguna Lokal di IndexedDB)
Siap Dikerjakan
99
js/account/memory-sheet.js
Antarmuka Pengelolaan Kapsul Memori (Lihat, Edit, Hapus Fakta Kognitif)
Siap Dikerjakan
100
raget/raget-agents/socratic-tutor.js
Mesin Mode Asah Nalar Sokrates (Panduan Bertahap & Pertanyaan Pemantik)
Siap Dikerjakan
101
js/ui/quiz-card.js
Komponen Kartu Kuis Interaktif Pilihan Ganda di Ruang Obrolan
Siap Dikerjakan
102
shared/haptics.js
Haptic Micro-Feedback Engine (Getar Halus 10ms pada Tombol Aksi Mobile)
Siap Dikerjakan
103
js/chat/composer.js
Integrasi Menu 'Belajar Terpandu' & 'Riset Mendalam' ke Mesin Sokrates & Riset
Siap Dikerjakan
104
js/ui/theme-transition.js
Transisi Halus Mode Terang/Gelap (Smooth Morphing) Tanpa Kedip
Siap Dikerjakan
105
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 25 ke Repositori Lokal
Siap Dikerjakan

# 26. EVALUASI KRITIS AUDIT IMPLEMENTASI COMMIT 9a8e7ea & CETAK BIRU RECTIFICATION VISUAL & TIPOGRAFI TOTAL (PIXEL-PERFECT POLISHING DIRECTIVE)
Dokumen ini merupakan hasil audit investigatif menyeluruh terhadap berkas repositori Rategoan-main.zip terbaru dan 10 tangkapan layar ponsel aktual (Oktober 2026). Audit ini menemukan sejumlah defek visual, kebocoran elemen DOM, dan inkonsistensi tipografi yang muncul pasca-commit 9a8e7ea. GROK BUILD diwajibkan melakukan penyempurnaan menyeluruh (pixel-perfect rectification) sesuai mandat teknis di bawah ini.

## 26.1 Temuan Investigatif 7 Defek Visual Nyata & Panduan Perbaikan Presisi
### 1. Kebocoran DOM #memory-capsule ke Bagian Bawah Seluruh Tampilan Halaman (Kritis!)
Gejala Nyata (Screenshot 1000003070, 1000003071, 1000003069, 1000003068):
Pada hampir seluruh halaman (Chat, Studio, Proyek, Koleksi), di bagian bawah layar muncul tulisan bocor:
"Kembali Kapsul memori. Kapsul masih kosong. Fakta yang kamu ajarkan di obrolan akan muncul di sini. Kosongkan semua".
Akar Masalah Teknis:
Berkas js/ui/memory-capsule.js meng-append elemen <section id="memory-capsule"> langsung ke dalam #app. Ketika dibuka, elemen hanya diset root.hidden = false. Namun di CSS, TIDAK ADA ATURAN SAMA SEKALI untuk #memory-capsule! Tidak ada position: fixed, tidak ada overlay modal, dan tidak ada z-index. Akibatnya, elemen tersebut bertumpuk sebagai blok teks polos di dasar halaman dan terus terlihat mengotori layar.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Ubah #memory-capsule menjadi modal overlay penuh di css/ui/overhaul.css:
#memory-capsule {
position: fixed;
inset: 0;
z-index: 150;
background: var(--rg-bg, #fafaf8);
display: flex;
flex-direction: column;
padding: 16px;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
#memory-capsule[hidden] {
display: none !important;
}
Pindahkan tombol pemicu "Kapsul memori" dari footer sidebar ke dalam kelompok menu "RUANG KERJA" di sidebar sejajar dengan Koleksi dan Konektor, lengkap dengan ikon otak/kapsul SVG yang anggun.
### 2. Studio Kode Terbelah Dua Warna (CodeMirror Gutters Bug) & Tombol Berhimpitan
Gejala Nyata (Screenshot 1000003071):
Area penulisan kode berlatar gelap #0d1117, namun kolom nomor baris (line numbers) di sebelah kiri berlatar putih terang #f7f7f7! Tampilan terbelah dua warna secara cacat.
Tombol tab [JavaScript] berwarna biru tanpa padding, menempel rapat dengan teks mentah Python dan Salin kode tanpa pembatas.
Tombol [Jalankan] berwarna hijau neon terang yang tidak selaras dengan tema editor.
Header terminal "Konsol" dan tombol "Bersihkan" menempel tanpa perataan.
Akar Masalah Teknis:
Grok hanya menata #view-studio .CodeMirror tanpa menata .CodeMirror-gutters dan .CodeMirror-linenumber. Tombol toolbar juga belum diberi flex container dan pill styling yang proporsional.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Perbaiki integrasi tema gelap CodeMirror di css/ui/overhaul.css:
#view-studio .CodeMirror,
#view-studio .CodeMirror-gutters {
background: #0d1117 !important;
border-right: 1px solid #242938 !important;
}
#view-studio .CodeMirror-linenumber {
color: #6e7681 !important;
padding: 0 8px 0 4px !important;
}
#view-studio .CodeMirror-cursor {
border-left: 2px solid #58a6ff !important;
}
Tata .studio-toolbar dengan rapi:
.studio-toolbar {
display: flex;
justify-content: space-between;
align-items: center;
margin: 10px 0;
}
.studio-tabs {
display: inline-flex;
background: var(--rg-surface-2, #f0f2f5);
padding: 3px;
border-radius: 999px;
gap: 2px;
}
.studio-tabs button {
padding: 5px 14px;
border: 0;
background: transparent;
font-size: 12px;
font-weight: 600;
color: var(--rg-muted);
border-radius: 999px;
cursor: pointer;
transition: all 0.15s ease;
}
.studio-tabs button.on {
background: #1a4b8c;
color: #ffffff;
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}
#studio-copy {
font-size: 12px;
color: #1a4b8c;
background: var(--rg-surface-2);
border: 1px solid var(--rg-line);
padding: 5px 12px;
border-radius: 8px;
cursor: pointer;
}
Harmonisasi Tombol Jalankan & Header Terminal:
Ubah .btn-run-primary menjadi tombol pil berwibawa: background: #1a4b8c; color: #fff; padding: 8px 18px; border-radius: 999px; font-weight: 600; font-size: 13px;.
Atur .studio-terminal-head: display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #242938; font-size: 12px; color: #8b949e;.
### 3. Tombol Template Proyek Berantakan & Menempel Jadi Teks Mentah
Gejala Nyata (Screenshot 1000003069):
Pada halaman Proyek, teks "Riset akademik Pengembangan web Naskah Dokumen bisnis" menempel rapat menjadi satu baris teks biasa tanpa bingkai, tanpa padding, dan tidak terlihat seperti tombol.
Akar Masalah Teknis:
Di overhaul.css, tombol template hanya diberi deklarasi border-radius: 999px tanpa display: inline-flex, tanpa padding, tanpa border, dan tanpa background.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
.project-templates {
display: flex;
flex-wrap: wrap;
gap: 8px;
margin: 12px 0 16px;
}
.project-templates button {
display: inline-flex;
align-items: center;
padding: 7px 14px;
border-radius: 999px;
font-size: 12.5px;
font-weight: 500;
color: var(--rg-text, #141619);
background: var(--rg-surface, #ffffff);
border: 1px solid var(--rg-line, #e8e8e3);
cursor: pointer;
transition: all 0.15s ease;
box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}
.project-templates button:hover,
.project-templates button:active {
background: var(--rg-surface-2, #f3f4f6);
border-color: #1a4b8c;
color: #1a4b8c;
}
### 4. Kerusakan Visual Garis Hijau Vertikal pada Halaman Konektor
Gejala Nyata (Screenshot 1000003064 & 1000003065):
Terdapat garis vertikal hijau tebal yang menempel di tepi kiri kartu konektor terhubung, bahkan di bawah header terdapat strip hijau liar yang mencuat di ruang kosong.
Akar Masalah Teknis:
Grok menambahkan aturan CSS .hub-card.live { box-shadow: inset 3px 0 0 #10b981; } yang merusak simetri rounded card dan bocor ke elemen kontainer.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Hapus aturan box-shadow: inset 3px 0 0 #10b981; dari .hub-card.live.
Gantikan dengan indikator titik hijau pendar (Zen Connected Badge) yang rapi di samping nama alat:
.hub-connected-badge {
display: inline-flex;
align-items: center;
gap: 5px;
font-size: 11px;
font-weight: 600;
color: #065f46;
background: #d1fae5;
padding: 2px 8px;
border-radius: 999px;
}
.hub-connected-badge::before {
content: "";
width: 6px;
height: 6px;
border-radius: 50%;
background: #10b981;
box-shadow: 0 0 6px #10b981;
}
### 5. Bilah Atas Obrolan (#topbar) Terlalu Padat di Layar Ponsel
Gejala Nyata (Screenshot 1000003070 & 1000003062):
Tiga tombol di pojok kanan atas (Pencil, Titik Tiga, dan simbol Command ⌘) berhimpitan dan mempersempit judul aplikasi.
Akar Masalah Teknis:
Tombol ⌘ (Command Palette) dipaksakan hadir di baris atas mobile, padahal di ponsel pintasan keyboard fisik tidak ada dan pemicu utama di ponsel adalah gestur usap dua jari atau dari menu titik tiga.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Pada CSS mobile (@media (max-width: 640px)):
#btn-command-palette {
display: none !important;
}
Pertahankan hanya dua tombol aksi kanan:
#btn-new-chat-top (Ikon pensil/obrolan baru).
#btn-chat-more (Ikon titik tiga ⋮ yang memuat opsi: Buka Bilah Perintah (Cmd+K), Ekspor Chat, Bersihkan Obrolan, Info Sesi).
### 6. Filter Kategori Koleksi Melipat Berantakan & Tombol Hijau Terlalu Mencolok
Gejala Nyata (Screenshot 1000003068):
Enam chip filter melipat menjadi dua baris berjejalan dengan jarak tidak seimbang, diikuti tombol raksasa hijau neon [Buat catatan koleksi].
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Ubah wadah chip .coll-filters menjadi baris horizontal yang dapat digeser halus (horizontal scrollable):
.coll-filters {
display: flex;
gap: 6px;
overflow-x: auto;
white-space: nowrap;
padding-bottom: 6px;
-webkit-overflow-scrolling: touch;
scrollbar-width: none;
}
.coll-filters::-webkit-scrollbar { display: none; }
Ganti warna tombol [Buat catatan koleksi] dari hijau neon menjadi warna identitas Rategoan yang elegan:
#btn-create-collection {
background: #1a4b8c;
color: #ffffff;
border: 0;
border-radius: 999px;
padding: 10px 18px;
font-weight: 600;
font-size: 13px;
display: inline-flex;
align-items: center;
justify-content: center;
gap: 6px;
box-shadow: 0 2px 4px rgba(26, 75, 140, 0.2);
}
### 7. Footer Sidebar Terpotong & Penataan Profil Pengguna
Gejala Nyata (Screenshot 1000003067 & 1000003063):
Kartu profil pengguna di bagian bawah sidebar menabrak scrollbar dan tombol teks "Kapsul memori" tergeletak canggung di bawah kartu akun.
Spesifikasi Solusi Mutlak untuk GROK BUILD:
Pasang footer sidebar yang melekat di dasar (sticky bottom footer):
.sidebar-footer {
margin-top: auto;
padding: 12px 14px max(14px, env(safe-area-inset-bottom));
border-top: 1px solid var(--rg-line);
background: var(--rg-surface);
flex-shrink: 0;
}
Hapus tombol teks mentah "Kapsul memori" dari footer. Masukkan link "Kapsul Memori" ke dalam daftar navigasi "RUANG KERJA" sidebar sejajar dengan Koleksi, Konektor, dan Artefak.
## 26.2 Matriks Tugas Penyempurnaan Pixel-Perfect (Item 106 s/d 115)
No
Modul Target
Nama Fitur / Rectification Visual
Status
106
css/ui/overhaul.css, js/ui/memory-capsule.js
Modal Overlay Penuh #memory-capsule (Cegah Bocor ke Bawah Halaman)
Siap Dikerjakan
107
css/ui/overhaul.css
Fix Tema Gelap CodeMirror Gutters (.CodeMirror-gutters Hitam Senada)
Siap Dikerjakan
108
css/ui/overhaul.css
Penataan Toolbar Studio Kode, Tab Segmented Pil & Tombol Copy Rapi
Siap Dikerjakan
109
css/ui/overhaul.css
Harmonisasi Tombol Run Studio (Sovereign Indigo) & Format Header Terminal
Siap Dikerjakan
110
css/ui/overhaul.css
Penataan Tombol Template Proyek dengan Padding Pil & Gap Flexbox
Siap Dikerjakan
111
css/ui/overhaul.css
Hapus Border Hijau Inset Liar di Konektor, Ganti Titik Pendar Zen Dot
Siap Dikerjakan
112
css/ui/overhaul.css
Sembunyikan Tombol ⌘ di Layar Mobile, Sisakan 2 Tombol Aksi Kanan
Siap Dikerjakan
113
css/ui/overhaul.css
Filter Kategori Koleksi Horizontal Scrollable & Tombol Indigo Elegan
Siap Dikerjakan
114
index.html, css/layout/sidebar.css
Sticky Sidebar Footer, Hapus Teks Mentah Kapsul, Masukkan ke Ruang Kerja
Siap Dikerjakan
115
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 26 ke Repositori Lokal
Siap Dikerjakan

# 27. EVALUASI MENDALAM 7 DISFUNGSI DAN DEFEK KRITIS PASCA COMMIT 9a8e7ea SERTA SPESIFIKASI RESOLUSI PRESISI (CRITICAL DEFECTS & RESTORATION DIRECTIVE)
Bagian ini mendokumentasikan hasil pengujian langsung pengguna terhadap aplikasi aktif (commit 9a8e7ea) yang memicu 7 (tujuh) masalah fungsional dan visual serius pada antarmuka mobile. Seluruh defek ini diuraikan dengan analisis akar masalah teknis dan instruksi kode perbaikan mutlak untuk dieksekusi oleh GROK BUILD.

## 27.1 Rincian 7 Defek Kritis Berdasarkan Laporan Nyata Pengguna
### 1. Defek 1: Kebocoran Teks Kapsul Memori ke Dasar Semua Halaman
Gejala: Teks "Kembali Kapsul memori. Kapsul masih kosong. Fakta yang kamu ajarkan di obrolan akan muncul di sini. Kosongkan semua" bocor dan terus menempel di bagian bawah setiap halaman aplikasi (Chat, Studio, Proyek, Koleksi, Artefak).
Akar Masalah: Elemen <section id="memory-capsule"> di-append ke #app tanpa aturan modal overlay di CSS (tidak memiliki position: fixed; inset: 0; z-index: 150). Saat dibuka, elemen menumpuk sebagai teks statis di dasar halaman dan tidak pernah disembunyikan.
Solusi Mutlak:
#memory-capsule {
position: fixed;
inset: 0;
z-index: 200;
background: var(--rg-bg, #fafaf8);
display: flex;
flex-direction: column;
padding: 16px;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
#memory-capsule[hidden] {
display: none !important;
}
Tombol #memory-back wajib menyembunyikan modal dengan root.hidden = true.

### 2. Defek 2: Posisi Tombol Kapsul Memori di Sidebar Memicu Scrollbar Mengganggu
Gejala: Di footer sidebar, teks tombol "Kapsul memori" ditempatkan di bawah kartu akun pengguna Maetalizer sehingga memicu munculnya bilah scroll vertikal yang memotong tampilan.
Akar Masalah: Tombol diletakkan di footer tanpa tata letak yang tepat di dalam alur navigasi utama.
Solusi Mutlak:
Hapus tombol teks <button class="side-link" data-open-memory="1">Kapsul memori</button> dari footer sidebar.
Pindahkan "Kapsul Memori" ke dalam kelompok menu "RUANG KERJA" di sidebar (sejajar di bawah Artefak) dengan ikon kapsul/otak SVG yang selaras dengan menu lainnya:
<button class="side-link" id="btn-side-memory" type="button" data-open-memory="1">
<svg class="side-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-2 7.2V17a3 3 0 0 0 3 3h1"/><path d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 2 7.2V17a3 3 0 0 1-3 3h-1"/><path d="M9 21h6"/><path d="M12 17v4"/></svg>
<span>Kapsul Memori</span>
</button>

### 3. Defek 3: Kotak Komposer Terangkat Melayang Terlalu Tinggi Saat Keyboard Muncul
Gejala: Saat mengetuk kotak input chat, keyboard virtual muncul dan kotak komposer terdorong melayang jauh ke tengah layar (terdapat jarak kosong raksasa 150–300px di atas keyboard).
Akar Masalah: Terjadi double-counting (penghitungan ganda) offset viewport:
Di css/reset.css, kontainer #app sudah memiliki height: var(--vvh, 100%) yang secara otomatis menyusut pas di atas keyboard.
Tetapi di js/chat/composer.js, Grok menambahkan lagi kode: if (card) card.style.paddingBottom = offset > 80 ? offset + 'px' : '';
Akibatnya, komposer terdorong dua kali lipat dan melayang tinggi ke tengah layar!
Solusi Mutlak: Hapus manipulasi card.style.paddingBottom dari composer.js. Cukup gunakan padding bawaan CSS pada #composer:
#composer {
padding: 8px 12px calc(8px + env(safe-area-inset-bottom));
}
Biarkan --vvh dari window.visualViewport di main.js mengatur tinggi layar tanpa penambahan padding inline buatan.

### 4. Defek 4 & 5: Bilah Atas Chat Harus Bersih — Hapus Ikon Redundan ⌘ dan Pertahankan Hanya 2 Ikon
Gejala: Ikon perintah ⌘ di kanan atas chat isinya menduplikasi menu sidebar/fitur lain, membingungkan pengguna ponsel, dan mempersempit judul.
Solusi Mutlak: Hapus total elemen <button id="btn-command-palette"> dari #topbar di index.html! Sudut kanan atas bilah obrolan utama HANYA BOLEH BERISI 2 IKON:
Ikon Obrolan Baru (#btn-new-chat-top): Ikon pensil/tulis untuk memulai percakapan baru.
Ikon Menu Tindakan (#btn-chat-more): Ikon titik tiga ⋮ untuk menu popover (Bagi Chat, Ekspor, Bersihkan Chat).
Catatan: Fitur Command Palette tetap dapat diakses di desktop via Ctrl+K / Cmd+K atau lewat gestur usap dua jari di ponsel.

### 5. Defek 6: Ikon Mikrofon Tidak Berfungsi / Tidak Memunculkan Izin Suara
Gejala: Mengetuk tombol mikrofon tidak merespons, tidak memunculkan popup izin browser, dan tidak merekam suara.
Akar Masalah: Di js/chat/voice.js, Grok mengganti sistem click toggle menjadi push-to-talk dengan pointerdown dan pointerup. Pada layar sentuh ponsel, pointerup langsung terpicu seketika saat jari diangkat (dalam hitungan milidetik), yang langsung memanggil rec.stop() sebelum dialog izin browser selesai diproses atau sebelum kata pertama terucap!
Solusi Mutlak: Kembalikan penanganan mikrofon di voice.js menjadi Click Toggle yang stabil:
bind() {
$('btn-stop').onclick = () => this.stop();
const btn = $('btn-voice-input');
if (!btn) return;
btn.onclick = (e) => {
e.preventDefault();
if (this.listening) {
this.stop();
} else {
this.listen();
}
};
}

### 6. Defek 7: Ikon Tulis / Obrolan Baru di Atas Tidak Berfungsi
Gejala: Mengetuk tombol pensil #btn-new-chat-top tidak merespons atau tidak membersihkan obrolan.
Akar Masalah: Tombol hanya memanggil side.click() yang tidak mengosongkan input, tidak memfokuskan kursor, dan tidak memberikan umpan balik jika sesi aktif sudah kosong.
Solusi Mutlak: Pasang handler langsung dan tuntas pada #btn-new-chat-top di js/ui/chat-options-menu.js:
const fresh = $('btn-new-chat-top');
if (fresh) {
fresh.onclick = (e) => {
e.stopPropagation();
store.set({ currentId: null });
const inp = $('chat-input');
if (inp) {
inp.value = '';
composer.autoGrow();
inp.focus();
}
chat.renderMessages();
history.render();
drawer.close();
router.go('chat');
haptics.tap(20);
toast.show('Obrolan baru siap');
};
}

### 7. Defek Tambahan: Halaman Artefak Berantakan Menempel (codeStudioPratinjauUnduh)
Gejala (Screenshot 1000003073): Filter kategori artefak menempel sebagai satu baris teks biasa tanpa tombol, dan isi kartu artefak menyatu menjadi satu kata tanpa spasi atau tata letak (codeStudioPratinjauUnduh).
Solusi Mutlak di css/ui/overhaul.css:
#artifact-filters {
display: flex;
gap: 6px;
overflow-x: auto;
white-space: nowrap;
padding-bottom: 8px;
margin: 10px 0 14px;
-webkit-overflow-scrolling: touch;
}
#artifact-filters button {
padding: 6px 14px;
border-radius: 999px;
background: var(--rg-surface);
border: 1px solid var(--rg-line);
font-size: 12px;
font-weight: 500;
color: var(--rg-text);
cursor: pointer;
}
#artifact-filters button.on {
background: #1a4b8c;
color: #fff;
border-color: #1a4b8c;
}
.artifact-card-page {
display: flex;
align-items: center;
justify-content: space-between;
gap: 12px;
padding: 12px 16px;
border: 1px solid var(--rg-line);
border-radius: 14px;
background: var(--rg-surface);
margin-bottom: 8px;
}
.artifact-card-page strong {
flex: 1;
font-size: 14px;
color: var(--rg-text);
}
.artifact-card-page span {
font-size: 11px;
text-transform: uppercase;
font-weight: 600;
color: var(--rg-muted);
background: var(--rg-surface-2);
padding: 2px 8px;
border-radius: 999px;
}
.artifact-card-page button {
padding: 6px 12px;
border-radius: 8px;
font-size: 12px;
font-weight: 500;
border: 1px solid var(--rg-line);
background: var(--rg-surface-2);
cursor: pointer;
}

## 27.2 Matriks Tugas Bab 14 Tambahan (Item 116 s/d 123)
No
Modul Target
Nama Fitur / Perbaikan Defek Kritis
Status
116
css/ui/overhaul.css
Fix Overlay Modal #memory-capsule Penuh (Cegah Bocor ke Bawah Halaman)
Siap Dikerjakan
117
index.html, css/layout/sidebar.css
Pindahkan Kapsul Memori ke Kelompok Menu RUANG KERJA Sidebar
Siap Dikerjakan
118
js/chat/composer.js
Hapus Double-Counting Keyboard Offset (Cegah Komposer Melayang Tinggi)
Siap Dikerjakan
119
index.html, css/layout/shell.css
Hapus Ikon ⌘ di Topbar (Pertahankan Hanya Chat Baru & Menu Titik Tiga)
Siap Dikerjakan
120
js/chat/voice.js
Kembalikan Mikrofon ke Click Toggle (Pulihkan Fungsi Izin Suara Mobile)
Siap Dikerjakan
121
js/ui/chat-options-menu.js
Handler Langsung #btn-new-chat-top (Reset Sesi, Kosongkan & Fokus Input)
Siap Dikerjakan
122
css/ui/overhaul.css, js/artifacts/artifacts.js
Perbaikan Tata Letak Halaman Artefak & Filter Tab Horizontal Scrollable
Siap Dikerjakan
123
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 27 ke Repositori Lokal
Siap Dikerjakan
# 43. MANDAT RESMI AUDIT TOTAL, KRITIK TAJAM, DAN PENUTUPAN SELURUH CELAH OLEH GROK BUILD: GERBANG KONSOLIDASI MENUJU PRD ANTARMUKA VERSI 2.0 (OKTOBER 2026)
## 43.1 Latar Belakang & Urgensi Mandat Audit Menyeluruh
Dokumen PRD Antarmuka telah berkembang menjadi cetak biru berskala besar yang merekam evolusi arsitektur Rategoan dari Bab 1 hingga Bab 42. Sebelum seluruh spesifikasi ini dikonsolidasikan dan disegel ke dalam dokumen bersih PRD ANTARMUKA VERSI 2.0 (Fresh Master Blueprint), agen pelaksana utama—Grok Build—secara resmi diberikan mandat untuk melakukan peninjauan kritis menyeluruh (comprehensive system review & sharp critique).
Grok Build diwajibkan memeriksa seluruh pekerjaan yang telah diselesaikan, mencari celah sekecil apa pun, menemukan kelemahan arsitektur, dan menyempurnakan seluruh titik friksi sebelum tongkat estafet beralih ke Versi 2.0.
## 43.2 Lima Dimensi Audit & Kritik Tajam yang Wajib Dieksekusi Grok Build
Grok Build diwajibkan membedah basis kode melalui 5 lensa kritis berikut:
                  5 DIMENSI AUDIT KRITIS OLEH GROK BUILD
┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│ 1. ERGONOMI PONSEL (MOBILE UX)  │ 2. KELENGKAPAN FITUR (NO STUB)  │ 3. KEAMANAN & RETENSI DATA      │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ • Pastikan zero horizontal      │ • Dilarang ada tombol pajangan! │ • Audit sanitasi escapeHtml() di│
│   scroll di seluruh halaman.    │ • Fitur sematkan berkas proyek  │   semua tampilan teks dinamis.  │
│ • Proyek wajib model 2-state.   │   harus fungsional (bisa pilih  │ • Karantina token konektor agar │
│ • Koleksi bebas dari deretan    │   file dan masuk ke context).   │   tidak bocor ke berkas cadangan│
│   filter (0) saat kosong.       │ • Tombol Pratinjau Studio wajib │   obrolan (.rategoan.json).     │
│ • Komposer 100% zero-chip teks. │   sembunyi saat di tab Python.  │                                 │
├─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┤
│ 4. KEBERSIHAN KODE & RESILIENSI                                   │ 5. GERBANG PENGUJIAN MUTLAK     │
├───────────────────────────────────────────────────────────────────┼─────────────────────────────────┤
│ • Bersihkan 32 blok silent catch (e) {} dengan logging terukur.   │ • Wajib 17/17 subtest npm test  │
│ • Pastikan kode bersih total dari sisa komentar usang (zero-comm).│   lulus tanpa kegagalan.        │
│ • Pastikan tidak ada variabel global tak terdefinisi.             │ • Wajib npm run lint 100% hijau │
│                                                                   │   (208 file, 3934 entri valid). │
└───────────────────────────────────────────────────────────────────┴─────────────────────────────────┘
## 43.3 Matriks Penugasan Audit & Penyempurnaan Akhir (Tugas No. 211 s/d 215)
No
Fokus Pemeriksaan
Pertanyaan Uji Kritis untuk Grok Build
Standar Kelulusan yang Wajib Dicapai
Status
211
Audit Total Halaman Proyek
Apakah textarea instruksi masih mengambang saat proyek kosong? Apakah tombol sematkan berkas sudah bisa memilih file nyata?
Terapkan 2-state murni: State Kosong hanya menampilkan kartu buat proyek + template; State Aktif menampilkan instruksi & daftar berkas tersemat fungsional.
MANDAT WAJIB
212
Audit Total Halaman Koleksi
Apakah masih ada dua tombol "+ Catatan"? Apakah filter chips masih memuat angka nol saat kosong?
Sembunyikan baris filter chips saat koleksi kosong; satukan tombol catatan; pastikan transisi tab segmented control mulus.
MANDAT WAJIB
213
Audit Studio Kode & Konektor
Apakah Studio Kode benar-benar terkunci dari geser kiri-kanan? Apakah tombol Hubungkan dan Token sudah sejajar horizontal?
Kunci #view-studio: overflow-x: hidden;; grid 3 berkas pas 100%; .hub-card-side sejajar horizontal berdampingan.
MANDAT WAJIB
214
Audit Resiliensi & Silent Catch
Apakah masih ada error yang ditelan mentah-mentah oleh blok catch (e) {} kosong?
Ganti seluruh blok silent catch kritis di main.js, composer.js, dan voice.js dengan console.warn('[Rategoan Fallback]', e).
MANDAT WAJIB
215
Audit Integritas Linter & Tes
Apakah seluruh pengujian dan skema data lulus sempurna sebelum komit?
Jalankan npm test (17 pass) dan npm run lint (100% lulus, 0 warning/error).
MANDAT WAJIB
## 43.4 Protokol Transisi Menuju PRD ANTARMUKA VERSI 2.0 (The Fresh Blueprint)
Setelah Grok Build mengeksekusi peninjauan kritis ini, menutup seluruh celah di atas, dan memastikan hasil kerja di egoan.vercel.app tampil sempurna tanpa cacat, alur transisi dilaksanakan secara ketat berdasarkan protokol dua tahap berikut:
Tahap 1: Penyegelan & Perubahan Nama "PRD antarmuka 1.0":
Tahap 2: Penerbitan "PRD ANTARMUKA VERSI 2.0":Setelah seluruh pekerjaan audit dan perbaikan pada Bab 43 ini dituntaskan secara sempurna oleh Grok Build dan diverifikasi pada egoan.vercel.app, dokumen ini secara resmi diberi tanda dan diubah nama berkasnya menjadi "PRD antarmuka 1.0" (baik judul dokumen di Google Drive maupun lokasi berkas di repositori docs/PRD/PRD-ANTARMUKA-1.0.md).
Di bagian header dokumen ditandai segel permanen: [STATUS: VERSI 1.0 KANONIKAL - DISEGEL TUNTAS (SEALED)].

Baru setelah penyegelan dan perubahan nama berkas "PRD antarmuka 1.0" tersebut selesai, kita resmi membuka lembaran baru dan menerbitkan dokumen bersih: "PRD ANTARMUKA VERSI 2.0" yang fresh, padat, dan bebas dari riwayat per-bab masa lalu.
# 42. MASTER AUDIT CELAH SISTEM, KONTROL KUALITAS KODE (QC), DAN REKOMENDASI ARSITEKTUR APLIKASI AI MODERN (OKTOBER 2026)
## 42.1 Latar Belakang & Audit Mendalam Sistem Terpadu
Audit rekayasa menyeluruh terhadap basis kode Rategoan (292 berkas JS/MJS, CSS overhaul, dan pipeline data) mengidentifikasi 4 celah teknis, 3 potensi titik kegagalan (code smells), serta peluang adopsi standar industri AI modern terkini:
Celah Pematrian Berkas Proyek (Missing Pinned-Files UI): Logika penyuntikan berkas rujukan proyek ke prompt sistem di composer.js:328 telah aktif, namun antarmuka #project-drop tidak memiliki tombol file picker atau drag-and-drop nyata.
Celah Tombol Pratinjau Studio pada Mode Python: Tombol [ Pratinjau ] tetap aktif saat tab Python dipilih, padahal Python berjalan via konsol terminal Pyodide dan tidak menghasilkan pratinjau HTML.
Celah Retensi Data Lokal (Ephemeral Storage Risk): Ketiadaan peringatan pencadangan .rategoan.json membuat pengguna berisiko kehilangan seluruh proyek dan catatan emas jika browser melakukan pembersihan cache atau berada di mode privat/incognito.
Penyakit Silent Catch (32 Blok Kosong): Terdapat 32 blok catch (e) {} tanpa pencatatan peringatan di main.js, composer.js, dan voice.js yang menyulitkan diagnosa kegagalan pada peramban bergerak tertentu.
## 42.2 Lima Rekomendasi Fitur Frontier AI Modern untuk Rategoan (Zero-Cost & Sovereign)
Untuk menempatkan Rategoan sejajar dengan platform AI global terdepan (Claude 3.5, ChatGPT 4o, Cursor AI, Perplexity Pro, dan NotebookLM) dengan tetap menjaga kedaulatan 100% lokal dan bebas biaya API:
                  REKOMENDASI 5 FITUR APLIKASI AI MODERN
┌─────────────────────────────────┬─────────────────────────────────┬─────────────────────────────────┐
│ FITUR & STANDAR INDUSTRI        │ KONSEP & NILAI PENGGUNA         │ MEKANISME REKAYASA DI RATEGOAN  │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 1. Split-Screen Artifact Canvas │ Layar membelah interaktif untuk │ Memanfaatkan iframe sandbox     │
│    (Standar Claude Artifacts)   │ melihat kode, web app, dan slide│ #artifact-inline menjadi panel  │
│                                 │ live berdampingan dengan chat.  │ geser split-screen mulus.       │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 2. "Pin to Project" Sekali Klik │ Menyematkan teks/jawaban emas   │ Menambahkan tombol aksi pada    │
│    (Standar Claude Projects)    │ dari chat langsung ke memori    │ menu balasan: "Sematkan ke      │
│                                 │ permanen proyek aktif.          │ Proyek" -> project.pinnedFiles. │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 3. Deep Research Visual Trace   │ Garis waktu visual proses riset │ Memanfaatkan #thought-accordion │
│    (Standar Perplexity / Manus) │ multi-langkah (kueri -> baca web│ untuk menampilkan progres riset │
│                                 │ -> QC filter -> sintesis akhir).│ transparan yang dapat dilipat.  │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 4. Percabangan Obrolan (Fork)   │ Mengedit pesan lama dan membuat │ Menambahkan tombol edit pesan   │
│    (Standar ChatGPT Branching)  │ cabang eksplorasi baru tanpa    │ untuk memicu sesi duplikat baru │
│                                 │ merusak riwayat utama.          │ dari titik pesan tersebut.      │
├─────────────────────────────────┼─────────────────────────────────┼─────────────────────────────────┤
│ 5. Ringkasan Audio Berdaulat    │ Mengubah dokumen/chat panjang   │ Memanfaatkan Web Speech API     │
│    (Standar NotebookLM Audio)   │ menjadi intisari audio suara    │ native di voice.js tanpa butuh  │
│                                 │ yang bisa dijeda dan dilanjut.  │ server TTS komersial berbayar.  │
└─────────────────────────────────┴─────────────────────────────────┴─────────────────────────────────┘
## 42.3 Matriks Penugasan Rekayasa Kode & QC (Tugas No. 206 s/d 210)
No
Modul Target
Masalah / Kebutuhan
Rekayasa QC & Peningkatan Kode
Status
206
Proyek: Realisasi Pematrian Berkas Lengkap
Pinned files belum punya antarmuka unggah berkas.
Sediakan tombol [+ Sematkan Berkas] dengan <input type="file" id="project-file-pick">. Simpan nama dan cuplikan teks ke project.pinnedFiles agar otomatis terinjeksi ke chat.
MANDAT WAJIB
207
Koleksi: Desain Segmented Tab & Smart Header
Tab kaku dan tombol ganda.
Perhalus tab Tersimpan vs Perpustakaan menjadi segmented control bersudut membulat halus; sembunyikan filter chips saat item = 0; satukan aksi tombol catatan.
MANDAT WAJIB
208
Studio Kode: Isolasi Pratinjau Python
Tombol Pratinjau aktif di Python.
Sembunyikan #studio-preview secara dinamis saat lang === 'python'; hanya tampil di javascript.
MANDAT WAJIB
209
QC Kode: Pembersihan Silent Catch & Logging Terukur
32 blok catch (e) {} menelan potensi eror.
Ganti blok kosong kritis dengan console.warn('[Rategoan Fallback]', e) di main.js, composer.js, dan voice.js untuk memudahkan pelacakan stabilitas.
MANDAT WAJIB
210
Fitur Cepat: Tombol "Sematkan ke Proyek" di Balasan Chat
Sulit memindahkan teks obrolan ke proyek.
Di menu titik tiga balasan AI (buildActions), tambahkan opsi Sematkan ke Proyek Aktif yang langsung memasukkan kutipan ke pinnedFiles proyek.
MANDAT WAJIB
## 42.4 Panduan Langkah Implementasi untuk Grok Build
js/project/project.js & index.html:
Tambahkan input berkas: <input type="file" id="project-file-pick" hidden multiple accept=".txt,.md,.pdf,.csv,.json">.
Di project.js, buat fungsi bindProjectFiles(): ketika pengguna memilih berkas, ekstrak teksnya (menggunakan attach.handleFile atau FileReader) dan masukkan objek { name: f.name, textContent: text, size: f.size } ke cur.pinnedFiles, lalu simpan via workspace.update().
Render daftar berkas tersemat dalam kartu bersih dengan tombol silang hapus.
js/chat/chat.js (Sematkan ke Proyek dari Chat):
Pada buildActions(text):
const pinProjBtn = document.createElement('button');
pinProjBtn.type = 'button';
pinProjBtn.textContent = 'Sematkan ke Proyek';
pinProjBtn.onclick = () => {
const cur = workspace.current();
if (!cur) return toast.show('Pilih atau buat proyek dulu');
cur.pinnedFiles = cur.pinnedFiles || [];
cur.pinnedFiles.push({ name: 'Kutipan Obrolan', textContent: text.slice(0, 1000), size: text.length });
workspace.update(cur.id, { pinnedFiles: cur.pinnedFiles });
toast.show('Disematkan ke proyek ' + cur.name);
menu.hidden = true;
};
menu.appendChild(pinProjBtn);
js/studio/studio.js:
Di fungsi pick(next):
const prev = $('studio-preview');
if (prev) prev.hidden = (next === 'python');
Kepatuhan Gerbang Uji Mutlak:
Jalankan npm test (17/17 lulus).
Jalankan npm run lint (100% lulus, validasi skema 208 berkas 3.934 entri OK).
## 27.3 Standar Operasional Prosedur (SOP) GROK BUILD: Audit Visual Live, Real-Time Browser Testing, dan Verifikasi Screenshot via Playwright
### Latar Belakang Mandat
Pengujian sebelumnya membuktikan bahwa lulus uji unit test berbasis Node.js (14/14 unit test) tidak menjamin antarmuka bebas cacat visual. Tes logika headless tidak dapat mendeteksi masalah tata letak CSS seperti kebocoran modal overlay (z-index / position: fixed), pemotongan kontainer flexbox, scrollbar ganda liar di sidebar, kegagalan event layar sentuh mobile (pointerup vs click), atau fenomena double-counting viewport saat keyboard virtual muncul.
Sebagai platform rekayasa modern yang memiliki kapabilitas live preview, browser execution, dan integrasi Playwright/Puppeteer/headless browser, GROK BUILD DIWAJIBKAN menerapkan prosedur verifikasi visual berdampingan secara real-time sebelum menyelesaikan tugas.
### Instruksi Mandat Eksekusi untuk GROK BUILD:
Jalankan Sesi Browser Berdampingan (Dual-Viewport Testing):
Uji antarmuka secara aktif pada 2 mode resolusi:
Mobile Emulation: Viewport 375×667 (iPhone SE) dan 390×844 (iPhone 14) atau 412×915 (Android) dengan sentuhan aktif (touch-enabled).
Desktop Mode: Viewport 1280×800.
Inspeksi Visual Live & Pengambilan Tangkapan Layar (Screenshot Audit):
Ambil full-page screenshot dan viewport screenshot pada seluruh alur kritis:
Halaman Chat saat status kosong, saat berdialog, dan saat kotak input aktif (simulasi kemunculan keyboard virtual — pastikan komposer tidak melayang ke angkasa).
Halaman Kapsul Memori saat dibuka dan ditutup (pastikan tidak ada teks yang bocor ke dasar halaman Chat, Studio, Proyek, Koleksi, dan Artefak).
Sidebar navigasi saat dibuka (pastikan area footer bersih, tidak ada scrollbar vertikal liar di bawah kartu profil).
Halaman Artefak (pastikan tombol filter berupa pil terpisah dan kartu artefak tidak menyatu menjadi teks padat).
Pencarian Proaktif Bug Tersembunyi (Bug Hunting & Edge Cases):
Grok Build harus secara aktif menguji:
Overflow check: Apakah ada teks atau elemen yang terpotong di layar sempit?
Hit-target accessibility: Apakah semua tombol (mikrofon, pensil chat baru, titik tiga, filter artefak) memiliki area sentuh minimal 44×44px dan merespons ketukan dengan benar?
Console Error check: Pastikan tidak ada unhandled promise rejection, TypeError, atau 404 resource request di browser console log.
Iterasi Perbaikan Seketika:
Jika pada tangkapan layar atau uji interaktif ditemukan kejanggalan visual sekecil apa pun, Grok Build wajib langsung memperbaikinya pada siklus kerja yang sama tanpa menunggu laporan dari pengguna.

# 28. EVALUASI ARSITEKTUR TAHAP 14: PEMINDAHAN KAPSUL MEMORI KE PENGATURAN, ERGONOMI SIDEBAR & RIWAYAT CHAT, TRANSISI TEMA INSTAN, SERTA PEROMBAKAN TOTAL KOLEKSI DAN PROYEK
Berdasarkan pengujian komprehensif pada versi commit terbaru pasca audit Playwright dan inspeksi visual 10 tangkapan layar langsung pengguna, bab ini menetapkan cetak biru arsitektur untuk menyempurnakan 8 modul utama, memecahkan masalah kesesakan sidebar, menempatkan Kapsul Memori pada posisi alaminya di Pengaturan, serta menghilangkan jeda (delay) transisi tema.

## 28.1 Klasifikasi Status Kemajuan 8 Modul Aplikasi
Kategori Kemajuan
Modul
Kondisi Lapangan & Arah Penyempurnaan
Sangat Bagus (Tingkatkan)
1. Studio Kode
Editor CodeMirror gelap, penomoran baris, eksekusi JS/Pyodide, dan konsol output sudah sangat fungsional. Tingkatkan dengan shortcut eksekusi cepat dan panel responsif.

2. Artefak
Pemisahan tata letak filter pil horizontal dan kartu artefak (badge CODE, tombol Pratinjau & Unduh) sukses memecahkan bug teks menempel. Tingkatkan dengan pratinjau inline HTML/SVG.

3. Konektor
Tata letak kartu konektor (Terhubung vs Unggulan) sangat elegan dan informatif. Tingkatkan dengan modal konfigurasi API key langsung untuk Google Drive, GitHub, dsb.
Sedang (Wajib Ditingkatkan)
1. Sidebar
Terasa sangat sesak di layar mobile karena penumpukan menu vertikal sehingga daftar riwayat chat terpotong/tersembunyi.

2. Halaman Utama
Tata letak chat stabil, namun transisi tema terasa lag/delay dan drawer lampiran membutuhkan sentuhan interaktivitas lebih halus.

3. Proyek
Kerangka form pembuatan proyek sudah ada, namun belum memiliki visualisasi proyek aktif yang kaya dan pengaitan instruksi obrolan yang mulus.
Kurang (Wajib Rombak Total)
1. Koleksi
Masih memakai window.prompt() purba yang memicu dialog browser jelek di HP. Butuh modal dialog modern untuk tambah catatan, filter responsif, dan card rendering visual.

2. Kapsul Memori
Tampilan terlalu hampa, belum ada form tambah memori manual terstruktur, dan penempatannya di sidebar mengorbankan ruang riwayat chat.

## 28.2 Rekomendasi Arsitektural: Pemindahan Kapsul Memori ke Halaman Pengaturan
### Analisis & Keputusan
Menempatkan Kapsul Memori di dalam Pengaturan (Settings) adalah langkah yang 100% tepat dan sesuai standar industri modern (sebagaimana diterapkan ChatGPT pada Settings -> Personalization -> Memory, dan Claude pada Settings -> Custom Instructions):
Pembersihan Sidebar: Mengurangi 1 elemen menu utama di RUANG KERJA sidebar sehingga ruang vertikal riwayat chat menjadi jauh lebih lega.
Kesesuaian Konseptual: Memori, fakta pengguna, dan preferensi AI pada dasarnya adalah bagian dari manajemen data profil pengguna, bukan alat kerja harian yang dibuka setiap menit.
Penyatuan Menu Pengaturan:
Di halaman Pengaturan (#view-settings), Kapsul Memori ditempatkan di bawah kategori Data atau dibuatkan baris menu khusus:
<div class="settings-group">
<button class="settings-row" id="btn-settings-memory" type="button">
<div class="settings-row-icon">
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a5 5 0 0 0-5 5v1a4 4 0 0 0-2 7.2V17a3 3 0 0 0 3 3h1"/><path d="M12 2a5 5 0 0 1 5 5v1a4 4 0 0 1 2 7.2V17a3 3 0 0 1-3 3h-1"/><path d="M9 21h6"/><path d="M12 17v4"/></svg>
</div>
<div class="settings-row-text">
<strong>Kapsul Memori</strong>
<span>Kelola fakta, preferensi, dan instruksi tersimpan</span>
</div>
<svg class="chevron-icon" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
</button>
</div>

## 28.3 Rekayasa Ergonomi Sidebar: Mengatasi Kesesakan & Memberi Ruang Luas untuk Riwayat Chat
### Akar Masalah Kesesakan Sidebar
Di layar HP dengan tinggi 650–840px, elemen .zone-top memakan lebih dari 450px:
Header brand Rategoan
Kicker UTAMA + 3 tombol (Chat Baru, Studio Kode, Proyek)
Kicker RUANG KERJA + 4 tombol (Koleksi, Konektor, Artefak, Kapsul Memori)
Garis divider horizontal
Footer kartu pengguna Maetalizer setinggi 70px
Sisa ruang untuk .zone-bottom (Riwayat Chat) hanya sekitar 100–150px. Begitu input pencarian riwayat dipasang, daftar obrolan #history-list terhimpit menjadi nol atau tertutup.
### Solusi Rekayasa Layout Presisi:
Pindahkan Kapsul Memori: Mengurangi beban RUANG KERJA menjadi hanya 3 item (Koleksi, Konektor, Artefak).
Kompaktifikasi Padding & Font Menu:
.side-link {
padding: 8px 10px;
font-size: 13.5px;
gap: 9px;
}
.side-kicker {
margin: 8px 0 4px 6px;
font-size: 10.5px;
text-transform: uppercase;
letter-spacing: 0.8px;
color: var(--rg-muted);
}
Prioritaskan Wadah Riwayat Chat (.zone-bottom):
Berikan .zone-bottom flex priority tinggi dan batas scroll independen yang nyaman:
.zone-bottom {
flex: 1 1 auto;
min-height: 220px;
overflow-y: auto;
-webkit-overflow-scrolling: touch;
}
#history-list {
max-height: none;
overflow-y: visible;
}
Header Riwayat Ringkas: Satukan judul "Riwayat" dengan kolom pencarian menjadi satu baris minimalis atau input pencarian elegan yang menghemat 30px ruang vertikal.

## 28.4 Eliminasi Delay Transisi Dark/Light Mode: Penghapusan theme-veil 160ms
### Akar Masalah Lag / Delay
Di dalam berkas js/state/theme.js, fungsi penggantian tema sengaja dipasang penghambat buatan:
applyWithVeil() {
const veil = document.getElementById('theme-veil');
if (!veil) { this.apply(); return; }
veil.classList.add('show');
setTimeout(() => {
this.apply();
setTimeout(() => veil.classList.remove('show'), 20);
}, 160); // <-- MENYEBABKAN JEDA 160ms YANG MEMBUAT TAMPILAN NYENDAT!
}
Lapisan gelap #theme-veil berkedip selama 160ms, menciptakan efek visual patah-patah (stutter) yang terasa lambat di perangkat mobile.
### Solusi Presisi (Native & Instant):
Ganti applyWithVeil() dengan transisi instan atau View Transitions API standar browser:
set(v) {
this.value = v;
localStorage.setItem(this.KEY, v);
if (document.startViewTransition) {
document.startViewTransition(() => this.apply());
} else {
this.apply();
}
}
Hapus pemanggilan #theme-veil sehingga pergantian tema berjalan instan 60 FPS tanpa jeda dan tanpa kedipan gelap yang mengganggu.

## 28.5 Perombakan Total Halaman Koleksi: Eliminasi window.prompt() & Desain Kartu Interaktif
### Kelemahan Saat Ini
Tombol "Buat catatan koleksi" memanggil fungsi browser primitif window.prompt('Catatan koleksi') dan window.prompt('Tag'). Ini merusak pengalaman aplikasi modern dan sering kali macet di PWA mobile.
### Solusi Modern Koleksi:
Modal Form Pembuatan Catatan Koleksi (#modal-coll-create):
Sediakan modal dialog elegan dengan:
Kolom input Judul Catatan.
Pilihan Tag Chips interaktif (Prompt, Kode, Riset, Fakta, Web, Dokumen).
Textarea Catatan / Kutipan.
Tombol [Batal] dan [Simpan ke Koleksi].
Tampilan Kartu Catatan Koleksi yang Kaya:
Setiap kartu menampilkan:
Chip Tag warna-warni (misal: biru untuk Kode, hijau untuk Prompt, ungu untuk Riset).
Waktu pembuatan (relative time, misal: "2 jam lalu").
Kutipan isi catatan dengan pembatasan 3 baris (line-clamp).
Tombol aksi cepat: [Salin], [Kirim ke Chat], dan [Hapus].

## 28.6 Peningkatan Halaman Proyek & Kapsul Memori Modern
### 1. Upgrade Halaman Proyek:
Visualisasi Kartu Proyek Aktif: Ketika pengguna memilih salah satu template (Riset Akademik, Pengembangan Web, Naskah, Bisnis), sistem menampilkan kartu status proyek aktif dengan ikon, deskripsi lingkup kerja, dan daftar berkas yang tersemat (attached files).
Integrasi Instruksi Kontekstual: Instruksi proyek secara otomatis diinjeksi ke dalam memori sesi percakapan obrolan saat proyek diaktifkan.
### 2. Upgrade Kapsul Memori di Pengaturan:
Header Elegan & Kartu Statistik: Menampilkan total fakta yang diingat AI (misal: "12 Fakta Tersimpan").
Kategori Memori yang Rapi: Pengelompokan fakta menjadi 4 tab/kategori: Identitas Diri, Preferensi AI, Kebiasaan Kerja, dan Instruksi Khusus.
Tombol Tambah Memori Terstruktur: Membuka modal popover "Tambah Fakta Baru" (Kunci & Nilai) tanpa menggunakan prompt browser.

## 28.7 Matriks Tugas Bab 14 Tambahan (Item 124 s/d 135)
No
Modul Target
Nama Fitur / Perbaikan Arsitektur
Status
124
index.html, js/ui/memory-capsule.js
Pindahkan Kapsul Memori dari Sidebar ke Halaman Pengaturan (#view-settings)
Siap Dikerjakan
125
css/layout/sidebar.css, index.html
Restrukturisasi Layout Sidebar Mobile (Kompaktifikasi Menu, Longgarkan Riwayat Chat)
Siap Dikerjakan
126
js/state/theme.js, css/ui/toast.css
Eliminasi Delay theme-veil 160ms, Terapkan Instant/View-Transition Switch
Siap Dikerjakan
127
js/collection/collection.js
Hapus Archaic window.prompt(), Bangun Modal Form Dialog Buat Catatan Koleksi
Siap Dikerjakan
128
css/collection/collection.css
Styling Kartu Koleksi Modern (Tag Chips, Copy-to-Chat, Format Timestamp)
Siap Dikerjakan
129
js/ui/memory-capsule.js, css/settings/settings.css
Upgrade UI Kapsul Memori di Pengaturan (Statistik Fakta, Kategori Tab, Tambah Manual)
Siap Dikerjakan
130
js/projects/projects.js
Peningkatan Interaktivitas Proyek (Kartu Proyek Aktif, Quick Template Action)
Siap Dikerjakan
131
js/studio/studio.js
Penyempurnaan Studio Kode (Shortcut Eksekusi Cepat, Export Snippet to Artifact)
Siap Dikerjakan
132
js/artifacts/artifacts.js
Integrasi Pratinjau Artefak Inline HTML/SVG/Markdown
Siap Dikerjakan
133
js/connect/connect.js
Modal Pengaturan Kredensial & API Key Konektor Unggulan
Siap Dikerjakan
134
tests/playwright/ui-audit.spec.js
Penambahan Skrip Uji Playwright untuk Verifikasi Sidebar, Tema, & Form Koleksi
Siap Dikerjakan
135
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 28 ke Repositori Lokal
Siap Dikerjakan

# 29. BLUEPRINT EKOSISTEM AI MODERN: STREAMLINING AKSI OBROLAN, QUICK-TOGGLE KOMPOSER, GESTUR SWIPE 60 FPS, SERTA ARSITEKTUR COWORK, SKILLS, DAN SCHEDULER
## 29.1 Streamlining Tombol Aksi Balasan Pesan (Minimalist Icon Toolbar)
Ganti tombol pil teks lebar ([Salin], [Baca], [Bagikan], [Simpan]) di bawah pesan AI dengan bilah 4 ikon ringkas tanpa teks (width/height 32px): Salin, Baca Suara (TTS), Simpan (Bookmark), dan Titik Tiga (More). Ini menghemat 70% ruang horizontal dan mencegah horizontal scrollbar di layar ponsel 375-390px.
## 29.2 Koreksi Visual Sidebar: Netralkan Tombol Chat Baru
Hapus kelas .active otomatis dan CSS outline/focus dari tombol #btn-new-chat saat sidebar dibuka. Tombol Chat Baru adalah pemicu aksi (action button), bukan penanda halaman aktif. Hanya riwayat chat aktif di #history-list yang boleh ditandai aktif.
## 29.3 Ergonomi Komposer: Quick-Toggle Mode Langsung di Bilah Input
Tambahkan tombol toggle ikon langsung di toolbar komposer di samping pemilih model:
Ikon Bola Dunia (Pencarian Web) dengan indikator titik biru menyala saat aktif.
Ikon Presentasi (Mode Slide PPTX).
Ikon Otak/Petir (Mode Berpikir Keras).
Pengguna dapat mengaktifkan fitur pencarian atau slide dengan satu ketukan instan tanpa harus membuka drawer lampiran (+).
## 29.4 Peningkatan Kehalusan Gestur (Swipe, Slide, & Momentum Scrolling 60 FPS)
Terapkan pointer-drag tracking dengan momentum velocity pada js/ui/drawer.js agar sidebar dapat digeser keluar-masuk mengikuti jari secara mulus.
Terapkan contain: paint, will-change: transform, dan -webkit-overflow-scrolling: touch pada seluruh kontainer scrollable.
## 29.5 Transformasi Ekosistem AI Modern Rategoan
Coder & Sandbox Execution Studio: Multi-file virtual workspace (HTML/CSS/JS) dengan live iframe preview berdampingan dan ekspor zip/GitHub.
Cowork / Canvas Mode: Tampilan split-screen kolaboratif untuk pengeditan dokumen dan kode secara bersamaan dengan inline AI highlighting dan diff viewer.
Modular Skills System: Registry keahlian khusus berbasis agen yang dapat dibuat pengguna (user-defined skills) dan dipanggil otomatis sesuai kebutuhan konteks.
Autonomous Scheduler & Cron Agents: Pemantau web periodik, pengingat harian, dan sinkronisasi tugas otomatis ke Google Calendar dan Google Tasks.
## 29.6 Matriks Tugas Bab 14 Tambahan (Item 136 s/d 145)
No
Modul Target
Nama Fitur / Perbaikan Arsitektur
Status
136
js/chat/chat.js
Ganti tombol aksi teks balasan dengan minimalist icon toolbar (Salin, Baca, Simpan, ⋮)
Siap Dikerjakan
137
css/layout/sidebar.css
Hapus state aktif otomatis dari tombol Chat Baru di sidebar
Siap Dikerjakan
138
js/chat/composer.js
Tambahkan quick-toggle icons (Web Search & Slide) di samping model picker di komposer
Siap Dikerjakan
139
css/chat/composer.css
Styling quick-toggle buttons dengan status aktif menyala di css/chat/composer.css
Siap Dikerjakan
140
js/ui/drawer.js
Terapkan touch momentum dan smooth swipe-to-close pada sidebar drawer
Siap Dikerjakan
141
js/studio/
Rancang multi-file virtual Coder sandbox dengan live preview di js/studio/
Siap Dikerjakan
142
js/cowork/
Rancang arsitektur Cowork / Canvas split-screen mode di js/cowork/
Siap Dikerjakan
143
raget/raget-skills/
Bangun kerangka kerja Modular Skills System di raget/raget-skills/
Siap Dikerjakan
144
raget/raget-scheduler/
Bangun Autonomous Agent Scheduler di raget/raget-scheduler/
Siap Dikerjakan
145
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 29 ke repositori lokal
Siap Dikerjakan
# 39. SPESIFIKASI ELIMINASI BUG GESER LAYAR STUDIO, RESTRUKTURISASI TEMPLATE PROYEK TANPA SLIDE, PERAPIAN TIPOGRAFI ARTEFAK, DAN PENEGASAN ZERO-CHIP KOMPOSER (OKTOBER 2026)
## 39.1 Latar Belakang & Analisis Hasil Uji Nyata Ponsel (Tangkapan Layar 17:28–17:40 WIB)
Berdasarkan audit hasil uji coba langsung pengguna pada perangkat bergerak (tangkapan layar pukul 17:28–17:40 WIB di egoan.vercel.app), ditemukan lima titik friksi visual dan interaksi yang mendesak untuk disempurnakan:
Komposer Masih Memunculkan Chip Teks (1000003873.jpg): Saat toggle Pencarian Web dinyalakan, chip teks "[Pencarian Web x]" dan placeholder "Cari di internet…" masih muncul di dalam kotak input keyboard, belum dihapus dari berkas attach.js dan composer.js.
Bug Geser Kiri-Kanan & Kepadatan Ekstrem di Studio Kode (1000003874.jpg & 1000003875.jpg): Baris berkas virtual (.studio-files) dipadukan dengan tombol aksi (#studio-copy dan #studio-zip) pada satu baris sempit dengan overflow-x: auto;. Akibatnya, tombol script.js terpotong menjadi "s...", tombol Ekspor zip terpotong sebagian di kanan, dan seluruh halaman terasa bergoyang/bisa digeser horizontal ke kiri-kanan layaknya bug. Pengguna secara tegas menginstruksikan: tidak usah dibuat model geser/slide untuk pilihan berkas HTML/JS dan hilangkan kesan sesak di bagian atas!
Template Halaman Proyek Terpotong Model Geser (1000003877.jpg): Template proyek (.project-templates) dijadikan baris horizontal geser (overflow-x: auto; white-space: nowrap;), menyebabkan template "Naskah" dan "Dokumen bisnis" terpotong di tepi kanan layar. Pengguna secara eksplisit meminta: jangan pakai model geser untuk bagian atas proyek!
Tipografi Kartu Artefak Berantakan (1000003876.jpg): Teks metadata waktu dan format disatukan ke dalam satu pill badge sebelah kiri (JS · 4 OKT, 06.49) dengan huruf kapital semua (text-transform: uppercase;). Akibatnya teks melipat menjadi dua baris kaku ("JS · 4 OKT," di baris 1 dan "06.49" di baris 2), terlihat sesak dan tidak rapi.
Tombol Konektor Masih Bertumpuk Vertikal (1000003880.jpg): Tombol Hubungkan dan Token pada kartu Google Drive dan GitHub masih bertumpuk vertikal (flex-direction: column) di sisi kanan, belum diperbaiki menjadi horizontal berdampingan.
## 39.2 Matriks Spesifikasi & Solusi Rekayasa Antarmuka (Tugas No. 196 s/d 200)
No
Modul Target
Kondisi Eksisting
Rekayasa Baru yang Wajib Diterapkan
Status
196
Komposer: Eliminasi Total Chip Teks
modeRow masih dirender di attach.js; placeholder berubah ke "Cari di internet…".
Hapus total blok modeRow dari renderChip() di attach.js. #attach-row HANYA untuk berkas fisik (foto/file). Placeholder dikunci mutlak "Tanya Rategoan". Indikator aktif HANYA ikon menyala di baris bawah (.quick-toggle.on).
MANDAT WAJIB
197
Studio Kode: Zero Horizontal Scroll & Anti-Sesak
.studio-filebar bergeser horizontal (overflow-x: auto), tombol terpotong ("s..."), sesak 3 baris.
Hilangkan overflow-x: auto dan model geser! Kunci #view-studio dengan overflow-x: hidden;. Pisahkan toolbar menjadi 2 baris rapi: Baris 1: Tab Bahasa [ JavaScript | Python ] (kiri) + tombol aksi [ Salin ] & [ Ekspor ZIP ] (kanan). Baris 2 (saat JS aktif): 3 tab berkas web (index.html, style.css, script.js) dibuat pas 100% selebar layar tanpa geser (grid 3 kolom: 1fr 1fr 1fr).
MANDAT WAJIB
198
Proyek: Template Statis Tanpa Geser
.project-templates menggunakan overflow-x: auto; white-space: nowrap;, teks terpotong.
Hapus overflow-x: auto dan white-space: nowrap! Ubah menjadi flex-wrap: wrap; gap: 8px;. Keempat template (Riset akademik, Pengembangan web, Naskah, Dokumen bisnis) langsung tampil penuh dan mudah disentuh tanpa perlu digeser.
MANDAT WAJIB
199
Artefak: Restrukturisasi Kartu Elegan
Metadata disatukan dalam pil sempit (JS · 4 OKT, 06.49) melipat 2 baris kapital.
Pisahkan badge format dengan waktu! Kiri: hanya lencana format ringkas ([ JS ], [ PPTX ]). Tengah: judul tebal di atas (Kode), waktu dan detail di bawahnya dengan teks natural (4 Okt, 06:49 · JavaScript). Kanan: tombol aksi [ Pratinjau ] dan [ Unduh ].
MANDAT WAJIB
200
Konektor: Sejajarkan Tombol Aksi
Tombol Hubungkan dan Token bertumpuk vertikal (flex-col).
Ubah .hub-card-side menjadi flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;. Tombol Token menggunakan gaya outline sekunder .hub-btn-token.
MANDAT WAJIB
## 39.3 Panduan Implementasi Berkas Kode untuk Grok Build
js/sheets/attach.js & js/chat/composer.js:
Di attach.js fungsi renderChip(): Hapus variabel modes, active, dan blok if (active.length) { ... modeRow ... }. Hanya jalankan perenderan jika this.files.length > 0. Jika kosong, langsung row.hidden = true; return;.
Di composer.js fungsi setWebsearch(active): Pastikan inp.placeholder = 'Tanya Rategoan'; (jangan diubah ke teks pencarian web).
index.html & css/ui/overhaul.css (Studio Kode):
Strukturkan #view-studio .studio-toolbar menjadi:
Baris atas (.studio-topbar): tab bahasa di kiri, tombol Salin kode & Ekspor zip di kanan.
Baris berkas (.studio-files-grid): index.html, style.css, script.js dalam grid 3 kolom simetris tanpa overflow-x.
Di CSS: #view-studio wajib memiliki overflow-x: hidden; untuk mencegah layar bergeser kiri-kanan.
css/ui/overhaul.css (Proyek):
Pada .project-templates: ganti overflow-x: auto dan white-space: nowrap dengan display: flex; flex-wrap: wrap; gap: 8px;.
js/artifacts/artifacts.js & css/ui/overhaul.css (Artefak):
Ubah struktur item kartu: Lencana format di kiri (.artifact-format), kontainer judul dan waktu di tengah (.artifact-info), serta tombol Pratinjau & Unduh di kanan (.artifact-actions).
Format waktu relTime() ditampilkan dalam huruf normal tanpa ALL CAPS di bawah judul.
css/ui/connect.css (Konektor):
Pastikan .hub-card-side: display: flex; flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; flex: none;.
Tombol Token menggunakan kelas .hub-btn-token dengan gaya outline sekunder yang rapi.
# 36. TONGGAK STABILISASI COMMIT 2c1bd30 DAN BLUEPRINT PEMBANGUNAN 3 MESIN KOGNISI UTAMA (COWORK CANVAS, SKILLS ENGINE, & BACKGROUND SCHEDULER)
Bab ini meratifikasi pencapaian besar pada commit 2c1bd30 (17 unit test lulus), memvalidasi tuntasnya perbaikan ergonomi antarmuka, serta merumuskan arsitektur spesifik untuk 3 mesin besar yang akan dibangun pada tahap berikutnya: Cowork Canvas, Modular Skills Engine, dan Background Scheduler Daemon.
## 36.1 Ratifikasi Keberhasilan Implementasi Commit 2c1bd30
Berdasarkan laporan verifikasi langsung Grok Build terhadap kode dan antarmuka, 10 perbaikan kritis telah resmi beroperasi di cabang main (commit 2c1bd30):
Auto-Hide Quick-Toggles Komposer: Ikon pintas (Web Search, Slide, Berpikir Keras) tersembunyi secara default; hanya muncul saat fiturnya aktif dan otomatis tersembunyi kembali saat dimatikan.
Redesain Saringan Koleksi: Filter chips kini tersusun dalam satu baris horizontal scrollable yang rapi tanpa memakan ruang vertikal layar.
Koreksi Logika Penghitungan Koleksi: Bug anomali chip "web (2)" saat "Semua (0)" telah diperbaiki dengan memisahkan hasil web ke tab Perpustakaan.
Studio Kode Multi-Berkas: Mendukung index.html, style.css, dan script.js dengan panel pratinjau gabungan (live preview) dan fitur unduh proyek (.zip).
Kamera OCR Lokal Nyata: Pemindaian teks melalui kamera menggunakan modul OCR WebAssembly lokal yang terhubung ke alur input obrolan.
Pencarian Toleran Saltik (BM25 Fallback): Pencarian koleksi memiliki algoritma cadangan BM25 lokal saat ejaan pengguna tidak persis.
Validasi Kredensial Nyata: Token GitHub dan Google Drive diverifikasi langsung ke layanan aslinya sebelum disimpan di perangkat.
Banner Proyek Aktif: Proyek yang sedang berjalan ditampilkan secara eksplisit di bilah obrolan.
Cadangan Data Aman (.rategoan.json): Ekspor cadangan penuh data lokal tanpa membocorkan token konektor sensitif.
Audio TTS Cerdas: Tombol baca audio mendukung kontrol jeda (pause) dan lanjut (resume).
## 36.2 Blueprint Spesifikasi 3 Mesin Kognisi Utama Tahap Berikutnya
Grok Build secara tepat mengidentifikasi bahwa Cowork Canvas, Skills, dan Penjadwal Latar adalah arsitektur mesin baru yang membutuhkan perancangan mendalam, bukan sekadar tombol kosong:
Mesin 1: Cowork Canvas Mode (js/cowork/canvas.js):
Arsitektur Panel: Panel geser berdampingan (split-screen) di desktop dan tab geser di mobile.
Sisi kiri: percakapan Raget. Sisi kanan: kanvas dokumen/kode aktif.
Inline AI Action: Seleksi paragraf/blok kode -> menu [Perbaiki Raget] / [Perjelas], Raget mengedit langsung di kanvas dengan diff viewer.
Mesin 2: Modular Skills Engine (raget/raget-skills/skill-engine.js):
Disimpan sebagai format JSON/Markdown lokal di IndexedDB dengan id, name, trigger_keywords, system_instruction, allowed_tools.
Pemanggilan Otonom: Raget memuat instruksi skill secara otomatis saat konteks obrolan cocok atau dipanggil dengan @skill-name.
Mesin 3: Background Scheduler Daemon (sw.js & raget/raget-scheduler/daemon.js):
Service Worker memanfaatkan Periodic Background Sync API dan Web Notifications API lokal:
Daily Briefing (07.00 WIB): Mengecek agenda kalender & catatan koleksi -> memunculkan notifikasi ringkasan pagi.
Web Watcher: Memeriksa situs target secara berkala dan memberi sinyal jika ada pembaruan nyata.
## 36.3 Matriks Tugas Bab 14 Tambahan (Item 186 s/d 195)
No
Modul Target
Nama Fitur / Perbaikan Arsitektur
Status
186
egoan.vercel.app
Ratifikasi Keberhasilan Deploy Commit 2c1bd30 (17 Unit Test Lulus)
Siap Dikerjakan
187
js/cowork/canvas.js
Rancang Komponen Kanvas Split-Screen (Chat Kiri, Kanvas Kanan)
Siap Dikerjakan
188
js/cowork/inline-action.js
Fitur Seleksi Teks Kanvas & In-Place Editing Otak Raget
Siap Dikerjakan
189
css/cowork/canvas.css
Styling Kanvas Split-Screen Responsif Mobile & Desktop
Siap Dikerjakan
190
raget/raget-skills/skill-engine.js
Mesin Eksekusi & Penyimpanan Skill Modular di IndexedDB
Siap Dikerjakan
191
raget/raget-skills/skill-catalog.js
Katalog Skill Bawaan (@koding, @riset, @naskah, @data)
Siap Dikerjakan
192
sw.js & raget/raget-scheduler/daemon.js
Service Worker Background Daemon untuk Daily Briefing & Notifikasi
Siap Dikerjakan
193
js/account/settings.js
Antarmuka Pengaturan Jadwal Otomatis & Pemantau Web Latar
Siap Dikerjakan
194
tests/playwright/e2e-studio-ocr.spec.js
Uji Playwright Nyata untuk Multi-file Studio, OCR, & Komposer
Siap Dikerjakan
195
docs/PRD/PRD-ANTARMUKA.md
Sinkronisasi Master PRD Bab 36 ke Repositori Lokal
Siap Dikerjakan

# 37. SPESIFIKASI PENYEMPURNAAN ERGONOMI KOMPOSER MINIMALIS, HARMONISASI SWITCH LAMPIRKAN, KERAPIAN KONEKTOR, DAN PENYELARASAN STUDIO MULTI-BAHASA (OKTOBER 2026)
## 37.1 Latar Belakang & Analisis Hasil Uji Nyata Antarmuka di Ponsel (egoan.vercel.app)
Berdasarkan uji coba langsung pada perangkat bergerak (tangkapan layar pengguna 4 Oktober 2026 pukul 11:16–11:17 WIB), implementasi arsitektur Rategoan telah berhasil dipulihkan secara penuh: seluruh fungsi berjalan lancar, 17 tes unit lulus, dan gerbang validasi skema 100% hijau. Namun, ditemukan beberapa friksi visual dan ergonomi mikro yang perlu disempurnakan demi menghadirkan kenyamanan penggunaan kelas dunia:
Friksi Komposer (Cluttered Input Card): Saat toggle Pencarian Web dinyalakan, muncul chip teks pill "[Pencarian Web x]" di dalam kotak masukan obrolan dan placeholder berubah menjadi "Cari di internet…". Hal ini memakan area ketik vertikal dan terasa redundan karena ikon globe dengan titik indikator biru (🌐•) telah menyala di bilah bawah komposer.
Inkonsistensi Sakelar Modal Lampirkan: Pada modal Lampirkan (#attach-sheet), item "Buat Slide (.pptx)" tidak memiliki elemen switch toggle, tampak seperti tombol biasa di antara toggle switch lainnya.
Penumpukan Vertikal Tombol Konektor: Pada kartu Google Drive dan GitHub, tombol "Hubungkan" dan "Token" bertumpuk vertikal (column), membuat tinggi kartu tidak simetris.
Studio Kode Multi-Bahasa: Bilah berkas web (index.html, style.css, script.js) tetap muncul saat tab bahasa Python aktif, serta pintasan Ctrl+Enter belum terikat ke instans CodeMirror.
Wadah Instruksi Proyek: Input instruksi proyek belum memiliki kontainer berlabel yang terstruktur rapi.
## 37.2 Spesifikasi Detail Perbaikan & Rekayasa Antarmuka
No
Komponen Antarmuka
Kondisi Sebelumnya
Spesifikasi Baru yang Diterapkan
Status
183
Pencarian Web & Mode Penalaran di Komposer
Muncul chip teks [Pencarian Web x] di dalam kotak input; placeholder berubah menjadi Cari di internet….
Chip teks dihapus total dari #attach-row. Hanya ikon aktif (🌐•, ⚡•, 💻•, 🔍•) yang menyala di bilah bawah komposer. Placeholder tetap konsisten "Tanya Rategoan". Mengetuk ikon aktif langsung mematikan dan menyembunyikan ikon. Baris #attach-row murni hanya untuk berkas fisik (foto/dokumen).
SUDAH SELESAI
184
Sakelar "Buat Slide (.pptx)" di Modal Lampirkan
Berupa tombol biasa tanpa sakelar switch.
Ditambahkan elemen sakelar konsisten: role="switch" aria-checked="false", <span class="switch"><span class="switch-thumb"></span></span>. Tersinkronisasi penuh dengan mode slide komposer (slideActive) dan tombol pintas btn-quick-slide.
SUDAH SELESAI
185
Tata Letak Tombol Konektor (OAuth & Token)
Tombol Hubungkan dan Token menumpuk vertikal (flex-direction: column).
Diubah menjadi horizontal berdampingan (flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;). Tombol Token mengadopsi gaya outline sekunder (.hub-btn-token) yang kompak dan selaras.
SUDAH SELESAI
186
Studio Kode Adaptif Multi-Bahasa & Pintasan
Berkas web (index.html, style.css) tetap tampil di tab Python; Ctrl+Enter hanya terpasang di textarea mentah.
Bilah berkas #studio-files dan tombol #studio-zip otomatis tersembunyi saat tab Python aktif dan muncul kembali saat tab JavaScript aktif. CodeMirror dilengkapi konfigurasi extraKeys: { 'Ctrl-Enter': run, 'Cmd-Enter': run }.
SUDAH SELESAI
187
Strukturasi Instruksi Proyek
Elemen textarea instruksi disisipkan langsung tanpa wadah atau label pembatas.
Dibuatkan kontainer khusus terstruktur: .project-instruction-box dengan label eksplisit .project-label dan textarea bersudut halus .project-textarea.
SUDAH SELESAI
## 37.3 Komitmen Arsitektural Menuju Tahap Berikutnya
Penyempurnaan mikro pada Bab 37 memantapkan stabilitas dan kenyamanan antarmuka pengguna pada level tertinggi. Tiga pilar besar berikutnya—Kanvas Cowork (Bab 36.1), Sistem Keterampilan Modular (Bab 36.2), dan Penjadwal Latar Belakang Otonom (Bab 36.3)—akan dibangun secara bertahap di atas fondasi yang kokoh ini tanpa membuat tombol kosong atau pajangan.
## 37.4 Panduan Tindakan Presisi untuk Rekayasa Grok Build (Direct Execution Guide)
Bagi agen pengembang (Grok Build), lakukan perubahan langsung pada repositori dengan rujukan berkas berikut:
Berkas js/sheets/attach.js:
Di fungsi renderChip(), hapus total logika perenderan kontainer modeRow dan chip mode-chip.
Pastikan #attach-row hanya aktif (hidden = false) jika this.files.length > 0 (yaitu hanya saat ada lampiran berkas fisik nyata seperti foto, tangkapan kamera, PDF, DOCX, ZIP). Jika tidak ada berkas fisik, set row.hidden = true.
Modus penalaran (websearch, think, research, slide) DILARANG memunculkan chip teks di dalam #attach-row.
Berkas js/chat/composer.js:
Di fungsi setWebsearch(active), kunci placeholder input teks agar selalu 'Tanya Rategoan' (jangan ubah menjadi 'Cari di internet…').
Di fungsi paintQuick(), kelola visibilitas tombol pintas .quick-toggle di baris bawah komposer: tombol #btn-quick-web, #btn-quick-think, #btn-quick-slide, dan #btn-quick-research hanya dimunculkan (hidden = false dan kelas .on) jika modusnya aktif, dan otomatis disembunyikan (hidden = true) jika modusnya mati.
Buat fungsi setSlide(active) untuk menyelaraskan status this.slideActive dengan atribut aria-checked pada #sheet-slide dan tombol #btn-quick-slide.
Ketika pesan dikirim dengan this.slideActive aktif, format prompt menjadi slide dan segera matikan kembali mode slide (this.setSlide(false)).
Berkas index.html:
Tambahkan tombol pintas #btn-quick-research berdampingan dengan #btn-quick-think pada baris komposer (class="icon-btn quick-toggle", hidden).
Pada modal #attach-sheet, ubah tombol #sheet-slide menjadi bertipe sakelar switch: tambahkan role="switch" aria-checked="false" serta elemen <span class="switch" aria-hidden="true"><span class="switch-thumb"></span></span> agar seragam dengan sakelar mode lainnya.
Di dalam <section id="view-project">, bungkus masukan instruksi proyek ke dalam kontainer <div class="project-instruction-box"> lengkap dengan label <label for="project-prompt" class="project-label"> dan <textarea id="project-prompt" class="project-textarea">.
Berkas css/ui/connect.css & js/connectors/connector-hub.js:
Pada css/ui/connect.css, ubah .hub-card-side menjadi display: flex; flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end; flex: none;.
Tambahkan gaya tombol sekunder .hub-btn-token { background: var(--rg-surface, #fff); color: #1a73e8; border: 1px solid #cce1fb; } agar tombol Hubungkan dan Token berdampingan rapi secara horizontal di sebelah kanan kartu.
Pada js/connectors/connector-hub.js, berikan kelas hub-btn-token pada elemen tombol token.
Berkas js/studio/studio.js:
Pada fungsi pick(next) saat pemilihan bahasa: jika next === 'python', sembunyikan #studio-files dan #studio-zip (hidden = true). Jika next === 'javascript', tampilkan kembali (hidden = false).
Pada inisialisasi CodeMirror di ensureEditor(), tambahkan extraKeys: { 'Ctrl-Enter': () => run.click(), 'Cmd-Enter': () => run.click() }.
Berkas js/project/project.js & css/ui/overhaul.css:
Pada js/project/project.js, ikat event listener perubahan pada elemen #project-prompt yang sudah ada di HTML tanpa melakukan pembuatan atau appendChild elemen baru secara dinamis.
Pada css/ui/overhaul.css, tambahkan aturan tata letak untuk .project-instruction-box, .project-label, dan .project-textarea.
Standar Pengujian Mutlak:
Jalankan npm test dan pastikan seluruh 17 unit test lulus tanpa error.
Jalankan npm run lint dan pastikan gerbang linter lolos 100% (292 berkas JS 0 error, validasi skema 208 berkas 3.934 entri lolos).
Berdasarkan uji coba langsung pada perangkat bergerak (tangkapan layar pengguna 4 Oktober 2026 pukul 11:16–11:17 WIB), implementasi arsitektur Rategoan telah berhasil dipulihkan secara penuh: seluruh fungsi berjalan lancar, 17 tes unit lulus, dan gerbang validasi skema 100% hijau. Namun, ditemukan beberapa friksi visual dan ergonomi mikro yang perlu disempurnakan demi menghadirkan kenyamanan penggunaan kelas dunia:
Friksi Komposer (Cluttered Input Card): Saat toggle Pencarian Web dinyalakan, muncul chip teks pill "[Pencarian Web x]" di dalam kotak masukan obrolan dan placeholder berubah menjadi "Cari di internet…". Hal ini memakan area ketik vertikal dan terasa redundan karena ikon globe dengan titik indikator biru (🌐•) telah menyala di bilah bawah komposer.
Inkonsistensi Sakelar Modal Lampirkan: Pada modal Lampirkan (#attach-sheet), item "Buat Slide (.pptx)" tidak memiliki elemen switch toggle, tampak seperti tombol biasa di antara toggle switch lainnya.
Penumpukan Vertikal Tombol Konektor: Pada kartu Google Drive dan GitHub, tombol "Hubungkan" dan "Token" bertumpuk vertikal (column), membuat tinggi kartu tidak simetris.
Studio Kode Multi-Bahasa: Bilah berkas web (index.html, style.css, script.js) tetap muncul saat tab bahasa Python aktif, serta pintasan Ctrl+Enter belum terikat ke instans CodeMirror.
Wadah Instruksi Proyek: Input instruksi proyek belum memiliki kontainer berlabel yang terstruktur rapi.
## 37.2 Spesifikasi Detail Perbaikan & Rekayasa Antarmuka
No
Komponen Antarmuka
Kondisi Sebelumnya
Spesifikasi Baru yang Diterapkan
Status
183
Pencarian Web & Mode Penalaran di Komposer
Muncul chip teks [Pencarian Web x] di dalam kotak input; placeholder berubah menjadi Cari di internet….
Chip teks dihapus total dari #attach-row. Hanya ikon aktif (🌐•, ⚡•, 💻•, 🔍•) yang menyala di bilah bawah komposer. Placeholder tetap konsisten "Tanya Rategoan". Mengetuk ikon aktif langsung mematikan dan menyembunyikan ikon. Baris #attach-row murni hanya untuk berkas fisik (foto/dokumen).
SUDAH SELESAI
184
Sakelar "Buat Slide (.pptx)" di Modal Lampirkan
Berupa tombol biasa tanpa sakelar switch.
Ditambahkan elemen sakelar konsisten: role="switch" aria-checked="false", <span class="switch"><span class="switch-thumb"></span></span>. Tersinkronisasi penuh dengan mode slide komposer (slideActive) dan tombol pintas btn-quick-slide.
SUDAH SELESAI
185
Tata Letak Tombol Konektor (OAuth & Token)
Tombol Hubungkan dan Token menumpuk vertikal (flex-direction: column).
Diubah menjadi horizontal berdampingan (flex-direction: row; align-items: center; gap: 6px; flex-wrap: wrap; justify-content: flex-end;). Tombol Token mengadopsi gaya outline sekunder (.hub-btn-token) yang kompak dan selaras.
SUDAH SELESAI
186
Studio Kode Adaptif Multi-Bahasa & Pintasan
Berkas web (index.html, style.css) tetap tampil di tab Python; Ctrl+Enter hanya terpasang di textarea mentah.
Bilah berkas #studio-files dan tombol #studio-zip otomatis tersembunyi saat tab Python aktif dan muncul kembali saat tab JavaScript aktif. CodeMirror dilengkapi konfigurasi extraKeys: { 'Ctrl-Enter': run, 'Cmd-Enter': run }.
SUDAH SELESAI
187
Strukturasi Instruksi Proyek
Elemen textarea instruksi disisipkan langsung tanpa wadah atau label pembatas.
Dibuatkan kontainer khusus terstruktur: .project-instruction-box dengan label eksplisit .project-label dan textarea bersudut halus .project-textarea.
SUDAH SELESAI
## 37.3 Komitmen Arsitektural Menuju Tahap Berikutnya
Penyempurnaan mikro pada Bab 37 memantapkan stabilitas dan kenyamanan antarmuka pengguna pada level tertinggi. Tiga pilar besar berikutnya—Kanvas Cowork (Bab 36.1), Sistem Keterampilan Modular (Bab 36.2), dan Penjadwal Latar Belakang Otonom (Bab 36.3)—akan dibangun secara bertahap di atas fondasi yang kokoh ini tanpa membuat tombol kosong atau pajangan.
## 38.6 Penegasan Mutlak Eksekutor: Urusan Rilis Data dalam Penyaringan (Dual-Track Directive)
Ditegaskan secara instruktif kepada agen eksekutor (Grok Build & Manus AI):
Pekerjaan Tidak Boleh Timpang (Dual-Track Responsibility): Eksekutor dilarang keras hanya berfokus pada pekerjaan antarmuka web sembari membiarkan urusan rilis data korpus mandek tanpa pergerakan.
Kondisi Kritis Saat Ini: Pipeline penyaringan rilis data di GitHub Releases saat ini terdeteksi belum ada pergerakan sama sekali. Berkas pada tag Data baru Indonesian dan data baru English masih menumpuk dan belum diproses menuju tag penampungan.
Mandat Sinkronisasi Rilis: Bersamaan dengan eksekusi kerja besar antarmuka (Bab 37 & Bab 38), eksekutor WAJIB mulai menggerakkan skrip pipeline penyaringan (ekstraksi, deduplikasi MinHash LSH, filter rasio bahasa 95%, dan pembersihan PII) sesuai spesifikasi baku di [PRD RELEASE](https://docs.google.com/document/d/1OEC971gQC-T5sQREPAzU_Yl4nsnzu8kp8flQapZggr0/edit) Bab 13.
Hasil yang Harus Ada Bukti Pergerakannya: Aset calon korpus yang telah disaring harus mulai terunggah ke tag penampungan Indonesian dan penampungan English dengan segel SHA256SUMS yang valid.

# 31. ARSITEKTUR KOGNISI MENUJU ERA ASI: SECOND BRAIN RAG LOKAL & PENGOLAHAN MULTIMODAL PERAMBAN (LOCAL VISION OCR)
Bab ini merumuskan dua pilar kognisi strategis bagi Rategoan dalam merespons evolusi kecerdasan buatan global menuju era ASI (Artificial Superintelligence) berdaulat: (1) Mesin Memori Semantik Terpadu (In-Browser Second Brain RAG) dan (2) Persepsi Multimodal Lokal (Local Vision OCR & Camera Pipeline), yang sepenuhnya beroperasi di peramban pengguna tanpa bergantung pada API eksternal.
## 31.1 Visi Kognisi Rategoan Menuju Era ASI Berdaulat (Sovereign ASI)
Dalam perlombaan AI modern, lompatan menuju kecerdasan super (ASI) bertumpu pada kedalaman konteks sepanjang hayat (lifelong context), persepsi sensorik instan melalui mata kamera, dan kedaulatan privasi mutlak di mana seluruh pemrosesan diselesaikan 100% di dalam peramban (in-browser WASM runtime).
## 31.2 Arsitektur Second Brain RAG Lokal (Pure In-Browser Semantic Search)
Fondasi Penyimpanan & Pengindeksan Berkas Lokal:
Indeks Vektor Terpadu di IndexedDB via raget/raget-vault/local-rag.js yang menyatukan riwayat chat, catatan Koleksi, ekspor WhatsApp, catatan Notion/Evernote, dan dokumen Google Drive.
Pencarian Hibrida: Menggabungkan BM25 Lexical Matching (presisi kata kunci persis, nomor, kode) dengan Dense Cosine Similarity (makna semantik) secara instan tanpa latensi jaringan.
Pemanggilan Konteks Otomatis:
Pengguna dapat mencari konteks lampau langsung dari chat atau kolom pencarian Koleksi, dan Raget otomatis menginjeksi kutipan memori relevan sebagai basis jawaban.
## 31.3 Arsitektur Kamera & Penglihatan Multimodal Lokal (Local Vision OCR)
Alur Tangkapan Kamera Langsung:
Tombol Kamera di modal Lampirkan (#modal-attach) memicu kamera ponsel via MediaDevices API untuk memotret dokumen fisik, papan tulis, struk, atau layar monitor.
Pemrosesan OCR Murni WebAssembly:
Modul js/multimodal/vision-ocr.js mengeksekusi pustaka OCR lokal berbasis WebAssembly SIMD langsung di CPU/GPU peramban pengguna:
Membersihkan kontras dan binarisasi gambar.
Mengekstrak teks, angka, tabel, dan blok kode.
Menginjeksi teks hasil pindaian secara otomatis ke komposer obrolan untuk dianalisis seketika oleh Raget.
## 31.4 Matriks Tugas Bab 14 Tambahan (Item 146 s/d 150)
146: raget/raget-vault/local-rag.js — Arsitektur Second Brain Hybrid Search (BM25 + Vector di IndexedDB)
147: js/multimodal/vision-ocr.js — Modul Pemrosesan Gambar & OCR Lokal Berbasis WebAssembly di Peramban
148: index.html & js/chat/composer.js — Integrasi Tombol Kamera di Modal Lampirkan untuk Tangkapan & OCR Instan
149: js/collection/vault-importer.js — Pipa Pengindeksan Berkas Multi-Format (WhatsApp, Notion, PDF, Drive) ke Second Brain
150: docs/PRD/PRD-ANTARMUKA.md — Sinkronisasi Master PRD Bab 31 ke Repositori Lokal
# 33. RESOLUSI AKURAT QUICK-TOGGLE KOMPOSER DINAMIS (STATUS AKTIF SAJA), REDESAIN ELEGAN HALAMAN KOLEKSI & PERPUSTAKAAN, SERTA AUDIT KODE COMMIT 94fdd01
# 35. STANDAR KUALITAS KODE INDUSTRI, PERBAIKAN GERBANG LINT RUSAK, PEMBERSIHAN DEAD CODE, DAN PROTOKOL UJI NYATA (PRODUCTION-READY CRITERIA)
Bab ini menetapkan kriteria kualitas rekayasa perangkat lunak berstandar industri (production-grade) untuk Rategoan. Seluruh fitur, alat, dan konektor yang ada di Rategoan harus berfungsi nyata, teruji di lingkungan riil, bebas dari jebakan mock-up pajangan, dan didukung oleh gerbang verifikasi otomatis yang sehat.
## 35.1 Temuan Kritis Kualitas Kode dari Audit Langsung
Gerbang Lint Rusak Fatal di validate-entry.mjs:
Perintah npm run lint (node raget/raget-tools/lint-check.mjs) saat ini GAGAL TOTAL karena baris 34 di raget/raget-tools/validate-entry.mjs memanggil import { globSync } from 'fs' yang tidak kompatibel di Node 18/20. Wajib diganti dengan readdirSync rekursif agar npm run lint kembali LULUS 100%.
Ilusi Pengujian 14/14 Unit Test (Zero UI Coverage):
14 unit test bawaan hanya menguji berkas algoritma matematika string. Sama sekali tidak ada uji antarmuka (UI DOM), interaksi tombol, modal dialog, atau perutean halaman! Grok Build diwajibkan menulis skrip pengujian Playwright E2E untuk memvalidasi interaksi nyata tombol, filter, modal, dan komposer.
Pembersihan 45 Berkas Dead Code / Broken Imports:
Di folder raget/raget-tools/arsip-nonaktif/ dan migrasi-domain-selesai/, terdapat 45 berkas usang yang merujuk ke modul yang sudah tidak ada. Wajib diisolasi atau diselaraskan agar tidak mengotori repositori.
## 35.2 Standar Mutlak Produk Siap Rilis (Production-Ready)
Bukan Pajangan (No Dummy Mockups): Setiap tombol wajib menghasilkan aksi nyata (Konektor membuka modal input Personal Access Token PAT jika offline; Proyek menampilkan banner aktif di chat; TTS Baca memutar audio nyata dengan kontrol stop/pause).
Pencadangan Penuh 1-Ketukan: Sediakan fitur ekspor seluruh basis data lokal (riwayat chat, koleksi, kapsul memori, dokumen vault) menjadi satu berkas .rategoan.json dan fitur pemulihan (restore) di Pengaturan.
Kerapian Arsitektural: Di browser console log, pastikan 0 Uncaught TypeError, 0 unhandled rejection, dan 0 resource 404.
## 35.3 Matriks Tugas Bab 14 Tambahan (Item 176 s/d 185)
176: raget/raget-tools/validate-entry.mjs — Fix SyntaxError globSync agar npm run lint Lulus 100%
177: tests/playwright/e2e-app.spec.js — Bangun Suite Pengujian E2E UI Nyata di Playwright (Komposer, Koleksi, Sidebar)
178: js/connectors/connector-hub.js — Modal Input Kredensial Manual / PAT untuk Koneksi GitHub & Drive Nyata
179: js/project/project.js — Banner Visual Proyek Aktif di Chat & Injeksi Instruksi Sistemik
180: js/chat/chat.js — Peningkatan TTS Baca Suara (SpeechSynthesis Kontrol Play/Pause & Cleanup)
181: js/account/settings.js — Fitur Cadangkan Seluruh Data (.rategoan.json) & Pemulihan Instan
182: raget/raget-tools/arsip-nonaktif/ — Pembersihan & Isolasi 45 Berkas Broken Import Script Tools
183: sw.js — Audit Offline PWA Cache (Pastikan Aplikasi Berjalan Penuh Tanpa Sinyal)
184: tests/playwright/visual-audit.spec.js — Pengujian Visual Regression & Audit Console Zero-Error di Dual Viewport
185: docs/PRD/PRD-ANTARMUKA.md — Sinkronisasi Master PRD Bab 35 ke Repositori Lokal
Bab ini menindaklanjuti hasil pengujian langsung pengguna pasca commit 94fdd01, mengoreksi implementasi tombol pintas komposer yang masih berjejer statis saat tidak aktif, serta memberikan spesifikasi redesain komprehensif untuk halaman Koleksi, Penyimpanan, dan Perpustakaan agar tampil bersih, modern, dan ergonomis di perangkat mobile.
## 33.1 Resolusi Presisi Quick-Toggle Komposer (Ikon Muncul HANYA Saat Fitur Aktif)
Masalah Lapangan (Screenshot 1000003100):
Tombol #btn-quick-web, #btn-quick-slide, dan #btn-quick-think dipasang statis dan selalu terlihat sekaligus di bilah bawah komposer (+, Model, Web, Slide, Think, Mic, Send) meskipun fiturnya tidak aktif, sehingga memadati ruang input di layar ponsel.
Spesifikasi Koreksi Mutlak:
Kondisi Default (Semua Fitur Nonaktif): Ketiga tombol pintas harus TERSEMBUNYI SECARA DEFAULT (hidden attribute di HTML dan display: none di CSS). Bilah bawah komposer bersih: [ + ] [ Model ] (Spacer) [ Mic ] [ Send ].
Kondisi Saat Fitur Diaktifkan: Hanya tombol fitur yang sedang AKTIF yang dimunculkan (hidden = false) sebagai active badge/indicator (misal ikon Web Search menyala biru). Mengetuk ikon aktif tersebut akan langsung menonaktifkannya kembali dan menyembunyikannya dari bilah (toggle off & auto-hide).
Solusi Kode di js/chat/composer.js:
Di paintQuick(), terapkan web.hidden = !this.websearchActive, think.hidden = !this.thinkActive, dan slide.hidden = !this.slideActive. Di index.html, beri atribut hidden secara default pada ketiga tombol tersebut.
## 33.2 Redesain Elegan Halaman Koleksi & Perpustakaan (Screenshot 1000003101)
Kelemahan Tata Letak Saat Ini:
Filter Chips Bertumpuk 3 Baris karena memakai flex-wrap: wrap, menyita 100px tinggi layar.
Tombol "Buat catatan koleksi" bertengger kaku sebagai blok biru besar di tengah layar, terpisah dari kartu kosong.
Solusi Desain Presisi:
Ubah .coll-filters menjadi flex-wrap: nowrap; overflow-x: auto; -webkit-overflow-scrolling: touch; dengan chip white-space: nowrap sehingga filter berjejer rapi dalam 1 baris yang dapat digeser halus (horizontal scrollable).
Pindahkan tombol "+ Catatan" ke kanan atas header atau letakkan tombol aksi langsung di dalam kartu kosong (empty state card), menghilangkan tombol blok biru kaku di tengah.
Di tab Perpustakaan, tampilkan kartu bersih dengan ikon spesifik: PDF (badge merah), Notion (badge abu-abu), WhatsApp (badge hijau), dan Fakta Memori (badge biru).
## 33.3 Matriks Tugas Bab 14 Tambahan (Item 161 s/d 165)
161: index.html & js/chat/composer.js — Terapkan Auto-Hide Quick Toggles (Ikon Muncul HANYA Saat Fitur Aktif)
162: css/collection/collection.css — Ubah Filter Chips Koleksi Menjadi Horizontal Scrollable Single-Line
163: js/collection/collection.js — Harmonisasi Tombol Tambah Catatan ke Header & Empty State Card
164: css/collection/collection.css — Styling Kartu Vault Perpustakaan (Badge Ikon PDF, Notion, WA, Memori)
165: docs/PRD/PRD-ANTARMUKA.md — Sinkronisasi Master PRD Bab 33 ke Repositori Lokal
# 32. AGENDA EKSEKUSI PENGEMBANGAN STRATEGIS TAHAP 15: ROADMAP BERJENJANG DARI STABILISASI ANTARMUKA HINGGA KOGNISI ASI BERDAULAT (SOVEREIGN AI WORKSPACE)
Bab ini meresmikan seluruh sintesis riset teknologi AI modern ke dalam rencana aksi konkret (actionable roadmap) berjenjang bagi pengembang (Grok Build dan tim pengembang Rategoan). Agenda ini memastikan Rategoan berevolusi secara terukur dari penyelesaian ergonomi antarmuka harian menuju platform kerja AI berdaulat setara standar global.
## 32.1 Arsitektur 4 Fase Pengembangan Strategis
Fase 1: Validasi Rilis & Stabilisasi Antarmuka (Bab 28–30) — Verifikasi live deployment Vercel pasca commit GitHub 10 berkas UI; validasi kelegaan sidebar, Kapsul Memori di Pengaturan, dan toolbar pesan.
Fase 2: Realisasi Kognisi ASI Lokal Peramban (Bab 31) — Inisiasi Local Vision OCR WebAssembly melalui tombol Kamera di Lampirkan; inisiasi Second Brain RAG Lokal (Hybrid Search BM25 + Vektor di IndexedDB).
Fase 3: Ruang Kerja Kolaboratif (Cowork Canvas & Coder Sandbox) — Mode Split-Screen Canvas (obrolan di sisi kiri, lembar kerja aktif di kanan); Multi-file Virtual Coder Sandbox dengan live iframe preview dan auto-debug.
Fase 4: Otomasi Otonom (Modular Skills & Background Scheduler) — Registry keahlian khusus berbasis berkas lokal (@analis, @perancang-slide); Background Daemon via Service Worker (Daily Morning Brief dan Web Watcher).
## 32.2 Rincian Pelaksanaan Per Fase
Fase 1 (Immediate Action): Validasi live deployment di egoan.vercel.app untuk memastikan sidebar memiliki ruang minimal 220px untuk riwayat chat, Kapsul Memori rapi di Pengaturan (Data), tombol balasan berupa 4 ikon 32x32px tanpa overflow, dan transisi tema instan 60 FPS.
Fase 2 (Kognisi ASI Lokal): Mengintegrasikan Tesseract WebAssembly SIMD ringan di js/multimodal/vision-ocr.js untuk pemindaian kamera instan, serta membangun raget/raget-vault/local-rag.js untuk penyerapan arsip obrolan, WhatsApp, dan Drive ke IndexedDB.
Fase 3 (Ruang Kerja Kolaboratif): Membangun split-screen canvas untuk penyuntingan inline naskah/kode dengan diff viewer, serta meningkatkan Studio Kode menjadi multi-file workspace virtual dengan live iframe sandbox.
Fase 4 (Otomasi Otonom): Menerapkan sistem pemanggilan keahlian khusus otonom (@skill-name), serta Service Worker background scheduler untuk briefing pagi dan pemantau web mandiri.
## 32.3 Matriks Tugas Bab 14 Tambahan (Item 151 s/d 160)
151: egoan.vercel.app — Pengujian Komprehensif Live Deployment Hasil Push Bab 28–30
152: js/multimodal/vision-ocr.js — Implementasi WebAssembly OCR SIMD untuk Ekstraksi Dokumen Kamera Lokal
153: index.html & js/chat/composer.js — Sambungkan Tombol Kamera ke Alur Pemindaian OCR Instan
154: raget/raget-vault/local-rag.js — Pembuatan Indeks Hybrid Vektor di IndexedDB untuk Second Brain
155: js/collection/collection.js — Integrasi Pencarian Semantik Second Brain di Bilah Cari Koleksi
156: js/cowork/canvas.js — Rancang Komponen Split-Screen Canvas (Chat Kiri, Lembar Kerja Kanan)
157: js/cowork/inline-editor.js — Fitur Seleksi Paragraf & In-Place Inline AI Editing
158: js/studio/coder-sandbox.js — Integrasi Multi-File Virtual Workspace & Live Iframe Preview
159: raget/raget-skills/skill-registry.js — Sistem Registrasi & Panggilan Otonom Keahlian Modular (@skill)
160: sw.js & raget/raget-scheduler/daemon.js — Implementasi Background Scheduler PWA untuk Daily Briefing & Web Watcher
# 30. EVALUASI KRITIS DOKUMEN PRD, MITIGASI RISIKO IMPLEMENTASI GROK BUILD, DAN PETA JALAN INOVASI STRATEGIS (SOVEREIGN AI ECOSYSTEM)
Bab ini menyajikan audit meta-level terhadap dokumen PRD antarmuka, membongkar potensi titik kegagalan (pitfalls) pada eksekusi Grok Build, serta merumuskan inovasi nyata agar Rategoan memiliki keunggulan kompetitif mutlak (unfair advantage) di tengah persaingan AI global yang bergerak sangat cepat.
## 30.1 Evaluasi & Kritik Terhadap Dokumen PRD Antarmuka
Kelebihan Utama: Ketepatan diagnosis kode tingkat baris dan berkas CSS/JS, rekam jejak historis yang mencegah regresi, dan arsitektur PWA local-first tanpa build step rumit.
Kritik & Celah Perhatian: Dokumen yang mendekati 200.000 karakter berisiko memicu attention fatigue pada AI builder jika tidak dipandu dengan ringkasan fokus per-sprint. Aturan resmi timpa-menimpa (superseding rule): ketentuan pada bab bernomor lebih tinggi secara otomatis membatalkan dan menggantikan bab sebelumnya.
## 30.2 Analisis Presisi & Mitigasi Risiko untuk Pekerjaan Baru Grok Build
Pemindahan Kapsul Memori ke Pengaturan: Pastikan event listener tombol lama di sidebar dibersihkan dan dialihkan ke #btn-settings-memory di #view-settings tanpa merusak mountMemoryCapsule().
Viewport Keyboard Double-Counting: Hapus card.style.paddingBottom di composer.js dan verifikasi di layar sentuh HP agar komposer menempel pas di atas keyboard tanpa celah 200px.
Minimalist Icon Toolbar Balasan Pesan: Ganti tombol teks lebar ([Salin], [Baca], [Bagikan], [Simpan]) dengan bilah ikon 32x32px (Salin, TTS, Bookmark, ⋮) lengkap dengan aria-label dan umpan balik haptic/visual.
Quick-Toggle Toolbar Komposer: Pastikan status tombol pintas (Web Search, Slide, Deep Thinking) tersinkronisasi dua arah dengan reactive composer state.
Transisi Tema Mulus: Hapus applyWithVeil() dan jeda setTimeout 160ms, gunakan instant toggle atau document.startViewTransition() dengan fallback aman.
## 30.3 Peta Riset & Inovasi Nyata Rategoan di Era Persaingan AI Global
Rategoan tidak bersaing membakar modal GPU cloud raksasa, melainkan memenangkan ceruk "The Sovereign Personal AI Workspace" (Lokal, Pribadi, Cepat, dan Serbaguna):
Inovasi 1: Live Interactive Artifact Canvas — Tampilan split-screen interaktif untuk merender HTML/CSS/JS web app, grafik SVG/Mermaid, dan slide secara live berdampingan dengan chat.
Inovasi 2: Local Agentic Skills Engine — Registry keahlian khusus berbasis berkas lokal yang bisa diciptakan pengguna dan dipanggil via @nama-skill.
Inovasi 3: Background Scheduler & Sovereign Daemon — Memanfaatkan Service Worker dan Web Push lokal untuk daily briefing dan pemantau perubahan web tanpa server eksternal.
Inovasi 4: Dual-Engine Local Reasoning (Sintesis Heuristik Simbolik & Raget Neural Murni Lokal) — Menegaskan prinsip kedaulatan mutlak Rategoan yang 100% beroperasi mandiri tanpa API model eksternal apa pun. Inovasi ini mensinergikan mesin aturan/template instan berbasis deterministik lokal dengan mesin penalaran Raget Neural lokal di peramban, menghasilkan respons cerdas, cepat, dan 100% terlindungi di perangkat pengguna tanpa transmisi data keluar.
Inovasi 5: Unified Personal Vault — Menggabungkan arsip WhatsApp, Notion, Evernote, PDF, dan catatan ke dalam indeks pencarian semantik lokal 100% privat.
### 30.3.1 Prinsip Fundamental: Otak AI Mandiri (Raget) vs Ekosistem Konektor Nyata (Real Tools & Integrations)
Untuk menjaga visi produk tetap tajam dan tidak terjadi salah paham arsitektural, ditetapkan batasan tegas antara "Otak AI" dan "Konektor":
Kedaulatan Mutlak Otak AI (Raget Engine):
Baik saat beroperasi secara offline di perangkat pengguna maupun saat nanti terhubung secara online, otak kecerdasan, penalaran, dan pemrosesan bahasa alami adalah 100% milik Rategoan sendiri, yaitu Raget (Raget Neural, Raget Memory, dan Raget Rules).
Rategoan menolak ketergantungan pada otak AI model pihak ketiga mana pun (tanpa model OpenAI, Anthropic, Gemini, Grok, atau lainnya).
Konektor dan Integrasi Produktivitas Harus Berfungsi Nyata:
Di sisi lain, alat-alat pendukung dan konektor eksternal (Google Drive Workspace, Gmail, Google Calendar, GitHub, Web Search, Sandbox Python Pyodide, generator slide PPTX, serta pengimpor arsip WhatsApp/Notion) HARUS NYATA, AKTIF, DAN PRODUKTIF.
Konektor adalah "tangan dan mata" dunia nyata yang dikendalikan oleh otak Raget untuk membaca dokumen, mengirim email, menjadwalkan agenda, mencari informasi terkini di web, dan mengeksekusi kode nyata.
Dengan perpaduan ini, Rategoan memiliki kedaulatan otak penuh (Raget) sekaligus kapabilitas kerja produktivitas nyata di dunia nyata.
## 30.4 Matriks Prioritas Kerja Grok Build (Active Sprint Queue)
P0 (Kritis): Item 124, 125 — Kapsul Memori pindah ke Pengaturan; Sidebar lega & Riwayat Chat tampil utuh.
P0 (Kritis): Item 126 — Transisi tema instan 60 FPS tanpa jeda theme-veil 160ms.
P0 (Kritis): Item 136, 137 — Bilah 4 ikon balasan tanpa teks meluber; Netralkan tombol Chat Baru di sidebar.
P1 (Tinggi): Item 138, 139 — Quick-toggle Web Search & Slide di toolbar komposer samping model picker.
# 34. BLUEPRINT KERJA BESAR TAHAP 16: INTEGRASI MULTI-MODAL VISION OCR, SECOND BRAIN RAG, SANDBOX ARTIFACT MULTI-BERKAS, DAN PENYEMPURNAAN ERGONOMI RATAGOAN
Bab ini merangkum seluruh paket kerja besar terintegrasi (Grand Unified Sprint) yang siap dieksekusi secara simultan oleh Grok Build. Karena Grok Build telah memahami struktur repositori dan alur PRD, paket kerja ini dirancang padat, saling mengunci, dan memberikan lompatan kapabilitas fungsional masif bagi Rategoan.
## 34.1 Lima Pilar Utama Paket Kerja Besar
Ergonomi Komposer & Koleksi (Bab 33) — Quick-toggles (Web, Slide, Think) tersembunyi default; muncul HANYA saat ON. Filter Koleksi 1 baris geser horizontal; tombol + Catatan harmonis di header/kartu kosong.
Kamera & Local Vision OCR (Bab 31) — Tombol Kamera di Lampirkan membuka bidikan ponsel (MediaDevices API); ekstraksi teks/tabel dokumen via WebAssembly OCR lokal langsung disuntikkan ke komposer.
Second Brain RAG Lokal (Bab 31) — Modul raget-vault/local-rag.js untuk indeks semantik IndexedDB (BM25 + Vektor); penyerapan arsip chat, Koleksi, WhatsApp, dan dokumen Drive secara luring berlatensi 0 ms.
Studio Koding Multi-Berkas & Live Artifact Sandbox — Tab berkas virtual di Studio Kode (index.html, style.css, script.js); pratinjau langsung web app di iframe sandbox dan tombol Ekspor Proyek (.zip).
Konektor dengan Token Manual (Sovereign PAT Connect) — Opsi input Personal Access Token (PAT) GitHub/Drive untuk operasi 100% lokal tanpa ketergantungan OAuth; integrasi instruksi aktif halaman Proyek ke memori obrolan Raget.
## 34.2 Matriks Tugas Bab 14 Tambahan (Item 166 s/d 175)
166: index.html & js/chat/composer.js — Penerapan Auto-Hide Dinamis pada Quick-Toggle Komposer
167: css/collection/collection.css — Redesain Filter Koleksi Menjadi 1 Baris Geser & Harmonisasi Kartu
168: js/multimodal/vision-ocr.js — Modul WebAssembly OCR Kamera Lokal di Peramban
169: index.html & js/chat/composer.js — Integrasi Tombol Kamera Modal Lampirkan ke Pipa Vision OCR
170: raget/raget-vault/local-rag.js — Mesin Second Brain RAG (Hybrid BM25 + Vector di IndexedDB)
171: js/collection/collection.js — Antarmuka Pencarian Semantik Terpadu Second Brain di Koleksi
172: js/studio/studio.js & index.html — Tab Multi-Berkas Virtual (HTML, CSS, JS) di Studio Kode
173: js/studio/sandbox-runner.js — Live Iframe Sandbox Renderer & Generator Ekspor ZIP Proyek
174: js/connectors/connector-hub.js — Modal Input Token Pribadi (PAT) untuk Konektor Berdaulat
175: docs/PRD/PRD-ANTARMUKA.md — Sinkronisasi Master PRD Bab 34 ke Repositori Lokal
P1 (Tinggi): Item 127, 128 — Hapus window.prompt(), bangun modal dialog pembuatan catatan koleksi.
# 40. SINTESIS AUDIT STRATEGIS CLAUDE: TATA KELOLA OTENTIKASI DUAL-TRACK, MITIGASI KEAMANAN TOKEN, DAN INTEGRITAS PATH REPOSITORI (OKTOBER 2026)
## 40.1 Latar Belakang & Pengakuan Hasil Audit Lapangan Claude
Dokumen PRD dan repositori Rategoan telah melalui audit independen menyeluruh oleh Claude dengan kesimpulan faktual tingkat tinggi:
Integritas Pengujian Terbukti 100% Nyata: Seluruh unit test pada repositori terkonfirmasi nyata dan lulus penuh menggunakan runtime Node.js ESM (.test.mjs), membuktikan bahwa mesin Raget (BM25, penguncian bahasa, router intent, dan syntax validator) bukan klaim kosong.
Koreksi Typo Path Dokumen: Path berkas indeks semantik yang sebelumnya salah tertulis vault/rag/semantic-index.js resmi dikoreksi ke alamat fisik aslinya: raget/raget-retrieval/semantic-index.js.
Peringatan Kritis Konektor: Claude memberikan 3 catatan arsitektur mendasar mengenai modul Konektor yang wajib diintegrasikan ke dalam cetak biru PRD: batas kedaulatan lokal vs OAuth cloud, status kredensial CLIENT_ID, dan mitigasi keamanan penyimpanan token.

## 40.2 Spesifikasi Arsitektur Otentikasi Dual-Track (Sovereign Token vs Cloud OAuth)
Untuk menjawab pertentangan antara klaim "100% lokal mandiri" dan kebutuhan integrasi awan (Google Drive, GitHub, Gmail, Calendar), PRD menetapkan standar Arsitektur Dual-Track:
                          ARSITEKTUR DUAL-TRACK KONEKTOR
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ JALUR A: SOVEREIGN TOKEN (MANDIRI)   │ JALUR B: CLOUD OAUTH (SERVERLESS)    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ • Tombol: [ Token ]                  │ • Tombol: [ Hubungkan ]              │
│ • Mekanisme: Personal Access Token   │ • Mekanisme: OAuth 2.0 PKCE via      │
│   (PAT) dimasukkan langsung pengguna.│   Vercel Serverless Function.        │
│ • Dependensi: 0% Server Luar.        │ • Dependensi: Google Cloud Console & │
│ • Validasi: Langsung peramban ke API │   GitHub Developer App Credentials.  │
│   resmi (api.github.com, googleapis).│ • Status: Memerlukan GOOGLE_CLIENT_ID│
│ • Filosofi: 100% Kedaulatan Pribadi. │   & GITHUB_CLIENT_ID di Vercel env.  │
└──────────────────────────────────────┴──────────────────────────────────────┘
Jalur Utama Berdaulat (Sovereign PAT):  
Pengguna dapat menghubungkan Google Drive atau GitHub secara langsung tanpa bergantung pada server pihak ketiga mana pun melalui tombol [ Token ]. Token langsung diuji keabsahannya ke endpoint profil pengguna sebelum disimpan di perangkat.
Jalur Eksternal OAuth (Managed OAuth):  
Tombol [ Hubungkan ] disediakan bagi pengguna yang menginginkan kemudahan otorisasi sekali klik. Jika variabel lingkungan GOOGLE_CLIENT_ID atau GITHUB_CLIENT_ID belum dikonfigurasi di server Vercel, sistem wajib merespons secara anggun dengan status 501 oauth_not_configured dan mengarahkan pengguna untuk menggunakan Jalur Token Mandiri.

## 40.3 Standar Mitigasi Keamanan Token (Anti-XSS & Storage Hardening)
Menjawab peringatan Claude mengenai kerentanan penyimpanan token mentah pada localStorage:
Isolasi Brankas Kriptografis (Encrypted Vault):  
Token akses konektor tidak disimpan dalam bentuk string mentah terbuka di localStorage. Token wajib dienkripsi menggunakan Web Crypto API (AES-GCM 256-bit) dan disimpan dalam brankas terisolasi rategoan_connectors_vault.
Karantina Ekspor Cadangan (Backup Sanitization):  
Kunci brankas dan token konektor DILARANG KERAS diikutsertakan ke dalam berkas cadangan obrolan (.rategoan.json). Saat pengguna mencadangkan data, seluruh kredensial konektor otomatis disaring dan ditinggalkan di perangkat lokal.
Pembersihan Celah XSS (Zero-Unescaped HTML):  
Setiap tampilan yang merender masukan pengguna (Koleksi, Artefak, Obrolan, Kapsul Memori) wajib melewati sanitasi escapeHtml() guna menjamin tidak ada skrip pihak ketiga yang dapat mengeksekusi pencurian kredensial di sisi klien.

## 40.4 Pengendalian Kecepatan vs Presisi Eksekusi Grok Build
Kecepatan tinggi Grok Build diakui sebagai keunggulan masif proyek ini. Namun, untuk mencegah timbulnya regresi antarmuka (seperti bug geser layar Studio atau pemotongan template Proyek), Grok Build diwajibkan:
Menjadikan Bab 37, Bab 38, dan Bab 39 sebagai checklist verifikasi visual sebelum melakukan komit kode.
Memastikan gerbang pengujian npm test (17/17 lulus) dan npm run lint (100% lulus) selalu hijau sebelum melakukan publikasi rilis.
P2 (Strategis): Item 141, 142 — Fondasi Canvas Live Preview & Multi-file Coder Sandbox.
# 41. MASTER RESTRUKTURISASI HALAMAN PROYEK BERJENJANG, PEMBERSIHAN REDUNDANSI KOLEKSI, DAN PENUTUPAN CELAH ARSITEKTUR TINGKAT LANJUT (OKTOBER 2026)
## 41.1 Latar Belakang & Hasil Audit Lapangan (Tangkapan Layar 19:21 WIB)
Audit antarmuka seluler terkini membuktikan bahwa perbaikan Bab 39 telah berhasil:
Komposer telah 100% bersih tanpa chip teks mengambang di atas keyboard (1000003892.jpg).
Studio Kode telah bebas dari bug geser layar horizontal dengan grid berkas 3 kolom simetris yang pas (1000003894.jpg).
Kartu Artefak telah rapi dengan pemisahan lencana format dan tanggal alami (1000003895.jpg).
Namun, dua halaman ruang kerja utama—Halaman Proyek (1000003898.jpg) dan Halaman Koleksi (1000003896.jpg)—masih mengalami kekacauan tata letak dan redundansi elemen yang membutuhkan penyempurnaan tingkat lanjut:
Kekacauan Visual Halaman Proyek: Elemen-elemen bertumpuk secara acak tanpa hierarki yang jelas. Textarea instruksi proyek muncul secara aktif padahal belum ada proyek yang dipilih atau dibuat, menyebabkan pengguna bingung ke mana instruksi tersebut akan tersimpan. Tombol "Buat proyek" berupa blok biru kaku, dan kartu penyematan berkas (#project-drop) hanya berupa teks pasif tanpa mekanisme interaksi nyata.
Redundansi & Clutter Halaman Koleksi: Tombol "+ Catatan" muncul dua kali sekaligus di layar yang sama (di header dan di dalam kartu kosong). Deretan filter chip menampilkan "(0)" saat koleksi masih kosong, memakan ruang vertikal secara sia-sia.
Celah Fungsional Pinned Files: Sistem belum menyediakan tombol atau antarmuka untuk mengunggah dan menyematkan berkas rujukan ke dalam proyek (pinnedFiles), padahal logika penyuntikan instruksinya ke chat sudah siap di composer.js.
Tombol Pratinjau Studio pada Mode Python: Tombol "Pratinjau" tetap aktif saat tab Python dipilih, padahal Python berjalan via konsol terminal Pyodide dan tidak menghasilkan pratinjau HTML.
## 41.2 Matriks Rekayasa Penyempurnaan Tingkat Lanjut (Tugas No. 201 s/d 205)
No
Modul Target
Kondisi Eksisting
Rekayasa Baru yang Wajib Diterapkan
Status
201
Halaman Proyek: Restrukturisasi State Berjenjang
Seluruh elemen (input, template, teks kosong, instruksi) bertumpuk acak; textarea muncul saat proyek kosong.
Terapkan Model 2 State Jelas:
1. State Belum Ada Proyek: Tampilkan Kartu Buat Proyek terpadu (.project-create-card) berisi input nama, 4 chip template cepat, dan tombol pil [+ Buat Proyek]. Textarea instruksi DISEMBUNYIKAN.
2. State Ada Proyek Aktif: Tampilkan Kartu Proyek Aktif, daftar proyek, formulir Instruksi Sistem khusus proyek tersebut, dan seksi Berkas Tersemat.
MANDAT WAJIB
202
Halaman Proyek: Realisasi Fitur Pematrian Berkas (Pinned Files)
#project-drop hanya teks statis abu-abu tanpa tombol atau aksi nyata.
Tambahkan tombol interaktif [+ Sematkan Berkas] (<input type="file" id="project-file-pick">) dan daftar berkas tersemat (.project-file-list) dengan nama berkas, ukuran, dan tombol hapus sematan.
MANDAT WAJIB
203
Halaman Koleksi: Eliminasi Redundansi & Smart Filter
Dua tombol "+ Catatan" tampil berdampingan; chip filter menampilkan deretan (0) saat kosong.
1. Saat koleksi kosong (0 item), sembunyikan baris filter chips (#coll-filters.hidden = true) agar tampilan lega.
2. Hapus duplikasi tombol: saat koleksi kosong, tombol aksi dipusatkan pada kartu kosong; tombol header disederhanakan.
3. Perhalus transisi tab Tersimpan vs Perpustakaan menjadi segmented pill modern.
MANDAT WAJIB
204
Studio Kode: Penyesuaian Tombol Aksi Kontekstual
Tombol "Pratinjau" tetap muncul di tab Python.
Sembunyikan tombol #studio-preview saat tab Python aktif (karena eksekusi Pyodide mencetak ke konsol terminal), dan tampilkan kembali saat tab JavaScript aktif.
MANDAT WAJIB
205
Mitigasi Keamanan & Retensi Data Lokal
Data proyek dan koleksi berisiko hilang saat browser dibersihkan; token rentan XSS.
1. Tambahkan banner/pengingat cadangan di Pengaturan & Proyek (.project-backup-hint).
2. Pastikan seluruh render teks proyek dan koleksi melalui escapeHtml() mutlak sebelum disuntikkan ke DOM.
MANDAT WAJIB
## 41.3 Panduan Implementasi Berkas Kode untuk Grok Build
### 1. Rekayasa js/project/project.js & index.html (Proyek Berjenjang)
Ubah logika paint() pada project.js:
function paint() {
const cur = workspace.current();
const list = workspace.list();
const curLabel = $('project-current');
const emptyView = $('project-empty-state');
const activeView = $('project-active-panel');
const listContainer = $('project-list-sheet');

showProjectBar(cur);

if (!list.length) {
// State 1: Belum ada proyek sama sekali
if (curLabel) curLabel.textContent = 'Kelola ruang kerja terisolasi dengan instruksi mandiri.';
if (emptyView) emptyView.hidden = false;
if (activeView) activeView.hidden = true;
if (listContainer) listContainer.innerHTML = '';
} else {
// State 2: Ada proyek
if (emptyView) emptyView.hidden = true;
if (activeView) activeView.hidden = !cur;
if (curLabel) curLabel.textContent = cur ? ('Proyek aktif: ' + cur.name) : 'Pilih proyek untuk mengaktifkan:';

// Render detail proyek aktif
if (cur) {
const promptArea = $('project-prompt');
if (promptArea) promptArea.value = cur.systemPrompt || '';
renderPinnedFiles(cur);
}
cardList(listContainer);
}
}
### 2. Rekayasa js/collection/collection.js (Pembersihan Koleksi)
Pada fungsi renderTersimpan():
  if (!chatItems.length) {
// Sembunyikan filter chips yang berisi (0) saat koleksi kosong
$('coll-filters').innerHTML = '';
$('coll-filters').hidden = true;
content.innerHTML =
'<div class="coll-empty">' + ic('bookmark') +
'<div class="coll-empty-title">Koleksi ini masih sepi</div>' +
'<div class="coll-empty-body">Simpan balasan dari obrolan, atau tulis catatan sendiri untuk prompt favorit dan cuplikan kode.</div>' +
'<button type="button" class="coll-empty-note" data-open-note="1">+ Catatan Baru</button></div>';
return;
}
$('coll-filters').hidden = false;
### 3. Rekayasa js/studio/studio.js (Konteks Python)
Pada fungsi pick(next):
  const previewBtn = $('studio-preview');
if (previewBtn) previewBtn.hidden = (next === 'python');
## 41.4 Standar Integritas & Verifikasi
Setelah Grok Build mengimplementasikan Bab 41:
Jalankan npm test dan pastikan seluruh 17 unit test lulus tanpa cacat.
Jalankan npm run lint dan pastikan gerbang linter lolos 100%.
Verifikasi pada tampilan ponsel bahwa halaman Proyek dan Koleksi tampil bersih, elegan, dan profesional.
