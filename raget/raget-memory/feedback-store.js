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

function clear() {
  write({ up: 0, down: 0, events: [] });
}

export const feedbackStore = Object.freeze({ record, stats, clear });
