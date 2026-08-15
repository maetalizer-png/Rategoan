export default {
  id: "ronde-v3-gabungan-final",
  judul: "Ronde v3 Gabungan Final — Fix Chat, Devlog Total, K, Stub",
  tanggal: "2026-08-15",
  komit: [
    "e6764fc",
    "1a9536b",
    "94235f3",
    "ff8c9cc",
    "ffef921",
    "a156d8c",
    "8a1ac6c",
    "0de56d2"
  ],
  ringkasan: "Delapan bagian: fix 3 bug chat nyata dari laporan pengguna (goyang horizontal, keyboard menutup composer, animasi ketik hilang untuk balasan pendek); rekonstruksi penuh riwayat proyek jadi raget-devlog/ (13 entri sejarah + 4 grup JSONL bertema, digali dari git log dan 5 laporan resmi); integrasi devlog ke Raget lewat 6 tool baru dengan guard anti-narsis ketat; rewrite 185 entri dataries (tokoh/sejarah/ekonomi/penemuan) dan perbaikan format daftar wisata/makanan/minuman untuk menaikkan K dari 57% ke 73%; perbaikan bug nyata fitur baca-PDF yang tidak pernah berfungsi sejak dibangun (CDN URL pdf.js v4 salah - hanya ES module, bukan classic script) plus pemecahan bench jadi core/stub suite; penemuan dan perbaikan bug reverse-lookup (regex tidak mengakomodasi kata 'apa'); bench +18 kasus dan verifikasi konsolidasi akhir.",
  fitur_baru: [
    "Fix --vv-top (visualViewport.offsetTop tracking) - composer tetap di atas keyboard virtual",
    "Animasi ketik untuk semua balasan follow-mode (skip <=140 karakter dihapus)",
    "raget-devlog/ - 13 entri sejarah + keputusan/arsitektur/ux/bug.jsonl (43 entri tematik)",
    "6 tool devlog: sejarahmu, cara kerjamu, jilid/ronde X ngapain, bug tersulit, siapa pembuatmu, perkembangan skormu",
    "tools/append-devlog.mjs - hook self-updating devlog",
    "PDF nyata: vault/pdf/reader.js diperbaiki pakai dynamic import ES module, diverifikasi ekstrak teks asli",
    "tools/run-bench.mjs - bench runner permanen dengan pemisahan core-suite/stub-suite"
  ],
  bug_ditutup: [
    "Goyang horizontal + garis di atas keyboard (msg-actions meluap viewport)",
    "Keyboard virtual menutup composer (visualViewport hanya melacak height, bukan offsetTop)",
    "Balasan pendek tidak dianimasikan (aturan skip <=140 karakter)",
    "Fitur baca-PDF tidak pernah berfungsi sejak Bagian 1 (5fcc039) - CDN URL menunjuk build yang tidak ada di pdfjs-dist@4.x",
    "tryReverseLookup() regex tidak mengakomodasi kata 'apa' pada 'negara apa yang bahasanya/mata uangnya X'",
    "splitPossessiveSuffix() tidak konsisten antara factoid() dan extras()"
  ],
  kpi: {
    quality: "Q=77->81 (A70/K73/U100/D90/V100, K naik dari 57% ke 73%, target >=65 tercapai)",
    bench: "core-suite 307/307 (100%), stub-suite 1/10 (informatif), 299->317 kasus (+18)",
    dataries: "185 entri di-rewrite (tokoh 105, sejarah 49, ekonomi 15, penemuan 16) jadi 2+ kalimat",
    devlog: "13 entri sejarah, 61 commit terlacak, 43 entri JSONL tematik",
    verifikasi: "19/19 Playwright (fix chat + devlog + guard + PDF nyata), 0 error konsol"
  }
};
