const KEY = 'raget_memory';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    const safe = data && typeof data === 'object' ? data : {};
    if (!safe.facts) safe.facts = {};
    if (!Array.isArray(safe.notes)) safe.notes = [];
    if (!Array.isArray(safe.learned)) safe.learned = [];
    return safe;
  } catch (e) {
    return { facts: {}, notes: [], learned: [] };
  }
}

function normalizeSubject(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[?.!,]/g, '')
    .trim()
    .replace(/\s+/g, ' ');
}

function subjectWords(s) {
  return normalizeSubject(s)
    .split(' ')
    .filter((w) => w.length > 1);
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) { console.warn('[Rategoan Fallback] memory-long:', e); }
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

// vNext Fase B: facts (nama/pekerjaan/kota/suka/preferensi mode) sebelumnya
// bisa ditulis (remember) dan dibaca (recall/allFacts) tapi tidak ada cara
// menghapus SATU fact tanpa clear() semuanya - menutup gap "memory harus
// bisa di-inspect/edit/delete" (audit P1) untuk kategori facts, menyusul
// notes/learned yang sudah punya forgetNote()/forgetLearned() lebih dulu.
function forgetFact(key) {
  const data = read();
  if (!(key in data.facts)) return false;
  delete data.facts[key];
  data.updatedAt = Date.now();
  write(data);
  return true;
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

  const toneMatch = t.match(/saya (lebih )?(suka|mau) (gaya|bahasa) (formal|santai)/i);
  if (toneMatch) remember('gaya', toneMatch[4].toLowerCase());
  const ruleMatch = t.match(/format\s+\w+\s+selalu\s+(.{8,180})/i);
  if (ruleMatch) remember('aturan', ruleMatch[1].trim());

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

function allLearned() {
  return read().learned;
}

function learnFact(subject, value) {
  const norm = normalizeSubject(subject);
  const val = String(value || '').trim();
  if (!norm || !val) return;
  const data = read();
  const idx = data.learned.findIndex((f) => f.subject === norm);
  const entry = { subject: norm, value: val, time: Date.now() };
  if (idx >= 0) data.learned[idx] = entry;
  else data.learned.push(entry);
  data.learned = data.learned.slice(-200);
  write(data);
}

function findLearnedFact(query) {
  const data = read();
  if (!data.learned.length) return null;
  const qWords = subjectWords(query);
  if (!qWords.length) return null;
  let best = null;
  let bestRatio = 0;
  data.learned.forEach((f) => {
    const fWords = subjectWords(f.subject);
    if (!fWords.length) return;
    const overlap = qWords.reduce((acc, w) => acc + (fWords.includes(w) ? 1 : 0), 0);
    const ratio = overlap / Math.max(qWords.length, fWords.length);
    if (ratio > bestRatio) {
      bestRatio = ratio;
      best = f;
    }
  });
  return bestRatio >= 0.6 ? best.value : null;
}

function forgetLearned(subject) {
  const data = read();
  const norm = normalizeSubject(subject);
  const before = data.learned.length;
  data.learned = data.learned.filter((f) => f.subject !== norm);
  write(data);
  return data.learned.length < before;
}

function clear() {
  write({ facts: {}, notes: [], learned: [] });
}

function preferenceDocs() {
  const data = read();
  return Object.keys(data.facts || {}).map((key) => ({
    id: key,
    name: key,
    text: key + ': ' + data.facts[key],
  }));
}

export const memoryLong = Object.freeze({
  remember,
  recall,
  allFacts,
  forgetFact,
  learnFromText,
  preferenceDocs,
  rememberNote,
  forgetNote,
  allNotes,
  allLearned,
  learnFact,
  findLearnedFact,
  forgetLearned,
  clear,
});
