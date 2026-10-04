import { llmEngine } from '../../raget-template/llm-engine.js';
import { memoryShort } from '../../raget-memory/memory-short.js';
import { memoryIndex } from '../../raget-memory/memory-index.js';
import { ragetDb } from '../../raget-database/raget-db.js';
import { datariesBridge } from '../dataries-bridge.js';
import { scorer } from '../scorer.js';
import { planner } from '../planner.js';
import { toolsKoleksi } from '../tools-koleksi.js';
import { routerIntent } from '../router-intent.js';
import { answerComposer } from '../answer-composer.js';
import { contextEngine } from '../context-engine.js';
import { memoryPreference } from '../../../js/state/memory-preference.js';
import { loadPersona, loadFewshot, matchFewshot, matchFewshotNearMiss, recallFromMemory, acknowledgeFact, tryFactoid, tooSimilar } from './agent-context.js';

export function postProcess(text) {
  const cleaned = String(text || '').trim();
  return cleaned || 'Maaf, saya belum punya jawaban untuk itu. Bisa dijelaskan lebih lanjut?';
}

export async function tryMultiIntent(text, messages, respondCore) {
  const parts = text.split(/\s+dan\s+/i);
  if (parts.length !== 2) return null;
  const [a, b] = parts.map((p) => p.trim());
  if (!a || !b) return null;
  const typeA = routerIntent.classifyIntent(a);
  const typeB = routerIntent.classifyIntent(b);
  if (!typeA || !typeB || typeA === typeB) return null;
  const replyA = await respondCore(messages, a);
  const replyB = await respondCore(messages, b);
  return replyA + '\n\n---\n\n' + replyB;
}

// Sengaja TIDAK menyertakan "apa/siapa/kapan/berapa/ibukota/dimana" dkk atau
// akhiran "?" polos di sini: lookup fakta singkat (ibukota, populasi, mata
// uang, bio tokoh) tetap boleh dibuka dengan kalimat kontinuitas emosi -
// hanya query naratif/panjang (ceritakan/jelaskan/sebutkan/resep/cara bikin)
// yang terasa janggal kalau diawali basa-basi personal.
export const FACTUAL_QUERY_RE =
  /\b(jelaskan|ceritakan|sebutkan|rekomendasi|kurs|resep)\b|\bcara\s+(bikin|buat|membuat)\b/i;

export function createRespond(respondCore) {
  return async function respond(messages, prompt) {
    try {
      const text = String(prompt || '').trim();
      const opener = text ? routerIntent.moodOpener(text) : '';
      const isFactualQuery = text && FACTUAL_QUERY_RE.test(text);
      const continuityOpener = text && !opener && !isFactualQuery ? contextEngine.tryEmotionalContinuityOpener(text) : '';
      if (text) contextEngine.noteTurnMood(text);
      const reply = await respondCore(messages, prompt);
      const finalOpener = opener || continuityOpener || '';
      return finalOpener && !reply.startsWith(finalOpener) ? finalOpener + reply : reply;
    } catch (e) {
      console.warn('[Rategoan Fallback] Agen:', e);
      return 'Maaf, ada bagian dari sistem saya yang sempat error saat memproses ini. Coba ulangi atau tanyakan dengan kata lain?';
    }
  };
}

export async function finishRespond(text, messages) {
  const recalled = memoryPreference.get() ? recallFromMemory(text) : null;
  if (recalled) {
    ragetDb.addNote(text, recalled, null, 'recall');
    return postProcess(recalled);
  }

  const acknowledged = acknowledgeFact(text);
  if (acknowledged) {
    ragetDb.addNote(text, acknowledged, null, 'personalize');
    return postProcess(acknowledged);
  }

  const correctedText = answerComposer.correctTypos(text);
  if (correctedText !== text) {
    const factoidRetry = await tryFactoid(correctedText, messages);
    if (factoidRetry) {
      ragetDb.addNote(text, factoidRetry, null, 'factoid_typo_fixed');
      return postProcess(factoidRetry);
    }
    const extrasRetry = await datariesBridge.extras(correctedText);
    if (extrasRetry) {
      ragetDb.addNote(text, extrasRetry, null, 'dataries_extras_typo_fixed');
      return postProcess(extrasRetry);
    }
  }

  const persona = await loadPersona();
  const shortContext = memoryShort.recent(messages, 10);
  const tonePreference = contextEngine.getStylePreference();

  const preSearch = await memoryIndex.search(text, 5);
  const dataFallback = await datariesBridge.datariesFallback(text);
  const plannedFallback = planner.planFallback(text, preSearch.concat(dataFallback));

  let reply;
  let fewshotMatched = false;
  if (plannedFallback) {
    reply = postProcess(plannedFallback.text);
    reply = await toolsKoleksi.personalize(reply, text);
  } else {
    let raw = await llmEngine.generate(shortContext, text, { personaName: persona.name, tonePreference });

    if (llmEngine.isWeak(raw)) {
      const fewshot = await loadFewshot();
      const example = matchFewshot(fewshot, text);
      if (example && example.a) {
        raw = example.a;
        fewshotMatched = true;
      } else {
        const nearMiss = matchFewshotNearMiss(fewshot, text);
        if (nearMiss && nearMiss.q) raw += '\n\n(Maksud kamu: "' + nearMiss.q + '"?)';
      }
    }

    reply = postProcess(raw);
    reply = await toolsKoleksi.personalize(reply, text);
  }

  if (!plannedFallback && !routerIntent.isClarifyReply(reply) && !llmEngine.isSmalltalkText(text)) {
    const candidate = preSearch.find((r) => !tooSimilar(text, r.text));
    if (candidate && candidate.score >= scorer.CONFIDENCE_THRESHOLD) {
      reply += '\n\n(Catatan terkait: ' + candidate.text.slice(0, 120) + ')';
    }
  }

  // FR-5.1: query reached the very end of the fallback chain with truly nothing
  // matched - every specific intent/tool above already failed, semantic retrieval
  // (preSearch/dataFallback/planner) came up empty, no exact fewshot example fired,
  // and llmEngine.craft() fell through to its own generic clarification prompt
  // (llmEngine.isRealAnswer(text) mirrors exactly which of craft()'s early branches
  // would have produced real content instead). Log it (read-only/additive - never
  // changes what's returned to the user) so raget-tools/export-unmatched-queries.mjs
  // can later export it for rule-writing.
  if (!plannedFallback && !fewshotMatched && !llmEngine.isRealAnswer(text)) {
    ragetDb.logUnmatched(text, ['preSearch', 'dataFallback', 'planner', 'llmEngine', 'fewshot']);
  }

  ragetDb.addNote(text, reply, null, 'chat_' + routerIntent.detectAnswerType(text), plannedFallback ? plannedFallback.sourceEntryId : null);
  return reply;
}
