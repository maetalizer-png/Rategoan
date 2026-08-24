// MEGA-BATCH RAGETAN ROUND 6 - FASE 4: 3 mode inference -
// 'lokal-ringan' (50M, CPU/WebGPU auto - default, paling ringan/kompatibel),
// 'lokal-berat' (100M, WebGPU kalau perangkat kuat, checkpoint jauh lebih
// besar untuk diunduh+dijalankan), 'server' (panggil endpoint HTTP eksternal,
// biasanya menyajikan model 100M). Nilai lama 'local' (Round 5) otomatis
// dipetakan ke 'lokal-ringan' supaya pengguna lama tidak kehilangan setting.
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
  // Perangkat lemah kalau deviceMemory (RAM perkiraan, Chrome/Edge-only,
  // undefined di browser lain) < 4GB - deteksi jujur: kalau API tidak ada,
  // TIDAK diasumsikan kuat/lemah, hanya dilaporkan tidak diketahui.
  deviceCapability() {
    const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
    if (typeof mem !== 'number') return { known: false, ramGB: null, strong: null };
    return { known: true, ramGB: mem, strong: mem >= 4 };
  },
};
