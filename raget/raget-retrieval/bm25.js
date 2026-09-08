// FR-2.1: BM25 ranking, used by retrieve.js#scoreCorpus() in place of the old
// TF-IDF cosine similarity. Tokenization is reused from scorer.tokenize() (the
// caller passes already-tokenized text in) so this file only owns the BM25 math.
//
// Standard Robertson-Sparck Jones BM25 with the usual k1/b free parameters:
//   score(q, d) = sum over query terms t of
//     idf(t) * ( tf(t, d) * (k1 + 1) ) / ( tf(t, d) + k1 * (1 - b + b * |d| / avgdl) )
//   idf(t) = ln( 1 + (N - df(t) + 0.5) / (df(t) + 0.5) )   (Lucene-style +1 smoothing,
//     kept non-negative for terms that appear in most/all documents, unlike the classic
//     Robertson-Sparck-Jones idf which can go negative and invert ranking)
//
// k1=1.5, b=0.75 are the standard defaults used by Lucene/Elasticsearch and are a
// reasonable default for this corpus's short factoid-style documents.
const K1 = 1.5;
const B = 0.75;

// BM25's raw score is unbounded (0..+Infinity, grows with query length, term rarity
// and term frequency) - nothing like cosine similarity's [0,1] range that every
// existing caller's threshold constant (AUGMENT_THRESHOLD, LIST_THRESHOLD, and each
// caller's own local threshold - FEWSHOT_MATCH_THRESHOLD, DATARIES_FALLBACK_THRESHOLD,
// CHOICE_THRESHOLD, etc.) was tuned against. Rather than touch every threshold at
// every call site, the raw score is normalized back into (0,1) with a saturating
// transform: raw / (raw + NORM_K). NORM_K was picked empirically by running
// raget-tools/bench-retrieval.mjs (164-country corpus, 656 gold queries) against a
// range of values and choosing the one whose hit@1/MRR matched or beat the old
// cosine-similarity baseline (hit@1 0.9848) at the same 0.3 threshold used by
// DATARIES_FALLBACK_THRESHOLD - NORM_K=1.8 reproduced that baseline exactly
// (hit@1 0.9848, fallback_rate 0.0152, identical misses) while still separating
// genuine non-matches (near-zero raw overlap) from real hits at the 0.25/0.35
// thresholds used elsewhere. See bench-retrieval.mjs / bench-retrieval-wisata.mjs
// / bench-retrieval-semua-domain.mjs for the harness this was validated against.
const NORM_K = 1.8;

function normalize(raw) {
  return raw > 0 ? raw / (raw + NORM_K) : 0;
}

// tokensList: array of already-tokenized documents (array of token arrays).
// Returns an array of normalized BM25 scores, one per document, same order/length
// as tokensList.
function scoreAll(queryTokens, tokensList) {
  const N = tokensList.length;
  if (!N || !queryTokens.length) return tokensList.map(() => 0);

  const docLens = tokensList.map((toks) => toks.length);
  const totalLen = docLens.reduce((a, b) => a + b, 0);
  const avgDocLen = totalLen / N || 1;

  const tfList = tokensList.map((toks) => {
    const tf = new Map();
    toks.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
    return tf;
  });

  const uniqueQueryTerms = Array.from(new Set(queryTokens));
  const idfMap = new Map();
  uniqueQueryTerms.forEach((term) => {
    let df = 0;
    for (const tf of tfList) {
      if (tf.has(term)) df++;
    }
    idfMap.set(term, Math.log(1 + (N - df + 0.5) / (df + 0.5)));
  });

  return tokensList.map((toks, i) => {
    const tf = tfList[i];
    const docLen = docLens[i];
    let raw = 0;
    uniqueQueryTerms.forEach((term) => {
      const freq = tf.get(term) || 0;
      if (!freq) return;
      const idf = idfMap.get(term) || 0;
      const denom = freq + K1 * (1 - B + (B * docLen) / avgDocLen);
      raw += (idf * (freq * (K1 + 1))) / denom;
    });
    return normalize(raw);
  });
}

export const bm25 = Object.freeze({
  K1,
  B,
  NORM_K,
  normalize,
  scoreAll,
});
