const KEY = 'raget_feedback';
const MAX_EVENTS = 500;

function read() {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY));
    if (parsed && typeof parsed.up === 'number' && typeof parsed.down === 'number' && Array.isArray(parsed.events)) {
      return parsed;
    }
  } catch (e) {}
  return { up: 0, down: 0, events: [] };
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) {}
}

function statsOf(data) {
  const total = data.up + data.down;
  return { up: data.up, down: data.down, total, rate: total ? data.up / total : null };
}

function record(positive, intent, sourceEntryId) {
  const data = read();
  if (positive) data.up += 1;
  else data.down += 1;
  data.events.push({ positive: !!positive, intent: intent || null, sourceEntryId: sourceEntryId || null, t: Date.now() });
  if (data.events.length > MAX_EVENTS) data.events = data.events.slice(-MAX_EVENTS);
  write(data);
  return statsOf(data);
}

function stats() {
  return statsOf(read());
}

// PRD-RAGET-TEMPLATE.md Fase 1.2: events sudah membawa `intent` (dipassing dari
// js/chat/chat.js lewat pencocokan jawaban ke ragetDb notes), tapi sebelumnya
// tidak ada apa pun yang mengagregasinya per-intent - cuma angka up/down total
// tanpa konteks. Ini yang dibaca panel Kesehatan Data (js/sheets/) dan nantinya
// re-ranking Fase 2 untuk tahu intent MANA yang sering di-dislike.
function statsByIntent() {
  const data = read();
  const byIntent = new Map();
  data.events.forEach((e) => {
    const key = e.intent || '(tanpa intent)';
    const entry = byIntent.get(key) || { intent: key, up: 0, down: 0 };
    if (e.positive) entry.up += 1;
    else entry.down += 1;
    byIntent.set(key, entry);
  });
  return [...byIntent.values()]
    .map((e) => Object.assign(e, { total: e.up + e.down, rate: e.up / (e.up + e.down) }))
    .sort((a, b) => b.down - a.down);
}

// PRD-RAGET-TEMPLATE.md Fase 4.1 (prasyarat Fase 2.1/4.2 re-ranking):
// sama seperti statsByIntent() tapi per ENTRI data spesifik (sourceEntryId),
// bukan per kategori/intent generik - inilah yang tadinya hilang ("hari ini
// granularitasnya baru level intent, bukan per-entry"). Event tanpa
// sourceEntryId (jawaban bukan dari satu entri tunggal, mis. generik/LLM)
// sengaja TIDAK ikut diagregasi di sini - itu bukan sinyal yang bisa
// dipetakan ke satu entri untuk re-ranking.
function statsByEntry() {
  const data = read();
  const byEntry = new Map();
  data.events.forEach((e) => {
    if (!e.sourceEntryId) return;
    const entry = byEntry.get(e.sourceEntryId) || { sourceEntryId: e.sourceEntryId, up: 0, down: 0 };
    if (e.positive) entry.up += 1;
    else entry.down += 1;
    byEntry.set(e.sourceEntryId, entry);
  });
  return [...byEntry.values()]
    .map((e) => Object.assign(e, { total: e.up + e.down, rate: e.up / (e.up + e.down) }))
    .sort((a, b) => b.down - a.down);
}

// PRD-RAGET-TEMPLATE.md Fase 2.1 (re-ranking): dipakai retrieve.js untuk
// memberi penalti skor kecil ke entri yang SERING di-dislike - bukan
// dihapus, cuma diprioritaskan lebih rendah saat skornya mepet dengan
// entry lain (lihat komentar di retrieve.js). minEvents mencegah SATU
// dislike kebetulan langsung menghukum entri (butuh sampel minimal
// sebelum dianggap sinyal, bukan noise) - default 3, sama filosofinya
// dengan kenapa BM25 butuh banyak dokumen sebelum idf-nya stabil.
const DEFAULT_MIN_EVENTS = 3;
const DEFAULT_PENALTY_FACTOR = 0.85;

function entryPenaltyMap(options) {
  const opts = options || {};
  const minEvents = opts.minEvents != null ? opts.minEvents : DEFAULT_MIN_EVENTS;
  const factor = opts.penaltyFactor != null ? opts.penaltyFactor : DEFAULT_PENALTY_FACTOR;
  const map = new Map();
  statsByEntry().forEach((e) => {
    if (e.total >= minEvents && e.down > e.up) map.set(e.sourceEntryId, factor);
  });
  return map;
}

function clear() {
  write({ up: 0, down: 0, events: [] });
}

export const feedbackStore = Object.freeze({ record, stats, statsByIntent, statsByEntry, entryPenaltyMap, clear });
