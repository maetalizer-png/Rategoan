const KEY = 'raget_reminders';
const MAX_REMINDERS = 200;

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

function writeAll(list) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch (e) { console.warn('[Rategoan Fallback] reminders-store:', e); }
}

function add(reminder) {
  const list = readAll();
  const item = {
    id: 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    text: reminder.text,
    action: reminder.action,
    timestamp: reminder.timestamp,
    recur: reminder.recur || null,
    done: false,
    notified: false,
    created: Date.now(),
  };
  list.push(item);
  writeAll(list.slice(-MAX_REMINDERS));
  return item;
}

function allActive() {
  return readAll().filter((r) => !r.done);
}

function allDue(now) {
  const t = now || Date.now();
  return readAll().filter((r) => !r.done && !r.notified && r.timestamp <= t);
}

function markNotified(id) {
  const list = readAll();
  const item = list.find((r) => r.id === id);
  if (!item) return false;
  item.notified = true;
  if (item.recur) {
    item.timestamp = nextRecurrence(item.timestamp, item.recur);
    item.notified = false;
  }
  writeAll(list);
  return true;
}

function markDone(id) {
  const list = readAll();
  const item = list.find((r) => r.id === id);
  if (!item) return false;
  item.done = true;
  writeAll(list);
  return true;
}

function cancelLatest() {
  const list = readAll();
  const active = list.filter((r) => !r.done);
  if (!active.length) return null;
  const latest = active[active.length - 1];
  latest.done = true;
  writeAll(list);
  return latest;
}

function nextRecurrence(timestamp, recur) {
  const d = new Date(timestamp);
  if (recur === 'daily') d.setDate(d.getDate() + 1);
  else if (recur === 'weekly') d.setDate(d.getDate() + 7);
  return d.getTime();
}

export const remindersStore = Object.freeze({
  add,
  allActive,
  allDue,
  markNotified,
  markDone,
  cancelLatest,
});
