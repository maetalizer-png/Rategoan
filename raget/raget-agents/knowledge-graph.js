import { bridgeResolve } from './bridge-resolve.js';
import { memoryContext } from '../raget-memory/memory-context.js';
import { bilingual } from './bilingual.js';
import { hashText } from '../../utils/text.js';

const CONTINENT_LABEL = { african: 'Afrika', american: 'Amerika', asian: 'Asia', eropan: 'Eropa', osenian: 'Oseania' };

function continentOf(region) {
  const prefix = String(region || '').split('-')[0];
  return CONTINENT_LABEL[prefix] || null;
}

function toEntity(item) {
  const m = item.metadata;
  return {
    kind: 'country',
    nama: m.name,
    en: bilingual.toEnglishCountryName(m.name),
    ibukota: m.capital || null,
    ibukotaEn: m.capital ? bilingual.toEnglishCapitalName(m.capital) : null,
    populasi: m.population != null ? m.population : null,
    matauang: m.currency || null,
    matauangKode: m.currencyCode || null,
    bahasa: (m.languages || []).map((l) => (typeof l === 'string' ? l : l.name)).filter(Boolean),
    benua: continentOf(m.region),
    luas: m.area != null ? m.area : null,
    trivia: item.text,
    item,
  };
}

async function resolveEntity(query) {
  const q = bridgeResolve.resolveCountryAlias(bridgeResolve.cleanEntity(String(query || '')));
  if (!q) return null;
  const item = await bridgeResolve.lookupInGroup('country', q);
  return item ? toEntity(item) : null;
}

async function resolveWithContext(query) {
  const direct = await resolveEntity(query);
  if (direct) {
    memoryContext.pushEntity(direct.nama);
    return direct;
  }
  const top = memoryContext.topEntity();
  if (!top) return null;
  return await resolveEntity(top);
}

function fmtPopulasi(n) {
  const num = Number(n);
  if (!isFinite(num)) return String(n);
  if (num >= 1e6) {
    const millions = num / 1e6;
    return (Number.isInteger(millions) ? millions : millions.toFixed(1)) + ' juta jiwa';
  }
  return num.toLocaleString('id-ID') + ' jiwa';
}

function fmtLuas(n) {
  const num = Number(n);
  return isFinite(num) ? num.toLocaleString('id-ID') + ' km²' : String(n);
}

const SENTENCE_BUILDERS = [
  { key: 'ibukota', build: (e) => (e.ibukota ? 'Ibukotanya adalah ' + e.ibukota + '.' : null) },
  { key: 'populasi', build: (e) => (e.populasi != null ? 'Populasinya sekitar ' + fmtPopulasi(e.populasi) + '.' : null) },
  { key: 'matauang', build: (e) => (e.matauang ? 'Mata uangnya ' + e.matauang + (e.matauangKode ? ' (' + e.matauangKode + ')' : '') + '.' : null) },
  { key: 'bahasa', build: (e) => (e.bahasa.length ? 'Bahasa utamanya ' + e.bahasa.slice(0, 2).join(' dan ') + '.' : null) },
  { key: 'benua', build: (e) => (e.benua ? 'Terletak di benua ' + e.benua + '.' : null) },
  { key: 'luas', build: (e) => (e.luas != null ? 'Luas wilayahnya sekitar ' + fmtLuas(e.luas) + '.' : null) },
];

function seededShuffle(list, seedText) {
  const seed = hashText(seedText);
  const arr = list.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const idx = (seed + i * 2654435761) % (i + 1);
    const j = Math.abs(idx) % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  return arr;
}

function composeAdaptive(entity, seedText) {
  const sentences = SENTENCE_BUILDERS.map((b) => b.build(entity)).filter(Boolean);
  if (!sentences.length) return entity.trivia || entity.nama + '.';
  const seed = hashText(seedText || entity.nama);
  const count = 2 + (seed % Math.min(3, Math.max(1, sentences.length - 1)));
  const chosen = seededShuffle(sentences, seedText || entity.nama).slice(0, Math.min(count, sentences.length));
  return entity.nama + '. ' + chosen.join(' ');
}

function bestEffort(entity, requestedKey) {
  const known = SENTENCE_BUILDERS.filter((b) => b.key !== requestedKey)
    .map((b) => b.build(entity))
    .filter(Boolean);
  if (!known.length) return null;
  return 'Untuk data itu saya belum punya catatan yang pasti, tapi yang saya tahu tentang ' + entity.nama + ': ' + known.slice(0, 2).join(' ');
}

const ABOUT_EN_RE = /^(?:tell\s+me\s+about|what\s+do\s+you\s+know\s+about)\s+(.+?)\??$/i;
const FOLLOWUP_RE_EN = /^(?:what\s+about|and)\s+its\s+(capital|population|currency|language|area)\??$/i;
const FOLLOWUP_RE_ID = /^(?:bagaimana\s+dengan|dan\s+apa)\s+(ibukota|populasi|mata\s*uang|bahasa|luas)\s*nya\??$/i;

async function tryAboutEn(text) {
  const m = String(text || '').match(ABOUT_EN_RE);
  if (!m) return null;
  const entity = await resolveEntity(bilingual.extractEnEntity(m[1]));
  if (!entity) return null;
  memoryContext.pushEntity(entity.nama);
  return composeAdaptive(entity, text);
}

const FIELD_ANSWER_EN = {
  capital: (e) => (e.ibukota ? 'The capital of ' + e.en + ' is ' + e.ibukotaEn + '.' : null),
  population: (e) => (e.populasi != null ? e.en + ' has a population of about ' + e.populasi.toLocaleString('en-US') + ' people.' : null),
  currency: (e) => (e.matauang ? e.en + ' uses the ' + e.matauang + (e.matauangKode ? ' (' + e.matauangKode + ')' : '') + '.' : null),
  language: (e) => (e.bahasa.length ? 'The main language of ' + e.en + ' is ' + bilingual.toEnglishLanguageName(e.bahasa[0]) + '.' : null),
  area: (e) => (e.luas != null ? e.en + ' has an area of about ' + e.luas.toLocaleString('en-US') + ' km².' : null),
};

async function tryFollowupEn(text) {
  const m = String(text || '').match(FOLLOWUP_RE_EN);
  if (!m) return null;
  const top = memoryContext.topEntity();
  if (!top) return null;
  const entity = await resolveEntity(top);
  if (!entity) return null;
  const answerer = FIELD_ANSWER_EN[m[1].toLowerCase()];
  return answerer ? answerer(entity) : null;
}

const FIELD_KEY_ID = { ibukota: 'ibukota', populasi: 'populasi', 'mata uang': 'matauang', bahasa: 'bahasa', luas: 'luas' };

async function tryFollowupId(text) {
  const m = String(text || '').match(FOLLOWUP_RE_ID);
  if (!m) return null;
  const top = memoryContext.topEntity();
  if (!top) return null;
  const entity = await resolveEntity(top);
  if (!entity) return null;
  const key = FIELD_KEY_ID[m[1].toLowerCase().replace(/\s+/g, ' ').trim()];
  const builder = SENTENCE_BUILDERS.find((b) => b.key === key);
  return builder ? builder.build(entity) : null;
}

export const knowledgeGraph = Object.freeze({
  resolveEntity,
  resolveWithContext,
  composeAdaptive,
  bestEffort,
  tryAboutEn,
  tryFollowupEn,
  tryFollowupId,
});
