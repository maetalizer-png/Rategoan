import { $ } from '../core/utils.js';

export const sheets = Object.freeze({
  backdrop: null,
  init() {
    this.backdrop = $('sheet-backdrop');
    if (this.backdrop) {
      this.backdrop.onclick = () => this.closeAll();
    }
  },
  closeAll() {
    const sheets = document.querySelectorAll('.sheet');
    sheets.forEach(s => s.hidden = true);
    if (this.backdrop) this.backdrop.classList.remove('show');
  },
});

window.RG = window.RG || {};
window.RG.sheets = sheets;
