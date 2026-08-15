import { dataries } from '../dataries/index.js';
import { bridgeResolve } from './bridge-resolve.js';
import { memoryContext } from '../raget-memory/memory-context.js';

const EN_MARKERS = /\b(what|where|when|who|which|how|does|do|is|are|the|capital|population|currency|language|languages|area|country|city|spoken|use|uses|many|much|tell|about|hello|thanks|please|translate)\b/gi;
const ID_MARKERS = /\b(apa|dimana|di mana|kapan|siapa|berapa|adalah|yang|ibukota|ibu kota|populasi|penduduk|mata uang|matauang|bahasa|luas|negara|kota|tentang|ceritakan|terjemahkan|halo|hai|terima kasih)\b/gi;

function detectLang(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  const enHits = (t.match(EN_MARKERS) || []).length;
  const idHits = (t.match(ID_MARKERS) || []).length;
  if (enHits === 0 && idHits === 0) return null;
  return enHits > idHits ? 'en' : 'id';
}

const EN_COUNTRY_ALIASES = {
  japan: 'jepang', china: 'china', 'south korea': 'korea selatan', korea: 'korea selatan',
  'north korea': 'korea utara', taiwan: 'taiwan', mongolia: 'mongolia',
  india: 'india', pakistan: 'pakistan', bangladesh: 'bangladesh', 'sri lanka': 'sri lanka', nepal: 'nepal',
  indonesia: 'indonesia', malaysia: 'malaysia', singapore: 'singapura', thailand: 'thailand',
  vietnam: 'vietnam', philippines: 'filipina', myanmar: 'myanmar', cambodia: 'kamboja', laos: 'laos',
  'brunei darussalam': 'brunei', brunei: 'brunei',
  'saudi arabia': 'arab saudi', iran: 'iran', iraq: 'irak', israel: 'israel', jordan: 'yordania',
  kuwait: 'kuwait', qatar: 'qatar', turkey: 'turki', lebanon: 'lebanon', yemen: 'yaman',
  germany: 'jerman', france: 'prancis', italy: 'italia', spain: 'spanyol', netherlands: 'belanda',
  belgium: 'belgia', switzerland: 'swiss', austria: 'austria', portugal: 'portugal', poland: 'polandia',
  sweden: 'swedia', norway: 'norwegia', denmark: 'denmark', finland: 'finlandia', ireland: 'irlandia',
  iceland: 'islandia', greece: 'yunani', ukraine: 'ukraina', russia: 'rusia', 'united kingdom': 'inggris',
  england: 'inggris', 'great britain': 'inggris',
  egypt: 'mesir', nigeria: 'nigeria', kenya: 'kenya', 'south africa': 'afrika selatan',
  morocco: 'maroko', algeria: 'aljazair', tunisia: 'tunisia', ethiopia: 'ethiopia', ghana: 'ghana',
  canada: 'kanada', mexico: 'meksiko', brazil: 'brasil', argentina: 'argentina', chile: 'chili',
  peru: 'peru', colombia: 'kolombia', 'united states': 'amerika serikat', usa: 'amerika serikat',
  australia: 'australia', 'new zealand': 'selandia baru',
};

const COUNTRY_NAME_EN = {};
Object.keys(EN_COUNTRY_ALIASES).forEach((enName) => {
  const idName = EN_COUNTRY_ALIASES[enName];
  if (!COUNTRY_NAME_EN[idName] || enName.length > COUNTRY_NAME_EN[idName].length) {
    COUNTRY_NAME_EN[idName] = enName;
  }
});

function capitalizeWords(s) {
  return String(s || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function toEnglishCountryName(idName, fallback) {
  const key = String(idName || '').toLowerCase();
  const en = COUNTRY_NAME_EN[key];
  return en ? capitalizeWords(en) : capitalizeWords(fallback || idName);
}

function extractEnEntity(raw) {
  const cleaned = String(raw || '')
    .replace(/^(the\s+)/i, '')
    .replace(/\?+$/, '')
    .trim()
    .toLowerCase();
  return EN_COUNTRY_ALIASES[cleaned] || bridgeResolve.resolveCountryAlias(cleaned);
}

const EN_PATTERNS = [
  { field: 'capital', re: /(?:what\s+is\s+the\s+)?capital(?:\s+city)?\s+of\s+(.+?)\??$/i },
  { field: 'population', re: /(?:what\s+is\s+the\s+)?population\s+of\s+(.+?)\??$/i },
  { field: 'population', re: /how\s+many\s+people\s+live\s+in\s+(.+?)\??$/i },
  { field: 'currency', re: /what\s+currency\s+does\s+(.+?)\s+use\??$/i },
  { field: 'currency', re: /(?:what\s+is\s+the\s+)?currency\s+of\s+(.+?)\??$/i },
  { field: 'area', re: /(?:what\s+is\s+the\s+)?area\s+of\s+(.+?)\??$/i },
  { field: 'area', re: /how\s+big\s+is\s+(.+?)\??$/i },
  { field: 'languages', re: /what\s+language(?:s)?\s+(?:is|are)\s+spoken\s+in\s+(.+?)\??$/i },
  { field: 'languages', re: /(?:what\s+is\s+the\s+)?language\s+of\s+(.+?)\??$/i },
];

const LANGUAGE_NAME_EN = {
  indonesia: 'Indonesian', inggris: 'English', jepang: 'Japanese', mandarin: 'Mandarin Chinese',
  china: 'Mandarin Chinese', korea: 'Korean', arab: 'Arabic', prancis: 'French', perancis: 'French',
  jerman: 'German', spanyol: 'Spanish', rusia: 'Russian', portugis: 'Portuguese', italia: 'Italian',
  melayu: 'Malay', thai: 'Thai', vietnam: 'Vietnamese', hindi: 'Hindi', belanda: 'Dutch',
};

function toEnglishLanguageName(name) {
  const key = String(name || '').toLowerCase();
  return LANGUAGE_NAME_EN[key] || name;
}

const LANGUAGE_NAME_ID = { chinese: 'mandarin', dutch: 'belanda' };
Object.keys(LANGUAGE_NAME_EN).forEach((idName) => {
  const enName = LANGUAGE_NAME_EN[idName].toLowerCase();
  if (!LANGUAGE_NAME_ID[enName]) LANGUAGE_NAME_ID[enName] = idName;
});

const CAPITAL_NAME_EN = {
  kairo: 'Cairo', roma: 'Rome', wina: 'Vienna', athena: 'Athens',
  warsawa: 'Warsaw', praha: 'Prague', moskow: 'Moscow', kopenhagen: 'Copenhagen',
  lisboa: 'Lisbon',
};

function toEnglishCapitalName(name) {
  const key = String(name || '').toLowerCase();
  return CAPITAL_NAME_EN[key] || name;
}

function fmtPopulationEn(n) {
  const num = Number(n);
  if (!isFinite(num)) return String(n);
  if (num >= 1e9) {
    const billions = num / 1e9;
    return (Number.isInteger(billions) ? billions : billions.toFixed(1)) + ' billion';
  }
  if (num >= 1e6) {
    const millions = num / 1e6;
    return (Number.isInteger(millions) ? millions : millions.toFixed(1)) + ' million';
  }
  return num.toLocaleString('en-US');
}

function fmtAreaEn(n) {
  const num = Number(n);
  if (!isFinite(num)) return String(n);
  return num.toLocaleString('en-US') + ' km²';
}

function formatFieldEn(field, item, rawEntity) {
  const name = toEnglishCountryName(item.metadata.name, rawEntity);
  if (field === 'capital') {
    return item.metadata.capital ? 'The capital of ' + name + ' is ' + toEnglishCapitalName(item.metadata.capital) + '.' : null;
  }
  if (field === 'population') {
    return item.metadata.population != null
      ? name + ' has a population of about ' + fmtPopulationEn(item.metadata.population) + ' people.'
      : null;
  }
  if (field === 'currency') {
    if (!item.metadata.currency) return null;
    const code = item.metadata.currencyCode ? ' (' + item.metadata.currencyCode + ')' : '';
    return name + ' uses the ' + item.metadata.currency + code + ' as its currency.';
  }
  if (field === 'area') {
    return item.metadata.area != null ? name + ' has an area of about ' + fmtAreaEn(item.metadata.area) + '.' : null;
  }
  if (field === 'languages') {
    const langs = item.metadata.languages;
    if (!langs || !langs.length) return null;
    const names = langs.map((l) => toEnglishLanguageName(typeof l === 'string' ? l : l.name)).filter(Boolean);
    if (!names.length) return null;
    return 'The main language' + (names.length > 1 ? 's' : '') + ' spoken in ' + name + (names.length > 1 ? ' are ' : ' is ') + names.join(', ') + '.';
  }
  return null;
}

const OTHER_FIELDS = ['capital', 'population', 'currency', 'area', 'languages'];

function bestEffortEn(field, item, rawEntity) {
  const known = OTHER_FIELDS.filter((f) => f !== field)
    .map((f) => formatFieldEn(f, item, rawEntity))
    .filter(Boolean);
  if (!known.length) return null;
  const name = toEnglishCountryName(item.metadata.name, rawEntity);
  return "I don't have that specific detail for " + name + ' yet, but here is what I know: ' + known.slice(0, 2).join(' ');
}

async function tryFactoidEn(text) {
  const t = String(text || '').trim();
  if (!t) return null;
  for (const pattern of EN_PATTERNS) {
    const m = t.match(pattern.re);
    if (!m) continue;
    const rawEntity = m[1].replace(/^(the\s+)/i, '').replace(/\?+$/, '').trim();
    const entity = extractEnEntity(m[1]);
    if (!entity) continue;
    const item = await bridgeResolve.lookupInGroup('country', entity);
    if (!item) continue;
    const reply = formatFieldEn(pattern.field, item, rawEntity) || bestEffortEn(pattern.field, item, rawEntity);
    if (reply) {
      memoryContext.pushEntity(item.metadata.name);
      return reply;
    }
  }
  return null;
}

const BASIC_PHRASES = {
  hello: 'halo', hi: 'halo', hai: 'halo', halo: 'halo',
  thanks: 'terimakasih', thankyou: 'terimakasih', 'thank you': 'terimakasih', terimakasih: 'terimakasih',
  'terima kasih': 'terimakasih', goodmorning: 'pagi', 'good morning': 'pagi', selamatpagi: 'pagi',
  'selamat pagi': 'pagi',
};

async function findLanguageByName(query) {
  let q = String(query || '').toLowerCase().trim();
  if (!q) return null;
  q = LANGUAGE_NAME_ID[q] || q;
  const list = await dataries.loadAll('languages');
  return (
    list.find((it) => (it.metadata.name || '').toLowerCase() === q) ||
    (q.length >= 4 ? list.find((it) => (it.metadata.name || '').toLowerCase().includes(q)) : null) ||
    null
  );
}

async function tryBasicPhrase(text) {
  const m =
    String(text || '').match(/^(?:terjemahkan|translate)\s+(.+?)\s+(?:ke|to)\s+(?:bahasa\s+)?(.+?)\??$/i);
  if (!m) return null;
  const phraseKey = BASIC_PHRASES[m[1].toLowerCase().replace(/\s+/g, ' ').trim()];
  if (!phraseKey) return null;
  const langItem = await findLanguageByName(m[2]);
  if (!langItem || !langItem.metadata.greetings) return null;
  const value = langItem.metadata.greetings[phraseKey];
  if (!value) return null;
  return '"' + m[1].trim() + '" in ' + toEnglishLanguageName(langItem.metadata.name) + ' is "' + value + '".';
}

export const bilingual = Object.freeze({
  detectLang,
  tryFactoidEn,
  tryBasicPhrase,
  toEnglishCountryName,
  toEnglishCapitalName,
  toEnglishLanguageName,
  extractEnEntity,
});
