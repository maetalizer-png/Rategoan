const DEFAULT_WINDOW = 4;

function buildCooccurrence(tokenizedDocs, windowSize) {
  const w = windowSize || DEFAULT_WINDOW;
  const wordFreq = new Map();
  const coocFreq = new Map();
  let totalPairs = 0;

  tokenizedDocs.forEach((tokens) => {
    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      const start = Math.max(0, i - w);
      const end = Math.min(tokens.length - 1, i + w);
      for (let j = start; j <= end; j++) {
        if (j === i) continue;
        const context = tokens[j];
        let row = coocFreq.get(word);
        if (!row) {
          row = new Map();
          coocFreq.set(word, row);
        }
        row.set(context, (row.get(context) || 0) + 1);
        totalPairs++;
      }
    }
  });

  return { wordFreq, coocFreq, totalPairs };
}

function buildPPMITable(cooc) {
  const { wordFreq, coocFreq, totalPairs } = cooc;
  const ppmiTable = new Map();
  coocFreq.forEach((row, word) => {
    const wordCount = wordFreq.get(word) || 0;
    if (!wordCount) return;
    const ppmiRow = new Map();
    row.forEach((count, context) => {
      const contextCount = wordFreq.get(context) || 0;
      if (!contextCount) return;
      const pmi = Math.log2((count * totalPairs) / (wordCount * contextCount));
      if (pmi > 0) ppmiRow.set(context, pmi);
    });
    if (ppmiRow.size) ppmiTable.set(word, ppmiRow);
  });
  return ppmiTable;
}

function sparseAdd(target, source, weight) {
  source.forEach((v, k) => {
    target.set(k, (target.get(k) || 0) + v * weight);
  });
}

function documentVector(tokens, ppmiTable, idfWeights) {
  const vec = new Map();
  let totalWeight = 0;
  tokens.forEach((t) => {
    const row = ppmiTable.get(t);
    if (row) {
      const w = idfWeights ? idfWeights.get(t) || 0 : 1;
      if (w > 0) {
        sparseAdd(vec, row, w);
        totalWeight += w;
      }
    }
  });
  if (!totalWeight) return vec;
  vec.forEach((v, k) => vec.set(k, v / totalWeight));
  return vec;
}

function buildIdfWeights(tokenizedDocs) {
  const df = new Map();
  const N = tokenizedDocs.length;
  tokenizedDocs.forEach((tokens) => {
    new Set(tokens).forEach((t) => df.set(t, (df.get(t) || 0) + 1));
  });
  const idf = new Map();
  df.forEach((count, term) => idf.set(term, Math.log(1 + N / count)));
  return idf;
}

function sparseDot(a, b) {
  const [small, big] = a.size <= b.size ? [a, b] : [b, a];
  let sum = 0;
  small.forEach((v, k) => {
    const bv = big.get(k);
    if (bv !== undefined) sum += v * bv;
  });
  return sum;
}

function sparseNorm(a) {
  return Math.sqrt(sparseDot(a, a));
}

function cosineSparse(a, b) {
  const na = sparseNorm(a);
  const nb = sparseNorm(b);
  if (na === 0 || nb === 0) return 0;
  return sparseDot(a, b) / (na * nb);
}

function buildIndex(corpus, textOf, tokenizeFn, windowSize, idfWeights) {
  const tokenizedCorpus = corpus.map((item) => tokenizeFn(textOf(item)));
  const cooc = buildCooccurrence(tokenizedCorpus, windowSize);
  const ppmiTable = buildPPMITable(cooc);
  const vectors = tokenizedCorpus.map((tokens) => documentVector(tokens, ppmiTable, idfWeights));
  return { corpus, vectors, ppmiTable, idfWeights };
}

function rank(queryTokens, index, limit) {
  const queryVector = documentVector(queryTokens, index.ppmiTable, index.idfWeights);
  const scored = index.corpus.map((item, i) => ({ item, score: cosineSparse(queryVector, index.vectors[i]) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit || 10);
}

export const ppmiEmbedding = Object.freeze({
  buildCooccurrence,
  buildPPMITable,
  documentVector,
  buildIdfWeights,
  cosineSparse,
  buildIndex,
  rank,
});
