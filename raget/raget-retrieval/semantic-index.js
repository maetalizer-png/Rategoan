import { LLMEmbedding } from '../raget-neural/llm-embedding.js';

function buildVocab(tokenizedCorpus) {
  const vocab = new Map();
  tokenizedCorpus.forEach((tokens) => {
    tokens.forEach((t) => {
      if (!vocab.has(t)) vocab.set(t, vocab.size);
    });
  });
  return vocab;
}

function tokensToIds(tokens, vocab) {
  const ids = [];
  tokens.forEach((t) => {
    const id = vocab.get(t);
    if (id !== undefined) ids.push(id);
  });
  return ids;
}

function meanPool(tokenVectors, dModel) {
  if (!tokenVectors.length) return LLMEmbedding.zerosVector(dModel);
  const sum = tokenVectors.reduce((acc, v) => LLMEmbedding.addVectors(acc, v), LLMEmbedding.zerosVector(dModel));
  return LLMEmbedding.scaleVector(sum, 1 / tokenVectors.length);
}

function embedTokens(tokens, vocab, embeddingTable, dModel) {
  const ids = tokensToIds(tokens, vocab);
  if (!ids.length) return LLMEmbedding.zerosVector(dModel);
  const vectors = LLMEmbedding.lookupEmbeddings(embeddingTable, ids);
  return meanPool(vectors, dModel);
}

function vectorNorm(v) {
  return Math.sqrt(LLMEmbedding.dotProduct(v, v));
}

function cosineSimilarity(a, b) {
  const na = vectorNorm(a);
  const nb = vectorNorm(b);
  if (na === 0 || nb === 0) return 0;
  return LLMEmbedding.dotProduct(a, b) / (na * nb);
}

function buildIndex(corpus, textOf, tokenizeFn, dModel, initStd) {
  const tokenizedCorpus = corpus.map((item) => tokenizeFn(textOf(item)));
  const vocab = buildVocab(tokenizedCorpus);
  const embeddingTable = LLMEmbedding.createEmbeddingMatrix(vocab.size, dModel, initStd || 0.02);
  const vectors = tokenizedCorpus.map((tokens) => embedTokens(tokens, vocab, embeddingTable, dModel));
  return { corpus, vectors, vocab, embeddingTable, dModel };
}

function rank(queryTokens, index, limit) {
  const queryVector = embedTokens(queryTokens, index.vocab, index.embeddingTable, index.dModel);
  const scored = index.corpus.map((item, i) => ({ item, score: cosineSimilarity(queryVector, index.vectors[i]) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit || 10);
}

export const semanticIndex = Object.freeze({
  buildVocab,
  tokensToIds,
  meanPool,
  embedTokens,
  cosineSimilarity,
  buildIndex,
  rank,
});
