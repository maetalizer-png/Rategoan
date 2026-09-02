import { $ } from '../utils/dom.js';

export const sheets = {
  close() {
    $('attach-sheet').hidden = true;
    $('model-info-sheet').hidden = true;
    $('sheet-backdrop').classList.remove('show');
  },
  openModelInfo() {
    $('model-info-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  bind() {
    $('sheet-backdrop').onclick = () => this.close();
    $('attach-close').onclick = () => this.close();
    $('model-info-close').onclick = () => this.close();
  },
};
