/**
 * PIN Service - App lock functionality
 * @module services/pin
 */

import { RG } from '../core/index.js';

/**
 * PIN lock manager for app security
 */
RG.pin = {
  KEY: 'rategoan_pin',

  /**
   * Check if PIN is set
   * @returns {boolean}
   */
  has() {
    return !!localStorage.getItem(this.KEY);
  },

  /**
   * Set new PIN (hashed)
   * @param {string} p - PIN code
   */
  set(p) {
    localStorage.setItem(this.KEY, this.hash(p));
  },

  /**
   * Clear stored PIN
   */
  clear() {
    localStorage.removeItem(this.KEY);
  },

  /**
   * Hash PIN using djb2 algorithm
   * @param {string} s - Input string
   * @returns {string} Hash value
   */
  hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return String(h);
  },

  /**
   * Verify PIN against stored hash
   * @param {string} p - PIN to verify
   * @returns {boolean}
   */
  verify(p) {
    return this.hash(p) === localStorage.getItem(this.KEY);
  },

  /**
   * Show PIN lock overlay
   */
  lock() {
    const ov = RG.$('pin-overlay');
    if (!ov) return;
    ov.hidden = false;
    const inp = RG.$('pin-input');
    inp.value = '';
    inp.focus();
  },

  /**
   * Hide PIN lock overlay
   */
  unlock() {
    const ov = RG.$('pin-overlay');
    if (ov) ov.hidden = true;
  },

  /**
   * Bind PIN submit handler
   */
  bind() {
    const submit = RG.$('pin-submit');
    if (!submit) return;
    submit.onclick = () => {
      const v = RG.$('pin-input').value.trim();
      if (this.verify(v)) {
        this.unlock();
        RG.toast.show('Terbuka');
      } else {
        RG.toast.show('PIN salah');
      }
    };
  },

  /**
   * Bind auto-lock on visibility change
   */
  bindAutoLock() {
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (!this.has()) return;
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt > 5 * 60 * 1000) {
        this.lock();
      }
    });
  },
};

export { RG };
