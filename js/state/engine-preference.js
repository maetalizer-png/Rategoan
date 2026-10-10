const KEY = 'raget_engine_preference';

export const enginePreference = {
  KEY,
  get() {
    const saved = localStorage.getItem(KEY);
    return saved === 'neural' ? 'neural' : 'template';
  },
  set(pref) {
    const next = pref === 'neural' ? 'neural' : 'template';
    try {
      localStorage.setItem(KEY, next);
    } catch (e) { console.warn('[Rategoan Fallback] engine-preference:', e); }
  },
  weightsInstalled() {
    return false;
  },
};
