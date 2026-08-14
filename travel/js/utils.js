import { ic } from './icons.js';
import { REGIONS } from './loader.js';

const view = document.querySelector('#view');

export const low = (s) => String(s || '').toLowerCase();
export const fmtN = (n) => n >= 1e9 ? Math.round(n / 1e9 * 10) / 10 + ' M'
  : n >= 1e6 ? Math.round(n / 1e6) + ' jt'
  : n >= 1e3 ? Math.round(n / 1e3) + ' rb' : n;
export const byCountry = (list, name) => (list || []).filter((x) => low(((x || {}).metadata || {}).country) === low(name));

export function hashText(t) {
  let h = 0;
  const s = String(t || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function mulberry(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function lev(a, b) {
  const m = a.length, n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[n];
}

export function fuzzyCountry(q, countries) {
  const t = low(q).trim();
  if (t.length < 4) return null;
  let best = null, bestD = 3;
  (countries || []).forEach((c) => {
    const d = lev(t, low(c.metadata.name));
    if (d < bestD) { bestD = d; best = c; }
  });
  return bestD <= 2 ? best : null;
}

export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const target = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

export function clusterByCity(items) {
  const groups = [];
  items.forEach((w) => {
    const city = low(w.metadata.city || '');
    const last = groups[groups.length - 1];
    if (last && last.city === city) last.items.push(w);
    else groups.push({ city, items: [w] });
  });
  return groups.flatMap((g) => g.items);
}

export function phrasesFor(name, langs) {
  return (langs || []).find((l) =>
    ((l.metadata || {}).officialIn || []).some((c) => low(c) === low(name))
  ) || null;
}

export function errorCard() {
  view.innerHTML = '<div class="card"><h3>Data tidak ditemukan</h3>' +
    '<p class="desc">Salin folder dataries ke dalam travel, atau taruh travel di repo yang punya dataries.</p></div>';
}

export function stat(icon, label) {
  return '<span class="stat">' + ic(icon) + '<b>' + label + '</b></span>';
}

export function regionOf(name) {
  const n = low(name);
  const R = (REGIONS && REGIONS.country) || [];
  for (const r of R) {
    if ((r.names || []).includes(n)) {
      if (r.id === 'asian-tenggara') return 'asean';
      if (r.id.indexOf('asian') === 0) return 'asia';
      if (r.id.indexOf('eropan') === 0) return 'eropa';
      if (r.id.indexOf('african') === 0) return 'afrika';
      if (r.id.indexOf('american') === 0) return 'amerika';
      if (r.id === 'osenian') return 'osenia';
    }
  }
  return 'lain';
}
