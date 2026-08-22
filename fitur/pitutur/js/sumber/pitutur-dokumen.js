import { buatChunk } from '../naskah/pitutur-chunk.js';
import { bersihkanTeksMateri } from './pitutur-http.js';

const DB_NAME = 'pitutur_dokumen';
const DB_VERSION = 2;
const STORE = 'dokumen';
const PDFJS_VERSION = '4.6.82';

function bukaDb() {
  return new Promise(function (resolve, reject) {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB tidak didukung di perangkat ini.'));
      return;
    }
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = function () {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = function () { resolve(req.result); };
    req.onerror = function () { reject(req.error); };
  });
}

async function daftar() {
  const db = await bukaDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = function () {
      const hasil = (req.result || []).slice().sort(function (a, b) {
        return b.addedAt - a.addedAt;
      });
      resolve(hasil);
    };
    req.onerror = function () { reject(req.error); };
  });
}

async function simpan(doc) {
  const db = await bukaDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).put(doc);
    tx.oncomplete = function () { resolve(doc); };
    tx.onerror = function () { reject(tx.error); };
  });
}

async function hapus(id) {
  const db = await bukaDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = function () { resolve(); };
    tx.onerror = function () { reject(tx.error); };
  });
}

async function ambil(id) {
  const db = await bukaDb();
  return new Promise(function (resolve, reject) {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = function () {
      const doc = req.result || null;
      if (doc && (!doc.chunks || !doc.chunks.length) && doc.text) {
        doc.chunks = buatChunk(doc.text);
      }
      resolve(doc);
    };
    req.onerror = function () { reject(req.error); };
  });
}

function idBaru() {
  return 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function hitungKata(t) {
  return String(t || '').trim().split(/\s+/).filter(Boolean).length;
}

function ekstensi(nama) {
  return (String(nama || '').split('.').pop() || '').toLowerCase();
}

function ekstrakDariJson(data) {
  const potongan = [];
  function jelajah(node, kunci) {
    if (node == null) return;
    if (typeof node === 'string') {
      const t = node.trim();
      if (t.length > 3) potongan.push(t);
      return;
    }
    if (typeof node === 'number' || typeof node === 'boolean') {
      if (kunci) potongan.push(String(kunci) + ': ' + String(node));
      return;
    }
    if (Array.isArray(node)) {
      node.forEach(function (item) { jelajah(item, kunci); });
      return;
    }
    if (typeof node === 'object') {
      if (typeof node.text === 'string' && node.text.trim()) {
        potongan.push(node.text.trim());
        return;
      }
      if (typeof node.content === 'string' && node.content.trim()) {
        potongan.push(node.content.trim());
        return;
      }
      if (typeof node.title === 'string' && node.title.trim()) {
        potongan.push(node.title.trim());
      }
      Object.keys(node).forEach(function (k) {
        if (k === 'title' || k === 'text' || k === 'content') return;
        jelajah(node[k], k);
      });
    }
  }
  jelajah(data, null);
  return potongan.map(function (s) {
    const t = s.trim();
    if (!t) return '';
    if (/[.!?]$/.test(t)) return t;
    return t + '.';
  }).filter(Boolean).join(' ');
}

let pdfjsPromise = null;
function muatPdfJs() {
  if (pdfjsPromise) return pdfjsPromise;
  const base = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/';
  pdfjsPromise = import(base + 'pdf.min.mjs').then(function (mod) {
    mod.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
    return mod;
  }).catch(function (e) {
    pdfjsPromise = null;
    throw new Error('Gagal memuat pustaka pembaca PDF (butuh koneksi internet saat pertama kali). ' + e.message);
  });
  return pdfjsPromise;
}

async function ekstrakDariPdf(file, onProgress) {
  const pdfjsLib = await muatPdfJs();
  const buf = await file.arrayBuffer();
  let doc;
  try {
    doc = await pdfjsLib.getDocument({ data: buf }).promise;
  } catch (e) {
    throw new Error('PDF tidak bisa dibuka. File mungkin rusak atau terlindungi sandi.');
  }
  const maxHalaman = Math.min(doc.numPages, 80);
  const bagian = [];
  for (let i = 1; i <= maxHalaman; i++) {
    if (typeof onProgress === 'function') {
      onProgress(i, maxHalaman);
    }
    try {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      const teksHalaman = content.items.map(function (it) { return it.str; }).join(' ');
      if (teksHalaman.trim()) bagian.push(teksHalaman.trim());
    } catch (e) {}
  }
  const gabung = bagian.join('\n\n').replace(/\s+/g, ' ').trim();
  if (!gabung || gabung.length < 20) {
    throw new Error('PDF ini tidak berisi teks yang bisa dibaca (kemungkinan hasil scan gambar). Ubah ke TXT atau tempel teksnya.');
  }
  if (doc.numPages > maxHalaman) {
    return gabung + '\n\n[Catatan: hanya ' + maxHalaman + ' halaman pertama yang dibaca.]';
  }
  return gabung;
}

function tebakEkstensi(file) {
  let ext = ekstensi(file.name);
  if (ext && ext !== 'bin') return ext;
  const mime = String(file.type || '').toLowerCase();
  if (mime.indexOf('pdf') !== -1) return 'pdf';
  if (mime.indexOf('json') !== -1) return 'json';
  if (mime.indexOf('markdown') !== -1) return 'md';
  if (mime.indexOf('text') !== -1) return 'txt';
  return ext || 'txt';
}

async function ekstrakTeks(file, onProgress) {
  const ext = tebakEkstensi(file);
  if (ext === 'txt' || ext === 'md') {
    return await file.text();
  }
  if (ext === 'json') {
    const raw = await file.text();
    let data;
    try { data = JSON.parse(raw); } catch (e) { return raw; }
    return ekstrakDariJson(data);
  }
  if (ext === 'pdf') {
    return await ekstrakDariPdf(file, onProgress);
  }
  throw new Error('Format belum didukung. Gunakan PDF, JSON, TXT, atau MD.');
}

async function buatDariTeks(nama, mentah, tipe) {
  let teks = bersihkanTeksMateri(String(mentah || ''));
  if (!teks) {
    throw new Error('Tidak ada teks yang bisa disimpan.');
  }
  if (teks.length > 500000) {
    throw new Error('Teks terlalu panjang (maks sekitar 500 ribu karakter).');
  }
  const chunks = buatChunk(teks);
  if (!chunks.length) {
    throw new Error('Teks terlalu pendek untuk dijadikan materi siaran.');
  }
  const doc = {
    id: idBaru(),
    name: nama || 'Materi',
    type: tipe || 'txt',
    text: teks,
    chunks: chunks,
    chunkCount: chunks.length,
    words: hitungKata(teks),
    addedAt: Date.now()
  };
  await simpan(doc);
  return doc;
}

async function tambah(file, onProgress) {
  if (!file) {
    throw new Error('Tidak ada berkas yang dipilih.');
  }
  if (file.size > 15 * 1024 * 1024) {
    throw new Error('Berkas terlalu besar (maks 15 MB).');
  }
  if (file.size < 8) {
    throw new Error('Berkas kosong atau terlalu kecil.');
  }
  const ext = tebakEkstensi(file);
  const mentah = await ekstrakTeks(file, onProgress);
  return buatDariTeks(file.name || ('Materi.' + ext), mentah, ext);
}

export const pituturDokumen = {
  daftar: daftar,
  tambah: tambah,
  tambahTeks: buatDariTeks,
  hapus: hapus,
  ambil: ambil,
  ambilTeks: async function (id) {
    const d = await ambil(id);
    return d ? d.text : null;
  },
  ambilChunks: async function (id) {
    const d = await ambil(id);
    if (!d) return [];
    if (d.chunks && d.chunks.length) return d.chunks;
    return buatChunk(d.text || '');
  }
};
