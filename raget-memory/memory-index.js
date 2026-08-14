import { memoryLong } from './memory-long.js';
import { ragetDb } from '../raget-database/raget-db.js';

const STOPWORDS = new Set([
  'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka',
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
  'ini', 'itu', 'ada', 'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'kenapa', 'bagaimana', 'berapa',
  'saja', 'juga', 'akan', 'sudah', 'belum', 'tidak', 'bukan', 'ya', 'ga', 'gak',
]);

let knowledgeCache = null;
let factoidCache = null;

function meaningfulWords(text) {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

async function loadKnowledge() {
  if (knowledgeCache) return knowledgeCache;
  try {
    const [umumRes, faqRes] = await Promise.all([
      fetch(new URL('../dataset/knowledge/umum.json', import.meta.url)),
      fetch(new URL('../dataset/knowledge/faq.json', import.meta.url)),
    ]);
    const umum = umumRes.ok ? await umumRes.json() : [];
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
  const q = String(query || '').toLowerCase().trim();
  const words = meaningfulWords(q);
  if (!words.length) return [];
  const cap = limit || 5;
  const results = [];

  ragetDb.search(query, 20).forEach((note) => {
    const score = scoreText(note.question + ' ' + note.answer, words);
    if (score >= 2) results.push({ type: 'note', text: note.question + ' — ' + note.answer, score });
  });

  const knowledge = await loadKnowledge();
  knowledge.faq.forEach((item) => {
    const score = scoreText((item.q || '') + ' ' + (item.a || ''), words);
    if (score >= 2) results.push({ type: 'faq', text: (item.q || '') + ' — ' + (item.a || ''), score });
  });
  knowledge.umum.forEach((item) => {
    const score = scoreText((item.title || '') + ' ' + (item.text || ''), words);
    if (score >= 2) results.push({ type: 'umum', text: item.text || '', score });
  });

  const facts = memoryLong.allFacts();
  Object.keys(facts).forEach((key) => {
    if (words.includes(key)) results.push({ type: 'fact', text: key + ': ' + facts[key], score: 3 });
  });

  memoryLong.allNotes().forEach((note) => {
    const score = scoreText(note.text, words);
    if (score >= 1) results.push({ type: 'note_long', text: note.text, score: score + 1 });
  });

  return results.sort((a, b) => b.score - a.score).slice(0, cap);
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
