# **PRD ANTARMUKA & EKOSISTEM MESIN OPERASIONAL RATEGOAN**

**Spesifikasi Kebutuhan Produk (Product Requirements Document) — Cetak Biru Master Arsitektur UI/UX, Harness Operasional 100% Nyata, dan Ekosistem Konektor Terpadu**  
*Status: Disahkan sebagai Dokumen Acuan Kanonikal Pengembangan Antarmuka Rategoan*  
*Versi: 2.0.0 (Master Consolidated Blueprint) | Tanggal: Oktober 2026*  
---

# **1\. PENDAHULUAN & FILOSOFI ARSITEKTURAL FUNDAMENTAL**

## **1.1 Pemisahan Arsitektur: "Tubuh/Mesin Aplikasi (Harness)" vs "Otak AI (Model Training)"**

Rategoan dibangun di atas pemisahan peran yang tegas antara dua pilar utama:  
**Urusan "Otak AI":**  
Pelatihan korpus masif 17+ Miliar Token BPE (Rak K Bahasa Indonesia & Rak R Bahasa Inggris), pembuatan tokenizer BPE 30.368 / 64k, kurikulum pelatihan dua tahap, dan optimasi bobot model diproses di lingkungan cluster GPU terpisah. **Ini bukan beban langsung antarmuka web.**  
**Arsitektur Korpus Dua Rak (Rak K Indonesia & Rak R English) & Kurikulum Dua Tahap:**  
**Rak K (17,9+ Miliar token BPE):** Terdiri murni 100% Bahasa Indonesia untuk memastikan penguasaan tata bahasa, nuansa budaya, dan struktur kalimat lokal.  
**Rak R (\~109 GB):** Menghimpun materi dari peS2o, PubMed Central, dan StackExchange yang dialokasikan dalam bahasa Inggris native tanpa pemaksaan terjemahan mesin massal, mencegah fenomena translationese.  
**Kurikulum Pelatihan Dua Tahap:** Tahap 1 menyerap penalaran sains & koding global dari Rak R, dilanjutkan Tahap 2 yang memantapkan dialektika dan bahasa instruksi Indonesia via Rak K.

```
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
```

1.   
2. **Urusan "Tubuh & Mesin Aplikasi" (Rategoan di Vercel):**  
   Merupakan platform operasional harian yang diakses pengguna.  
   **PRINSIP MUTLAK PENGGUNA:** Seluruh menu yang ada di Sidebar dan seluruh tombol pada modal Lampirkan (`+`) **WAJIB 100% NYATA, BERFUNGSI, DAN TERINTEGRASI**. Dilarang keras ada tombol pajangan, menu kosmetik tanpa fungsi, atau penampung teks statis.  
   **PRINSIP MANDIRI TANPA API KEY:** Model operasional utama yang digunakan Rategoan saat ini adalah murni model RAGET buatan sendiri (in-house), tanpa ketergantungan pada model eksternal dan TANPA memerlukan API Key pihak ketiga apa pun. Seluruh ekosistem antarmuka, toolset, dan konektor dibangun sebagai 'Tangan dan Alat Kerja Otonom (Autonomous Actuators & Tooling Layer)' yang siap sedia. Pilihan model Rategoan terdiri secara eksklusif dari dua pilar utama: Raget Template bawaan sistem dan Model Neural Raget 1.0 hasil pre-training korpus K/R (17+ Miliar token BPE). Kedua model ini langsung memiliki tangan dan alat kerja yang lengkap untuk bertindak secara mandiri dan otonom tanpa bergantung pada model luar atau API key pihak ketiga.

## **1.3 Jalur Giliran Tunggal (The Unified Turn Pipeline)**

Pemrosesan respon obrolan pada Rategoan mengeksekusi alur pemrosesan 6 tahap linier yang terpadu, sebagaimana didefinisikan dalam `docs/KERANGKA-MESIN.md` dan dikendalikan oleh `raget/raget-agents/turn-pipeline.js`:

3. **intent (router-intent.js):** Menganalisis niat utama pertanyaan pengguna secara presisi untuk menentukan kategori respons.  
4. **context (turn-pipeline.js):** Menghimpun riwayat percakapan, dokumen terlampir, dan memori kognitif relevan sebagai konteks masukan.  
5. **route (turn-pipeline.js):** Menentukan jalur eksekusi terbaik berdasarkan parameter aktif (alat, pencarian web, atau model spesifik).  
6. **compose (engine-router.js):** Mengarahkan permintaan ke modul penalaran spesialisasi domain yang sesuai di direktori `raget/` untuk penyusunan draf respon awal.  
7. **qc (vault/web/web-qc.js):** Menjalankan fungsi kontrol kualitas (QC) lokal otomatis yang memvalidasi integritas sitasi, mencocokkan fakta dengan sumber rujukan, serta mencegah halusinasi sebelum teks disajikan ke pengguna.  
8. **act (composer.js & chat.js):** Merender hasil respon akhir secara halus ke antarmuka obrolan beserta pemanggilan alat atau pembuatan artefak jika ada.

## **1.2 Keunggulan Paradigma "Brain-Swappable Harness"**

Ketika seluruh mesin antarmuka (editor kode, pembuat slide `.pptx`, konektor Google Drive/GitHub, file parser dokumen, riset web, dan sistem proyek) telah **nyata berfungsi**:

* Otak AI Rategoan yang dipasang—baik Raget Template bawaan sistem maupun Model Neural Raget 1.0 hasil pre-training korpus K/R (17+ Miliar token BPE)—akan langsung memiliki tangan dan alat kerja yang lengkap untuk bertindak secara mandiri dan otonom tanpa bergantung pada model luar atau API key pihak ketiga.

# **2\. BEDAH KOMPARASI VISUAL DENGAN FRONTIER AI LAINNYA**

Berdasarkan analisis tangkapan layar nyata antarmuka industri:

1. 3\. TIGA TINGKAT KEMATANGAN KONEKTOR (CONNECTOR MATURITY LEVELS)

| Layanan Referensi | Karakteristik Kunci Antarmuka | Standar yang Diadopsi Rategoan |
| :---- | :---- | :---- |
| Grok (Tangkapan Layar 1\) | • Subtitle penjelas fungsi konektor eksternal.• Banner peringatan "Reconnect required" saat token kedaluwarsa.
• Pemisahan kategori Connected (aktif) dan Featured (katalog). | Adopsi struktur kategori Connected vs Featured dan sistem deteksi token kedaluwarsa otomatis. |
| Manus AI (Tangkapan Layar 2\) | • Orientasi aksi agenik nyata: Penggunaan Komputer (OS), Video Editor, GitHub (kelola repo), Instagram (publish), Gmail (buat balasan).• Tanda navigasi panah \> untuk membuka sub-halaman penjelajah data. | Adopsi kapabilitas Full Lifecycle Management (bisa baca, tulis, dan kelola) serta sub-view penjelajah data. |
| Claude (Tangkapan Layar 3\) | • Sakelar toggle "Penemuan konektor" (AI otomatis memilih tool).• Badge jumlah fungsi/alat spesifik pada tiap layanan (misal: GitHub \[45\], Gmail \[30\], Drive \[11\]). | Adopsi toggle penemuan konektor otonom dan transparansi badge jumlah alat (tool count badge). |
| ChatGPT (Tangkapan Layar 4\) | • Katalog terbagi: Sudah Terinstal, Populer, dan Baru.• Ikon gembok otorisasi dan pencarian terintegrasi. | Adopsi alur otorisasi satu klik (One-Click OAuth) langsung dari kartu layanan. |
| Rategoan Eksisting (Layar Lama) | • Teks manual "Antrian ke server sendiri", input https\://server-anda, dan log teks mentah "drive-export · antrian". | DIHAPUS TOTAL & DIGANTIKAN oleh Vercel Serverless \+ Direct OAuth 2.0 PKCE. |

# 

Agar AI tidak sekadar membaca cuplikan teks, setiap konektor wajib memenuhi 3 level kematangan:

9. **Level 1 — Membaca (Read):** Menelusuri berkas, mencari email, membaca riwayat commit, dan mengekstrak teks dokumen.  
10. **Level 2 — Menulis (Write):** Membuat file Google Docs baru, menulis rumus di Google Sheets, membuat branch baru, menyusun draf email balasan, dan mendaftarkan event kalender.  
11. **Level 3 — Mengurus Langsung (Manage & Orchestrate):** Mengelola siklus hidup data:  
    * **Google Drive:** AI dapat merapikan direktori, memindahkan berkas antar-folder, menyunting bab dokumen, dan mengekspor laporan.  
    * **GitHub:** AI dapat menginspeksi bug, membuat branch, melakukan commit perbaikan kode, menjalankan validasi linter di sandbox, dan membuka Pull Request lengkap.  
    * **Gmail:** AI dapat menyortir inbox, melabeli email prioritas, mengarsipkan spam, dan menyusun balasan otomatis.  
    * **Google Calendar:** AI dapat menganalisis beban jadwal, mendeteksi bentrok agenda, dan menjadwalkan ulang pertemuan.

# **4\. SPESIFIKASI MENU 'KONEKTOR' TERPUSAT (SIDEBAR)**

Halaman **Konektor** dirombak total mengadopsi standar Grok, Manus, dan Claude:

* 5\. SPESIFIKASI FUNGSIONAL 9 FITUR MODAL 'LAMPIRKAN' (+)

```
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
```

# **5\. SPESIFIKASI FUNGSIONAL 9 FITUR MODAL 'LAMPIRKAN' (\#attach-sheet)**

Lembar modal *bottom sheet* **Lampirkan** (`#attach-sheet`) pada kolom input obrolan dipertahankan tetap murni dan 100% berfungsi dengan pemetaan presisi terhadap elemen DOM HTML aslinya:

12. **Grid Atas (3 Kartu Aksi Utama):**  
    * `#sheet-camera` **\[ 📷 Kamera \]:** Memicu fungsi `#pick-camera` dan modul overlay kamera (`#camera-overlay`) memanfaatkan API native `navigator.mediaDevices.getUserMedia` untuk memotret dokumen fisik dan mengekstrak teksnya via OCR instan.  
    * `#sheet-photo` **\[ 🖼️ Foto \]:** Memicu pemilih galeri gambar native `#pick-photo` (`<input type="file" accept="image/*">`) dengan pratinjau thumbnail sebelum dikirim ke sesi chat.  
    * `#sheet-file` **\[ 📁 File \]:** Memicu pemilih file dokumen lokal `#pick-file` dengan filter ekstensi lengkap (`.pdf`, `.docx`, `.txt`, `.csv`, `.ics`, `.enex`, `.zip`). Diolah oleh parser PDF (`pdf.js`), Word (`mammoth.js`), WhatsApp (`vault/whatsapp/importer.js`), Evernote (`vault/evernote/importer.js`), Notion (`vault/notion/importer.js`), dan Kalender ICS (`vault/calendar/ics-parser.js`).  
13. **Daftar Bawah Tipe Toggle Switch (role="switch" dengan Thumb ON/OFF):**  
    * `#sheet-websearch` **\[ 🌐 Pencarian Web \]:** Sakelar toggle interaktif untuk mengaktifkan pencarian web real-time via Vercel proxy `/api/connectors/web/search` lengkap dengan sitasi tautan sumber.  
    * `#sheet-think` **\[ 😊 Berpikir lebih keras \]:** Sakelar toggle untuk mengaktifkan alur penalaran terstruktur dengan pelacakan pemikiran visual yang dapat dilipat (*Collapsible Thinking Trace Box*).  
    * `#sheet-research` **\[ 🔍 Riset mendalam \]:** Sakelar toggle untuk mengaktifkan loop riset otonom multi-langkah (pencarian multi-kueri, sintesis puluhan artikel, dan penyusunan laporan komprehensif).  
14. **Daftar Bawah Tipe Action Button (Tombol Eksekusi Langsung):**  
    * `#sheet-slide` **\[ 🖥️ Buat Slide (.pptx) \]:** Tombol aksi langsung yang memicu pembuatan dan pengunduhan berkas presentasi PowerPoint asli via mesin biner `shared/pptx-local.js` bawaan repositori.  
    * 6\. SPESIFIKASI FUNGSIONAL 7 MENU SIDEBAR (\#sidebar)\#sheet-project \[ 📁 Masukkan ke proyek \]: Tombol aksi langsung untuk membuka lembar pemilih ruang kerja proyek aktif (\#project-sheet).  
    * \#sheet-learn \[ 📱 Belajar terpandu \]: Tombol aksi langsung untuk mengubah mode instruksi menjadi Socratic Tutor yang tersambung ke modul quiz-session.js dan stem-engine.js.  
15. \#attach-close \[ Tombol Silang Penutup \]: Tombol penutup modal yang berada di posisi bawah lembar lampirkan untuk menutup modal kembali ke antarmuka obrolan.

# 

Seluruh menu navigasi di panel samping (`#sidebar`) Rategoan dipetakan secara presisi berdasarkan hirarki elemen DOM dan urutan navigasi aslinya:

16. **Header Sidebar:** Menampilkan judul berciri khas tipografi serif elegan **Rategoan** sebagai penanda identitas platform.  
17. **Navigasi Utama Menu Samping:**  
    * `#btn-new-chat` **\[ 💬 Chat Baru \]:** Membuka sesi obrolan baru yang bersih dengan UUID unik.  
    * `#btn-studio` **\[ 💻 Studio kode \]:** Ruang kerja pemrograman terpadu berbasis CodeMirror, tab *Live Preview*, dan eksekutor Python WebAssembly (Pyodide).  
    * `#btn-collection` **\[ 🔖 Koleksi \]:** Pustaka penyimpanan terstruktur untuk menyimpan jawaban bernilai tinggi dan template prompt emas.  
    * `#btn-project` **\[ 📁 Proyek \]:** Manajemen multi-workspace terisolasi dengan *system prompt* khusus dan berkas rujukan permanen.  
    * `#btn-connect` **\[ 🔗 Konektor \]:** Hub integrasi awan (Google Drive, GitHub, Gmail, Calendar) berbasis OAuth 2.0 PKCE dengan kapabilitas BACA, TULIS, dan MENGURUS langsung.  
    * `#btn-artifact` **\[ 📦 Artefak \]:** Pusat penyimpanan seluruh berkas yang diproduksi oleh Rategoan (slide `.pptx`, dokumen `.pdf`/`.docx`/`.csv`/`.zip`, skrip kode).  
18. **Bagian Riwayat Sesi Chat:**  
    * `#btn-history` **\[ 🕒 Riwayat Chat \]:** Label bagian riwayat obrolan yang tersimpan persisten di IndexedDB.  
    * `#hist-search` **\[ Bilah Pencarian \]:** Input rounded pill dengan placeholder *"Cari riwayat..."* untuk memfilter percakapan secara terpisah.  
    * `#hist-list` **\[ Kontainer Daftar Sesi \]:** Area penampung dinamis daftar sesi obrolan (menampilkan pesan default *'Belum ada chat'* saat kosong).  
19. **Footer Navigasi Bawah:**  
    * `#btn-settings` **\[ ⚙️ Ikon Gear Pengaturan \]:** Mengarahkan pengguna langsung ke halaman Pengaturan Aplikasi (`#view-settings`).  
    * `#btn-account` **\[ 👤 Lingkaran Avatar Profil 'M' \]:** Tombol profil pengguna Maetalizer untuk melihat atau mengelola akun.

## **6.1 Arsitektur Universal Client-Side Artifact Engine & Generator Berkas Multi-Format**

**Prinsip Dasar Client-Side Blob Synthesis:**  
Seluruh pembuatan berkas pada Rategoan diproses 100% di sisi peramban pengguna (client-side) menggunakan Web API native (`Blob`, `URL.createObjectURL`). Pendekatan ini menjamin pembuatan berkas berlangsung instan, tanpa membebani kuota server Vercel, dan tanpa bergantung pada API key atau layanan eksternal bernilai tambah.  
**Rincian Mesin Generator Multi-Format:**

* **Kode & Skrip (.html, .js, .py, .css, .json):** Konversi teks mentah secara langsung menjadi Blob MIME sesuai ekstensi. Dilengkapi fitur Live Preview melalui `iframe sandbox` dan eksekusi lokal (`jsSandbox` di `js/ui/artifact.js`).  
* **Slide Presentasi (.pptx):** Integrasi langsung dengan mesin biner OpenXML lokal `shared/pptx-local.js` bawaan repositori untuk menghasilkan berkas presentasi PowerPoint asli.  
* **Dokumen Word (.docx):** Pembuatan dokumen berformat via template OpenXML WordprocessingML / HTML-Word Envelope (`shared/docx-local.js`) yang langsung kompatibel dengan Microsoft Word dan Google Docs.  
* **Dokumen Cetak (.pdf):** Render tata letak rapi A4 berbasis CSS `@media print` dan pembungkus PDF lokal yang siap cetak atau diunduh instan dalam 1 klik.  
* **Tabel Data Spreadsheet (.csv):** Serialisasi matriks tabel ke format CSV standar RFC 4180 untuk dibuka langsung di Microsoft Excel atau Google Sheets.  
* **Paket Proyek Multi-Berkas (.zip):** Pembungkus ZIP client-side murni (`shared/zip-local.js`) untuk memaketkan banyak file proyek (misalnya proyek web lengkap HTML, CSS, dan JS) menjadi satu unduhan arsip `.zip`.

## **6.2 Protokol Respon AI & Alur Pengalaman Pengguna (UX Visual Artefak)**

* **Format Tag Respon Model:** Ketika pengguna meminta pembuatan file, model Raget mengeluarkan tag artefak terstruktur:

```xml
<artifact type="html|code|document|slide|table|zip" title="Judul Berkas" filename="nama_berkas.ext">
...isi konten berkas... 
</artifact>
```

* **Kartu Artefak Interaktif di Obrolan (Inline Chat Card):** Obrolan tidak menumpahkan kode mentah ratusan baris, melainkan merender kartu elegan (dikelola oleh `js/ui/artifact-card.js`) dengan ikon tipe berkas, nama file, estimasi ukuran, serta 2 tombol aksi: `[ 👁️ Pratinjau Langsung ]` dan `[ ⬇️ Unduh Berkas ]`.  
* **Panel Samping Interaktif (Side Stage Split-View):** Mengetuk tombol pratinjau akan membuka panel samping `#artifact-panel` (`js/ui/artifact.js`) untuk menampilkan live-preview atau penyuntingan langsung secara instan (`contentEditable`).  
* **Integrasi Penyimpanan Persisten:** Seluruh artefak yang dihasilkan otomatis disimpan secara permanen di `IndexedDB` lokal dan terdaftar pada halaman Artefak di Sidebar (`#artifact-page-list`).

## **6.3 Mesin Penyerapan Data Pribadi Offline (Personal Data Vault Importers)**

Rategoan menyediakan modul penyerapan data mandiri berbasis klien murni di direktori `vault/` yang memungkinkan pengguna mengimpor riwayat digital mereka secara gratis dan tanpa melibatkan perantara server:

* **WhatsApp Chat Importer (vault/whatsapp/importer.js):** Menganalisis file ekspor obrolan `.txt`, memisahkan pengirim, stempel waktu, dan konteks percakapan untuk diindeks ke dalam memori pencarian.  
* **Evernote Importer (vault/evernote/importer.js):** Mengekstrak file `.enex` berformat XML menjadi catatan terstruktur lengkap dengan tag dan lampiran teks.  
* **Notion Archive Importer (vault/notion/importer.js):** Memproses ekspor arsip ZIP atau file Markdown (`.md`) Notion, merapikan tautan antar-halaman dan struktur hirarki dokumen.  
* **Calendar ICS Parser (vault/calendar/ics-parser.js):** Membaca berkas standar kalender `.ics` untuk mengekstrak agenda acara, waktu, dan catatan rapat langsung ke memori lokal.

## **6.4 Mesin RAG & Pencarian Semantik Vektor Lokal (On-Device Vector Retrieval)**

Untuk memproses dokumen berukuran besar (40+ halaman) tanpa bergantung pada API embedding pihak ketiga, Rategoan menggunakan triada mesin pencarian lokal di peramban:

* **Okapi BM25 Lexical Engine (bm25.js):** Algoritma pemeringkatan relevansi teks berbasis frekuensi kata (TF-IDF terbobot) untuk menemukan kata kunci presisi tinggi secara instan.  
* **PPMI Local Vector Generator (ppmi-embedding.js):** Menerapkan *Positive Pointwise Mutual Information* untuk menghasilkan representasi vektor semantik ringan langsung di RAM peramban.  
* **In-Memory Semantic Index (semantic-index.js):** Penggabung pencarian hibrida (BM25 \+ Vektor PPMI) yang memotong dokumen panjang menjadi pecahan-pecahan (chunks) relevan sebagai konteks kaya bagi model RAGET.

## **6.5 Fitur Interaksi Suara Dwiarah & Pencarian Pesan Dalam Chat**

* **Interaksi Suara Dwiarah Native (js/chat/voice.js):** Menyediakan pengenalan suara masukan (Speech-to-Text / STT) Bahasa Indonesia (`id-ID`) secara native melalui Web Speech API yang dipicu via tombol `#btn-voice-input`. Dilengkapi pembaca respon otomatis (Text-to-Speech / TTS) via `SpeechSynthesisUtterance` yang dapat dikontrol lewat tombol `#btn-stop`, dengan pembersihan otomatis karakter/sintaks markdown agar pengucapan terdengar alami.  
* **Pencarian Pesan Dalam Obrolan (js/chat/chatsearch.js):** Memungkinkan pencarian teks real-time di dalam sesi obrolan yang sedang aktif dengan sorotan visual pada hasil pencarian dan tombol navigasi untuk melompat antar-pesan yang cocok secara instan.

# **7\. KUMPULAN ALAT SIKLUS PENUH (CRUD TOOLSETS)**

Setiap konektor didukung oleh kumpulan alat (*toolsets*) berstandar Model Context Protocol (MCP):

* 8\. GERBANG KEAMANAN & KONFIRMASI PENGGUNA (HUMAN-IN-THE-LOOP)

## **7.1 Spesifikasi Kontrak API & Protokol Tool-Calling Raget**

* **Kontrak API & Autentikasi Klien:** Klien mengirimkan token akses OAuth yang tersimpan di `localStorage` ke Vercel Serverless Functions melalui HTTP Header standar: `Authorization: Bearer <token>`.  
* **Format Tag Pemanggilan Alat (Tool-Calling Protocol):** Model Raget Template dan Raget 1.0 melakukan pemanggilan alat secara terstruktur menggunakan format tag penutup berikut:

```xml
<tool_call>{"name": "drive_search_files", "parameters": {"query": "Laporan Keuangan 2026"}}</tool_call>
```

* **Siklus Render UI Kartu Alat (Tool UI Execution Lifecycle):** Saat tag pemanggilan alat terdeteksi dalam aliran respon, antarmuka obrolan secara dinamis merender kartu status lipat (collapsible UI card):  
  * **Fase Loading:** Menampilkan indikator animasi halus `[⏳ Menelusuri Google Drive...]`.  
  * **Fase Sukses:** Berubah menjadi badge hijau `[✓ 3 berkas ditemukan]` yang dapat diklik pengguna untuk melihat log eksekusi teknis detail.

```json
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
7.2 Spesialisasi Mesin Penalaran Raget Template (Specialized Domain Engines)
Model Raget Template dilengkapi dengan seperangkat modul penalaran terdefinisi di direktori raget/ untuk mengeksekusi tugas-tugas spesifik domain secara tepat dan otonom:
STEM & Math Precision Engines (stem-engine.js & math-engine.js): Mengeksekusi kalkulasi eksak rumus matematika, persamaan fisika, dan analisis sains tanpa risiko halusinasi angka numerik.
Social & Humanities Engine (social-engine.js): Modul penalaran khusus ilmu sosial, analisis etika, serta wawasan kebudayaan lokal Indonesia.
Bilingual Engine (bilingual.js): Penyeimbang alih-bahasa otomatis yang memastikan kualitas tata bahasa baku Bahasa Indonesia dan Bahasa Inggris tetap konsisten.
Daily Briefing Generator (daily-briefing.js): Penyusun ringkasan pagi otonom yang memadukan agenda kalender pribadi, informasi cuaca realtime (vault/web/weather.js), dan kabar berita terkini (vault/web/news.js).
```

## **7.3 Mesin Terjemahan Realtime & Response Language Lock**

* **Mesin Terjemahan Inferensi (vault/translate/translator.js):** Menggunakan modul ONNX `Xenova/opus-mt-en-id` dan `Xenova/opus-mt-mul-en` via `transformers.js`.  
* **Peran Tunggal:** Dikhususkan untuk rule-engine pencarian web real-time (`vault/web/web-search.js` dan `read-web.js`), sehingga materi sumber web berbahasa Inggris otomatis diterjemahkan ke Bahasa Indonesia sebelum disintesis.  
* **Response Language Lock (raget/raget-agents/answer-composer.js):** Jaring pengaman terakhir yang memastikan jawaban akhir selalu terkunci dalam Bahasa Indonesia baku.

# 

20. **Aksi Level 1 (Baca):** Berjalan otomatis secara transparan dengan sitasi tautan URL sumber klikable.  
21. **Aksi Level 2 (Draf / Berkas Baru):** Eksekusi otomatis dengan pemberitahuan ringkas dan tautan langsung ke berkas yang baru dibuat.  
22. **Aksi Level 3 (Kirim / Hapus / Timpa Data):** Sistem **wajib** menampilkan kartu konfirmasi interaktif di obrolan sebelum perintah API dieksekusi:  
    * Menampilkan detail penerima, subjek, dan ringkasan isi (untuk email).  
    * Menampilkan diff kode dan branch target (untuk commit/PR GitHub).  
    * Menyediakan tombol jelas: `[ Batalkan ]` dan `[ Setujui & Jalankan ]`.

# **9\. SPESIFIKASI HALAMAN PENGATURAN (\#view-settings) & JANGKAR PROFIL PENGGUNA**

Berdasarkan analisis tangkapan layar antarmuka **Pengaturan** (`#view-settings`) dan implementasi berkas `js/account/settings.js`:

## **9.1 Jangkar Kartu Identitas Akun Pengguna (\#profile-head)**

* Kartu header profil (`#profile-head`) menampilkan avatar lingkaran besar huruf 'M', nama tampilan `#profile-name` (**Maetalizer**), serta email `#profile-mail` (**maetalizer@gmail.com**).  
* Menjadi jangkar Single Sign-On (SSO) untuk otorisasi Google Drive, Gmail, dan Calendar tanpa meminta pengguna mengetik ulang email mereka.

## **9.2 Rincian 6 Sub-Kategori Menu Navigasi Kartu Pengaturan**

* `🌙 Tampilan (data-cat="tampilan") >`**:** Mengatur tema visual Mode Gelap (Opsi: T=Terang, A=Auto, G=Dark) dan Ukuran Teks (Opsi: K=Kecil, N=Normal, B=Besar).  
* `🖥 Model (data-cat="ai") >`**:** Status 2 model in-house Rategoan (Raget Template dan Raget 1.0) serta pengaturan konfigurasi URL server inference sendiri via `#row-llm-mode`.  
* `🔒 Privasi & Keamanan (data-cat="privasi") >`**:** Menyediakan penguncian aplikasi dengan PIN 4-6 digit (`#row-pin`), sakelar penyiapan Memori Kognitif (`#row-memori`), dan opsi Hapus memori tersimpan dari IndexedDB (`#row-hapus-memori`).  
* `🗄️ Data (data-cat="data") >`**:** Menampilkan informasi statistik penyimpanan lokal (`#storage-info`), Cadangkan Chat (`#row-backup`), Pulihkan Chat (`#row-restore`), Unduhan Fitur offline OCR/Terjemahan/PDF (`#row-unduhan-fitur`), Lembar Diagnostik Kesehatan Data (`#row-data-health`), serta Buka Koleksi (`#row-pengetahuan-saya`).  
* `🔊 Preferensi (data-cat="preferensi") >`**:** Pengaturan Baca Otomatis pembaca suara TTS (`#row-tts`) dan sakelar Mode Hemat baterai/kuota (`#row-hemat`).  
* `ℹ️ Lainnya (data-cat="lainnya") >`**:** Informasi Tentang Rategoan v1.0, opsi Hapus Semua Chat (`#row-clear-chat`), dan tombol Keluar Sesi (`#row-logout`).

## **9.3 Konsol Keamanan, Diagnostik, dan Ketahanan Sistem (System Resilience & Health)**

* **Kunci Keamanan Sesi PIN Fisik (js/state/pin.js & \#pin-overlay):** Penguncian layar aplikasi menggunakan PIN numerik fisik dengan enkripsi hash DJB2 yang tersimpan lokal di `localStorage` untuk melindungi privasi sesi dan data pengguna di perangkat.  
* **Lembar Diagnostik Kesehatan & Pembelajaran Mandiri (js/sheets/data-health-sheet.js & \#data-health-sheet):** Panel diagnostik terpadu yang mengekstraksi daftar pertanyaan tidak cocok/gagal via `ragetDb.allUnmatched()` serta statistik umpan balik suka/tidak suka pengguna via `feedbackStore.statsByIntent()` sebagai bahan evaluasi perbaikan korpus mandiri.  
* **Mode Hemat Baterai & Kuota (js/state/hemat.js):** Sakelar status `raget_hemat` untuk mengoptimalkan kinerja di perangkat spesifikasi rendah (low-end) dengan menonaktifkan efek animasi berat dan membatasi beban komputasi latar belakang.  
* **Cadangan & Pemulihan Nir-Awan (js/system/backup.js & \#pick-restore):** Fitur ekspor dan pemulihan instan 1-klik untuk seluruh riwayat obrolan, proyek, dan koleksi ke/dari file JSON lokal (`rategoan-backup-YYYY-MM-DD.json`) secara penuh offline tanpa ketergantungan pada layanan cloud pihak ketiga.

# **10\. SPESIFIKASI QUICK MODEL SWITCHER (IKON KOTAK DI SAMPING TOMBOL \+)**

Berdasarkan analisis tangkapan layar bilah input obrolan (`egoan.vercel.app`):

* **Peran:** Mengganti model yang aktif dalam 1 ketukan langsung saat mengetik obrolan. Mesin bawaan dan utama adalah model RAGET buatan sendiri (in-house) yang berjalan secara mandiri tanpa memerlukan API Key pihak ketiga apa pun.  
* **Status:** `Raget Template` (aktif bawaan) dan `Raget 1.0` (aktif saat endpoint server GPU terhubung).

**Indikator Visual & Opsi Model:** Pilihan model dibatasi secara ketat hanya pada 2 model otonom: `Raget Template` dan `Raget 1.0`. Ikon kotak menampilkan label mikro model aktif.

*   
*   
* **Aturan Auto-Fallback Otonom (3-Second SLA Threshold):** Jika pengguna memilih model neural `Raget 1.0` namun endpoint server GPU mengalami kendala jaringan atau tidak merespons dalam batas waktu 3 detik, sistem antarmuka akan secara otomatis mengalihkan inferensi secara mulus ke `Raget Template` dengan notifikasi mikro-toast halus *"Mengalihkan sementara ke Raget Template..."*, menjamin sesi obrolan tidak pernah macet atau terputus.  
* 

```
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
```

* 

## **10.1 Distribusi Checkpoint Neural Hugging Face Hub**

* **Kebijakan Distribusi Bobot Model Neural Nir-Git:** Checkpoint biner `.safetensors` disimpan di Hugging Face Hub (`huggingface.co/Maetalizer19/rategoan-neural`) yang mendukung header CORS `access-control-allow-origin: *`.  
* **Tiga Tier Model Neural:**  
  * **Tier Ringan (50M):** `raget-neural-massive50m.safetensors`  
  * **Tier Berat (100M):** `raget-neural-massive100m.safetensors` (dibatasi hanya jika `deviceMemory >= 4GB`)  
  * **Tier Super (200M):** `raget-neural-massive200m.safetensors` (diprefetch secara diam-diam via `prefetchBest()`)

# **11\. CETAK BIRU IMPLEMENTASI TEKNIS TANPA AMBIGUITAS (ZERO-AMBIGUITY BLUEPRINT)**

## **11.1 Batasan Mutlak Tech Stack**

* **Arsitektur Frontend:** Wajib menggunakan **Vanilla JavaScript Native ES Modules (ESM)** dengan standar peramban modern (`<script type="module">`).  
* **Larangan Keras:** Dilarang mengimpor atau menggunakan compiler framework seperti React, JSX, Vue, atau Svelte, serta dilarang menambahkan build tools bundler berat (Webpack/Vite/Parcel).  
* **Komponen Visual:** Dibangun menggunakan manipulasi DOM murni (`document.createElement`) atau *Template Literals* yang aman dari XSS.  
* **Arsitektur Backend:** Menggunakan **Vercel Serverless Functions** berbasis Node.js standard runtime di direktori `/api/`.

## **11.2 Peta Direktori Berkas Fisik (Concrete Target File Tree)**

```
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
```

## **11.3 Skema Baku Penyimpanan State Klien**

Status konektor disimpan di peramban pada `localStorage` dengan kunci baku: `rategoan_connectors_state`.  
Format objek data yang wajib digunakan:

```json
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
```

## **11.4 Protokol Komunikasi Antar-Komponen**

Komunikasi antar-komponen menggunakan native `CustomEvent`:

* `rategoan:attach-context`: Menyematkan berkas Drive atau file GitHub ke chat input.  
* `rategoan:reconnect-required`: Menampilkan banner peringatan token kedaluwarsa.  
* `rategoan:model-switched`: Mengirim sinyal saat model ditukar lewat Quick Model Switcher.

# **12\. RENCANA KERJA PENYELESAIAN MESIN (HARNESS SPRINT ROADMAP)**

23. **Sprint 1 — Fondasi Riwayat, State & File Parser:**  
    Mengaktifkan `IndexedDB` untuk Riwayat Chat persisten, membuat modul `connector-state.js`, dan memasang parser `pdf.js`/`mammoth.js` pada tombol File lokal.  
24. **Sprint 2 — Generator Slide & Kamera:**  
    Mengintegrasikan modul mandiri bawaan `shared/pptx-local.js` pada tombol Buat Slide dan menghubungkan Web API kamera perangkat.  
25. **Sprint 3 — Hub Konektor Awan & OAuth Vercel:**  
    Menerapkan antarmuka Hub Konektor standar Grok/Manus dan mengaktifkan rute serverless OAuth Google & GitHub di Vercel.  
26. **Sprint 4 — Studio Kode & Quick Model Switcher:**  
    Membangun Code Playground terintegrasi dan menghubungkan modal Quick Model Switcher ke backend inferensi.

## 

27. 

# **13\. MATRIKS EKSEKUSI TEKNIS & CHECKLIST DEFINITION OF DONE (PANDUAN LANGSUNG UNTUK AI PENGEMBANG)**

Bagi pekerjaan implementasi secara terstruktur ke dalam 4 kuadran tindakan nyata:

28. **1\. APA YANG HARUS DIPERBAIKI & DIBERSIHKAN (FIX & CLEANUP):**  
    * **Standar Kode Produksi Berkualitas Tinggi Standar Industri & Bebas Komentar (Zero-Comment Clean Code):** Setiap pembuatan berkas baru maupun pembaruan berkas eksisting wajib memenuhi standar rekayasa perangkat lunak industri tinggi (robust, semantik, modular, self-documenting). DILARANG KERAS menyertakan komentar penjelasan, catatan TODO, komentar baris (`//`), blok komentar (`/* ... */`), maupun komentar HTML (`<!-- ... -->`). Kode harus ekspresif dan berbicara sendiri melalui penamaan variabel dan fungsi yang jelas.  
    * **Tugas Pembersihan Komentar Repositori (Codebase Comment Purge Sprint):** Lakukan penyisiran dan pembersihan total terhadap 40+ berkas eksisting di seluruh direktori repositori (`js/`, `shared/`, `raget/`, `vault/`, `api/`, `css/`, dan `index.html`) dari segala sampah komentar pengembang, blok kode usang yang dimatikan, dan catatan internal agar seluruh berkas 100% berstatus Production Ready.  
    * **Berkas index.html & js/connect/connect.js:** Hapus formulir antrean lama ('https\://server-anda', tombol antrian ekspor drive/WA, dan pre console outbox). Gantikan dengan container Hub Konektor modern.  
    * **Berkas js/sheets/model-sheet.js:** Kunci array VISIBLE\_ENGINE\_IDS hanya berisi \['template', 'neural'\]. Pasang mekanisme graceful fallback 3 detik ke template jika neural offline.  
    * **Berkas js/ui/artifact.js:** Bersihkan ketergantungan teks mentah, pastikan langsung terhubung ke generator lokal.  
29. **2\. APA YANG HARUS DIPERBARUI & DI-UPGRADE (UPDATE & UPGRADE):**  
    * **Berkas js/sheets/attach.js & css/sheets/sheets.css:** Upgrade logic toggle switch (Pencarian Web, Berpikir Keras, Riset Mendalam) agar saat aktif langsung me-render badge 'Active Mode Chips' dengan tombol (x) di elemen \#attach-row tepat di atas \#chat-input.  
    * **Berkas shared/slides-export.js:** Sambungkan tombol \#sheet-slide langsung ke mesin lokal shared/pptx-local.js agar klik tombol langsung mengunduh file .pptx nyata.  
    * **Berkas js/collection/collection.js:** Sambungkan tombol importir di halaman Koleksi ke modul parser vault/whatsapp, vault/notion, vault/evernote, dan vault/calendar.  
30. **3\. APA YANG HARUS DIKERJAKAN DARI NOL (NEW IMPLEMENTATIONS):**  
    * **Berkas js/connectors/connector-hub.js:** Buat modul UI Hub Konektor modern standar Grok/Manus (Kategori Terhubung vs Unggulan, badge jumlah tool, tombol hubungkan/putuskan).  
    * **Berkas api/auth/google/ & api/auth/github/:** Buat Vercel Serverless Function penangan alur OAuth 2.0 PKCE.  
    * **Berkas api/connectors/drive/, api/connectors/github/, api/connectors/gmail/, api/connectors/calendar/:** Buat endpoint serverless pemanggil Google & GitHub API menggunakan Bearer token klien.  
    * **Berkas shared/docx-local.js & shared/zip-local.js:** Buat modul pembungkus Word XML dan ZIP client-side murni.  
    * **Berkas js/ui/artifact-card.js:** Buat komponen kartu artefak interaktif di chat (\<artifact\> parser).  
31. **4\. CHECKLIST PENGUJIAN AKHIR (DEFINITION OF DONE):**  
    * \[x\] Tombol Buat Slide (.pptx) menghasilkan file PowerPoint asli yang bisa dibuka di MS PowerPoint/Google Slides.  
    * \[x\] Menyalakan Pencarian Web memunculkan chip biru di atas input chat.  
    * \[x\] Mengetik pesan yang meminta dokumen Word (.docx) menghasilkan kartu di chat dengan tombol unduh berkas yang valid.  
    * \[x\] Menu Konektor menampilkan status real-time 6 konektor tanpa ada form server-anda lama.  
    * \[x\] Sesi chat tersimpan di IndexedDB dan bisa dicari di riwayat.  
    * \[x\] Terkonfigurasi workflow CI/CD .github/workflows/lint.yml berbasis Node 22 linter.  
    * \[x\] Seluruh suite unit test node:test di raget/raget-tools/unit/ (menguji answer-lock, bm25, router-intent, dan syntax-validator) lulus 100%.

# **14\. TABEL MASTER DAFTAR KERJA & STATUS PROGRESS IMPLEMENTASI (LIVING EXECUTION TRACKER)**

Tabel ini berfungsi sebagai living document acuan kerja agar developer dan AI pelaksana dapat memantau progres secara transparan.

Catatan realisasi 4 Oktober 2026: baris 1–10, 12, 13, 15, 16, 22, 25, dan 27–37 diselaraskan dengan kode yang sudah jalan di `main`. Baris 53 ditahan: pembersihan komentar massal tidak dijalankan karena merusak shader WGSL dan catatan mesin.

*   
  * 

| No | Klaster Sistem | Fitur / Komponen | Berkas Target | Jenis Tindakan | Status Implementasi | Rincian Pekerjaan Teknis Nyata |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| 1 | **Lembar Lampirkan (+)** | Kamera (\#sheet-camera) | `js/sheets/attach.js``index.html` | UPGRADE | \[✓\] SUDAH SELESAI | Overlay \#camera-overlay memakai getUserMedia (js/sheets/camera.js), shutter menyimpan JPG ke lampiran, fallback file picker, OCR lewat vault/ocr saat diminta. |
| 2 | **Lembar Lampirkan (+)** | Foto (\#sheet-photo) | `js/sheets/attach.js``index.html` | UPGRADE | \[✓\] SUDAH SELESAI | Tombol foto membuka \#pick-photo dan menampilkan thumbnail di chip lampiran sebelum dikirim. |
| 3 | **Lembar Lampirkan (+)** | File (\#sheet-file) | `js/sheets/attach.js``vault/rag/semantic-index.js` | UPGRADE | \[✓\] SUDAH SELESAI | Filter .pdf .docx .txt .csv .ics .enex .zip. PDF lewat pdf.js, DOCX lewat word/document.xml, impor pribadi lewat vault. |
| 4 | **Lembar Lampirkan (+)** | Pencarian Web (\#sheet-websearch) | `js/sheets/attach.js``api/connectors/web/search` | UPGRADE | \[✓\] SUDAH SELESAI | Toggle menyalakan chip biru di \#attach-row. Pencarian lewat proxy DuckDuckGo api/connectors/web/search.js (4 alat). |
| 5 | **Lembar Lampirkan (+)** | Buat Slide (.pptx) (\#sheet-slide) | `shared/slides-export.js``shared/pptx-local.js` | UPGRADE | \[✓\] SUDAH SELESAI | Klik \#sheet-slide membangun OpenXML lewat shared/pptx-local.js dan langsung mengunduh .pptx, plus kartu artefak. |
| 6 | **Lembar Lampirkan (+)** | Berpikir Keras (\#sheet-think) | `js/sheets/attach.js``raget/raget-agents/turn-pipeline.js` | UPGRADE | \[✓\] SUDAH SELESAI | Saklar berpikir memasang jejak. Tag trace dirender sebagai kotak details yang bisa dilipat di js/ui/artifact-card.js. |
| 7 | **Lembar Lampirkan (+)** | Riset Mendalam (\#sheet-research) | `js/sheets/attach.js``vault/web/web-search.js` | UPGRADE | \[✓\] SUDAH SELESAI | Saklar riset menyalakan web, menyusun rencana multi-kueri, dan menaruh chip Riset mendalam. |
| 8 | **Lembar Lampirkan (+)** | Masukkan ke Proyek (\#sheet-project) | `js/sheets/attach.js``js/sheets/project-sheet.js` | UPGRADE | \[✓\] SUDAH SELESAI | Tombol proyek membuka daftar ruang kerja dan mengaitkan sesi aktif ke proyek yang dipilih. |
| 9 | **Lembar Lampirkan (+)** | Belajar Terpandu (\#sheet-learn) | `js/sheets/attach.js``raget/quiz-session.js` | UPGRADE | \[✓\] SUDAH SELESAI | Belajar terpandu menyusun langkah dari bahan obrolan plus cek pemahaman. Kuis quiz-session.js dan hitungan stem-engine.js hidup di jalur mesin. |
| 10 | **Lembar Lampirkan (+)** | Active Mode Chips | `js/sheets/attach.js``css/sheets/sheets.css` | UPGRADE | \[✓\] SUDAH SELESAI | Mode aktif (web, berpikir, riset) menjadi chip dengan tombol x di \#attach-row. Chip web memakai gaya biru. |
| 11 | **Navigasi Sidebar** | Chat Baru (\#btn-new-chat) | `js/chat/chat.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Membuat sesi percakapan bersih baru dengan UUID unik dan mengosongkan kontainer obrolan. |
| 12 | **Navigasi Sidebar** | Studio Kode (\#btn-studio) | `js/studio/studio.js` | UPGRADE | \[✓\] SUDAH SELESAI | Studio memakai CodeMirror, iframe pratinjau, dan runner Python Pyodide dari CDN. |
| 13 | **Navigasi Sidebar** | Koleksi (\#btn-collection) | `js/collection/collection.js` | UPGRADE | \[✓\] SUDAH SELESAI | Koleksi menyimpan jawaban dan mengimpor WhatsApp .txt, Evernote .enex, Notion .zip/.md, serta kalender .ics. |
| 14 | **Navigasi Sidebar** | Proyek (\#btn-project) | `js/project/project.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Manajemen multi-workspace terisolasi dengan system prompt khusus dan berkas rujukan permanen per proyek. |
| 15 | **Navigasi Sidebar** | Konektor (\#btn-connect) | `index.html``js/connect/connect.js` | PERBAIKAN | \[✓\] SUDAH SELESAI | Formulir server-anda dihapus. Navigasi Konektor membuka Hub modern di \#connect-hub dengan OAuth Google dan GitHub. |
| 16 | **Navigasi Sidebar** | Artefak (\#btn-artifact) | `js/ui/artifact.js` | UPGRADE | \[✓\] SUDAH SELESAI | Galeri artefak menampilkan slide, dokumen, kode, tabel, dan zip yang tersimpan, lalu bisa dibuka lagi dari daftar. |
| 17 | **Navigasi Sidebar** | Riwayat Chat (\#btn-history) | `js/chat/history.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Manajemen penampil daftar riwayat percakapan persisten yang tersimpan di IndexedDB lokal. |
| 18 | **Navigasi Sidebar** | Cari Riwayat (\#hist-search) | `js/chat/history.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Input pencarian terfilter untuk menyaring daftar sesi percakapan berdasarkan kata kunci topik. |
| 19 | **Navigasi Sidebar** | Pengaturan (\#btn-settings) | `js/account/settings.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Mengarahkan navigasi antarmuka secara langsung ke tampilan pusat Pengaturan Aplikasi (\#view-settings). |
| 20 | **Navigasi Sidebar** | Avatar Profil (\#btn-account) | `js/account/settings.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Tombol profil akun Maetalizer untuk melihat identitas pengguna dan membuka detail akun. |
| 21 | **Input Chat & Switcher** | Chat Input Textarea | `js/chat/chat.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Bilah masukan teks serbaguna dengan dukungan auto-expand, drag-and-drop file, dan shortcut Enter/Shift+Enter. |
| 22 | **Input Chat & Switcher** | Quick Model Switcher | `js/sheets/model-sheet.js` | PERBAIKAN | \[✓\] SUDAH SELESAI | Daftar model terkunci ke template dan neural. Jika neural belum siap dalam 3 detik, sesi beralih ke template dengan toast yang ditentukan. |
| 23 | **Input Chat & Switcher** | Input Suara (STT id-ID) | `js/chat/voice.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Pengenalan suara masukan Bahasa Indonesia (id-ID) native via Web Speech API yang dipicu tombol \#btn-voice-input. |
| 24 | **Input Chat & Switcher** | Output Suara (TTS id-ID) | `js/chat/voice.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Pembaca respon otomatis via SpeechSynthesisUtterance dengan filter pembersihan karakter markdown alami. |
| 25 | **Input Chat & Switcher** | In-Chat Message Search | `js/chat/chatsearch.js` | UPGRADE | \[✓\] SUDAH SELESAI | Bilah cari mengambang di obrolan, sorotan .msg.hit, dan tombol lompat pesan sebelumnya atau berikutnya. |
| 26 | **Artifact Engine** | Generator PPTX Lokal | `shared/pptx-local.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Mesin biner OpenXML murni client-side untuk membuat dan mengekspor berkas presentasi PowerPoint .pptx. |
| 27 | **Artifact Engine** | Generator DOCX Lokal | `shared/docx-local.js` | BARU | \[✓\] SUDAH SELESAI | shared/docx-local.js membungkus WordprocessingML lewat zip store dan dipakai kartu unduh dokumen. |
| 28 | **Artifact Engine** | Generator ZIP Lokal | `shared/zip-local.js` | BARU | \[✓\] SUDAH SELESAI | shared/zip-local.js menulis arsip ZIP store (header lokal, central, EOCD) untuk unduhan multi-berkas dan DOCX. |
| 29 | **Artifact Engine** | Sandbox HTML/JS/PY | `js/ui/artifact.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Pratinjau langsung via iframe sandbox aman untuk HTML/JS/CSS dan eksekusi Python via Pyodide WebAssembly. |
| 30 | **Artifact Engine** | Generator Tabel CSV | `js/ui/artifact.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Serialisasi matriks tabel obrolan ke format RFC 4180 CSV untuk diunduh dan dibuka di Excel/Sheets. |
| 31 | **Artifact Engine** | Kartu Artefak Chat | `js/ui/artifact-card.js` | BARU | \[✓\] SUDAH SELESAI | js/ui/artifact-card.js mem-parse tag artifact, trace, dan tool_call lalu memasang kartu Pratinjau dan Unduh. |
| 32 | **Hub Konektor & Vercel** | UI Hub Konektor Modern | `js/connectors/connector-hub.js` | BARU | \[✓\] SUDAH SELESAI | js/connectors/connector-hub.js menampilkan kartu Terhubung dan Unggulan, jumlah alat, serta hubungkan atau putuskan. |
| 33 | **Hub Konektor & Vercel** | Google Drive OAuth & Tools | `api/connectors/drive/` | BARU | \[✓\] SUDAH SELESAI | api/connectors/drive.js menyediakan 11 alat Google Drive lewat token Bearer klien. |
| 34 | **Hub Konektor & Vercel** | GitHub OAuth & Tools | `api/connectors/github/` | BARU | \[✓\] SUDAH SELESAI | api/connectors/github.js menyediakan 45 alat GitHub (repo, commit, PR, issue). |
| 35 | **Hub Konektor & Vercel** | Gmail OAuth & Tools | `api/connectors/gmail/` | BARU | \[✓\] SUDAH SELESAI | api/connectors/gmail.js menyediakan 30 alat Gmail. Kirim pesan tetap lewat tingkat konfirmasi. |
| 36 | **Hub Konektor & Vercel** | Google Calendar OAuth & Tools | `api/connectors/calendar/` | BARU | \[✓\] SUDAH SELESAI | api/connectors/calendar.js menyediakan 6 alat agenda, bentrok, dan rapat. |
| 37 | **Hub Konektor & Vercel** | Web Search Scraper | `api/connectors/web/search` | BARU | \[✓\] SUDAH SELESAI | api/connectors/web/search.js mem-proxy DuckDuckGo HTML tanpa API berbayar, dengan cadangan halaman. |
| 38 | **Halaman Pengaturan** | Kartu Profil Maetalizer | `js/account/settings.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Header profil \#profile-head dengan avatar 'M', nama Maetalizer, dan email maetalizer@gmail.com sebagai jangkar SSO. |
| 39 | **Halaman Pengaturan** | Mode Gelap & Ukuran Teks | `js/account/settings.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Pengaturan tema visual Mode Gelap (Terang/Auto/Dark) serta penyesuaian ukuran teks (Kecil/Normal/Besar). |
| 40 | **Halaman Pengaturan** | Kunci PIN Fisik Sesi | `js/state/pin.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Penguncian layar aplikasi dengan PIN 4-6 digit hash DJB2 yang tersimpan lokal di localStorage. |
| 41 | **Halaman Pengaturan** | Memori Kognitif Jangka Panjang | `raget/raget-memory/memory-long.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Sistem penyimpanan fakta dan preferensi pengguna jangka panjang yang terhubung ke IndexedDB. |
| 42 | **Halaman Pengaturan** | Storage Info & Backup/Restore | `js/system/backup.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Informasi kuota penyimpanan lokal dan fitur ekspor/impor cadangan JSON offline 1-klik. |
| 43 | **Halaman Pengaturan** | Mode Hemat Kuota/Baterai | `js/state/hemat.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Optimasi kinerja untuk perangkat spesifikasi rendah dengan menonaktifkan animasi berat dan komputasi latar. |
| 44 | **Halaman Pengaturan** | Data Health Sheet | `js/sheets/data-health-sheet.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Panel diagnostik ekstraksi pertanyaan tidak cocok/gagal dan rekapitulasi umpan balik pengguna. |
| 45 | **Mesin Inti RAGET** | Turn Pipeline (6 Tahap) | `raget/raget-agents/turn-pipeline.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Jalur giliran tunggal pemrosesan obrolan 6 tahap linier: intent \-\> context \-\> route \-\> compose \-\> qc \-\> act. |
| 46 | **Mesin Inti RAGET** | Okapi BM25 & PPMI RAG Lokal | `vault/rag/semantic-index.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Pencarian hibrida gabungan pementaan kata leksikal BM25 dan vektor PPMI ringan langsung di RAM peramban. |
| 47 | **Mesin Inti RAGET** | Specialized Domain Engines | `raget/stem-engine.js``raget/social-engine.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Seperangkat modul penalaran spesialisasi domain (STEM, matematika eksak, ilmu sosial, dan dwibahasa). |
| 48 | **Mesin Inti RAGET** | Translator Xenova/opus-mt-en-id | `vault/translate/translator.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Model penerjemahan ONNX lokal transformers.js untuk menerjemahkan materi web Inggris ke Indonesia. |
| 49 | **Mesin Inti RAGET** | Response Language Lock | `raget/raget-agents/answer-composer.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Aturan penjamin jawaban akhir agar selalu terkunci secara konsisten dalam Bahasa Indonesia baku. |
| 50 | **Mesin Inti RAGET** | Hugging Face Checkpoint Provider | `raget/raget-neural/neural-provider.js` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Provider unduhan checkpoint biner .safetensors multi-tier (50M, 100M, 200M) via Hugging Face Hub (CORS). |
| 51 | **Repositori & CI/CD** | CI/CD GitHub Actions | `.github/workflows/lint.yml` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Workflow pemeriksaan otomatis berbasis Node 22 linter untuk validasi sintaks dan integritas kode. |
| 52 | **Repositori & CI/CD** | Unit Test Suite | `raget/raget-tools/unit/` | SUDAH SELESAI | \[✓\] SUDAH SELESAI | Suite pengujian unit node:test (menguji answer-lock, bm25, router-intent, dan syntax-validator) lulus 100%. |

  * 

| 53 | Seluruh Repositori (Pembersihan Global) | Pembersihan Total Komentar (Codebase Comment Purge) | Seluruh berkas di js/, shared/, raget/, vault/, api/, css/, index.html | PERBAIKAN | \[\!\] DITAHAN | Pembersihan massal komentar tidak dijalankan. Komentar di shader WGSL, kontrak mesin, dan catatan historis merusak kode jika dihapus. Berkas antarmuka baru tetap tanpa komentar. |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |

  * 

# **15\. BAB 15: PROTOKOL EKSEKUSI OTONOM (GROK BUILD RUNTIME DIRECTIVE & BACKGROUND MARATHON SPRINT)**

## **15.1 Latar Belakang & Filosofi Eksekusi Tanpa Friksi**

Bab ini merupakan mandat baku (Executive System Prompt & Operational Protocol) yang mengikat secara mutlak bagi agen pengembang otonom (khususnya Grok Build, Cursor Agent, Claude Code, maupun autonomous AI developer lainnya). Selama ini, produktivitas sering terhambat oleh laporan parsial setengah jalan, obrolan basa-basi yang tidak perlu, dan pertanyaan sepele yang memutus fokus kerja. Protokol ini mematenkan standar kerja maraton otonom: sekali mandat diberikan, AI bekerja mandiri di latar belakang hingga tuntas tanpa interupsi.

## **15.2 Master Directive / Template Perintah Siap Pakai (Salin Langsung ke Grok Build)**

Gunakan instruksi baku tingkat industri berikut saat memicu Grok Build:

```
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
   - [x] PEMBERSIHAN TOTAL: Form lama server-anda sudah diganti Hub. Router model terkunci ke template dan neural, dengan fallback 3 detik.
   - [!] PEMBERSIHAN KOMENTAR GLOBAL: Ditahan. Komentar di shader WGSL, kontrak mesin, dan catatan historis tidak dihapus. Berkas antarmuka baru tetap tanpa komentar.
   - [x] PEMBUATAN MODUL BARU: connector-hub.js, connector-state.js, endpoint OAuth/API, docx-local.js, zip-local.js, dan artifact-card.js sudah ada.
   - [x] PENYAMBUNGAN UI KE MESIN: Chip mode di attach-row, unduh pptx langsung, importir Koleksi, dan runner Pyodide di Studio sudah tersambung.
   - [✓] INTEGRITAS AKHIR: Jalankan kembali linter dan unit testing suite hingga 100% hijau/lulus tanpa warning.

6. Format Laporan Akhir Tunggal (Final Deliverable Only):
   Hanya berikan balasan teks SATU KALI SETELAH SELURUH PEKERJAAN SELESAI TUNTAS 100%, dengan format laporan padat:
   - Daftar Berkas Baru yang Dibuat.
   - Daftar Berkas yang Dimodifikasi/Dibersihkan.
   - Bukti Eksekusi Pengujian (Log output linter & unit tests).
   - Panduan Singkat Uji Coba Antarmuka Langsung (Live Testing Checklist).
```

## **15.3 Aturan Swakoreksi & Toleransi Kegagalan (Self-Healing Loop)**

Agen dilarang menyerah saat menemui kendala eksekusi. Jika pustaka browser (misalnya generator ZIP/Word) memicu konflik sintaks atau tipe data biner, agen diwajibkan:

32. Menganalisis pesan error secara lokal di terminal runtime.  
33. Melakukan fallback ke struktur OpenXML / ArrayBuffer murni standar peramban.  
34. Memastikan fungsi pembungkus (wrapper) memiliki penanganan error `try...catch` yang ramah pengguna.  
35. Melanjutkan ke tugas berikutnya tanpa menunda atau menghentikan alur maraton.

## **15.4 Kriteria Penutupan Mandat (Handover Gate)**

Sesi kerja maraton 90–180 menit dinyatakan tuntas dan berhak menyerahkan hasil hanya jika:

* Seluruh 52 item pada Bab 14 terverifikasi statusnya.  
* Tidak ada *broken links*, variabel tak terdefinisi (*undefined globals*), atau error konsol pada antarmuka utama (`index.html`).  
* Seluruh unit test lulus secara otomatis.  
* Seluruh berkas terverifikasi bebas dari komentar pengembang (Zero Comments in Production Code).

# 16–18. Salinan pekerjaan baru dari Google Drive

Sumber: dokumen Drive `PRD antarmuka` (`19hZU_nAuS0-ITciFeNFtAu_W8AqtPLs_kG_YHXwGwuw`), diubah 3 Oktober 2026 pukul 21:25 UTC. Bab 16 sampai 18 adalah pekerjaan baru di atas tracker lama.

| No | Tugas | Status |
| --- | --- | --- |
| 54 | Web Worker jejak pikiran dan kartu akordeon | SUDAH SELESAI |
| 55–56 | Lampiran sampai 5 berkas | SUDAH SELESAI |
| 57–58 | Instruksi proyek dan sesi terkait | SUDAH SELESAI |
| 59–60 | Cari di obrolan dengan sorotan kuning | SUDAH SELESAI |
| 61 | Grafik SVG batang, garis, lingkaran | SUDAH SELESAI |
| 62 | Pratinjau slide 16:9 | SUDAH SELESAI |
| 63 | Riwayat versi artefak | SUDAH SELESAI |
| 64–65 | Worker dan jembatan jejak, batas 45 detik | SUDAH SELESAI |
| 66 | Komposer tidak tertutup keyboard | SUDAH SELESAI |
| 67 | Tombol kembali tidak keluar dari aplikasi | SUDAH SELESAI |
| 68 | Token konektor dienkripsi AES-GCM | SUDAH SELESAI |
| 69 | Tombol uji sambungan | SUDAH SELESAI |
| 70 | Toast versi baru | SUDAH SELESAI |
| 71–72 | Ikon konektor dan tata letak kartu | SUDAH SELESAI |
| 73 | Studio menutup menu samping | SUDAH SELESAI |
| 53 | Pembersihan komentar massal | DITAHAN |

Baris 53 tetap ditahan pada shader. Komentar penjelasan di `js/`, `shared/`, `vault/`, `api/`, dan `css/` sudah disisir. Direktif `webpackIgnore` tidak dihapus.

# 19–22. Salinan pekerjaan baru Drive 3 Oktober 2026 21:58 UTC

Sumber: `19hZU_nAuS0-ITciFeNFtAu_W8AqtPLs_kG_YHXwGwuw`.

| No | Tugas | Status |
| --- | --- | --- |
| 74 | Satu kali percobaan ulang saat alat gagal | SUDAH SELESAI |
| 75 | Kartu klarifikasi | SUDAH SELESAI |
| 76–77 | Bilah perintah Ctrl/Cmd+K | SUDAH SELESAI |
| 78 | Laporan siap cetak | SUDAH SELESAI |
| 79–80 | Diagram SVG, perbesar, unduh | SUDAH SELESAI |
| 81 | Usap dua jari membuka perintah | SUDAH SELESAI |

# 23–25. Salinan pekerjaan Drive 3 Oktober 2026 22:38 UTC

Sumber: `19hZU_nAuS0-ITciFeNFtAu_W8AqtPLs_kG_YHXwGwuw`.

| No | Tugas | Status |
| --- | --- | --- |
| 82–83 | Obrolan baru dan menu titik tiga di bilah atas | SUDAH SELESAI |
| 84–85 | Studio gelap, tab JS/Python, konsol dengan waktu | SUDAH SELESAI |
| 86–87 | Avatar akun saat mulai, kartu profil sidebar | SUDAH SELESAI |
| 88 | Kelompok menu dan penanda halaman aktif | SUDAH SELESAI |
| 89 | Catatan koleksi, saringan, ekspor | SUDAH SELESAI |
| 90 | Kartu proyek dan template | SUDAH SELESAI |
| 91 | Galeri artefak | SUDAH SELESAI |
| 92 | Lembar lampiran dipisah unggah dan mode | SUDAH SELESAI |
| 99–101 | Gelembung sunting pada teks terpilih | SUDAH SELESAI |
| 102–104 | Riset empat cabang dan berkas laporan | SUDAH SELESAI |
| 105–108 | Kapsul memori lokal | SUDAH SELESAI |

# 26–27. Perbaikan dari tangkapan layar 4 Oktober 2026

Sumber Drive `19hZU_nAuS0-ITciFeNFtAu_W8AqtPLs_kG_YHXwGwuw`, diubah 3 Oktober 2026 pukul 23:29 UTC.

| No | Tugas | Status |
| --- | --- | --- |
| 106, 116 | Kapsul memori jadi layar penuh, tidak menempel di bawah halaman | SUDAH SELESAI |
| 107–109 | Studio: nomor baris gelap, tab pil, tombol jalankan nila, konsol rapi | SUDAH SELESAI |
| 110 | Template proyek berupa tombol terpisah | SUDAH SELESAI |
| 111 | Garis hijau konektor diganti lencana titik | SUDAH SELESAI |
| 112, 119 | Ikon perintah dihilangkan dari bilah atas ponsel | SUDAH SELESAI |
| 113 | Saringan koleksi geser menyamping, tombol catatan nila | SUDAH SELESAI |
| 114, 117 | Kartu akun menempel di dasar sidebar, kapsul masuk menu ruang kerja | SUDAH SELESAI |
| 118 | Komposer tidak lagi didorong dua kali saat papan ketik muncul | SUDAH SELESAI |
| 120 | Mikrofon kembali ketuk untuk mulai dan berhenti | SUDAH SELESAI |
| 121 | Tombol obrolan baru mengosongkan sesi dan fokus ke kotak tulis | SUDAH SELESAI |
| 122 | Saringan dan kartu artefak terpisah | SUDAH SELESAI |
| 97, 102–104 | Riset empat cabang, kartu kuis belajar, getar singkat | SUDAH SELESAI |

# 28–30. Antrean 4 Oktober 2026 01:23 UTC

Sumber Drive yang sama. Bab yang lebih baru menimpa bab sebelumnya: kapsul memori tidak lagi di sidebar.

| No | Tugas | Status |
| --- | --- | --- |
| 124, 125 | Kapsul pindah ke Pengaturan → Data. Sidebar tidak lagi menggulung dua lapis, riwayat dapat sisa tinggi layar | SUDAH SELESAI |
| 126 | Ganti tema tanpa jeda tirai 160 ms | SUDAH SELESAI |
| 127, 128 | Catatan koleksi lewat formulir, bukan dialog browser. Kartu punya waktu relatif, tiga baris, salin, kirim ke chat, hapus | SUDAH SELESAI |
| 129 | Kapsul: hitungan fakta, empat kelompok, formulir tambah | SUDAH SELESAI |
| 131 | Studio: Ctrl+Enter menjalankan kode, tombol jadikan artefak | SUDAH SELESAI |
| 132 | Pratinjau HTML/SVG artefak di halaman itu sendiri | SUDAH SELESAI |
| 136 | Aksi balasan jadi empat ikon: salin, baca, simpan, menu | SUDAH SELESAI |
| 137 | Tombol Chat Baru tidak lagi ditandai sebagai halaman aktif | SUDAH SELESAI |
| 138, 139 | Pintasan web, slide, dan berpikir keras di samping pemilih model | SUDAH SELESAI |
| 140 | Geser sidebar ikut kecepatan jari | SUDAH SELESAI |
| 141–144 | Studio banyak berkas, cowork, skill, dan penjadwal latar | BELUM. Ini fondasi besar, bukan tombol kosong |




