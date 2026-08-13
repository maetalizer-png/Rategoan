import { $ } from '../core/utils.js';
import { auth } from '../core/auth.js';
import { router } from '../core/router.js';

export const login = Object.freeze({
  tab: 'gmail',
  init() {
    const tabGmail = $('login-tab-gmail');
    const tabPhone = $('login-tab-phone');
    if (tabGmail) tabGmail.onclick = () => this.switchTab('gmail');
    if (tabPhone) tabPhone.onclick = () => this.switchTab('phone');
    
    const btnGmail = $('login-gmail-submit');
    if (btnGmail) btnGmail.onclick = () => this.submitGmail();
    
    const btnPhone = $('login-phone-submit');
    if (btnPhone) btnPhone.onclick = () => this.submitPhone();
    
    const btnOtp = $('login-otp-submit');
    if (btnOtp) btnOtp.onclick = () => this.submitOtp();
  },
  switchTab(t) {
    this.tab = t;
    const formGmail = $('login-form-gmail');
    const formPhone = $('login-form-phone');
    const tabGmail = $('login-tab-gmail');
    const tabPhone = $('login-tab-phone');
    if (t === 'gmail') {
      if (formGmail) formGmail.hidden = false;
      if (formPhone) formPhone.hidden = true;
      if (tabGmail) tabGmail.classList.add('active');
      if (tabPhone) tabPhone.classList.remove('active');
    } else {
      if (formGmail) formGmail.hidden = true;
      if (formPhone) formPhone.hidden = false;
      if (tabGmail) tabGmail.classList.remove('active');
      if (tabPhone) tabPhone.classList.add('active');
    }
  },
  submitGmail() {
    const email = $('login-email').value.trim();
    if (!email || !email.includes('@')) {
      if (window.RG.toast) window.RG.toast.show('Email tidak valid');
      return;
    }
    auth.login('gmail', email);
    if (window.RG.toast) window.RG.toast.show('Login berhasil');
    router.go('chat');
  },
  submitPhone() {
    const phone = $('login-phone').value.trim();
    if (!phone || phone.length < 10) {
      if (window.RG.toast) window.RG.toast.show('Nomor telepon tidak valid');
      return;
    }
    $('login-otp-row').hidden = false;
    if (window.RG.toast) window.RG.toast.show('Kode OTP dikirim');
  },
  submitOtp() {
    const otp = $('login-otp').value.trim();
    if (!otp || otp.length !== 6) {
      if (window.RG.toast) window.RG.toast.show('Kode OTP harus 6 digit');
      return;
    }
    const phone = $('login-phone').value.trim();
    auth.login('phone', phone);
    if (window.RG.toast) window.RG.toast.show('Login berhasil');
    router.go('chat');
  },
});

window.RG = window.RG || {};
window.RG.login = login;
