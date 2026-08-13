import { $ } from '../core/utils.js';

export const pin = Object.freeze({
  KEY: 'rategoan_pin',
  enabled: false,
  lastActive: Date.now(),
  init() {
    this.enabled = !!localStorage.getItem(this.KEY);
    this.updateInfo();
    const row = $('row-pin');
    if (row) row.onclick = () => this.toggle();
    const submit = $('pin-submit');
    if (submit) submit.onclick = () => this.verify();
    const input = $('pin-input');
    if (input) input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.verify();
    });
    // Auto-lock after 5 minutes background
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.lastActive = Date.now();
      else this.checkLock();
    });
  },
  toggle() {
    if (this.enabled) {
      if (confirm('Nonaktifkan PIN?')) {
        localStorage.removeItem(this.KEY);
        this.enabled = false;
        this.updateInfo();
      }
    } else {
      const p = prompt('Buat PIN 6 digit:');
      if (p && p.length === 6) {
        localStorage.setItem(this.KEY, p);
        this.enabled = true;
        this.updateInfo();
      }
    }
  },
  updateInfo() {
    const info = $('pin-info');
    if (info) info.textContent = this.enabled ? 'Aktif' : 'Nonaktif';
  },
  checkLock() {
    if (!this.enabled) return;
    if (Date.now() - this.lastActive > 5 * 60 * 1000) {
      this.showOverlay();
    }
  },
  showOverlay() {
    const ov = $('pin-overlay');
    if (ov) ov.hidden = false;
    const input = $('pin-input');
    if (input) {
      input.value = '';
      input.focus();
    }
  },
  hideOverlay() {
    const ov = $('pin-overlay');
    if (ov) ov.hidden = true;
  },
  verify() {
    const input = $('pin-input');
    const stored = localStorage.getItem(this.KEY);
    if (!stored) {
      this.hideOverlay();
      return;
    }
    if (input.value === stored) {
      this.hideOverlay();
      this.lastActive = Date.now();
    } else {
      if (window.RG.toast) window.RG.toast.show('PIN salah');
      input.value = '';
    }
  },
});

window.RG = window.RG || {};
window.RG.pin = pin;
