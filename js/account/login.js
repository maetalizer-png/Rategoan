import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { auth } from '../state/auth.js';
import { account } from './account.js';

const TEMPLATE = `
      <div class="gate">
        <div class="gate-brand">
          <div class="gate-mark" aria-hidden="true">
            <svg viewBox="0 0 512 512"><path d="M256 96l36 124 124 36-124 36-36 124-36-124-124-36 124-36z"/></svg>
          </div>
          <h1 class="gate-title">Rategoan</h1>
          <p class="gate-tagline">Asisten AI 100% lokal di perangkatmu</p>
        </div>
        <hr class="divider">
        <div id="login-content">
          <div class="login-tabs">
            <button id="login-tab-gmail" class="login-tab active">Gmail</button>
            <button id="login-tab-phone" class="login-tab">Telepon</button>
          </div>
          <div id="login-form-gmail" class="login-form">
            <input id="login-email" class="auth-input" type="email" placeholder="nama@gmail.com" autocomplete="email">
            <input id="login-password" class="auth-input" type="password" placeholder="Kata sandi" autocomplete="current-password">
            <button id="login-gmail-submit" class="auth-submit">Masuk dengan Gmail</button>
          </div>
          <div id="google-signin-row" class="google-signin-row" hidden>
            <div class="auth-or"><span>atau</span></div>
            <div id="google-signin-btn"></div>
          </div>
          <div id="login-form-phone" class="login-form" hidden>
            <input id="login-phone" class="auth-input" type="tel" placeholder="08xxxxxxxxxx" autocomplete="tel">
            <button id="login-phone-submit" class="auth-submit">Kirim Kode</button>
            <div id="login-otp-row" class="login-form" hidden>
              <input id="login-otp" class="auth-input" type="text" inputmode="numeric" maxlength="6" placeholder="6 digit kode">
              <button id="login-otp-submit" class="auth-submit">Verifikasi</button>
            </div>
          </div>
          <p class="gate-note">Data akun hanya tersimpan di perangkat Anda.</p>
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
    this.setMethod('gmail');
    account.refresh();
  },
};
