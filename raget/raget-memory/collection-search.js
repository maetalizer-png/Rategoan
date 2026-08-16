import { scorer } from '../raget-agents/scorer.js';

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

function itemHaystack(item) {
  return [item.text, item.note, item.tag, item.chatTitle].filter(Boolean).join(' ');
}

function fuzzySearch(items, query, limit) {
  const qWords = scorer.tokenize(query);
  if (!qWords.length) return [];
  const results = [];
  items.forEach((item) => {
    const itemWords = scorer.tokenize(itemHaystack(item));
    const matched = new Set();
    let score = 0;
    qWords.forEach((qw) => {
      let best = Infinity;
      let bestWord = null;
      itemWords.forEach((iw) => {
        if (iw === qw) { best = 0; bestWord = iw; return; }
        if (Math.abs(iw.length - qw.length) > 2) return;
        const d = levenshtein(qw, iw);
        if (d < best) { best = d; bestWord = iw; }
      });
      if (best <= 2 && bestWord) {
        score += best === 0 ? 2 : 1;
        matched.add(bestWord);
      }
    });
    if (score > 0) results.push({ item, score, matched: Array.from(matched) });
  });
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit || 20);
}

function highlightText(text, matchedWords) {
  if (!matchedWords || !matchedWords.length) return escapeHtml(text);
  const escaped = escapeHtml(text);
  const pattern = matchedWords
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length)
    .join('|');
  if (!pattern) return escaped;
  return escaped.replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
}

function escapeHtml(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function suggestTags(text, existingItems, limit) {
  const words = scorer.tokenize(text);
  if (!words.length) return [];
  const byTag = new Map();
  existingItems.forEach((it) => {
    if (!it.tag) return;
    const list = byTag.get(it.tag) || [];
    list.push(it.text);
    byTag.set(it.tag, list);
  });
  const tags = Array.from(byTag.keys());
  if (!tags.length) return [];
  const candidateTokens = tags.map((tag) => scorer.tokenize(byTag.get(tag).join(' ')));
  const scores = scorer.scoreIntent(words, candidateTokens);
  return tags
    .map((tag, i) => ({ tag, score: scores[i] }))
    .filter((t) => t.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 2)
    .map((t) => t.tag);
}

export const collectionSearch = Object.freeze({
  levenshtein,
  fuzzySearch,
  highlightText,
  suggestTags,
});
