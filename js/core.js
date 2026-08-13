// js/core.js - Utilitas inti, store, theme, toast, auth, router
(function() {
  'use strict';

  // ========== UTILITIES ==========
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const clamp = (min, val, max) => Math.min(Math.max(val, min), max);

  const sleep = (ms) => new Promise(res => setTimeout(res, ms));

  const scrollBottom = (el) => {
    el.scrollTop = el.scrollHeight;
  };

  const fmtTime = (ts) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const todayStr = () => new Date().toISOString().slice(0, 10);

  const isToday = (ts) => {
    const d = new Date(ts);
    const t = new Date();
    return d.toDateString() === t.toDateString();
  };

  const isYesterday = (ts) => {
    const d = new Date(ts);
    const t = new Date();
    t.setDate(t.getDate() - 1);
    return d.toDateString() === t.toDateString();
  };

  const dateLabel = (ts) => {
    if (isToday(ts)) return 'Hari ini';
    if (isYesterday(ts)) return 'Kemarin';
    const d = new Date(ts);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  };

  // ========== STORE ==========
  const store = {
    _key: 'rategoan_sessions',
    get() {
      try {
        const raw = localStorage.getItem(this._key);
        return raw ? JSON.parse(raw) : [];
      } catch {
        return [];
      }
    },
    save(sessions) {
      localStorage.setItem(this._key, JSON.stringify(sessions));
    },
    add(msg) {
      const sessions = this.get();
      sessions.push({ ...msg, ts: Date.now() });
      this.save(sessions);
      return sessions;
    },
    clear() {
      this.save([]);
    },
    count() {
      return this.get().length;
    },
    sizeKB() {
      let total = 0;
      for (const k in localStorage) {
        if (k.startsWith('rategoan_')) {
          total += (localStorage[k].length * 2) / 1024;
        }
      }
      return total.toFixed(1);
    }
  };

  // ========== THEME ==========
  const theme = {
    _key: 'rategoan_theme',
    _modes: ['light', 'auto', 'dark'],
    get() {
      return localStorage.getItem(this._key) || 'light';
    },
    set(mode) {
      if (!this._modes.includes(mode)) mode = 'light';
      localStorage.setItem(this._key, mode);
      this.apply();
    },
    apply() {
      const mode = this.get();
      const html = document.documentElement;
      if (mode === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        html.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
      } else {
        html.setAttribute('data-theme', mode);
      }
    },
    init() {
      this.apply();
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (this.get() === 'auto') this.apply();
      });
    }
  };

  // ========== TOAST ==========
  const toast = {
    _el: null,
    _timer: null,
    show(msg, duration = 2500) {
      if (!this._el) this._el = $('#toast');
      if (!this._el) return;
      this._el.textContent = msg;
      this._el.style.opacity = '1';
      clearTimeout(this._timer);
      this._timer = setTimeout(() => {
        this._el.style.opacity = '0';
      }, duration);
    }
  };

  // ========== AUTH ==========
  const auth = {
    _key: 'rategoan_auth',
    state: null,
    load() {
      try {
        const raw = localStorage.getItem(this._key);
        this.state = raw ? JSON.parse(raw) : null;
      } catch {
        this.state = null;
      }
      return this.state;
    },
    save(user) {
      this.state = user;
      localStorage.setItem(this._key, JSON.stringify(user));
    },
    isLoggedIn() {
      return !!this.state;
    },
    login(provider, identifier) {
      const initial = (identifier || '').charAt(0).toUpperCase();
      const name = identifier ? identifier.split('@')[0] : 'User';
      this.save({ provider, identifier, initial, name });
      return true;
    },
    logout() {
      localStorage.removeItem(this._key);
      this.state = null;
    }
  };

  // ========== ROUTER ==========
  const router = {
    current: 'chat',
    routes: { chat: '#view-chat', settings: '#view-settings', login: '#view-login' },
    navigate(route) {
      if (!this.routes[route]) route = 'chat';
      this.current = route;
      $$('.view').forEach(v => v.hidden = true);
      const target = $(`#view-${route}`);
      if (target) target.hidden = false;
      
      const topbar = $('#topbar');
      const searchBar = $('#chat-search-bar');
      if (topbar) {
        topbar.style.display = (route === 'chat') ? 'flex' : 'none';
      }
      if (searchBar && !searchBar.hidden) {
        searchBar.hidden = (route !== 'chat');
      }
      
      if (!auth.isLoggedIn() && route !== 'login') {
        this.navigate('login');
      }
    },
    guard() {
      if (!auth.isLoggedIn()) {
        this.navigate('login');
        return false;
      }
      return true;
    }
  };

  // Export ke window.RG
  window.RG = window.RG || {};
  window.RG.$ = $;
  window.RG.$$ = $$;
  window.RG.clamp = clamp;
  window.RG.sleep = sleep;
  window.RG.scrollBottom = scrollBottom;
  window.RG.fmtTime = fmtTime;
  window.RG.todayStr = todayStr;
  window.RG.isToday = isToday;
  window.RG.isYesterday = isYesterday;
  window.RG.dateLabel = dateLabel;
  window.RG.store = store;
  window.RG.theme = theme;
  window.RG.toast = toast;
  window.RG.auth = auth;
  window.RG.router = router;

})();
