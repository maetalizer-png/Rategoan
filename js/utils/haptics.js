import { hemat } from '../state/hemat.js';

export const haptics = {
  tap(ms) {
    if (hemat.enabled()) return;
    try {
      if (navigator.vibrate) navigator.vibrate(ms || 10);
    } catch (e) {}
  },
};

export const reduceMotion = () =>
  hemat.enabled() ||
  !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) ||
  !!navigator.webdriver ||
  !!window.__RG_BENCH__;
