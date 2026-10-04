const KEY = 'rategoan_skill';

const SKILLS = {
  umum: { label: 'Umum', prompt: '', tools: null },
  analis: { label: 'Analis Data', prompt: 'Keahlian aktif: Analis Data. Fokus pada angka, validasi tabel, dan kalkulasi presisi. Jangan berspekulasi.', tools: ['math_'] },
  kode: { label: 'Auditor Kode', prompt: 'Keahlian aktif: Auditor Kode. Fokus pada arsitektur, perbaikan aman, dan uji. Tampilkan kode yang bisa ditinjau.', tools: ['canvas_'] },
  penulis: { label: 'Penulis Teknis', prompt: 'Keahlian aktif: Penulis Teknis. Kunci format spesifikasi: tujuan, use-case, dan alur. Jangan menyimpang dari struktur itu.', tools: null },
  peneliti: { label: 'Peneliti', prompt: 'Keahlian aktif: Peneliti. Ambil fakta dari dokumen yang tersemat. Jangan mengarang di luar sumber.', tools: ['vault_'] },
};

export const skill = {
  all: SKILLS,
  get() {
    const id = localStorage.getItem(KEY);
    return SKILLS[id] ? id : 'umum';
  },
  set(id) {
    try { localStorage.setItem(KEY, SKILLS[id] ? id : 'umum'); } catch (e) { console.warn('[Rategoan Fallback] skill:', e); }
  },
  prompt() {
    return SKILLS[this.get()].prompt;
  },
  allows(name) {
    const tools = SKILLS[this.get()].tools;
    if (!tools) return true;
    return tools.some((prefix) => String(name || '').indexOf(prefix) === 0);
  },
};
