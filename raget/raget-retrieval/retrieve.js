import { scorer } from '../raget-agents/scorer.js';
import { normalizeSlang } from '../../utils/text.js';
import { bm25 } from './bm25.js';

// FR-2.1: thresholds kept at their pre-BM25 values on purpose. scoreCorpus()
// below normalizes BM25's unbounded raw score back into the same (0,1) shape
// cosine similarity used to produce (see bm25.js#normalize for why and how
// the constant was picked), so every caller that compares a retrieval.rank()/
// best() score against a threshold - these two exports AND each caller's own
// local constant (FEWSHOT_MATCH_THRESHOLD in agent.js, DATARIES_FALLBACK_THRESHOLD
// in dataries-bridge.js, CHOICE_THRESHOLD/DATARIES_THRESHOLD in planner.js, etc.) -
// keeps behaving sensibly without being touched. Verified live + via
// raget-tools/bench-retrieval*.mjs against the old TF-IDF cosine baseline.
const AUGMENT_THRESHOLD = 0.35;
const LIST_THRESHOLD = 0.25;

function scoreCorpus(queryTokens, corpus, textOf) {
  const getText = textOf || ((item) => item.text || '');
  const tokensList = corpus.map((item) => scorer.tokenize(getText(item)));
  const scores = bm25.scoreAll(queryTokens, tokensList);
  return corpus.map((item, i) => ({ item, score: scores[i] }));
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
