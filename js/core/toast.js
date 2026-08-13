import { $ } from './utils.js';

export const toast = Object.freeze({
  t: null,
  show(text, ms) {
    const el = $('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.t);
    this.t = setTimeout(() => el.classList.remove('show'), ms || 2500);
  },
});

window.RG = window.RG || {};
window.RG.toast = toast;
