import { notebookStore } from '../notebook/pitutur-notebook-store.js';

const KEY = 'raget_pitutur_state';

const RATE_VALID = [0.8, 0.9, 1, 1.2];
const LANG_VALID = ['id', 'en', 'jv', 'su', 'es', 'de', 'pt', 'zh', 'ja', 'ko'];
const CHANNEL_VALID = ['pagi', 'tokoh', 'koleksi', 'kuliner', 'sains', 'sejarah', 'wisata', 'lingo'];
const MODE_VALID = ['monolog', 'dialog', 'diskusi'];
const SLEEP_VALID = [0, 5, 10, 15];
const KOLEKSI_LAST_MAX = 100;

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function parseLine(raw) {
  const m = raw.match(/^\[([^|\]]+)(?:\|([a-z]+))?\]\s*(.*)$/);
  if (!m) return { s: 'Warta', t: 'inform', i: raw, g: null };
  return { s: m[1], t: m[2] || 'inform', i: m[3], g: null };
}

function migrasiHistoryEntry(h) {
  if (Array.isArray(h.lines)) return h;
  const teks = String(h.text || '');
  const lines = teks.split('\n').map(parseLine).filter(function (l) { return l.i; });
  return {
    n: h.n,
    channel: h.channel,
    words: h.words,
    date: h.date,
    topik: h.topik,
    lines: lines
  };
}

function migrasi(r) {
  if (!r || typeof r !== 'object') return {};
  if (r.rev === 2) return r;
  if (r.rev === 1) {
    return {
      rev: 2,
      episode: r.episode,
      plays: r.plays,
      lastListen: r.lastListen,
      rate: r.rate,
      lang: r.lang,
      channel: r.channel,
      mode: r.mode,
      sources: r.sources,
      settings: { sleep: 0, roomTone: false, wakeLock: false },
      stats: { minutes: 0, streak: 0, streakLast: null },
      koleksiLast: {},
      history: (Array.isArray(r.history) ? r.history : []).map(migrasiHistoryEntry)
    };
  }
  return {};
}

function load() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY) || 'null');
    return migrasi(r);
  } catch (e) {
    return {};
  }
}

function channelValid(id) {
  return CHANNEL_VALID.indexOf(id) !== -1 || (typeof id === 'string' && id.indexOf('doc:') === 0);
}

function sanitasi(s) {
  if (RATE_VALID.indexOf(s.rate) === -1) s.rate = 0.9;
  if (LANG_VALID.indexOf(s.lang) === -1) s.lang = 'id';
  if (!channelValid(s.channel)) s.channel = 'pagi';
  if (MODE_VALID.indexOf(s.mode) === -1) s.mode = 'monolog';
  if (!Array.isArray(s.history)) s.history = [];
  s.history = s.history.slice(-8).map(migrasiHistoryEntry);
  if (typeof s.episode !== 'number' || s.episode < 0 || !isFinite(s.episode)) s.episode = 0;
  if (typeof s.plays !== 'number' || s.plays < 0 || !isFinite(s.plays)) s.plays = 0;
  const src = s.sources && typeof s.sources === 'object' ? s.sources : {};
  s.sources = {
    dataries: src.dataries !== false,
    koleksi: src.koleksi !== false,
    devlog: src.devlog === true,
    dokumen: src.dokumen === true
  };
  const set = s.settings && typeof s.settings === 'object' ? s.settings : {};
  s.settings = {
    sleep: SLEEP_VALID.indexOf(set.sleep) !== -1 ? set.sleep : 0,
    roomTone: set.roomTone === true,
    wakeLock: set.wakeLock === true
  };
  const st = s.stats && typeof s.stats === 'object' ? s.stats : {};
  s.stats = {
    minutes: typeof st.minutes === 'number' && isFinite(st.minutes) && st.minutes >= 0 ? st.minutes : 0,
    streak: typeof st.streak === 'number' && isFinite(st.streak) && st.streak >= 0 ? st.streak : 0,
    streakLast: typeof st.streakLast === 'string' ? st.streakLast : null
  };
  s.koleksiLast = s.koleksiLast && typeof s.koleksiLast === 'object' ? s.koleksiLast : {};
  s.docPos = s.docPos && typeof s.docPos === 'object' ? s.docPos : {};
  const dm = s.docMode;
  s.docMode = (dm === 'ringkas' || dm === 'faq' || dm === 'baca') ? dm : 'baca';
  s.rev = 2;
  return s;
}

const state = sanitasi(Object.assign({
  rev: 2,
  episode: 0,
  plays: 0,
  lastListen: null,
  history: [],
  rate: 0.9,
  lang: 'id',
  channel: 'pagi',
  mode: 'monolog',
  sources: { dataries: true, koleksi: true, devlog: false, dokumen: false },
  settings: { sleep: 0, roomTone: false, wakeLock: false },
  stats: { minutes: 0, streak: 0, streakLast: null },
  koleksiLast: {},
  docPos: {},
  docMode: 'baca'
}, load()));

let saveTimer = null;

function tulis() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch (e) {}
}

function save(immediate) {
  if (immediate) {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
    tulis();
    return;
  }
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(function () {
    saveTimer = null;
    tulis();
  }, 300);
}

function catatMenit(tambahan) {
  if (!tambahan) return;
  state.stats.minutes += tambahan;
  const hari = todayKey();
  if (state.stats.streakLast === hari) {
    return;
  }
  const kemarin = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  state.stats.streak = state.stats.streakLast === kemarin ? state.stats.streak + 1 : 1;
  state.stats.streakLast = hari;
}

function catatKoleksi(kunci) {
  if (!kunci) return;
  state.koleksiLast[kunci] = Date.now();
  const keys = Object.keys(state.koleksiLast);
  if (keys.length > KOLEKSI_LAST_MAX) {
    keys
      .sort(function (a, b) { return state.koleksiLast[a] - state.koleksiLast[b]; })
      .slice(0, keys.length - KOLEKSI_LAST_MAX)
      .forEach(function (k) { delete state.koleksiLast[k]; });
  }
}

function catatDokumenPos(docId, pos) {
  if (!docId) return;
  state.docPos[docId] = pos;
  notebookStore.catatProgresDokumen(docId, pos).catch(function () {});
}

export const pituturState = {
  state: state,
  save: save,
  catatMenit: catatMenit,
  catatKoleksi: catatKoleksi,
  catatDokumenPos: catatDokumenPos,
  CHANNEL_VALID: CHANNEL_VALID,
  SLEEP_VALID: SLEEP_VALID
};
