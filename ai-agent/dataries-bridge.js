import { dataries } from '../dataries/index.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { memoryContext } from '../raget-memory/memory-context.js';
import { bridgeResolve } from './bridge-resolve.js';
import { bridgeFormat } from './bridge-format.js';
import { bridgeRelations } from './bridge-relations.js';
import { bridgeReasoning } from './bridge-reasoning.js';
import { bridgeExtras } from './bridge-extras.js';

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
  const item = await bridgeResolve.lookupInGroup('country', bridgeResolve.resolveCountryAlias(String(entity || '').toLowerCase().trim()));
  if (!item || !item.metadata.independenceDay) return null;
  const result = daysUntilAnniversary(item.metadata.independenceDay);
  if (!result) return null;
  const dateLabel = result.date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  const name = item.metadata.name;
  if (result.days === 0) return name + ' merdeka hari ini! (' + dateLabel + ')';
  return result.days + ' hari lagi (' + name + ' merdeka ' + dateLabel + ').';
}

const CORRECTION_RE = /^(bukan|salah|eh\s*bukan)[,.]?\s*(?:maksud(?:nya|\s+saya)?\s+)?(.+)$/i;

async function tryCorrection(text, opts) {
  const m = text.match(CORRECTION_RE);
  if (!m || !opts.lastQuery) return null;
  const relation = bridgeRelations.detectRelation(String(opts.lastQuery));
  if (!relation) return null;
  const entity = bridgeResolve.cleanEntity(m[2]);
  const resolved = entity ? await bridgeRelations.resolveValue(relation, entity) : null;
  if (!resolved) return null;
  return bridgeFormat.craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts.richness);
}

async function tryMultiHopCapital(text, opts) {
  const m = text.match(/^(.+?)\s+negara\s+yang\s+ibukota\s*nya\s+(.+)$/i);
  if (!m) return null;
  const capital = bridgeResolve.cleanEntity(m[2]);
  if (!capital) return null;
  const list = await dataries.loadAll('country');
  const countryItem = list.find((it) => it.metadata.capital && bridgeResolve.fuzzyEq(it.metadata.capital.toLowerCase(), capital));
  if (!countryItem) return null;
  const rewritten = m[1].trim() + ' ' + countryItem.metadata.name;
  return (await bridgeExtras.extras(rewritten)) || (await factoid(rewritten, opts));
}

async function factoid(q, options) {
  const text = bridgeResolve.splitPossessiveSuffix(String(q || '').trim());
  if (!text) return null;
  const opts = options || {};

  const corrected = await tryCorrection(text, opts);
  if (corrected) return corrected;

  const anafora = await bridgeReasoning.tryAnaforaLuas(text, opts);
  if (anafora) return anafora;

  const multiHop = await tryMultiHopCapital(text, opts);
  if (multiHop) return multiHop;

  const aboutMatch = text.match(
    /^(apa\s+yang\s+kamu\s+ketahui\s+tentang|ceritakan\s+tentang|cerita\s+(soal|tentang)|tentang|info)\s+(negara|kota)?\s*(.+)$/i
  );
  if (aboutMatch) {
    const entity = aboutMatch[4].replace(/\?+$/, '').trim().toLowerCase();
    const item = (await bridgeResolve.lookupInGroup('country', entity)) || (await bridgeResolve.lookupInGroup('cities', entity));
    return item && item.text ? bridgeFormat.summarizeItem(item, opts.richness) : null;
  }

  const relation = bridgeRelations.detectRelation(text);
  if (!relation) return null;

  const entityRaw = bridgeResolve.extractEntity(text, relation);
  const parts = bridgeResolve.splitCompoundEntities(entityRaw);
  if (parts.length > 1) {
    const resolvedList = [];
    for (const p of parts) {
      const r = await bridgeRelations.resolveValue(relation, p);
      if (r) resolvedList.push(r);
    }
    if (resolvedList.length > 1) {
      return resolvedList.map((r) => '- ' + bridgeResolve.capitalize(r.label) + ': ' + r.value).join('\n');
    }
  }

  let resolved = null;
  if (entityRaw) {
    resolved = await bridgeRelations.resolveValue(relation, entityRaw);
    if (!resolved) return null;
  } else {
    const fallbackEntity = opts.lastEntity || opts.lastTopic;
    if (fallbackEntity) resolved = await bridgeRelations.resolveValue(relation, String(fallbackEntity).toLowerCase().trim());
  }
  if (!resolved) return null;

  memoryContext.setRelation(resolved.field);
  return bridgeFormat.craftAnswer(resolved.field, resolved.label, resolved.value, resolved.item, opts.richness);
}

async function search(q) {
  const text = String(q || '').toLowerCase().trim();
  if (!text) return null;
  const matches = bridgeResolve.detectEntityRegions(text);
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
  extras: bridgeExtras.extras,
  extractKnownEntity: bridgeResolve.extractKnownEntity,
  datariesFallback,
  daysUntilIndependence,
});
