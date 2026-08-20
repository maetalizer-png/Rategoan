export default {
  id: "ronde-v7-lanjutan-data-kecerdasan-ui",
  judul: "Ronde v7 — Lanjutan Data (Tokoh, Hari, Kuliner) + Kecerdasan (Emosi Positif, 5 Whys/SWOT) + Perbaikan UI",
  tanggal: "2026-08-20",
  komit: [
    "a6bec3b",
    "0dc2410",
    "80f9833",
    "32ce150",
    "a76f0dc",
    "f8bca34"
  ],
  ringkasan: "Ronde 5-bagian yang langsung melanjutkan 5 saran ronde-berikutnya dari laporan Ronde v6: menambah data tokoh dan hari internasional, memecah kuliner-store.js jadi 6 file regional sekaligus menambah entri baru, memperluas kontinuitas emosi ke mood positif plus sinyal reset eksplisit, dan menambah mode 'terapkan' untuk 5 Whys dan SWOT menyusul Decision Matrix. Di tengah ronde, user melaporkan 4 bug UI nyata lewat screenshot (jam menempel ke jawaban saat animasi ketik baru mulai, tombol tumpang tindih di tab Asisten Jalanin, panel contoh pertanyaan di layar kosong chat, dan sapaan harian statis) - keempatnya didiagnosis dari kode dan diperbaiki dalam satu batch terpisah, diverifikasi via screenshot Playwright sebelum dan sesudah. Ronde ini juga pertama kalinya deployment produksi Vercel benar-benar diverifikasi langsung (bukan cuma diasumsikan) lewat Vercel MCP - projectId ditemukan, deployment production terkini dikonfirmasi READY dan cocok dengan commit merge terakhir, 0 runtime error 7 hari terakhir, dan HTML live di rategoan.vercel.app diambil langsung untuk memastikan perbaikan UI benar-benar tayang.",
  fitur_baru: [
    "Data tokoh 145->236 entri (59% dari target jangka panjang 400) + regex tryPencapaian() dilonggarkan supaya 'pencapaian X'/'prestasi X' saja (tanpa 'apa saja') juga cocok",
    "Hari internasional 146->158 (79% dari target 200), +12 hari terverifikasi lintas sumber",
    "kuliner-store.js dipecah jadi 6 file regional (raget-agents/kuliner-data/*.js) mengikuti pola raget-dataries/etika/*.js yang sudah ada + 35 entri baru (108->143), diprioritaskan region tertipis",
    "context-engine.js: kontinuitas emosi kini juga melacak mood POSITIF (senang), tidak cuma negatif, plus sinyal reset eksplisit ('udah baikan', 'udah mendingan', dst.) yang langsung memutus kontinuitas di giliran yang sama",
    "framework-apply.js diperluas dari 1 kerangka (Decision Matrix) jadi 3 lewat field session.kind: + 5 Whys (masalah->tanya kenapa berulang maks 5x->akar masalah, bisa berhenti awal) dan SWOT (topik->Strengths->Weaknesses->Opportunities->Threats->ringkasan)",
    "4 perbaikan UI dari laporan screenshot user: timestamp balasan AI baru muncul setelah animasi ketik selesai (bukan di awal), FAB Jalanin disembunyikan di tab Asisten (plus fix spesifisitas CSS [hidden]), panel chip contoh di layar kosong chat dihapus, sapaan harian kini dinamis menyapa nama pengguna yang login"
  ],
  bug_ditutup: [
    "kuliner-store.js: 'ceritakan tentang chili crab' salah kembalikan data negara Chili karena datariesBridge.factoid() jalan sebelum kulinerStore.tryKuliner() - dipindah ke checkpoint dini (pola 'fuzzy-match shadows precise-handler' yang berulang lagi dari ronde sebelumnya)",
    "findKuliner(): fuzzy fallback dua arah bikin 'chili' (negara Chile) salah tangkap ke 'Chili Crab' - dipersempit jadi satu arah (query harus memuat nama kuliner lengkap)",
    "context-engine.js: sinyal reset eksplisit tidak langsung berlaku di giliran yang sama karena agent.js menghitung opener kontinuitas SEBELUM memanggil noteTurnMood() (yang baru melakukan reset) - RESET_SIGNAL_RE dicek juga langsung di tryEmotionalContinuityOpener()",
    "js/chat/chat.js typeReply(): span.time ditempel ke DOM SEBELUM animasi ketik mulai, membuat jam tampil sejak karakter pertama lalu 'melompat' turun tiap frame mengikuti tinggi body yang masih tumbuh - dipindah ke setelah animasi selesai",
    "travel #fab: atribut hidden tidak cukup menyembunyikan tombol karena '#fab { display: flex }' punya spesifisitas CSS lebih tinggi dari default browser '[hidden]{display:none}' - ditambah aturan #fab[hidden]{display:none} eksplisit"
  ],
  kpi: {
    bench: "1063 -> 1190 (+127: +52 tokoh, +12 hari internasional, +35 kuliner, +9 kontinuitas emosi, +19 5 Whys/SWOT), core-suite 100% di setiap Bagian dan verifikasi akhir",
    kv_baku: "ronde-v6-final Q=82 -> ronde-v7-final Q=82 (stabil, tidak regresi) - A=70 (A_feedbackStore belum ada rating n=0 default 70%) K=68 U=100 D=100 V=100, n_K=57/60",
    verifikasi_akhir: "17/17 checklist lolos (melebihi target 16+) mencakup seluruh 5 Bagian + 4 perbaikan UI + smoke test Jalanin travel sub-app, 0 error konsol, 0 404 di server lokal",
    deployment_vercel: "PERTAMA KALI diverifikasi langsung lewat Vercel MCP (menutup celah yang diakui di laporan Ronde v6): project rategoan (prj_e792RV9zig2hon42JXsgVeax5BIO) ditemukan, deployment production terkini (commit merge Bagian 5) berstatus READY, 0 runtime error 7 hari terakhir, HTML live rategoan.vercel.app diambil langsung dan dikonfirmasi memuat perbaikan UI (panel chip contoh sudah hilang)",
    data_tokoh: "236/400 entri (59%) - +91 ditambahkan bertahap tanpa fabrikasi, 8 duplikat tak sengaja ditemukan & dihapus sebelum masuk",
    hari_internasional: "158/200 (79%, +12 - jujur di bawah target ronde karena sumber pencarian kembali memberi tanggal saling bertentangan untuk sejumlah hari lain, sengaja tidak ditebak)"
  }
};
