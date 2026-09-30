import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { download } from '../utils/clipboard.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { history } from '../history/history.js';
import { chat } from '../chat/chat.js';
import { exportLog } from '../../raget/raget-memory/export-log.js';

export const backup = {
  export() {
    const st = store.get();
    const payload = {
      app: 'rategoan',
      version: 1,
      exportedAt: Date.now(),
      sessions: st.sessions,
    };
    download('rategoan-backup-' + new Date().toISOString().slice(0, 10) + '.json', JSON.stringify(payload, null, 2));
    haptics.tap(10);
    exportLog.logExport('backup', 'rategoan-backup');
    toast.show('Cadangan diunduh');
  },
  onPick(input) {
    const f = input.files && input.files[0];
    input.value = '';
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const data = JSON.parse(r.result);
        if (!data || !Array.isArray(data.sessions)) throw new Error('format');
        store.set({ sessions: data.sessions, currentId: null });
        store.save();
        history.render();
        chat.renderMessages();
        haptics.tap(10);
        toast.show('Pulihkan berhasil: ' + data.sessions.length + ' chat');
      } catch (e) {
        toast.show('File cadangan tidak valid');
      }
    };
    r.readAsText(f);
  },
  bind() {
    $('pick-restore').onchange = (e) => this.onPick(e.target);
  },
};
