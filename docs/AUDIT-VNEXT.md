# Rategoan vNext Audit

Status: **PHASE 0 — BASELINE AUDIT**, disusun 2026-09-01 mengikuti
`RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md` (diberikan dirigen, hasil
kolaborasi dengan ChatGPT). Digabung dengan temuan audit Claude ronde ini
(lihat `PRD-PENGEMBANGAN-LANJUTAN-CLAUDE.md` dan `PRD-PERINTAH-GROK.md`
untuk detail teknis penuh setiap temuan — dokumen ini merangkum ke
format Phase 0 yang diminta).

**Sesuai perintah master command: STOP setelah dokumen ini. Jangan
lanjut Phase 1 (Architecture Contract) sebelum dirigen memverifikasi
audit ini dan bilang "LANJUT PHASE 1".**

Kejujuran metodologi: bagian di bawah dibedakan antara **terverifikasi
langsung ronde ini** (grep/API/eksekusi nyata, dengan bukti), **diwarisi
dari laporan ronde sebelumnya** (dipercaya tapi tidak diverifikasi ulang
hari ini), dan **belum diperiksa** (ditandai eksplisit, bukan ditebak).

---

## Current Architecture

```
UI (index.html + js/{core,state,ui,chat,history,collection,account,system,utils})
  |
  +-- js/ai/ai.js  --> raget/raget-agents (router masuk akal - planner/opener/tools)
  |
  +-- [TEMUAN] js/chat/chat.js, js/chat/chatsearch.js, js/collection/collection.js
  |     mengimpor LANGSUNG dari raget-retrieval / raget-memory / raget-database,
  |     tidak lewat js/ai/ai.js sebagai satu pintu masuk (diverifikasi via grep
  |     ronde ini: `grep -rl "raget-retrieval\|raget-memory\|raget-database" js/`)
  |
Intelligence (raget/)
  +-- raget-agents/    - planner, tools, world-context, dataries-registry
  +-- raget-llm/        - rule engine (jawaban template/deterministik) + neural (opsional/experimental)
  +-- raget-retrieval/  - pencarian korpus
  +-- raget-memory/     - fakta/preferensi user
  +-- raget-database/   - storage lapisan bawah
  +-- raget-data/        - korpus + 21+ domain JSON
  +-- raget-devlog/      - riwayat pengembangan + persona + laporan training
  +-- raget-tools/       - skrip training/lint/bench/publish (Node + Python)

Sub-app semi-independen: fitur/pitutur/ (PWA sendiri, index.html+js+css sendiri)
Modul pendukung flat di root: vault/ (integrasi lampiran: calendar, email,
  evernote, notion, ocr, pdf, translate, web, whatsapp), utils/ (helper kecil)

Data pipeline luar-app: tools/panen_hf.py (GitHub Actions, panen HF),
  raget-tools/train-massive-colab-gpu.py (training neural, CLI/Colab/lokal)
```

**Neural bukan satu-satunya identitas** — dikonfirmasi: rule engine
(`raget-llm` non-neural, template/retrieval-based) adalah jalur produksi
utama; neural checkpoint (`massive50m/100m/200m`) berlabel eksperimental
di semua dokumentasi yang ditemukan (`README.md`, `CHECKPOINT-POLICY.md`).

## Strengths

- **Local-first nyata**: tidak ada dependency API AI eksternal untuk
  fitur inti (rule engine jalan penuh di browser).
- **Disiplin data governance sudah ada**: `PRD-DATA-RELEASE.md` (kategori
  tertutup, skema manifest wajib, SHA256 3-gerbang) — persis pola yang
  diminta Phase 13 master command, sudah berjalan sebelum command ini
  diberikan.
- **Devlog granular**: tiap ronde pengembangan tercatat di
  `raget/raget-devlog/jsonl/keputusan.jsonl` dengan alasan (why), bukan
  cuma changelog what — memudahkan audit historis (termasuk audit ini).
- **Kebijakan checkpoint besar sudah dewasa**: `CHECKPOINT-POLICY.md`
  (Release asset utk >100MB, bukan Git LFS) mencegah masalah repo bloat
  yang umum di proyek ML.
- **Lint gate 0-error**: `raget/raget-tools/lint-check.mjs` (syntax check
  247 file + ESLint correctness-only) LOLOS bersih, cuma 36 warning
  `no-unused-vars` (diverifikasi ronde ini, lihat P2 di bawah).

## Risks

- **[P0] Gerbang kualitas (bench) sempat rusak diam-diam** —
  `run-bench.mjs` (1190 kasus regresi) gagal 100% sebelum diperbaiki
  ronde ini karena flow login berubah (wajib password) tapi skrip bench
  tidak diperbarui. Tidak ada yang mendeteksi sampai diaudit langsung —
  artinya klaim pass-rate dari ronde-ronde sebelumnya (sejak login
  password diwajibkan) **tidak bisa dipercaya begitu saja** tanpa
  re-run. Sudah diperbaiki (`raget/raget-tools/run-bench.mjs` sekarang
  mengisi `#login-password`), tervalidasi 60/60 kasus 100% pass di
  sampel — bench penuh 1190 kasus belum sempat dijalankan (kontensi CPU
  dengan training background ronde ini).
- **[P1] Boundary arsitektur UI->Intelligence bocor** — temuan grep di
  atas: 3 file UI mengimpor modul intelligence langsung, bukan lewat
  satu pintu. Konsekuensi konkret belum diukur (belum tentu bug — bisa
  jadi keputusan desain sadar untuk kasus tertentu seperti pencarian
  cepat), tapi bertentangan dengan kontrak arsitektur yang diminta
  master command Phase 1 — perlu keputusan sadar (biarkan dengan alasan
  tertulis, atau refactor).
- **[P1] ~329 juta token korpus bersih, sudah di-checksum, nganggur** —
  di branch `staging/korpus-parts` (253 commit di belakang main, tidak
  pernah di-merge), belum masuk Release manapun. Detail penuh:
  `PRD-PERINTAH-GROK.md` Bagian B. Blocker untuk gerbang 1 miliar token
  (`korpus-manifest-total.json` saat ini 750,7 juta/1 miliar).
- **[P2] Data staging HF (`panen-madlad400-id`) belum direview kualitas**
  — 150.000 dokumen web-crawl terfilter otomatis, belum ada sample-review
  manusia/agen untuk memastikan bukan spam/boilerplate. Detail:
  `PRD-PERINTAH-GROK.md` Bagian A.
- **[P2] Dokumentasi kontradiktif ditemukan & sudah dibersihkan ronde
  ini** — 6 file di `docs/` (STATUS-FASE-A-A4, STATUS-KORPUS-AMAN-RAPI,
  RENCANA-DATA-AMAN-200M-400M, MIX-TRAINING-SEIMBANG, STRUKTUR-KORPUS,
  STATUS-KORPUS-LISENSI) memakai skema penamaan Release lama (`A1..A17`)
  yang sudah diganti total oleh `PRD-DATA-RELEASE.md`, salah satunya
  bahkan eksplisit melarang sumber (OSCAR) yang justru sekarang dipanen
  aktif oleh `tools/panen_hf.py` — kontradiksi kebijakan tanpa catatan
  keputusan. **Sudah dihapus ronde ini** (redundan/menyesatkan,
  dikonfirmasi isinya sudah sepenuhnya tercakup `PRD-DATA-RELEASE.md`
  §9-10 sebelum dihapus).

## P0 Issues

1. Bench 1190-kasus belum di-run penuh pasca-perbaikan — pass-rate
   resmi terbaru **tidak diketahui**, cuma tervalidasi sampel 60 kasus
   (100%). **Aksi**: jalankan `run-bench-chunked.mjs` penuh di sesi
   tanpa kontensi CPU (training tidak sedang berjalan).

## P1 Issues

1. Boundary UI->Intelligence bocor di 3 file (lihat Risks).
2. Korpus 329 juta token nganggur di branch orphan — blocker gerbang
   1 miliar token, butuh eksekusi di luar sandbox (`PRD-PERINTAH-GROK.md`).
3. Neural checkpoint 100M: PPL turun konsisten (1335->641 ronde lalu,
   training lanjutan 90 menit sedang berjalan background saat audit ini
   ditulis) tapi generasi masih belum gramatikal, `fullEpochsCompleted`
   masih 0 di semua laporan sejauh ini — evaluasi kualitatif (bukan
   cuma PPL) belum jadi bagian standar tiap laporan training.

## P2 Issues

1. 36 warning `no-unused-vars` (ESLint) — tidak menggagalkan gerbang
   lint, tapi utang kecil yang menumpuk.
2. Data madlad400-id staging belum di-review kualitas (lihat Risks).
3. Service worker (`sw.js`) HANYA meng-cache asset CDN (jsdelivr,
   huggingface) — TIDAK meng-cache app shell (index.html/js/css). Belum
   jelas apakah ini keputusan sadar (hindari masalah cache-stale app
   shell) atau app sebenarnya tidak offline-capable untuk shell-nya
   sendiri meski `manifest.webmanifest` menyiratkan PWA installable.
   Belum diverifikasi mana yang benar — **Phase 16 kandidat kuat**.
4. 36 penggunaan `innerHTML` di `js/` (12 file) — ada `escapeHtml()`
   dipakai di sebagian (`js/collection/collection.js`), TAPI cakupan
   penuh (36 lokasi, semua file) belum diaudit satu-satu untuk XSS.
   **Belum diperiksa mendalam** — ini persis lingkup Phase 14, sengaja
   tidak diburu-buru diaudit di Phase 0 ini.
5. Fitur "Jelajah Dunia"/travel yang dulu dibangun lewat banyak ronde
   (lihat riwayat `raget-devlog/sejarah/10-travel-integrasi.js`) sudah
   tidak ada di `fitur/` maupun sidebar aplikasi saat ini — status
   sengaja/tidak sengaja belum dikonfirmasi (lihat
   `PRD-PENGEMBANGAN-LANJUTAN-CLAUDE.md` Fase 6).

## Technical Debt

- Dokumentasi historis (`docs/`) sempat (sebelum ronde ini) berisi 6
  file yang saling merujuk sebagai "rujukan final" padahal sudah usang
  — pola "dokumen lama menjadi otoritas sendiri" berisiko terulang kalau
  tidak ada proses review dokumen berkala.
- Skrip kualitas (`run-bench.mjs`) tidak punya smoke-test sendiri untuk
  memverifikasi skrip itu sendiri masih bisa lolos login — baru
  ketahuan rusak lewat audit manual, bukan otomatis.
- `PENGALI_LUMBUNG_UTAMA`-style parameter implisit sempat jadi pola di
  `tools/panen_hf.py` sebelum diganti env var eksplisit ronde lalu —
  pola "angka ajaib di kode" perlu terus diwaspadai di skrip lain.

## Product Gaps

- Tidak ada **Capability Matrix** terdokumentasi (Phase 6 master
  command) — status Stable/Experimental/Browser-dependent per fitur
  cuma tersebar implisit di README, belum satu tabel rujukan.
- Tidak ada **Memory inspect/edit/delete UI** yang terverifikasi ronde
  ini secara langsung (panel "Fakta tentang saya" pernah dibangun per
  devlog history — belum diverifikasi ulang apakah masih berfungsi
  penuh sesuai Phase 3 master command: inspect/search/edit/delete/clear
  all/category/timestamp).
- Tidak ada **retrieval benchmark reproducible** (hit@1/hit@3/MRR/
  recall/precision/latency) yang dijalankan rutin — pernah dibangun per
  devlog history untuk domain tertentu (country), cakupan penuh semua
  domain belum diverifikasi.
- README belum mengikuti struktur "jelaskan produk dalam 10 detik"
  ala Phase 25 (Why Rategoan / Demo / Features / Architecture singkat
  di atas) — belum diperiksa detail, kandidat Phase 25.

## Recommended Roadmap

Menggabungkan prioritas master command (`STABILITY > ARCHITECTURE >
QUALITY > UX > COMMERCIALIZATION > NEURAL`) dengan temuan konkret ronde
ini:

1. **Jalankan bench 1190 penuh** (P0) — validasi ulang semua klaim
   kualitas sebelum melangkah lebih jauh.
2. **Putuskan boundary UI->Intelligence** (P1, Phase 1 master command)
   — refactor 3 file yang bocor, atau dokumentasikan sengaja dengan
   alasan tertulis.
3. **Selesaikan Bagian B `PRD-PERINTAH-GROK.md`** (publikasi 329 juta
   token korpus) — buka jalan ke gerbang 1 miliar token tanpa panen
   data baru.
4. **Bangun Capability Matrix** (`docs/CAPABILITIES.md`, Phase 6) —
   murah, memberi kejelasan status tiap fitur untuk audit-audit
   berikutnya.
5. **Lanjutkan training neural sampai fullEpochsCompleted>=1** dengan
   evaluasi kualitatif eksplisit tiap laporan (P1, Fase 3
   `PRD-PENGEMBANGAN-LANJUTAN-CLAUDE.md`).
6. Baru pertimbangkan Phase 7-27 (UX restructure, onboarding,
   commercial template mode, dst.) setelah 1-5 solid — sesuai prinsip
   master command "AUDIT -> PRESERVE -> IMPROVE", bukan lompat ke
   polish/komersialisasi sebelum fondasi P0/P1 beres.

---

**STOP. Menunggu verifikasi dirigen sebelum lanjut Phase 1**, sesuai
`RAGETOAN_vNEXT_MASTER_DEVELOPMENT_COMMAND.md`.
