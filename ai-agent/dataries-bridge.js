import { REGIONS, dataries } from '../dataries/index.js';
import { pickVariant } from '../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { memoryContext } from '../raget-memory/memory-context.js';

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

const RELATIONS = [
  { keys: ['kota terbesar'], fields: ['largestCity'] },
  { keys: ['ibukota', 'ibu kota'], fields: ['capital'] },
  { keys: ['jumlah provinsi', 'berapa provinsi', 'provinsi'], fields: ['administrativeDivisions', 'totalProvinces'] },
  { keys: ['kabupaten'], fields: ['kabupaten'] },
  { keys: ['kota'], fields: ['totalCities'] },
  { keys: ['populasi', 'penduduk', 'pendudukan'], fields: ['population'] },
  { keys: ['mata uang'], fields: ['currency'] },
  { keys: ['bahasa'], fields: ['languages'] },
  { keys: ['pemerintahan'], fields: ['governmentType'] },
  { keys: ['merdeka', 'kemerdekaan'], fields: ['independenceDay'] },
  { keys: ['luas'], fields: ['area'] },
  { keys: ['kode telepon', 'kode telpon'], fields: ['phoneCode'] },
];

const FACTOID_OPENERS = [
  '', 'Setahu saya, ', 'Sepengetahuan saya, ', 'Kalau data saya benar, ', 'Berdasarkan catatan saya, ', 'Kalau tidak salah, ',
  'Setahu saya sih, ', 'Kalau nggak salah ingat, ', 'Dari yang saya tahu, ',
];

const REGION_LABELS = {
  'african-barat': 'Afrika Barat',
  'african-selatan': 'Afrika Selatan',
  'african-tengah': 'Afrika Tengah',
  'african-timur': 'Afrika Timur',
  'african-utara': 'Afrika Utara',
  'american-karibia': 'Karibia',
  'american-selatan': 'Amerika Selatan',
  'american-tengah': 'Amerika Tengah',
  'american-utara': 'Amerika Utara',
  'asian-barat': 'Asia Barat',
  'asian-selatan': 'Asia Selatan',
  'asian-tengah': 'Asia Tengah',
  'asian-tenggara': 'Asia Tenggara',
  'asian-timur': 'Asia Timur',
  'eropan-barat': 'Eropa Barat',
  'eropan-selatan': 'Eropa Selatan',
  'eropan-tengah': 'Eropa Tengah',
  'eropan-timur': 'Eropa Timur',
  'eropan-utara': 'Eropa Utara',
  osenian: 'Oseania',
};

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

const FILLER_WORDS_RE = /\b(negara|wilayah|daerah|dari|di|nya|adalah|itu|dong|sih|ya|tuh|nih|deh|kok)\b/g;

function stripTrailingApa(t) {
  return t.replace(/\s+apa\s*\??\s*$/i, '');
}

function extractEntity(text, relation) {
  let t = text.toLowerCase();
  relation.keys.forEach((k) => {
    const escaped = k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    t = t.replace(new RegExp('\\b' + escaped + '\\b', 'i'), ' ');
  });
  t = t
    .replace(/^(apa|berapa|siapa|kapan|dimana|di\s*mana)\s+/i, '')
    .replace(FILLER_WORDS_RE, ' ')
    .replace(/\?+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  t = stripTrailingApa(t).trim();
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
  if (name === entity) return true;
  if (name.length < 3 || entity.length < 3) return false;
  return entity.includes(name) || name.includes(entity);
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
const RICHNESS_MODES = ['trivia', 'trivia', 'plain', 'trivia'];
const CROSSREF_MODES = ['yes', 'yes', 'no'];
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

function daysUntilAnniversary(dateStr, now) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  const month = parseInt(m[2], 10);
  const day = parseInt(m[3], 10);
  if (!month || !day) return null;
  const today = now || new Date();
  const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let next = new Date(today.getFullYear(), month - 1, day);
  if (next < todayMid) next = new Date(today.getFullYear() + 1, month - 1, day);
  const diffDays = Math.round((next - todayMid) / 86400000);
  return { days: diffDays, date: next };
}

async function daysUntilIndependence(entity) {
  const item = await lookupInGroup('country', resolveCountryAlias(String(entity || '').toLowerCase().trim()));
  if (!item || !item.metadata.independenceDay) return null;
  const result = daysUntilAnniversary(item.metadata.independenceDay);
  if (!result) return null;
  const dateLabel = result.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  const name = item.metadata.name;
  if (result.days === 0) return name + ' merdeka hari ini! (' + dateLabel + ')';
  return result.days + ' hari lagi (' + name + ' merdeka ' + dateLabel + ').';
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

  const anafora = await tryAnaforaLuas(text, opts);
  if (anafora) return anafora;

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

  memoryContext.setRelation(resolved.field);
  return craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts.richness);
}

const ANAFORA_LUAS_RE = /kalau\s+yang\s+itu|terus\s+yang\s+satunya|bagaimana\s+dengan\s+yang\s+satunya|yang\s+satunya\s+lagi/i;

async function tryAnaforaLuas(text, opts) {
  if (!ANAFORA_LUAS_RE.test(text)) return null;
  const field = memoryContext.getRelation();
  if (!field) return null;
  const stack = memoryContext.getStack();
  const entity = stack[1];
  if (!entity) return null;
  const resolved = await resolveValue({ fields: [field] }, entity);
  if (!resolved) return null;
  return craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts && opts.richness);
}

function cleanEntity(raw) {
  const cleaned = String(raw || '')
    .toLowerCase()
    .replace(/\?+$/, '')
    .replace(FILLER_WORDS_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return stripTrailingApa(cleaned).trim();
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

async function tryLetakGeografis(text) {
  const m =
    text.match(/^(.+?)\s+terletak\s+di\s*mana\??$/i) ||
    text.match(/^di\s*mana\s+letak\s+(.+?)\??$/i) ||
    text.match(/^letak\s+geografis\s+(.+?)\??$/i);
  if (!m) return null;
  const entity = resolveCountryAlias(cleanEntity(m[1]));
  if (!entity) return null;
  const item = await lookupInGroup('country', entity);
  if (!item || !item.metadata.region) return null;
  const label = REGION_LABELS[item.metadata.region] || item.metadata.region;
  const base = item.metadata.name + ' terletak di ' + label + '.';
  const opener = pickVariant('letak_opener', FACTOID_OPENERS, item.metadata.name + label);
  return opener ? opener + base.charAt(0).toLowerCase() + base.slice(1) : base;
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
  const m = text.match(/^(?:tempat\s+)?wisata\s+(?:paling\s+)?(?:terkenal\s+|populer\s+|favorit\s+)?di\s+(.+)$/i);
  if (!m) return null;
  const entity = cleanEntity(m[1]);
  if (!entity) return null;
  const items = await findAllInList('wisata', (it) => it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  return 'Tempat wisata terkenal di ' + capitalize(entity) + '.\n' + items.map((it) => '- ' + it.metadata.name + ' (' + it.metadata.city + ')').join('\n');
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
  const sejarahItem = await findBestInList('sejarah', entity, (it) => [it.metadata.name, ...(it.metadata.tags || [])]);
  if (sejarahItem) return sejarahItem.text;
  return null;
}

const COUNTRY_ALIASES = {
  amerika: 'amerika serikat',
  usa: 'amerika serikat',
  us: 'amerika serikat',
  as: 'amerika serikat',
  amrik: 'amerika serikat',
  korea: 'korea selatan',
  korsel: 'korea selatan',
  inggris: 'inggris',
  uk: 'inggris',
  britania: 'inggris',
  'britania raya': 'inggris',
  jepang: 'jepang',
  brazil: 'brasil',
  england: 'inggris',
  'new zealand': 'selandia baru',
  rrc: 'china',
  tiongkok: 'china',
  russia: 'rusia',
  perancis: 'prancis',
  italy: 'italia',
  itali: 'italia',
  espana: 'spanyol',
  german: 'jerman',
  deutschland: 'jerman',
  holland: 'belanda',
  nippon: 'jepang',
  saudi: 'arab saudi',
  ksa: 'arab saudi',
  uae: 'uni emirat arab',
  emirat: 'uni emirat arab',
  hongkong: 'hong kong',
  viet: 'vietnam',
  pinas: 'filipina',
  burma: 'myanmar',
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
  return opener + ' ' + capitalize(entity) + '.\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
}

const MINUMAN_OPENERS = [
  'Ini beberapa minuman khas',
  'Kalau soal minuman',
  'Rekomendasi minuman dari',
];

async function tryMinumanKhas(text) {
  const m = text.match(/^(?:apa\s+)?minuman\s+(khas|favorit|terkenal|enak|populer)\s+(?:(?:di|dari)\s+)?(.+)$/i);
  if (!m) return null;
  const entity = resolveCountryAlias(cleanEntity(m[2]));
  if (!entity) return null;
  const items = await findAllInList('minuman', (it) => it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity), 3);
  if (!items.length) return null;
  const opener = pickVariant('minuman_opener', MINUMAN_OPENERS, text);
  return opener + ' ' + capitalize(entity) + '.\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
}

async function tryEtika(text) {
  const m =
    text.match(/^etika\s+(?:di\s+|budaya\s+)?(.+)$/i) ||
    text.match(/^tabu\s+(?:di\s+|budaya\s+)?(.+)$/i) ||
    text.match(/^tip\s+(?:budaya\s+)?di\s+(.+)$/i) ||
    text.match(/^sopan\s+santun\s+(?:di\s+)?(.+)$/i);
  if (!m) return null;
  const isTabu = /^tabu/i.test(text);
  const isTip = /^tip/i.test(text);
  const entity = resolveCountryAlias(cleanEntity(m[1]));
  if (!entity) return null;
  const items = await findAllInList('etika', (it) => it.metadata.country && fuzzyEq(it.metadata.country.toLowerCase(), entity), 6);
  if (!items.length) return null;
  const filtered = isTabu ? items.filter((it) => it.metadata.type === 'tabu') : isTip ? items.filter((it) => it.metadata.type === 'tip') : items;
  const list = (filtered.length ? filtered : items).slice(0, 3);
  const label = isTabu ? 'Tabu' : isTip ? 'Kebiasaan tip' : 'Etika';
  return label + ' di ' + capitalize(entity) + ':\n' + list.map((it) => '- ' + it.text).join('\n');
}

async function trySejarah(text) {
  const m = text.match(/^sejarah\s+(.+)$/i) || text.match(/^kapan\s+(.+?)\s+(?:dibangun|terjadi|dimulai|diikrarkan|didirikan|dibacakan|diselenggarakan)$/i);
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
  return 'Fauna/flora khas ' + capitalize(entity) + '.\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
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
  return 'Seni budaya khas ' + capitalize(entity) + '.\n' + items.map((it) => '- ' + it.metadata.name).join('\n');
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

const SUPERLATIF_FIELDS = { populasi: 'population', penduduk: 'population', luas: 'area', wilayah: 'area' };
const SUPERLATIF_DESC_RE = /terbesar|terbanyak|terluas|terpadat/i;

async function trySuperlatif(text) {
  const m = text.match(/negara\s+(?:dengan\s+)?(populasi|penduduk|luas|wilayah)\s+(terbesar|terbanyak|terluas|terkecil|tersempit|terpadat)/i);
  if (!m) return null;
  const field = SUPERLATIF_FIELDS[m[1].toLowerCase()];
  const desc = SUPERLATIF_DESC_RE.test(m[2]);
  const countries = await dataries.loadAll('country');
  const valid = countries.filter((c) => c.metadata[field] != null);
  if (!valid.length) return null;
  valid.sort((a, b) => (desc ? b.metadata[field] - a.metadata[field] : a.metadata[field] - b.metadata[field]));
  const top3 = valid.slice(0, 3);
  const label = field === 'population' ? 'populasi' : 'luas';
  return 'Top 3 negara dengan ' + label + ' ' + m[2] + ':\n' +
    top3.map((c, i) => (i + 1) + '. ' + c.metadata.name + ' — ' + formatValue(field, c.metadata[field])).join('\n');
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
  return 'Total ' + label.toLowerCase() + ' ' + capitalize(continentKey) + ' sekitar ' + formatValue(field, total) + ' (dari ' + matched.length + ' negara).';
}

async function tryReverseLookup(text) {
  const currencyM = text.match(/negara\s+(?:yang\s+)?mata\s*uangnya\s+(.+?)\??$/i);
  const langM = text.match(/negara\s+(?:yang\s+)?bahasanya\s+(.+?)\??$/i);
  const capitalM = text.match(/ibukota(?:nya)?\s+(.+?)\s+(?:itu\s+)?negara\s+(?:apa|mana)\??$/i)
    || text.match(/negara\s+apa\s+yang\s+ibukotanya\s+(.+?)\??$/i);
  const currencyNameM = text.match(/mata\s*uang\s+(.+?)\s+itu\s+punya\s+negara\s+(?:apa|mana)\??$/i);
  if (!currencyM && !langM && !capitalM && !currencyNameM) return null;
  const countries = await dataries.loadAll('country');
  if (currencyM) {
    const q = cleanEntity(currencyM[1]);
    if (!q) return null;
    const matches = countries.filter((c) => (c.metadata.currency || '').toLowerCase().includes(q));
    if (!matches.length) return null;
    return 'Negara dengan mata uang ' + capitalize(q) + ': ' + matches.slice(0, 3).map((c) => c.metadata.name).join(', ') + '.';
  }
  if (langM) {
    const q = cleanEntity(langM[1]);
    if (!q) return null;
    const matches = countries.filter((c) => (c.metadata.languages || []).some((l) => (l.name || '').toLowerCase().includes(q)));
    if (!matches.length) return null;
    return 'Negara berbahasa ' + capitalize(q) + ': ' + matches.slice(0, 3).map((c) => c.metadata.name).join(', ') + '.';
  }
  if (capitalM) {
    const q = cleanEntity(capitalM[1]);
    if (!q) return null;
    const match = countries.find((c) => (c.metadata.capital || '').toLowerCase() === q || (c.metadata.capital || '').toLowerCase().includes(q));
    if (!match) return null;
    return 'Negara dengan ibukota ' + capitalize(q) + ' adalah ' + match.metadata.name + '.';
  }
  const q = cleanEntity(currencyNameM[1]);
  if (!q) return null;
  const match = countries.find((c) => (c.metadata.currency || '').toLowerCase() === q);
  if (!match) return null;
  return 'Mata uang ' + capitalize(q) + ' digunakan oleh negara ' + match.metadata.name + '.';
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
  const monthIdx = MONTHS_ID.findIndex((mo) => mo.toLowerCase() === monthStr.toLowerCase());
  if (monthIdx < 0 || !day) return null;
  return new Date(year, monthIdx, day);
}

function formatIndoDateFull(d) {
  return d.getDate() + ' ' + MONTHS_ID[d.getMonth()] + ' ' + d.getFullYear();
}

async function tryPenalaranTanggal(text) {
  const rangeM = text.match(/berapa\s+hari\s+dari\s+(\d{1,2})\s+([a-zA-Z]+)\s+ke\s+(\d{1,2})\s+([a-zA-Z]+)/i);
  if (rangeM) {
    const now = new Date();
    const d1 = parseIndoDate(rangeM[1], rangeM[2], now.getFullYear());
    const d2 = parseIndoDate(rangeM[3], rangeM[4], now.getFullYear());
    if (!d1 || !d2) return null;
    const days = Math.round((d2 - d1) / 86400000);
    return 'Dari ' + rangeM[1] + ' ' + capitalize(rangeM[2]) + ' ke ' + rangeM[3] + ' ' + capitalize(rangeM[4]) + ' ada ' + Math.abs(days) + ' hari.';
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

async function extras(q) {
  const text = String(q || '').trim();
  if (!text) return null;

  const superlatif = await trySuperlatif(text);
  if (superlatif) return superlatif;

  const agregasi = await tryAgregasi(text);
  if (agregasi) return agregasi;

  const reverseLookup = await tryReverseLookup(text);
  if (reverseLookup) return reverseLookup;

  const konversiSatuan = await tryKonversiSatuan(text);
  if (konversiSatuan) return konversiSatuan;

  const konversiMataUang = await tryKonversiMataUang(text);
  if (konversiMataUang) return konversiMataUang;

  const penalaranTanggal = await tryPenalaranTanggal(text);
  if (penalaranTanggal) return penalaranTanggal;

  const letak = await tryLetakGeografis(text);
  if (letak) return letak;

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

  const minuman = await tryMinumanKhas(text);
  if (minuman) return minuman;

  const etika = await tryEtika(text);
  if (etika) return etika;

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
const DATARIES_FALLBACK_GROUPS = ['country', 'sains', 'olahraga'];

async function datariesFallback(query) {
  const results = [];
  for (const group of DATARIES_FALLBACK_GROUPS) {
    const list = await dataries.loadAll(group);
    const corpus = list.map((item) => ({ item, text: item.text || '' }));
    const ranked = retrieval.rank(query, corpus, { threshold: DATARIES_FALLBACK_THRESHOLD, limit: 2 });
    ranked.forEach((r) => results.push({ type: 'dataries', text: r.item.text, score: r.score }));
  }
  return results.sort((a, b) => b.score - a.score).slice(0, 2);
}

export const datariesBridge = Object.freeze({
  search,
  factoid,
  extras,
  extractKnownEntity,
  datariesFallback,
  daysUntilIndependence,
});
