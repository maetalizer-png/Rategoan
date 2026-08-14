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
