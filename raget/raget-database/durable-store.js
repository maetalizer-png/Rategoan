export const JOURNAL_STORE = 'vfs_tx_journal';
export const HNSW_STORE = 'hnsw_vectors';
export const HNSW_NODES = 'hnsw_nodes';
export const SHADER_STORE = 'shader_cache';

const DB_NAME = 'rategoan_durable';
const DB_VERSION = 2;
const STORES = [JOURNAL_STORE, HNSW_STORE, HNSW_NODES, SHADER_STORE];
const memory = new Map();
let opening = null;

function box(store) {
  if (!memory.has(store)) memory.set(store, new Map());
  return memory.get(store);
}

export function memoryAll(store) {
  return Array.from(box(store).values());
}

function openDb() {
  if (typeof indexedDB === 'undefined') return Promise.reject(new Error('indexedDB'));
  if (opening) return opening;
  opening = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      STORES.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name, { keyPath: 'id' });
      });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('indexedDB'));
  });
  return opening;
}

export function putRow(store, row) {
  const id = String((row && row.id) || '');
  const copy = Object.assign({}, row, { id });
  box(store).set(id, copy);
  if (typeof indexedDB === 'undefined') return Promise.resolve(id);
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    tx.objectStore(store).put(copy);
    tx.oncomplete = () => resolve(id);
    tx.onerror = () => reject(tx.error || new Error('put'));
  }));
}

export function allRows(store) {
  if (typeof indexedDB === 'undefined') return Promise.resolve(memoryAll(store));
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error || new Error('read'));
  })).catch(() => memoryAll(store));
}
