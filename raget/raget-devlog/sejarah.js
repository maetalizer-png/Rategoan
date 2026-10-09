export const SEJARAH = Object.freeze([
  {
    "id": "genesis",
    "judul": "Genesis — dari dump proyek sebelumnya ke otak Raget",
    "tanggal": "2026-08-13",
    "komit": [
      "4c53f23",
      "0b22581",
      "6a69d61",
      "694f7f5",
      "ed91dddd",
      "8f9e21a",
      "cd2dc05",
      "587ddae"
    ],
    "ringkasan": "Titik nol repo Rategoan: commit awal, pemisahan folder css/js, modularisasi JavaScript ke ES6 modules, dan migrasi CSS ke namespace tunggal --rg-*. Pertengahan hari yang sama, dump proyek sebelumnya (proyek lain, tidak terkait) diganti total dengan mesin AI Raget sesuai spesifikasi rule-based/template lokal, lalu langsung di-upgrade ke \"Raget 1.0\" dengan intent router lengkap.",
    "fitur_baru": [
      "Struktur folder css/ dan js/ terpisah",
      "Modularisasi JavaScript ES6 modules",
      "Namespace CSS tunggal --rg-*",
      "Mesin AI Raget rule-based/template (bukan LLM, tanpa API key)",
      "Raget 1.0: intent router lengkap, tools dasar, personalisasi, feedback loop"
    ],
    "bug_ditutup": [],
    "kpi": {
      "catatan": "Belum ada pengukuran K/V/bench baku di tahap ini — mendahului dataset/bench.json."
    }
  },
  {
    "id": "jilid-2-3",
    "judul": "Jilid 2-3 — aksi cepat, matematika bahasa natural, factoid QA",
    "tanggal": "2026-08-13",
    "komit": [
      "a9b340c",
      "4f8feb5"
    ],
    "ringkasan": "Dua jilid awal yang membangun kerangka interaksi chat Raget: tombol aksi cepat di balasan AI, formatter markdown, dan intent terstruktur (Jilid 2); lalu kalkulator bahasa natural, factoid QA pertama, fakta yang diajarkan pengguna, dan pengurangan noise jawaban (Jilid 3).",
    "fitur_baru": [
      "Aksi cepat di balasan AI (Salin/Baca/Bagikan, cikal-bakal msg-actions)",
      "Formatter markdown balasan",
      "Intent terstruktur (router awal)",
      "Matematika bahasa natural (\"berapa 12 kali 8\")",
      "Factoid QA pertama",
      "Fakta yang diajarkan pengguna (\"ingat ya, ...\")",
      "Pengurangan noise pada jawaban"
    ],
    "bug_ditutup": [],
    "kpi": {
      "catatan": "Mendahului dataset/bench.json dan quality.js — belum ada Q/K/V terukur."
    }
  },
  {
    "id": "dataries-fase1",
    "judul": "Dataries Fase 1 — data negara/kota/sapaan dunia",
    "tanggal": "2026-08-14",
    "komit": [
      "4295f0a"
    ],
    "ringkasan": "Kelahiran folder dataries/: dataset negara, kota, dan sapaan dunia pertama, disambungkan ke Raget lewat bridge factoid. Ini adalah fondasi arsitektur yang sampai sekarang masih dipakai — bridge terpisah (kini ai-agent/dataries-bridge.js) sebagai jalur khusus jawaban berbasis data terstruktur, terpisah dari mesin template rategoan-llm.",
    "fitur_baru": [
      "dataries/ dengan data negara, kota, sapaan",
      "Bridge factoid pertama (cikal-bakal dataries-bridge.js)"
    ],
    "bug_ditutup": [],
    "kpi": {
      "catatan": "Fondasi arsitektur dataries yang tumbuh jadi 19 kategori & 1.856 entri (per Trisula Final v2)."
    }
  },
  {
    "id": "jilid-5-6",
    "judul": "Jilid 5+6 — disiplin dataries, dataries full stack",
    "tanggal": "2026-08-14",
    "komit": [
      "888b13b",
      "fa9781f"
    ],
    "ringkasan": "Perluasan dataries besar-besaran: languages, wisata, tokoh, makanan, sains, olahraga, marplace, paluang, lingo — sembilan kategori baru sekaligus, plus disiplin skema data yang konsisten. Dilanjutkan (\"Lanjut Jilid 6\") dengan resolver sains/olahraga dan genapkan bench +15 kasus.",
    "fitur_baru": [
      "dataries/languages, wisata, tokoh, makanan, sains, olahraga, marplace, paluang, lingo",
      "Resolver sains & olahraga",
      "Disiplin skema dataries (metadata konsisten antar kategori)"
    ],
    "bug_ditutup": [],
    "kpi": {
      "bench": "+15 kasus baru"
    }
  },
  {
    "id": "fondasi-kualitas",
    "judul": "Bagian A-F — meta-knowledge, rumus kecerdasan, resolver terpadu",
    "tanggal": "2026-08-14",
    "komit": [
      "edc188c",
      "4a8d5fa",
      "b7e64bd",
      "871cf23"
    ],
    "ringkasan": "Empat bagian berurutan yang membangun kerangka kualitas jawaban pertama: dataset meta-knowledge dan scorer.js berbasis TF-IDF/cosinus (A); rumus kecerdasan dengan answer-rules, formatByType, dan deteksi tipe jawaban (B); polish kasus nyata — perbaikan bug kabar, sapaan mirror, makanan, opener factoid (C); dan penambahan folder dataries baru plus resolver serta bench terpadu (D+E+F). Ini adalah cikal-bakal langsung dari quality.js (Q = 0.35A+0.25K+0.15U+0.15D+0.10V) yang baru resmi lahir di Jilid 13.",
    "fitur_baru": [
      "scorer.js — TF-IDF + cosine similarity",
      "answer-rules + formatByType + deteksi tipe jawaban (ANSWER_TYPES)",
      "Resolver terpadu lintas kategori dataries",
      "dataset/bench.json versi terpadu pertama"
    ],
    "bug_ditutup": [
      "Bug kabar (berita) salah format",
      "Sapaan mirror tidak konsisten",
      "Bug makanan",
      "Opener factoid repetitif"
    ],
    "kpi": {
      "catatan": "Fondasi ANSWER_TYPES yang kelak jadi komponen V (Variasi struktur) di quality.js."
    }
  },
  {
    "id": "jilid-11-12",
    "judul": "Jilid 11-12 — mesin penalaran, flywheel v2, 100% local-first",
    "tanggal": "2026-08-14",
    "komit": [
      "bd54b25",
      "90c118e",
      "c1173af"
    ],
    "ringkasan": "Jilid 11 menaikkan kualitas jawaban lewat mesin penalaran dan \"flywheel v2\" (siklus belajar-dari-feedback), diikuti perbaikan 2 kasus bench yang salah asumsi. Jilid 12+ adalah deklarasi arsitektur eksplisit: \"killer features 2026\" dengan socket architecture dan komitmen 100% local-first — prinsip yang sejak saat itu jadi aturan wajib di setiap ronde berikutnya (tanpa API key, tanpa server, tanpa console/eval).",
    "fitur_baru": [
      "Mesin penalaran (reasoning engine) generasi awal",
      "Flywheel v2 — siklus belajar dari feedback pengguna",
      "Deklarasi arsitektur 100% local-first (socket architecture)"
    ],
    "bug_ditutup": [
      "2 kasus bench Jilid 11 dengan asumsi jawaban yang salah"
    ],
    "kpi": {
      "catatan": "Titik di mana \"100% lokal, tanpa API key\" resmi jadi prinsip wajib proyek."
    }
  },
  {
    "id": "produkisasi",
    "judul": "Vault Lengkap, Jalanin v1, Produkisasi, Konten",
    "tanggal": "2026-08-14",
    "komit": [
      "5fcc039",
      "3f9e336",
      "fcb41e4",
      "3b80aba",
      "63eeee6"
    ],
    "ringkasan": "Empat bagian berturutan yang melahirkan dua pilar besar proyek: Vault Lengkap (impor PDF, Notion, Evernote, WhatsApp — semuanya lokal, sebagian tetap stub jujur sampai sekarang) dan Jalanin v1, PWA standalone \"jelajah dunia\" offline yang jadi cikal-bakal travel/. Ditutup dengan sisi non-teknis: starter kit, lisensi, skrip demo (Produkisasi), dan 7 skrip TikTok build-in-public (Konten). Satu fix bench pra-existing menyusul di luar keempat bagian ini.",
    "fitur_baru": [
      "Vault: impor PDF, Notion, Evernote, WhatsApp (parsing sebagian stub, jujur soal keterbatasan)",
      "Jalanin v1 — PWA standalone jelajah dunia offline",
      "Starter kit, lisensi, skrip demo 60 detik",
      "7 skrip TikTok build-in-public"
    ],
    "bug_ditutup": [
      "1 kasus bench pra-existing (di luar cakupan Bagian 1-4)"
    ],
    "kpi": {
      "catatan": "Jalanin lahir di sini; kelak dipindah & dimodularisasi penuh di ronde Travel-Integrasi dan Restrukturisasi Mega Final."
    }
  },
  {
    "id": "jilid-13",
    "judul": "Perintah Jilid 13 Final — Kualitas + Struktur",
    "tanggal": "2026-08-14",
    "komit": [
      "24a4cd8",
      "bbba536",
      "05a0a33",
      "81e4ffc",
      "97c3a17"
    ],
    "ringkasan": "Satu eksekusi berurutan 1-9 di atas mesin Raget: DRY teks (utils/text.js), retrieval satu pintu (raget-retrieval/retrieve.js membungkus scorer.js), context stack (memory-context.js, entityStack(3)), planner dengan fallback berjenjang, modul kualitas resmi (quality.js, Q = 0.35A+0.25K+0.15U+0.15D+0.10V), migrasi storage besar ke IndexedDB (idb-gateway.js), UX nilai harian (TTS toggle, bedah_url nyata, briefing harian), dan bench +20. Tiga bug wrong-answer ditemukan dan ditutup di tengah jalan.",
    "fitur_baru": [
      "utils/text.js — sumber tunggal STOPWORDS, hashText, pickVariant, meaningfulWords, detectTone",
      "raget-retrieval/retrieve.js — retrieval satu pintu (rank()/best(), ambang augmentasi 0.35 & daftar 0.25)",
      "raget-memory/memory-context.js — entityStack(3) + relationLast",
      "ai-agent/planner.js — fallback berjenjang berdasar skor keyakinan",
      "ai-agent/quality.js — Skor Kualitas Q = 0.35A+0.25K+0.15U+0.15D+0.10V",
      "raget-database/idb-gateway.js — gateway IndexedDB async dengan guard kuota",
      "TTS toggle (default OFF), bedah_url nyata via web/read-web.js, briefing harian, tool \"ringkas hari saya\""
    ],
    "bug_ditutup": [
      "\"terima kasih ya\" salah nangkep sebagai bahasa Hungaria (fuzzyEq substring tanpa batas panjang)",
      "\"apa ibukota atlantis\" nyasar ke jawaban Selandia Baru (riwayat chat ikut jadi korpus TF-IDF)",
      "\"sebutkan manfaat olahraga\" dijawab manfaat pemrograman modular (matchFewshot salah tangkap, ambang dinaikkan ke 0.5)",
      "Bonus: agent-tools.js memanggil hashText() tanpa impor — cara()/ide() selalu crash ReferenceError"
    ],
    "kpi": {
      "bench": "193→213 kasus, 181/193 (93.8%) → 204/213 (95.8%)",
      "quality": "Q=58 (A50/K24/U98/D100/V50) — baseline resmi pertama",
      "localStorage": "64.0 KB / 5 kunci ringan (setelah 213 chat)",
      "idb": "Impor 300 chunk vault → localStorage 97 bytes (chunk 100% pindah ke IndexedDB)"
    }
  },
  {
    "id": "jilid-14",
    "judul": "Perintah Mega Jilid 14 — Otak + Fitur + Speed + Journey",
    "tanggal": "2026-08-14",
    "komit": [
      "024d64f",
      "77b5391",
      "e9fcebe",
      "ac77b7b",
      "1d8b34b",
      "464cddf",
      "9388cc6",
      "4c958e3"
    ],
    "ringkasan": "Ronde besar 1-6: dataries jadi sumber fallback planner (OTAK); kuis+streak, chips pintar, onboarding v2, export catatan (FITUR HARIAN); lazy-load dynamic import, idle warmup, LRU cache di retrieve() (SPEED); multi-intent, tool temporal, slang, \"X vs Y\", quick chips (CERDAS); badge streak, briefing+kuis, kartu berbagi, mode hemat (RETENSI); ditutup Journey audit — Playwright sebagai pemilik+user, 3 persona berurutan, 33/33 langkah lulus. Dua bug nyata ditemukan & ditutup di tengah jalan.",
    "fitur_baru": [
      "dataries sebagai sumber fallback planner (ambang 0.30), tool fungsi()/tujuan()/penyebab()",
      "dataries/quiz.js — kuis 1 soal PG + streak (raget_streak)",
      "Chips empty-state berputar per jam, onboarding v2 interaktif 3-tap",
      "ai-agent/lazy-modules.js — dynamic import OCR/PDF/Notion/Evernote/WhatsApp/translator",
      "Idle warmup 2 region dataries, LRU cache 50 entri di retrieve()",
      "Multi-intent \" dan \" (maks 2), tool temporal (\"berapa hari lagi X merdeka\"), \"X vs Y\", quick chips kontekstual",
      "Badge streak drawer, tool \"bagikan kartu <negara>\", mode hemat (raget_hemat), guard emoji≤1 & factoid≤3 kalimat"
    ],
    "bug_ditutup": [
      "Onboarding v2 tidak pernah tampil — onboard.maybeShow() tidak dipanggil ulang pasca-login async",
      "guardFactoidSentences() merusak jawaban terstruktur (heading+bullet) — sekarang mendeteksi baris - / # dan melewatinya utuh",
      "Bonus: \"ingat apa yang saya catat tentang X\" salah tertangkap sebagai fakta baru, bukan pencarian"
    ],
    "kpi": {
      "quality": "Q=58→67 (A70/K30/U98/D100/V50, n per komponen: A=0,K=80,U=230,D=43,V=3)",
      "bench": "204/213 (95.8%) → 222/231 (96.1%)",
      "boot": "13ms (target <800ms)",
      "localStorage": "65.5KB/5 kunci → 72.5KB/8 kunci",
      "journey": "33/33 langkah, 3 persona, rata-rata 4.7/5 (kejujuran 5/5 konsisten)",
      "diffKerangka": "173 baris (di atas target 100, dengan alasan terdokumentasi)"
    }
  },
  {
    "id": "travel-integrasi",
    "judul": "Travel-Integrasi — Jalanin masuk ke Rategoan, app.js dipecah 16 modul",
    "tanggal": "2026-08-14",
    "komit": [
      "4dc9b2b",
      "e54e400"
    ],
    "ringkasan": "Jalanin (produk travel offline) dibuka langsung dari tombol + Rategoan lewat kartu \"Jelajah Dunia\" (sheet iframe same-origin). Seluruh app.js 980-baris Jalanin dipecah jadi 16 modul JS + 3 modul CSS di export/travel/, dengan 4 fitur baru: sub-mode Wisata/Kuliner di Jelajah, kartu iklim berbasis region, jurnal catatan per rencana trip, dan tombol instal PWA jujur (hanya tampil saat beforeinstallprompt benar-benar tersedia).",
    "fitur_baru": [
      "Kartu \"Jelajah Dunia\" di tombol + Rategoan → sheet iframe same-origin",
      "app.js 980→64 baris (HANYA init+navigasi); 16 modul JS + 3 modul CSS",
      "Sub-mode Negara | Wisata | Kuliner di Jelajah",
      "Kartu iklim per region (features/climate.js)",
      "Jurnal catatan per rencana trip (features/journal.js, travel_journal)",
      "Tombol instal PWA jujur (features/install.js)"
    ],
    "bug_ditutup": [],
    "kpi": {
      "smoke": "6/6 checklist inti + 8 pemeriksaan fitur baru = 14/14",
      "appJs": "980 → 64 baris",
      "diffKerangka": "40 baris di sisi Rategoan (index.html +26, attach.js +14)",
      "boot404": "2 → 0 (jalur impor dataries tunggal)"
    }
  },
  {
    "id": "restrukturisasi-mega-final",
    "judul": "Restrukturisasi Root, Evaluasi Otak & Polesan Antarmuka",
    "tanggal": "2026-08-14",
    "komit": [
      "9274365",
      "7792372",
      "506fd79",
      "bd844ff",
      "c77a006",
      "5ee966c",
      "241605e"
    ],
    "ringkasan": "Enam bagian: pindahkan export/travel/ ke travel/ di root lalu kelompokkan 11 folder modul vault lama ke satu vault/ (Bagian 1-2); naikkan kualitas jawaban Raget lewat dedup 7 entri negara ganda, guard entitas pendek, 10 pola alias/keyword, pola lokasi geografis baru, dan kenaikan probabilitas kekayaan jawaban faktoid (Bagian 3, tiga commit berurutan); tiga fitur baru Jalanin — Profil Saya, konverter mata uang penuh, paket offline opt-in network-first (Bagian 4); lima perbaikan UI/UX U1-U5 plus fix transisi keyboard patah-patah (Bagian 5).",
    "fitur_baru": [
      "travel/ dipindah ke root; vault/ mengelompokkan pdf, notion, evernote, whatsapp, calendar, email, reminders, ocr, translate, web, export",
      "Dedup 7 entri negara ganda (Polandia, Ceko, Hungaria, Slowakia, Swiss, Austria, Kamerun): 170→163 entri unik",
      "Guard entitas pendek (containment-match butuh min. 3 karakter)",
      "10 pola alias/keyword baru + pola lokasi geografis (\"X terletak dimana\")",
      "Fallback dataries planner diperluas: negara + sains + olahraga (ambang 0.30)",
      "travel/js/views/profil.js — Profil Saya (streak 30 hari, akurasi, 6 badge)",
      "travel/js/features/currency.js — konverter mata uang penuh (21 kurs)",
      "travel/js/features/offline-pack.js — paket offline opt-in, network-first",
      "U1-U5: nol emoji UI, \"Jelajah Dunia\" navigasi penuh, chip empty-state diperbaiki, sheet Lampirkan direstruktur, header Settings sticky",
      "Bonus: debounce visualViewport.resize agar transisi keyboard tidak patah-patah"
    ],
    "bug_ditutup": [
      "7 entri negara terduplikasi di region berbeda",
      "Kueri 2 huruf (\"as\",\"uk\") salah cocok via substring tanpa batas panjang"
    ],
    "kpi": {
      "quality": "Q=67→77 (K:30→56% n=96, V:50→83% n=5)",
      "bench": "222/231 (96.1%) → 233/243 (95.9%)",
      "smokeTravel": "14/14 → 24/24 (+10)",
      "smokeVault": "13/13",
      "cache": "hit-rate kueri identik-berulang ~40-50% setelah normalisasi key (lowercase+buang tanda baca)"
    }
  },
  {
    "id": "trisula-ultra",
    "judul": "Trisula Ultra — Koleksi, Otak Raget, dan Jelajah Dunia",
    "tanggal": "2026-08-14",
    "komit": [
      "4bfa603",
      "69c3489",
      "82498f3",
      "1c6b634"
    ],
    "ringkasan": "Tiga bagian besar digabung satu ronde: Koleksi — perpustakaan pribadi baru di sidebar dengan 13 sub-fitur (tab Semua/Pesan/Catatan/Artefak, pencarian fuzzy Levenshtein, pin/arsip, tag; keyspace raget_collection); delapan kemampuan penalaran baru untuk Raget (superlatif, agregasi region, reverse lookup, konversi satuan/mata uang, penalaran tanggal, anafora, fewshot lokal) plus dataset yang bertambah; empat belas fitur baru Jalanin (countdown, leaderboard kuis, TTS sapaan, favorit, bandingkan negara, dll). Didahului fix cepat 4bfa603 (hapus badge api/angka sidebar, perjelas alur simpan Trip).",
    "fitur_baru": [
      "Koleksi: bookmark sidebar, tab Semua/Pesan/Catatan/Artefak, pencarian fuzzy, tag, pin/arsip, tool \"cari koleksi\"",
      "Superlatif, agregasi region, reverse lookup (ibukota/mata uang→negara), konversi satuan & mata uang, penalaran tanggal, anafora lanjutan, fewshot lokal",
      "Countdown perjalanan, papan skor kuis, TTS otomatis Sapaan, chip terakhir-dilihat, bandingkan negara, favorit/bintang, detail badge, preset konverter, filter kota Wisata, ekspor jurnal Markdown"
    ],
    "bug_ditutup": [
      "Navigasi sidebar sempat memblokir klik — drawer kini ditutup dulu sebelum aksi",
      "Pola reverse lookup & pencarian sejarah tidak cocok (7/7 re-tes lolos setelah fix)"
    ],
    "kpi": {
      "bench": "273/283 (96.5%)",
      "K": "71% (n=24, sesi bersih) — turun ke 53-58% di sesi kumulatif campuran (jadi alasan lahirnya measure-kv.mjs di ronde berikutnya)",
      "V": "67% (n=4, sampel kecil — ditandai \"pantau\")",
      "boot": "Rategoan 399ms, Jalanin 394ms",
      "dataries": "290/350 target (83%) — kualitas dijaga di atas kuantitas",
      "koleksi": "5 item tersimpan, 0 dipin"
    }
  },
  {
    "id": "trisula-final-v2",
    "judul": "Trisula Final v2 — Koleksi Hidup, Jelajah Rapi, Refactor Otak",
    "tanggal": "2026-08-15",
    "komit": [
      "f32d69c",
      "2adba37",
      "9d1f329",
      "8632743",
      "a64cbc9",
      "cd291db",
      "7b85edc",
      "bcecc1f",
      "f5443b7",
      "1bba84d"
    ],
    "ringkasan": "Sepuluh bagian: Koleksi tab hidup (race-guard render, 4 grup Perpustakaan, CTA Artefak — menutup bug 3 tab identik dari screenshot pengguna); Jelajah dikelompokkan per negara (menutup wall-of-chips 30+ item); Trip dengan panel \"Rencana siap\" + ekspor PDF/MD/WA; tab Asisten Travel baru (chat perencana + PDF); fix --vvh keyboard & :focus-visible; refactor agent.js (885→393 baris) dan dataries-bridge.js (1046→156 baris) jadi 13 modul satelit tanpa ubah API publik; +60 dataries & skrip pengukuran baku measure-kv.mjs; gate 7 item lama; verifikasi konsolidasi bench+16 & Playwright 23/23; laporan akhir.",
    "fitur_baru": [
      "Koleksi: race-guard renderGen, 4 grup Perpustakaan (Catatan/Fakta diajarkan/Chunk impor/Pengetahuan), CTA Artefak 3 tombol",
      "Jelajah: kartu dikelompokkan per negara, dropdown kota, baris aksi gabungan",
      "Trip: panel \"Rencana siap\", label tanggal terlihat, ekspor PDF/MD/WA, kartu tersimpan",
      "Tab ke-5 Asisten Travel: chat perencana rule-based + ekspor PDF (raget_exports)",
      "Fix --vvh (garis keyboard hilang), :focus-visible (outline hanya untuk keyboard nav)",
      "Refactor: agent.js 885→393 baris (8 modul satelit tools-*), dataries-bridge.js 1046→156 baris (5 modul satelit bridge-*)",
      "+60 dataries (30 tokoh perempuan berpengaruh, 30 minuman Timur Tengah), tools/measure-kv.mjs — skrip pengukuran K/V baku pertama",
      "Gate 7 item: pencarian fuzzy, ringkas minggu, bersihkan duplikat, shortcut \"/\" dan \"k\", voice auto-send"
    ],
    "bug_ditutup": [
      "Koleksi Tersimpan & Perpustakaan menampilkan konten identik (screenshot bug nyata)",
      "Wall-of-chips 30+ kota di filter Jelajah Wisata/Asia",
      "Input tanggal Trip tanpa label terlihat"
    ],
    "kpi": {
      "bench": "273/283 (96.5%) → 289/299 (96.7%)",
      "quality": "Q=77 stabil (A70/K57 n=60/U100/D90/V100 n=6) — diukur ulang identik di Bagian 10",
      "refactor": "agent.js -56%, dataries-bridge.js -85%, 0 perubahan API publik, 273/283 identik sebelum/sesudah",
      "dataries": "1.856 entri total (+60 baru)",
      "boot": "~450ms ke interaktif",
      "playwright": "23/23 verify-bagian9.mjs, 0 error konsol, 0 404"
    }
  },
  {
    "id": "catatan-3-gabungan-final",
    "judul": "Ronde v3 Gabungan Final — Fix Chat, Devlog Total, K, Stub",
    "tanggal": "2026-08-15",
    "komit": [
      "e6764fc",
      "1a9536b",
      "94235f3",
      "ff8c9cc",
      "ffef921",
      "a156d8c",
      "8a1ac6c",
      "0de56d2"
    ],
    "ringkasan": "Delapan bagian: fix 3 bug chat nyata dari laporan pengguna (goyang horizontal, keyboard menutup composer, animasi ketik hilang untuk balasan pendek); rekonstruksi penuh riwayat proyek jadi raget-devlog/ (13 entri sejarah + 4 grup JSONL bertema, digali dari git log dan 5 laporan resmi); integrasi devlog ke Raget lewat 6 tool baru dengan guard anti-narsis ketat; rewrite 185 entri dataries (tokoh/sejarah/ekonomi/penemuan) dan perbaikan format daftar wisata/makanan/minuman untuk menaikkan K dari 57% ke 73%; perbaikan bug nyata fitur baca-PDF yang tidak pernah berfungsi sejak dibangun (CDN URL pdf.js v4 salah - hanya ES module, bukan classic script) plus pemecahan bench jadi core/stub suite; penemuan dan perbaikan bug reverse-lookup (regex tidak mengakomodasi kata 'apa'); bench +18 kasus dan verifikasi konsolidasi akhir.",
    "fitur_baru": [
      "Fix --vv-top (visualViewport.offsetTop tracking) - composer tetap di atas keyboard virtual",
      "Animasi ketik untuk semua balasan follow-mode (skip <=140 karakter dihapus)",
      "raget-devlog/ - 13 entri sejarah + keputusan/arsitektur/ux/bug.jsonl (43 entri tematik)",
      "6 tool devlog: sejarahmu, cara kerjamu, jilid/ronde X ngapain, bug tersulit, siapa pembuatmu, perkembangan skormu",
      "tools/append-devlog.mjs - hook self-updating devlog",
      "PDF nyata: vault/pdf/reader.js diperbaiki pakai dynamic import ES module, diverifikasi ekstrak teks asli",
      "tools/run-bench.mjs - bench runner permanen dengan pemisahan core-suite/stub-suite"
    ],
    "bug_ditutup": [
      "Goyang horizontal + garis di atas keyboard (msg-actions meluap viewport)",
      "Keyboard virtual menutup composer (visualViewport hanya melacak height, bukan offsetTop)",
      "Balasan pendek tidak dianimasikan (aturan skip <=140 karakter)",
      "Fitur baca-PDF tidak pernah berfungsi sejak Bagian 1 (5fcc039) - CDN URL menunjuk build yang tidak ada di pdfjs-dist@4.x",
      "tryReverseLookup() regex tidak mengakomodasi kata 'apa' pada 'negara apa yang bahasanya/mata uangnya X'",
      "splitPossessiveSuffix() tidak konsisten antara factoid() dan extras()"
    ],
    "kpi": {
      "quality": "Q=77->81 (A70/K73/U100/D90/V100, K naik dari 57% ke 73%, target >=65 tercapai)",
      "bench": "core-suite 307/307 (100%), stub-suite 1/10 (informatif), 299->317 kasus (+18)",
      "dataries": "185 entri di-rewrite (tokoh 105, sejarah 49, ekonomi 15, penemuan 16) jadi 2+ kalimat",
      "devlog": "13 entri sejarah, 61 commit terlacak, 43 entri JSONL tematik",
      "verifikasi": "19/19 Playwright (fix chat + devlog + guard + PDF nyata), 0 error konsol"
    }
  },
  {
    "id": "catatan-4-trisula-deca",
    "judul": "Ronde v4 - mesin matematika nyata, dukungan bilingual, knowledge graph, toleransi typo, A akurat",
    "tanggal": "2026-08-15",
    "komit": [
      "53f1fbb",
      "752f5d9",
      "a01c040",
      "ea94ba5",
      "86e1ba6",
      "410d578"
    ],
    "ringkasan": "Enam Bagian: (1) hapus auto-quiz yang nempel di jawaban faktual + animasi ketik natural dengan mode bench (render instan untuk automation lewat deteksi navigator.webdriver); (2) math-engine.js - parser recursive-descent asli (bukan eval), operator lengkap, konversi satuan/mata uang, mode langkah; (3) bilingual.js - deteksi bahasa ID/EN, jawaban factoid berbahasa Inggris, frasa dasar dari dataries tanpa perlu model neural; (4) knowledge-graph.js - komposer adaptif dan dialog-state lintas-bahasa yang menyambung follow-up ID<->EN ke entitas terakhir; (5) answer-composer.js - toleransi typo Levenshtein+fonetik, follow-up chip dibatasi 1; (6) feedback-store.js - Akurasi (A) akhirnya dihitung dari feedback nyata, bukan default 70%/n=0 yang dilaporkan tiga ronde beruntun. Bench 317->501 (+184 kasus). Ekspansi data dataries TIDAK dikerjakan di ronde ini (target +2.000 entri di perintah ronde tidak realistis dengan kualitas nyata dalam sisa waktu) - fokus diarahkan ke fondasi kode yang bisa diuji.",
    "fitur_baru": [
      "ai-agent/math-engine.js - tokenizer + parser recursive-descent, konversi satuan/mata uang, mode langkah",
      "ai-agent/bilingual.js - deteksi bahasa, jawaban factoid EN, frasa dasar dari dataries",
      "ai-agent/knowledge-graph.js - entity store negara, komposer adaptif, dialog-state follow-up ID/EN",
      "ai-agent/answer-composer.js - toleransi typo Levenshtein + normalisasi fonetik",
      "raget-memory/feedback-store.js - pencatat thumbs up/down mandiri di raget_feedback",
      "Mode bench: reduceMotion() true otomatis saat navigator.webdriver terdeteksi"
    ],
    "bug_ditutup": [
      "Auto-quiz nempel di jawaban faktual yang tidak relevan (screenshot bug user)",
      "Emoji tersembunyi di pesan jawaban kuis benar (lolos dari scan emoji ronde sebelumnya)",
      "Ekstraksi substring matematika naif merusak kurung/minus-di-depan/pemisah-ribuan",
      "Mode langkah matematika tidak benar-benar mencatat langkah perantara",
      "Konversi mata uang baru membajak fitur konversi ID lama yang lebih matang (urutan diperbaiki jadi fallback)",
      "Nama negara/ibukota masih ID-spelled di jawaban EN (Jepang bukan Japan, Kairo bukan Cairo)",
      "Follow-up EN dialog-state tidak update memoryContext, nyasar ke entitas ID terakhir",
      "Bug fuzzy-match matchesName() - sisa kata 'dan' (3 huruf) nyasar cocok ke 'Sao Tome dan Principe'",
      "Retry toleransi typo posisinya terlalu awal, sempat membajak perintah 'kuis' jadi 'luas'",
      "Akurasi (A) permanen default 70%/n=0 karena gerbang >=10 rating yang tak pernah tercapai"
    ],
    "kpi": {
      "bench": "317 -> 501 (+184 kasus core-suite, 100% pass)",
      "kv_baku": "Q=81 K=73 U=100 D=90 V=100 (identik v3 - fokus ronde ini di kapabilitas baru, bukan pendalaman jawaban ID yang sudah diukur skrip baku)",
      "A": "Terbukti nyata lewat verifikasi langsung: 3 suka + 1 tidak suka -> A=75% (n=4), pertama kali dilaporkan dengan angka sungguhan setelah 3 ronde beruntun stuck di 70%/n=0",
      "playwright_final": "13/13 checklist ronde lolos (animasi natural, nol auto-quiz, thumbs berfungsi, matematika benar, EN benar, nol emoji, nol console error, mode bench instan)"
    }
  },
  {
    "id": "catatan-5-trisula-deca-plus",
    "judul": "Ronde v5 TRISULA DECA++ — 6 mesin baru (STEM, sosial, konteks, dunia, kerangka berpikir, tokoh)",
    "tanggal": "2026-08-16",
    "komit": [
      "ff7299b",
      "1d88e29",
      "874aaf7",
      "a861821",
      "7260544",
      "3facdfc"
    ],
    "ringkasan": "Ronde besar menambah 6 modul AI baru: stem-engine.js (matematika lanjut, fisika, teknologi, biologi), social-engine.js (intent sosial, kerangka customer service LATTE/HEARD/3A, natural chat), context-engine.js (lokasi opt-in, sapaan sadar-waktu, klasifikasi situasi darurat, saran langkah selanjutnya), world-context.js (105 hari internasional, deteksi 5 bahasa, auto-mode Jelajah Dunia), intelligence-rumus.js (21 kerangka berpikir/keputusan/belajar bernama), dan tokoh-store.js (data tokoh terstruktur 45 entri). Setiap Bagian diikuti pengujian langsung yang menemukan dan memperbaiki tabrakan pipeline nyata sebelum masuk bench, mengikuti pola 'temukan lewat pengujian, bukan tebakan' yang sudah mapan di ronde-ronde sebelumnya. Diakhiri cleanup wajib menghapus referensi proyek tidak terkait dari riwayat/devlog sebelum ronde ini dimulai.",
    "fitur_baru": [
      "Aljabar, geometri (8 bangun), statistika, kalkulus ringan (aturan pangkat), logika boolean",
      "10 rumus fisika inti dengan substitusi+hasil+satuan (Newton II, energi, Ohm, dst)",
      "10 konsep teknologi baru + 10 skenario troubleshooting",
      "8 sistem tubuh, klasifikasi takson, ekologi, info kesehatan dengan disclaimer wajib",
      "Intent sosial: curhat, diskusi/perdebatan steel-manning (8 topik), humor, motivasi, kritik konstruktif",
      "Kerangka customer service LATTE/HEARD/3A dengan deteksi emosi",
      "Natural chat: mirroring + follow-up + emoji kontekstual (5 topik smalltalk)",
      "Lokasi opt-in (tanpa panggil geolocation API asli demi determinisme UI)",
      "Sapaan sadar-waktu (pagi/siang/sore/malam berdasar jam nyata)",
      "Klasifikasi situasi darurat dengan disclaimer hotline 112/119/110/113 di checkpoint paling awal",
      "Mesin saran 'langkah selanjutnya' (maksimal 3, eksplisit opsional)",
      "105 hari internasional (lookup by tanggal & nama)",
      "Deteksi 5 bahasa (ID/EN/AR/ZH/JA) + hitung angka 1-10 lintas bahasa",
      "Auto-mode Jelajah Dunia ('aku lagi di Tokyo' -> konteks negara + etika budaya nyata)",
      "21 kerangka berpikir bernama (5W1H, SWOT, Eisenhower Matrix, dst) + saran kontekstual",
      "Data TOKOH terstruktur 45 entri (nama ID+EN, lahir/wafat, 3 pencapaian, kutipan, trivia, relasi)"
    ],
    "bug_ditutup": [
      "toolsMath serakah mengambil pola 'digit-operator-digit' dari TENGAH ekspresi kalkulus polinomial (3x^2+2x salah kena parse jadi 2+2)",
      "Fisika berawalan 'hitung' ketiban gerbang paksa prefix toolsMath, dijawab 'ekspresi tidak valid'",
      "'apa itu sistem pencernaan' dan 'apa itu hari bumi' kalah duluan oleh fuzzy-match dataries tidak terkait (Sistem Peredaran Darah, Gempa Bumi)",
      "Kata 'salah' tunggal dalam evaluasi logika ('salah XOR benar') salah kena deteksi rating negatif (RATING_BAD_RE)",
      "Regex troubleshoot 'force close' hanya cocok kalau kata 'aplikasi' muncul SEBELUM frasa itu, gagal untuk urutan terbalik",
      "Kunci kamus 'star' (STAR Method) nyaris menyebabkan false-positive ke 'apa itu starbucks' - diganti jadi 'star method'",
      "Komplain eksplisit dengan kata kunci troubleshoot ('force close') kalah duluan oleh troubleshoot generik stemEngine, bukan kerangka LATTE yang lebih spesifik",
      "Geolocation API asli (navigator.geolocation) menimbulkan jeda ~1.5 detik yang balapan dengan deteksi stabilitas animasi-ketik UI, salah mengaitkan balasan ke pesan berikutnya - diganti alur opt-in sinkron",
      "'apa itu eisenhower matrix' tidak konsisten terjangkau via memoryIndex meski entri lama sudah ada, sehingga tetap didefinisikan ulang di modul baru"
    ],
    "kpi": {
      "bench": "501 -> 841 (+340 kasus core-suite, 100% pass di setiap Bagian dan verifikasi akhir)",
      "kv_baku": "Q=81 K=73 A=70 U=100 D=90 V=100 (identik v4 - 100 kueri baku KV tidak menyentuh satupun dari 6 modul baru ronde ini, sudah diketahui sebagai keterbatasan metodologi pengukuran, bukan regresi)",
      "verifikasi_akhir": "16/16 checklist lolos lewat 2 konteks browser terpisah, mencakup 5 skenario bernama: percakapan multi-turn, situasi darurat, diskusi budaya, kueri tokoh, kueri fisika",
      "data_tokoh": "45/400 entri (11.25%) - dilaporkan jujur, bukan dipaksakan atau difabrikasi; 45 entri dipilih beririsan dengan 108 entri ringkas lama untuk PENDALAMAN, bukan duplikasi"
    }
  },
  {
    "id": "catatan-6-tata-tubuh-data-rasa-trisula",
    "judul": "Ronde v6 — TATA TUBUH, TATA DATA, TATA RASA, + KELANJUTAN TRISULA",
    "tanggal": "2026-08-16",
    "komit": [
      "7f94ff7",
      "6bf2888",
      "0e62e00",
      "d5d79c6",
      "51345d7"
    ],
    "ringkasan": "Ronde 5-bagian yang merapikan struktur folder (semua kode otak masuk ke raget/), merapikan lapisan data (dataset teks polos vs dataries terstruktur, komentar/emoji dibersihkan), memperbaiki 7 masalah akurasi nyata yang dilaporkan user langsung, menggandakan data tokoh sambil mengukur baku dengan kolom feedbackStore eksplisit, lalu menutup dengan 5 kemampuan kecerdasan baru: entity store kuliner, soal cerita matematika, ekspansi dunia (kota+hari internasional), kontinuitas emosi lintas giliran, dan mode 'terapkan' kerangka berpikir interaktif. Tiga bug nyata ditemukan dan diperbaiki lewat pengujian langsung sepanjang ronde ini: (1) import path yang lolos analisis statis tapi gagal di runtime browser (dynamic import, path lewat variabel), (2) alias negara Tiongkok/China berbeda antara sistem factoid dan sistem etika sehingga lookup etika kota-kota China selalu gagal, (3) entity kuliner presisi (\"Chili Crab\") tertangkap fuzzy-match ke negara tak berhubungan (\"Chili\") sebelum diperbaiki dengan checkpoint dini + fuzzy-match satu arah.",
    "fitur_baru": [
      "Struktur raget/ tunggal menaungi 9 modul (agents, llm, retrieval, memory, database, devlog, dataries, dataset, tools)",
      "raget-dataset/languages.jsonl (teks polos) melengkapi raget-dataries/lingo (terstruktur) + docs/DATA-STRUCTURE.md",
      "Alias cina->Tiongkok, presisi luas lautan (jujur bila tiada), atribut suku/etnis, template opini+disclaimer, penanganan region benua/subregion (tryRegionList), definisi bidang sains sebagai konsep",
      "Data tokoh 45->145 entri (+100, 36.25% dari target jangka panjang 400)",
      "Rotasi 12/60 kueri baku KV mencerminkan kapasitas baru + kolom 'A (feedbackStore)' eksplisit di laporan otak",
      "kuliner-store.js: 108 entri kuliner (nama, negara, jenis, bahan utama, trivia) + composer adaptif",
      "math-engine.js: soal cerita harga x kuantitas dan persen-dalam-konteks (konvensi angka Indonesia), mode langkah",
      "Kota auto-mode Jelajah Dunia 53->121 (53 negara, seluruh cakupan data etika) + hari internasional 105->146 (+41 terverifikasi)",
      "context-engine.js: kontinuitas emosi lintas giliran maks 3 (mood negatif giliran sebelumnya menjaga nada balasan tetap lembut, jujur bukan manipulatif)",
      "framework-apply.js: mode 'terapkan' Decision Matrix - sesi bertahap pilihan->kriteria->skor->kesimpulan, bukan cuma definisi"
    ],
    "bug_ditutup": [
      "3 kelas import path lolos regex statis tapi gagal di browser: dynamic import() di dalam page.evaluate() (URL browser, bukan Node), path string dioper sebagai argumen fungsi helper lazy(), new URL() dengan string concatenation bukan literal tunggal",
      "'luas lautan indonesia' menjawab luas DARATAN (salah) karena RELATIONS generik 'luas' menangkap 'luas lautan' lebih dulu - dipisah jadi relasi khusus + honest-fallback saat data memang tiada",
      "'apa itu kimia' tertangkap fuzzy-match ke topik sempit ('Reaksi Kimia') alih-alih definisi bidang - dipindah ke checkpoint stemDict paling awal",
      "Pertanyaan region benua ('sebutkan negara di afrika') gagal total ke klarifikasi generik kecuali kebetulan cocok lewat retrieval fallback - tryRegionList() baru memetakan benua+subregion ke REGIONS yang sudah ada",
      "CITY_COUNTRY memakai nama 'China' tapi data etika memakai 'Tiongkok' sebagai country kanonis, membuat lookup etika kota-kota China selalu gagal - tryEtika() sekarang juga mencocokkan lewat tags",
      "'ceritakan tentang chili crab' tertangkap fuzzy-match dataries-bridge.js ke negara 'Chili' sebelum kulinerStore sempat dicek - dipindah ke checkpoint dini + findKuliner() dibuat fuzzy satu arah saja",
      "isSuperlativeQuery pada template opini awalnya cuma daftar kata tetap (tidak menangkap 'terenak', 'termurah', dst) - diganti pola umum prefiks 'ter-' + exclude-list kata non-superlatif"
    ],
    "kpi": {
      "bench": "841 -> 1063 (+222: +22 demo TATA RASA, +50 tokoh, +150 KELANJUTAN TRISULA), core-suite 100% di setiap Bagian dan verifikasi akhir",
      "kv_baku": "catatan-5-final Q=81 -> catatan-6-final Q=82 (A=70 A_feedbackStore=belum ada rating n=0 default 70% K=68 U=100 D=100 V=100, n_K=57/60 - 12 kueri baku dirotasi mencerminkan kapasitas baru catatan-6, 48 tetap untuk kontinuitas historis)",
      "verifikasi_akhir": "23/23 checklist lolos (melebihi target 16+) mencakup seluruh 5 Bagian + smoke test Jalanin travel sub-app, 0 error konsol, 0 404 di server lokal (deployment Vercel tidak bisa diverifikasi langsung - URL produksi tidak diketahui sesi ini)",
      "data_tokoh": "145/400 entri (36.25%) - +100 ditambahkan bertahap tanpa fabrikasi, memperdalam entri ringkas lama (penjelajah, pemimpin, perempuan berpengaruh, sains, seni, teknologi) + tokoh terkenal lain berfakta mapan",
      "hari_internasional": "105 -> 146 (+41, jujur di bawah target ronde +95 - sebagian tanggal dari pencarian saling bertentangan/tergeser, sengaja tidak ditebak daripada berisiko salah tanggal)"
    }
  },
  {
    "id": "catatan-7-lanjutan-data-kecerdasan-ui",
    "judul": "Ronde v7 — Lanjutan Data (Tokoh, Hari, Kuliner) + Kecerdasan (Emosi Positif, 5 Whys/SWOT) + Perbaikan UI",
    "tanggal": "2026-08-20",
    "komit": [
      "a6bec3b",
      "0dc2410",
      "80f9833",
      "32ce150",
      "a76f0dc",
      "f8bca34"
    ],
    "ringkasan": "Ronde 5-bagian yang langsung melanjutkan 5 saran ronde-berikutnya dari laporan Ronde v6: menambah data tokoh dan hari internasional, memecah kuliner-store.js jadi 6 file regional sekaligus menambah entri baru, memperluas kontinuitas emosi ke mood positif plus sinyal reset eksplisit, dan menambah mode 'terapkan' untuk 5 Whys dan SWOT menyusul Decision Matrix. Di tengah ronde, user melaporkan 4 bug UI nyata lewat screenshot (jam menempel ke jawaban saat animasi ketik baru mulai, tombol tumpang tindih di tab Asisten Jalanin, panel contoh pertanyaan di layar kosong chat, dan sapaan harian statis) - keempatnya didiagnosis dari kode dan diperbaiki dalam satu batch terpisah, diverifikasi via screenshot Playwright sebelum dan sesudah. Ronde ini juga pertama kalinya deployment produksi Vercel benar-benar diverifikasi langsung (bukan cuma diasumsikan) lewat Vercel MCP - projectId ditemukan, deployment production terkini dikonfirmasi READY dan cocok dengan commit merge terakhir, 0 runtime error 7 hari terakhir, dan HTML live di rategoan.vercel.app diambil langsung untuk memastikan perbaikan UI benar-benar tayang.",
    "fitur_baru": [
      "Data tokoh 145->236 entri (59% dari target jangka panjang 400) + regex tryPencapaian() dilonggarkan supaya 'pencapaian X'/'prestasi X' saja (tanpa 'apa saja') juga cocok",
      "Hari internasional 146->158 (79% dari target 200), +12 hari terverifikasi lintas sumber",
      "kuliner-store.js dipecah jadi 6 file regional (raget-agents/kuliner-data/*.js) mengikuti pola raget-dataries/etika/*.js yang sudah ada + 35 entri baru (108->143), diprioritaskan region tertipis",
      "context-engine.js: kontinuitas emosi kini juga melacak mood POSITIF (senang), tidak cuma negatif, plus sinyal reset eksplisit ('udah baikan', 'udah mendingan', dst.) yang langsung memutus kontinuitas di giliran yang sama",
      "framework-apply.js diperluas dari 1 kerangka (Decision Matrix) jadi 3 lewat field session.kind: + 5 Whys (masalah->tanya kenapa berulang maks 5x->akar masalah, bisa berhenti awal) dan SWOT (topik->Strengths->Weaknesses->Opportunities->Threats->ringkasan)",
      "4 perbaikan UI dari laporan screenshot user: timestamp balasan AI baru muncul setelah animasi ketik selesai (bukan di awal), FAB Jalanin disembunyikan di tab Asisten (plus fix spesifisitas CSS [hidden]), panel chip contoh di layar kosong chat dihapus, sapaan harian kini dinamis menyapa nama pengguna yang login"
    ],
    "bug_ditutup": [
      "kuliner-store.js: 'ceritakan tentang chili crab' salah kembalikan data negara Chili karena datariesBridge.factoid() jalan sebelum kulinerStore.tryKuliner() - dipindah ke checkpoint dini (pola 'fuzzy-match shadows precise-handler' yang berulang lagi dari ronde sebelumnya)",
      "findKuliner(): fuzzy fallback dua arah bikin 'chili' (negara Chile) salah tangkap ke 'Chili Crab' - dipersempit jadi satu arah (query harus memuat nama kuliner lengkap)",
      "context-engine.js: sinyal reset eksplisit tidak langsung berlaku di giliran yang sama karena agent.js menghitung opener kontinuitas SEBELUM memanggil noteTurnMood() (yang baru melakukan reset) - RESET_SIGNAL_RE dicek juga langsung di tryEmotionalContinuityOpener()",
      "js/chat/chat.js typeReply(): span.time ditempel ke DOM SEBELUM animasi ketik mulai, membuat jam tampil sejak karakter pertama lalu 'melompat' turun tiap frame mengikuti tinggi body yang masih tumbuh - dipindah ke setelah animasi selesai",
      "travel #fab: atribut hidden tidak cukup menyembunyikan tombol karena '#fab { display: flex }' punya spesifisitas CSS lebih tinggi dari default browser '[hidden]{display:none}' - ditambah aturan #fab[hidden]{display:none} eksplisit"
    ],
    "kpi": {
      "bench": "1063 -> 1190 (+127: +52 tokoh, +12 hari internasional, +35 kuliner, +9 kontinuitas emosi, +19 5 Whys/SWOT), core-suite 100% di setiap Bagian dan verifikasi akhir",
      "kv_baku": "catatan-6-final Q=82 -> catatan-7-final Q=82 (stabil, tidak regresi) - A=70 (A_feedbackStore belum ada rating n=0 default 70%) K=68 U=100 D=100 V=100, n_K=57/60",
      "verifikasi_akhir": "17/17 checklist lolos (melebihi target 16+) mencakup seluruh 5 Bagian + 4 perbaikan UI + smoke test Jalanin travel sub-app, 0 error konsol, 0 404 di server lokal",
      "deployment_vercel": "PERTAMA KALI diverifikasi langsung lewat Vercel MCP (menutup celah yang diakui di laporan Ronde v6): project rategoan (prj_e792RV9zig2hon42JXsgVeax5BIO) ditemukan, deployment production terkini (commit merge Bagian 5) berstatus READY, 0 runtime error 7 hari terakhir, HTML live rategoan.vercel.app diambil langsung dan dikonfirmasi memuat perbaikan UI (panel chip contoh sudah hilang)",
      "data_tokoh": "236/400 entri (59%) - +91 ditambahkan bertahap tanpa fabrikasi, 8 duplikat tak sengaja ditemukan & dihapus sebelum masuk",
      "hari_internasional": "158/200 (79%, +12 - jujur di bawah target ronde karena sumber pencarian kembali memberi tanggal saling bertentangan untuk sejumlah hari lain, sengaja tidak ditebak)"
    }
  },
  {
    "id": "fase-b-tuntas-21-domain",
    "judul": "Fase B Tuntas — 21 Domain Migrasi ke Skema JSON Tunggal (2.112 Entri) + REORG raget-data/raget-devlog + Training Neural Tiny",
    "tanggal": "2026-08-23",
    "komit": [
      "3576302",
      "611e37a",
      "aebd71d",
      "d619665",
      "d967be0",
      "3d44db3",
      "7b804dc",
      "97ac782",
      "8e12fe4",
      "123d69c",
      "c37de71",
      "0a1edab",
      "aa52eef",
      "55577fc",
      "1d76982",
      "2f50db6",
      "c711ef8",
      "de61229",
      "a28af4d",
      "03bccf9",
      "3717a4f",
      "2019387"
    ],
    "ringkasan": "Ronde multi-sesi yang menuntaskan seluruh Fase B roadmap vNext: migrasi 21 domain data dari format modul JS lama (raget-dataries/<domain>/*.js, DATA export per region) ke satu skema JSON seragam {id, kategori, wilayah, nama, tags, teks, meta} di raget-data/json/<domain>/, dimulai dari pilot domain tokoh dan diakhiri domain seni-budaya sebagai domain ke-21. Total 2.112 entri terverifikasi (dihitung ulang langsung dari file JSON, bukan diasumsikan) tersebar di 21 domain, dari yang terkecil (sapaan, 11 entri) sampai yang terbesar (marplace, 378 entri). Di tengah ronde dijalankan BLOK REORG yang merapikan raget-data/ jadi tiga sub-folder (json/jsonl/neural) dan raget-devlog/ mengikuti pola yang sama, plus satu training run nyata pada preset neural tiny memakai korpus gabungan seluruh domain. Setiap domain digerbangi pola yang identik: migrasi terpisah per commit, korpus di-regenerasi, live-verify lewat query nyata di browser (bukan cuma unit test), lalu full bench 1180 core-suite sebelum commit dianggap selesai. Dua temuan jujur tercatat: (1) menambahkan domain besar (marplace) ke DATARIES_FALLBACK_GROUPS sempat bikin regresi TF-IDF pada query negara kecil - dicoba lalu sengaja dibatalkan, didokumentasikan di commit, bukan disembunyikan; (2) unifiedToLegacyShape() di raget-dataries/index.js ternyata TIDAK PERNAH menyuntik balik field 'tags' sejak domain JSON-migrated pertama - bug lama yang baru terpapar di domain ke-21 lewat query 'tari khas bali', diperbaiki di commit yang sama dan berlaku otomatis untuk seluruh 21 domain sekaligus.",
    "fitur_baru": [
      "21 domain migrasi tuntas ke skema JSON tunggal: tokoh, kuliner, hari-internasional, sapaan, negara, kota, bahasa, etika, minuman, wisata, sejarah, makanan, alam, sains, olahraga, marplace, lingo, ekonomi, paluang, penemuan, seni-budaya - total 2.112 entri (terverifikasi ulang dari file, bukan angka asumsi)",
      "REORG raget-data/ menjadi json/ (skema JSON per domain), jsonl/ (korpus gabungan untuk training), neural/ (checkpoint dan laporan training) - raget-devlog/ mengikuti pola yang sama",
      "dataries-ke-korpus.mjs versi penuh menggabungkan seluruh 21 domain JSON jadi satu korpus JSONL (raget_own_corpus.jsonl), kini 4.163 baris / ~121.921 token setelah domain terakhir masuk",
      "Training run nyata preset tiny (2.839.296 parameter) dengan korpus gabungan terbaru: 7.634 step dalam anggaran 40 menit, held-out perplexity 8.551,6 -> 2.180,6 (turun ~4,4x), namun generasi masih premature EOS / fragmen kata tidak koheren - dicatat apa adanya, tidak diklaim 'siap pakai'"
    ],
    "bug_ditutup": [
      "unifiedToLegacyShape() (raget-dataries/index.js) tidak pernah menyuntik balik field 'tags' dari entry unified ke bentuk legacy {text, metadata} - hanya category/region/name yang disuntik. Bug ada sejak domain JSON-migrated pertama, baru terpapar di domain seni-budaya lewat query 'tari khas bali' (butuh cocok lewat tags karena nama entri 'Tari Kecak' tidak memuat kata 'bali'). Fix satu baris berlaku otomatis untuk seluruh 21 domain, diverifikasi tidak merusak domain lain (penemuan, ekonomi dicek ulang pasca-fix)",
      "DATARIES_FALLBACK_GROUPS (dataries-bridge.js): mencoba menambah 'marplace' (378 entri) ke whitelist fallback chat generik menyebabkan regresi nyata - query negara kecil di Eropa kehijak entri marplace karena kompetisi TF-IDF antar korpus dengan ukuran sangat timpang. Percobaan dibatalkan, domain besar berikutnya (lingo, ekonomi, paluang, penemuan, seni-budaya) sengaja TIDAK ditambahkan ke whitelist ini - hanya bisa dijangkau lewat consumer khusus per domain di bridge-extras.js bila ada",
      "REPORT_FILE di 3 skrip neural (train-tiny-checkpoint.mjs, train-neural-checkpoint.mjs, diagnose-neural-generation.mjs) masih menunjuk path lama raget-tools/ dari sebelum BLOK REORG - diperbaiki ke raget-devlog/neural/ SEBELUM training dijalankan, supaya laporan tidak salah tempat"
    ],
    "kpi": {
      "domain_migrasi": "21/21 domain tuntas, 2.112 entri total (dihitung ulang langsung dari raget-data/json/*/*.json, cocok dengan target ronde)",
      "bench": "1180/1180 core-suite hijau (100%) di commit terakhir setiap domain - domain #21 (seni-budaya) sempat 1179/1180 karena bug tags di atas, run kedua pasca-fix 1180/1180 bersih",
      "korpus": "raget_own_corpus.jsonl: 4.163 baris, ~121.921 token (estimasi ~4 char/token) setelah domain ke-21 masuk",
      "training_neural_tiny": "2.839.296 parameter, 7.634 step, anggaran 40 menit (aktual 40 menit), held-out perplexity 8.551,57 -> 2.180,60. Sampel generasi pasca-training MASIH belum koheren (contoh: prompt 'Apa ibu kota Indonesia?' -> ': KatTom Isaac. Republik ex') - premature EOS / fragmentasi kata, dicatat jujur sebagai batas nyata preset tiny, bukan diklaim selesai",
      "rule_engine": "tidak disentuh sepanjang ronde - seluruh 21 migrasi murni memindahkan data lewat unifiedToLegacyShape(), consumer di bridge-extras.js/dataries-bridge.js tidak diubah kecuali fix bug tags yang justru mengembalikan perilaku yang seharusnya sudah ada sejak awal"
    }
  },
  {
    "id": "training-checkpoint50m-fase-c",
    "judul": "Fase C — Training Nyata Pertama pada Checkpoint 50M (Gradient Descent, 100 Step)",
    "tanggal": "2026-08-21",
    "komit": [
      "7438ad6"
    ],
    "ringkasan": "Entri susulan yang belum sempat ditulis saat commit-nya dibuat: run training nyata PERTAMA pada preset neural 'small' (~58 juta parameter, checkpoint raget-neural-50m). Sebelum ronde ini bobot checkpoint murni acak (skipAutoTrain, belum pernah dilatih sama sekali). Skrip raget-tools/train-neural-checkpoint.mjs dibuat baru khusus untuk ini, berbasis anggaran WAKTU (bukan jumlah step tetap) karena kalibrasi menunjukkan satu step penuh (forward+backward lewat transformer 8-layer/512-dim) di JS murni tanpa GPU makan ~12-19 detik - jauh lebih lambat dari perkiraan awal, sehingga anggaran waktu praktis hanya cukup untuk puluhan step, bukan ribuan. Run nyata dengan anggaran 20 menit (korpus raget_own_corpus.jsonl, 3.389 kalimat/teks setelah ekspansi dialog saat itu) menghasilkan 100 step selesai dalam 20,3 menit. Sampel generasi sebelum dan sesudah training TETAP TIDAK KOHEREN - dicatat apa adanya di training-report.json, tidak dipoles. checkpoint-50m ditandai trained:true, trainingSteps:100 (sebelumnya bobot acak murni), dan deskripsi model raget-neural-50m diperbarui agar jujur: training nyata sudah terjadi tapi jawaban tetap tidak koheren pada skala ini. Rule engine (raget-template-1) tetap default; neural tetap opt-in berlabel 'Neural Lokal (Eksperimental)' - jalur default tidak tersentuh.",
    "fitur_baru": [
      "raget-tools/train-neural-checkpoint.mjs (baru): skrip training gradient descent nyata untuk preset 'small' (~58 juta parameter), berbasis anggaran waktu (menit) lewat argumen CLI, bukan jumlah step tetap - satu argumen: node train-neural-checkpoint.mjs [menitAnggaran]",
      "Run pertama: anggaran 20 menit -> 100 step selesai dalam 20,3 menit di atas korpus 3.389 kalimat/teks",
      "Loss turun dari rata-rata 10,53 (5 step pertama) ke 10,38 (5 step terakhir); perplexity turun dari ~37.318 ke ~32.300 - penurunan nyata tapi sangat kecil, sesuai ekspektasi untuk model 58 juta parameter yang baru dilatih 100 step",
      "checkpoint raget-neural-50m.safetensors ditulis ulang dengan bobot hasil training nyata (trained:true, trainingSteps:100, trainingMinutes:20.3), menggantikan bobot acak murni sebelumnya"
    ],
    "bug_ditutup": [],
    "kpi": {
      "preset": "small (~58 juta parameter, 8-layer/512-dim)",
      "training": "100 step nyata dalam anggaran 20 menit (aktual 20,3 menit), korpus 3.389 kalimat/teks",
      "loss": "rata-rata 5 step pertama 10,53 -> rata-rata 5 step terakhir 10,38 (perplexity ~37.318 -> ~32.300) - turun tipis, jauh dari cukup untuk koherensi",
      "generasi": "sampel sebelum maupun sesudah training MASIH sepenuhnya tidak koheren (potongan kata acak, bukan kalimat) - dicatat jujur di training-report.json, tidak diklaim 'siap pakai'",
      "catatan": "entri ini ditulis belakangan (bukan pada tanggal commit) untuk melengkapi devlog yang sempat terlewat sebelum ronde training 85-menit berikutnya dijalankan"
    }
  },
  {
    "id": "training-checkpoint50m-cpu-85menit",
    "judul": "Ronde Training CPU Kedua pada Checkpoint 50M (85 Menit, 488 Step) — Sandbox Tanpa GPU",
    "tanggal": "2026-09-05",
    "komit": [
      "f6703a8"
    ],
    "ringkasan": "Permintaan dirigen adalah training '100M selama 90 menit'. Kenyataan sandbox ini: nvidia-smi tidak ada (tanpa GPU sama sekali), cuma 4 core CPU - dan skrip train-neural-checkpoint.mjs yang ada di repo cuma mendukung preset 'small' (~58 juta parameter, checkpoint raget-neural-50m), BUKAN preset 'massive100m'/'massive200m' yang selama ini SELALU dilatih lewat Colab GPU (train-massive-colab-gpu.py, lihat training-report-massive100m-round*-colab-gpu.json). Jadi ronde ini menjalankan opsi terbesar yang benar-benar bisa jalan di sandbox ini apa adanya: preset 'small' yang sama seperti ronde 20 menit sebelumnya (entri #20), tapi dengan anggaran waktu 85 menit (dikurangi sedikit dari 90 untuk buffer overhead skrip) - bukan klaim training 100M nyata. Hasil: 488 step selesai dalam 85,2 menit di atas korpus 5.354 kalimat/teks (naik dari 3.389 saat ronde sebelumnya) - hampir 5x lebih banyak step dari ronde 20 menit sebelumnya berkat anggaran waktu 4x lebih besar. Loss turun dari rata-rata 10,44 (5 step pertama) ke rata-rata 9,70 (5 step terakhir); perplexity turun dari ~34.347,8 ke ~16.370,7 (turun ~2,1x, lebih besar dari penurunan ronde sebelumnya yang cuma ~1,15x). TAPI perplexity akhir ~16.371 masih jauh LEBIH BESAR dari ukuran vocab (11.434 token) - artinya model masih lebih buruk daripada tebakan seragam (uniform random) atas seluruh vocab. Sampel generasi sebelum DAN sesudah training kedua-duanya TETAP sepenuhnya tidak koheren (potongan kata acak bersambung tanpa spasi, bukan kalimat) - dicatat verbatim di training-report.json, tidak dipoles jadi kelihatan lebih baik dari kenyataannya. Ini hasil jujur dan diperkirakan sejak awal: dirigen sudah diberi tahu sebelum run bahwa 100M/90-menit gaya-GPU tidak feasible di sandbox ini, dan opsi CPU terbesar yang feasible dijalankan serta dilaporkan apa adanya.",
    "fitur_baru": [
      "Ronde training CPU kedua (setelah entri #20) pada raget-tools/train-neural-checkpoint.mjs, preset 'small' (~58 juta parameter) - anggaran 85 menit, aktual 85,2 menit, 488 step total di atas korpus 5.354 kalimat/teks (raget_own_corpus.jsonl, sudah bertambah dari 3.389 saat ronde sebelumnya)",
      "Loss rata-rata 5 step pertama 10,44 -> rata-rata 5 step terakhir 9,70; perplexity ~34.347,8 -> ~16.370,7 (turun ~2,1x) - penurunan lebih besar dari ronde 20 menit sebelumnya (~37.318 -> ~32.300, ~1,15x) tapi TETAP jauh dari cukup untuk koherensi: perplexity akhir masih di atas ukuran vocab (11.434), model masih kalah dari tebakan seragam",
      "checkpoint raget-neural-50m.safetensors ditulis ulang dengan bobot hasil training nyata ronde ini (trained:true, trainingSteps:488, trainingMinutes:85.2), 42.167.768 byte (~40,21 MB) - tetap di bawah batas keras GitHub 100MB sehingga tetap di-commit langsung sebagai blob git biasa, sesuai kebijakan permanen di raget-tools/CHECKPOINT-POLICY.md dan .gitignore (cuma checkpoint >100MB seperti massive200m yang dikecualikan)",
      "Dikonfirmasi ulang secara eksplisit: sandbox Claude Code Remote ini TIDAK punya GPU (nvidia-smi tidak ditemukan, cuma 4 core CPU) - training skala 100M/200M yang genuine (seperti training-report-massive100m-round*-colab-gpu.json) TETAP harus lewat notebook Colab GPU (train-massive-colab-gpu.py) seperti sebelumnya, bukan sesuatu yang bisa dijalankan di sandbox ini apapun anggaran waktunya, karena preset 'small' (58M, dipakai ronde ini) adalah arsitektur/checkpoint yang SEPENUHNYA terpisah dari preset 'massive100m'/'massive200m'"
    ],
    "bug_ditutup": [],
    "kpi": {
      "preset": "small (~58 juta parameter, 8-layer/512-dim) - BUKAN preset massive100m/massive200m",
      "lingkunganTraining": "sandbox Claude Code Remote, CPU murni (nvidia-smi tidak ada, 4 core CPU) - berbeda dari seluruh ronde massive100m/massive200m sebelumnya yang selalu lewat Colab GPU",
      "training": "488 step nyata dalam anggaran 85 menit (aktual 85,2 menit), korpus 5.354 kalimat/teks",
      "loss": "rata-rata 5 step pertama 10,44 -> rata-rata 5 step terakhir 9,70 (perplexity ~34.347,8 -> ~16.370,7, turun ~2,1x)",
      "generasi": "sampel sebelum maupun sesudah training MASIH sepenuhnya tidak koheren (potongan kata acak tersambung tanpa spasi, bukan kalimat) - perplexity akhir ~16.371 masih di atas ukuran vocab 11.434, model masih kalah dari tebakan seragam; dicatat jujur di training-report.json, tidak diklaim membaik secara kualitatif",
      "checkpoint": "raget-neural-50m.safetensors, 42.167.768 byte (~40,21 MB), tetap di bawah 100MB sehingga tetap sebagai blob git biasa sesuai CHECKPOINT-POLICY.md",
      "catatan": "permintaan awal dirigen adalah '100M selama 90 menit' gaya Colab-GPU - sudah dikomunikasikan sebelum run bahwa itu tidak feasible di sandbox tanpa GPU ini, jadi yang dijalankan dan dilaporkan di sini adalah opsi CPU terbesar yang benar-benar feasible (preset small, 85 menit), bukan klaim 100M yang sebenarnya. Training 100M/200M genuine tetap perlu Colab+GPU seperti sebelumnya."
    }
  }
]);
export default SEJARAH;
