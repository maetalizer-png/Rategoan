import { pituturDokumen } from './pitutur-dokumen.js';
import { pituturState } from '../core/pitutur-state.js';

const DAFTAR_KANAL = Object.freeze([
  { id: 'pagi', label: 'Warta Hari Ini', small: 'Fakta & momen tanggal hari ini', grup: [], strategi: 'fakta' },
  { id: 'tokoh', label: 'Kisah Tokoh', small: 'Tokoh & pelajaran hidupnya', grup: ['tokoh'], strategi: 'tokoh' },
  { id: 'koleksi', label: 'Review Koleksi', small: 'Putar ulang simpananmu', grup: [], strategi: 'koleksi' },
  { id: 'kuliner', label: 'Dapur Dunia', small: 'Cita rasa & cerita meja', grup: ['makanan', 'minuman'], strategi: 'fakta' },
  { id: 'sains', label: 'Sains & Penemuan', small: 'Cara kerja dunia', grup: ['sains', 'penemuan'], strategi: 'fakta' },
  { id: 'sejarah', label: 'Jejak Sejarah', small: 'Peristiwa yang membentuk kita', grup: ['sejarah'], strategi: 'fakta' },
  { id: 'wisata', label: 'Wisata & Alam', small: 'Destinasi & keajaiban', grup: ['wisata', 'alam'], strategi: 'fakta' },
  { id: 'lingo', label: 'Lingo', small: 'Frasa ASEAN untukmu', grup: ['lingo', 'sapaan'], strategi: 'lingo' }
]);

const INDEX = {};
DAFTAR_KANAL.forEach(function (k) { INDEX[k.id] = k; });

let cacheDokumen = {};

function ringkasNama(nama) {
  const n = String(nama || 'Dokumen').replace(/\.[^.]+$/, '');
  return n.length > 20 ? n.slice(0, 18) + '…' : n;
}

function totalBagian(doc) {
  if (doc.chunkCount && doc.chunkCount > 0) return doc.chunkCount;
  if (doc.chunks && doc.chunks.length) return doc.chunks.length;
  return Math.max(1, Math.ceil((doc.words || 1) / 40));
}

function progresDokumen(doc) {
  const state = pituturState.state;
  const pos = (state.docPos && state.docPos[doc.id]) || 0;
  if (pos <= 0) return null;
  return Math.min(99, Math.round((pos / totalBagian(doc)) * 100));
}

function kanalDokumen(doc) {
  const prog = progresDokumen(doc);
  const bagian = totalBagian(doc);
  const small = prog != null
    ? 'Lanjut · ' + prog + '%'
    : (bagian + ' bagian · ' + doc.words + ' kata');
  return {
    id: 'doc:' + doc.id,
    label: ringkasNama(doc.name),
    small: small,
    grup: [],
    strategi: 'dokumen',
    docId: doc.id
  };
}

async function daftarDokumen() {
  try {
    const docs = await pituturDokumen.daftar();
    const daftar = docs.map(kanalDokumen);
    const cacheBaru = {};
    daftar.forEach(function (k) { cacheBaru[k.id] = k; });
    cacheDokumen = cacheBaru;
    return daftar;
  } catch (e) {
    return [];
  }
}

async function daftarSemua() {
  const dinamis = await daftarDokumen();
  if (pituturState.state.sources.dokumen && dinamis.length) {
    return dinamis.concat(DAFTAR_KANAL);
  }
  return DAFTAR_KANAL.concat(dinamis);
}

function kanal(id) {
  if (INDEX[id]) return INDEX[id];
  if (cacheDokumen[id]) return cacheDokumen[id];
  return INDEX.pagi;
}

async function kanalAsync(id) {
  if (INDEX[id]) return INDEX[id];
  if (typeof id === 'string' && id.indexOf('doc:') === 0) {
    const doc = await pituturDokumen.ambil(id.slice(4));
    if (doc) return kanalDokumen(doc);
  }
  return INDEX.pagi;
}

export { DAFTAR_KANAL, kanal, kanalAsync, daftarSemua, daftarDokumen };
