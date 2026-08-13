import { toast } from '../core/toast.js';

export const netmon = Object.freeze({
  init() {
    window.addEventListener('online', () => {
      if (toast.show) toast.show('Online');
    });
    window.addEventListener('offline', () => {
      if (toast.show) toast.show('Offline');
    });
  },
});

window.RG = window.RG || {};
window.RG.netmon = netmon;
