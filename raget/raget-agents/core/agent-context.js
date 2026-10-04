import { memoryLong } from '../../raget-memory/memory-long.js';
import { memoryIndex } from '../../raget-memory/memory-index.js';
import { memoryContext } from '../../raget-memory/memory-context.js';
import { datariesBridge } from '../dataries-bridge.js';
import { pickVariant } from '../../../shared/text.js';
import { retrieval } from '../../raget-retrieval/retrieve.js';
import { quality } from '../quality.js';
import { fewshotLocal } from '../../raget-memory/fewshot-local.js';
import { toolsKoleksi } from '../tools-koleksi.js';
import { toolsExport } from '../tools-export.js';
import { toolsGeneric } from '../tools-generic.js';
import { toolsDevlog } from '../tools-devlog.js';
import { toolsKode } from '../tools-kode.js';
import { routerIntent } from '../router-intent.js';

export const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

export const FACTOID_TEMPLATES = [(a) => a + '.', (a) => a + ', setahu saya.', (a) => 'Setahu saya, ' + a + '.'];

let personaCache = null;
let fewshotCache = null;

export async function loadPersona() {
  if (personaCache) return personaCache;
  try {
    const res = await fetch(new URL('../raget-devlog/json/persona.json', import.meta.url));
    personaCache = res.ok ? await res.json() : null;
  } catch (e) {
    personaCache = null;
  }
  return personaCache || DEFAULT_PERSONA;
}

export async function loadFewshot() {
  if (!fewshotCache) {
    try {
      const res = await fetch(new URL('../raget-devlog/json/fewshot.json', import.meta.url));
      const data = res.ok ? await res.json() : [];
      fewshotCache = Array.isArray(data) ? data : [];
    } catch (e) {
      fewshotCache = [];
    }
  }
  const local = fewshotLocal.allItems();
  return local.length ? local.concat(fewshotCache) : fewshotCache;
}

export const FEWSHOT_MATCH_THRESHOLD = 0.5;

export function matchFewshot(examples, text) {
  const corpus = examples.map((ex) => ({ ex, text: String(ex.q || '') }));
  const found = retrieval.best(text, corpus, { threshold: FEWSHOT_MATCH_THRESHOLD });
  return found ? found.item.ex : null;
}

export const ENSEMBLE_NEAR_MISS_THRESHOLD = 0.3;

export function matchFewshotNearMiss(examples, text) {
  const corpus = examples.map((ex) => ({ ex, text: String(ex.q || '') }));
  const ranked = retrieval.rank(text, corpus, { threshold: ENSEMBLE_NEAR_MISS_THRESHOLD, limit: 1 });
  const top = ranked[0];
  if (!top || top.score >= FEWSHOT_MATCH_THRESHOLD) return null;
  return top.item.ex;
}

export async function runTool(kind, prompt, messages) {
  if (toolsKode.handles(kind)) return await toolsKode.run(kind, prompt);
  if (toolsDevlog.handles(kind)) return await toolsDevlog.run(kind, prompt);
  if (toolsKoleksi.handles(kind)) return await toolsKoleksi.run(kind, prompt);
  if (toolsExport.handles(kind)) return await toolsExport.run(kind, prompt, messages);
  return await toolsGeneric.run(kind, prompt, messages, () => { fewshotCache = null; });
}

export function recallFromMemory(text) {
  const t = text.toLowerCase();
  if (/siapa nama saya|nama saya siapa/.test(t)) {
    const nama = memoryLong.recall('nama');
    return nama ? 'Nama kamu ' + nama + ', setahu saya dari percakapan sebelumnya.' : null;
  }
  if (/apa yang saya suka|saya suka apa/.test(t)) {
    const suka = memoryLong.recall('suka');
    return suka && suka.length ? 'Setahu saya kamu suka ' + suka.join(', ') + '.' : null;
  }
  if (/kerja\s+sebagai\s+apa\s+saya|saya\s+kerja\s+sebagai\s+apa/.test(t)) {
    const pekerjaan = memoryLong.recall('pekerjaan');
    return pekerjaan ? 'Setahu saya kamu kerja sebagai ' + pekerjaan + '.' : null;
  }
  if (/saya\s+tinggal\s+dimana|dimana\s+saya\s+tinggal/.test(t)) {
    const kota = memoryLong.recall('kota');
    return kota ? 'Setahu saya kamu tinggal di ' + kota + '.' : null;
  }
  return null;
}

export function acknowledgeFact(text) {
  const nameMatch = text.match(/(?:nama\s+saya|panggil\s+saya)\s+([a-zA-Z]{2,20})/i);
  if (nameMatch) return 'Baik, ' + nameMatch[1] + '! Senang kenal denganmu. Ada yang bisa saya bantu?';
  const jobMatch = text.match(/saya\s+kerja\s+sebagai\s+([a-zA-Z0-9\s]{2,40})/i);
  if (jobMatch) return 'Oh, kerja sebagai ' + jobMatch[1].trim() + ' ya, keren! Ada yang bisa saya bantu?';
  const cityMatch = text.match(/saya\s+tinggal\s+di\s+([a-zA-Z\s]{2,40})/i);
  if (cityMatch) return 'Noted, kamu tinggal di ' + cityMatch[1].trim() + '. Ada yang bisa saya bantu?';
  const likeMatch = text.match(/saya\s+suka\s+([a-zA-Z0-9\s]{2,40})/i);
  if (likeMatch) return 'Asyik, dicatat ya kamu suka ' + likeMatch[1].trim() + '. Ada yang bisa saya bantu?';
  return null;
}

export function lastTopicOf(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const priorUsers = list.filter((m) => m.role === 'user');
  if (priorUsers.length < 2) return null;
  return priorUsers[priorUsers.length - 2].text;
}

export function getRichnessPref() {
  return memoryLong.recall('mode_richness') || null;
}

export async function tryFactoid(text, messages) {
  const t = text.trim();

  const topic = lastTopicOf(messages);
  const stackEntity = memoryContext.topEntity();
  const lastEntity = stackEntity || (topic ? datariesBridge.extractKnownEntity(topic) : null);
  const richness = getRichnessPref();
  const dataries = await datariesBridge.factoid(t, { lastTopic: topic, lastEntity, lastQuery: topic, richness });
  if (dataries) {
    const currentEntity = datariesBridge.extractKnownEntity(t);
    if (currentEntity) memoryContext.pushEntity(currentEntity);
    return quality.guardEmoji(quality.guardFactoidSentences(dataries, richness));
  }

  if (routerIntent.ABOUT_RE.test(t)) return null;

  const isQuestionLike = routerIntent.QUESTION_LEAD_RE.test(t) || /\?$/.test(t);
  if (!isQuestionLike) return null;

  const subject = t
    .replace(/^(siapa|apa|dimana|di\s*mana|kapan|berapa)\s+/i, '')
    .replace(/^itu\s+/i, '')
    .replace(/\?+$/, '')
    .trim();
  if (!subject) return null;
  const found = await memoryIndex.findFactoid(subject);
  if (!found) return null;
  return pickVariant('factoid', FACTOID_TEMPLATES, subject)(found.answer);
}

export function tooSimilar(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  if (!wordsA.size || !wordsB.size) return false;
  let overlap = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) overlap++;
  });
  return overlap / Math.min(wordsA.size, wordsB.size) >= 0.6;
}
