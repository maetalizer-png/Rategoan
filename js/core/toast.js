import { $ } from '../../shared/dom.js';

export const toast = {
  t: null,
  show(text, ms) {
    const el = $('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.t);
    this.t = setTimeout(() => el.classList.remove('show'), ms || 2500);
  },
};
