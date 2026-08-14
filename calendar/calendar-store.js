const KEY = 'raget_calendar';
const MAX_EVENTS = 500;

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
  } catch (e) {}
}

function addAll(events) {
  const list = readAll();
  const withIds = events.map((e) => ({
    id: 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    summary: e.summary,
    start: e.start,
    end: e.end || null,
    location: e.location || null,
    description: e.description || null,
    source: 'ics',
  }));
  const merged = list.concat(withIds);
  writeAll(merged.slice(-MAX_EVENTS));
  return withIds.length;
}

function eventsBetween(startTs, endTs) {
  return readAll()
    .filter((e) => e.start >= startTs && e.start <= endTs)
    .sort((a, b) => a.start - b.start);
}

function nextUpcoming(fromTs) {
  const from = fromTs || Date.now();
  const upcoming = readAll()
    .filter((e) => e.start >= from)
    .sort((a, b) => a.start - b.start);
  return upcoming.length ? upcoming[0] : null;
}

export const calendarStore = Object.freeze({
  addAll,
  eventsBetween,
  nextUpcoming,
});
