export const utils = Object.freeze({
  $(id) { return document.getElementById(id); },
  clamp(v, min, max) { return Math.min(max, Math.max(min, v)); },
  sleep(ms) { return new Promise((r) => setTimeout(r, ms)); },
  scrollBottom() {
    const m = utils.$('messages');
    if (m) m.scrollTop = m.scrollHeight;
  },
  fmtTime(t) {
    return new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  },
});

window.RG = window.RG || {};
window.RG.utils = utils;

// Re-export shortcuts for convenience
export const $ = utils.$;
export const clamp = utils.clamp;
export const sleep = utils.sleep;
export const scrollBottom = utils.scrollBottom;
export const fmtTime = utils.fmtTime;
