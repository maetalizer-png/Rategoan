const VALID_MODES = ['lokal-ringan', 'lokal-berat', 'server'];

export const llmMode = {
  KEY_MODE: 'raget_llm_mode',
  KEY_URL: 'raget_llm_server_url',
  mode() {
    const raw = localStorage.getItem(this.KEY_MODE);
    if (raw === 'local') return 'lokal-ringan';
    return VALID_MODES.includes(raw) ? raw : 'lokal-ringan';
  },
  setMode(m) {
    localStorage.setItem(this.KEY_MODE, VALID_MODES.includes(m) ? m : 'lokal-ringan');
  },
  serverUrl() {
    return localStorage.getItem(this.KEY_URL) || '';
  },
  setServerUrl(url) {
    localStorage.setItem(this.KEY_URL, String(url || '').trim().replace(/\/+$/, ''));
  },
  cycle() {
    const idx = VALID_MODES.indexOf(this.mode());
    const next = VALID_MODES[(idx + 1) % VALID_MODES.length];
    this.setMode(next);
    return next;
  },
  deviceCapability() {
    const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
    if (typeof mem !== 'number') return { known: false, ramGB: null, strong: null };
    return { known: true, ramGB: mem, strong: mem >= 4 };
  },
};
