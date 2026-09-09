// Preferensi pengguna soal otak mana yang ingin dipakai (Template vs
// Neural), dipilih lewat #model-sheet (lihat js/sheets/model-sheet.js) dan
// dibaca raget-agents/engine-router.js untuk menentukan urutan pencarian
// Neural vs Template (llm-lokal selalu dicoba lebih dulu - belum ada UI
// untuk memilihnya, lihat docs/ARSITEKTUR.md). Karena Neural#status().ready
// masih selalu false hari ini, jawaban tetap dari Template apa pun
// preferensinya - lihat docs/ARSITEKTUR.md bagian "Aturan router".
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
