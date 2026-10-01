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
    this.sub = full.split('/').slice(1).join('/');
    if (location.hash !== '#/' + full) location.hash = '/' + full;
    Object.keys(this.routes).forEach((name) => {
      const el = $(this.routes[name]);
      if (el) el.hidden = name !== hash;
    });
    const tb = $('topbar');
    if (tb) tb.hidden = hash !== 'chat';
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
