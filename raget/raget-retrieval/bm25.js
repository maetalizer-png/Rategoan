const K1 = 1.5;
const B = 0.75;

const NORM_K = 1.8;

function normalize(raw) {
  return raw > 0 ? raw / (raw + NORM_K) : 0;
}

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
