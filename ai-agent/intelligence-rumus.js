// Perpustakaan kerangka berpikir/keputusan/pemecahan masalah/komunikasi/belajar.
// Catatan: "Teknik Pomodoro" SENGAJA tidak didefinisikan ulang di sini karena sudah ada
// sebagai entri pengetahuan di dataset/knowledge/produktivitas.json dan umum.json, dan
// terverifikasi lewat pengujian langsung bahwa "apa itu teknik pomodoro" sudah terjawab
// benar lewat memoryIndex. "Eisenhower Matrix" TETAP didefinisikan ulang di sini meski
// juga ada sebagai entri pengetahuan lama, karena pengujian langsung membuktikan entri
// lama itu ("Metode Eisenhower Matrix") tidak konsisten terjangkau oleh frasa natural
// "apa itu eisenhower matrix" lewat memoryIndex - checkpoint dict di sini berjalan lebih
// awal di pipeline sehingga menjamin jawaban lengkap tetap terjangkau.

const FRAMEWORKS = {
  'eisenhower matrix': {
    name: 'Eisenhower Matrix',
    kind: 'keputusan',
    desc: 'Eisenhower Matrix membagi tugas ke 4 kuadran berdasarkan penting-tidaknya dan mendesak-tidaknya: kerjakan sekarang (penting+mendesak), jadwalkan (penting+tidak mendesak), delegasikan (tidak penting+mendesak), dan hapus (tidak penting+tidak mendesak).',
  },
  '5w1h': {
    name: '5W1H',
    kind: 'berpikir',
    desc: '5W1H (What, Who, When, Where, Why, How) adalah kerangka investigasi menyeluruh: apa yang terjadi, siapa terlibat, kapan, di mana, kenapa, dan bagaimana caranya — dipakai untuk memahami suatu situasi secara lengkap sebelum bertindak.',
  },
  swot: {
    name: 'SWOT',
    kind: 'berpikir',
    desc: 'SWOT (Strengths, Weaknesses, Opportunities, Threats) adalah analisis kekuatan dan kelemahan internal, serta peluang dan ancaman eksternal — biasa dipakai untuk menilai posisi sebuah ide, proyek, atau bisnis.',
  },
  'first principles': {
    name: 'First Principles Thinking',
    kind: 'berpikir',
    desc: 'First Principles Thinking adalah cara berpikir dengan memecah masalah sampai ke kebenaran paling dasar yang tidak bisa disederhanakan lagi, lalu membangun solusi dari situ — bukan meniru solusi yang sudah ada (analogi).',
  },
  "occam's razor": {
    name: "Occam's Razor",
    kind: 'berpikir',
    desc: "Occam's Razor menyatakan bahwa di antara beberapa penjelasan yang mungkin, penjelasan paling sederhana (dengan asumsi paling sedikit) biasanya yang paling mendekati benar.",
  },
  "hanlon's razor": {
    name: "Hanlon's Razor",
    kind: 'berpikir',
    desc: "Hanlon's Razor menyatakan: jangan langsung menganggap sesuatu disebabkan niat jahat, kalau itu bisa dijelaskan cukup oleh kecerobohan atau ketidaktahuan biasa.",
  },
  'decision matrix': {
    name: 'Decision Matrix',
    kind: 'keputusan',
    desc: 'Decision Matrix membandingkan beberapa pilihan secara objektif: pilihan ditulis sebagai baris, kriteria penting sebagai kolom, tiap kriteria diberi bobot, lalu tiap pilihan diberi skor untuk dijumlahkan dan dibandingkan.',
  },
  pareto: {
    name: 'Prinsip Pareto (80/20)',
    kind: 'keputusan',
    desc: 'Prinsip Pareto (aturan 80/20) menyatakan sekitar 80% hasil biasanya berasal dari 20% penyebab utama — jadi fokuskan energi ke sedikit hal yang paling berdampak, bukan menyebar rata ke semua hal.',
  },
  'opportunity cost': {
    name: 'Opportunity Cost',
    kind: 'keputusan',
    desc: 'Opportunity cost (biaya peluang) adalah nilai dari pilihan terbaik kedua yang kamu lepaskan saat memilih satu opsi — mengingatkan bahwa setiap keputusan punya "harga" tersembunyi berupa peluang yang tidak diambil.',
  },
  'expected value': {
    name: 'Expected Value',
    kind: 'keputusan',
    desc: 'Expected value (nilai harapan) adalah rata-rata semua kemungkinan hasil, masing-masing dikalikan peluang terjadinya — dipakai untuk membandingkan pilihan yang mengandung risiko/ketidakpastian secara lebih rasional.',
  },
  '5 whys': {
    name: '5 Whys',
    kind: 'pemecahan masalah',
    desc: '5 Whys adalah teknik bertanya "kenapa" berulang kali (biasanya 5x) untuk menggali dari gejala di permukaan sampai ke akar masalah sebenarnya, bukan cuma menambal gejalanya.',
  },
  fishbone: {
    name: 'Fishbone Diagram (Ishikawa)',
    kind: 'pemecahan masalah',
    desc: 'Fishbone Diagram (diagram Ishikawa) memetakan kemungkinan penyebab suatu masalah ke beberapa kategori (misalnya orang, proses, alat, lingkungan) dalam bentuk visual menyerupai tulang ikan, supaya penyebab tidak ada yang terlewat.',
  },
  'design thinking': {
    name: 'Design Thinking',
    kind: 'pemecahan masalah',
    desc: 'Design Thinking adalah proses pemecahan masalah berpusat pada manusia lewat 5 tahap: Empathize (pahami pengguna), Define (rumuskan masalah), Ideate (cari ide), Prototype (buat purwarupa), Test (uji dan perbaiki).',
  },
  triz: {
    name: 'TRIZ',
    kind: 'pemecahan masalah',
    desc: 'TRIZ (Theory of Inventive Problem Solving) adalah metode memecahkan kontradiksi teknis tanpa kompromi, memakai pola solusi dari ribuan paten yang sudah ada — alih-alih mengorbankan satu aspek demi aspek lain.',
  },
  'pyramid principle': {
    name: 'Pyramid Principle',
    kind: 'komunikasi',
    desc: 'Pyramid Principle menyusun komunikasi dari atas ke bawah: mulai dari kesimpulan/jawaban utama dulu, baru diikuti argumen pendukung, lalu detail — supaya pendengar langsung tahu inti pesan tanpa menunggu.',
  },
  'star method': {
    name: 'STAR Method',
    kind: 'komunikasi',
    desc: 'STAR Method (Situation, Task, Action, Result) adalah struktur menjawab pertanyaan wawancara berbasis pengalaman: ceritakan situasinya, tugas yang dihadapi, tindakan yang diambil, dan hasil akhirnya.',
  },
  nvc: {
    name: 'Komunikasi Nonkekerasan (NVC)',
    kind: 'komunikasi',
    desc: 'Komunikasi Nonkekerasan (Nonviolent Communication/NVC) dari Marshall Rosenberg punya 4 komponen: Observasi (fakta tanpa menghakimi), Perasaan, Kebutuhan, dan Permintaan — membantu menyampaikan sesuatu tanpa menyalahkan.',
  },
  'active listening': {
    name: 'Active Listening',
    kind: 'komunikasi',
    desc: 'Active Listening (mendengarkan aktif) berarti benar-benar fokus memahami lawan bicara, bukan sekadar menunggu giliran bicara — biasanya melibatkan memparafrasekan atau mengulang balik apa yang didengar untuk memastikan paham.',
  },
  feynman: {
    name: 'Teknik Feynman',
    kind: 'belajar',
    desc: 'Teknik Feynman adalah cara belajar dengan menjelaskan suatu konsep memakai bahasa paling sederhana, seolah mengajarkannya ke anak kecil — bagian yang sulit dijelaskan menunjukkan bagian yang belum benar-benar kamu pahami.',
  },
  'spaced repetition': {
    name: 'Spaced Repetition',
    kind: 'belajar',
    desc: 'Spaced Repetition adalah teknik belajar dengan mengulang materi pada interval waktu yang makin melebar (misalnya besok, lalu 3 hari lagi, lalu seminggu lagi) untuk memperkuat ingatan jangka panjang secara efisien.',
  },
  "bloom's taxonomy": {
    name: "Bloom's Taxonomy",
    kind: 'belajar',
    desc: "Bloom's Taxonomy adalah hierarki tingkat pemahaman belajar dari yang paling dasar ke paling tinggi: Mengingat, Memahami, Menerapkan, Menganalisis, Mengevaluasi, dan Mencipta.",
  },
};

const ALIASES = {
  'occam razor': "occam's razor",
  'pisau occam': "occam's razor",
  'hanlon razor': "hanlon's razor",
  'pisau hanlon': "hanlon's razor",
  'prinsip pareto': 'pareto',
  'aturan 80/20': 'pareto',
  'biaya peluang': 'opportunity cost',
  'nilai harapan': 'expected value',
  'diagram tulang ikan': 'fishbone',
  'diagram ishikawa': 'fishbone',
  'metode star': 'star method',
  'komunikasi nonkekerasan': 'nvc',
  'mendengarkan aktif': 'active listening',
  'teknik feynman': 'feynman',
  'taksonomi bloom': "bloom's taxonomy",
  'pengulangan berjarak': 'spaced repetition',
};

function tryFrameworkLookup(text) {
  const t = text.toLowerCase();
  if (!/^(apa\s*itu|jelaskan|apa\s*yang\s*dimaksud\s*dengan)\b/.test(t)) return null;
  for (const key of Object.keys(ALIASES)) {
    if (t.includes(key)) return FRAMEWORKS[ALIASES[key]].desc;
  }
  for (const key of Object.keys(FRAMEWORKS)) {
    if (t.includes(key)) return FRAMEWORKS[key].desc;
  }
  return null;
}

// ---------- CONTEXTUAL SUGGESTION (saat user minta bantuan mikir tanpa sebut nama kerangka) ----------

const SUGGEST_SETS = [
  {
    match: /bingung\s+(mau\s+)?(ambil\s+)?keputusan|susah\s+milih|harus\s+pilih\s+(yang\s+)?mana/i,
    intro: 'Untuk bantu ambil keputusan, coba kerangka ini:',
    items: [FRAMEWORKS['decision matrix'], FRAMEWORKS['expected value'], FRAMEWORKS['opportunity cost']],
  },
  {
    match: /kenapa\s+masalah\s+ini\s+(terus|selalu)\s+(terjadi|berulang)|akar\s+masalahnya\s+apa/i,
    intro: 'Untuk gali akar masalahnya, coba kerangka ini:',
    items: [FRAMEWORKS['5 whys'], FRAMEWORKS.fishbone],
  },
  {
    match: /bingung\s+strukturnya|susun\s+presentasi|nyusun\s+laporan/i,
    intro: 'Untuk menyusun komunikasi yang jelas, coba kerangka ini:',
    items: [FRAMEWORKS['pyramid principle'], FRAMEWORKS['5w1h']],
  },
  {
    match: /susah\s+paham\s+materi|susah\s+ingat\s+pelajaran|belajar\s+lebih\s+efektif/i,
    intro: 'Untuk belajar lebih efektif, coba kerangka ini:',
    items: [FRAMEWORKS.feynman, FRAMEWORKS['spaced repetition']],
  },
  {
    match: /analisis\s+(bisnis|proyek|ide)\s+ini|evaluasi\s+(bisnis|proyek|ide)\s+ini/i,
    intro: 'Untuk menganalisis ide/proyek ini, coba kerangka ini:',
    items: [FRAMEWORKS.swot, FRAMEWORKS['first principles']],
  },
];

function trySuggestFramework(text) {
  const t = text.toLowerCase();
  if (!/\b(bantu|tolong)\b.*\b(mikir|pikir|memikirkan)\b|\bkasih\s+kerangka\s+berpikir\b/i.test(t) && !SUGGEST_SETS.some((s) => s.match.test(t))) return null;
  const set = SUGGEST_SETS.find((s) => s.match.test(t));
  const items = set ? set.items : [FRAMEWORKS['5w1h'], FRAMEWORKS['first principles'], FRAMEWORKS['decision matrix']];
  const intro = set ? set.intro : 'Beberapa kerangka berpikir umum yang bisa membantu:';
  return intro + '\n' + items.map((f, i) => `${i + 1}. ${f.name} — ${f.desc.split('.')[0]}.`).join('\n') + '\n\nMau saya jelaskan salah satunya lebih detail?';
}

// ---------- COMBINED ----------

function tryIntelligenceRumus(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return tryFrameworkLookup(t) || trySuggestFramework(t) || null;
}

export const intelligenceRumus = Object.freeze({
  FRAMEWORKS,
  tryFrameworkLookup,
  trySuggestFramework,
  tryIntelligenceRumus,
});
