import { SEJARAH } from './sejarah.js';

export const devlogIndex = Object.freeze({
  all: () => SEJARAH,
  latest: () => SEJARAH[SEJARAH.length - 1],
  byId: (id) => {
    const needle = String(id || '').toLowerCase().trim();
    return SEJARAH.find((e) => e.id.toLowerCase() === needle) || null;
  },
  search: (query) => {
    const q = String(query || '').toLowerCase().trim();
    if (!q) return [];
    return SEJARAH.filter((e) => {
      const hay = [e.id, e.judul, e.ringkasan, ...(e.fitur_baru || []), ...(e.bug_ditutup || [])]
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  },
  allBugs: () => {
    const out = [];
    for (const e of SEJARAH) {
      for (const b of e.bug_ditutup || []) out.push({ entri: e.id, judul: e.judul, bug: b });
    }
    return out;
  },
  totalKomit: () => SEJARAH.reduce((sum, e) => sum + (e.komit || []).length, 0),
});
