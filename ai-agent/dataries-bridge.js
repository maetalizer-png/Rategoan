import { REGIONS, dataries } from '../dataries/index.js';
import { pickVariant } from '../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const RELATIONS = [
  { keys: ['kota terbesar'], fields: ['largestCity'] },
  { keys: ['ibukota', 'ibu kota'], fields: ['capital'] },
  { keys: ['jumlah provinsi', 'berapa provinsi', 'provinsi'], fields: ['administrativeDivisions', 'totalProvinces'] },
  { keys: ['kabupaten'], fields: ['kabupaten'] },
  { keys: ['kota'], fields: ['totalCities'] },
  { keys: ['populasi', 'penduduk'], fields: ['population'] },
  { keys: ['mata uang'], fields: ['currency'] },
  { keys: ['bahasa'], fields: ['languages'] },
  { keys: ['pemerintahan'], fields: ['governmentType'] },
  { keys: ['merdeka', 'kemerdekaan'], fields: ['independenceDay'] },
  { keys: ['luas'], fields: ['area'] },
  { keys: ['kode telepon', 'kode telpon'], fields: ['phoneCode'] },
];

const FACTOID_OPENERS = ['', 'Setahu saya, ', 'Sepengetahuan saya, ', 'Kalau data saya benar, ', 'Berdasarkan catatan saya, ', 'Kalau tidak salah, '];

function capitalize(s) {
  return String(s || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function formatCount(n) {
  const num = Number(n);
  if (!isFinite(num)) return String(n);
  if (num >= 1e9) return Math.round((num / 1e9) * 10) / 10 + ' miliar';
  if (num >= 1e6) return Math.round((num / 1e6) * 10) / 10 + ' juta';
  if (num >= 1e3) return Math.round((num / 1e3) * 10) / 10 + ' ribu';
  return num.toLocaleString('id-ID');
}

function formatIndependence(dateStr) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(dateStr);
  const month = MONTHS_ID[parseInt(m[2], 10) - 1] || m[2];
  const year = parseInt(m[1], 10);
  const yearsAgo = new Date().getFullYear() - year;
  const agoText = yearsAgo > 0 ? ' (±' + yearsAgo + ' tahun lalu)' : '';
  return m[1] + ' (' + parseInt(m[3], 10) + ' ' + month + ')' + agoText;
}

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return String(languages || '');
  const official = languages.filter((l) => l && l.official).map((l) => l.name);
  const names = official.length ? official : languages.map((l) => l.name);
  return names.map((n) => (/^bahasa\b/i.test(n) ? n : 'Bahasa ' + n)).join(' dan ');
}

function formatValue(field, raw) {
  if (field === 'population') return '±' + formatCount(raw) + ' jiwa';
  if (field === 'area') return formatCount(raw) + ' km²';
  if (field === 'independenceDay') return formatIndependence(raw);
  if (field === 'languages') return formatLanguages(raw);
  return String(raw);
}

function hasKeyword(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
}

const LANGUAGE_EXTRAS_RE = /sapaan|penutur|cara\s+menyapa|dalam\s+bahasa|ucapkan\s+selamat\s+pagi/i;

function detectRelation(text) {
  const t = text.toLowerCase();
  for (const rel of RELATIONS) {
    if (rel.fields.includes('languages') && LANGUAGE_EXTRAS_RE.test(t)) continue;
    if (rel.keys.some((k) => hasKeyword(t, k))) return rel;
  }
  return null;
}

function extractEntity(text, relation) {
  let t = text.toLowerCase();
  relation.keys.forEach((k) => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp('\\b' + escaped + '\\b', 'i'), ' ');
  });
  t = t
    .replace(/^(apa|berapa|siapa|kapan|dimana|di\s*mana)\s+/i, '')
    .replace(/\b(negara|dari|di|nya|adalah|itu)\b/g, ' ')
    .replace(/\?+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return resolveCountryAlias(t);
}

function detectEntityRegions(text) {
  const t = text.toLowerCase();
  const matches = [];
  ['country', 'cities'].forEach((group) => {
    (REGIONS[group] || []).forEach((region) => {
      region.names.forEach((name) => {
        if (name && t.includes(name)) matches.push({ group, region, name });
      });
    });
  });
  matches.sort((a, b) => b.name.length - a.name.length);
  return matches;
}

function extractKnownEntity(text) {
  const matches = detectEntityRegions(String(text || ''));
  return matches.length ? matches[0].name : null;
}

function matchesName(item, entity) {
  const name = (item.metadata.name || '').toLowerCase();
  if (!name) return false;
  return name === entity || entity.includes(name) || name.includes(entity);
}

async function lookupInGroup(group, entity) {
  if (!entity) return null;
  const regions = dataries.findRegionsByName(group, entity);
  for (const region of regions) {
    const list = await dataries.loadRegion(group, region.id);
    if (!list) continue;
    const item = list.find((it) => matchesName(it, entity));
    if (item) return item;
  }
  return null;
}

async function findProvince(entity) {
  if (!entity) return null;
  const list = await dataries.loadRegion('cities', 'asia-tenggara');
  if (!list) return null;
  for (const item of list) {
    const provinces = item.metadata && item.metadata.provinces;
    if (!Array.isArray(provinces)) continue;
    const match = provinces.find((p) => {
      const name = (p.name || '').toLowerCase();
      return name === entity || entity.includes(name) || name.includes(entity);
    });
    if (match) return { province: match, country: item.metadata.name };
  }
  return null;
}

const TRIVIA_FIELDS = ['population', 'largestCity', 'area', 'currency', 'independenceDay'];
const TRIVIA_LABELS = {
  population: 'Populasinya sekitar',
  largestCity: 'Kota terbesarnya',
  area: 'Luasnya sekitar',
  currency: 'Mata uangnya',
  independenceDay: 'Merdeka pada',
};
const RICHNESS_MODES = ['plain', 'trivia', 'plain', 'trivia', 'plain'];
const CROSSREF_MODES = ['no', 'no', 'yes'];
const CROSSREF_SUGGESTIONS = {
  capital: (label) => 'Mau tahu juga makanan khas ' + label + '?',
  population: (label) => 'Mau tahu juga ibukota ' + label + '?',
  currency: (label) => 'Mau tahu juga tempat wisata di ' + label + '?',
  languages: (label) => 'Mau tahu juga makanan khas ' + label + '?',
};

function maybeCrossRef(out, field, label, richness) {
  const suggest = CROSSREF_SUGGESTIONS[field];
  if (!suggest || richness === 'singkat') return out;
  const mode = pickVariant('crossref_mode', CROSSREF_MODES, label + field);
  return mode === 'yes' ? out + ' ' + suggest(label) : out;
}

function triviaFact(item, excludeField) {
  if (!item || !item.metadata) return null;
  const meta = item.metadata;
  const candidates = TRIVIA_FIELDS.filter((f) => f !== excludeField && meta[f] != null);
  if (!candidates.length) return null;
  const f = pickVariant('trivia_field_' + meta.name, candidates, meta.name + excludeField);
  return TRIVIA_LABELS[f] + ' ' + formatValue(f, meta[f]) + '.';
}

function craftAnswer(field, label, value, item, richness) {
  const sentences = {
    capital: 'Ibukota ' + label + ' adalah ' + value + '.',
    totalProvinces: label + ' memiliki ' + value + ' provinsi.',
    administrativeDivisions: label + ' memiliki ' + value + ' provinsi.',
    totalCities: label + ' memiliki ' + value + ' kota/kabupaten.',
    kabupaten: label + ' memiliki ' + value + ' kabupaten.',
    population: 'Populasi ' + label + ' sekitar ' + value + '.',
    currency: 'Mata uang ' + label + ' adalah ' + value + '.',
    languages: 'Bahasa resmi ' + label + ' adalah ' + value + '.',
    governmentType: 'Sistem pemerintahan ' + label + ' adalah ' + value + '.',
    independenceDay: label + ' merdeka pada ' + value + '.',
    largestCity: 'Kota terbesar di ' + label + ' adalah ' + value + '.',
    area: 'Luas ' + label + ' sekitar ' + value + '.',
    phoneCode: 'Kode telepon ' + label + ' adalah ' + value + '.',
  };
  const base = sentences[field] || label + ': ' + value + '.';
  const opener = pickVariant('dataries_opener', FACTOID_OPENERS, label + value + field);
  let out = opener ? opener + base.charAt(0).toLowerCase() + base.slice(1) : base;
  if (richness !== 'singkat' && item) {
    const mode = pickVariant('factoid_richness', RICHNESS_MODES, label + field);
    if (mode === 'trivia') {
      const trivia = triviaFact(item, field);
      if (trivia && !trivia.includes(String(value))) out += ' ' + trivia;
    } else {
      out = maybeCrossRef(out, field, label, richness);
    }
  }
  return out;
}

async function resolveValue(relation, entity) {
  if (!entity) return null;
  const countryItem = await lookupInGroup('country', entity);
  if (countryItem) {
    for (const f of relation.fields) {
      if (countryItem.metadata[f] != null) {
        return { value: formatValue(f, countryItem.metadata[f]), field: f, label: countryItem.metadata.name, item: countryItem };
      }
    }
  }
  const cityItem = await lookupInGroup('cities', entity);
  if (cityItem) {
    for (const f of relation.fields) {
      if (cityItem.metadata[f] != null) {
        return { value: formatValue(f, cityItem.metadata[f]), field: f, label: cityItem.metadata.name, item: cityItem };
      }
    }
  }
  if (relation.fields.includes('capital') || relation.fields.includes('kabupaten')) {
    const prov = await findProvince(entity);
    if (prov) {
      const f = relation.fields.includes('kabupaten') ? 'kabupaten' : 'capital';
      const raw = prov.province[f];
      if (raw != null) return { value: formatValue(f, raw), field: f, label: capitalize(entity), item: null };
    }
  }
  return null;
}

function summarizeItem(item, richness) {
  const sentences = String(item.text || '')
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  const count = richness === 'singkat' ? 1 : 3;
  const summary = sentences.slice(0, count).join(' ');
  if (richness === 'singkat') return summary;
  const heading = '### ' + (item.metadata.name || '');
  const meta = item.metadata || {};
  const bullets = [];
  if (meta.capital) bullets.push('- Ibukota: ' + meta.capital);
  if (meta.population != null) bullets.push('- Populasi: ' + formatValue('population', meta.population));
  if (!bullets.length) return heading + '\n' + summary;
  return heading + '\n' + summary + '\n' + bullets.slice(0, 2).join('\n');
}

const CORRECTION_RE = /^(bukan|salah|eh\s*bukan)[,.]?\s*(?:maksud(?:nya|\s+saya)?\s+)?(.+)$/i;

function splitCompoundEntities(entityText) {
  return String(entityText || '')
    .split(/\s+dan\s+|\s*&\s*|\s*,\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

async function tryCorrection(text, opts) {
  const m = text.match(CORRECTION_RE);
  if (!m || !opts.lastQuery) return null;
  const relation = detectRelation(String(opts.lastQuery));
  if (!relation) return null;
  const entity = cleanEntity(m[2]);
  const resolved = entity ? await resolveValue(relation, entity) : null;
  if (!resolved) return null;
  return craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts.richness);
}

async function tryMultiHopCapital(text, opts) {
  const m = text.match(/^(.+?)\s+negara\s+yang\s+ibukota\s*nya\s+(.+)$/i);
  if (!m) return null;
  const capital = cleanEntity(m[2]);
  if (!capital) return null;
  const list = await dataries.loadAll('country');
  const countryItem = list.find((it) => it.metadata.capital && fuzzyEq(it.metadata.capital.toLowerCase(), capital));
  if (!countryItem) return null;
  const rewritten = m[1].trim() + ' ' + countryItem.metadata.name;
  return (await extras(rewritten)) || (await factoid(rewritten, opts));
}

function splitPossessiveSuffix(text) {
  return String(text || '').replace(/([a-zA-Z]{3,}?)nya\b/gi, '$1 nya');
}

async function factoid(q, options) {
  const text = splitPossessiveSuffix(String(q || '').trim());
  if (!text) return null;
  const opts = options || {};

  const corrected = await tryCorrection(text, opts);
  if (corrected) return corrected;

  const multiHop = await tryMultiHopCapital(text, opts);
  if (multiHop) return multiHop;

  const aboutMatch = text.match(
    /^(apa\s+yang\s+kamu\s+ketahui\s+tentang|ceritakan\s+tentang|cerita\s+(soal|tentang)|tentang|info)\s+(negara|kota)?\s*(.+)$/i
  );
  if (aboutMatch) {
    const entity = aboutMatch[4].replace(/\?+$/, '').trim().toLowerCase();
    const item = (await lookupInGroup('country', entity)) || (await lookupInGroup('cities', entity));
    return item && item.text ? summarizeItem(item, opts.richness) : null;
  }

  const relation = detectRelation(text);
  if (!relation) return null;

  const entityRaw = extractEntity(text, relation);
  const parts = splitCompoundEntities(entityRaw);
  if (parts.length > 1) {
    const resolvedList = [];
    for (const p of parts) {
      const r = await resolveValue(relation, p);
      if (r) resolvedList.push(r);
    }
    if (resolvedList.length > 1) {
      return resolvedList.map((r) => '- ' + capitalize(r.label) + ': ' + r.value).join('\n');
    }
  }

  let resolved = null;
  if (entityRaw) {
    resolved = await resolveValue(relation, entityRaw);
    if (!resolved) return null;
  } else {
    const fallbackEntity = opts.lastEntity || opts.lastTopic;
    if (fallbackEntity) resolved = await resolveValue(relation, String(fallbackEntity).toLowerCase().trim());
  }
  if (!resolved) return null;

  return craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts.richness);
}

function cleanEntity(raw) {
  return String(raw || '')
    .replace(/\?+$/, '')
    .replace(/\b(negara|dari|di|nya|adalah|itu)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function fuzzyEq(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  return a.includes(b) || b.includes(a);
}

async function findLanguageByCountry(entity) {
  if (!entity) return null;
  const byName = await findInList('languages', (it) => fuzzyEq((it.metadata.name || '').toLowerCase(), entity) || fuzzyEq((it.metadata.nativeName || '').toLowerCase(), entity));
  if (byName) return byName;
  const regions = dataries.findRegionsByName('languages', entity);
  for (const region of regions) {
    const list = await dataries.loadRegion('languages', region.id);
    if (!list) continue;
    const item = list.find((it) => (it.metadata.officialIn || []).some((c) => fuzzyEq(c.toLowerCase(), entity)));
    if (item) return item;
  }
  return await findInList('languages', (it) => (it.metadata.officialIn || []).some((c) => fuzzyEq(c.toLowerCase(), entity)));
}

async function findInList(group, predicate) {
  const list = await dataries.loadAll(group);
  return list.find(predicate) || null;
}

async function findAllInList(group, predicate, limit) {
  const list = await dataries.loadAll(group);
  return list.filter(predicate).slice(0, limit || 3);
}

async function tryPenuturBahasa(text) {
  const m = text.match(/penutur\s+bahasa\s+(.+)/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  const item = await findLanguageByCountry(entity);
  if (!item) return null;
  return item.metadata.name + ' memiliki sekitar ' + item.metadata.speakers + ' penutur.';
}

async function tryGreetingBahasa(text) {
  const m = text.match(/(halo|hai|terima\s*kasih|sapaan|cara\s+menyapa(?:\s+di)?|ucapkan\s+selamat\s+pagi)\s+(?:dalam\s+)?bahasa\s+(.+)/i);
  if (!m) return null;
  const kind = m[1].toLowerCase();
  const entity = cleanEntity(m[2]);
  if (!entity) return null;
  const item = await findLanguageByCountry(entity);
  if (!item || !item.metadata.greetings) return null;
  const g = item.metadata.greetings;
  if (/terima\s*kasih/.test(kind)) return 'Terima kasih dalam bahasa ' + item.metadata.name + ' adalah "' + g.terimakasih + '".';
  if (/ucapkan\s+selamat\s+pagi/.test(kind)) return 'Selamat pagi dalam bahasa ' + item.metadata.name + ' adalah "' + g.pagi + '".';
  if (/sapaan|cara\s+menyapa/.test(kind)) {
    return 'Sapaan dalam bahasa ' + item.metadata.name + ': halo "' + g.halo + '", selamat pagi "' + g.pagi + '".';
  }
  return 'Sapaan dalam bahasa ' + item.metadata.name + ' adalah "' + g.halo + '".';
}

async function tryBahasaDi(text) {
  const m = text.match(/^(apa\s+bahasa\s+di|bahasa\s+apa\s+di|bahasa)\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[2]);
  if (!entity) return null;
  const item = await findLanguageByCountry(entity);
  if (!item) return null;
  return 'Bahasa di ' + capitalize(entity) + ' adalah ' + item.metadata.name + '.';
}

async function tryKotaTerkenal(text) {
  const m = text.match(/^kota\s+(.+?)\s+terkenal\s+apa$/i) || text.match(/^tentang\s+kota\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const item = await findInList('cities', (it) => it.metadata.type === 'city' && it.metadata.name && it.metadata.name.toLowerCase() === entity);
  if (!item) return null;
  return item.text;
}

async function tryWisataDi(text) {
  const m = text.match(/^(?:tempat\s+)?wisata\s+di\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const items = await findAllInList('wisata', (it) => it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  return 'Tempat wisata terkenal di ' + capitalize(entity) + ':\n' + items.map((it) => '- ' + it.metadata.name + ' (' + it.metadata.city + ')').join('\n');
}

function wordOverlap(entity, hay) {
  if (!entity || !hay) return false;
  if (hay.includes(entity) || entity.includes(hay)) return true;
  const entityWords = entity.split(' ').filter((w) => w.length > 2);
  return entityWords.some((w) => hay.includes(w));
}

function matchScore(entity, hay) {
  if (!entity || !hay) return 0;
  if (hay === entity) return 100;
  if (hay.includes(entity)) return 50;
  const entityWords = entity.split(' ').filter((w) => w.length > 2);
  if (!entityWords.length) return 0;
  const matched = entityWords.filter((w) => hay.includes(w)).length;
  if (!matched) return 0;
  return matched === entityWords.length ? 20 + matched : matched;
}

async function findBestInList(group, entity, haystacksFn) {
  const list = await dataries.loadAll(group);
  let best = null;
  let bestScore = 0;
  list.forEach((item) => {
    const haystacks = haystacksFn(item).filter(Boolean).map((h) => String(h).toLowerCase());
    const combined = haystacks.join(' ');
    const score = Math.max(matchScore(entity, combined), ...haystacks.map((h) => matchScore(entity, h)));
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  });
  return bestScore > 0 ? best : null;
}

async function trySiapaTokoh(text) {
  const m = text.match(/^siapa\s+(?:penemu\s+|pelukis\s+|penulis\s+|pencipta\s+)?(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const tokohItem = await findBestInList('tokoh', entity, (it) => [it.metadata.knownFor, it.metadata.name]);
  if (tokohItem) return tokohItem.text;
  const penemuanItem = await findBestInList('penemuan', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (penemuanItem) return penemuanItem.text;
  return null;
}

async function tryTopicSearch(text) {
  const m = text.match(/^(?:apa\s+itu|jelaskan)\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  for (const group of ['sains', 'olahraga']) {
    const item = await findBestInList(group, entity, (it) => [it.metadata.topic, ...(it.metadata.tags || [])]);
    if (item) return item.text;
  }
  return null;
}

const COUNTRY_ALIASES = {
  amerika: 'amerika serikat',
  usa: 'amerika serikat',
  us: 'amerika serikat',
  korea: 'korea selatan',
  inggris: 'inggris',
  jepang: 'jepang',
  brazil: 'brasil',
  england: 'inggris',
  'new zealand': 'selandia baru',
};

function resolveCountryAlias(entity) {
  return COUNTRY_ALIASES[entity] || entity;
}

const MAKANAN_OPENERS = [
  'Ini beberapa makanan khas',
  'Kalau soal kuliner',
  'Rekomendasi makanan dari',
];

async function tryMakananKhas(text) {
  const m = text.match(/^(?:apa\s+)?(makanan|kuliner|masakan)\s+(khas|favorit|terkenal|enak|populer)\s+(?:(?:di|dari)\s+)?(.+)$/i);
  if (!m) return null;
  const entity = resolveCountryAlias(cleanEntity(m[3]));
  if (!entity) return null;
  const items = await findAllInList('makanan', (it) => it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  const opener = pickVariant('makanan_opener', MAKANAN_OPENERS, text);
  return opener + ' ' + capitalize(entity) + ':\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
}

async function trySejarah(text) {
  const m = text.match(/^sejarah\s+(.+)$/i) || text.match(/^kapan\s+(.+?)\s+(?:dibangun|terjadi|dimulai)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const item = await findBestInList('sejarah', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function tryAlam(text) {
  const m = text.match(/^(?:hewan|fauna)\s+khas\s+(.+)$/i) || text.match(/^flora\s+(.+)$/i);
  if (!m) return null;
  const entity = resolveCountryAlias(cleanEntity(m[1]));
  if (!entity) return null;
  const items = await findAllInList('alam', (it) => wordOverlap(entity, (it.metadata.habitat || '').toLowerCase()), 3);
  if (!items.length) return null;
  return 'Fauna/flora khas ' + capitalize(entity) + ':\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
}

async function tryPenemuan(text) {
  const m = text.match(/^penemuan\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const item = await findBestInList('penemuan', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function trySeniBudaya(text) {
  const m = text.match(/^(budaya|tari|festival)\s+(?:khas\s+)?(.+)$/i);
  if (!m) return null;
  const entity = resolveCountryAlias(cleanEntity(m[2]));
  if (!entity) return null;
  const items = await findAllInList(
    'seni-budaya',
    (it) => (it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity)) || wordOverlap(entity, (it.metadata.tags || []).join(' ').toLowerCase()),
    3
  );
  if (!items.length) return null;
  return 'Seni budaya khas ' + capitalize(entity) + ':\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
}

async function tryEkonomi(text) {
  const m = text.match(/^ekonomi\s+(.+)$/i) || text.match(/^ekspor\s+(?:utama\s+)?(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const item = await findBestInList('ekonomi', entity, (it) => [it.metadata.name, it.metadata.value, ...(it.metadata.tags || [])]);
  if (!item) return null;
  return item.text;
}

async function extras(q) {
  const text = String(q || '').trim();
  if (!text) return null;

  const penutur = await tryPenuturBahasa(text);
  if (penutur) return penutur;

  const greeting = await tryGreetingBahasa(text);
  if (greeting) return greeting;

  const kotaTerkenal = await tryKotaTerkenal(text);
  if (kotaTerkenal) return kotaTerkenal;

  const wisata = await tryWisataDi(text);
  if (wisata) return wisata;

  const makanan = await tryMakananKhas(text);
  if (makanan) return makanan;

  const bahasa = await tryBahasaDi(text);
  if (bahasa) return bahasa;

  const tokoh = await trySiapaTokoh(text);
  if (tokoh) return tokoh;

  const sejarah = await trySejarah(text);
  if (sejarah) return sejarah;

  const alam = await tryAlam(text);
  if (alam) return alam;

  const penemuan = await tryPenemuan(text);
  if (penemuan) return penemuan;

  const seniBudaya = await trySeniBudaya(text);
  if (seniBudaya) return seniBudaya;

  const ekonomi = await tryEkonomi(text);
  if (ekonomi) return ekonomi;

  const topic = await tryTopicSearch(text);
  if (topic) return topic;

  return null;
}

async function search(q) {
  const text = String(q || '').toLowerCase().trim();
  if (!text) return null;
  const matches = detectEntityRegions(text);
  if (!matches.length) return null;
  const seen = new Set();
  const corpus = [];
  for (const m of matches) {
    const key = m.group + '/' + m.region.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const list = await dataries.loadRegion(m.group, m.region.id);
    if (!list) continue;
    list.forEach((item) => {
      const tags = (item.metadata && item.metadata.tags) || [];
      corpus.push({ item, text: item.text + ' ' + tags.join(' ') });
    });
  }
  const found = retrieval.best(text, corpus, { threshold: retrieval.LIST_THRESHOLD });
  return found ? found.item.item : null;
}

const DATARIES_FALLBACK_THRESHOLD = 0.3;

async function countryFallback(query) {
  const countries = await dataries.loadAll('country');
  const corpus = countries.map((item) => ({ item, text: item.text || '' }));
  const ranked = retrieval.rank(query, corpus, { threshold: DATARIES_FALLBACK_THRESHOLD, limit: 2 });
  return ranked.map((r) => ({ type: 'dataries', text: r.item.text, score: r.score }));
}

export const datariesBridge = Object.freeze({
  search,
  factoid,
  extras,
  extractKnownEntity,
  countryFallback,
});
