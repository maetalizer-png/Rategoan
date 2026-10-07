import { vaultKey } from '../../shared/vault-key.js';

const DB_NAME = 'raget_idb';
const DB_VERSION = 3;
const OBJECT_STORE = 'stores';
const MEDIA_CAP = 50 * 1024 * 1024;

let dbPromise = null;

function b64(bytes) {
  let out = '';
  bytes.forEach((n) => { out += String.fromCharCode(n); });
  return btoa(out);
}

function unb64(text) {
  return Uint8Array.from(atob(text), (ch) => ch.charCodeAt(0));
}

export async function packList(key, list) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const raw = new TextEncoder().encode(JSON.stringify(list));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, raw));
  return { enc: 1, iv: b64(iv), data: b64(cipher) };
}

export async function unpackList(key, row) {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: unb64(row.iv) }, key, unb64(row.data));
  const parsed = JSON.parse(new TextDecoder().decode(plain));
  return Array.isArray(parsed) ? parsed : [];
}

function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(OBJECT_STORE)) {
        db.createObjectStore(OBJECT_STORE, { keyPath: 'key' });
      }
      if (!db.objectStoreNames.contains('rag_index')) {
        db.createObjectStore('rag_index', { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function signalStorage(key, error) {
  if (typeof window !== 'undefined' && window.dispatchEvent) {
    window.dispatchEvent(new CustomEvent('rategoan:storage-error', { detail: { key, error: String((error && (error.name || error.message)) || error || 'quota') } }));
  }
}

function fitMedia(list) {
  const payload = Array.isArray(list) ? list : [];
  if (JSON.stringify(payload).length > MEDIA_CAP) {
    const err = new Error('QuotaExceededError');
    err.name = 'QuotaExceededError';
    signalStorage('media', err);
    throw err;
  }
  return payload;
}

async function readRow(key) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORE, 'readonly');
    const req = tx.objectStore(OBJECT_STORE).get(key);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

function putRecord(db, record) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORE, 'readwrite');
    tx.objectStore(OBJECT_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function allRows() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORE, 'readonly');
    const req = tx.objectStore(OBJECT_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function getList(key) {
  try {
    const row = await readRow(key);
    if (!row) return [];
    if (row.enc) {
      const held = vaultKey.current();
      if (!held) return [];
      return await unpackList(held, row);
    }
    return row.list || [];
  } catch (e) {
    return [];
  }
}

export function keepSealed(row, held) {
  return !!(row && row.enc && !held);
}

async function setList(key, list) {
  try {
    const payload = fitMedia(list);
    const db = await openDb();
    const held = vaultKey.current();
    const existing = await readRow(key);
    if (keepSealed(existing, held)) return;
    const record = held ? { key, ...(await packList(held, payload)) } : { key, list: payload };
    try {
      if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
        const est = await navigator.storage.estimate();
        const size = JSON.stringify(record).length;
        if (est.quota && est.usage != null && est.usage + size > est.quota) {
          signalStorage(key, 'QuotaExceededError');
          return;
        }
      }
      await putRecord(db, record);
    } catch (e) {
      signalStorage(key, e);
      console.warn('[Rategoan Fallback] idb-gateway:', e);
    }
  } catch (e) { console.warn('[Rategoan Fallback] idb-gateway:', e); }
}

async function sealAll() {
  const held = vaultKey.current();
  if (!held) return 0;
  const db = await openDb();
  const rows = await allRows();
  let count = 0;
  for (const row of rows) {
    if (!row || row.enc) continue;
    await putRecord(db, { key: row.key, ...(await packList(held, row.list || [])) });
    count += 1;
  }
  return count;
}

async function unsealAll() {
  const held = vaultKey.current();
  if (!held) return 0;
  const db = await openDb();
  const rows = await allRows();
  let count = 0;
  for (const row of rows) {
    if (!row || !row.enc) continue;
    const list = await unpackList(held, row);
    await putRecord(db, { key: row.key, list });
    count += 1;
  }
  return count;
}

export const idbGateway = Object.freeze({ getList, setList, sealAll, unsealAll, keepSealed });
