const KEY = 'raget_engine_preference';

export const enginePreference = {
  KEY,
  get() {
    const saved = localStorage.getItem(KEY);
    return saved === 'cloud' ? 'cloud' : 'neural';
  },
  set(pref) {
    const next = pref === 'cloud' ? 'cloud' : 'neural';
    try {
      localStorage.setItem(KEY, next);
    } catch (e) { console.warn('[Rategoan Fallback] engine-preference:', e); }
  },
  weightsInstalled() {
    return false;
  },
};
