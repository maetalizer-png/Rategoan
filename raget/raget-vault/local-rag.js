import { bm25 } from '../raget-retrieval/bm25.js';

const DB = 'rategoan-local-rag';
const STORE = 'docs';

function tokenize(text) {
  return String(text || '').toLowerCase().split(/[^a-z0-9\u00c0-\u024f]+/i).filter((token) => token.length > 1);
}

function trigrams(text) {
  const compact = String(text || '').toLowerCase().replace(/\s+/g, ' ').trim();
  if (compact.length < 3) return compact ? [compact] : [];
  const out = [];
  for (let i = 0; i < compact.length - 2; i += 1) out.push(compact.slice(i, i + 3));
  return out;
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

export function searchDocs(docs, query, limit = 8) {
  const list = Array.isArray(docs) ? docs : [];
  const lexical = bm25.scoreAll(tokenize(query), list.map((doc) => tokenize(doc.text)));
  const queryGrams = counts(trigrams(query));
  return list
    .map((doc, index) => {
      const dense = cosine(queryGrams, counts(trigrams(doc.text)));
      return { ...doc, score: (lexical[index] || 0) * 0.65 + dense * 0.35 };
    })
    .filter((doc) => doc.score > 0.08)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE)) req.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function indexDocs(docs) {
  const db = await openDb();
  if (!db) return 0;
  await new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    docs.forEach((doc) => {
      if (!doc || doc.id == null) return;
      store.put({ id: String(doc.id), text: String(doc.text || ''), kind: doc.kind || '' });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  db.close();
  return docs.length;
}

export async function listDocs() {
  const db = await openDb();
  if (!db) return [];
  const rows = await new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => resolve([]);
  });
  db.close();
  return rows;
}

export const localRag = Object.freeze({ searchDocs, indexDocs, listDocs, tokenize });
