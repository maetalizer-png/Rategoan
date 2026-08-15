export default {
  id: 'jilid-13',
  judul: 'Perintah Jilid 13 Final — Kualitas + Struktur',
  tanggal: '2026-08-14',
  komit: ['24a4cd8', 'bbba536', '05a0a33', '81e4ffc', '97c3a17'],
  ringkasan:
    'Satu eksekusi berurutan 1-9 di atas mesin Raget: DRY teks (utils/text.js), retrieval satu pintu (raget-retrieval/retrieve.js membungkus scorer.js), context stack (memory-context.js, entityStack(3)), planner dengan fallback berjenjang, modul kualitas resmi (quality.js, Q = 0.35A+0.25K+0.15U+0.15D+0.10V), migrasi storage besar ke IndexedDB (idb-gateway.js), UX nilai harian (TTS toggle, bedah_url nyata, briefing harian), dan bench +20. Tiga bug wrong-answer ditemukan dan ditutup di tengah jalan.',
  fitur_baru: [
    'utils/text.js — sumber tunggal STOPWORDS, hashText, pickVariant, meaningfulWords, detectTone',
    'raget-retrieval/retrieve.js — retrieval satu pintu (rank()/best(), ambang augmentasi 0.35 & daftar 0.25)',
    'raget-memory/memory-context.js — entityStack(3) + relationLast',
    'ai-agent/planner.js — fallback berjenjang berdasar skor keyakinan',
    'ai-agent/quality.js — Skor Kualitas Q = 0.35A+0.25K+0.15U+0.15D+0.10V',
    'raget-database/idb-gateway.js — gateway IndexedDB async dengan guard kuota',
    'TTS toggle (default OFF), bedah_url nyata via web/read-web.js, briefing harian, tool "ringkas hari saya"',
  ],
  bug_ditutup: [
    '"terima kasih ya" salah nangkep sebagai bahasa Hungaria (fuzzyEq substring tanpa batas panjang)',
    '"apa ibukota atlantis" nyasar ke jawaban Selandia Baru (riwayat chat ikut jadi korpus TF-IDF)',
    '"sebutkan manfaat olahraga" dijawab manfaat pemrograman modular (matchFewshot salah tangkap, ambang dinaikkan ke 0.5)',
    'Bonus: agent-tools.js memanggil hashText() tanpa impor — cara()/ide() selalu crash ReferenceError',
  ],
  kpi: {
    bench: '193→213 kasus, 181/193 (93.8%) → 204/213 (95.8%)',
    quality: 'Q=58 (A50/K24/U98/D100/V50) — baseline resmi pertama',
    localStorage: '64.0 KB / 5 kunci ringan (setelah 213 chat)',
    idb: 'Impor 300 chunk vault → localStorage 97 bytes (chunk 100% pindah ke IndexedDB)',
  },
};
