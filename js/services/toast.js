/**
 * Toast Service - Notification display
 * @module services/toast
 */

import { RG } from '../core/index.js';

/**
 * Toast notification manager
 */
RG.toast = {
  t: null,

  /**
   * Show toast notification
   * @param {string} text - Message to display
   * @param {number} ms - Duration in milliseconds
   */
  show(text, ms) {
    const el = RG.$('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.t);
    this.t = setTimeout(() => el.classList.remove('show'), ms || 2500);
  },
};

export { RG };
