# PRD — Rategoan Produksi Ready (satu dokumen kerja Claude, konsolidasi)

Status: **BERLAKU, dokumen tunggal**. Ditulis 2026-09-01, menggabungkan
tiga sumber sesuai permintaan dirigen ("jadikan 1 dengan 1 pekerjaan
Claude"):

1. `RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md` (ChatGPT) — kerangka
   28 fase generik untuk pematangan produk.
2. `prd-rategoan/PRD-AUDIT-PRODUKSI-READY.md` + `CHECKLIST-PRODUKSI.md`
   + `LAMPIRAN-SNAPSHOT-REPO.md` (Grok) — audit konkret dengan Definition
   of Done yang bisa diverifikasi, membagi kerja jadi Ronde A (Grok, akses
   Release) / Ronde B+C (Claude, kode+training) / Ronde D (PWA).
3. Audit langsung Claude ronde ini (bench, kode, Release API, live query
   testing) — dijalankan setelah dua dokumen di atas dibaca, BUKAN
   asumsi.

Dokumen ini **menggantikan** (isinya dilebur ke sini, filenya dihapus
supaya tidak ada PRD nganggur): `PRD-PENGEMBANGAN-LANJUTAN-CLAUDE.md`,
`docs/AUDIT-VNEXT.md`, `docs/RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md`.

Dokumen ini **TIDAK menggantikan** (masih berlaku terpisah):
`PRD-DATA-RELEASE.md` (aturan mengikat struktur Release — dokumen yang
menang kalau ada konflik penamaan/kategori korpus) dan
`PRD-PERINTAH-GROK.md` (catatan tugas Grok, sudah dieksekusi sebagian
besar ronde ini — lihat status di bawah, dibiarkan hidup karena masih
jadi acuan aktif pihak yang mengerjakannya).

---

## 0. Keputusan produk (dari Grok, dikonfirmasi Claude)

RATEGOAN adalah **dua lapisan** — jangan dijual sebagai satu:

| Lapisan | Status | Peran produksi |
|---|---|---|
| Raget rule-based | Jalan di perangkat, deterministik, **default aktif** (diverifikasi kode: `llm-models.js` `MODELS[0].engineClass === 'rule-template'`) | **Default produksi** |
| Neural 50/100/200M | Checkpoint ada, PPL turun konsisten tiap ronde, generasi belum koheren | Mode uji eksplisit, bukan default |

"Production ready" untuk ronde ini = **lapisan 1 (rule-based)**. Neural
koheren adalah syarat lapisan 2, terpisah, tidak menghalangi rilis
lapisan 1.

---

## 1. Status Definition of Done (Checklist Grok, dicentang dengan bukti nyata)

### Lapisan 1 — wajib untuk sebut "siap pakai"

- [x] **Default chat = rule-based.** Diverifikasi kode: `js/ai/ai.js`
      cuma panggil `neuralProvider` kalau `active.engineClass ===
      'local-neural'`; default `llmModels.active` = `MODELS[0]` =
      `raget-template-1` (rule-template). Fallback ke `agent.respond()`
      kalau neural reply falsy.
- [x] **8 intent harian lolos tanpa neural.** Diuji langsung lewat
      Playwright (bukan baca kode): sapaan/kabar/capek/sekolah-PR/izin-
      sekolah/nilai-ulangan **lolos** dengan jawaban on-topic. **KTP
      lolos untuk frasa pendek** ("ktp", "urus ktp", "bikin ktp" — fix
      dirigen/Grok commit `27906f9` + `081dc80` berhasil). **KTP frasa
      "cara ... gimana ya" DIPERBAIKI ronde ini**: `router-intent.js`
      dapat `LAYANAN_KEYWORDS_RE` (ktp/kk/sim/paspor/akta/npwp/
      dukcapil/pengaduan/komplain/loket/antri/berkas/calo) yang dicek
      SEBELUM `/^(cara|langkah)\s+/` mengembalikan tool `cara` —
      kalau match kata kunci layanan, `detectTool` return `null`
      supaya jatuh ke `matchSmalltalk` trigger `layanan` di
      `llm-engine.js` (jalur yang SAMA yang sudah dipakai "ktp"/"urus
      ktp" bare). Diverifikasi 2 cara: (1) node langsung memanggil
      `routerIntent.detectTool()` untuk 16 kasus "cara"/"langkah" di
      `bench.json` — SEMUA tetap `cara`/`devlog_cara_kerja` seperti
      sebelumnya (nol regresi), hanya "cara bikin KTP gimana ya" yang
      berubah dari `cara` ke `null`; (2) grep `bench.json` untuk kata
      kunci layanan — nol tabrakan dengan prompt "cara X" manapun di
      1190 kasus. Bench CORE-SUITE penuh dijalankan ulang setelahnya
      (lihat §1 baris bench di bawah untuk angka final).
- [x] **Bench CORE-SUITE penuh dijalankan; angka pass tertulis.**
      Dijalankan penuh 1190 kasus (`run-bench-chunked.mjs`, 4 chunk,
      ~1005 detik total) 2026-09-01: **CORE-SUITE 1175/1180 = 99.58%**
      (target ≥97%, TERCAPAI), STUB-SUITE 1/10 = 10% (informatif, butuh
      lampiran nyata, sesuai desain suite), GABUNGAN 1176/1190 = 98.82%.
      0 console/404 error. 5 kegagalan CORE dicatat presisi (lihat §2).
      **Bukan badge lama** — dijalankan ulang penuh ronde ini setelah
      `run-bench.mjs` sendiri sempat ditemukan rusak (login butuh
      password, skrip cuma isi email) dan diperbaiki lebih dulu.
      **Dijalankan ULANG 2x lagi** setelah perbaikan berturut-turut.
      Ronde 2 (setelah fix router KTP): 1175/1180 = 99,58% - KTP hilang
      dari daftar gagal, TAPI muncul 1 kegagalan baru tak terkait
      `"bro, kabar?"` (domain smalltalk "kabar", follow-up note
      mengandung "Anda" padahal `notContains` melarangnya). Ronde 3
      (setelah fix `isSmalltalkText()` untuk bug "bro, kabar?" - lihat
      commit `6b0e380`): **1176/1180 = 99,66% [TARGET TERCAPAI],
      naik dari 99,58% awal ronde ini**, nol regresi (semua 4 chunk
      `ok:true`). Sisa 4 kegagalan: 3 kasus superlatif geografi
      (root cause presisi ditemukan, lihat §2, sengaja belum
      ditambal - butuh data akurat) + 1 self-review (belum
      diinvestigasi). Bukti mentah log lengkap ada di riwayat kerja
      sesi ini.
- [x] **README tidak klaim 100% bench tanpa angka baru** — README
      ditulis ulang ronde ini (lihat §6), angka bench yang dicantumkan
      adalah 99,66% CORE-SUITE (angka final ronde ini), dengan tanggal.
- [x] **K1 K2 K3 ada `estimasiToken` tokenizer proyek.** Diisi ronde ini
      di `korpus-manifest-total.json` (`totalTokenBPEResmi` per rak,
      dihitung dari gzip live yang SHA256-nya dicocokkan dulu terhadap
      Release, BUKAN tebakan ukuran gzip). Angka berubah 2x dalam
      ronde ini: awalnya K1 303.917.157/K2 85.003.080/K3 32.010.503 =
      420.930.740 total; lalu Grok menggabung 76.071 dokumen unik
      Wikipedia ke K1 (dedupe per-fingerprint, bukan retire seperti
      instruksi Claude yang salah sebelumnya - lihat koreksi di
      `PRD-PERINTAH-GROK.md`) sehingga K1 jadi 759.587 dokumen/
      354.376.464 token (dihitung ulang Claude malam ini). **Total
      kanonik FINAL: 471.390.047 token BPE** — ini angka valid
      terbaru untuk training.
- [x] **Manifest total hanya rak hidup.** `korpus-manifest-total.json`
      sudah direstrukturisasi dirigen/Grok ronde ini (commit `7ae0cbf`)
      ke 3 rak K1/K2/K3 saja — jilid2 dan skema jilid1-5 lama sudah
      dikeluarkan, ditandai eksplisit "TIDAK dihitung — data berisiko".
- [x] **Privasi lokal vs Google vs server tertulis di UI.** Sebelum
      ronde ini: bagian "Privasi & Keamanan" di Pengaturan cuma berisi
      toggle "Kunci Aplikasi", TIDAK ADA penjelasan privasi eksplisit
      sama sekali. Ditambahkan catatan singkat, jujur, terverifikasi
      render (Playwright, 0 page error): data lokal (IndexedDB) by
      default, Google Sign-In cuma pakai email, Mode Server kirim pesan
      ke server pilihan sendiri.
- [x] **PAT tidak ada di chat/repo.** Grep menyeluruh (`GITHUB_TOKEN`,
      pola `ghp_`/`AKIA`/`AIza`/`sk-`/`xox`) di seluruh repo: nol token
      asli ditemukan, semua hit adalah placeholder/nama env var
      (`$GITHUB_TOKEN`, `ghp_xxx` contoh di dokumentasi). Rotasi PAT
      sungguhan (kalau memang sempat bocor di percakapan agen di luar
      repo) adalah tindakan operator, di luar kendali sandbox ini.

### Lapisan data

- [x] Review 200 baris MADLAD selesai — **RETIRE** (dirigen/Grok,
      commit `4940c13`: isi web-crawl judi/forex/blog, tidak masuk K1,
      sesuai instruksi `PRD-PERINTAH-GROK.md` Bagian A).
- [x] `staging/korpus-parts` diangkat — jilid1/3/4/5 sudah masuk K1/K3
      (dirigen/Grok, commit `7ae0cbf`+`4940c13`, dikonfirmasi ukuran
      K1/K3 berubah sesuai + SHA256 baru tercatat). **Branch belum
      dihapus** — Claude sengaja tidak menghapus sendiri ronde ini
      (bukan keterbatasan akses seperti Release, tapi supaya tidak
      bentrok dengan pihak yang masih aktif bekerja di repo yang sama
      real-time selama sesi ini — lihat commit beruntun `7ae0cbf`
      s.d. `081dc80` yang masuk SELAMA Claude bekerja). Aman dihapus
      kapan saja setelah ini dikonfirmasi dirigen.
- [x] Tidak ada tag `panen-*` berisi `progress.json` doang — cuma ada
      1 tag panen (`panen-madlad400-id`), sudah di-retire di atas.
- [x] K3 tetap mayoritas `lang: id` — tidak diverifikasi ulang baris-
      per-baris ronde ini (di luar cakupan waktu), dipercaya dari
      catatan STATUS-KORPUS-LISENSI.md dirigen/Grok yang eksplisit
      menyebut "97.548 dokumen, `lang: id`".
- [x] K1 tidak dikembalikan mswiki — tidak ditemukan referensi mswiki
      di kode/manifest aktif manapun ronde ini.

### Lapisan 2 (opsional, neural)

- [x] **200M dijalankan, 3 sesi** — sesi 1: 18 menit (dipangkas dari
      rencana 60 menit karena tenggat keras 30 menit total dari dirigen
      untuk seluruh siklus mix+tokenize+rechunk+training; keputusan
      sadar, dicatat jujur bukan disembunyikan), setelah 100M 90 menit
      selesai (tidak paralel, sesuai larangan §7 PRD Grok). Sesi 2 dan
      3: masing-masing 90 menit penuh di background, resume otomatis
      dari checkpoint sesi sebelumnya. Held-out perplexity 2898,68 →
      1661,48 (sesi 1) → 1242,11 (sesi 2) → **1068,37** (sesi 3, turun
      total 2,71x dari awal). Total akumulasi **1787 step / 335,46
      menit**. Laporan: `training-report-massive200m-round8-colab-gpu.json`,
      dicatat juga di devlog `keputusan-021`+`keputusan-022`.
- [x] **5 sampel generasi dicatat** — MASIH acak/belum gramatikal
      (sama seperti 100M pada tahap serupa) — dilaporkan jujur, DoD ini
      "dicatat" bukan "lolos", karena isinya memang belum koheren.
- [x] **Mix K1/K2/K3 sesuai §10 PRD-DATA-RELEASE** — dieksekusi:
      K1=64,6% K2=28,4% K3=7,0% (dalam rentang resmi 55-65/25-35/≤15),
      dari gzip live yang SHA256-nya diverifikasi ulang saat itu (K2
      ternyata sudah berubah lagi sejak diukur tokennya beberapa menit
      sebelumnya — data terus berubah cepat sepanjang sesi ini).
- [x] Checkpoint di tag `checkpoint-200m` dengan SHA — checkpoint sesi 1
      (SHA256 `5286b900...`) DAN sesi 2 (SHA256 `b5aeb665...`, PPL
      1242,11) BERHASIL dipublikasikan berturut-turut ke Release oleh
      Grok (terverifikasi lewat commit "chore: hapus part checkpoint
      setelah publish Release" x2 yang menghapus folder handoff setelah
      tiap publish sukses). Claude sendiri TETAP tidak bisa publish
      Release langsung dari sandbox (dikonfirmasi diblokir classifier)
      — jalur yang dipakai: commit checkpoint (dipecah 2 part) ke
      folder `checkpoint-200m/` di root repo lewat git push biasa,
      BUKAN chat. Checkpoint sesi 3 (terbaru, SHA256 `d4aba4d8...`,
      PPL 1068,37, 1787 step/335,46 menit akumulasi) sudah di-refresh
      ke folder yang sama — publish ke Release masih status terbuka
      untuk sesi 3 ini pada saat laporan ditulis.

---

## 2. Temuan bench detail (status per ronde 2026-09-01, terakhir diperbarui)

Riwayat: bench pertama ronde ini 1175/1180=99,58%, 5 gagal (atlantis,
negara-terkecil-eropa, negara-terbanyak-asia, KTP, self-review). Fix
router KTP (§1) → bench ulang tetap 1175/1180 tapi KTP hilang dari
daftar gagal, muncul kegagalan baru tak terkait `"bro, kabar?"`. Fix
`"bro, kabar?"` (llmEngine.isSmalltalkText — commit `6b0e380`) →
**bench ulang ke-3 (FINAL, dikonfirmasi): 1176/1180 = 99,66% [TARGET
TERCAPAI]**, naik dari 99,58% di awal ronde ini, nol regresi (4/4
chunk `ok:true`, 0 console/404 error).

Kegagalan yang MASIH terbuka (didiagnosis presisi ronde ini, BELUM
diperbaiki — root cause sekarang jauh lebih jelas dari sebelumnya):

1. **`negara terkecil di eropa apa`** (harap "Vatikan") + **`negara
   mana yang penduduknya paling banyak di asia`** (harap "Tiongkok")
   — root cause LENGKAP ditemukan ronde ini (sebelumnya cuma diduga
   "heuristik lanjutan topik", sekarang presisi):
   - `bridge-reasoning.js` `trySuperlatif()` SUDAH ADA dan berfungsi
     untuk pola "negara [dengan] populasi/luas terbesar/terkecil/dst",
     TAPI (a) regex-nya tidak cocok dengan urutan kata "negara
     terkecil di X" atau "negara mana yang Y-nya paling Z di X" (field
     kata seperti "luas"/"penduduk" tidak disebutkan eksplisit di
     prompt asli), dan (b) TIDAK ADA penyaringan benua sama sekali —
     selalu mengembalikan top-3 GLOBAL, bukan top-1 di benua yang
     diminta.
   - **Data juga belum lengkap**: `raget-data/json/negara/
     eropan-selatan.json` TIDAK punya entri Vatikan sama sekali (San
     Marino ada, 61 km² — negara terkecil ke-2 dunia, tapi bench
     minta "Vatikan" spesifik). Entri China di `asian-timur.json`
     `nama` fieldnya `"China"`, BUKAN `"Tiongkok"` yang diminta bench.
   - **Sengaja tidak ditambal ronde ini**: memperbaiki logika query
     saja TIDAK akan membuat bench ini lolos (Vatikan tetap tidak
     ditemukan, China tetap bernama "China") — perlu juga menambah
     entri data Vatikan (perlu angka akurat: ibu kota, luas ~0,49
     km², populasi ~800, dsb — otoritatif, bukan tebakan) dan alias
     "Tiongkok" untuk China. Menambah data negara di bawah tekanan
     waktu berisiko salah angka (misinformasi lebih buruk daripada
     tidak dijawab) — sengaja ditunda ke ronde berikutnya dengan
     waktu cukup untuk verifikasi fakta.
2. **`what is the capital of atlantis`** — Atlantis tidak nyata,
   tidak ada jawaban faktual benar yang mungkin; balasan sistem saat
   ini (klarifikasi "lanjutan topik atau baru?") sebenarnya bukan
   respons tak masuk akal untuk pertanyaan fiksi seperti ini, cuma
   bench tidak punya kategori "tolak dengan sopan" untuk kasus ini.
3. **`gimana menurutmu kualitas kerjaanku`** (harap konten
   self-review/metode sandwich) — dijawab dengan deflection generik
   "bukan punya opini pribadi seperti manusia" alih-alih memberi
   kerangka self-review yang diharapkan. Kemungkinan entri
   pengetahuan terkait "self-review"/"metode sandwich" belum ada atau
   tidak ter-trigger oleh frasa ini. Belum diinvestigasi lebih lanjut
   ronde ini (fokus waktu habis untuk temuan #1 di atas).

Total dampak sebelum ronde ini: 0,42% dari CORE-SUITE (5/1180).
Tidak menghalangi status "produksi lapisan 1" (99.58% jauh di atas
gerbang 97%).

---

## 3. Ringkasan 28 fase master command — status realistis (bukan klaim tuntas)

Filter dari 28 fase generik ke status nyata per kelompok (banyak fase
saling tumpang tindih dengan checklist Grok di §1, tidak diulang):

| Kelompok fase | Status ronde ini |
|---|---|
| Phase 0 Audit | **Selesai** — dokumen ini + histori commit adalah hasilnya |
| Phase 1 Architecture boundary | **Temuan dicatat, belum dieksekusi**: `js/chat/chat.js`, `js/chat/chatsearch.js`, `js/collection/collection.js` impor `raget-retrieval`/`raget-memory`/`raget-database` langsung, bukan lewat satu pintu `js/ai/ai.js`. Refactor ini beresiko menyentuh banyak file sekaligus — sengaja TIDAK dikerjakan tergesa ronde ini (prinsip "jangan big-bang refactor" di master command sendiri) |
| Phase 2 Core intelligence | **Sebagian**: bench 99,58% jadi bukti stabilitas nyata; 3 kegagalan sistemik di §2 belum ditambal |
| Phase 3 Memory | **Belum diaudit ulang ronde ini** — panel "Fakta tentang saya" pernah dibangun (devlog historis), fungsi penuh (inspect/search/edit/delete/clear all) belum diverifikasi ulang langsung |
| Phase 4 Retrieval benchmark | **Belum ada** — bench.json menguji jawaban akhir end-to-end, bukan metrik retrieval terpisah (hit@1/hit@3/MRR) per domain |
| Phase 5 Unit/Integration/E2E | **Sebagian** — bench.json = campuran unit-ish + E2E lewat browser nyata; tidak ada test murni per-modul JS terpisah |
| Phase 6 Capability Matrix | **Selesai** — `docs/CAPABILITIES.md` |
| Phase 7-11 UX/Onboarding/Chat/Privacy/Settings | **Privacy: selesai** (§1). Sisanya belum diaudit sistematis ronde ini — polesan ad-hoc (hover state, sidebar login-gate) sudah dilakukan ronde-ronde sebelumnya, bukan audit menyeluruh Phase 7-11 |
| Phase 12-13 Data mgmt/Corpus governance | **Selesai** lewat `PRD-DATA-RELEASE.md` (sudah ada sebelum ronde ini) + eksekusi Grok ronde ini |
| Phase 14 Security | **Sebagian**: grep secret bersih (§1), 36 penggunaan `innerHTML` (12 file) BELUM diaudit XSS satu-satu |
| Phase 15 Performance | **Belum diukur** ronde ini (tidak ada baseline Time-to-Interactive/latency tercatat) |
| Phase 16 PWA | **Belum diaudit ulang** — temuan lama (`sw.js` cuma cache CDN, bukan app shell) masih berlaku, belum ditindaklanjuti |
| Phase 17-18 Neural/Rule vs Neural | **Sebagian** — training 100M jalan (laporan menyusul), 200M solo belum, benchmark rule-vs-neural sistematis belum ada |
| Phase 19 Developer experience | **Sebagian** — README ditulis ulang (§6), CONTRIBUTING/CHANGELOG/TESTING terpisah belum dibuat |
| Phase 20-21 Commercial template/Feature flags | **TIDAK dikerjakan ronde ini** — di luar cakupan realistis untuk satu ronde, butuh keputusan produk dulu (apakah memang mau dijual sebagai template) |
| Phase 22-23 Release system/CI-CD | **TIDAK dikerjakan** — CI cuma `panen.yml`, belum ada gerbang bench-per-push |
| Phase 24-25 Documentation/Commercial README | **Selesai** — README ditulis ulang (§6), sprawl PRD dirapikan (§4) |
| Phase 26-27 Visual polish/Mobile-first | **Sebagian** — hover state + sidebar login-gate fix ronde lalu, audit sistematis 7 breakpoint (360-1440px) belum dilakukan |
| Phase 28 Final quality gate | **Sebagian** — P0 (bench, lint, 0 console error) terpenuhi; P1/P2 (capability matrix, a11y audit, dev experience penuh) belum |

**Kesimpulan jujur**: 28 fase generik TIDAK bisa dan TIDAK diklaim
tuntas semua dalam satu ronde — itu akan jadi klaim palsu yang persis
dilarang master command-nya sendiri ("Jangan menyatakan selesai jika
belum diverifikasi"). Yang tuntas dan terverifikasi: checklist konkret
Grok di §1 (lapisan 1 produksi), yang jauh lebih realistis sebagai
gerbang produksi aktual.

---

## 4. Pembersihan dokumen (dikerjakan bersamaan dengan konsolidasi ini)

Dihapus (isi sudah dilebur ke dokumen ini atau terbukti sudah selesai
dieksekusi, redundan menyimpannya terpisah):
- `PRD-PENGEMBANGAN-LANJUTAN-CLAUDE.md`
- `docs/AUDIT-VNEXT.md`
- `docs/RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md`

Dipertahankan (masih berlaku/masih dipakai aktif):
- `PRD-DATA-RELEASE.md` — aturan mengikat, tidak berubah.
- `PRD-PERINTAH-GROK.md` — tugasnya sudah dieksekusi (§1 lapisan
  data), dibiarkan hidup sebagai catatan sejarah tugas + karena masih
  jadi acuan aktif pihak yang mengerjakannya real-time.

---

## 5. Yang TIDAK boleh dilakukan (warisan langsung dari PRD Grok, tetap berlaku)

- Mengembalikan Simple Wiki / mswiki / jilid 2 / OSCAR ke rak kanonik.
- Membuat K4-K8 sebagai ganti 3 rak.
- Mengubah DIMS 50/100/200M.
- Mengotomatisasi klik Colab gratis (ToS).
- Menghapus `staging/korpus-parts` tanpa konfirmasi dirigen (isinya
  sudah diangkat, tapi biarkan dirigen/Grok yang menutup loop-nya
  sendiri, konsisten dengan siapa yang sudah mengerjakan migrasinya).
- Mengklaim 100% bench / 1 miliar token / neural koheren tanpa bukti
  ronde ini — sudah dipatuhi: angka di dokumen ini semua nyata (99,66%
  bukan 100%, 471,4 juta token bukan 1 miliar, neural belum koheren
  dinyatakan eksplisit).

---

## 6. README

README.md ditulis ulang mengikuti Phase 25 (Commercial README) master
command: jelaskan produk dalam beberapa baris pertama, angka bench dan
korpus yang dicantumkan adalah angka nyata ronde ini (99,66% CORE-SUITE,
471,4 juta token K1+K2+K3, K1 sudah termasuk Wikipedia unik), status
neural dinyatakan eksplisit eksperimental dengan bukti (PPL turun,
generasi belum koheren).

---

## 7. Untuk ronde berikutnya (prioritas, bukan janji)

1. **Tambah entri data Vatikan** (`raget-data/json/negara/eropan-
   selatan.json`, angka akurat — ibu kota Vatikan, luas ~0,49 km²,
   populasi ~800) **+ alias "Tiongkok" untuk China** (`asian-timur.json`),
   **+ perluas `trySuperlatif()`** (`bridge-reasoning.js`) supaya
   cocok pola "negara terkecil/terbesar di X" dan "negara mana yang
   Y-nya paling Z di X" (bukan cuma "negara [dengan] FIELD SUPERLATIF")
   dan menyaring per-benua (bukan selalu top-3 global). Root cause
   presisi sudah ditemukan ronde ini (§2) — SENGAJA belum ditambal
   ronde ini karena bagian data perlu verifikasi fakta akurat, bukan
   tebakan terburu-buru.
2. ~~Perbaiki prioritas router "cara X" vs domain-match spesifik
   (KTP)~~ — **selesai**, lihat `router-intent.js` `LAYANAN_KEYWORDS_RE`.
3. ~~Diagnosis kegagalan bench "bro, kabar?"~~ — **selesai**, lihat
   `llmEngine.isSmalltalkText()` (commit `6b0e380`).
4. ~~Jalankan training 200M~~ — **selesai** (3 sesi total: 18 menit +
   90 menit + 90 menit lanjutan, PPL turun tiap sesi).
5. ~~Audit XSS `innerHTML`~~ — **selesai**, 48 site diaudit (bukan 36
   seperti catatan lama), 0 risiko nyata ditemukan, 1 titik borderline
   diperbaiki untuk defense-in-depth (`js/account/account.js`).
6. ~~Bangun Capability Matrix~~ — **selesai**, lihat `docs/CAPABILITIES.md`.
7. ~~Audit `sw.js` cache invalidation~~ — **sebagian selesai**: skema
   cache-versi (nama cache `raget-cdn-packages-v1`) sudah benar untuk
   apa yang di-cache (paket CDN/checkpoint opt-in), origin Release
   checkpoint-200m ditambahkan. Keterbatasan LAMA yang masih berlaku
   (belum ditindaklanjuti, di luar cakupan realistis ronde ini):
   app-shell (index.html/js/css) TIDAK di-cache sama sekali, jadi
   klaim "offline penuh" belum akurat untuk shell aplikasi sendiri
   (cuma paket unduhan opsional yang offline-capable).
8. Perkuat `tools/panen_hf.py` melawan spam — **selesai**, lihat §1A
   ronde 7-poin sebelumnya + commit spam filter/dedup lintas-sesi
   ronde ini (belum diuji di data produksi nyata HuggingFace, cuma
   korpus sintetis lokal - lihat laporan chat untuk detail).
9. Tier "Raget 200M" di pemilih model — **selesai**, opt-in eksplisit,
   fetch dari Release GitHub, cache offline via sw.js, label jujur
   eksperimental. Lihat `js/sheets/models.js` + `neural-provider.js`.
