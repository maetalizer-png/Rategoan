import { $ } from '../core/utils.js';
import { history } from './history.js';
import { store } from '../core/store.js';

export const histmenu = Object.freeze({
  init() {
    const list = $('history-list');
    if (!list) return;
    list.addEventListener('contextmenu', (e) => this.onContext(e));
  },
  onContext(e) {
    const li = e.target.closest('.hist-item');
    if (!li) return;
    e.preventDefault();
    const idx = parseInt(li.dataset.idx, 10);
    const sessions = store.state.sessions;
    const s = sessions[idx];
    if (!s) return;
    const action = prompt('Pilih: 1=Ubah nama, 2=Pin, 3=Ekspor, 4=Hapus');
    if (action === '1') {
      const title = prompt('Nama chat:', s.title);
      if (title) {
        s.title = title;
        store.save();
        history.render();
      }
    } else if (action === '2') {
      s.pinned = !s.pinned;
      store.save();
      history.render();
    } else if (action === '3') {
      const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (s.title || 'chat') + '.json';
      a.click();
    } else if (action === '4') {
      if (confirm('Hapus chat ini?')) {
        sessions.splice(idx, 1);
        store.save();
        history.render();
      }
    }
  },
});

window.RG = window.RG || {};
window.RG.histmenu = histmenu;
