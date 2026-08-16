export default {
  id: 'trisula-ultra',
  judul: 'Trisula Ultra — Koleksi, Otak Raget, dan Jelajah Dunia',
  tanggal: '2026-08-14',
  komit: ['4bfa603', '69c3489', '82498f3', '1c6b634'],
  ringkasan:
    'Tiga bagian besar digabung satu ronde: Koleksi — perpustakaan pribadi baru di sidebar dengan 13 sub-fitur (tab Semua/Pesan/Catatan/Artefak, pencarian fuzzy Levenshtein, pin/arsip, tag; keyspace raget_collection); delapan kemampuan penalaran baru untuk Raget (superlatif, agregasi region, reverse lookup, konversi satuan/mata uang, penalaran tanggal, anafora, fewshot lokal) plus dataset yang bertambah; empat belas fitur baru Jalanin (countdown, leaderboard kuis, TTS sapaan, favorit, bandingkan negara, dll). Didahului fix cepat 4bfa603 (hapus badge api/angka sidebar, perjelas alur simpan Trip).',
  fitur_baru: [
    'Koleksi: bookmark sidebar, tab Semua/Pesan/Catatan/Artefak, pencarian fuzzy, tag, pin/arsip, tool "cari koleksi"',
    'Superlatif, agregasi region, reverse lookup (ibukota/mata uang→negara), konversi satuan & mata uang, penalaran tanggal, anafora lanjutan, fewshot lokal',
    'Countdown perjalanan, papan skor kuis, TTS otomatis Sapaan, chip terakhir-dilihat, bandingkan negara, favorit/bintang, detail badge, preset konverter, filter kota Wisata, ekspor jurnal Markdown',
  ],
  bug_ditutup: [
    'Navigasi sidebar sempat memblokir klik — drawer kini ditutup dulu sebelum aksi',
    'Pola reverse lookup & pencarian sejarah tidak cocok (7/7 re-tes lolos setelah fix)',
  ],
  kpi: {
    bench: '273/283 (96.5%)',
    K: '71% (n=24, sesi bersih) — turun ke 53-58% di sesi kumulatif campuran (jadi alasan lahirnya measure-kv.mjs di ronde berikutnya)',
    V: '67% (n=4, sampel kecil — ditandai "pantau")',
    boot: 'Rategoan 399ms, Jalanin 394ms',
    dataries: '290/350 target (83%) — kualitas dijaga di atas kuantitas',
    koleksi: '5 item tersimpan, 0 dipin',
  },
};
