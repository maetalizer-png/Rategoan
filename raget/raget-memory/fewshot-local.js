const KEY = 'raget_fewshot_local';
const MAX_ITEMS = 30;

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
    localStorage.setItem(KEY, JSON.stringify(list.slice(-MAX_ITEMS)));
  } catch (e) { console.warn('[Rategoan Fallback] fewshot-local:', e); }
}

function apply(candidates) {
  const list = readAll();
  const existingQ = new Set(list.map((it) => it.q));
  const added = [];
  candidates.forEach((c) => {
    if (!c.q || !c.a || existingQ.has(c.q)) return;
    const entry = { q: c.q, a: c.a, addedAt: Date.now() };
    list.push(entry);
    existingQ.add(c.q);
    added.push(entry);
  });
  writeAll(list);
  return added;
}

function revert() {
  const count = readAll().length;
  writeAll([]);
  return count;
}

function allItems() {
  return readAll();
}

export const fewshotLocal = Object.freeze({
  apply,
  revert,
  allItems,
});
