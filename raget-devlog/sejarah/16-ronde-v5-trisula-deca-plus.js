export default {
  id: "ronde-v5-trisula-deca-plus",
  judul: "Ronde v5 TRISULA DECA++ — 6 mesin baru (STEM, sosial, konteks, dunia, kerangka berpikir, tokoh)",
  tanggal: "2026-08-16",
  komit: [
    "ff7299b",
    "1d88e29",
    "874aaf7",
    "a861821",
    "7260544",
    "3facdfc"
  ],
  ringkasan: "Ronde besar menambah 6 modul AI baru: stem-engine.js (matematika lanjut, fisika, teknologi, biologi), social-engine.js (intent sosial, kerangka customer service LATTE/HEARD/3A, natural chat), context-engine.js (lokasi opt-in, sapaan sadar-waktu, klasifikasi situasi darurat, saran langkah selanjutnya), world-context.js (105 hari internasional, deteksi 5 bahasa, auto-mode Jelajah Dunia), intelligence-rumus.js (21 kerangka berpikir/keputusan/belajar bernama), dan tokoh-store.js (data tokoh terstruktur 45 entri). Setiap Bagian diikuti pengujian langsung yang menemukan dan memperbaiki tabrakan pipeline nyata sebelum masuk bench, mengikuti pola 'temukan lewat pengujian, bukan tebakan' yang sudah mapan di ronde-ronde sebelumnya. Diakhiri cleanup wajib menghapus referensi proyek tidak terkait dari riwayat/devlog sebelum ronde ini dimulai.",
  fitur_baru: [
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
  bug_ditutup: [
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
  kpi: {
    bench: "501 -> 841 (+340 kasus core-suite, 100% pass di setiap Bagian dan verifikasi akhir)",
    kv_baku: "Q=81 K=73 A=70 U=100 D=90 V=100 (identik v4 - 100 kueri baku KV tidak menyentuh satupun dari 6 modul baru ronde ini, sudah diketahui sebagai keterbatasan metodologi pengukuran, bukan regresi)",
    verifikasi_akhir: "16/16 checklist lolos lewat 2 konteks browser terpisah, mencakup 5 skenario bernama: percakapan multi-turn, situasi darurat, diskusi budaya, kueri tokoh, kueri fisika",
    data_tokoh: "45/400 entri (11.25%) - dilaporkan jujur, bukan dipaksakan atau difabrikasi; 45 entri dipilih beririsan dengan 108 entri ringkas lama untuk PENDALAMAN, bukan duplikasi"
  }
};
