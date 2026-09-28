import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { auth } from '../state/auth.js';
import { account } from './account.js';
import { googleAuth } from '../state/google-auth.js';

const TEMPLATE = `
      <div class="gate">
        <div class="gate-brand">
          <h1 class="gate-title">Rategoan</h1>
        </div>
        <div id="login-content" class="gate-card">
          <div id="google-signin-row" class="google-signin-row">
            <div id="google-signin-btn">
              <button id="google-signin-placeholder" class="google-btn-placeholder" type="button">
                <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.62z"/>
                  <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.8.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.9v2.33A9 9 0 0 0 9 18z"/>
                  <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.16.28-1.7V4.97H.9A9 9 0 0 0 0 9c0 1.45.35 2.83.9 4.03l3.05-2.33z"/>
                  <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .9 4.97l3.05 2.33C4.66 5.17 6.65 3.58 9 3.58z"/>
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>
            </div>
            <div class="auth-or"><span>atau</span></div>
          </div>
          <div class="login-tabs">
            <button id="login-tab-gmail" class="login-tab active">Email</button>
            <button id="login-tab-phone" class="login-tab">Telepon</button>
          </div>
          <div id="login-form-gmail" class="login-form">
            <input id="login-email" class="auth-input" type="email" placeholder="nama@email.com" autocomplete="email">
            <input id="login-password" class="auth-input" type="password" placeholder="Sandi" autocomplete="current-password">
            <button id="login-gmail-submit" class="auth-submit auth-submit-plain">Lanjutkan</button>
          </div>
          <div id="login-form-phone" class="login-form" hidden>
            <input id="login-phone" class="auth-input" type="tel" placeholder="08xxxxxxxxxx" autocomplete="tel">
            <button id="login-phone-submit" class="auth-submit auth-submit-plain">Kirim kode</button>
            <div id="login-otp-row" class="login-form" hidden>
              <input id="login-otp" class="auth-input" type="text" inputmode="numeric" maxlength="6" placeholder="6 digit kode">
              <button id="login-otp-submit" class="auth-submit auth-submit-plain">Verifikasi</button>
            </div>
          </div>
        </div>
      </div>
`;

export const login = {
  pendingPhone: null,
  pendingCode: null,
  setMethod(m) {
    $('login-form-gmail').hidden = m !== 'gmail';
    $('login-form-phone').hidden = m !== 'phone';
    $('login-otp-row').hidden = true;
    $('login-tab-gmail').classList.toggle('active', m === 'gmail');
    $('login-tab-phone').classList.toggle('active', m === 'phone');
  },
  submitGmail() {
    const v = $('login-email').value.trim();
    const p = $('login-password').value;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.show('Format Gmail tidak valid');
      return;
    }
    if (p.length < 4) {
      toast.show('Kata sandi minimal 4 karakter');
      return;
    }
    auth.login('gmail', v);
    account.refresh();
    haptics.tap(15);
    router.go('chat');
  },
  submitPhone() {
    const v = $('login-phone').value.trim();
    if (!/^[0-9+\-\s]{8,16}$/.test(v)) {
      toast.show('Nomor telepon tidak valid');
      return;
    }
    this.pendingPhone = v;
    this.pendingCode = String(Math.floor(100000 + Math.random() * 900000));
    toast.show('Kode lokal Anda: ' + this.pendingCode, 8000);
    $('login-otp').value = '';
    $('login-otp-row').hidden = false;
  },
  verify() {
    const v = $('login-otp').value.trim();
    if (v !== this.pendingCode) {
      toast.show('Kode salah');
      return;
    }
    auth.login('phone', this.pendingPhone);
    account.refresh();
    haptics.tap(15);
    router.go('chat');
  },
  bind() {
    $('view-login').innerHTML = TEMPLATE;
    $('login-tab-gmail').onclick = () => this.setMethod('gmail');
    $('login-tab-phone').onclick = () => this.setMethod('phone');
    $('login-gmail-submit').onclick = () => this.submitGmail();
    $('login-phone-submit').onclick = () => this.submitPhone();
    $('login-otp-submit').onclick = () => this.verify();
    const placeholder = $('google-signin-placeholder');
    if (placeholder) placeholder.onclick = () => googleAuth.ensure();
    this.setMethod('gmail');
    account.refresh();
    const loginView = $('view-login');
    if (loginView && !loginView.hidden) googleAuth.ensure();
  },
};
