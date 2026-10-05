import { $ } from '../../shared/dom.js';

export const toast = {
  t: null,
  show(text, ms) {
    const el = $('toast');
    if (!el) return;
    const opts = ms && typeof ms === 'object' ? ms : null;
    const delay = opts ? (opts.ms || 4000) : (ms || 2500);
    el.textContent = text;
    el.classList.add('show');
    el.onclick = null;
    el.style.cursor = '';
    if (opts && typeof opts.onClick === 'function') {
      el.style.cursor = 'pointer';
      el.onclick = () => {
        el.classList.remove('show');
        el.onclick = null;
        opts.onClick();
      };
    }
    clearTimeout(this.t);
    this.t = setTimeout(() => el.classList.remove('show'), delay);
  },
};
