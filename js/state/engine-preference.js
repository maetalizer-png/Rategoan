const KEY = 'raget_engine_preference';

export const enginePreference = {
  KEY,
  get() {
    const saved = localStorage.getItem(KEY);
    if (saved === 'neural' || saved === 'template' || saved === 'auto') return saved;
    return 'auto';
  },
  set(pref) {
    const next = pref === 'neural' || pref === 'template' ? pref : 'auto';
    try {
      localStorage.setItem(KEY, next);
    } catch (e) { console.warn('[Rategoan Fallback] engine-preference:', e); }
  },
};
