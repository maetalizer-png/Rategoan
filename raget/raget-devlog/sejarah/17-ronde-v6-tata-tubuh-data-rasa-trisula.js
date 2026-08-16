export default {
  id: "ronde-v6-tata-tubuh-data-rasa-trisula",
  judul: "Ronde v6 — TATA TUBUH, TATA DATA, TATA RASA, + KELANJUTAN TRISULA",
  tanggal: "2026-08-16",
  komit: [
    "7f94ff7",
    "6bf2888",
    "0e62e00",
    "d5d79c6",
    "51345d7"
  ],
  ringkasan: "Ronde 5-bagian yang merapikan struktur folder (semua kode otak masuk ke raget/), merapikan lapisan data (dataset teks polos vs dataries terstruktur, komentar/emoji dibersihkan), memperbaiki 7 masalah akurasi nyata yang dilaporkan user langsung, menggandakan data tokoh sambil mengukur baku dengan kolom feedbackStore eksplisit, lalu menutup dengan 5 kemampuan kecerdasan baru: entity store kuliner, soal cerita matematika, ekspansi dunia (kota+hari internasional), kontinuitas emosi lintas giliran, dan mode 'terapkan' kerangka berpikir interaktif. Tiga bug nyata ditemukan dan diperbaiki lewat pengujian langsung sepanjang ronde ini: (1) import path yang lolos analisis statis tapi gagal di runtime browser (dynamic import, path lewat variabel), (2) alias negara Tiongkok/China berbeda antara sistem factoid dan sistem etika sehingga lookup etika kota-kota China selalu gagal, (3) entity kuliner presisi (\"Chili Crab\") tertangkap fuzzy-match ke negara tak berhubungan (\"Chili\") sebelum diperbaiki dengan checkpoint dini + fuzzy-match satu arah.",
  fitur_baru: [
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
  bug_ditutup: [
    "3 kelas import path lolos regex statis tapi gagal di browser: dynamic import() di dalam page.evaluate() (URL browser, bukan Node), path string dioper sebagai argumen fungsi helper lazy(), new URL() dengan string concatenation bukan literal tunggal",
    "'luas lautan indonesia' menjawab luas DARATAN (salah) karena RELATIONS generik 'luas' menangkap 'luas lautan' lebih dulu - dipisah jadi relasi khusus + honest-fallback saat data memang tiada",
    "'apa itu kimia' tertangkap fuzzy-match ke topik sempit ('Reaksi Kimia') alih-alih definisi bidang - dipindah ke checkpoint stemDict paling awal",
    "Pertanyaan region benua ('sebutkan negara di afrika') gagal total ke klarifikasi generik kecuali kebetulan cocok lewat retrieval fallback - tryRegionList() baru memetakan benua+subregion ke REGIONS yang sudah ada",
    "CITY_COUNTRY memakai nama 'China' tapi data etika memakai 'Tiongkok' sebagai country kanonis, membuat lookup etika kota-kota China selalu gagal - tryEtika() sekarang juga mencocokkan lewat tags",
    "'ceritakan tentang chili crab' tertangkap fuzzy-match dataries-bridge.js ke negara 'Chili' sebelum kulinerStore sempat dicek - dipindah ke checkpoint dini + findKuliner() dibuat fuzzy satu arah saja",
    "isSuperlativeQuery pada template opini awalnya cuma daftar kata tetap (tidak menangkap 'terenak', 'termurah', dst) - diganti pola umum prefiks 'ter-' + exclude-list kata non-superlatif"
  ],
  kpi: {
    bench: "841 -> 1063 (+222: +22 demo TATA RASA, +50 tokoh, +150 KELANJUTAN TRISULA), core-suite 100% di setiap Bagian dan verifikasi akhir",
    kv_baku: "ronde-v5-final Q=81 -> ronde-v6-final Q=82 (A=70 A_feedbackStore=belum ada rating n=0 default 70% K=68 U=100 D=100 V=100, n_K=57/60 - 12 kueri baku dirotasi mencerminkan kapasitas baru v6, 48 tetap untuk kontinuitas historis)",
    verifikasi_akhir: "23/23 checklist lolos (melebihi target 16+) mencakup seluruh 5 Bagian + smoke test Jalanin travel sub-app, 0 error konsol, 0 404 di server lokal (deployment Vercel tidak bisa diverifikasi langsung - URL produksi tidak diketahui sesi ini)",
    data_tokoh: "145/400 entri (36.25%) - +100 ditambahkan bertahap tanpa fabrikasi, memperdalam entri ringkas lama (penjelajah, pemimpin, perempuan berpengaruh, sains, seni, teknologi) + tokoh terkenal lain berfakta mapan",
    hari_internasional: "105 -> 146 (+41, jujur di bawah target ronde +95 - sebagian tanggal dari pencarian saling bertentangan/tergeser, sengaja tidak ditebak daripada berisiko salah tanggal)"
  }
};
