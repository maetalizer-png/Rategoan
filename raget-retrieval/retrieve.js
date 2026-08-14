import { scorer } from '../ai-agent/scorer.js';

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

function rank(query, corpus, options) {
  const opts = options || {};
  const queryTokens = scorer.tokenize(query);
  if (!queryTokens.length || !corpus.length) return [];
  const scored = scoreCorpus(queryTokens, corpus, opts.textOf);
  const threshold = opts.threshold != null ? opts.threshold : LIST_THRESHOLD;
  return scored
    .filter((s) => s.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, opts.limit || 10);
}

function best(query, corpus, options) {
  const results = rank(query, corpus, options);
  return results.length ? results[0] : null;
}

export const retrieval = Object.freeze({
  rank,
  best,
  AUGMENT_THRESHOLD,
  LIST_THRESHOLD,
});
