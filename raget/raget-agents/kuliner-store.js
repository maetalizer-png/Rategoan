
import { pickVariant } from '../../utils/text.js';

const REGIONS = ['asia', 'eropa', 'amerika', 'afrika', 'osenia', 'timur-tengah'];

let kulinerCache = null;

async function loadKuliner() {
  if (kulinerCache) return kulinerCache;
  try {
    const parts = await Promise.all(
      REGIONS.map(async (region) => {
        const res = await fetch(new URL('../raget-data/json/kuliner/kuliner-' + region + '.json', import.meta.url));
        return res.ok ? await res.json() : [];
      })
    );
    kulinerCache = parts.flat().map((e) => ({
      nama: e.nama,
      negara: e.meta.negara,
      jenis: e.meta.jenis,
      bahanUtama: e.meta.bahanUtama,
      trivia: e.meta.trivia,
    }));
  } catch (e) {
    kulinerCache = [];
  }
  return kulinerCache;
}

function norm(s) {
  return String(s || '').toLowerCase().trim();
}

function hasWordSubstring(haystack, needle) {
  if (!haystack || !needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(haystack);
}

async function findKuliner(query) {
  const q = norm(query);
  if (!q) return null;
  const kuliner = await loadKuliner();
  let found = kuliner.find((k) => norm(k.nama) === q);
  if (found) return found;
  found = kuliner.find((k) => hasWordSubstring(q, norm(k.nama)));
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

async function tryProfil(text) {
  const m = text.match(/^(apa\s*itu|siapa\s*itu|ceritakan\s*tentang|apa\s*yang\s*kamu\s*tahu\s*tentang)\s+(.+?)\??$/i);
  if (!m) return null;
  const k = await findKuliner(m[2]);
  if (!k) return null;
  return composeKuliner(k);
}

async function tryBahan(text) {
  const m =
    text.match(/^bahan\s*(utama\s*)?(dari\s*)?(.+?)\s*apa\s*saja\??$/i) ||
    text.match(/^apa\s*saja\s*bahan\s*(utama\s*)?(dari\s*)?(.+?)\??$/i);
  if (!m) return null;
  const name = m[3] || m[2];
  const k = await findKuliner(name);
  if (!k) return null;
  return 'Bahan utama ' + k.nama + ': ' + k.bahanUtama.join(', ') + '.';
}

async function tryTrivia(text) {
  const m = text.match(/^(fakta\s+unik|trivia)\s+(tentang\s+|dari\s+)?(.+?)\??$/i);
  if (!m) return null;
  const k = await findKuliner(m[3]);
  if (!k) return null;
  return 'Fakta unik tentang ' + k.nama + ': ' + k.trivia;
}

async function tryAsal(text) {
  const m =
    text.match(/^(.+?)\s*(itu\s*)?(asalnya|berasal)\s*dari\s*mana\??$/i) ||
    text.match(/^dari\s*negara\s*mana\s*(.+?)\s*berasal\??$/i);
  if (!m) return null;
  const name = m[1];
  const k = await findKuliner(name);
  if (!k) return null;
  return k.nama + ' berasal dari ' + k.negara + '.';
}

async function tryKuliner(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  return (await tryBahan(t)) || (await tryTrivia(t)) || (await tryAsal(t)) || (await tryProfil(t)) || null;
}

export const kulinerStore = Object.freeze({
  findKuliner,
  composeKuliner,
  tryProfil,
  tryBahan,
  tryTrivia,
  tryAsal,
  tryKuliner,
});
