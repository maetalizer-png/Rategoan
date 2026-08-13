const KEY = 'raget_memory';

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return data && typeof data === 'object' && data.facts ? data : { facts: {} };
  } catch (e) {
    return { facts: {} };
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

function learnFromText(text) {
  const t = String(text || '');
  const nameMatch = t.match(/nama\s+saya\s+([a-zA-Z]{2,20})/i);
  if (nameMatch) {
    remember('nama', nameMatch[1]);
  }
  const likeMatch = t.match(/saya\s+suka\s+([a-zA-Z0-9\s]{2,40})/i);
  if (likeMatch) {
    const value = likeMatch[1].trim();
    const list = recall('suka') || [];
    if (value && !list.includes(value)) {
      remember('suka', list.concat(value).slice(-10));
    }
  }
}

function clear() {
  write({ facts: {} });
}

export const memoryLong = Object.freeze({
  remember,
  recall,
  allFacts,
  learnFromText,
  clear,
});
