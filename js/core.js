'use strict';
window.RG = window.RG || {};
RG.$ = (id) => document.getElementById(id);
RG.clamp = (v, min, max) => Math.min(max, Math.max(min, v));
RG.sleep = (ms) => new Promise((r) => setTimeout(r, ms));
RG.scrollBottom = () => {
  const m = RG.$('messages');
  if (m) m.scrollTop = m.scrollHeight;
};
RG.fmtTime = (t) =>
  new Date(t).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
RG.store = {
  KEY: 'rategoan_sessions',
  state: { sessions: [], currentId: null },
  init() {
    try { this.state.sessions = JSON.parse(localStorage.getItem(this.KEY) || '[]'); }
    catch (e) { this.state.sessions = []; }
  },
  save() { localStorage.setItem(this.KEY, JSON.stringify(this.state.sessions)); },
  get() { return this.state; },
  set(patch) { Object.assign(this.state, patch); },
};
RG.theme = {
  KEY: 'rategoan_theme',
  value: 'light',
  apply() {
    let dark;
    if (this.value === 'auto') {
      dark = !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
    } else {
      dark = this.value === 'dark';
    }
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    const m = document.querySelector('meta[name="theme-color"]');
    if (m) m.content = dark ? '#05080c' : '#ffffff';
  },
  init() {
    this.value = localStorage.getItem(this.KEY) || 'light';
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.value === 'auto') this.apply();
      });
    }
    this.apply();
  },
  set(v) {
    this.value = v;
    localStorage.setItem(this.KEY, v);
    this.apply();
  },
};
RG.toast = {
  t: null,
  show(text, ms) {
    const el = RG.$('toast');
    if (!el) return;
    el.textContent = text;
    el.classList.add('show');
    clearTimeout(this.t);
    this.t = setTimeout(() => el.classList.remove('show'), ms || 2500);
  },
};
RG.auth = {
  KEY: 'rategoan_auth',
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
};
RG.router = {
  routes: { chat: 'view-chat', settings: 'view-settings', login: 'view-login' },
  render() {
    let hash = (location.hash || '').replace(/^#\/?/, '') || 'chat';
    if (!this.routes[hash]) hash = 'chat';
    const authed = !!RG.auth.state;
    if (!authed && hash !== 'login') hash = 'login';
    if (authed && hash === 'login') hash = 'chat';
    if (location.hash !== '#/' + hash) location.hash = '/' + hash;
    Object.keys(this.routes).forEach((name) => {
      const el = RG.$(this.routes[name]);
      if (el) el.hidden = name !== hash;
    });
    const tb = RG.$('topbar');
    if (tb) tb.hidden = hash !== 'chat';
    const sb = RG.$('chat-search-bar');
    if (sb && hash !== 'chat') sb.hidden = true;
  },
  go(to) { location.hash = '/' + to; },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
};