# PRD — Pengembangan Lanjutan Raget Template

Status: roadmap aktif — **Fase 1 dan 2.3 SELESAI dan diverifikasi live**
(lihat tabel di §3). Sasaran: fondasi jangka panjang untuk otak
rule-based/retrieval RATEGOAN (`raget-template/` + mesin-mesin di
`raget-agents/`), bukan cuma daftar tugas kecil.

Cakupan PRD ini CUMA sektor Template + data + infra retrieval/memory
yang dipakainya. Perubahan pada `raget-neural/` di luar cakupan PRD ini
— lihat `PRD-RAGET-NEURAL.md`. Aturan kerja lintas-sektor ada di
`PRD-ATURAN-KERJA.md`, WAJIB dibaca sebelum eksekusi PRD ini.

## 1. Kondisi nyata hari ini (dasar pijakan, dicek ulang dari kode)

- `raget-agents/agent.js` mengorkestrasi >selusin mesin khusus berurutan
  (math, bilingual, knowledge-graph, answer-composer, stem, social,
  context, intelligence-rumus, framework-apply, tokoh-store,
  kuliner-store, daily-briefing, feedback-store) sebelum jatuh ke
  `raget-template/llm-engine.js#craft()` sebagai fallback generik.
- Retrieval: `raget-retrieval/bm25.js` (BM25 murni leksikal, k1=1.5,
  b=0.75) + `retrieve.js` (cache LRU 50 entri, threshold
  AUGMENT=0.35/LIST=0.25). Ini **keyword matching**, bukan pemahaman
  makna — sinonim atau parafrase yang tidak berbagi kata kunci tidak
  akan ketemu.
- Data: `raget-data/json/` — 24 domain terstruktur skema seragam
  `{id, kategori, wilayah, nama, tags, teks, meta}`, plus `sapaan/`
  (~1200+ entri smalltalk, diklasifikasi ke bucket lewat
  `JENIS_TO_KEY`/`meta.key` di `llm-engine.js`).
- Memori: `raget-memory/memory-long.js` sudah punya `facts` (key-value,
  mis. nama/preferensi), `notes`, dan `learned` — infrastruktur
  personalisasi SUDAH ADA tapi baru dipakai terbatas (nama pengguna,
  kontinuitas emosi di `context-engine.js`).
- Feedback: `raget-memory/feedback-store.js` sudah merekam like/dislike
  (`record(positive, intent)`) ke `localStorage['raget_feedback']`, tapi
  **cuma jadi angka statistik** (`stats()`) — tidak memengaruhi ranking
  retrieval atau prioritas data sama sekali hari ini.
- Log kegagalan: `raget-database/raget-db.js` sudah punya
  `logUnmatched(query, enginesTried)` dan `allUnmatched()` — infrastruktur
  mencatat pertanyaan yang gagal dijawab SUDAH ADA, tapi tidak ada
  proses lanjutan yang mengubah log ini jadi data baru.

**Kesimpulan jujur**: fondasi closed-loop (feedback → perbaikan) sudah
separuh jalan secara infrastruktur, tapi belum ada satu pun bagian yang
benar-benar "belajar" dari sinyal yang sudah terkumpul. Ini prioritas
tertinggi PRD ini, bukan menulis data lagi secara manual tanpa arah.

## 2. Strategi inti: tiga jenis "pintar" yang berbeda, jangan dicampur

1. **Pintar karena data lengkap** — nambah entri `raget-data/json/`.
   Ini pekerjaan rutin, TIDAK butuh perubahan arsitektur, tapi butuh
   ARAH supaya tidak asal nambah topik acak (lihat §4 prioritisasi
   berbasis data gap).
2. **Pintar karena mesin lebih tajam** — nambah/perbaiki engine di
   `raget-agents/` (mis. deteksi intent baru, pola pertanyaan baru).
   Rutin juga, tapi tetap rule-based/deterministik — jangan diam-diam
   berubah jadi probabilistik/generatif (itu wilayah Neural).
3. **Pintar karena BELAJAR dari pemakaian** — bagian yang BELUM ADA
   sama sekali hari ini. Ini fokus roadmap Fase 1–2 di bawah.

## 3. Roadmap berfase

### FASE 1 — SELESAI — Tutup loop feedback yang sudah ada infrastrukturnya

| # | Pekerjaan | Kenapa | File yang disentuh |
|---|---|---|---|
| 1.1 ✅ | `raget-tools/report-unmatched.mjs` — skrip yang membaca `ragetDb.allUnmatched()`, mengelompokkan query gagal per kata kunci/klaster, keluarkan laporan (markdown/JSON) berisi top-N topik yang paling sering gagal dijawab | Log kegagalan sudah ada tapi tidak pernah dibaca — ini yang mengubahnya jadi arah kerja nyata untuk penulis data | `raget-tools/` (baru), baca `raget-database/`. Logika agregasi diekstrak ke `raget-agents/feedback-report.js` (dipakai bareng 1.3) |
| 1.2 ✅ | `feedbackStore.record()` sudah menerima `intent` sejak lama tapi tidak pernah dikirim `js/chat/chat.js` — sekarang upBtn/downBtn mencari intent lewat `ragetDb.allNotes()` (pola sama seperti `tagFromIntent`) sebelum `record()`. Tambah `statsByIntent()` untuk agregasi | Supaya dislike bisa dilacak balik ke TOPIK/INTENT spesifik yang bermasalah, bukan cuma angka agregat tanpa konteks | `raget-memory/feedback-store.js`, `js/chat/chat.js` |
| 1.3 ✅ | Panel "Kesehatan Data" di Pengaturan → Data (`js/sheets/data-health-sheet.js`), baca `allUnmatched()` + `feedbackStore.stats()`/`statsByIntent()` | Manusia (dev/pengguna) perlu MELIHAT tren, bukan cuma data mentah tersembunyi di IndexedDB/localStorage | `js/sheets/data-health-sheet.js` (baru), `js/account/settings.js`, `css/sheets/sheets.css` |

**Bukti verifikasi live**: tanya pertanyaan gibberish → tercatat di
`allUnmatched()`; tanya "apa ibu kota indonesia" → klik jempol atas →
panel Kesehatan Data menampilkan `factoid 👍1 👎0` dengan benar. 0 error
konsol/network. lint-check LOLOS 0 error.

### FASE 2 — Auto-learning dari sinyal pengguna, 100% lokal (jangka menengah)

Prinsip ketat: "belajar" di sini artinya **re-ranking & prioritas
berbasis statistik lokal**, BUKAN training model apa pun (itu wilayah
Neural). Semua reversible dan transparan.

| # | Pekerjaan | Mekanisme |
|---|---|---|
| 2.1 | Re-ranking retrieval berbobot histori kualitas | Entry data yang sering di-dislike (dari 1.2) diberi penalti skor kecil di `retrieve.js#scoreCorpus()` — TIDAK dihapus dari data, cuma diprioritaskan lebih rendah saat skornya mepet dengan entry lain. **Belum dikerjakan** — butuh plumbing tambahan supaya `feedbackStore` tahu ID entri spesifik (hari ini granularitasnya baru level intent, bukan per-entry), lihat FASE 4.1 |
| 2.2 ✅ SELESAI | Personalisasi gaya jawab dari `memory-long.facts` | `context-engine.js` diperluas: `tryStylePreference(text)` mendeteksi permintaan eksplisit ("pakai bahasa formal ya" / "santai aja ngomongnya") dan menyimpannya sebagai fact permanen `gaya_bicara` lewat `memoryLong.remember()` (BUKAN training, cuma fact statistik lokal seperti fakta nama); `getStylePreference()` membacanya balik. `agent.js#respondCore()` memanggil `getStylePreference()` sekali per giliran dan mengalirkannya sebagai `options.tonePreference` ke `llmEngine.tryGreeting/tryDailyTalk/generate`. `llm-engine.js#replyForSmalltalkKey()` diubah: `options.tonePreference` MENANG atas `detectTone(text)` per-pesan — inilah yang membuat preferensi **bertahan lintas giliran** meski pesan berikutnya tidak lagi memuat kata kunci formal/santai (sebelumnya luntur, karena `detectTone()` cuma baca kata di pesan itu saja). **Diverifikasi hidup lewat Playwright** (`python3 -m http.server 8099` + Chromium): kunci sapaan `sekolah` (punya `variantsFormal` di `sapaan.json`) — pesan 1 "ada urusan sekolah nih" (belum ada preferensi) dijawab lewat jalur lain; pesan 2 "mulai sekarang jawab pakai bahasa formal" → dikonfirmasi + fact tersimpan; pesan 3 "ada urusan sekolah lagi" (netral, TANPA kata "formal"/"anda") → dijawab persis "Silakan sampaikan keperluan sekolahnya. Nanti saya bantu merapikan langkahnya." = varian `variantsFormal` bucket `sekolah` di `sapaan.json`, bukan pool default. Membuktikan preferensi dibaca dari `memoryLong` fact, bukan dideteksi ulang per-pesan. `node raget/raget-tools/lint-check.mjs` tetap LOLOS (3 lapis) setelah perubahan. |
| 2.3 ✅ SELESAI | `raget-tools/validate-entry.mjs` — cek skema `{id,kategori,wilayah,nama,tags,teks,meta}` di file domain manapun, PLUS untuk `sapaan/`: bandingkan `tags` topik entri terhadap bucket (`meta.key`) pakai `SMALLTALK_TRIGGERS`/`JENIS_TO_KEY` yang diekspor langsung dari `llm-engine.js` (tidak dobel logika) | Dijalankan terhadap SEMUA 1.255 entri sapaan nyata: menemukan 8 error skema nyata (field `wilayah` hilang di 2 file) — **sudah diperbaiki** — dan 22 warning bucket-vs-tag yang layak dicek manusia (bukan auto-fix). Percobaan pertama pakai teks-balasan-vs-trigger-regex menghasilkan 54 warning TAPI mayoritas false-positive (balasan sopan wajar memuat kata seperti "terima kasih" walau bucket-nya bukan `terima_kasih`) — diperbaiki jadi bandingkan `tags` topik vs bucket, turun ke 22 sinyal yang jauh lebih bersih |

### FASE 3 — Upgrade semantic search tanpa generatif (jangka panjang)

| # | Pekerjaan | Kenapa bisa duluan tanpa nunggu Neural koheren |
|---|---|---|
| 3.1 | Semantic search pelengkap BM25 pakai `raget-neural/llm-embedding.js` (matmul + lookup embedding + positional encoding SUDAH ADA) — tambah pooling kalimat (mean/CLS) + index cosine similarity | Representasi vektor makna TIDAK butuh generator yang koheren — cuma butuh embedding, jauh lebih murah daripada menunggu Neural generatif siap. BM25 tetap jalan sebagai baseline; semantic search jadi SINYAL TAMBAHAN, bukan pengganti |
| 3.2 ✅ SELESAI | "Kontribusi data federasi" (bukan federated learning ML) — ekspor opt-in ANONIM dari `allUnmatched()` pengguna, tanpa data pribadi, untuk diimpor manual oleh dev sebagai bahan data baru | Catatan jujur wajib: ini BUKAN federated learning gradient-sharing (itu butuh server agregasi, melanggar prinsip 100% lokal produk). Jangan pernah menyebutnya "federated learning" ke pengguna — sebut apa adanya: "kontribusi data anonim opt-in". **Implementasi**: `js/sheets/data-health-sheet.js` (panel "Kesehatan Data", Pengaturan → `row-data-health`) dapat tombol `#data-health-export` yang memanggil `buildAnonymousExport()` — payload cuma agregat (`topKeywords`/`topQueries` ternormalisasi via `feedbackReport.buildUnmatchedReport()`, rentang tanggal gabungan) TANPA timestamp per-kueri atau field lain yang lebih identifiable — lalu `download()` (`js/utils/clipboard.js`, Blob + `<a download>`) memicu unduhan file lokal murni; **tidak ada network call sama sekali**, ini SATU-SATUNYA jalur data ini bisa keluar perangkat dan sepenuhnya inisiatif pengguna sendiri. Tombol nonaktif secara fungsional (toast "Belum ada kueri gagal untuk diekspor") kalau `report.total === 0`, supaya tidak pernah mengunduh file kosong. **Diverifikasi hidup lewat Playwright**: seed 3 entri unmatched langsung ke `ragetDb.logUnmatched()` (modul sama yang dipanggil `agent.js`), buka panel dari Pengaturan, klik tombol → event `download` browser benar-benar terjadi, isi JSON terverifikasi cuma memuat agregat anonim (`totalEntri`, `kueriUnik`, `rentangTanggal`, `topKeywords`, `topQueries`) — TIDAK ada query mentah dengan timestamp individual. `node raget/raget-tools/lint-check.mjs` tetap LOLOS. Alat pelengkap dev-side (`raget-tools/export-unmatched-queries.mjs`, sudah ada sebelumnya) tetap berguna untuk dev yang mengakses langsung profil browser sendiri, tapi tombol ini yang menutup gap "opt-in dari sisi pengguna" yang sebelumnya kosong. |

### FASE 4 — Level lanjutan berikutnya (setelah Fase 1-3 rampung/berjalan)

Tiga hal konkret yang jadi prasyarat sebelum re-ranking (2.1) dan
personalisasi (2.2) bisa benar-benar presisi, ditemukan langsung dari
mengerjakan Fase 1-2.3:

| # | Pekerjaan | Kenapa ini level berikutnya |
|---|---|---|
| 4.1 | Granularitas feedback naik dari level-intent ke level-entry: setiap kali sebuah mesin (`knowledge-graph.js`, `dataries-bridge.js`, dst) berhasil menjawab dari SATU entri data terstruktur, catat `entry.id`-nya ke `ragetDb.addNote()` (field baru, mis. `sourceEntryId`) - bukan cuma `intent` generik seperti "factoid" | Prasyarat nyata 2.1: re-ranking BM25 butuh tahu ENTRI mana yang dinilai buruk, bukan cuma "kategori factoid dinilai buruk" (terlalu kasar untuk 24 domain data sekaligus) |
| 4.2 | Setelah 4.1 ada, baru kerjakan 2.1 (re-ranking) sungguhan dengan bias per-`entry.id`, diuji lewat bench retrieval sebelum/sesudah (bukan cuma "kelihatannya jalan") | Urutan dependensi yang benar: granularitas dulu, baru mekanisme re-ranking di atasnya |
| 4.3 ✅ SELESAI | `raget-tools/validate-entry.mjs` diperluas: flag `--all-domains` mengecek skema `{id,kategori,wilayah,nama,tags,teks,meta}` di SEMUA 21 domain dataries (bukan cuma sapaan); `raget-data/json/pengetahuan/` dapat validator terpisah lebih longgar (skema beda by design — `{q,a}`/`{subject,answer}`/`{title,text}`, bukan diabaikan) | Dijalankan ke 208 file/3.931 entri nyata: **0 error skema** di 20 domain non-sapaan (sudah bersih), 22 warning bucket sapaan yang sama seperti sebelumnya (tidak ada regresi) |
| 4.4 ✅ SELESAI | `lint-check.mjs` sekarang punya gerbang ke-3: menjalankan `validate-entry.mjs --all-domains`, gagal (exit 1) kalau ada error skema | Diverifikasi dengan sengaja merusak satu entri nyata (hapus field `wilayah` dari `negara/african-barat.json`) — gerbang menangkapnya dan lint GAGAL seperti seharusnya, lalu dipulihkan lewat `git checkout` dan lint LOLOS lagi. Bug skema baru sekarang ketahuan SEBELUM commit, bukan lewat audit manual sesekali |

## 4. Prinsip pengelompokan data (data governance) — dikodifikasi, bukan tersirat

- Skema WAJIB seragam: `{id, kategori, wilayah, nama, tags, teks, meta}`
  di semua domain `raget-data/json/`. Jangan buat domain baru dengan
  skema field berbeda.
- Domain baru vs sub-bucket domain lama: buat domain BARU kalau topiknya
  punya struktur data sendiri yang beda (mis. `kuliner/` beda dari
  `tokoh/`). Kalau cuma variasi konteks dalam topik yang sama (mis.
  ragam sapaan harian), pakai bucket/`meta.jenis`/`meta.key` di dalam
  domain `sapaan/` yang sudah ada — JANGAN bikin domain baru per-konteks
  kecil (ini yang bikin `sapaan/` sekarang punya puluhan file per
  sub-topik, sudah pas — jangan pecah lebih jauh dari itu tanpa alasan
  volume data yang jelas).
- Prioritas penulisan data baru HARUS berbasis Fase 1.1 (laporan
  unmatched), bukan tebakan bebas topik apa yang "kelihatannya kurang".
- Setiap penambahan/retag entri WAJIB dispot-check manual minimal
  sampel acak sebelum commit (preseden bug retag "Gaji belum" di atas)
  — Fase 2.3 mengotomasi sebagian ini, tapi review manusia tetap wajib
  untuk perubahan skala besar (>50 entri).

## 5. Metrik keberhasilan per fase

- Fase 1: laporan unmatched bisa dihasilkan, feedback tercatat dengan
  `entryId`, panel kesehatan data tampil live tanpa error konsol.
- Fase 2: re-ranking terverifikasi mengubah urutan hasil pada kasus
  nyata (entry dislike-tinggi turun peringkat, dibuktikan lewat
  bench/live test sebelum-sesudah), asisten validasi entry menangkap
  minimal 1 kasus skema/tag salah pada data uji.
- Fase 3: semantic search menambah minimal 1 kasus nyata yang BM25 gagal
  tangkap (parafrase/sinonim) tapi semantic-nya berhasil, dibuktikan
  lewat bench retrieval baru.

## 6. Di luar cakupan PRD ini

- Apa pun yang mengubah `raget-neural/` atau strategi training/scaling
  model — itu `PRD-RAGET-NEURAL.md`.
- Menyematkan model bahasa pihak ketiga dalam bentuk apa pun — sudah
  diputuskan TIDAK dikejar (lihat `docs/ARSITEKTUR.md`).
- Setiap pekerjaan di PRD ini WAJIB ikut `PRD-ATURAN-KERJA.md`: fokus
  satu fase/item sampai lint LOLOS + live-verified sebelum pindah ke
  item berikutnya, kecuali ada perintah lain eksplisit.
