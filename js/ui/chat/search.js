/**
 * Chat Search - In-chat message search functionality
 * @module ui/chat/search
 */

import { RG } from '../../core/index.js';

/**
 * Chat message search with navigation
 */
RG.chatsearch = {
  matches: [],
  idx: -1,
  open: false,

  /**
   * Toggle search bar visibility
   */
  toggle() {
    const bar = RG.$('chat-search-bar');
    this.open = !this.open;
    bar.hidden = !this.open;
    if (this.open) {
      RG.$('chat-search-input').value = '';
      this.clear();
      RG.$('chat-search-input').focus();
    } else {
      this.clear();
    }
  },

  /**
   * Clear search results
   */
  clear() {
    this.matches.forEach((el) => el.classList.remove('hit'));
    this.matches = [];
    this.idx = -1;
    this.count();
  },

  /**
   * Run search query
   * @param {string} q - Search query
   */
  run(q) {
    this.clear();
    q = (q || '').toLowerCase().trim();
    if (!q) return;
    Array.from(RG.$('messages').querySelectorAll('.msg')).forEach((el) => {
      if ((el.textContent || '').toLowerCase().includes(q)) this.matches.push(el);
    });
    if (this.matches.length) {
      this.idx = 0;
      this.focus();
    }
    this.count();
  },

  /**
   * Update match count display
   */
  count() {
    const c = RG.$('chat-search-count');
    if (c) c.textContent = this.matches.length ? (this.idx + 1) + '/' + this.matches.length : '0';
  },

  /**
   * Focus current match
   */
  focus() {
    const el = this.matches[this.idx];
    if (!el) return;
    this.matches.forEach((m) => m.classList.remove('hit'));
    el.classList.add('hit');
    el.scrollIntoView({ block: 'center' });
    this.count();
  },

  /**
   * Go to next match
   */
  next() {
    if (!this.matches.length) return;
    this.idx = (this.idx + 1) % this.matches.length;
    this.focus();
  },

  /**
   * Go to previous match
   */
  prev() {
    if (!this.matches.length) return;
    this.idx = (this.idx - 1 + this.matches.length) % this.matches.length;
    this.focus();
  },

  /**
   * Bind search event listeners
   */
  bind() {
    RG.$('btn-chat-search').onclick = () => this.toggle();
    RG.$('chat-search-input').addEventListener('input', (e) => this.run(e.target.value));
    RG.$('chat-search-next').onclick = () => this.next();
    RG.$('chat-search-prev').onclick = () => this.prev();
    RG.$('chat-search-close').onclick = () => this.toggle();
  },
};

export { RG };
