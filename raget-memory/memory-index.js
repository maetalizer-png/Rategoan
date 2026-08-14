import { memoryLong } from './memory-long.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { meaningfulWords } from '../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

let knowledgeCache = null;
let factoidCache = null;

const UMUM_FILES = ['umum.json', 'raget-diri.json', 'teknik-ai.json', 'produk-bisnis.json', 'riwayat-proyek.json'];

async function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  try {
    const [umumParts, faqRes] = await Promise.all([
      Promise.all(UMUM_FILES.map((f) => fetch(new URL('../dataset/knowledge/' + f, import.meta.url)).then((r) => (r.ok ? r.json() : [])).catch(() => []))),
      fetch(new URL('../dataset/knowledge/faq.json', import.meta.url)),
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
    const res = await fetch(new URL('../dataset/knowledge/factoid.json', import.meta.url));
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

async function search(query, limit) {
  const q = String(query || '').trim();
  if (!q) return [];
  const cap = limit || 5;
  const corpus = [];

  (await ragetDb.allNotes()).forEach((note) => corpus.push({ type: 'note', text: note.question + ' — ' + note.answer }));

  const knowledge = await loadKnowledge();
  knowledge.faq.forEach((item) => corpus.push({ type: 'faq', text: (item.q || '') + ' — ' + (item.a || '') }));
  knowledge.umum.forEach((item) => corpus.push({ type: 'umum', text: item.text || '' }));

  const facts = memoryLong.allFacts();
  Object.keys(facts).forEach((key) => corpus.push({ type: 'fact', text: key + ': ' + facts[key] }));

  memoryLong.allNotes().forEach((note) => corpus.push({ type: 'note_long', text: note.text }));

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
    else if (title.includes(t) || t.includes(title)) score = 6;
    else score = scoreText(title + ' ' + (item.text || ''), words);
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

export const memoryIndex = Object.freeze({
  search,
  findTopic,
  findFactoid,
});
