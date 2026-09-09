// Isi #model-sheet (lihat index.html) dari status adapter nyata, bukan
// markup statis. Menampilkan "Raget Template" (selalu bisa dipilih) dan
// "Raget Neural" (tampil tapi ditandai jelas belum bisa dipakai, disabled
// secara visual, tidak bisa benar-benar dipilih). "Raget LLM Lokal"
// SENGAJA tidak ditampilkan di sini - masih stub kosong tanpa isi, jadi
// menampilkannya sebagai pilihan cuma akan membingungkan pengguna dengan
// opsi yang tidak benar-benar bisa dipakai (lihat docs/ARSITEKTUR.md).
import { $ } from '../utils/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';

const VISIBLE_ENGINE_IDS = ['template', 'neural'];
const NEURAL_NOTE =
  'Belum bisa dipakai — hasil belum koheren secara gramatikal. Jawaban tetap otomatis dari Raget Template.';

function renderItem(info, selected) {
  const item = document.createElement('div');
  item.className = 'model-item' + (selected ? ' active' : '') + (info.ready ? '' : ' disabled');
  item.dataset.engine = info.id;
  if (!info.ready) item.setAttribute('aria-disabled', 'true');

  const name = document.createElement('span');
  name.className = 'model-name';
  name.textContent = info.label;
  item.appendChild(name);

  if (!info.ready && info.id === 'neural') {
    const note = document.createElement('div');
    note.className = 'model-note';
    note.textContent = NEURAL_NOTE;
    item.appendChild(note);
  }
  return item;
}

function render() {
  const sheet = $('model-sheet');
  const list = sheet && sheet.querySelector('.model-list');
  if (!list) return;

  const statusById = {};
  engineRouter.statusAll().forEach((info) => {
    statusById[info.id] = info;
  });

  const pref = enginePreference.get();
  list.innerHTML = '';
  VISIBLE_ENGINE_IDS.forEach((id) => {
    const info = statusById[id] || { id, label: id, ready: false, reason: '' };
    const item = renderItem(info, pref === id);
    item.onclick = () => {
      if (!info.ready) return; // Neural belum ready - tidak bisa benar-benar dipilih
      enginePreference.set(id);
      render();
    };
    list.appendChild(item);
  });
}

export const modelSheet = { render };
