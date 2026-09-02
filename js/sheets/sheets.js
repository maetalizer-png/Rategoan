import { $ } from '../utils/dom.js';

export const sheets = {
  close() {
    $('attach-sheet').hidden = true;
    $('sheet-backdrop').classList.remove('show');
  },
  bind() {
    $('sheet-backdrop').onclick = () => this.close();
    $('attach-close').onclick = () => this.close();
  },
};
