import { $ } from '../../shared/dom.js';
import { auth } from '../state/auth.js';

const MAIL_SVG =
  '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>';

export const account = {
  refresh() {
    const btn = $('btn-login');
    if (!btn) return;
    const card = $('sidebar-user-card');
    if (card && !card.dataset.bound) {
      card.dataset.bound = '1';
      card.onclick = (event) => {
        if (event.target.closest('#btn-settings') || event.target.closest('[data-open-memory]')) return;
        btn.click();
      };
    }
    const st = auth.state;
    const name = $('sidebar-user-name');
    const email = $('sidebar-user-email');
    const avatar = $('sidebar-user-avatar');
    if (!st) {
      if (name) name.textContent = 'Tamu';
      if (email) email.textContent = 'Belum masuk';
      if (avatar) {
        avatar.textContent = '';
        avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>';
      }
      btn.classList.remove('logged');
      btn.setAttribute('aria-label', 'Masuk');
      btn.innerHTML = MAIL_SVG;
      return;
    }
    const local = st.method === 'gmail' ? String(st.id).split('@')[0] : 'Pengguna';
    const initial = (local.charAt(0) || 'U').toUpperCase();
    const label = auth.displayName() || local;
    if (name) name.textContent = label;
    if (email) email.textContent = st.method === 'gmail' ? String(st.id) : 'Akun lokal';
    if (avatar) avatar.textContent = initial;
    btn.classList.add('logged');
    btn.setAttribute('aria-label', 'Akun');
    btn.innerHTML = '';
    const span = document.createElement('span');
    span.className = 'account-initial';
    span.textContent = initial;
    btn.appendChild(span);
  },
};
