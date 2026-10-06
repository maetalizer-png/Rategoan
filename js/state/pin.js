import { $ } from '../../shared/dom.js';
import { toast } from '../core/toast.js';
import { vaultKey } from '../../shared/vault-key.js';
import { idbGateway } from '../../raget/raget-database/idb-gateway.js';

export const pin = {
  KEY: 'rategoan_pin',
  has() {
    return !!localStorage.getItem(this.KEY);
  },
  async clear() {
    try { await idbGateway.unsealAll(); } catch (e) { console.warn('[Rategoan Fallback]', e); }
    vaultKey.drop();
    localStorage.removeItem(this.KEY);
  },
  FAIL_KEY: 'rategoan_pin_fail',
  legacyHash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return String(h);
  },
  bytes(text) {
    return new TextEncoder().encode(text);
  },
  b64(bytes) {
    let out = '';
    bytes.forEach((n) => { out += String.fromCharCode(n); });
    return btoa(out);
  },
  unb64(text) {
    return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
  },
  async deriveKey(value, salt, iterations) {
    const base = await crypto.subtle.importKey('raw', this.bytes(value), 'PBKDF2', false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: iterations || 100000, hash: 'SHA-256' },
      base,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },
  async hold(value, salt, iterations) {
    const key = await this.deriveKey(value, salt, iterations);
    vaultKey.hold(key);
    return key;
  },
  async set(p) {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const key = await this.hold(p, salt, 100000);
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, this.bytes('rategoan-pin')));
    localStorage.setItem(this.KEY, 'v3:' + this.b64(salt) + ':' + this.b64(iv) + ':' + this.b64(cipher));
    await idbGateway.sealAll();
  },
  lockedUntil() {
    const raw = sessionStorage.getItem(this.FAIL_KEY) || '';
    return Number(raw.split(':')[0] || 0);
  },
  noteFail() {
    const raw = sessionStorage.getItem(this.FAIL_KEY) || '0';
    const count = raw.indexOf(':') > 0 ? Number(raw.split(':')[1]) : 0;
    const next = count + 1;
    if (next >= 5) sessionStorage.setItem(this.FAIL_KEY, String(Date.now() + 30000) + ':' + next);
    else sessionStorage.setItem(this.FAIL_KEY, '0:' + next);
  },
  clearFail() {
    sessionStorage.removeItem(this.FAIL_KEY);
  },
  async verify(p) {
    const until = this.lockedUntil();
    if (until > Date.now()) return false;
    const raw = localStorage.getItem(this.KEY) || '';
    if (raw.indexOf('v3:') === 0 || raw.indexOf('v2:') === 0) {
      try {
        const iterations = raw.indexOf('v3:') === 0 ? 100000 : 20000;
        const parts = raw.slice(3).split(':');
        const salt = this.unb64(parts[0]);
        const key = await this.hold(p, salt, iterations);
        await crypto.subtle.decrypt({ name: 'AES-GCM', iv: this.unb64(parts[1]) }, key, this.unb64(parts[2]));
        this.clearFail();
        await idbGateway.sealAll();
        return true;
      } catch (e) {
        vaultKey.drop();
        this.noteFail();
        return false;
      }
    }
    if (raw && this.legacyHash(p) === raw) {
      await this.set(p);
      this.clearFail();
      return true;
    }
    if (raw) this.noteFail();
    return false;
  },
  lock() {
    vaultKey.drop();
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
    if (this.has()) this.lock();
    submit.onclick = async () => {
      const v = $('pin-input').value.trim();
      const until = this.lockedUntil();
      if (until > Date.now()) {
        toast.show('Tunggu ' + Math.ceil((until - Date.now()) / 1000) + ' detik');
        return;
      }
      if (await this.verify(v)) {
        this.unlock();
        document.dispatchEvent(new CustomEvent('rategoan:vault-open'));
        toast.show('Terbuka');
      } else {
        toast.show(this.lockedUntil() > Date.now() ? 'PIN salah. Terkunci 30 detik' : 'PIN salah');
      }
    };
  },
  bindAutoLock() {
    let timer = 0;
    document.addEventListener('visibilitychange', () => {
      if (!this.has()) return;
      if (document.hidden) {
        timer = window.setTimeout(() => this.lock(), 5 * 60 * 1000);
      } else if (timer) {
        window.clearTimeout(timer);
        timer = 0;
      }
    });
  },
};
