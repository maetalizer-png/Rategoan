import { $ } from '../core/utils.js';
import { auth } from '../core/auth.js';

export const account = Object.freeze({
  init() {
    this.render();
  },
  render() {
    const head = $('profile-head');
    const avatar = $('profile-avatar');
    const name = $('profile-name');
    const mail = $('profile-mail');
    if (!auth.state) {
      if (head) head.hidden = true;
      return;
    }
    if (head) head.hidden = false;
    const initial = (auth.state.id || '?').charAt(0).toUpperCase();
    if (avatar) avatar.textContent = initial;
    if (name) name.textContent = auth.state.id;
    if (mail) mail.textContent = auth.state.method === 'gmail' ? auth.state.id : 'Telepon: ' + auth.state.id;
  },
});

window.RG = window.RG || {};
window.RG.account = account;
