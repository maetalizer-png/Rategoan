const KEY = 'raget_memory';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    const safe = data && typeof data === 'object' ? data : {};
    if (!safe.facts) safe.facts = {};
    if (!Array.isArray(safe.notes)) safe.notes = [];
    return safe;
  } catch (e) {
    return { facts: {}, notes: [] };
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {}
}

function remember(key, value) {
  const data = read();
  data.facts[key] = value;
  data.updatedAt = Date.now();
  write(data);
}

function recall(key) {
  return read().facts[key];
}

function allFacts() {
  return read().facts;
}

function rememberList(key, value) {
  const list = recall(key) || [];
  if (value && !list.includes(value)) {
    remember(key, list.concat(value).slice(-10));
  }
}

function learnFromText(text) {
  const t = String(text || '');
  const nameMatch = t.match(/(?:nama\s+saya|panggil\s+saya)\s+([a-zA-Z]{2,20})/i);
  if (nameMatch) remember('nama', nameMatch[1]);

  const likeMatch = t.match(/saya\s+suka\s+([a-zA-Z0-9\s]{2,40})/i);
  if (likeMatch) rememberList('suka', likeMatch[1].trim());

  const jobMatch = t.match(/saya\s+kerja\s+sebagai\s+([a-zA-Z0-9\s]{2,40})/i);
  if (jobMatch) remember('pekerjaan', jobMatch[1].trim());

  const cityMatch = t.match(/saya\s+tinggal\s+di\s+([a-zA-Z\s]{2,40})/i);
  if (cityMatch) remember('kota', cityMatch[1].trim());
}

function rememberNote(text) {
  const data = read();
  const value = String(text || '').trim();
  if (!value) return;
  data.notes.push({ text: value, time: Date.now() });
  data.notes = data.notes.slice(-100);
  write(data);
}

function forgetNote(text) {
  const data = read();
  const needle = String(text || '').toLowerCase().trim();
  if (!needle) return false;
  const before = data.notes.length;
  data.notes = data.notes.filter((n) => !n.text.toLowerCase().includes(needle));
  write(data);
  return data.notes.length < before;
}

function allNotes() {
  return read().notes;
}

function clear() {
  write({ facts: {}, notes: [] });
}

export const memoryLong = Object.freeze({
  remember,
  recall,
  allFacts,
  learnFromText,
  rememberNote,
  forgetNote,
  allNotes,
  clear,
});
