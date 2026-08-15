export default {
  id: 'fondasi-kualitas',
  judul: 'Bagian A-F — meta-knowledge, rumus kecerdasan, resolver terpadu',
  tanggal: '2026-08-14',
  komit: ['edc188c', '4a8d5fa', 'b7e64bd', '871cf23'],
  ringkasan:
    'Empat bagian berurutan yang membangun kerangka kualitas jawaban pertama: dataset meta-knowledge dan scorer.js berbasis TF-IDF/cosinus (A); rumus kecerdasan dengan answer-rules, formatByType, dan deteksi tipe jawaban (B); polish kasus nyata — perbaikan bug kabar, sapaan mirror, makanan, opener factoid (C); dan penambahan folder dataries baru plus resolver serta bench terpadu (D+E+F). Ini adalah cikal-bakal langsung dari quality.js (Q = 0.35A+0.25K+0.15U+0.15D+0.10V) yang baru resmi lahir di Jilid 13.',
  fitur_baru: [
    'scorer.js — TF-IDF + cosine similarity',
    'answer-rules + formatByType + deteksi tipe jawaban (ANSWER_TYPES)',
    'Resolver terpadu lintas kategori dataries',
    'dataset/bench.json versi terpadu pertama',
  ],
  bug_ditutup: [
    'Bug kabar (berita) salah format',
    'Sapaan mirror tidak konsisten',
    'Bug makanan',
    'Opener factoid repetitif',
  ],
  kpi: { catatan: 'Fondasi ANSWER_TYPES yang kelak jadi komponen V (Variasi struktur) di quality.js.' },
};
