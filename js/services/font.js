/**
 * Font Service - Text size preferences
 * @module services/font
 */

import { RG } from '../core/index.js';

/**
 * Font size manager
 */
RG.font = {
  KEY: 'rategoan_font',
  value: 'normal',

  /**
   * Load font preference from localStorage
   */
  load() {
    this.value = localStorage.getItem(this.KEY) || 'normal';
    this.apply();
  },

  /**
   * Apply current font setting to document
   */
  apply() {
    document.documentElement.dataset.font = this.value;
  },

  /**
   * Set new font value
   * @param {string} v - Font size: 'small', 'normal', or 'large'
   */
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};

export { RG };
