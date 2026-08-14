const STOPWORDS = new Set([
  'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka',
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
  'ini', 'itu', 'ada', 'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'kenapa', 'bagaimana', 'berapa',
  'saja', 'juga', 'akan', 'sudah', 'belum', 'tidak', 'bukan', 'ya', 'ga', 'gak',
]);

const CONFIDENCE_THRESHOLD = 0.35;

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

function termFreq(tokens) {
  const tf = new Map();
  tokens.forEach((t) => tf.set(t, (tf.get(t) || 0) + 1));
  return tf;
}

function idf(term, corpusTokenSets) {
  const df = corpusTokenSets.reduce((acc, set) => acc + (set.has(term) ? 1 : 0), 0);
  return Math.log((corpusTokenSets.length + 1) / (df + 1)) + 1;
}

function tfidfVector(tokens, corpusTokenSets) {
  const tf = termFreq(tokens);
  const vec = new Map();
  tf.forEach((freq, term) => vec.set(term, freq * idf(term, corpusTokenSets)));
  return vec;
}

function cosineSim(vecA, vecB) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  vecA.forEach((val, key) => {
    normA += val * val;
    if (vecB.has(key)) dot += val * vecB.get(key);
  });
  vecB.forEach((val) => { normB += val * val; });
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

function scoreIntent(queryTokens, candidateTokensList) {
  const corpus = [queryTokens, ...candidateTokensList].map((t) => new Set(t));
  const qVec = tfidfVector(queryTokens, corpus);
  return candidateTokensList.map((tokens) => cosineSim(qVec, tfidfVector(tokens, corpus)));
}

function decay(baseScore, turnsAgo, rate) {
  const r = rate == null ? 0.9 : rate;
  return baseScore * Math.pow(r, Math.max(0, turnsAgo));
}

function hashText(text) {
  let h = 0;
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function pickVariant(seedText, templates) {
  if (!templates || !templates.length) return '';
  return templates[hashText(seedText) % templates.length];
}

export const scorer = Object.freeze({
  normalize,
  tokenize,
  tfidfVector,
  cosineSim,
  scoreIntent,
  decay,
  hashText,
  pickVariant,
  CONFIDENCE_THRESHOLD,
});
