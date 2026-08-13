import { $ } from '../core/utils.js';

export const font = Object.freeze({
  KEY: 'rategoan_font',
  value: 'normal',
  init() {
    this.value = localStorage.getItem(this.KEY) || 'normal';
    this.apply();
  },
  apply() {
    document.documentElement.classList.remove('font-small', 'font-normal', 'font-large');
    document.documentElement.classList.add('font-' + this.value);
  },
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
});

window.RG = window.RG || {};
window.RG.font = font;
