import { scorer } from '../raget-agents/scorer.js';
import { normalizeSlang } from '../../utils/text.js';

const AUGMENT_THRESHOLD = 0.35;
const LIST_THRESHOLD = 0.25;

function scoreCorpus(queryTokens, corpus, textOf) {
  const getText = textOf || ((item) => item.text || '');
  const tokensList = corpus.map((item) => scorer.tokenize(getText(item)));
  const allSets = [queryTokens, ...tokensList].map((t) => new Set(t));
  const qVec = scorer.tfidfVector(queryTokens, allSets);
  return corpus.map((item, i) => ({
    item,
    score: scorer.cosineSim(qVec, scorer.tfidfVector(tokensList[i], allSets)),
  }));
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
  const key = cacheKey(normalized, corpus, threshold, limit);
  if (cache.has(key)) {
    cacheHits++;
    const hit = cache.get(key);
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  cacheMisses++;
  const queryTokens = scorer.tokenize(normalized);
  const result = queryTokens.length
    ? scoreCorpus(queryTokens, corpus, opts.textOf)
        .filter((s) => s.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
    : [];
  cache.set(key, result);
  if (cache.size > CACHE_LIMIT) {
    cache.delete(cache.keys().next().value);
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
