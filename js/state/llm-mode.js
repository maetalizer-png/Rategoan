const VALID_MODES = ['lokal-ringan', 'lokal-berat', 'lokal-super', 'server'];
// lokal-super (Raget 200M) sengaja TIDAK ikut cycle() toggle cepat di
// Settings - mode itu cuma boleh aktif lewat alur opt-in unduh eksplisit
// di pemilih model (js/sheets/models.js), bukan tombol geser biasa yang
// bisa memicu unduhan ~163MB tanpa sadar.
const CYCLE_MODES = ['lokal-ringan', 'lokal-berat', 'server'];

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
    const current = this.mode();
    const idx = CYCLE_MODES.indexOf(current);
    const next = CYCLE_MODES[(idx + 1) % CYCLE_MODES.length];
    this.setMode(next);
    return next;
  },
  deviceCapability() {
    const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
    if (typeof mem !== 'number') return { known: false, ramGB: null, strong: null };
    return { known: true, ramGB: mem, strong: mem >= 4 };
  },
};
