import { $ } from './utils.js';
import { auth } from './auth.js';

export const router = Object.freeze({
  routes: { chat: 'view-chat', settings: 'view-settings', login: 'view-login' },
  render() {
    let hash = (location.hash || '').replace(/^#\/?/, '') || 'chat';
    if (!this.routes[hash]) hash = 'chat';
    const authed = !!auth.state;
    if (!authed && hash !== 'login') hash = 'login';
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
  },
  go(to) { location.hash = '/' + to; },
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
});

window.RG = window.RG || {};
window.RG.router = router;
