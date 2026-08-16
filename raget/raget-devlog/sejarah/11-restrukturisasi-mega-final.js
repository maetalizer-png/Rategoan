export default {
  id: 'restrukturisasi-mega-final',
  judul: 'Restrukturisasi Root, Evaluasi Otak & Polesan Antarmuka',
  tanggal: '2026-08-14',
  komit: ['9274365', '7792372', '506fd79', 'bd844ff', 'c77a006', '5ee966c', '241605e'],
  ringkasan:
    'Enam bagian: pindahkan export/travel/ ke travel/ di root lalu kelompokkan 11 folder modul vault lama ke satu vault/ (Bagian 1-2); naikkan kualitas jawaban Raget lewat dedup 7 entri negara ganda, guard entitas pendek, 10 pola alias/keyword, pola lokasi geografis baru, dan kenaikan probabilitas kekayaan jawaban faktoid (Bagian 3, tiga commit berurutan); tiga fitur baru Jalanin — Profil Saya, konverter mata uang penuh, paket offline opt-in network-first (Bagian 4); lima perbaikan UI/UX U1-U5 plus fix transisi keyboard patah-patah (Bagian 5).',
  fitur_baru: [
    'travel/ dipindah ke root; vault/ mengelompokkan pdf, notion, evernote, whatsapp, calendar, email, reminders, ocr, translate, web, export',
    'Dedup 7 entri negara ganda (Polandia, Ceko, Hungaria, Slowakia, Swiss, Austria, Kamerun): 170→163 entri unik',
    'Guard entitas pendek (containment-match butuh min. 3 karakter)',
    '10 pola alias/keyword baru + pola lokasi geografis ("X terletak dimana")',
    'Fallback dataries planner diperluas: negara + sains + olahraga (ambang 0.30)',
    'travel/js/views/profil.js — Profil Saya (streak 30 hari, akurasi, 6 badge)',
    'travel/js/features/currency.js — konverter mata uang penuh (21 kurs)',
    'travel/js/features/offline-pack.js — paket offline opt-in, network-first',
    'U1-U5: nol emoji UI, "Jelajah Dunia" navigasi penuh, chip empty-state diperbaiki, sheet Lampirkan direstruktur, header Settings sticky',
    'Bonus: debounce visualViewport.resize agar transisi keyboard tidak patah-patah',
  ],
  bug_ditutup: [
    '7 entri negara terduplikasi di region berbeda',
    'Kueri 2 huruf ("as","uk") salah cocok via substring tanpa batas panjang',
  ],
  kpi: {
    quality: 'Q=67→77 (K:30→56% n=96, V:50→83% n=5)',
    bench: '222/231 (96.1%) → 233/243 (95.9%)',
    smokeTravel: '14/14 → 24/24 (+10)',
    smokeVault: '13/13',
    cache: 'hit-rate kueri identik-berulang ~40-50% setelah normalisasi key (lowercase+buang tanda baca)',
  },
};
