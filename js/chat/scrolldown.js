import { $ } from '../core/utils.js';

export const scrolldown = Object.freeze({
  btn: null,
  badge: null,
  unread: 0,
  init() {
    this.btn = $('btn-scroll-down');
    this.badge = $('scroll-badge');
    if (!this.btn) return;
    this.btn.onclick = () => this.scrollToBottom();
    const m = $('messages');
    if (m) {
      m.addEventListener('scroll', () => this.update());
    }
  },
  update() {
    const m = $('messages');
    if (!m) return;
    const threshold = 100;
    const atBottom = m.scrollHeight - m.scrollTop - m.clientHeight < threshold;
    if (!atBottom) {
      if (this.btn) this.btn.hidden = false;
      this.unread++;
      if (this.badge) {
        this.badge.textContent = this.unread;
        this.badge.hidden = false;
      }
    } else {
      if (this.btn) this.btn.hidden = true;
      if (this.badge) this.badge.hidden = true;
      this.unread = 0;
    }
  },
  scrollToBottom() {
    const m = $('messages');
    if (!m) return;
    m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' });
    this.unread = 0;
    this.update();
  },
});

window.RG = window.RG || {};
window.RG.scrolldown = scrolldown;
