import { $ } from '../utils/dom.js';
import { modelSheet } from './model-sheet.js';

export const sheets = {
  close() {
    $('attach-sheet').hidden = true;
    $('model-sheet').hidden = true;
    $('sheet-backdrop').classList.remove('show');
  },
  openModel() {
    modelSheet.render();
    $('model-sheet').hidden = false;
    $('sheet-backdrop').classList.add('show');
  },
  bind() {
    $('sheet-backdrop').onclick = () => this.close();
    $('attach-close').onclick = () => this.close();
    $('model-close').onclick = () => this.close();
  },
};
