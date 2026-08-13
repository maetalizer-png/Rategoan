import { $ } from '../core/utils.js';

export const storage = Object.freeze({
  init() {
    // Placeholder for future storage management features
  },
  estimate() {
    if (navigator.storage && navigator.storage.estimate) {
      return navigator.storage.estimate().then(e => ({
        usage: e.usage,
        quota: e.quota,
      }));
    }
    return Promise.resolve(null);
  },
});

window.RG = window.RG || {};
window.RG.storage = storage;
