/**
 * Router Service - View navigation and routing
 * @module services/router
 */

import { RG } from '../core/index.js';

/**
 * Simple hash-based router for view management
 */
RG.router = {
  routes: { chat: 'view-chat', settings: 'view-settings', login: 'view-login' },

  /**
   * Render current route based on hash
   */
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

  /**
   * Navigate to specified route
   * @param {string} to - Route name
   */
  go(to) {
    location.hash = '/' + to;
  },

  /**
   * Initialize router with hashchange listener
   */
  init() {
    window.addEventListener('hashchange', () => this.render());
    this.render();
  },
};

export { RG };
