import { $ } from '../../shared/dom.js';
import { toast } from '../core/toast.js';

export const pin = {
  KEY: 'rategoan_pin',
  has() {
    return !!localStorage.getItem(this.KEY);
  },
  set(p) {
    localStorage.setItem(this.KEY, this.hash(p));
  },
  clear() {
    localStorage.removeItem(this.KEY);
  },
  hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    }
    return String(h);
  },
  verify(p) {
    return this.hash(p) === localStorage.getItem(this.KEY);
  },
  lock() {
    const ov = $('pin-overlay');
    if (!ov) return;
    ov.hidden = false;
    const inp = $('pin-input');
    inp.value = '';
    inp.focus();
  },
  unlock() {
    const ov = $('pin-overlay');
    if (ov) ov.hidden = true;
  },
  bind() {
    const submit = $('pin-submit');
    if (!submit) return;
    submit.onclick = () => {
      const v = $('pin-input').value.trim();
      if (this.verify(v)) {
        this.unlock();
        toast.show('Terbuka');
      } else {
        toast.show('PIN salah');
      }
    };
  },
  bindAutoLock() {
    let hiddenAt = 0;
    document.addEventListener('visibilitychange', () => {
      if (!this.has()) return;
      if (document.hidden) {
        hiddenAt = Date.now();
      } else if (hiddenAt && Date.now() - hiddenAt > 5 * 60 * 1000) {
        this.lock();
      }
    });
  },
};
