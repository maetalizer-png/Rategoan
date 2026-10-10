# PRD Antarmuka 17.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 17.0 — Universal Node 18/22 Parity, Physical IndexedDB HNSW Partitioning & Whisper WebGPU Voice Engine (Definitive Master)" (diubah 2026-10-10T00:52:16Z).
Baseline: `de7675ca5c2447d15a1425650d8caf41607ee10f` (bukti `dae091ff81db6fb4bc8cf2bdbe41d48774470fd6`, tag `16.0.0-PRODUCTION-GA`).

Sasis 16.0 tidak dibalik. Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Bobot Whisper, Kokoro, dan ONNX tidak diunduh. Bukan mesin HNSW produksi di IndexedDB. Cakupan baris tidak diukur.

| DOD | Hasil |
| --- | --- |
| 17.01 | Uji kanonik memakai `import { createRequire } from 'node:module'`, tanpa `process.getBuiltinModule`. Node 18 dicoba bila biner ada; jika tidak, yang dijalankan hanya Node 22 |
| 17.02 | Alur CI menjalankan `npm test` pada Node 18, 20, dan 22. Lint ESLint 10 tetap di Node 22 karena mesinnya tidak mendukung Node 18 |
| 17.03 | `npm run lint` harus 0/0. Jumlah berkas sintaks adalah yang terhitung, bukan angka 378 yang dikunci di naskah |
| 17.04 | `shardGraph` memotong simpul menjadi blok paling banyak 500 untuk toko `hnsw_nodes`. Ini deskriptor partisi, bukan profil DevTools |
| 17.05 | Pencarian graf berlapis pada 10.000 vektor Int8 diukur di bawah 5 ms. Pembangunan indeks tidak masuk jam itu |
| 17.06 | Recall@5 dan NDCG@5 pada vektor sintetis yang ditanam, bukan korpus IR eksternal |
| 17.07 | Label Whisper tetap tanpa bobot. Berkas ONNX 39 MB tidak dipasang |
| 17.08 | Nama cache `rategoan-voice-cache` disiapkan. Tidak ada byte model yang ditulis |
| 17.09 | `melBins` 80 saluran adalah energi log pada bingkai pendek, bukan AudioWorklet yang diukur di peramban |
| 17.10 | `bargeIn` adalah pembanding energi. Ambang 150 ms diuji pada fungsi itu, bukan pada mikrofon |
| 17.11 | Tanpa WebGPU, jalur suara jatuh ke `web-speech` |
| 17.12 | Kunci `navigator.locks` dan kanal `rategoan-vfs-sync` dari rilis sebelumnya tetap |
| 17.13 | Status `COMMITTED` dan `ROLLED_BACK` menunggu `remember` sebelum selesai |
| 17.14 | `gcWorktree` memangkas teks sampai di bawah anggaran. Bukan profil heap |
| 17.15 | Nonce konfirmasi menolak sesi kosong, mengikat bearer, dan HMAC ada di server saja |
| 17.16 | Ledger konfirmasi berbatas 1000. Lebih dari 30 permintaan per menit dari kunci yang sama ditolak |
| 17.17 | Pengambilan halaman mengunci IP hasil DNS lewat `lookup` soket. Pengalihan diperiksa ulang |
| 17.18 | Pengawas worker 2000 ms dan `Object.freeze(Object.prototype)` hanya di dalam worker |
| 17.19 | Pesan pratinjau menolak nonce yang tidak cocok bila nonce diharapkan. Asal `null` tetap |
| 17.20 | Badan permintaan 1 MB, respons hulu 2 MB |
| 17.21 | Skor retrieval di atas adalah fixture sintetis. Tidak diklaim pada korpus dunia nyata |
| 17.22 | Playwright tetap gerbang. Naskah CI menjalankan `studi-kasus-17.mjs` |
| 17.23 | Bukti di `docs/evidence/antarmuka-17.0/` pada komit bukti, bukan di komit kode |

Pengukuran hidup (Chromium saja), diikat pada komit `854e5e11bebacf9408ff452a787a0f4a815b3335`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 249, 246)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`. Backdrop model `rgba(0, 0, 0, 0)` dan blur `blur(12px)`. Lencana kartu model "Eksperimental". Sidebar `rgb(250, 249, 246)`.
- Popover Studio anak `#studio-app`, `position: fixed`, y=61, x=299. Tab kanvas celah 8px, `overflow-x: auto`, `min-width: 0`, latar segmen `rgb(241, 245, 249)`. Studio sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, lebar 390, tinggi 60, tombol kembali 36px radius `50%`. Penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio 263px dan tertutup oleh Escape. Navigasi celah 4px, tanpa kicker dan tanpa surel. Jejak izin di privasi, log terlipat. Peringatan konsol 0.
- Unit 132/132 pada Node v22.23.2 dan 132/132 pada Node v18.20.8. Lint lolos di Node 22: sintaks 383 berkas, eslint 0/0, skema 208 berkas / 3934 entri. ESLint 10 tidak dijalankan di Node 18. Playwright 21/21.
- SQ8 menandai vektor 9999 pada jarak 0. Sampel setelah pemanasan 0,415 / 0,390 / 0,473 / 0,438 / 0,389 ms. Ini juara blok Int8, bukan pemindaian kasar 10.000 vektor.
- Graf berlapis 10.000×16 Int8: pembangunan 3914,7 ms (di luar jam), pencarian 0,293 / 0,081 / 0,076 / 0,071 / 0,092 ms. Recall@5 = 1 dan NDCG@5 = 1 pada salinan sintetis, bukan korpus IR. Dua puluh pecahan toko `hnsw_nodes`, masing-masing paling banyak 500 simpul. Bukan HNSW produksi di IndexedDB.
- Segel SHA-256 objek komit kode: `f89a3576b7fe20a1ee152139524d504c24793b21562edacce98c3713cc96bfa9`. Bukan GPG.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Label Whisper/Kokoro tanpa bobot. Tidak ada ONNX, tidak ada model pihak ketiga, dan tidak ada klaim inferensi 1,5 miliar atau 2 miliar parameter.
- Cakupan baris tidak diukur. Empat belas ekspor mati dan penghematan 8,4 KB tidak diklaim.

- Mesin bawaan tetap template. Lencana "Eksperimental" ada pada kartu model.
- Akordeon riwayat memakai `rategoan_hist_open`, terbuka bila kunci belum ada.
- Empat belas ekspor mati dan penghematan 8,4 KB tidak dihapus dan tidak diklaim.
- Label Whisper/Kokoro tanpa bobot. Tidak ada model pihak ketiga.

## Arsip terkonsolidasi 16.0

# PRD Antarmuka 16.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 16.0 — Sovereign Production Mastery, Deterministic Popover Geometry & Node 18 Universal Isomorphism (Definitive Master)".
Baseline: `add244eff5f122d7c49346a5b461370d10a3bb66` (tag `15.0.0-PRODUCTION-GA`).

Sasis 15.0 tidak dibalik. Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Bobot Whisper, Kokoro, dan model pihak ketiga tidak dipasang. Bukan HNSW produksi di IndexedDB. Cakupan baris tidak diukur.

| DOD | Hasil |
| --- | --- |
| 16.01 | Impor statis `createRequire` dari `node:module`, lalu `createRequire(import.meta.url)('node:crypto')`. Peramban memakai peta impor ke stub sama-asal. Hash skrip peta ada di CSP |
| 16.02 | Lembar lampiran Studio anak langsung `#studio-app`. Jangkar desktop pada 1024px, `position: fixed` penting, z-index 9999. Di bawah 1024 gaya inline dibersihkan |
| 16.03 | Pemanasan kecil 10 kali jarak Int8 16 jalur saat modul dimuat, plus tiga lolos di dalam indeks. Bukan pemindaian 10.000 saat impor |
| 16.04 | Kanal `rategoan-vfs-sync` dan pembanding jam vektor. Kunci VFS yang ada tidak diubah |
| 16.05 | Halaman KV 16 token. Jejak Int8 terhadap float32 75% lebih kecil sebagai hitungan byte, bukan profil RAM peramban |
| 16.06 | Diff muat ulang inkremental, `fullReload` tetap false, iframe tidak dimuat ulang |
| 16.07 | URL blob yang tidak disentuh lebih dari 5 menit dicabut. Jam diuji suntik |
| 16.08 | Kunci AES-GCM ruang kerja tetap PBKDF2, tidak terekstrak. Tidak diklaim bahwa seluruh muatan lokal terenkripsi |
| 16.09 | Gerbang mutu adalah rangkaian unit. Cakupan 95% tidak dipalsukan |
| 16.10 | Uji tetap satu berkas `antarmuka.test.mjs`. Bukti di `docs/evidence/antarmuka-16.0/` |
| 16.11 | Kicker "Utama" dan "Ruang kerja" hilang. Navigasi enam butir celah 4px. Footer tanpa nama dan surel |
| 16.12 | Jejak izin pindah ke kategori privasi, label "Log Jejak Izin", perisai, log tetap terlipat |
| 16.13 | Nonce konfirmasi acak, 60 detik, sekali pakai, terikat nama alat dan muatan. Rahasia klien dihapus |
| 16.14 | `ipIsPrivate` menutup IPv4 terselubung. Pengambilan halaman memeriksa DNS dan setiap pengalihan |
| 16.15 | Batu nisan nonce menjadi cincin berbatas 1000, sapuan TTL tetap |
| SEC-04 | Alur CI memakai `npm ci`, lalu `npm test` dan `npm run lint`, Node 22 |

Pengukuran hidup (Chromium saja), diikat pada komit `de7675ca5c2447d15a1425650d8caf41607ee10f`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 249, 246)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`. Backdrop model `rgba(0, 0, 0, 0)`. Sidebar `rgb(250, 249, 246)`. Komposer blur `blur(12px)`.
- Popover Studio anak `#studio-app`, `position: fixed`, y=61, x=299, tidak menempel pojok kanan bawah. Tab kanvas celah 8px, `overflow-x: auto`, `min-width: 0`, latar segmen `rgb(241, 245, 249)`. Studio sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, lebar 390, tinggi 60, tombol kembali 36px radius `50%`. Penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio 263px dan tertutup oleh Escape. Navigasi celah 4px, tanpa kicker dan tanpa surel. Jejak izin di privasi, log terlipat. Peringatan konsol 0.
- Unit 131/131. Lint lolos: sintaks 377 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 21/21.
- SQ8 menandai vektor 9999 pada jarak 0. Sampel setelah pemanasan 0,252 / 0,242 / 0,216 / 0,233 / 0,212 ms. Ini juara blok Int8, bukan pemindaian kasar 10.000 vektor dan bukan HNSW produksi di IndexedDB.
- Runtime uji adalah Node v22.23.2. Node 18 tidak dijalankan, jadi angka lulus Node 18 tidak diklaim. Cakupan baris tidak diukur.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Nonce konfirmasi sekali pakai, 60 detik, tanpa rahasia HMAC di klien. Pengalihan halaman diperiksa ulang. Batu nisan nonce berbatas 1000.
- Label Whisper/Kokoro tanpa bobot. Tidak ada model pihak ketiga dan tidak ada klaim inferensi 1,5 miliar atau 2 miliar parameter.
- Ekspor yang tidak terpakai tidak dihapus massal. Angka 14 ekspor mati dan penghematan 8,4 KB tidak diklaim.
- Segel SHA-256 objek komit `3fac60632c7660b49fd2e9ea436072e18413f76d51b7fb34e80144218cc6eefd`. Bukan GPG.

## Arsip terkonsolidasi 15.0

# PRD Antarmuka 15.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 15.0 — Sovereign Neo-Workstation, Unified Test Suite, Zero-Deadcode & Ergonomic Desktop Harmony" (diubah 2026-10-09T16:48:15Z).
Baseline: `c4ace6568e26c738c8aae33f3fcf494df6c1f814` (tag `14.0.0-PRODUCTION-GA`).

Sasis 14.0 tidak dibalik. Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Bobot Whisper, Kokoro, dan model pihak ketiga tidak dipasang. Bukan HNSW produksi di IndexedDB.

| DOD | Hasil |
| --- | --- |
| 15.01 | `createRequire(import.meta.url)('node:crypto')` lewat `getBuiltinModule('node:module')`, tanpa impor statis `node:module`. `subtle` memetakan ke `webcrypto.subtle` |
| 15.02 | Satu berkas `raget/raget-tools/unit/antarmuka.test.mjs`. Berkas `antarmuka-5` sampai `antarmuka-14` dihapus |
| 15.03 | Sisa nama lama yang jelas dihapus. Ekspor yang masih terpakai tidak dipangkas massal |
| 15.04 | Cache `rategoan-model-` + `cache` dan `rategoan-neural-` + `cache`. Data `code-pack.jsonl`. Skrip `verify-build-pipeline.mjs`. Pengenal ronde bernomor diseragamkan |
| 15.05 | Kuantisasi afin SQ8, jarak Int8 16 jalur, satu pemanasan di dalam pembangunan indeks. Kueri terukur pertama di bawah 2 ms |
| 15.06 | Komposer kaca `rgba(255,255,255,0.85)` dengan blur 12px. Textarea tetap `overflow-y: auto` |
| 15.07 | Tab kanvas berbentuk kontrol segmen. Angka baris diff bernuansa pastel |
| 15.08 | Bayangan `0 6px 16px -4px rgba(0,0,0,0.06)`. Backdrop desktop tetap transparan. Escape menutup lembar |
| 15.09 | Playwright Chromium 18/18, tanpa peringatan `allow-same-origin` |
| 15.10 | PRD 11 sampai 14 terkonsolidasi di berkas ini. Riwayat tetap mencatat 11.0 sampai 15.0 |

Perbaikan keamanan yang ikut:

- Pratinjau tidak lagi mempercayai host atau nonce dari query string. Nonce datang dari pesan induk, asal tidak kosong, dan `event.source` adalah `window.parent`.
- Nonce yang terlempar dari ledger 1000 masuk batu nisan sampai TTL 300000 ms.
- Kunci ruang memakai hash SHA-256 utuh, garam disimpan di toko `rategoan_vault_keys`.
- Header konfirmasi tingkat 3 diverifikasi HMAC atas nama alat, hash muatan, dan kedaluwarsa.
- Jurnal menulis memori secara sinkron. `putRow` ditunggu bila IndexedDB ada, sebelum mutasi VFS.
- Plugin hanya lolos jika kunci publiknya ada di trust store sesi. `signPlugin` mendaftarkan kunci yang baru dibuatnya.
- `spec.special` menerima `screened.kept`, bukan parameter mentah.

Pengukuran hidup (Chromium saja), diikat pada komit `add244eff5f122d7c49346a5b461370d10a3bb66`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 249, 246)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`. Backdrop model `rgba(0, 0, 0, 0)`. Sidebar `rgb(250, 249, 246)`. Komposer blur `blur(12px)`.
- Tab kanvas celah 8px, `overflow-x: auto`, `min-width: 0`, latar segmen `rgb(241, 245, 249)`. Studio sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, lebar 390, tinggi 60, tombol kembali 36px radius `50%`. Gulir tetap di header. Penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio 263px dan tertutup oleh Escape. Peringatan konsol 0.
- Unit 131/131. Lint lolos: sintaks 371 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 18/18.
- SQ8 menandai vektor 9999 pada jarak 0. Sampel setelah pemanasan 0,234 / 0,232 / 0,288 / 0,233 / 0,231 ms. Ini juara blok Int8, bukan pemindaian kasar 10.000 vektor dan bukan HNSW produksi di IndexedDB.
- Runtime uji adalah Node v22.23.2. Node 18.20.4 tidak dijalankan: `process.getBuiltinModule` tidak ada di Node 18, jadi angka 123/125 dan 1,329 ms dari naskah PRD tidak diklaim.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal menunggu `putRow` bila IndexedDB ada. Uji node memakai peta memori. `navigator.locks` dipakai di peramban.
- Label Whisper/Kokoro tanpa bobot. Tidak ada model pihak ketiga dan tidak ada klaim inferensi 1,5 miliar atau 2 miliar parameter.
- Ekspor yang tidak terpakai tidak dihapus massal. Yang dihapus hanya nama dan berkas sisa yang memang diganti.
- Segel SHA-256 objek komit `43e55d7258d3cfa54ffc396e25cd1d3bc2e14d38f5d275baa04b53b8cbefb551`. Bukan GPG.

## Arsip terkonsolidasi 11.0 sampai 14.0

# PRD Antarmuka 11.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 11.0".
Baseline: `9b014e020f51725ed9c4aba95d5c5a3911fdaaae` (tag `10.0.0-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting.

Popover lampiran chat dan studio memakai `shared/popover.js` yang sama. Sasis menu menjadi 960px. Ikon pindah ke `assets/icons/`. Sebelas dokumen usang dihapus dan diganti `docs/HISTORY-ANTARMUKA.md`. Fakta ibu kota Indonesia dikunci ke Jakarta, populasi ~282 juta jiwa. Sapaan bantuan tidak lagi menjawab "Maaf sebelumnya", dan sapaan waktu tidak menyindir jam perangkat.

| DOD | Hasil |
| --- | --- |
| 11.01–11.02 | Popover ter-clamp, lantai atas 20px, satu helper |
| 11.03 | Sasis `.settings-page` 960px, padding 40px 48px 64px |
| 11.04 | Kartu artefak bertingkat, pratinjau 110px, Pratinjau dan Unduh |
| 11.05 | Escape dan klik luar menutup, backdrop transparan |
| 11.06 | Ikon di `assets/icons/`, tautan HTML, manifes, dan service worker ikut |
| 11.07 | 11 berkas usang hilang, `HISTORY-ANTARMUKA.md` terbit |
| 11.08 | Iframe tetap `allow-scripts allow-forms` |
| 11.09 | `deriveVaultKey` tetap AES-GCM tidak terekstrak |
| 11.10 | Alat tak dikenal tingkat 5, gagal tertutup |
| 11.11 | Frasa pindah IKN hilang, populasi 282 juta |
| 11.12 | Bantuan ramah, tanpa sindiran jam perangkat |
| 11.13 | `external/` dan tiga jsonl usang hilang, korpus tunggal diperbarui |
| 11.14 | 21 entri sejarah di `sejarah.js` |
| 11.15 | Laporan neural diringkas, log tematik satu berkas |
| 11.16 | Unit 87/87, lint 0/0, Playwright 16/16 |
| 11.17 | Bukti di `docs/evidence/antarmuka-11.0/`, segel SHA-256 objek komit, tanpa GPG |

Pengukuran hidup (Chromium saja), diikat pada komit `c79b12a78e9cb060691348ac504a407070f068db`:

- Studio kosong: popover `top` 61px, 7 opsi seluruhnya di dalam viewport, animasi 0.15s. Celah 10px tidak dipakai di sini karena komposer masih di tengah.
- Chat kosong: `top` 125px, 10 opsi utuh, backdrop `rgba(0, 0, 0, 0)`.
- Chat aktif: celah 10px di atas tombol tambah, `sheet.top` 176px, batas bawah topbar 60px.
- Sasis artefak: `max-width` 960px, padding `40px 48px 64px`.
- Galeri: aturan `minmax(280px, 1fr)`; lebar terhitung `422px 422px`; pratinjau 110px; tombol Pratinjau dan Unduh.
- Hub konektor: 2 kolom pada 1366px. Lembar studio ponsel: tinggi 263px.
- Unit 87/87. Lint 0/0 (sintaks 332 berkas, skema 208 berkas / 3934 entri).
- Devlog tematik 63 baris. Laporan ringkas 2090 byte, tanpa frasa round 8.

# PRD Antarmuka 12.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 12.0 — Living Canvas, Browser Flash-Decoding & Autonomous Coding Agent" (diubah 2026-10-09T03:00:39Z).
Baseline: `191bb4ef1c49e48abe44179102eaf6ce1e429eb5` (tag `11.0.0-PRODUCTION-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Flash-decoding, BitNet, penjadwal prefill, dan deteksi subgroup hidup di berkas baru di samping runner.

| DOD | Hasil |
| --- | --- |
| 12.01 | `assert` mengembalikan argumen tersaring; kunci terlarang ditolak |
| 12.02 | `getWorkspaceAesKey` AES-GCM 256-bit, tidak terekstrak, alias per workspace |
| 12.03 | Jurnal memori PREPARE, lalu COMMITTED atau ROLLED_BACK; pemulihan setelah PREPARE |
| 12.04 | `stageHunks` menerima atau menolak tiap hunk sebelum tambalan diterapkan |
| 12.05 | Replika dokumen di `canvas-editor.js` menyisipkan tanpa menimpa suntingan lawan |
| 12.06 | `describePick` mengirim tag, kelas, dan pemilih ke konteks agen |
| 12.07 | Softmax daring, deviasi di bawah 1.25e-8, tanpa matriks perhatian penuh |
| 12.08 | Langkah sintetis kecil di atas 30 token/detik; bukan model 1,5 miliar parameter |
| 12.09 | BM25 ditambah kosinus; 180 dokumen di bawah 15 milidetik |
| 12.10 | Jabat tangan MCP hanya untuk localhost atau 127.0.0.1 |
| 12.11 | Segel proyek AES-GCM, kunci tidak terekstrak |
| 12.12 | Unit minimal 100, lint 0 galat dan 0 peringatan, Playwright 16/16 |

Pengukuran hidup (Chromium saja), diikat pada komit `47d61acda068e9eedebbc4cf0bab03484ef3d8d8`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px, bukan track 60px. Header `static`, latar transparan. Sasis 960px, padding `40px 48px 64px`.
- Ponsel 390×844: header y=0, kiri 0, lebar 390, tinggi 60, judul 17px berat 650, blur 14px, garis `1px solid`. Tombol kembali 36px, radius `50%`. Saat digulir, titik (20, 8) mengenai HEADER.
- Pengaturan, artefak, koleksi, dan proyek: header y=0, tinggi 60.
- Studio: sandbox `allow-scripts allow-forms`, tanpa Edit Manual atau Terapkan Kode, tab dokumen dan sheet ada. Lembar ponsel tinggi 263px. Peringatan konsol 0.
- Unit 104/104. Lint lolos: sintaks 363 berkas, eslint 0/0, skema 208 berkas / 3934 entri.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal VFS adalah peta memori berstatus PREPARE, COMMITTED, atau ROLLED_BACK. IndexedDB tidak ada pada uji node.
- Throughput spekulatif dan anggaran suara 300ms diukur pada fungsi lokal kecil, bukan bobot Whisper atau model 1,5 miliar parameter.

# PRD Antarmuka 13.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 13.0 — Production Industrialization, Real Neural Weights & Resilient Autonomous Ecosystem" (diubah 2026-10-09T07:04:37Z).
Baseline: `caaf0cf7097af351bcef258897be126953b0279a` (tag `12.0.0-PRODUCTION-GA`).

Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Flash-decoding, pengikat layer, pengawas pipeline, dan penjaga galat kuantisasi berada di berkas baru di samping runner.

| DOD | Hasil |
| --- | --- |
| 13.01 | Tab kanvas `overflow-x: auto` dan `min-width: 0`; pill disembunyikan di bawah 700px |
| 13.02 | Backdrop sheet desktop transparan, z-index 70, kartu model tidak meredupkan sepihak |
| 13.03 | Nilai penyimpanan tanpa prefiks "Penyimpanan:", rata kanan |
| 13.04 | `qc-visual.test.mjs` memeriksa tab, z-index, label, dan token |
| 13.05 | `window.Rategoan` menampung ai, llm, agent, stream, vfs, mesin; `window.RG` adalah alias yang sama |
| 13.06 | Modul kripto memakai `globalThis.crypto` atau `getWebCrypto()`, bukan pengenal `crypto` telanjang |
| 13.07 | Jurnal `vfs_tx_journal` lewat IndexedDB bila ada; uji node memakai penyimpanan bernama sama |
| 13.08 | Kanvas berkas punya tombol Terima dan Tolak; `stageHunks` menghormati keputusan |
| 13.09 | Parser header Safetensors dan unduhan rentang 20MB dengan SHA-256, bukan unduhan model 2B |
| 13.10 | Atensi maju memakai softmax daring di berkas samping; inti runner tidak diubah |
| 13.11 | Graf berlapis 384 dimensi, pencarian pada 10.000 vektor di bawah 12 ms |
| 13.12 | Label Whisper/Kokoro pada jalur kendali, tanpa bobot; anggaran 300 ms |
| 13.13 | Unit minimal 120, lint 0/0, Playwright 18/18 |

Pengukuran hidup (Chromium saja), diikat pada komit `c41b1b61b515ca375b886cc9b2df7cb3fc4d2f64`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`.
- Kartu model: backdrop `rgba(0, 0, 0, 0)`, sidebar tetap `rgb(250, 250, 248)`.
- Tab kanvas: celah 8px terhadap kontrol kanan, `overflow-x: auto`, `min-width: 0`. Sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, kiri 0, lebar 390, tinggi 60. Tombol kembali 36px, radius `50%`. Saat digulir, header tetap y=0. Nilai penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio tinggi 263px. Peringatan konsol 0.
- Unit 120/120. Lint lolos: sintaks 372 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 18/18.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal `vfs_tx_journal` memakai IndexedDB `rategoan_durable` bila ada. Uji node memakai peta memori dengan nama toko yang sama, bukan basis data peramban.
- Graf vektor berlapis 384 dimensi: juara tiap blok 64, probe 16 dimensi, lalu jarak penuh pada empat rantai. Vektor tanam 9999 ketemu, jarak 0, di bawah 12 ms. Bukan HNSW acak produksi di IndexedDB.
- Label suara Whisper/Kokoro tanpa bobot. Anggaran 300 ms dan langkah spekulatif di atas 30 token/detik diukur pada fungsi lokal, bukan model 2 miliar parameter.

# PRD Antarmuka 14.0 — catatan eksekusi

Sumber resmi: dokumen Drive "PRD Antarmuka 14.0 — Sovereign Zero-Sim Production, Real Neural Weights & Hardened Client Vector DB" (diubah 2026-10-09T09:16:28Z).
Baseline: `763de160b07cb07a8f69ea0320d91d412ffc989e` (tag `13.0.0-PRODUCTION-GA`).

Sasis 13.0 tidak dibalik. Modul inti `llm-attention.js`, `webgpu-runner.js`, dan `llm-quantization.js` tidak disunting. Bobot Whisper, Kokoro, dan model pihak ketiga tidak dipasang.

| DOD | Hasil |
| --- | --- |
| 14.01 | `getSecureRandomBytesSync` memakai WebCrypto atau `node:crypto`, tanpa pengenal `crypto` telanjang |
| 14.02 | Vektor Int8/SQ8, k-NN 10.000×384 lewat juara blok, di bawah 9 ms |
| 14.03 | Kunci level 5 memakai jam monoton dan offset uji, kedaluwarsa setelah 120 detik |
| 14.04 | Mutasi VFS lewat `navigator.locks`, atau antrean bila API tidak ada |
| 14.05 | Parser header dinamis, cache `rategoan-neural-` + `cache`, buffer 26.87 MiB, tanpa klaim model 1,5 miliar |
| 14.06 | Partisi `hnsw_nodes` maksimal 500 simpul, plus fusi peringkat resiprokal |
| 14.07 | Label suara tanpa bobot, langkah kendali di bawah 300 ms |
| 14.08 | Terima/Tolak per hunk, nonce LRU 1.000 dengan TTL 300 detik, token asal null |
| 14.09 | `window.Rategoan` tetap satu-satunya namespace |
| 14.10 | Unit minimal 130, lint 0/0, Playwright 18/18 |

Pengukuran hidup (Chromium saja), diikat pada komit `63c40bdd5e944beb55234d8724709d9b53db376c`:

- Desktop 1366×768, `#/connect`, tema terang `rgb(250, 250, 248)`. Judul di y=40. `grid-template-rows` 768px. Sasis 960px, padding `40px 48px 64px`. Backdrop model `rgba(0, 0, 0, 0)`. Sidebar `rgb(250, 250, 248)`.
- Tab kanvas celah 8px, `overflow-x: auto`, `min-width: 0`. Studio sandbox `allow-scripts allow-forms`.
- Ponsel 390×844: header y=0, lebar 390, tinggi 60, tombol kembali 36px radius `50%`. Gulir tetap di header. Penyimpanan `0.0 MB / 50 MB`, tidak menimpa label. Lembar studio 263px. Peringatan konsol 0.
- Unit 130/130. Lint lolos: sintaks 377 berkas, eslint 0/0, skema 208 berkas / 3934 entri. Playwright 18/18.
- SQ8 menandai vektor 9999 pada jarak 0. Sampel pencarian 3,643 ms lalu 0,305 / 0,289 / 0,274 / 0,251 ms. Ini juara blok Int8, bukan pemindaian kasar 10.000 vektor dan bukan HNSW produksi di IndexedDB.
- Devlog tematik 63 baris. Laporan ringkas 2090 byte. Korpus sendiri 5330 baris.
- Jurnal memakai IndexedDB bila ada, dan `navigator.locks` di peramban. Uji node memakai antrean memori bernama sama.
- Label Whisper/Kokoro tanpa bobot. Soket Safetensors siap untuk `Maetalizer19/rategoan-neural`. Tidak ada model pihak ketiga dan tidak ada klaim inferensi 1,5 miliar parameter.
