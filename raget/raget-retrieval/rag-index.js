import { buildPostings, chunkText } from './chunk-text.js';

export const EMBED_DIM = 384;
const DB_NAME = 'raget_idb';
const DB_VERSION = 3;
const STORE = 'rag_index';

export function embed384(text) {
  const out = new Float32Array(EMBED_DIM);
  const tokens = String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  tokens.forEach((token) => {
    let hash = 2166136261;
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    const idx = Math.abs(hash) % EMBED_DIM;
    out[idx] += (hash & 1) ? 1 : -1;
  });
  let sum = 0;
  for (let i = 0; i < out.length; i += 1) sum += out[i] * out[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < out.length; i += 1) out[i] /= norm;
  return out;
}

export function cosine(left, right) {
  let dot = 0;
  const n = Math.min(left.length, right.length);
  for (let i = 0; i < n; i += 1) dot += left[i] * right[i];
  return dot;
}

function lexical(query, text) {
  const terms = new Set(String(query || '').toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 1));
  const words = String(text || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  let hit = 0;
  words.forEach((word) => { if (terms.has(word)) hit += 1; });
  return terms.size ? hit / terms.size : 0;
}

export function hybridRank(query, docs) {
  const vector = embed384(query);
  return (docs || [])
    .map((doc) => {
      const text = String((doc && doc.text) || '');
      const dense = cosine(vector, embed384(text));
      const score = lexical(query, text) * 0.55 + Math.max(0, dense) * 0.45;
      return { id: doc && doc.id, text, score };
    })
    .filter((doc) => doc.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function indexRecord(docs) {
  const list = docs || [];
  const chunks = [];
  list.forEach((doc) => {
    chunkText(doc.text).forEach((part, index) => {
      chunks.push({ id: String(doc.id) + ':' + index, text: part });
    });
  });
  return { id: 'postings', map: buildPostings(chunks.map((chunk) => chunk.text)), chunks };
}

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('stores')) db.createObjectStore('stores', { keyPath: 'key' });
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export async function savePostings(record, store) {
  if (store && store.put) {
    await store.put(record);
    return true;
  }
  const db = await openDb();
  if (!db) return false;
  await new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  });
  return true;
}

export async function loadPostings(store) {
  if (store && store.get) return store.get('postings');
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get('postings');
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
}
