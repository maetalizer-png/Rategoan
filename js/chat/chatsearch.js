import { $ } from '../utils/dom.js';
import { collectionSearch } from '../../raget-memory/collection-search.js';

const FUZZY_MAX_DISTANCE = 2;

function fuzzyTextMatch(haystack, query) {
  if (haystack.includes(query)) return true;
  const qWords = query.split(/\s+/).filter((w) => w.length >= 3);
  if (!qWords.length || qWords.length > 3) return false;
  const hWords = haystack.split(/\s+/).filter((w) => w.length >= 3);
  return qWords.every((qw) => hWords.some((hw) => collectionSearch.levenshtein(qw, hw) <= FUZZY_MAX_DISTANCE));
}

export const chatsearch = {
  matches: [],
  idx: -1,
  open: false,
  toggle() {
    const bar = $('chat-search-bar');
    this.open = !this.open;
    bar.hidden = !this.open;
    if (this.open) {
      $('chat-search-input').value = '';
      this.clear();
      $('chat-search-input').focus();
    } else {
      this.clear();
    }
  },
  clear() {
    this.matches.forEach((el) => el.classList.remove('hit'));
    this.matches = [];
    this.idx = -1;
    this.count();
  },
  run(q) {
    this.clear();
    q = (q || '').toLowerCase().trim();
    if (!q) return;
    Array.from($('messages').querySelectorAll('.msg')).forEach((el) => {
      if (fuzzyTextMatch((el.textContent || '').toLowerCase(), q)) this.matches.push(el);
    });
    if (this.matches.length) {
      this.idx = 0;
      this.focus();
    }
    this.count();
  },
  count() {
    const c = $('chat-search-count');
    if (c) c.textContent = this.matches.length ? this.idx + 1 + '/' + this.matches.length : '0';
  },
  focus() {
    const el = this.matches[this.idx];
    if (!el) return;
    this.matches.forEach((m) => m.classList.remove('hit'));
    el.classList.add('hit');
    el.scrollIntoView({ block: 'center' });
    this.count();
  },
  next() {
    if (!this.matches.length) return;
    this.idx = (this.idx + 1) % this.matches.length;
    this.focus();
  },
  prev() {
    if (!this.matches.length) return;
    this.idx = (this.idx - 1 + this.matches.length) % this.matches.length;
    this.focus();
  },
  bind() {
    $('btn-chat-search').onclick = () => this.toggle();
    $('chat-search-input').addEventListener('input', (e) => this.run(e.target.value));
    $('chat-search-next').onclick = () => this.next();
    $('chat-search-prev').onclick = () => this.prev();
    $('chat-search-close').onclick = () => this.toggle();
  },
};
