// Toggle "Memori" di attach sheet (mirip Gemini) - ON/OFF eksplisit buat
// pakai/tidak pakai fakta yang sudah diingat (nama, kota, pekerjaan, dst,
// lihat memory-long.js) saat menjawab. Persisten lintas sesi chat (bukan
// per-pesan kayak toggle Pencarian Web) karena ini pengaturan personalisasi
// akun, bukan aksi sekali pakai. Default ON supaya perilaku lama (Raget
// selalu inget) tidak berubah buat pengguna yang belum pernah sentuh toggle
// ini.
const KEY = 'raget_memory_preference';

export const memoryPreference = {
  KEY,
  get() {
    try {
      return localStorage.getItem(KEY) !== 'off';
    } catch (e) {
      return true;
    }
  },
  set(active) {
    try {
      localStorage.setItem(KEY, active ? 'on' : 'off');
    } catch (e) {}
  },
};
