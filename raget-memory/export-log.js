const KEY = 'raget_exports';
const MAX_ITEMS = 50;

function getAll() {
  try {
    const l = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(l) ? l : [];
  } catch (e) {
    return [];
  }
}

function logExport(kind, label) {
  const l = getAll();
  l.unshift({ kind, label, time: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(l.slice(0, MAX_ITEMS)));
}

export const exportLog = Object.freeze({ getAll, logExport });
