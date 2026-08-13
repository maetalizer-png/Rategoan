import { $ } from '../utils/dom.js';

const X_SVG =
  '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

export const quote = {
  current: null,
  set(m) {
    this.current = m ? { role: m.role, text: m.text } : null;
    this.render();
  },
  render() {
    const row = $('quote-row');
    if (!row) return;
    row.innerHTML = '';
    if (!this.current) {
      row.hidden = true;
      return;
    }
    row.hidden = false;
    const chip = document.createElement('div');
    chip.className = 'attach-chip quote-chip';
    const name = document.createElement('span');
    name.className = 'attach-name';
    name.textContent = (this.current.role === 'user' ? 'Anda' : 'Rategoan') + ': ' + this.current.text;
    const x = document.createElement('button');
    x.className = 'hist-del';
    x.setAttribute('aria-label', 'Remove');
    x.innerHTML = X_SVG;
    x.onclick = () => this.set(null);
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },
  consume() {
    const c = this.current;
    this.current = null;
    this.render();
    return c;
  },
};
