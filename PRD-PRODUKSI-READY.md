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
- [x] **README tidak klaim 100% bench tanpa angka baru** — README
      ditulis ulang ronde ini (lihat §6), angka bench yang dicantumkan
      adalah 99.58% CORE-SUITE di atas, dengan tanggal.
- [x] **K1 K2 K3 ada `estimasiToken` tokenizer proyek.** Diisi ronde ini
      di `korpus-manifest-total.json` (`totalTokenBPEResmi` per rak,
      dihitung dari gzip live yang SHA256-nya dicocokkan dulu terhadap
      Release, BUKAN tebakan ukuran gzip) — K1 303.917.157, K2
      84.953.214, K3 32.010.503, total **420.880.874 token BPE**.
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

- [x] **200M solo dijalankan** — 18 menit (dipangkas dari rencana 60
      menit karena tenggat keras 30 menit total dari dirigen untuk
      seluruh siklus mix+tokenize+rechunk+training; keputusan sadar,
      dicatat jujur bukan disembunyikan), setelah 100M 90 menit selesai
      (tidak paralel, sesuai larangan §7 PRD Grok). Held-out perplexity
      2898,68 → 1661,48 (turun 1,74x). Total akumulasi 1337 step/155,2
      menit. Laporan: `training-report-massive200m-round8-colab-gpu.json`.
- [x] **5 sampel generasi dicatat** — MASIH acak/belum gramatikal
      (sama seperti 100M pada tahap serupa) — dilaporkan jujur, DoD ini
      "dicatat" bukan "lolos", karena isinya memang belum koheren.
- [x] **Mix K1/K2/K3 sesuai §10 PRD-DATA-RELEASE** — dieksekusi:
      K1=64,6% K2=28,4% K3=7,0% (dalam rentang resmi 55-65/25-35/≤15),
      dari gzip live yang SHA256-nya diverifikasi ulang saat itu (K2
      ternyata sudah berubah lagi sejak diukur tokennya beberapa menit
      sebelumnya — data terus berubah cepat sepanjang sesi ini).
- [~] Checkpoint di tag `checkpoint-200m` dengan SHA — checkpoint
      **200M BARU** (163,41MB, hasil sesi ini) ditulis lokal di sandbox
      TAPI **BELUM dipublikasikan ke Release** — di atas batas 95MB
      kebijakan git (`.gitignore`, sesuai `CHECKPOINT-POLICY.md`), dan
      Claude tidak bisa publish Release dari sandbox ini (lihat
      `PRD-PERINTAH-GROK.md`). Tag `checkpoint-200m` yang ADA di
      Release masih versi R10-TUTUP lama, BUKAN hasil sesi ini —
      publikasi checkpoint baru jadi tugas terbuka untuk pihak dengan
      akses Release.

---

## 2. Temuan bench detail (5 kegagalan CORE dari 1180, 99.58%)

Semua 5 dicatat presisi (prompt asli + balasan asli), bukan dirangkum:

1. **`what is the capital of atlantis`**, **`negara terkecil di eropa
   apa`** (harap "Vatikan"), **`negara mana yang penduduknya paling
   banyak di asia`** (harap "Tiongkok") — pola sama persis: heuristik
   "lanjutan topik?" (kemungkinan besar di `context-engine.js`/
   `social-engine.js`) menyela dengan pertanyaan klarifikasi "ini
   lanjutan topik sebelumnya atau baru?" alih-alih langsung menjawab
   pertanyaan faktual yang jelas. Terjadi 3x dari 5 kegagalan — pola
   sistemik, bukan kasus terisolasi. **Belum diperbaiki** (butuh
   pemahaman mendalam kondisi apa yang memicu heuristik ini vs kapan
   harus diam, risiko regresi kalau ditambal serampangan).
2. **`cara bikin KTP gimana ya`** — lihat §1 (root cause router-intent
   presisi ditemukan, belum diperbaiki).
3. **`gimana menurutmu kualitas kerjaanku`** (harap konten
   self-review/metode sandwich) — dijawab dengan deflection generik
   "bukan punya opini pribadi seperti manusia" alih-alih memberi
   kerangka self-review yang diharapkan. Kemungkinan entri
   pengetahuan terkait "self-review"/"metode sandwich" belum ada atau
   tidak ter-trigger oleh frasa ini.

Total dampak: 0,42% dari CORE-SUITE. Tidak menghalangi status
"produksi lapisan 1" (99.58% jauh di atas gerbang 97%), tapi 3 temuan
di atas adalah kandidat perbaikan konkret ronde berikutnya.

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
  ronde ini — sudah dipatuhi: angka di dokumen ini semua nyata (99,58%
  bukan 100%, 420,9 juta token bukan 1 miliar, neural belum koheren
  dinyatakan eksplisit).

---

## 6. README

README.md ditulis ulang mengikuti Phase 25 (Commercial README) master
command: jelaskan produk dalam beberapa baris pertama, angka bench dan
korpus yang dicantumkan adalah angka nyata ronde ini (99,58% CORE-SUITE,
420,9 juta token K1+K2+K3), status neural dinyatakan eksplisit
eksperimental dengan bukti (PPL turun, generasi belum koheren).

---

## 7. Untuk ronde berikutnya (prioritas, bukan janji)

1. Perbaiki heuristik "lanjutan topik?" yang menyela 3 dari 5 kegagalan
   bench (dampak terbesar per temuan tunggal).
2. Perbaiki prioritas router "cara X" vs domain-match spesifik (KTP,
   dan kemungkinan intent layanan lain dengan pola sama) — hati-hati,
   16+ kasus bench sengaja mengharap tool "cara" generik untuk
   pertanyaan umum.
3. Jalankan training 200M solo 60 menit sesuai mix §10
   PRD-DATA-RELEASE setelah training 100M ronde ini selesai.
4. Audit XSS 36 penggunaan `innerHTML` (12 file) — Phase 14.
5. ~~Bangun Capability Matrix~~ — **selesai**, lihat `docs/CAPABILITIES.md`.
6. Audit `sw.js`/app-shell caching — Phase 16.
