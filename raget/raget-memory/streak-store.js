const KEY = 'raget_streak';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || { count: 0, lastDate: null };
  } catch (e) {
    return { count: 0, lastDate: null };
  }
}

function write(data) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) { console.warn('[Rategoan Fallback] streak-store:', e); }
}

function bump() {
  const data = read();
  const today = todayKey();
  if (data.lastDate === today) return data.count;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  data.count = data.lastDate === yesterday ? data.count + 1 : 1;
  data.lastDate = today;
  write(data);
  return data.count;
}

function current() {
  return read().count;
}

export const streakStore = Object.freeze({ bump, current });
