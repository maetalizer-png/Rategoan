import { bm25 } from '../raget-retrieval/bm25.js';

function tokenize(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/i).filter((token) => token.length > 1);
}

function counts(tokens) {
  const map = new Map();
  tokens.forEach((token) => map.set(token, (map.get(token) || 0) + 1));
  return map;
}

function cosine(left, right) {
  let dot = 0;
  let leftSq = 0;
  let rightSq = 0;
  left.forEach((value, key) => {
    leftSq += value * value;
    dot += value * (right.get(key) || 0);
  });
  right.forEach((value) => { rightSq += value * value; });
  if (!leftSq || !rightSq) return 0;
  return dot / Math.sqrt(leftSq * rightSq);
}

function ranks(scores) {
  const order = scores.map((score, index) => ({ score, index })).sort((a, b) => b.score - a.score);
  const out = new Array(scores.length);
  order.forEach((item, place) => {
    out[item.index] = item.score > 0 ? place + 1 : scores.length + 1;
  });
  return out;
}

export function cosineText(left, right) {
  return cosine(counts(tokenize(left)), counts(tokenize(right)));
}

export function extractEntities(text) {
  const src = String(text || '');
  const pasal = src.match(/pasal\s+\d+[a-z]?(?:\s+ayat\s*\(\d+\))?/gi) || [];
  const names = src.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/g) || [];
  return [...new Set(pasal.concat(names))].slice(0, 16);
}

export function hybridRank(docs, query, limit = 5) {
  const list = Array.isArray(docs) ? docs : [];
  const q = String(query || '');
  const lexical = bm25.scoreAll(tokenize(q), list.map((doc) => tokenize(doc.text)));
  const queryGrams = counts(tokenize(q));
  const dense = list.map((doc) => cosine(queryGrams, counts(tokenize(doc.text))));
  const rankBm = ranks(lexical);
  const rankVec = ranks(dense);
  const k = 60;
  return list.map((doc, index) => ({
    ...doc,
    score: (1 / (k + rankBm[index])) + (1 / (k + rankVec[index])),
  })).sort((a, b) => b.score - a.score).slice(0, limit);
}
