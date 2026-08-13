import { $ } from '../utils/dom.js';
import { toast } from '../core/toast.js';

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
      toast.show('Aplikasi terpasang');
    });
    if (row) {
      row.onclick = async () => {
        if (!this.evt) {
          toast.show('Install tidak tersedia');
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
