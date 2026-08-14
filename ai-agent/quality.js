import { ragetDb } from '../raget-database/raget-db.js';
import { scorer } from './scorer.js';

const QUALITY_KEY = 'raget_quality';
const ANSWER_TYPES = ['definisi', 'daftar', 'prosedur', 'perbandingan', 'matematika', 'terbuka'];
const LENGTH_LIMITS = {
  definisi: 240,
  matematika: 200,
  daftar: 900,
  prosedur: 900,
  perbandingan: 900,
  terbuka: 700,
};

function guardRepetition(reply, lastReply) {
  if (!lastReply) return true;
  const a = scorer.tokenize(reply);
  const b = scorer.tokenize(lastReply);
  if (!a.length || !b.length) return true;
  const corpus = [new Set(a), new Set(b)];
  const sim = scorer.cosineSim(scorer.tfidfVector(a, corpus), scorer.tfidfVector(b, corpus));
  return sim < 0.85;
}

function guardLength(reply, tipe) {
  const limit = LENGTH_LIMITS[tipe] || 700;
  if (reply.length <= limit) return reply;
  return reply.slice(0, limit).trim() + '…';
}

function computeQuality(notes) {
  const list = notes || [];
  if (!list.length) return { score: 0, breakdown: { A: 0, K: 0, U: 0, D: 0, V: 0 } };

  const rated = list.filter((n) => n.feedback != null);
  const A = rated.length >= 10 ? rated.filter((n) => n.feedback).length / rated.length : 0.7;

  const factoidNotes = list.filter((n) => n.intent === 'factoid' || n.intent === 'dataries_extras');
  const K = factoidNotes.length
    ? factoidNotes.filter((n) => n.answer.split(/[.!?]/).filter(Boolean).length > 1).length / factoidNotes.length
    : 0.5;

  let dupCount = 0;
  let pairs = 0;
  for (let i = 1; i < list.length; i++) {
    pairs++;
    if (!guardRepetition(list[i].answer, list[i - 1].answer)) dupCount++;
  }
  const U = pairs ? 1 - dupCount / pairs : 1;

  const intents = new Set(list.map((n) => n.intent));
  const D = Math.min(1, intents.size / 10);

  const chatTypes = new Set(
    list.filter((n) => (n.intent || '').startsWith('chat_')).map((n) => n.intent.replace('chat_', ''))
  );
  const V = Math.min(1, chatTypes.size / ANSWER_TYPES.length);

  const score = Math.round((0.35 * A + 0.25 * K + 0.15 * U + 0.15 * D + 0.1 * V) * 100);
  return {
    score,
    breakdown: {
      A: Math.round(A * 100),
      K: Math.round(K * 100),
      U: Math.round(U * 100),
      D: Math.round(D * 100),
      V: Math.round(V * 100),
    },
    n: {
      A: rated.length,
      K: factoidNotes.length,
      U: pairs,
      D: intents.size,
      V: chatTypes.size,
    },
  };
}

async function evaluate() {
  const notes = await ragetDb.allNotes();
  const result = computeQuality(notes);
  try {
    localStorage.setItem(QUALITY_KEY, JSON.stringify(Object.assign({ updatedAt: Date.now() }, result)));
  } catch (e) {}
  return result;
}

export const quality = Object.freeze({
  evaluate,
  computeQuality,
  guardRepetition,
  guardLength,
});
