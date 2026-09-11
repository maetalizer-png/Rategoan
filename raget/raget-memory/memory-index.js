import { memoryLong } from './memory-long.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { meaningfulWords } from '../../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { memoryPreference } from '../../js/state/memory-preference.js';

let knowledgeCache = null;
let factoidCache = null;

const UMUM_FILES = ['umum.json', 'raget-diri.json', 'teknik-ai.json', 'riwayat-proyek.json', 'resep.json', 'produktivitas.json', 'teknologi-umum.json', 'kesehatan-dasar.json', 'keuangan-dasar.json', 'kamus-indonesia.json', 'sektor-bisnis-indonesia.json', 'pengetahuan-umum-tambahan.json', 'sektor-layanan-bisnis.json', 'obrolan-sehari-hari.json'];

async function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  try {
    const [umumParts, faqRes] = await Promise.all([
      Promise.all(UMUM_FILES.map((f) => fetch(new URL('../raget-data/json/pengetahuan/' + f, import.meta.url)).then((r) => (r.ok ? r.json() : [])).catch(() => []))),
      fetch(new URL('../raget-data/json/pengetahuan/faq.json', import.meta.url)),
    ]);
    const umum = umumParts.flat().filter((it) => it && it.title);
    const faq = faqRes.ok ? await faqRes.json() : [];
    knowledgeCache = { umum: Array.isArray(umum) ? umum : [], faq: Array.isArray(faq) ? faq : [] };
  } catch (e) {
    knowledgeCache = { umum: [], faq: [] };
  }
  return knowledgeCache;
}

async function loadFactoid() {
  if (factoidCache) return factoidCache;
  try {
    const res = await fetch(new URL('../raget-data/json/pengetahuan/factoid.json', import.meta.url));
    const data = res.ok ? await res.json() : [];
    factoidCache = Array.isArray(data) ? data : [];
  } catch (e) {
    factoidCache = [];
  }
  return factoidCache;
}

function scoreText(hay, words) {
  const lower = hay.toLowerCase();
  return words.reduce((acc, w) => acc + (lower.includes(w) ? 1 : 0), 0);
}

function hasWordSubstring(haystack, needle) {
  if (!haystack || !needle) return false;
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(haystack);
}

async function search(query, limit) {
  const q = String(query || '').trim();
  if (!q) return [];
  const cap = limit || 5;
  const corpus = [];

  (await ragetDb.allNotes()).forEach((note) => corpus.push({ type: 'note', text: note.question + ' — ' + note.answer }));

  const knowledge = await loadKnowledge();
  knowledge.faq.forEach((item) => corpus.push({ type: 'faq', text: (item.q || '') + ' — ' + (item.a || '') }));
  knowledge.umum.forEach((item) => corpus.push({ type: 'umum', text: (item.title ? item.title + '. ' : '') + (item.text || '') }));

  // Toggle "Memori" (js/state/memory-preference.js) - kalau dimatikan
  // pengguna, fakta pribadi yang sudah tersimpan (nama, kota, dst) tidak
  // boleh nongol lewat jalur pencarian umum ini juga, bukan cuma lewat
  // recallFromMemory() di agent.js. Tanpa guard ini, toggle OFF gagal
  // menyembunyikan fakta lama karena planFallback tetap ketemu fakta itu
  // via corpus retrieval biasa (skor cocok kata kunci), bukan recall
  // eksplisit - persis lubang yang ditemukan sewaktu verifikasi fitur ini.
  if (memoryPreference.get()) {
    const facts = memoryLong.allFacts();
    Object.keys(facts).forEach((key) => corpus.push({ type: 'fact', text: key + ': ' + facts[key] }));

    memoryLong.allNotes().forEach((note) => corpus.push({ type: 'note_long', text: note.text }));
  }

  const ranked = retrieval.rank(q, corpus, { threshold: retrieval.LIST_THRESHOLD, limit: cap });
  return ranked.map((r) => ({ type: r.item.type, text: r.item.text, score: r.score }));
}

async function findTopic(topic) {
  const t = String(topic || '').toLowerCase().trim();
  if (!t) return null;
  const knowledge = await loadKnowledge();
  const words = meaningfulWords(t);
  let best = null;
  let bestScore = 0;

  knowledge.umum.forEach((item) => {
    const title = (item.title || '').toLowerCase();
    let score = 0;
    if (title === t) score = 10;
    else if (hasWordSubstring(title, t) || hasWordSubstring(t, title)) score = 6;
    else {
      const overlapScore = scoreText(title + ' ' + (item.text || ''), words);
      const minRequired = Math.min(2, words.length);
      score = overlapScore >= minRequired ? overlapScore : 0;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });

  return bestScore > 0 ? best : null;
}

async function findFactoid(query) {
  const learned = memoryLong.findLearnedFact(query);
  if (learned) return { answer: learned, source: 'learned' };

  const words = meaningfulWords(String(query || '').toLowerCase());
  if (!words.length) return null;
  const list = await loadFactoid();
  let best = null;
  let bestRatio = 0;
  list.forEach((item) => {
    const candidates = [item.subject].concat(item.aliases || []);
    candidates.forEach((c) => {
      const cWords = meaningfulWords(String(c || '').toLowerCase());
      if (!cWords.length) return;
      const overlap = words.reduce((acc, w) => acc + (cWords.includes(w) ? 1 : 0), 0);
      const ratio = overlap / Math.max(words.length, cWords.length);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        best = item;
      }
    });
  });
  return bestRatio >= 0.6 ? { answer: best.answer, source: 'factoid' } : null;
}

async function stats() {
  const knowledge = await loadKnowledge();
  return { umumCount: knowledge.umum.length, faqCount: knowledge.faq.length };
}

export const memoryIndex = Object.freeze({
  search,
  findTopic,
  findFactoid,
  stats,
});
