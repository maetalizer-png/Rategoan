import { $ } from '../utils/dom.js';
import { haptics } from '../utils/haptics.js';
import { toast } from '../core/toast.js';
import { router } from '../core/router.js';
import { auth } from '../state/auth.js';
import { account } from './account.js';

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
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      toast.show('Format Gmail tidak valid');
      return;
    }
    auth.login('gmail', v);
    account.refresh();
    haptics.tap(15);
    toast.show('Selamat datang');
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
    toast.show('Selamat datang');
    router.go('chat');
  },
  bind() {
    $('login-tab-gmail').onclick = () => this.setMethod('gmail');
    $('login-tab-phone').onclick = () => this.setMethod('phone');
    $('login-gmail-submit').onclick = () => this.submitGmail();
    $('login-phone-submit').onclick = () => this.submitPhone();
    $('login-otp-submit').onclick = () => this.verify();
    this.setMethod('gmail');
    account.refresh();
  },
};
