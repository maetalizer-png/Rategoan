import { REGIONS, dataries } from '../dataries/index.js';

const STOPWORDS = new Set([
  'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka',
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
  'ini', 'itu', 'ada', 'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'kenapa', 'bagaimana', 'berapa',
  'saja', 'juga', 'akan', 'sudah', 'belum', 'tidak', 'bukan', 'ya', 'ga', 'gak',
]);

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

const variantTurns = new Map();
const variantLast = new Map();

function hashText(text) {
  let h = 0;
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function pickVariant(intent, templates, text) {
  if (templates.length === 1) return templates[0];
  const base = (variantTurns.get(intent) || 0) + hashText(text);
  let idx = base % templates.length;
  if (variantLast.get(intent) === idx) idx = (idx + 1) % templates.length;
  variantTurns.set(intent, (variantTurns.get(intent) || 0) + 1);
  variantLast.set(intent, idx);
  return templates[idx];
}

function meaningfulWords(text) {
  return String(text || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

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
  return String(num);
}

function formatIndependence(dateStr) {
  const m = String(dateStr || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return String(dateStr);
  const month = MONTHS_ID[parseInt(m[2], 10) - 1] || m[2];
  return m[1] + ' (' + parseInt(m[3], 10) + ' ' + month + ')';
}

function formatLanguages(languages) {
  if (!Array.isArray(languages)) return String(languages || '');
  const official = languages.filter((l) => l && l.official).map((l) => l.name);
  return (official.length ? official : languages.map((l) => l.name)).join(' dan ');
}

function formatValue(field, raw) {
  if (field === 'population') return formatCount(raw) + ' jiwa';
  if (field === 'area') return formatCount(raw) + ' km²';
  if (field === 'independenceDay') return formatIndependence(raw);
  if (field === 'languages') return formatLanguages(raw);
  return String(raw);
}

function hasKeyword(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
}

function detectRelation(text) {
  const t = text.toLowerCase();
  for (const rel of RELATIONS) {
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
  return t;
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

function craftAnswer(field, label, value) {
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
  const variants = [base, value + ', setahu saya.', 'Setahu saya, ' + base.charAt(0).toLowerCase() + base.slice(1)];
  return pickVariant('dataries_' + field, variants, label + value);
}

async function resolveValue(relation, entity) {
  if (!entity) return null;
  const countryItem = await lookupInGroup('country', entity);
  if (countryItem) {
    for (const f of relation.fields) {
      if (countryItem.metadata[f] != null) {
        return { value: formatValue(f, countryItem.metadata[f]), field: f, label: countryItem.metadata.name };
      }
    }
  }
  const cityItem = await lookupInGroup('cities', entity);
  if (cityItem) {
    for (const f of relation.fields) {
      if (cityItem.metadata[f] != null) {
        return { value: formatValue(f, cityItem.metadata[f]), field: f, label: cityItem.metadata.name };
      }
    }
  }
  if (relation.fields.includes('capital') || relation.fields.includes('kabupaten')) {
    const prov = await findProvince(entity);
    if (prov) {
      const f = relation.fields.includes('kabupaten') ? 'kabupaten' : 'capital';
      const raw = prov.province[f];
      if (raw != null) return { value: formatValue(f, raw), field: f, label: capitalize(entity) };
    }
  }
  return null;
}

async function factoid(q, options) {
  const text = String(q || '').trim();
  if (!text) return null;
  const opts = options || {};

  const aboutMatch = text.match(/^(ceritakan\s+tentang|cerita\s+(soal|tentang))\s+(.+)$/i);
  if (aboutMatch) {
    const entity = aboutMatch[3].replace(/\?+$/, '').trim().toLowerCase();
    const item = (await lookupInGroup('country', entity)) || (await lookupInGroup('cities', entity));
    return item && item.text ? item.text : null;
  }

  const relation = detectRelation(text);
  if (!relation) return null;

  const entity = extractEntity(text, relation);
  let resolved = entity ? await resolveValue(relation, entity) : null;
  if (!resolved && opts.lastTopic) {
    resolved = await resolveValue(relation, String(opts.lastTopic).toLowerCase().trim());
  }
  if (!resolved) return null;

  return craftAnswer(resolved.field, resolved.label, resolved.value);
}

async function search(q) {
  const text = String(q || '').toLowerCase().trim();
  if (!text) return null;
  const matches = detectEntityRegions(text);
  if (!matches.length) return null;
  const words = meaningfulWords(text);
  const seen = new Set();
  let best = null;
  let bestScore = 0;
  for (const m of matches) {
    const key = m.group + '/' + m.region.id;
    if (seen.has(key)) continue;
    seen.add(key);
    const list = await dataries.loadRegion(m.group, m.region.id);
    if (!list) continue;
    list.forEach((item) => {
      const tags = (item.metadata && item.metadata.tags) || [];
      const hay = (item.text + ' ' + tags.join(' ')).toLowerCase();
      const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
      if (score > bestScore) {
        bestScore = score;
        best = item;
      }
    });
  }
  return bestScore > 0 ? best : null;
}

export const datariesBridge = Object.freeze({
  search,
  factoid,
});
