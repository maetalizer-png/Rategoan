// Isi #model-sheet (lihat index.html) dari status adapter nyata, bukan
// markup statis. Menampilkan "Raget Template" dan "Raget Neural" - dua
// otak MILIK RATEGOAN SENDIRI, keduanya bisa benar-benar dipilih.
// Neural ditandai jujur sebagai eksperimental (hasil generasinya belum
// koheren secara gramatikal), tapi TIDAK disabled - memilihnya sungguh
// mengganti otak yang menjawab, apa adanya, bukan cuma tampilan
// (lihat docs/ARSITEKTUR.md).
import { $ } from '../utils/dom.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { enginePreference } from '../state/engine-preference.js';

const VISIBLE_ENGINE_IDS = ['template', 'neural'];
const NEURAL_NOTE =
  'Eksperimental — otak RATEGOAN sendiri, sudah dilatih tapi hasilnya kadang belum koheren secara gramatikal.';

function renderItem(info, selected) {
  const item = document.createElement('div');
  item.className = 'model-item' + (selected ? ' active' : '') + (info.ready ? '' : ' disabled');
  item.dataset.engine = info.id;
  if (!info.ready) item.setAttribute('aria-disabled', 'true');

  const name = document.createElement('span');
  name.className = 'model-name';
  name.textContent = info.label;
  item.appendChild(name);

  if (info.id === 'neural') {
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
      if (!info.ready) return;
      enginePreference.set(id);
      render();
    };
    list.appendChild(item);
  });
}

export const modelSheet = { render };
