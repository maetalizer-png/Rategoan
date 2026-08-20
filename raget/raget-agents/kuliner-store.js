// Basis data KULINER terstruktur (nama, negara asal, jenis, bahan utama, trivia) + composer
// adaptif. Menuntaskan SATU kategori data kuliner (menyusul tokoh-store.js dan data country
// di raget-dataries/), sesuai preseden ronde-ronde sebelumnya: bukan cuma daftar nama, tapi
// entri lengkap dengan detail yang bisa dijawab lewat beberapa jenis pertanyaan berbeda.
//
// Ronde v7 B3: data dipecah jadi 6 file per-region (./kuliner-data/*.js) mengikuti pola
// dataries country/etika (asia, eropa, amerika, afrika, osenia, timur-tengah), lalu
// digabung kembali di sini - refaktor murni untuk 108 entri lama (nol perilaku berubah),
// ditambah 35 entri baru (108->143) yang sengaja diprioritaskan ke region yang sebelumnya
// paling tipis (afrika, osenia, timur-tengah).

import { pickVariant } from '../../utils/text.js';

import { DATA as KULINER_ASIA } from './kuliner-data/asia.js';
import { DATA as KULINER_EROPA } from './kuliner-data/eropa.js';
import { DATA as KULINER_AMERIKA } from './kuliner-data/amerika.js';
import { DATA as KULINER_AFRIKA } from './kuliner-data/afrika.js';
import { DATA as KULINER_OSENIA } from './kuliner-data/osenia.js';
import { DATA as KULINER_TIMUR_TENGAH } from './kuliner-data/timur-tengah.js';

const KULINER = [
  ...KULINER_ASIA,
  ...KULINER_EROPA,
  ...KULINER_AMERIKA,
  ...KULINER_AFRIKA,
  ...KULINER_OSENIA,
  ...KULINER_TIMUR_TENGAH,
];

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

function findKuliner(query) {
  const q = norm(query);
  if (!q) return null;
  let found = KULINER.find((k) => norm(k.nama) === q);
  if (found) return found;
  // Fuzzy fallback SATU ARAH saja: cocok kalau nama kuliner LENGKAP muncul di dalam query
  // (mis. "resep rendang enak dong" mengandung "rendang"). Arah sebaliknya (nama kuliner
  // mengandung query) SENGAJA tidak dipakai karena berisiko salah tangkap kata pendek yang
  // kebetulan jadi prefiks nama kuliner - mis. "chili" (negara Chile) jangan sampai
  // ketangkap ke "Chili Crab" hanya karena "chili crab".includes("chili").
  found = KULINER.find((k) => q.includes(norm(k.nama)));
  return found || null;
}

const PROFILE_OPENERS = ['', 'Setahu saya, ', 'Kalau tidak salah, ', 'Sepengetahuan saya, ', 'Setahu saya sih, '];

function composeKuliner(k, richness) {
  const opener = pickVariant('kuliner_opener', PROFILE_OPENERS, k.nama);
  const openerText = opener ? opener.charAt(0).toUpperCase() + opener.slice(1) : '';
  const base = openerText + k.nama + ' adalah ' + k.jenis + ' khas ' + k.negara + '.';
  if (richness === 'singkat') return base;
  return base + ' Bahan utamanya: ' + k.bahanUtama.join(', ') + '.\n\nTrivia: ' + k.trivia;
}

function tryProfil(text) {
  const m = text.match(/^(apa\s*itu|siapa\s*itu|ceritakan\s*tentang|apa\s*yang\s*kamu\s*tahu\s*tentang)\s+(.+?)\??$/i);
  if (!m) return null;
  const k = findKuliner(m[2]);
  if (!k) return null;
  return composeKuliner(k);
}

function tryBahan(text) {
  const m =
    text.match(/^bahan\s*(utama\s*)?(dari\s*)?(.+?)\s*apa\s*saja\??$/i) ||
    text.match(/^apa\s*saja\s*bahan\s*(utama\s*)?(dari\s*)?(.+?)\??$/i);
  if (!m) return null;
  const name = m[3] || m[2];
  const k = findKuliner(name);
  if (!k) return null;
  return 'Bahan utama ' + k.nama + ': ' + k.bahanUtama.join(', ') + '.';
}

function tryTrivia(text) {
  const m = text.match(/^(fakta\s+unik|trivia)\s+(tentang\s+|dari\s+)?(.+?)\??$/i);
  if (!m) return null;
  const k = findKuliner(m[3]);
  if (!k) return null;
  return 'Fakta unik tentang ' + k.nama + ': ' + k.trivia;
}

function tryAsal(text) {
  const m =
    text.match(/^(.+?)\s*(itu\s*)?(asalnya|berasal)\s*dari\s*mana\??$/i) ||
    text.match(/^dari\s*negara\s*mana\s*(.+?)\s*berasal\??$/i);
  if (!m) return null;
  const name = m[1];
  const k = findKuliner(name);
  if (!k) return null;
  return k.nama + ' berasal dari ' + k.negara + '.';
}

function tryKuliner(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return tryBahan(t) || tryTrivia(t) || tryAsal(t) || tryProfil(t) || null;
}

export const kulinerStore = Object.freeze({
  KULINER,
  findKuliner,
  composeKuliner,
  tryProfil,
  tryBahan,
  tryTrivia,
  tryAsal,
  tryKuliner,
});
