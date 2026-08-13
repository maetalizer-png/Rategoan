/**
 * Quote/Reply System - Message quoting for replies
 * @module ui/chat/quote
 */

import { RG } from '../../core/index.js';

/**
 * Quote manager for message replies
 */
RG.quote = {
  current: null,
  XSVG: '<svg width="14" height="14" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',

  /**
   * Set quote from message
   * @param {Object} m - Message object or null to clear
   */
  set(m) {
    this.current = m ? { role: m.role, text: m.text } : null;
    this.render();
  },

  /**
   * Render quote chip UI
   */
  render() {
    const row = RG.$('quote-row');
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
    x.innerHTML = this.XSVG;
    x.onclick = () => this.set(null);
    chip.appendChild(name);
    chip.appendChild(x);
    row.appendChild(chip);
  },

  /**
   * Consume and clear current quote
   * @returns {Object|null} Quoted message data
   */
  consume() {
    const c = this.current;
    this.current = null;
    this.render();
    return c;
  },
};

export { RG };
