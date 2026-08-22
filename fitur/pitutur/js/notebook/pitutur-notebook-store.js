const DB_NAME = 'pitutur_notebooks';
const DB_VERSION = 1;
const STORE = 'notebooks';

function openDb() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const os = db.createObjectStore(STORE, { keyPath: 'id' });
        os.createIndex('byUpdated', 'updatedAt', { unique: false });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

function idBaru() {
  return 'nb' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

async function semua() {
  const db = await openDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = function () {
      const list = (req.result || []).slice().sort(function (a, b) {
        return (b.updatedAt || 0) - (a.updatedAt || 0);
      });
      resolve(list);
    };
    req.onerror = function () { reject(req.error); };
  });
}

async function ambil(id) {
  const db = await openDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = function () { resolve(req.result || null); };
    req.onerror = function () { reject(req.error); };
  });
}

async function simpan(nb) {
  nb.updatedAt = Date.now();
  const db = await openDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(nb);
    tx.oncomplete = function () { resolve(nb); };
    tx.onerror = function () { reject(tx.error); };
  });
}

async function hapus(id) {
  const db = await openDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
}

function sumberDariDoc(doc) {
  return {
    id: 'src_' + doc.id,
    type: 'dokumen',
    ref: doc.id,
    title: doc.name,
    words: doc.words,
    chunkCount: doc.chunkCount || (doc.chunks ? doc.chunks.length : 0)
  };
}

async function buat(title, doc, settings) {
  const nama = String(title || '').trim();
  if (!nama) throw new Error('Nama sesi wajib diisi');
  if (!doc || !doc.id) throw new Error('Pilih materi aktif dulu');
  const nb = {
    id: idBaru(),
    title: nama,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sources: [sumberDariDoc(doc)],
    progress: {},
    settings: {
      mode: (settings && settings.mode) || 'dialog',
      lang: (settings && settings.lang) || 'id',
      docMode: (settings && settings.docMode) || 'baca'
    }
  };
  return simpan(nb);
}

async function tambahMateri(notebookId, doc) {
  const nb = await ambil(notebookId);
  if (!nb) throw new Error('Sesi tidak ditemukan');
  if (!doc || !doc.id) throw new Error('Materi kosong');
  if (!nb.sources) nb.sources = [];
  const ada = nb.sources.some(function (s) { return s.type === 'dokumen' && s.ref === doc.id; });
  if (!ada) nb.sources.push(sumberDariDoc(doc));
  return simpan(nb);
}

async function catatProgres(notebookId, sourceRef, pos) {
  const nb = await ambil(notebookId);
  if (!nb) return null;
  if (!nb.progress) nb.progress = {};
  nb.progress[sourceRef] = pos;
  return simpan(nb);
}

async function catatProgresDokumen(docId, pos) {
  const list = await semua();
  const hits = (list || []).filter(function (nb) {
    return (nb.sources || []).some(function (s) {
      return s.type === 'dokumen' && s.ref === docId;
    });
  });
  return Promise.all(hits.map(function (nb) {
    return catatProgres(nb.id, docId, pos);
  }));
}

export const notebookStore = {
  semua: semua,
  ambil: ambil,
  simpan: simpan,
  hapus: hapus,
  buat: buat,
  tambahMateri: tambahMateri,
  catatProgres: catatProgres,
  catatProgresDokumen: catatProgresDokumen
};
