/**
 * Storage Utility - LocalStorage usage tracking
 * @module ui/utils/storage
 */

import { RG } from '../../core/index.js';

/**
 * Storage usage tracker
 */
RG.storage = {
  /**
   * Calculate current localStorage usage in bytes
   * @returns {number} Bytes used
   */
  usage() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      const v = localStorage.getItem(k) || '';
      total += (k.length + v.length) * 2;
    }
    return total;
  },

  /**
   * Get localStorage quota
   * @returns {number} Quota in bytes (5MB)
   */
  quota() {
    return 5 * 1024 * 1024;
  },

  /**
   * Calculate usage percentage
   * @returns {number} Percentage used
   */
  percent() {
    return Math.min(100, Math.round((this.usage() / this.quota()) * 100));
  },
};

export { RG };
