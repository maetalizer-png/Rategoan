/**
 * Login View - Authentication page management
 * @module views/login
 */

import { RG } from '../core/index.js';

/**
 * Login page manager
 */
RG.login = {
  pendingPhone: null,
  pendingCode: null,

  /**
   * Set active login method tab
   * @param {string} m - Method: 'gmail' or 'phone'
   */
  setMethod(m) {
    RG.$('login-form-gmail').hidden = m !== 'gmail';
    RG.$('login-form-phone').hidden = m !== 'phone';
    RG.$('login-otp-row').hidden = true;
    RG.$('login-tab-gmail').classList.toggle('active', m === 'gmail');
    RG.$('login-tab-phone').classList.toggle('active', m === 'phone');
  },

  /**
   * Submit Gmail login
   */
  submitGmail() {
    const v = RG.$('login-email').value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      RG.toast.show('Format Gmail tidak valid');
      return;
    }
    RG.auth.login('gmail', v);
    RG.account.refresh();
    RG.haptics.tap(15);
    RG.toast.show('Selamat datang');
    RG.router.go('chat');
  },

  /**
   * Submit phone login (send code)
   */
  submitPhone() {
    const v = RG.$('login-phone').value.trim();
    if (!/^[0-9+\-\s]{8,16}$/.test(v)) {
      RG.toast.show('Nomor telepon tidak valid');
      return;
    }
    this.pendingPhone = v;
    this.pendingCode = String(Math.floor(100000 + Math.random() * 900000));
    RG.toast.show('Kode lokal Anda: ' + this.pendingCode, 8000);
    RG.$('login-otp').value = '';
    RG.$('login-otp-row').hidden = false;
  },

  /**
   * Verify OTP code
   */
  verify() {
    const v = RG.$('login-otp').value.trim();
    if (v !== this.pendingCode) {
      RG.toast.show('Kode salah');
      return;
    }
    RG.auth.login('phone', this.pendingPhone);
    RG.account.refresh();
    RG.haptics.tap(15);
    RG.toast.show('Selamat datang');
    RG.router.go('chat');
  },

  /**
   * Bind login event listeners
   */
  bind() {
    RG.$('login-tab-gmail').onclick = () => this.setMethod('gmail');
    RG.$('login-tab-phone').onclick = () => this.setMethod('phone');
    RG.$('login-gmail-submit').onclick = () => this.submitGmail();
    RG.$('login-phone-submit').onclick = () => this.submitPhone();
    RG.$('login-otp-submit').onclick = () => this.verify();
    this.setMethod('gmail');
    RG.account.refresh();
  },
};

export { RG };
