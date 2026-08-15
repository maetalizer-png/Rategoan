import { DEFAULT_PACK } from './constants.js';

export function getStats() {
  try {
    return Object.assign(
      { played: 0, correct: 0, viewed: 0, sapaan: 0, trips: 0, bestSantai: 0, bestDunia: 0 },
      JSON.parse(localStorage.getItem('travel_stats'))
    );
  } catch (e) {
    return { played: 0, correct: 0, viewed: 0, sapaan: 0, trips: 0, bestSantai: 0, bestDunia: 0 };
  }
}
export function saveStats(s) { localStorage.setItem('travel_stats', JSON.stringify(s)); }

export function getCheck() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_check'));
    return Array.isArray(l) && l.length ? l : DEFAULT_PACK.map((t) => ({ t, done: false }));
  } catch (e) {
    return DEFAULT_PACK.map((t) => ({ t, done: false }));
  }
}
export function saveCheck(l) { localStorage.setItem('travel_check', JSON.stringify(l)); }

export function getTrips() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_trips'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function saveTrips(l) { localStorage.setItem('travel_trips', JSON.stringify(l)); }

export function getDays() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_days'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function pushDay(d) {
  const l = getDays();
  if (!l.includes(d)) {
    l.push(d);
    localStorage.setItem('travel_days', JSON.stringify(l.slice(-30)));
  }
}

export function getRecent() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_recent'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function pushRecent(t) {
  const l = getRecent().filter((x) => x !== t);
  l.unshift(t);
  localStorage.setItem('travel_recent', JSON.stringify(l.slice(0, 5)));
}

export function getViewed() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_viewed'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function pushViewed(name) {
  const l = getViewed().filter((x) => x !== name);
  l.unshift(name);
  localStorage.setItem('travel_viewed', JSON.stringify(l.slice(0, 8)));
}

export function getScores() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_scores'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function pushScore(mode, score, total) {
  const l = getScores();
  l.push({ mode, score, total, time: Date.now() });
  l.sort((a, b) => (b.score / b.total) - (a.score / a.total) || b.time - a.time);
  localStorage.setItem('travel_scores', JSON.stringify(l.slice(0, 10)));
}

export function getFav() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_fav'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function isFav(name) { return getFav().includes(name); }
export function toggleFav(name) {
  const l = getFav();
  const i = l.indexOf(name);
  if (i >= 0) l.splice(i, 1);
  else l.unshift(name);
  localStorage.setItem('travel_fav', JSON.stringify(l));
  return i < 0;
}

export function getTTS() { return localStorage.getItem('travel_tts') === '1'; }
export function setTTS(on) { localStorage.setItem('travel_tts', on ? '1' : '0'); }

export function getAssistantHistory() {
  try {
    const l = JSON.parse(localStorage.getItem('travel_assistant'));
    return Array.isArray(l) ? l : [];
  } catch (e) { return []; }
}
export function pushAssistantMessage(role, text) {
  const l = getAssistantHistory();
  l.push({ role, text, time: Date.now() });
  localStorage.setItem('travel_assistant', JSON.stringify(l.slice(-60)));
}
