# PRD — Raget Template (otak rule-based/retrieval)

## Goals

1. Jawaban makin akurat lewat retrieval berkualitas (BM25 + re-ranking
   dari histori like/dislike), bukan cuma cakupan data makin luas.
2. Personalisasi nyata (gaya bicara, konteks) tersimpan permanen per
   pengguna, bukan dideteksi ulang tiap pesan.
3. Data (`raget-data/json/`) selalu valid skema + terverifikasi lewat
   gerbang otomatis (`lint-check.mjs`), bukan cuma dicek manual sesekali.
4. Setiap klaim "selesai" di dokumen ini WAJIB punya bukti verifikasi
   nyata (lint LOLOS + Playwright/benchmark), bukan asumsi.

Cakupan: `raget-template/` + mesin-mesin di `raget-agents/` + data +
infra retrieval/memory yang dipakainya. `raget-neural/` di luar cakupan
— lihat `PRD-RAGET-NEURAL.md`. Aturan kerja: `PRD-ATURAN-KERJA.md`.

Status ringkas (detail di §3): Fase 1, 2.1, 2.2, 2.3, 3.2, 4.1, 4.2,
4.3, 4.4 SELESAI (lihat catatan cakupan per fase di tabelnya); Fase 3.1
infrastruktur selesai & teruji, belum siap produksi.

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
| 2.1 🔶 SELESAI UNTUK `dataries-bridge.js`, BELUM MESIN LAIN | Re-ranking retrieval berbobot histori kualitas | Entry data yang sering di-dislike (dari 1.2) diberi penalti skor kecil di `retrieve.js#scoreCorpus()` — TIDAK dihapus dari data, cuma diprioritaskan lebih rendah saat skornya mepet dengan entry lain. **Implementasi nyata**: `scoreCorpus()`/`rank()` di `retrieve.js` sekarang terima `options.entryPenalty` (Map id→faktor 0..1) + `options.idOf`, dikalikan ke skor BM25 mentah sebelum sorting — parameter opsional, kalau tidak dikirim perilakunya PERSIS SAMA seperti sebelumnya (dibuktikan `bench-retrieval.mjs` tetap hit@1 1.0, tidak ada regresi). Cache LRU di `rank()` SENGAJA dilewati (bukan disajikan stale) tiap kali `entryPenalty` diberikan, karena feedback bisa berubah antar giliran sementara cache key lama tidak memodelkan itu. `dataries-bridge.js#datariesFallback()` sekarang mengirim `feedbackStore.entryPenaltyMap()` ke tiap `retrieval.rank()` — inilah satu-satunya jalur yang benar-benar disambungkan (lihat 4.1 untuk kenapa cuma jalur ini). **Diverifikasi**: unit test langsung ke `retrieval.rank()` produksi (bukan mock) membuktikan dua entri berskor identik, salah satunya dipenalti, benar-benar bertukar urutan; `bench-retrieval.mjs` (baseline BM25) tetap identik saat tidak ada penalti. **BELUM diverifikasi**: skenario end-to-end penuh lewat UI chat sungguhan (dislike nyata → tanya ulang → lihat urutan berubah) — di luar cakupan waktu sesi ini, kandidat verifikasi lanjutan. **Jujur belum tercakup**: mesin lain (`knowledge-graph.js`, jalur `datariesBridge.factoid()`/`search()`, dan >10 mesin lain di `agent.js`) BELUM dapat granularitas/re-ranking ini — lihat catatan jujur di 4.1 |
| 2.2 ✅ SELESAI | Personalisasi gaya jawab dari `memory-long.facts` | `context-engine.js` diperluas: `tryStylePreference(text)` mendeteksi permintaan eksplisit ("pakai bahasa formal ya" / "santai aja ngomongnya") dan menyimpannya sebagai fact permanen `gaya_bicara` lewat `memoryLong.remember()` (BUKAN training, cuma fact statistik lokal seperti fakta nama); `getStylePreference()` membacanya balik. `agent.js#respondCore()` memanggil `getStylePreference()` sekali per giliran dan mengalirkannya sebagai `options.tonePreference` ke `llmEngine.tryGreeting/tryDailyTalk/generate`. `llm-engine.js#replyForSmalltalkKey()` diubah: `options.tonePreference` MENANG atas `detectTone(text)` per-pesan — inilah yang membuat preferensi **bertahan lintas giliran** meski pesan berikutnya tidak lagi memuat kata kunci formal/santai (sebelumnya luntur, karena `detectTone()` cuma baca kata di pesan itu saja). **Diverifikasi hidup lewat Playwright** (`python3 -m http.server 8099` + Chromium): kunci sapaan `sekolah` (punya `variantsFormal` di `sapaan.json`) — pesan 1 "ada urusan sekolah nih" (belum ada preferensi) dijawab lewat jalur lain; pesan 2 "mulai sekarang jawab pakai bahasa formal" → dikonfirmasi + fact tersimpan; pesan 3 "ada urusan sekolah lagi" (netral, TANPA kata "formal"/"anda") → dijawab persis "Silakan sampaikan keperluan sekolahnya. Nanti saya bantu merapikan langkahnya." = varian `variantsFormal` bucket `sekolah` di `sapaan.json`, bukan pool default. Membuktikan preferensi dibaca dari `memoryLong` fact, bukan dideteksi ulang per-pesan. `node raget/raget-tools/lint-check.mjs` tetap LOLOS (3 lapis) setelah perubahan. |
| 2.3 ✅ SELESAI | `raget-tools/validate-entry.mjs` — cek skema `{id,kategori,wilayah,nama,tags,teks,meta}` di file domain manapun, PLUS untuk `sapaan/`: bandingkan `tags` topik entri terhadap bucket (`meta.key`) pakai `SMALLTALK_TRIGGERS`/`JENIS_TO_KEY` yang diekspor langsung dari `llm-engine.js` (tidak dobel logika) | Dijalankan terhadap SEMUA 1.255 entri sapaan nyata: menemukan 8 error skema nyata (field `wilayah` hilang di 2 file) — **sudah diperbaiki** — dan 22 warning bucket-vs-tag yang layak dicek manusia (bukan auto-fix). Percobaan pertama pakai teks-balasan-vs-trigger-regex menghasilkan 54 warning TAPI mayoritas false-positive (balasan sopan wajar memuat kata seperti "terima kasih" walau bucket-nya bukan `terima_kasih`) — diperbaiki jadi bandingkan `tags` topik vs bucket, turun ke 22 sinyal yang jauh lebih bersih. **Susulan — 22 warning ditinjau manual satu per satu (baca isi `teks` tiap entri) dan diperbaiki**: 14 kasus tag-nya kurang lengkap (tambah tag bucket yang hilang, mis. "Terlambat ke kantor" ditambah tag `kerja`), 8 kasus bucket-nya memang salah (ganti `meta.key` eksplisit, mis. "Capek kerja" dari bucket `sehat` jadi `capek`, "Masak malam" dari `kabar` jadi `rumah`). `validate-entry.mjs --all-domains` sekarang **0 warning bucket** (dari 22). Diverifikasi hidup lewat Playwright: pesan "capek kerja banget" dijawab lewat bucket `capek` ("Kedengarannya lagi capek ya...") bukan `sehat`; 3 pesan lain (kerja/sekolah/deadline) juga menjawab relevan, 0 error konsol. `lint-check.mjs` tetap LOLOS. |

### FASE 3 — Upgrade semantic search tanpa generatif (jangka panjang)

| # | Pekerjaan | Kenapa bisa duluan tanpa nunggu Neural koheren |
|---|---|---|
| 3.1 🔶 SINYAL NYATA TERUJI, MASIH DI BAWAH BM25 | Semantic search pelengkap BM25 — pooling kalimat + cosine similarity | 3 varian diuji jujur di `bench-retrieval.mjs`/korpus country, 656 gold query, dibandingkan ke baseline BM25 (hit@1 1,0): (1) `semantic-index.js`, embedding Gaussian ACAK di atas `llm-embedding.js` — hit@1 0,58, cuma bag-of-words overlap tanpa makna. (2) `ppmi-embedding.js`, PPMI co-occurrence dilatih dari 3.478 dokumen korpus lokal (window=4, tanpa GPU/download), pooling UNIFORM — hit@1 0,11, LEBIH BURUK dari acak (kata umum melarutkan sinyal kata spesifik). (3) `ppmi-embedding.js` sama tapi pooling IDF-WEIGHTED — **hit@1 0,69, hit@3 0,82, MRR 0,76** — mengalahkan embedding acak dengan jelas, bukti PPMI+IDF menangkap struktur distribusional nyata, TAPI masih di bawah BM25 (1,0) untuk query faktual berpola ketat (`bench-ppmi-vs-bm25.mjs`, laporan `ppmi-vs-bm25-report.json`). **Kenapa belum disambungkan ke produksi**: BM25 masih menang telak di gold query template ini (jawaban ada kata kunci pasti); nilai tambah PPMI+IDF baru terbukti untuk parafrase/sinonim yang BM25 gagal — benchmark khusus itu belum dibuat (di luar cakupan sesi ini). **Prasyarat lanjut**: (a) bangun gold query parafrase (BM25 gagal, makna sama) untuk mengukur nilai tambah sesungguhnya, (b) kalau terbukti, sambungkan sebagai skor tambahan opsional di `retrieve.js` (bukan pengganti BM25), diuji ulang tidak menurunkan hit@1 pada gold query lama. |
| 3.2 ✅ SELESAI | "Kontribusi data federasi" (bukan federated learning ML) — ekspor opt-in ANONIM dari `allUnmatched()` pengguna, tanpa data pribadi, untuk diimpor manual oleh dev sebagai bahan data baru | Catatan jujur wajib: ini BUKAN federated learning gradient-sharing (itu butuh server agregasi, melanggar prinsip 100% lokal produk). Jangan pernah menyebutnya "federated learning" ke pengguna — sebut apa adanya: "kontribusi data anonim opt-in". **Implementasi**: `js/sheets/data-health-sheet.js` (panel "Kesehatan Data", Pengaturan → `row-data-health`) dapat tombol `#data-health-export` yang memanggil `buildAnonymousExport()` — payload cuma agregat (`topKeywords`/`topQueries` ternormalisasi via `feedbackReport.buildUnmatchedReport()`, rentang tanggal gabungan) TANPA timestamp per-kueri atau field lain yang lebih identifiable — lalu `download()` (`js/utils/clipboard.js`, Blob + `<a download>`) memicu unduhan file lokal murni; **tidak ada network call sama sekali**, ini SATU-SATUNYA jalur data ini bisa keluar perangkat dan sepenuhnya inisiatif pengguna sendiri. Tombol nonaktif secara fungsional (toast "Belum ada kueri gagal untuk diekspor") kalau `report.total === 0`, supaya tidak pernah mengunduh file kosong. **Diverifikasi hidup lewat Playwright**: seed 3 entri unmatched langsung ke `ragetDb.logUnmatched()` (modul sama yang dipanggil `agent.js`), buka panel dari Pengaturan, klik tombol → event `download` browser benar-benar terjadi, isi JSON terverifikasi cuma memuat agregat anonim (`totalEntri`, `kueriUnik`, `rentangTanggal`, `topKeywords`, `topQueries`) — TIDAK ada query mentah dengan timestamp individual. `node raget/raget-tools/lint-check.mjs` tetap LOLOS. Alat pelengkap dev-side (`raget-tools/export-unmatched-queries.mjs`, sudah ada sebelumnya) tetap berguna untuk dev yang mengakses langsung profil browser sendiri, tapi tombol ini yang menutup gap "opt-in dari sisi pengguna" yang sebelumnya kosong. |

### FASE 4 — Level lanjutan berikutnya (setelah Fase 1-3 rampung/berjalan)

Tiga hal konkret yang jadi prasyarat sebelum re-ranking (2.1) dan
personalisasi (2.2) bisa benar-benar presisi, ditemukan langsung dari
mengerjakan Fase 1-2.3:

| # | Pekerjaan | Kenapa ini level berikutnya |
|---|---|---|
| 4.1 🔶 SELESAI UNTUK `dataries-bridge.js`, BELUM MESIN LAIN | Granularitas feedback naik dari level-intent ke level-entry: setiap kali sebuah mesin (`knowledge-graph.js`, `dataries-bridge.js`, dst) berhasil menjawab dari SATU entri data terstruktur, catat `entry.id`-nya ke `ragetDb.addNote()` (field baru, mis. `sourceEntryId`) - bukan cuma `intent` generik seperti "factoid" | Prasyarat nyata 2.1: re-ranking BM25 butuh tahu ENTRI mana yang dinilai buruk, bukan cuma "kategori factoid dinilai buruk" (terlalu kasar untuk 24 domain data sekaligus). **Akar masalah nyata yang ditemukan**: `dataries-registry.js#unifiedToLegacyShape()` MEMBUANG `entry.id` sama sekali saat mengonversi skema unified ke bentuk lama yang dipakai `dataries-bridge.js` — inilah kenapa granularitas per-entry mustahil sebelumnya, bukan cuma "belum sempat dikerjakan". **Diperbaiki**: `id: entry.id` ditambahkan ke `unifiedToLegacyShape()`; `datariesFallback()` meneruskan `id` di tiap hasil; `planner.js#planFallback()` sekarang mengembalikan `{text, sourceType, sourceEntryId}` (bukan string polos — SATU-SATUNYA caller-nya, `agent.js`, sudah disesuaikan) dengan `sourceEntryId` cuma diisi kalau sumbernya benar-benar SATU entri `type:'dataries'`, bukan dipaksakan dari `preSearch`/catatan pengguna sendiri yang tidak py entry.id yang sama artinya; `ragetSchema.createNote()`/`ragetDb.addNote()` dapat parameter ke-5 opsional `sourceEntryId` (backward-compatible, note lama tanpa field ini tetap valid); `js/chat/chat.js` tombol like/dislike sekarang mencocokkan balasan ke note DAN membawa `sourceEntryId`-nya ke `feedbackStore.record()`; `feedback-store.js` dapat `statsByEntry()` (analog `statsByIntent()` tapi per entri) dan `entryPenaltyMap()` (Map id→faktor, cuma untuk entri dengan `total>=3` dan `down>up` — ambang minimal supaya satu dislike kebetulan tidak langsung menghukum). **Jujur belum tercakup**: cuma jalur `dataries-bridge.js#datariesFallback()` yang disambungkan penuh — `knowledge-graph.js` dan >10 mesin lain di `agent.js` (math, bilingual, stem, social, dst) belum dapat `sourceEntryId`, karena masing-masing perlu ditelusuri terpisah untuk tahu di mana titik "SATU entri data terstruktur menjawab" itu terjadi persisnya (beda pola tiap mesin) — pekerjaan lanjutan, bukan blocker untuk 4.2 di jalur yang sudah tercakup |
| 4.2 ✅ SELESAI (untuk jalur `dataries-bridge.js`) | Setelah 4.1 ada, baru kerjakan 2.1 (re-ranking) sungguhan dengan bias per-`entry.id`, diuji lewat bench retrieval sebelum/sesudah (bukan cuma "kelihatannya jalan") | Urutan dependensi yang benar: granularitas dulu, baru mekanisme re-ranking di atasnya. Detail implementasi & verifikasi ada di baris 2.1 di atas (dua baris ini sekarang saling merujuk hasil yang sama, sesuai urutan dependensi yang direncanakan) |
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
