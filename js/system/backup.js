import { $ } from '../../shared/dom.js';
import { haptics } from '../../shared/haptics.js';
import { download } from '../../shared/clipboard.js';
import { toast } from '../core/toast.js';
import { store } from '../state/store.js';
import { history } from '../history/history.js';
import { chat } from '../chat/chat.js';
import { exportLog } from '../../raget/raget-memory/export-log.js';

export const SENSITIVE_STORAGE_KEYS = new Set([
  'rategoan_connectors_vault',
  'rategoan_connectors_aes',
  'rategoan_pin',
  'rategoan_pin_fail',
  'rategoan_auth',
  'rategoan_weights_1_5b_installed',
  'rategoan_weights_1_5b_parts',
  'rategoan_chunks_mask',
]);

export function isSafeBackupKey(key) {
  const k = String(key || '');
  if (!k || SENSITIVE_STORAGE_KEYS.has(k)) return false;
  if (k.indexOf('rategoan_chunks_') === 0) return false;
  return /^(rategoan_|raget_|travel_)/.test(k);
}

export const backup = {
  export() {
    if (typeof window !== 'undefined' && !window.confirm('Unduh cadangan obrolan perangkat ini?')) return;
    const st = store.get();
    const local = {};
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!isSafeBackupKey(key)) continue;
      local[key] = localStorage.getItem(key);
    }
    const payload = {
      app: 'rategoan',
      version: 2,
      exportedAt: Date.now(),
      sessions: st.sessions,
      local,
    };
    download('rategoan-' + new Date().toISOString().slice(0, 10) + '.rategoan.json', JSON.stringify(payload, null, 2));
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
        if (data.local && typeof data.local === 'object') {
          Object.keys(data.local).forEach((key) => {
            if (isSafeBackupKey(key) && typeof data.local[key] === 'string') {
              localStorage.setItem(key, data.local[key]);
            }
          });
        }
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
