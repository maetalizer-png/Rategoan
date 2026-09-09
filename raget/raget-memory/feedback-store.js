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

function record(positive, intent) {
  const data = read();
  if (positive) data.up += 1;
  else data.down += 1;
  data.events.push({ positive: !!positive, intent: intent || null, t: Date.now() });
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

function clear() {
  write({ up: 0, down: 0, events: [] });
}

export const feedbackStore = Object.freeze({ record, stats, statsByIntent, clear });
