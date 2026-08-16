export default {
  id: 'travel-integrasi',
  judul: 'Travel-Integrasi — Jalanin masuk ke Rategoan, app.js dipecah 16 modul',
  tanggal: '2026-08-14',
  komit: ['4dc9b2b', 'e54e400'],
  ringkasan:
    'Jalanin (produk travel offline) dibuka langsung dari tombol + Rategoan lewat kartu "Jelajah Dunia" (sheet iframe same-origin). Seluruh app.js 980-baris Jalanin dipecah jadi 16 modul JS + 3 modul CSS di export/travel/, dengan 4 fitur baru: sub-mode Wisata/Kuliner di Jelajah, kartu iklim berbasis region, jurnal catatan per rencana trip, dan tombol instal PWA jujur (hanya tampil saat beforeinstallprompt benar-benar tersedia).',
  fitur_baru: [
    'Kartu "Jelajah Dunia" di tombol + Rategoan → sheet iframe same-origin',
    'app.js 980→64 baris (HANYA init+navigasi); 16 modul JS + 3 modul CSS',
    'Sub-mode Negara | Wisata | Kuliner di Jelajah',
    'Kartu iklim per region (features/climate.js)',
    'Jurnal catatan per rencana trip (features/journal.js, travel_journal)',
    'Tombol instal PWA jujur (features/install.js)',
  ],
  bug_ditutup: [],
  kpi: {
    smoke: '6/6 checklist inti + 8 pemeriksaan fitur baru = 14/14',
    appJs: '980 → 64 baris',
    diffKerangka: '40 baris di sisi Rategoan (index.html +26, attach.js +14)',
    boot404: '2 → 0 (jalur impor dataries tunggal)',
  },
};
