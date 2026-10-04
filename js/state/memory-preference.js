const KEY = 'raget_memory_preference';

export const memoryPreference = {
  KEY,
  get() {
    try {
      return localStorage.getItem(KEY) !== 'off';
    } catch (e) {
      return true;
    }
  },
  set(active) {
    try {
      localStorage.setItem(KEY, active ? 'on' : 'off');
    } catch (e) { console.warn('[Rategoan Fallback] memory-preference:', e); }
  },
};
