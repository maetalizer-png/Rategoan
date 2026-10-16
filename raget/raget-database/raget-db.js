import { ragetSchema } from './raget-schema.js';
import { idbGateway } from './idb-gateway.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

const KEY = 'notes';
const MAX_NOTES = 500;

const UNMATCHED_KEY = 'unmatched_queries';
const MAX_UNMATCHED = 500;

async function readAll() {
  try {
    const list = await idbGateway.getList(KEY);
    return Array.isArray(list) ? list.filter(ragetSchema.isValidNote) : [];
  } catch (e) {
    return [];
  }
}

async function writeAll(list) {
  try {
    await idbGateway.setList(KEY, list.slice(-MAX_NOTES));
  } catch (e) { void e; }
}

async function addNote(question, answer, feedback, intent, sourceEntryId) {
  const note = ragetSchema.createNote(question, answer, feedback, intent, sourceEntryId);
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

async function removeByIds(ids) {
  const idSet = new Set(ids || []);
  if (!idSet.size) return 0;
  const list = await readAll();
  const kept = list.filter((n) => !idSet.has(n.id));
  await writeAll(kept);
  return list.length - kept.length;
}

async function readAllUnmatched() {
  try {
    const list = await idbGateway.getList(UNMATCHED_KEY);
    return Array.isArray(list) ? list.filter(ragetSchema.isValidUnmatched) : [];
  } catch (e) {
    return [];
  }
}

async function writeAllUnmatched(list) {
  try {
    await idbGateway.setList(UNMATCHED_KEY, list.slice(-MAX_UNMATCHED));
  } catch (e) { void e; }
}

async function logUnmatched(query, enginesTried) {
  const entry = ragetSchema.createUnmatchedEntry(query, enginesTried);
  const list = await readAllUnmatched();
  list.push(entry);
  await writeAllUnmatched(list);
  return entry;
}

async function allUnmatched() {
  return await readAllUnmatched();
}

async function clearUnmatched() {
  await writeAllUnmatched([]);
}

export const ragetDb = Object.freeze({
  addNote,
  allNotes,
  search,
  rateLast,
  rateByAnswer,
  clear,
  removeByIds,
  logUnmatched,
  allUnmatched,
  clearUnmatched,
});
