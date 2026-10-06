# AUDIT KODE TAJAM — Rategoan

**Tanggal:** 2026-10-06
**Branch:** main
**Commit:** b1b7b24435fe70296b3e328668173f204bc00156

## Ringkasan
Rategoan sudah merupakan sistem besar: PWA vanilla JS, API/connectors, agent orchestration, Template engine, Neural runtime, retrieval, memory, vault RAG, knowledge data, corpus/training dan tooling. Masalah utamanya bukan kekurangan fitur. Masalahnya adalah kompleksitas tumbuh lebih cepat daripada boundary, observability, dan integration testing.

## P0 — error swallowing
`js/main.js` membungkus hampir semua initializer dengan try/catch lalu hanya `console.error`. Ini membuat subsystem penting bisa gagal tetapi aplikasi tetap tampak hidup. Lebih serius lagi, file yang sama memasang `unhandledrejection` global dan memanggil `preventDefault()`. Ini dapat menyembunyikan kegagalan async.

**Putusan:** jangan gunakan global suppression sebagai stabilizer. Buat error boundary per subsystem, startup health state, structured error reporting, dan bedakan error recoverable vs fatal.

## P0/P1 — bootstrap terlalu gemuk
`main.js` menginisialisasi store, auth, account, router, chat, history, UI, attachment, camera, voice, backup, pin, settings, project, studio, connectors, command palette, reminder, GPU probe, dataries dan lain-lain dari satu boot path.

Ini meningkatkan startup latency, dependency coupling dan blast radius perubahan. Pecah menjadi fase: core → chat → optional UI → integrations → AI → background.

## P1 — Neural prefetch terlalu agresif
`neural-provider.js` memiliki tier 50M/100M/200M dan `prefetchBest()` mencoba tier `super`. `main.js` memulai GPU probe/warmup saat startup. Untuk perangkat lemah, bandwidth terbatas, offline atau pengguna yang tidak membutuhkan Neural, ini merupakan kebijakan yang terlalu agresif.

**Perbaikan:** model manager harus punya manifest, version, SHA256, ukuran, state `checking/downloading/loading/ready/failed`, storage quota check, cancellation dan download progress. Jangan unduh 200M hanya karena aplikasi dibuka.

## P1 — timeout bukan cancellation
`neural-adapter.js` memakai `Promise.race()` untuk timeout. Ini menghentikan penantian caller, bukan pekerjaan inference. Pekerjaan lama dapat tetap memakai CPU/GPU/memory. Terapkan AbortController atau cancellation contract sampai engine.

## P1 — retrieval belum benar-benar terindeks
`raget-retrieval/retrieve.js` melakukan tokenisasi seluruh corpus pada setiap scoring call. Cache hanya menyimpan hasil query. Untuk corpus besar, ini akan menjadi bottleneck.

Target: persistent/incremental inverted index, document frequency dan pre-tokenized corpus. Query seharusnya membaca index, bukan membangun ulang representasi seluruh corpus.

## P1 — istilah semantic pada Vault RAG menyesatkan
`raget-vault/local-rag.js` menggabungkan BM25 65% dan trigram cosine 35%. Trigram cosine adalah lexical/fuzzy character n-gram, bukan dense semantic embedding.

Nama yang tepat: `lexical BM25 + fuzzy trigram`. Jika ingin semantic retrieval, tambahkan embedding model dan vector/ANN index.

## P1 — memory terlalu sederhana
`memory-long.js` memakai satu key `localStorage` untuk facts, notes dan learned. Ini synchronous, quota terbatas, tanpa schema migration/transaction/concurrency control. Regex extraction seperti `nama saya`, `saya suka`, `saya tinggal di` cocok sebagai heuristic, bukan memory system matang.

Gunakan IndexedDB dengan schema version, id, type, value, confidence, source, timestamps dan expiry. Tambahkan policy untuk inspect/edit/delete.

## P1 — API dispatcher adalah security boundary
`api/_dispatch.js` merupakan generic tool forwarder: bearer token → tool lookup → path/query/body → upstream. Generic abstraction mengurangi duplikasi tetapi memperbesar blast radius.

Wajib diuji: SSRF/path injection, parameter pollution, method confusion, token forwarding, CORS, origin spoofing, oversized body, timeout, rate limit dan upstream error normalization.

## P1 — malformed JSON ditelan
`api/_http.js` mengubah JSON invalid menjadi `{}`. Ini membuat malformed request terlihat seperti request kosong dan memperburuk diagnosis. Lebih benar mengembalikan HTTP 400 `invalid_json`.

## P1 — lint terlalu lemah
`eslint.config.mjs` sengaja berfokus pada correctness dasar seperti no-undef, duplicate declaration dan unreachable. Itu bagus sebagai gerbang minimum, tetapi tidak cukup untuk sistem sebesar ini.

Belum ada kontrak type-level, dependency-cycle check, async/promise safety, complexity/security rules dan boundary browser/server yang kuat. `npm run lint` hijau tidak berarti aplikasi sehat.

## P1 — unit test tidak cukup
`package.json` menjalankan unit test Node. Repo memiliki DOM, IndexedDB, Service Worker, WebGPU, auth, connectors, API, retrieval dan Neural. Minimal harus ada unit + integration + browser smoke + retrieval regression + connector contract + storage migration + neural runtime smoke.

Playwright sudah ada sebagai devDependency; manfaatkan untuk boot dan jalur pengguna utama.

## P1 — model cache/versioning
Service Worker dan checkpoint eksternal dapat menghasilkan kombinasi JS baru + model lama atau sebaliknya. Model harus memiliki manifest version, tier, bytes, SHA256 dan runtime compatibility. Cache model harus memiliki eviction policy.

## P2 — agent terlalu heuristik
`raget-agents` memiliki banyak bridge/handler. Ini kuat untuk deterministic behavior, tetapi setiap fitur baru menambah kombinasi intent × memory × retrieval × tool × context × engine. Jangan terus menambah regex/if pada satu pipeline.

Pisahkan classification → planning → execution → composition.

## P2 — threshold tersebar
Threshold retrieval muncul di retrieval, agent, dataries bridge dan planner. Walaupun beberapa sudah didokumentasikan, policy sebaiknya dipusatkan agar kalibrasi tidak menyebar.

## P2 — runtime data vs training corpus
`raget-data/json` berfungsi sebagai knowledge runtime, sedangkan JSONL/corpus dan release assets merupakan training corpus. Keduanya harus diberi boundary yang jelas agar tidak dianggap interchangeable.

## P2 — arsip terlalu dekat dengan production
Folder seperti `arsip-nonaktif`, `migrasi-domain-selesai` dan devlog sejarah berguna untuk sejarah, tetapi harus diberi manifest/archive marker dan dilarang di-import production. Kalau tidak, repo berubah menjadi museum yang kebetulan executable.

## Dokumentasi
Dokumentasi sangat lengkap tetapi source of truth terlalu banyak: README, ARSITEKTUR, KERANGKA-MESIN, banyak PRD, status corpus, release spec dan devlog. Buat satu `CURRENT-SYSTEM.md` yang menjawab boot, engine production, runtime data, Neural status, API status, test gate dan deployment.

## Yang harus dipertahankan
Engine contract, pemisahan Template/Neural, local-first, deterministic fast path, IndexedDB, retrieval benchmark, corpus manifest/SHA256 governance, release governance, CI lint, Playwright, model tiering, fallback architecture dan feedback/unmatched-query loop adalah fondasi yang bagus.

## Prioritas perbaikan
### P0
1. Hapus global `unhandledrejection.preventDefault()`.
2. Buat startup health state dan critical/non-critical boot boundary.
3. Hentikan default prefetch 200M; gunakan policy berbasis kebutuhan + perangkat.
4. Tambahkan integration smoke test untuk boot.

### P1
5. Bangun persistent/incremental retrieval index.
6. Bedakan trigram fuzzy dari semantic embedding.
7. Migrasikan memory utama ke IndexedDB + schema migration.
8. Tambahkan cancellation pada inference.
9. Tambahkan API security/contract tests.
10. Tambahkan browser integration suite.
11. Tambahkan model manifest/checksum/version.

### P2
12. Pecah bootstrap.
13. Pusatkan retrieval policy.
14. Pisahkan runtime-data/training-corpus.
15. Isolasi archive.
16. Kurangi regex-based intent sprawl.
17. Tambahkan dependency graph check.
18. Buat `CURRENT-SYSTEM.md`.

## Putusan akhir
Rategoan memiliki ide dan fondasi arsitektur yang kuat, tetapi sekarang berada di titik di mana penambahan fitur/data tanpa memperkeras boundary akan menghasilkan sistem yang semakin sulit diverifikasi.

Kalimat paling kerasnya:

> Rategoan tidak kekurangan kemampuan; Rategoan kekurangan pagar yang memastikan semua kemampuan itu tetap dapat dipercaya ketika sistem membesar.

Skor kualitatif: arsitektur 8/10, local-first 9/10, modularitas 7/10, deterministic runtime 8/10, retrieval 6/10, memory 5/10, Neural runtime 6/10, observability 4/10, testing 5/10, security boundary 5/10, maintainability 5/10, dokumentasi 8/10.

## Metodologi
Audit ini berbasis tree repo pada commit yang disebutkan, pembacaan source runtime-critical dan pencarian pola error/security/quality pada codebase. Ini bukan klaim bahwa setiap byte data/biner telah dieksekusi. Fokus audit adalah kode yang menentukan boot, AI, retrieval, memory, API dan lifecycle model.