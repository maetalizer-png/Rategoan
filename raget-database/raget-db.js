import { ragetSchema } from './raget-schema.js';
import { idbGateway } from './idb-gateway.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

const KEY = 'notes';
const MAX_NOTES = 500;

async function readAll() {
  const list = await idbGateway.getList(KEY);
  return Array.isArray(list) ? list.filter(ragetSchema.isValidNote) : [];
}

async function writeAll(list) {
  await idbGateway.setList(KEY, list.slice(-MAX_NOTES));
}

async function addNote(question, answer, feedback, intent) {
  const note = ragetSchema.createNote(question, answer, feedback, intent);
  const list = await readAll();
  list.push(note);
  await writeAll(list);
  return note;
}

async function allNotes() {
  return await readAll();
}

async function rateLast(feedback) {
  const list = await readAll();
  if (!list.length) return false;
  list[list.length - 1].feedback = !!feedback;
  await writeAll(list);
  return true;
}

async function rateByAnswer(answerText, feedback) {
  const list = await readAll();
  const needle = String(answerText || '').trim();
  if (!needle) return false;
  for (let i = list.length - 1; i >= 0; i--) {
    if (list[i].answer.trim() === needle) {
      list[i].feedback = !!feedback;
      await writeAll(list);
      return true;
    }
  }
  return false;
}

async function search(query, limit) {
  const q = String(query || '').trim();
  if (!q) return [];
  const list = await readAll();
  const corpus = list.map((note) => ({ note, text: note.question + ' ' + note.answer }));
  const ranked = retrieval.rank(q, corpus, { threshold: retrieval.LIST_THRESHOLD, limit: limit || 5 });
  return ranked.map((r) => r.item.note);
}

async function clear() {
  await writeAll([]);
}

export const ragetDb = Object.freeze({
  addNote,
  allNotes,
  search,
  rateLast,
  rateByAnswer,
  clear,
});
