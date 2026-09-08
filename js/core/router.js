import { $ } from '../utils/dom.js';
import { auth } from '../state/auth.js';

export const router = {
  routes: { chat: 'view-chat', settings: 'view-settings', collection: 'view-collection', login: 'view-login' },
  render() {
    let hash = (location.hash || '').replace(/^#\/?/, '') || 'chat';
    if (!this.routes[hash]) hash = 'chat';
    const authed = !!auth.state;
    if (authed && hash === 'login') hash = 'chat';
    if (location.hash !== '#/' + hash) location.hash = '/' + hash;
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
  },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
};
