import { $ } from '../core/utils.js';

export const chatsearch = Object.freeze({
  input: null,
  countEl: null,
  matches: [],
  idx: -1,
  init() {
    this.input = $('chat-search-input');
    this.countEl = $('chat-search-count');
    if (!this.input) return;
    this.input.addEventListener('input', () => this.search());
    const prev = $('chat-search-prev');
    const next = $('chat-search-next');
    const close = $('chat-search-close');
    if (prev) prev.onclick = () => this.prev();
    if (next) next.onclick = () => this.next();
    if (close) close.onclick = () => this.hide();
  },
  show() {
    const bar = $('chat-search-bar');
    if (bar) bar.hidden = false;
    if (this.input) this.input.focus();
  },
  hide() {
    const bar = $('chat-search-bar');
    if (bar) bar.hidden = true;
    this.matches = [];
    this.idx = -1;
    this.updateCount();
  },
  search() {
    const q = (this.input.value || '').toLowerCase();
    const msgs = document.querySelectorAll('.msg-bubble');
    this.matches = [];
    msgs.forEach((el, i) => {
      el.classList.remove('highlight');
      if (q && el.textContent.toLowerCase().includes(q)) {
        this.matches.push(el);
      }
    });
    this.idx = this.matches.length ? 0 : -1;
    this.highlight();
    this.updateCount();
  },
  prev() {
    if (!this.matches.length) return;
    this.idx = (this.idx - 1 + this.matches.length) % this.matches.length;
    this.highlight();
  },
  next() {
    if (!this.matches.length) return;
    this.idx = (this.idx + 1) % this.matches.length;
    this.highlight();
  },
  highlight() {
    this.matches.forEach((el, i) => {
      el.classList.toggle('highlight', i === this.idx);
    });
    if (this.matches[this.idx]) {
      this.matches[this.idx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  },
  updateCount() {
    if (this.countEl) this.countEl.textContent = this.matches.length ? (this.idx + 1) + '/' + this.matches.length : '0';
  },
});

window.RG = window.RG || {};
window.RG.chatsearch = chatsearch;
