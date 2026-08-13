/**
 * Theme Service - Dark/light mode management
 * @module services/theme
 */

import { RG } from '../core/index.js';

/**
 * Theme manager for light/dark/auto modes
 */
RG.theme = {
  KEY: 'rategoan_theme',
  value: 'light',

  /**
   * Apply current theme to document
   */
  apply() {
    let dark;
    if (this.value === 'auto') {
      dark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      dark = this.value === 'dark';
    }
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#05080c' : '#ffffff';
  },

  /**
   * Initialize theme from localStorage and system preference
   */
  init() {
    this.value = localStorage.getItem(this.KEY) || 'light';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.value === 'auto') this.apply();
      });
    }
    this.apply();
  },

  /**
   * Set new theme value
   * @param {string} v - Theme value: 'light', 'dark', or 'auto'
   */
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};

export { RG };
