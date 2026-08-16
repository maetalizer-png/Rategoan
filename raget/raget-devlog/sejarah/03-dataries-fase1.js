export default {
  id: 'dataries-fase1',
  judul: 'Dataries Fase 1 — data negara/kota/sapaan dunia',
  tanggal: '2026-08-14',
  komit: ['4295f0a'],
  ringkasan:
    'Kelahiran folder dataries/: dataset negara, kota, dan sapaan dunia pertama, disambungkan ke Raget lewat bridge factoid. Ini adalah fondasi arsitektur yang sampai sekarang masih dipakai — bridge terpisah (kini ai-agent/dataries-bridge.js) sebagai jalur khusus jawaban berbasis data terstruktur, terpisah dari mesin template rategoan-llm.',
  fitur_baru: [
    'dataries/ dengan data negara, kota, sapaan',
    'Bridge factoid pertama (cikal-bakal dataries-bridge.js)',
  ],
  bug_ditutup: [],
  kpi: { catatan: 'Fondasi arsitektur dataries yang tumbuh jadi 19 kategori & 1.856 entri (per Trisula Final v2).' },
};
