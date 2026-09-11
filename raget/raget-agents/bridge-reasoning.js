import { dataries } from './dataries-registry.js';
import { memoryContext } from '../raget-memory/memory-context.js';
import { bridgeResolve } from './bridge-resolve.js';
import { bridgeFormat } from './bridge-format.js';
import { bridgeRelations } from './bridge-relations.js';

const SUPERLATIF_FIELDS = { populasi: 'population', penduduk: 'population', luas: 'area', wilayah: 'area' };
const SUPERLATIF_DESC_RE = /terbesar|terbanyak|terluas|terpadat/i;
const PALING_KE_TER = { besar: 'terbesar', banyak: 'terbanyak', luas: 'terluas', kecil: 'terkecil', sempit: 'tersempit', padat: 'terpadat' };

async function trySuperlatif(text) {
  // Field eksplisit ("negara dengan populasi terbanyak") ATAU tanpa field
  // ("negara terkecil di dunia") - yang kedua ini secara umum berarti luas
  // wilayah, bukan populasi (begitu juga cara orang biasa nanya trivia ini).
  let m = text.match(/negara\s+(?:dengan\s+)?(?:(populasi|penduduk|luas|wilayah)\s+)?(terbesar|terbanyak|terluas|terkecil|tersempit|terpadat)\b/i);
  let fieldWord = m ? m[1] : null;
  let descWord = m ? m[2].toLowerCase() : null;
  if (!m) {
    // Bentuk periphrastic "paling X" ("negara mana yang penduduknya paling
    // banyak", "negara dengan populasi paling padat") - sama maknanya
    // dengan sufiks "-ter" di atas, cuma beda gaya bahasa.
    const mp = text.match(/negara\s+(?:mana\s+)?(?:yang\s+)?(?:dengan\s+)?(populasi|penduduk|luas|wilayah)?(?:nya)?\s+paling\s+(besar|banyak|luas|kecil|sempit|padat)\b/i);
    if (!mp) return null;
    fieldWord = mp[1];
    descWord = PALING_KE_TER[mp[2].toLowerCase()];
  }
  const defaultField = descWord === 'terbanyak' || descWord === 'terpadat' ? 'population' : 'area';
  const field = fieldWord ? SUPERLATIF_FIELDS[fieldWord.toLowerCase()] : defaultField;
  const desc = SUPERLATIF_DESC_RE.test(descWord);
  let countries = await dataries.loadAll('country');
  const regionKey = findRegionKey(text);
  let scopeLabel = '';
  if (regionKey) {
    const regionIds = REGION_QUERY_MAP[regionKey];
    countries = countries.filter((c) => regionIds.includes(c.metadata.region));
    scopeLabel = ' di ' + bridgeResolve.capitalize(regionKey);
  }
  const valid = countries.filter((c) => c.metadata[field] != null);
  if (!valid.length) return null;
  valid.sort((a, b) => (desc ? b.metadata[field] - a.metadata[field] : a.metadata[field] - b.metadata[field]));
  const top3 = valid.slice(0, 3);
  const label = field === 'population' ? 'populasi' : 'luas';
  return 'Top 3 negara' + scopeLabel + ' dengan ' + label + ' ' + descWord + ':\n' +
    top3.map((c, i) => (i + 1) + '. ' + c.metadata.name + ' — ' + bridgeFormat.formatValue(field, c.metadata[field])).join('\n');
}

const CONTINENT_REGIONS = {
  asean: ['asian-tenggara'],
  eropa: ['eropan-barat', 'eropan-selatan', 'eropan-tengah', 'eropan-timur', 'eropan-utara'],
  afrika: ['african-barat', 'african-selatan', 'african-tengah', 'african-timur', 'african-utara'],
  asia: ['asian-barat', 'asian-selatan', 'asian-tengah', 'asian-tenggara', 'asian-timur'],
  amerika: ['american-karibia', 'american-selatan', 'american-tengah', 'american-utara'],
  osenia: ['osenian'],
};

async function tryAgregasi(text) {
  const m = text.match(/total\s+(populasi|penduduk|luas)\s+(asean|eropa|afrika|asia|amerika|osenia)/i);
  if (!m) return null;
  const field = m[1].toLowerCase() === 'luas' ? 'area' : 'population';
  const continentKey = m[2].toLowerCase();
  const regions = CONTINENT_REGIONS[continentKey];
  if (!regions) return null;
  const countries = await dataries.loadAll('country');
  const matched = countries.filter((c) => regions.includes(c.metadata.region) && c.metadata[field] != null);
  if (!matched.length) return null;
  const total = matched.reduce((sum, c) => sum + c.metadata[field], 0);
  const label = field === 'population' ? 'Populasi' : 'Luas';
  return 'Total ' + label.toLowerCase() + ' ' + bridgeResolve.capitalize(continentKey) + ' sekitar ' + bridgeFormat.formatValue(field, total) + ' (dari ' + matched.length + ' negara).';
}

const REGION_QUERY_MAP = {
  'amerika utara': ['american-utara'],
  'amerika selatan': ['american-selatan'],
  'amerika tengah': ['american-tengah'],
  'amerika karibia': ['american-karibia'],
  'afrika utara': ['african-utara'],
  'afrika barat': ['african-barat'],
  'afrika timur': ['african-timur'],
  'afrika selatan': ['african-selatan'],
  'afrika tengah': ['african-tengah'],
  'asia tenggara': ['asian-tenggara'],
  'asia timur': ['asian-timur'],
  'asia selatan': ['asian-selatan'],
  'asia barat': ['asian-barat'],
  'asia tengah': ['asian-tengah'],
  'eropa barat': ['eropan-barat'],
  'eropa timur': ['eropan-timur'],
  'eropa utara': ['eropan-utara'],
  'eropa selatan': ['eropan-selatan'],
  'eropa tengah': ['eropan-tengah'],
  asean: ['asian-tenggara'],
  eropa: ['eropan-barat', 'eropan-selatan', 'eropan-tengah', 'eropan-timur', 'eropan-utara'],
  afrika: ['african-barat', 'african-selatan', 'african-tengah', 'african-timur', 'african-utara'],
  asia: ['asian-barat', 'asian-selatan', 'asian-tengah', 'asian-tenggara', 'asian-timur'],
  amerika: ['american-karibia', 'american-selatan', 'american-tengah', 'american-utara'],
  osenia: ['osenian'],
  oseania: ['osenian'],
};

const REGION_LIST_INTENT_RE = /\b(sebutkan|daftar|apa\s+saja|apa\s+aja|ada\s+berapa)\b/i;

function findRegionKey(t) {
  const keys = Object.keys(REGION_QUERY_MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (new RegExp('\\b' + escaped + '\\b', 'i').test(t)) return k;
  }
  return null;
}

async function tryRegionList(text) {
  const t = text.toLowerCase();
  if (!/\bnegara\b/.test(t)) return null;
  if (!REGION_LIST_INTENT_RE.test(t)) return null;
  const matchedKey = findRegionKey(t);
  if (!matchedKey) return null;
  const regionIds = REGION_QUERY_MAP[matchedKey];
  const countries = await dataries.loadAll('country');
  const matched = countries.filter((c) => regionIds.includes(c.metadata.region));
  if (!matched.length) return null;
  const label = bridgeResolve.capitalize(matchedKey);
  const names = matched.map((c) => c.metadata.name);
  const NAME_CAP = 15;
  const shown = names.slice(0, NAME_CAP).join(', ') + (names.length > NAME_CAP ? ', dan ' + (names.length - NAME_CAP) + ' lainnya' : '');
  if (/ada\s+berapa/.test(t)) {
    return 'Di basis data ini ada ' + matched.length + ' negara di ' + label + ': ' + shown + '.';
  }
  return 'Negara-negara di ' + label + ' (di basis data ini): ' + shown + '.';
}

async function tryReverseLookup(text) {
  const currencyM = text.match(/negara\s+(?:apa\s+)?(?:yang\s+)?mata\s*uangnya\s+(.+?)\??$/i);
  const langM = text.match(/negara\s+(?:apa\s+)?(?:yang\s+)?bahasanya\s+(.+?)\??$/i);
  const capitalM = text.match(/ibukota(?:nya)?\s+(.+?)\s+(?:itu\s+)?negara\s+(?:apa|mana)\??$/i)
    || text.match(/negara\s+apa\s+yang\s+ibukotanya\s+(.+?)\??$/i);
  const currencyNameM = text.match(/mata\s*uang\s+(.+?)\s+itu\s+punya\s+negara\s+(?:apa|mana)\??$/i);
  if (!currencyM && !langM && !capitalM && !currencyNameM) return null;
  const countries = await dataries.loadAll('country');
  if (currencyM) {
    const q = bridgeResolve.cleanEntity(currencyM[1]);
    if (!q) return null;
    const matches = countries.filter((c) => (c.metadata.currency || '').toLowerCase().includes(q));
    if (!matches.length) return null;
    return 'Negara dengan mata uang ' + bridgeResolve.capitalize(q) + ': ' + matches.slice(0, 3).map((c) => c.metadata.name).join(', ') + '.';
  }
  if (langM) {
    const q = bridgeResolve.cleanEntity(langM[1]);
    if (!q) return null;
    const matches = countries.filter((c) => (c.metadata.languages || []).some((l) => (l.name || '').toLowerCase().includes(q)));
    if (!matches.length) return null;
    return 'Negara berbahasa ' + bridgeResolve.capitalize(q) + ': ' + matches.slice(0, 3).map((c) => c.metadata.name).join(', ') + '.';
  }
  if (capitalM) {
    const q = bridgeResolve.cleanEntity(capitalM[1]);
    if (!q) return null;
    const match = countries.find((c) => (c.metadata.capital || '').toLowerCase() === q || (c.metadata.capital || '').toLowerCase().includes(q));
    if (!match) return null;
    return 'Negara dengan ibukota ' + bridgeResolve.capitalize(q) + ' adalah ' + match.metadata.name + '.';
  }
  const q = bridgeResolve.cleanEntity(currencyNameM[1]);
  if (!q) return null;
  const match = countries.find((c) => (c.metadata.currency || '').toLowerCase() === q);
  if (!match) return null;
  return 'Mata uang ' + bridgeResolve.capitalize(q) + ' digunakan oleh negara ' + match.metadata.name + '.';
}

const UNIT_WORDS = {
  km: 'km', kilometer: 'km', mil: 'mil', mile: 'mil',
  kg: 'kg', kilogram: 'kg', lb: 'lb', pound: 'lb', pon: 'lb',
  celcius: 'c', celsius: 'c', fahrenheit: 'f',
};

function convertUnit(val, from, to) {
  if (from === to) return val;
  if (from === 'km' && to === 'mil') return val * 0.621371;
  if (from === 'mil' && to === 'km') return val / 0.621371;
  if (from === 'kg' && to === 'lb') return val * 2.20462;
  if (from === 'lb' && to === 'kg') return val / 2.20462;
  if (from === 'c' && to === 'f') return (val * 9) / 5 + 32;
  if (from === 'f' && to === 'c') return ((val - 32) * 5) / 9;
  return null;
}

async function tryKonversiSatuan(text) {
  const m = text.match(/(-?\d+(?:[.,]\d+)?)\s*(km|kilometer|mil|mile|kg|kilogram|lb|pound|pon|celcius|celsius|fahrenheit)\s+ke\s+(km|kilometer|mil|mile|kg|kilogram|lb|pound|pon|celcius|celsius|fahrenheit)\b/i);
  if (!m) return null;
  const val = parseFloat(m[1].replace(',', '.'));
  const from = UNIT_WORDS[m[2].toLowerCase()];
  const to = UNIT_WORDS[m[3].toLowerCase()];
  if (!from || !to) return null;
  const result = convertUnit(val, from, to);
  if (result == null) return null;
  return val + ' ' + m[2] + ' = ' + Math.round(result * 100) / 100 + ' ' + m[3] + '.';
}

const STATIC_RATES_IDR = {
  usd: 16300, eur: 17200, gbp: 20500, jpy: 110, sgd: 12600, myr: 3500,
  aud: 10700, cny: 2280, krw: 12, thb: 470, sar: 4350, chf: 18200,
};

const CURRENCY_ALIASES = {
  dolar: 'usd', dolaramerika: 'usd', usd: 'usd',
  euro: 'eur', eur: 'eur',
  poundsterling: 'gbp', pound: 'gbp', gbp: 'gbp',
  yen: 'jpy', jpy: 'jpy',
  dolarsingapura: 'sgd', sgd: 'sgd',
  ringgit: 'myr', myr: 'myr',
  dolaraustralia: 'aud', aud: 'aud',
  yuan: 'cny', cny: 'cny',
  won: 'krw', krw: 'krw',
  baht: 'thb', thb: 'thb',
  riyal: 'sar', sar: 'sar',
  franc: 'chf', chf: 'chf',
  rupiah: 'idr', idr: 'idr',
};

function normalizeCurrencyWord(w) {
  return CURRENCY_ALIASES[w.toLowerCase().replace(/\s+/g, '')] || null;
}

async function tryKonversiMataUang(text) {
  const m = text.match(/(\d+(?:[.,]\d+)?)\s*(rupiah|dolar(?:\s+amerika)?|euro|pound\s*sterling|yen|dolar\s+singapura|ringgit|dolar\s+australia|yuan|won|baht|riyal|franc)\s+ke\s+(rupiah|dolar(?:\s+amerika)?|euro|pound\s*sterling|yen|dolar\s+singapura|ringgit|dolar\s+australia|yuan|won|baht|riyal|franc)\b/i);
  if (!m) return null;
  const val = parseFloat(m[1].replace(',', '.'));
  const from = normalizeCurrencyWord(m[2]);
  const to = normalizeCurrencyWord(m[3]);
  if (!from || !to) return null;
  const fromRate = from === 'idr' ? 1 : STATIC_RATES_IDR[from];
  const toRate = to === 'idr' ? 1 : STATIC_RATES_IDR[to];
  if (!fromRate || !toRate) return null;
  const idrValue = val * fromRate;
  const result = idrValue / toRate;
  return val.toLocaleString('id-ID') + ' ' + m[2] + ' ≈ ' + result.toLocaleString('id-ID', { maximumFractionDigits: 2 }) + ' ' + m[3] + ' (kurs perkiraan).';
}

function parseIndoDate(dayStr, monthStr, year) {
  const day = parseInt(dayStr, 10);
  const monthIdx = bridgeFormat.MONTHS_ID.findIndex((mo) => mo.toLowerCase() === monthStr.toLowerCase());
  if (monthIdx < 0 || !day) return null;
  return new Date(year, monthIdx, day);
}

function formatIndoDateFull(d) {
  return d.getDate() + ' ' + bridgeFormat.MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
}

async function tryPenalaranTanggal(text) {
  const rangeM = text.match(/berapa\s+hari\s+dari\s+(\d{1,2})\s+([a-zA-Z]+)\s+ke\s+(\d{1,2})\s+([a-zA-Z]+)/i);
  if (rangeM) {
    const now = new Date();
    const d1 = parseIndoDate(rangeM[1], rangeM[2], now.getFullYear());
    const d2 = parseIndoDate(rangeM[3], rangeM[4], now.getFullYear());
    if (!d1 || !d2) return null;
    const days = Math.round((d2 - d1) / 86400000);
    return 'Dari ' + rangeM[1] + ' ' + bridgeResolve.capitalize(rangeM[2]) + ' ke ' + rangeM[3] + ' ' + bridgeResolve.capitalize(rangeM[4]) + ' ada ' + Math.abs(days) + ' hari.';
  }
  if (/minggu\s+depan\s+tanggal\s+berapa/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return 'Minggu depan jatuh pada ' + formatIndoDateFull(d) + '.';
  }
  if (/bulan\s+depan\s+tanggal\s+berapa/i.test(text)) {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return 'Bulan depan (tanggal yang sama) jatuh pada ' + formatIndoDateFull(d) + '.';
  }
  if (/besok\s+tanggal\s+berapa/i.test(text)) {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return 'Besok tanggal ' + formatIndoDateFull(d) + '.';
  }
  return null;
}

const ANAFORA_LUAS_RE = /kalau\s+yang\s+itu|terus\s+yang\s+satunya|bagaimana\s+dengan\s+yang\s+satunya|yang\s+satunya\s+lagi/i;

async function tryAnaforaLuas(text, opts) {
  if (!ANAFORA_LUAS_RE.test(text)) return null;
  const field = memoryContext.getRelation();
  if (!field) return null;
  const stack = memoryContext.getStack();
  const entity = stack[1];
  if (!entity) return null;
  const resolved = await bridgeRelations.resolveValue({ fields: [field] }, entity);
  if (!resolved) return null;
  return bridgeFormat.craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts && opts.richness);
}

export const bridgeReasoning = Object.freeze({
  trySuperlatif,
  tryAgregasi,
  tryRegionList,
  tryReverseLookup,
  tryKonversiSatuan,
  tryKonversiMataUang,
  tryPenalaranTanggal,
  tryAnaforaLuas,
});
