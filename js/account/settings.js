import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { store } from '../state/store.js';
import { auth } from '../state/auth.js';
import { theme } from '../state/theme.js';
import { font } from '../state/font.js';
import { storage } from '../state/storage.js';
import { pin } from '../state/pin.js';
import { drawer } from '../ui/drawer.js';
import { history } from '../history/history.js';
import { backup } from '../system/backup.js';
import { account } from './account.js';

export const settings = {
  _warned: false,
  refresh() {
    const st = auth.state;
    const head = $('profile-head');
    const divider = $('profile-divider');
    const avatar = $('profile-avatar');
    const name = $('profile-name');
    const mail = $('profile-mail');
    if (head && avatar && name && mail) {
      if (!st) {
        head.hidden = true;
        if (divider) divider.hidden = true;
      } else {
        head.hidden = false;
        if (divider) divider.hidden = false;
        if (st.method === 'gmail') {
          const local = String(st.id).split('@')[0] || 'user';
          const pretty = local.charAt(0).toUpperCase() + local.slice(1);
          avatar.textContent = pretty.charAt(0).toUpperCase();
          name.textContent = pretty;
          mail.textContent = st.id;
        } else {
          avatar.textContent = 'P';
          name.textContent = 'Pengguna Telepon';
          mail.textContent = st.id;
        }
      }
    }
    const info = $('storage-info');
    if (info) {
      const sessions = store.get().sessions;
      const kb = Math.max(1, Math.round(storage.usage() / 1024));
      const pct = storage.percent();
      info.textContent = sessions.length + ' chat • ' + kb + ' KB (' + pct + '%)';
      if (pct >= 80 && !this._warned) {
        this._warned = true;
        toast.show('Penyimpanan hampir penuh (' + pct + '%)');
      }
    }
    const pinInfo = $('pin-info');
    if (pinInfo) pinInfo.textContent = pin.has() ? 'Aktif' : 'Nonaktif';
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.font === font.value);
    });
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === theme.value);
    });
  },
  bind() {
    $('btn-settings').onclick = () => {
      drawer.close();
      this.refresh();
      router.go('settings');
    };
    $('btn-back').onclick = () => router.go('chat');
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.onclick = () => {
        theme.set(b.dataset.theme);
        this.refresh();
      };
    });
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.onclick = () => {
        font.set(b.dataset.font);
        this.refresh();
      };
    });
    $('row-clear-chat').onclick = () => history.clearAll();
    $('row-logout').onclick = () => {
      auth.logout();
      account.refresh();
      haptics.tap(15);
      toast.show('Anda keluar');
      router.go('login');
    };
    $('row-backup').onclick = () => backup.export();
    $('row-restore').onclick = () => $('pick-restore').click();
    $('row-pin').onclick = () => {
      if (pin.has()) {
        pin.clear();
        toast.show('Kunci dinonaktifkan');
      } else {
        const p = prompt('Buat PIN (4-6 digit):');
        if (p === null) return;
        if (/^\d{4,6}$/.test(p)) {
          pin.set(p);
          toast.show('Kunci diaktifkan');
        } else {
          toast.show('PIN harus 4-6 digit');
        }
      }
      this.refresh();
    };
    this.refresh();
  },
};
