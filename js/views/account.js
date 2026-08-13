/**
 * Account Display - User account UI management
 * @module views/account
 */

import { RG } from '../core/index.js';

/**
 * Account display manager for login button
 */
RG.account = {
  MAIL_SVG: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>',

  /**
   * Refresh account display based on auth state
   */
  refresh() {
    const btn = RG.$('btn-login');
    if (!btn) return;
    const st = RG.auth.state;
    if (!st) {
      btn.classList.remove('logged');
      btn.setAttribute('aria-label', 'Login');
      btn.innerHTML = this.MAIL_SVG;
      return;
    }
    const local = st.method === 'gmail' ? String(st.id).split('@')[0] : 'P';
    const initial = (local.charAt(0) || 'U').toUpperCase();
    btn.classList.add('logged');
    btn.setAttribute('aria-label', 'Akun');
    btn.innerHTML = '<span class="account-initial">' + initial + '</span>';
  },
};

export { RG };
