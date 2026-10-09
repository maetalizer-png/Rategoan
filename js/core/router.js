import { $ } from '../../shared/dom.js';
import { auth } from '../state/auth.js';

export const router = {
  routes: { chat: 'view-chat', settings: 'view-settings', collection: 'view-collection', project: 'view-project', studio: 'view-studio', artifacts: 'view-artifacts', connect: 'view-connect', login: 'view-login' },
  render() {
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
    if (authed && hash === 'studio') {
      location.href = 'studio.html';
      return;
    }
    this.sub = full.split('/').slice(1).join('/');
    if (location.hash !== '#/' + full) {
      history.replaceState({ rg: 1, view: hash }, '', '#/' + full);
    }
    Object.keys(this.routes).forEach((name) => {
      const el = $(this.routes[name]);
      if (el) el.hidden = name !== hash;
    });
    const tb = $('topbar');
    if (tb) tb.hidden = hash !== 'chat';
    const sidebar = $('sidebar');
    if (sidebar) sidebar.hidden = hash === 'login';
    document.body.classList.toggle('auth-gate', hash === 'login');
    document.querySelectorAll('[data-route]').forEach((el) => {
      el.classList.toggle('on', el.getAttribute('data-route') === hash);
    });
  },
  go(to) {
    const full = String(to || 'chat');
    const view = full.split('/')[0] || 'chat';
    if (view === 'studio') {
      location.href = 'studio.html';
      return;
    }
    history.pushState({ rg: 1, view }, '', '#/' + full);
    this.render();
  },
  init() {
    const hash = (location.hash || '#/chat').replace(/^#\/?/, '').split('/')[0] || 'chat';
    history.replaceState({ rg: 1, view: hash }, '', location.hash || '#/chat');
    window.addEventListener('hashchange', () => this.render());
    window.addEventListener('popstate', () => {
      const name = (location.hash || '').replace(/^#\/?/, '').split('/')[0];
      if (!history.state || !history.state.rg) {
        if (this.routes[name]) history.replaceState({ rg: 1, view: name }, '', location.hash);
        else history.pushState({ rg: 1, view: 'chat' }, '', '#/chat');
      }
      this.render();
    });
    this.render();
  },
};
