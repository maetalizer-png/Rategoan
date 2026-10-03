const KEY = 'raget_engine_preference';

export const enginePreference = {
  KEY,
  get() {
    return localStorage.getItem(KEY) === 'neural' ? 'neural' : 'template';
  },
  set(pref) {
    try {
      localStorage.setItem(KEY, pref === 'neural' ? 'neural' : 'template');
    } catch (e) {}
  },
};
