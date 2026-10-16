import { scorer } from '../raget-agents/scorer.js';
import { normalizeSlang } from '../../shared/text.js';
import { bm25 } from './bm25.js';

const AUGMENT_THRESHOLD = 0.35;
const LIST_THRESHOLD = 0.25;

const corpusTokenCache = new WeakMap();

function tokensFor(corpus, getText) {
  const cached = corpusTokenCache.get(corpus);
  if (cached && cached.getText === getText && cached.length === corpus.length) return cached.tokens;
  const tokens = corpus.map((item) => scorer.tokenize(getText(item)));
  corpusTokenCache.set(corpus, { getText, length: corpus.length, tokens });
  return tokens;
}

function scoreCorpus(queryTokens, corpus, textOf, entryPenalty, idOf) {
  const getText = textOf || ((item) => item.text || '');
  const getId = idOf || ((item) => item.id);
  const tokensList = tokensFor(corpus, getText);
  const scores = bm25.scoreAll(queryTokens, tokensList);
  return corpus.map((item, i) => {
    const penalty = entryPenalty && entryPenalty.size ? entryPenalty.get(getId(item)) : null;
    return { item, score: penalty ? scores[i] * penalty : scores[i] };
  });
}

const CACHE_LIMIT = 50;
const cache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

function normalizeCacheKey(query) {
  return String(query || '')
    .toLowerCase()
    .replace(/[.,!?;:'"()\[\]{}]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function cacheKey(query, corpus, threshold, limit) {
  return normalizeCacheKey(query) + '|' + corpus.length + '|' + threshold + '|' + limit;
}

function rank(query, corpus, options) {
  const opts = options || {};
  if (!corpus.length) return [];
  const normalized = normalizeSlang(query);
  const threshold = opts.threshold != null ? opts.threshold : LIST_THRESHOLD;
  const limit = opts.limit || 10;
  const usesPenalty = !!(opts.entryPenalty && opts.entryPenalty.size);
  const key = usesPenalty ? null : cacheKey(normalized, corpus, threshold, limit);
  if (key && cache.has(key)) {
    cacheHits++;
    const hit = cache.get(key);
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  cacheMisses++;
  const queryTokens = scorer.tokenize(normalized);
  const result = queryTokens.length
    ? scoreCorpus(queryTokens, corpus, opts.textOf, opts.entryPenalty, opts.idOf)
        .filter((s) => s.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    : [];
  if (key) {
    cache.set(key, result);
    if (cache.size > CACHE_LIMIT) {
      cache.delete(cache.keys().next().value);
    }
  }
  return result;
}

function cacheStats() {
  const total = cacheHits + cacheMisses;
  return { hits: cacheHits, misses: cacheMisses, hitRate: total ? cacheHits / total : 0 };
}

function best(query, corpus, options) {
  const results = rank(query, corpus, options);
  return results.length ? results[0] : null;
}

export const retrieval = Object.freeze({
  rank,
  best,
  cacheStats,
  AUGMENT_THRESHOLD,
  LIST_THRESHOLD,
});
