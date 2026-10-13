import { neuralAdapter } from '../../raget-neural/neural-adapter.js';
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
import { recallFromMemory, acknowledgeFact, tryFactoid, tooSimilar } from './agent-context.js';

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

  const preSearch = await memoryIndex.search(text, 5);
  const dataFallback = await datariesBridge.datariesFallback(text);
  const plannedFallback = planner.planFallback(text, preSearch.concat(dataFallback));

  let reply = '';
  if (plannedFallback) {
    reply = postProcess(plannedFallback.text);
    reply = await toolsKoleksi.personalize(reply, text);
  } else {
    const raw = await neuralAdapter.ask(text, { messages: messages });
    reply = raw ? String(raw).trim() : '';
    if (reply) reply = await toolsKoleksi.personalize(reply, text);
  }

  if (!plannedFallback && reply && !routerIntent.isClarifyReply(reply)) {
    const candidate = preSearch.find((r) => !tooSimilar(text, r.text));
    if (candidate && candidate.score >= scorer.CONFIDENCE_THRESHOLD) {
      reply += '\n\n(Catatan terkait: ' + candidate.text.slice(0, 120) + ')';
    }
  }

  if (!plannedFallback && !reply) {
    ragetDb.logUnmatched(text, ['preSearch', 'dataFallback', 'planner', 'neural']);
  }

  ragetDb.addNote(text, reply, null, 'chat_' + routerIntent.detectAnswerType(text), plannedFallback ? plannedFallback.sourceEntryId : null);
  return reply ? postProcess(reply) : reply;
}
