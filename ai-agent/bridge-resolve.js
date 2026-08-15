import { REGIONS, dataries } from '../dataries/index.js';

const FILLER_WORDS_RE = /\b(negara|wilayah|daerah|dari|di|nya|adalah|itu|dong|sih|ya|tuh|nih|deh|kok)\b/g;

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

function capitalize(s) {
  return String(s || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function hasKeyword(text, phrase) {
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp('\\b' + escaped + '\\b', 'i').test(text);
}

function stripTrailingApa(t) {
  return t.replace(/\s+apa\s*\??\s*$/i, '');
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

function fuzzyEq(a, b) {
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  return a.includes(b) || b.includes(a);
}

async function findInList(group, predicate) {
  const list = await dataries.loadAll(group);
  return list.find(predicate) || null;
}

async function findAllInList(group, predicate, limit) {
  const list = await dataries.loadAll(group);
  return list.filter(predicate).slice(0, limit || 3);
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

function splitCompoundEntities(entityText) {
  return String(entityText || '')
    .split(/\s+dan\s+|\s*&\s*|\s*,\s*/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitPossessiveSuffix(text) {
  return String(text || '').replace(/([a-zA-Z]{3,}?)nya\b/gi, '$1 nya');
}

export const bridgeResolve = Object.freeze({
  capitalize,
  hasKeyword,
  cleanEntity,
  extractEntity,
  detectEntityRegions,
  extractKnownEntity,
  lookupInGroup,
  findProvince,
  fuzzyEq,
  findInList,
  findAllInList,
  wordOverlap,
  findBestInList,
  findLanguageByCountry,
  resolveCountryAlias,
  splitCompoundEntities,
  splitPossessiveSuffix,
});
