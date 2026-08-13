import { ragetSchema } from './raget-schema.js';

const KEY = 'raget_db';
const MAX_NOTES = 500;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list.filter(ragetSchema.isValidNote) : [];
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) {}
}

function addNote(question, answer, feedback, intent) {
  const note = ragetSchema.createNote(question, answer, feedback, intent);
  const list = readAll();
  list.push(note);
  writeAll(list.slice(-MAX_NOTES));
  return note;
}

function allNotes() {
  return readAll();
}

function rateLast(feedback) {
  const list = readAll();
  if (!list.length) return false;
  list[list.length - 1].feedback = !!feedback;
  writeAll(list);
  return true;
}

function search(query, limit) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) return [];
  const words = q.split(/\s+/).filter(Boolean);
  const scored = readAll().map((note) => {
    const hay = (note.question + ' ' + note.answer).toLowerCase();
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    return { note, score };
  });
  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 5)
    .map((s) => s.note);
}

function clear() {
  writeAll([]);
}

export const ragetDb = Object.freeze({
  addNote,
  allNotes,
  search,
  rateLast,
  clear,
});
