const DB_NAME = 'raget_idb';
const DB_VERSION = 1;
const OBJECT_STORE = 'stores';

let dbPromise = null;

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
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

async function getList(key) {
  try {
    const db = await openDb();
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(OBJECT_STORE, 'readonly');
      const req = tx.objectStore(OBJECT_STORE).get(key);
      req.onsuccess = () => resolve((req.result && req.result.list) || []);
      req.onerror = () => reject(req.error);
    });
  } catch (e) {
    return [];
  }
}

function putList(db, key, list) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OBJECT_STORE, 'readwrite');
    tx.objectStore(OBJECT_STORE).put({ key, list });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function setList(key, list) {
  try {
    const db = await openDb();
    try {
      await putList(db, key, list);
    } catch (e) {
      let shrunk = list;
      while (shrunk.length > 1) {
        shrunk = shrunk.slice(Math.ceil(shrunk.length / 2));
        try {
          await putList(db, key, shrunk);
          return;
        } catch (e2) {
          continue;
        }
      }
    }
  } catch (e) {}
}

export const idbGateway = Object.freeze({ getList, setList });
