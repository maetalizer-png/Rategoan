'use strict';
window.RG = window.RG || {};

RG.settings = {
  _warned: false,
  refresh() {
    const st = RG.auth.state;
    const head = RG.$('profile-head');
    const divider = RG.$('profile-divider');
    const avatar = RG.$('profile-avatar');
    const name = RG.$('profile-name');
    const mail = RG.$('profile-mail');
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
    const info = RG.$('storage-info');
    if (info) {
      const sessions = RG.store.get().sessions;
      const kb = Math.max(1, Math.round(RG.storage.usage() / 1024));
      const pct = RG.storage.percent();
      info.textContent = sessions.length + ' chat • ' + kb + ' KB (' + pct + '%)';
      if (pct >= 80 && !this._warned) {
        this._warned = true;
        RG.toast.show('Penyimpanan hampir penuh (' + pct + '%)');
      }
    }
    const pinInfo = RG.$('pin-info');
    if (pinInfo) pinInfo.textContent = RG.pin.has() ? 'Aktif' : 'Nonaktif';
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.font === RG.font.value);
    });
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.classList.toggle('active', b.dataset.theme === RG.theme.value);
    });
  },
  bind() {
    RG.$('btn-settings').onclick = () => {
      RG.drawer.close();
      this.refresh();
      RG.router.go('settings');
    };
    RG.$('btn-back').onclick = () => RG.router.go('chat');
    document.querySelectorAll('.theme-btn').forEach((b) => {
      b.onclick = () => {
        RG.theme.set(b.dataset.theme);
        this.refresh();
      };
    });
    document.querySelectorAll('.font-btn').forEach((b) => {
      b.onclick = () => {
        RG.font.set(b.dataset.font);
        this.refresh();
      };
    });
    RG.$('row-clear-chat').onclick = () => RG.history.clearAll();
    RG.$('row-logout').onclick = () => {
      RG.auth.logout();
      RG.account.refresh();
      RG.haptics.tap(15);
      RG.toast.show('Anda keluar');
      RG.router.go('login');
    };
    RG.$('row-backup').onclick = () => RG.backup.export();
    RG.$('row-restore').onclick = () => RG.$('pick-restore').click();
    RG.$('row-pin').onclick = () => {
      if (RG.pin.has()) {
        RG.pin.clear();
        RG.toast.show('Kunci dinonaktifkan');
      } else {
        const p = prompt('Buat PIN (4-6 digit):');
        if (p === null) return;
        if (/^\d{4,6}$/.test(p)) {
          RG.pin.set(p);
          RG.toast.show('Kunci diaktifkan');
        } else {
          RG.toast.show('PIN harus 4-6 digit');
        }
      }
      this.refresh();
    };
    this.refresh();
  },
};