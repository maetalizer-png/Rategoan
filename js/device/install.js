import { $ } from '../core/utils.js';

export const install = Object.freeze({
  deferredPrompt: null,
  init() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      const row = $('row-install');
      if (row) row.hidden = false;
      row.onclick = () => this.promptInstall();
    });
    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      const row = $('row-install');
      if (row) row.hidden = true;
    });
  },
  async promptInstall() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const result = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
  },
});

window.RG = window.RG || {};
window.RG.install = install;
