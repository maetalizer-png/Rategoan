# Audit Forensik Rategoan — 10 Oktober 2026

## Ringkasan eksekutif

Audit ini memakai sumber kode terbaru yang ditemukan pada commit `ce76d4c20836c3c601d17c191553cb8698eb76b7` (PRD Antarmuka 17.0). Pemeriksaan menggabungkan pembacaan kode, pemeriksaan log CI GitHub Actions, dan uji browser Playwright di runner GitHub. Ini bukan klaim bahwa seluruh sistem sudah aman; pengujian eksploitasi produksi yang berisiko, audit hardware fisik, dan pengukuran pada beragam perangkat belum dilakukan.

**Hasil paling konkret:** CI pada commit awal gagal sebelum browser test dimulai karena `studi-kasus-17.mjs` mencoba membuat direktori absolut `/workspace/screenshots`, yang tidak dapat ditulis oleh runner. Log menyatakan `EACCES: permission denied, mkdir '/workspace/screenshots'`. Setelah path output dibuat relatif terhadap workspace, Playwright berhasil menyelesaikan **21/21 pemeriksaan** pada runner GitHub (run [38015659926](https://github.com/maetalizer-png/Rategoan/actions/runs/38015659926)). Run tersebut memeriksa tampilan desktop 1366×768, alur Studio, ponsel 390×844, jejak izin, dan error konsol. Itu adalah pengujian browser sungguhan di CI, tetapi bukan pengujian terhadap deployment produksi Vercel.

## Cakupan dan metode

- Baseline kode: [commit ce76d4c](https://github.com/maetalizer-png/Rategoan/commit/ce76d4c20836c3c601d17c191553cb8698eb76b7).
- Bukti CI awal: [run 38012354429](https://github.com/maetalizer-png/Rategoan/actions/runs/38012354429).
- Sumber utama: `api/_http.js`, `api/confirm-challenge.js`, `api/_dispatch.js`, `api/connectors/web/search.js`, `api/connectors/github.js`, `api/connectors/drive.js`, `api/connectors/calendar.js`, `api/_oauth.js`, `api/auth/google.js`, `api/auth/github.js`, `vault/code/js-sandbox.js`, `raget/raget-neural/neural-provider.js`, dan `.github/workflows/lint.yml`.
- Pendekatan: analisis kode, verifikasi log CI, serta regresi terkontrol untuk guard SSRF dan pembatasan ukuran body. Tidak ada payload yang diarahkan ke sistem pihak ketiga.

## Temuan terkonfirmasi

### F-01 — CI Playwright gagal karena path screenshot tidak portabel
**Status:** terkonfirmasi, perbaikan diajukan pada branch audit.

Skrip `raget/raget-tools/studi-kasus-17.mjs` menggunakan path absolut `/workspace/screenshots`. Runner GitHub Actions bekerja di `/home/runner/work/...` dan tidak memiliki izin membuat `/workspace`, sehingga job Playwright berhenti sebelum satu pun pemeriksaan UI berjalan.

**Dampak:** commit dapat gagal pada gerbang CI meskipun aplikasi dan unit test sehat; laporan UI dari commit tersebut tidak tersedia.

**Perbaikan yang diajukan:** simpan screenshot ke `artifacts/screenshots` di workspace (dengan opsi `STUDI_OUTPUT_DIR`) dan unggah hasil sebagai artifact CI. Validasi awal pada commit perbaikan path menunjukkan Playwright 21/21 lulus. Jalankan ulang seluruh gerbang pada commit akhir sebelum merge.

### F-02 — Pemeriksaan IP SSRF tidak mengenali semua bentuk IPv4-mapped IPv6
**Severity:** tinggi sebagai bypass kebijakan SSRF; akses ke layanan internal belum diklaim berhasil.

Versi awal `ipIsPrivate()` mengenali format `::ffff:127.0.0.1`, tetapi memeriksa suffix sebagai teks IPv4 biasa. Representasi heksadesimal yang setara seperti `::ffff:7f00:1` (127.0.0.1) dan `::ffff:0a00:1` (10.0.0.1) tidak terdeteksi oleh pemeriksaan string tersebut. `pinPublicHttp()` bergantung pada hasil pemeriksaan ini untuk menerima atau menolak alamat literal.

**Dampak potensial:** lapisan validasi URL dapat menerima target IPv6 yang merepresentasikan alamat IPv4 nonpublik. Ini adalah kelemahan validasi SSRF; keberhasilan koneksi ke layanan internal masih memerlukan pengujian integrasi terisolasi dan tidak dinyatakan sebagai eksploitasi yang berhasil.

**Perbaikan yang diajukan:** parsing grup IPv6, konversi IPv4-mapped ke IPv4 sebelum klasifikasi, dan penolakan rentang nonpublik/reserved yang relevan. Regression test menambahkan kedua format heksadesimal serta memastikan URL loopback mapped ditolak.

### F-03 — Limit 1 MiB dilewati oleh body JSON yang sudah diparse framework
**Severity:** sedang.

Pada versi awal, `readBody()` langsung mengembalikan `req.body` bila sudah berupa object, tanpa mengukur ukuran serialisasinya. Pada runtime yang mengisi `req.body` sebelum handler berjalan, cabang ini melewati `BODY_LIMIT = 1048576` yang diterapkan pada string atau stream mentah.

**Dampak:** batas ukuran aplikasi tidak konsisten; payload object besar bisa masuk ke validasi berikutnya dan meningkatkan penggunaan memori/CPU. Batas platform masih dapat berlaku, tetapi itu bukan pengganti kontrol ukuran di aplikasi.

**Perbaikan yang diajukan:** serialisasi body object, penolakan bila ukurannya melebihi `BODY_LIMIT`, serta pengujian regresi yang mengharapkan HTTP-style error `413` dari helper untuk body object berukuran lebih dari 1 MiB.

### F-04 — Benchmark performa unit test terlalu sensitif terhadap noise runner
**Severity:** sedang untuk keandalan CI.

Tes bernama “pencarian SQ8 10000x384 di bawah 9ms” justru memiliki assertion `ms < 2`. Pada satu run Node 18, hasil yang tercatat adalah 2.0798 ms sehingga tes gagal, sementara Node 20/22 pada run yang sama lulus. Ini adalah kegagalan benchmark yang rapuh, bukan bukti algoritma salah.

**Perbaikan yang diajukan:** lakukan warm-up, ukur lima sampel, gunakan median, dan selaraskan ambang dengan nama tes (9 ms). Tetap pantau hasil pada Node 18/20/22; jangan menganggap perubahan ini sebagai bukti performa produksi pada semua perangkat.

## Risiko tersisa yang perlu ditangani

### F-05 — Rate limiter konfirmasi dapat dipengaruhi header IP dan menyimpan key tanpa batas waktu
**Severity:** sedang; mitigasi perlu verifikasi pada platform deployment.

`clientKey()` memilih nilai pertama dari `x-forwarded-for` atau `x-real-ip`, sementara `allowConfirmRate()` menyimpan key dalam `Map` yang tidak memiliki sweep global atau batas jumlah entri. Jika nilai tersebut dapat dikendalikan pemanggil melalui konfigurasi proxy, penyerang dapat mengganti key untuk menghindari batas per-key dan menumbuhkan Map. Validitas header yang diterima harus dibuktikan pada platform produksi; jangan langsung mengasumsikan header dapat dipalsukan tanpa menguji perilaku proxy.

**Rekomendasi:** gunakan alamat klien dari header yang dijamin ditimpa oleh proxy tepercaya; tambahkan batas entri dan penghapusan key kedaluwarsa; untuk deployment multi-instance gunakan rate limiter bersama (misalnya KV/Redis) agar limit tidak hanya berlaku per instance.

### F-06 — Batas respons upstream diperiksa setelah respons dibuffer penuh pada jalur konektor umum
**Severity:** sedang.

Di `forward()`, `await upstream.text()` terjadi sebelum ukuran hasil dibandingkan dengan `UPSTREAM_LIMIT`. Karena itu, limit 2 MiB baru menolak respons setelah seluruh respons dibaca ke memori. Jalur web-fetch yang menggunakan `fetchPinned()` sudah mengukur chunk selama streaming; jalur konektor umum belum menerapkan pola yang sama.

**Rekomendasi:** cek `Content-Length` bila tersedia, tetap hitung byte aktual, baca body secara streaming dan hentikan respons segera saat melewati limit. Terapkan timeout dan batas concurrency per konektor.

### F-07 — Sandbox JavaScript adalah isolasi berbasis Worker, bukan batas keamanan penuh
**Severity:** sedang.

`vault/code/js-sandbox.js` menjalankan kode dengan `new Function` di Blob Worker, memblokir beberapa API jaringan, dan menghentikan Worker setelah 2000 ms. Ini mengurangi dampak kode yang berjalan lama, tetapi bukan bukti isolasi kuat terhadap konsumsi memori, ledakan output/log, atau seluruh primitive browser yang mungkin tersedia di runtime.

**Rekomendasi:** batasi panjang input, jumlah/ukuran log dan output, jumlah Worker bersamaan, serta memori melalui desain runtime yang sesuai; gunakan origin khusus dan CSP ketat untuk preview; uji kode tak berakhir, alokasi besar, prototype pollution, akses lintas-origin, dan pesan `postMessage` yang dipalsukan. Jangan mengandalkan timeout sebagai satu-satunya kontrol.

### F-08 — Scope OAuth luas; prinsip least privilege perlu ditinjau
**Severity:** sedang, bergantung pada kebutuhan fitur.

Integrasi GitHub meminta scope `repo read:user`; Google meminta scope penuh Drive, `gmail.modify`, atau Calendar. Scope tersebut bisa masuk akal untuk fitur yang memang melakukan perubahan, tetapi dampak kebocoran token besar.

**Rekomendasi:** pisahkan scope baca dan tulis bila provider mendukung, minta izin saat fitur diaktifkan, tampilkan kemampuan yang diminta, sediakan pencabutan koneksi, dan pastikan token tidak masuk log, URL, telemetry, atau backup tanpa perlindungan.

### F-09 — Kualitas model neural belum setara dengan status “siap” produk
**Severity:** tinggi untuk kualitas produk, bukan kerentanan keamanan.

Dokumen arsitektur proyek secara eksplisit menyatakan generasi neural masih belum koheren secara gramatikal dan memberi contoh keluaran yang tidak bermakna. Status berhasil memuat checkpoint tidak sama dengan kualitas jawaban yang siap digunakan.

**Rekomendasi:** jadikan evaluasi held-out Bahasa Indonesia sebagai gerbang sebelum model disebut siap; ukur factuality, relevansi, repetisi, kepatuhan instruksi, latency, penggunaan RAM, dan tingkat fallback. Tampilkan status eksperimental dengan jelas dan pertahankan template/retrieval sebagai jalur aman.

### F-10 — Ketahanan supply-chain dan pengujian keamanan belum cukup dibuktikan
**Severity:** sedang sebagai gap pertahanan berlapis.

Workflow yang terlihat menjalankan unit test, lint, dan Playwright, tetapi pemeriksaan ini tidak menggantikan dependency audit, secret scanning, analisis statis keamanan, atau pinning action pihak ketiga ke SHA immutable. Workflow menggunakan tag action seperti `actions/checkout@v4` dan `actions/setup-node@v4`.

**Rekomendasi:** tambahkan Dependabot/dependency review, secret scanning, CodeQL atau SAST sejenis, SBOM, pemindaian lisensi, dan pin action eksternal ke commit SHA yang ditinjau. Jangan menganggap CORS sebagai autentikasi; semua operasi sensitif harus memverifikasi token, otorisasi, dan konfirmasi pada server.

## Bukti pengujian yang tersedia

- Baseline commit `ce76d4c`: unit test lulus pada Node 18/20/22 dan lint lulus, tetapi Playwright gagal saat membuat direktori screenshot karena `EACCES`. [Log run](https://github.com/maetalizer-png/Rategoan/actions/runs/38012354429).
- Commit perbaikan path `d0446097`: GitHub Actions melaporkan job Playwright sukses dan log berisi **LULUS 21/21**; unit test dan lint juga sukses pada run itu. [Run CI](https://github.com/maetalizer-png/Rategoan/actions/runs/38015659926).
- Commit final kode yang saat ini diaudit: `5a7bfd0a2e98cab875456b953bfb54d73d30afa9`. Run GitHub Actions [38015930144](https://github.com/maetalizer-png/Rategoan/actions/runs/38015930144) berstatus **success** untuk kelima job: unit test Node 18/20/22, lint, dan Playwright. Log menunjukkan **LULUS 21/21**, konsol bersih (0 peringatan), dan artifact `playwright-screenshots` berhasil diunggah (ID `11656131578`).
- Uji Playwright saat ini menjalankan server statis lokal pada runner. Belum ada klaim pengujian browser terhadap domain deployment produksi, audit penetrasi eksternal, atau uji hardware fisik.

## Urutan remediasi

1. **P0 / sebelum rilis:** pastikan seluruh job CI hijau pada commit yang sama; pastikan SSRF regression tests dan request body limit tests lulus pada Node 18/20/22.
2. **P1:** streaming cap untuk semua respons upstream; rate limiting yang tahan spoofing dan multi-instance; batas output/memori sandbox; uji integrasi SSRF terisolasi.
3. **P1 kualitas AI:** benchmark Bahasa Indonesia yang independen, gerbang kualitas model, dan fallback yang jelas.
4. **P2:** least-privilege OAuth, pinning supply-chain, SAST/secret scanning, SBOM, dan bukti pengujian perangkat nyata.
5. **P2 data:** lanjutkan pemeriksaan provenance, lisensi, deduplikasi, distribusi bahasa, dan kontaminasi train/test untuk korpus yang diklaim mendukung model.

## Batas audit

Audit ini menemukan celah yang dapat ditunjukkan dari kode dan log yang tersedia, tetapi tidak membuktikan bahwa semua kelemahan sudah ditemukan. Tidak ada penyerangan terhadap sistem pihak ketiga, akses ke hardware fisik, atau eksploitasi produksi yang merusak. Semua klaim keberhasilan dibatasi pada pengujian yang benar-benar tercatat di GitHub Actions.
