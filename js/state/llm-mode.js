export const llmMode = {
  KEY_MODE: 'raget_llm_mode',
  KEY_URL: 'raget_llm_server_url',
  mode() {
    return localStorage.getItem(this.KEY_MODE) === 'server' ? 'server' : 'lokal';
  },
  setMode(m) {
    localStorage.setItem(this.KEY_MODE, m === 'server' ? 'server' : 'lokal');
  },
  serverUrl() {
    return localStorage.getItem(this.KEY_URL) || '';
  },
  setServerUrl(url) {
    localStorage.setItem(this.KEY_URL, String(url || '').trim().replace(/\/+$/, ''));
  },
};
