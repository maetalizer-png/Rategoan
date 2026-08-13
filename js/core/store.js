import { config } from './config.js';

export const store = Object.freeze({
  KEY: config.STORAGE_KEYS.SESSIONS,
  state: { sessions: [], currentId: null },
  init() {
    try { this.state.sessions = JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch (e) { this.state.sessions = []; }
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.state.sessions)); },
  get() { return this.state; },
  set(patch) { Object.assign(this.state, patch); },
});

window.RG = window.RG || {};
window.RG.store = store;
