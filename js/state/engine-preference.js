// Preferensi pengguna soal otak mana yang ingin dipakai (Template vs
// Neural - dua-duanya milik Rategoan sendiri), dipilih lewat #model-sheet
// (lihat js/sheets/model-sheet.js) dan dibaca raget-agents/engine-router.js
// untuk menentukan siapa dicoba duluan. Neural#status().ready sudah
// true - memilih Neural di sini sungguh mengganti otak yang menjawab,
// meski hasil generasinya belum koheren gramatikal - lihat
// docs/ARSITEKTUR.md bagian "Aturan router".
const KEY = 'raget_engine_preference';

export const enginePreference = {
  KEY,
  get() {
    return localStorage.getItem(KEY) === 'neural' ? 'neural' : 'template';
  },
  set(pref) {
    try {
      localStorage.setItem(KEY, pref === 'neural' ? 'neural' : 'template');
    } catch (e) {}
  },
};
