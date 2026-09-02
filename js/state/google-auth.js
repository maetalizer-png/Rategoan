import { $ } from '../utils/dom.js';
import { auth } from './auth.js';
import { account } from '../account/account.js';
import { router } from '../core/router.js';
import { toast } from '../core/toast.js';
import { haptics } from '../utils/haptics.js';

const CLIENT_ID = '';

function decodeJwtPayload(token) {
  const part = token.split('.')[1];
  const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

function onCredential(response) {
  let payload;
  try {
    payload = decodeJwtPayload(response.credential);
  } catch (e) {
    toast.show('Gagal membaca identitas Google');
    return;
  }
  if (!payload || !payload.email) {
    toast.show('Gagal membaca identitas Google');
    return;
  }
  auth.login('gmail', payload.email);
  account.refresh();
  haptics.tap(15);
  router.go('chat');
}

export const googleAuth = {
  attempts: 0,
  available() {
    return !!CLIENT_ID && !!(window.google && window.google.accounts && window.google.accounts.id);
  },
  init() {
    if (!CLIENT_ID) return;
    if (!this.available()) {
      this.attempts++;
      if (this.attempts < 20) setTimeout(() => this.init(), 250);
      return;
    }
    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: onCredential,
    });
    $('google-signin-row').hidden = false;
    window.google.accounts.id.renderButton($('google-signin-btn'), {
      theme: 'outline',
      size: 'large',
      shape: 'pill',
      width: 280,
      locale: 'id',
    });
  },
};
