import { config } from './config.js';

export const auth = Object.freeze({
  KEY: config.STORAGE_KEYS.AUTH,
  state: null,
  init() {
    try { this.state = JSON.parse(localStorage.getItem(this.KEY) || 'null'); }
    catch (e) { this.state = null; }
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.state)); },
  login(method, id) {
    this.state = { method: method, id: id, time: Date.now() };
    this.save();
  },
  logout() {
    this.state = null;
    localStorage.removeItem(this.KEY);
  },
});

window.RG = window.RG || {};
window.RG.auth = auth;
