import { $ } from '../utils/dom.js';
import { auth } from '../state/auth.js';

export const router = {
  routes: { chat: 'view-chat', settings: 'view-settings', collection: 'view-collection', login: 'view-login' },
  render() {
    // full boleh bawa sub-path (mis. "settings/data" buat halaman kategori
    // Pengaturan) - hash TOP-LEVEL yang dipakai buat cocokkan ke routes{}
    // cuma segmen pertama, sisanya (this.sub) dibaca modul terkait sendiri
    // (settings.js) tanpa router.js perlu tahu apa isi tiap sub-halaman.
    let full = (location.hash || '').replace(/^#\/?/, '') || 'chat';
    let hash = full.split('/')[0] || 'chat';
    if (!this.routes[hash]) {
      hash = 'chat';
      full = 'chat';
    }
    const authed = !!auth.state;
    if (authed && hash === 'login') {
      hash = 'chat';
      full = 'chat';
    }
    if (!authed && hash !== 'login') {
      hash = 'login';
      full = 'login';
    }
    this.sub = full.split('/').slice(1).join('/');
    if (location.hash !== '#/' + full) location.hash = '/' + full;
    Object.keys(this.routes).forEach((name) => {
      const el = $(this.routes[name]);
      if (el) el.hidden = name !== hash;
    });
    const tb = $('topbar');
    if (tb) tb.hidden = hash !== 'chat';
    const sb = $('chat-search-bar');
    if (sb && hash !== 'chat') sb.hidden = true;
    const sidebar = $('sidebar');
    if (sidebar) sidebar.hidden = hash === 'login';
    document.body.classList.toggle('auth-gate', hash === 'login');
  },
  go(to) {
    location.hash = '/' + to;
    this.render();
  },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
};
