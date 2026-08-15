export default {
  id: 'trisula-final-v2',
  judul: 'Trisula Final v2 — Koleksi Hidup, Jelajah Rapi, Refactor Otak',
  tanggal: '2026-08-15',
  komit: ['f32d69c', '2adba37', '9d1f329', '8632743', 'a64cbc9', 'cd291db', '7b85edc', 'bcecc1f', 'f5443b7', '1bba84d'],
  ringkasan:
    'Sepuluh bagian: Koleksi tab hidup (race-guard render, 4 grup Perpustakaan, CTA Artefak — menutup bug 3 tab identik dari screenshot pengguna); Jelajah dikelompokkan per negara (menutup wall-of-chips 30+ item); Trip dengan panel "Rencana siap" + ekspor PDF/MD/WA; tab Asisten Travel baru (chat perencana + PDF); fix --vvh keyboard & :focus-visible; refactor agent.js (885→393 baris) dan dataries-bridge.js (1046→156 baris) jadi 13 modul satelit tanpa ubah API publik; +60 dataries & skrip pengukuran baku measure-kv.mjs; gate 7 item lama; verifikasi konsolidasi bench+16 & Playwright 23/23; laporan akhir.',
  fitur_baru: [
    'Koleksi: race-guard renderGen, 4 grup Perpustakaan (Catatan/Fakta diajarkan/Chunk impor/Pengetahuan), CTA Artefak 3 tombol',
    'Jelajah: kartu dikelompokkan per negara, dropdown kota, baris aksi gabungan',
    'Trip: panel "Rencana siap", label tanggal terlihat, ekspor PDF/MD/WA, kartu tersimpan',
    'Tab ke-5 Asisten Travel: chat perencana rule-based + ekspor PDF (raget_exports)',
    'Fix --vvh (garis keyboard hilang), :focus-visible (outline hanya untuk keyboard nav)',
    'Refactor: agent.js 885→393 baris (8 modul satelit tools-*), dataries-bridge.js 1046→156 baris (5 modul satelit bridge-*)',
    '+60 dataries (30 tokoh perempuan berpengaruh, 30 minuman Timur Tengah), tools/measure-kv.mjs — skrip pengukuran K/V baku pertama',
    'Gate 7 item: pencarian fuzzy, ringkas minggu, bersihkan duplikat, shortcut "/" dan "k", voice auto-send',
  ],
  bug_ditutup: [
    'Koleksi Tersimpan & Perpustakaan menampilkan konten identik (screenshot bug nyata)',
    'Wall-of-chips 30+ kota di filter Jelajah Wisata/Asia',
    'Input tanggal Trip tanpa label terlihat',
  ],
  kpi: {
    bench: '273/283 (96.5%) → 289/299 (96.7%)',
    quality: 'Q=77 stabil (A70/K57 n=60/U100/D90/V100 n=6) — diukur ulang identik di Bagian 10',
    refactor: 'agent.js -56%, dataries-bridge.js -85%, 0 perubahan API publik, 273/283 identik sebelum/sesudah',
    dataries: '1.856 entri total (+60 baru)',
    boot: '~450ms ke interaktif',
    playwright: '23/23 verify-bagian9.mjs, 0 error konsol, 0 404',
  },
};
