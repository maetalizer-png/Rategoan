import { $ } from '../../shared/dom.js';

export const install = {
  evt: null,
  bind() {
    const row = $('row-install');
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.evt = e;
      if (row) row.hidden = false;
    });
    window.addEventListener('appinstalled', () => {
      if (row) row.hidden = true;
      if (navigator.storage && typeof navigator.storage.persist === 'function') {
        navigator.storage.persist().catch(() => {});
      }
    });
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      navigator.storage.persist().catch(() => {});
    }
    if (row) {
      row.onclick = async () => {
        if (!this.evt) {
          return;
        }
        this.evt.prompt();
        await this.evt.userChoice;
        this.evt = null;
        row.hidden = true;
      };
    }
  },
};
