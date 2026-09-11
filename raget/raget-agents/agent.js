import { llmEngine } from '../raget-template/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { memoryContext } from '../raget-memory/memory-context.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { datariesBridge } from './dataries-bridge.js';
import { scorer } from './scorer.js';
import { pickVariant } from '../../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { planner } from './planner.js';
import { quality } from './quality.js';
import { quizSession } from './quiz-session.js';
import { fewshotLocal } from '../raget-memory/fewshot-local.js';
import { toolsMath } from './tools-math.js';
import { toolsReminder } from './tools-reminder.js';
import { toolsTemporal } from './tools-temporal.js';
import { toolsImport } from './tools-import.js';
import { toolsKoleksi } from './tools-koleksi.js';
import { toolsExport } from './tools-export.js';
import { toolsGeneric } from './tools-generic.js';
import { toolsDevlog } from './tools-devlog.js';
import { routerIntent } from './router-intent.js';
import { bilingual } from './bilingual.js';
import { knowledgeGraph } from './knowledge-graph.js';
import { answerComposer } from './answer-composer.js';
import { stemEngine } from './stem-engine.js';
import { socialEngine } from './social-engine.js';
import { contextEngine } from './context-engine.js';
import { worldContext } from './world-context.js';
import { intelligenceRumus } from './intelligence-rumus.js';
import { tokohStore } from './tokoh-store.js';
import { kulinerStore } from './kuliner-store.js';
import { frameworkApply } from './framework-apply.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

const FACTOID_TEMPLATES = [(a) => a + '.', (a) => a + ', setahu saya.', (a) => 'Setahu saya, ' + a + '.'];

let personaCache = null;
let fewshotCache = null;

async function loadPersona() {
  if (personaCache) return personaCache;
  try {
    const res = await fetch(new URL('../raget-devlog/json/persona.json', import.meta.url));
    personaCache = res.ok ? await res.json() : null;
  } catch (e) {
    personaCache = null;
  }
  return personaCache || DEFAULT_PERSONA;
}

async function loadFewshot() {
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

const FEWSHOT_MATCH_THRESHOLD = 0.5;

function matchFewshot(examples, text) {
  const corpus = examples.map((ex) => ({ ex, text: String(ex.q || '') }));
  const found = retrieval.best(text, corpus, { threshold: FEWSHOT_MATCH_THRESHOLD });
  return found ? found.item.ex : null;
}

const ENSEMBLE_NEAR_MISS_THRESHOLD = 0.3;

function matchFewshotNearMiss(examples, text) {
  const corpus = examples.map((ex) => ({ ex, text: String(ex.q || '') }));
  const ranked = retrieval.rank(text, corpus, { threshold: ENSEMBLE_NEAR_MISS_THRESHOLD, limit: 1 });
  const top = ranked[0];
  if (!top || top.score >= FEWSHOT_MATCH_THRESHOLD) return null;
  return top.item.ex;
}

async function runTool(kind, prompt, messages) {
  if (toolsDevlog.handles(kind)) return await toolsDevlog.run(kind, prompt);
  if (toolsKoleksi.handles(kind)) return await toolsKoleksi.run(kind, prompt);
  if (toolsExport.handles(kind)) return await toolsExport.run(kind, prompt, messages);
  return await toolsGeneric.run(kind, prompt, messages, () => { fewshotCache = null; });
}

function recallFromMemory(text) {
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

function acknowledgeFact(text) {
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

function lastTopicOf(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const priorUsers = list.filter((m) => m.role === 'user');
  if (priorUsers.length < 2) return null;
  return priorUsers[priorUsers.length - 2].text;
}

function getRichnessPref() {
  return memoryLong.recall('mode_richness') || null;
}

async function tryFactoid(text, messages) {
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

function tooSimilar(a, b) {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  if (!wordsA.size || !wordsB.size) return false;
  let overlap = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) overlap++;
  });
  return overlap / Math.min(wordsA.size, wordsB.size) >= 0.6;
}

function postProcess(text) {
  const cleaned = String(text || '').trim();
  return cleaned || 'Maaf, saya belum punya jawaban untuk itu. Bisa dijelaskan lebih lanjut?';
}

async function tryMultiIntent(text, messages) {
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

const FACTUAL_QUERY_RE =
  /\b(apa|siapa|kapan|berapa|dimana|di\s*mana|kenapa|mengapa|bagaimana|gimana|jelaskan|ceritakan|sebutkan|rekomendasi|kurs|ibukota|ibu\s*kota|resep)\b|\bcara\s+(bikin|buat|membuat)\b|\?\s*$/i;

async function respond(messages, prompt) {
  try {
    const text = String(prompt || '').trim();
    const opener = text ? routerIntent.moodOpener(text) : '';
    const isFactualQuery = text && FACTUAL_QUERY_RE.test(text);
    const continuityOpener = text && !opener && !isFactualQuery ? contextEngine.tryEmotionalContinuityOpener(text) : '';
    if (text) contextEngine.noteTurnMood(text);
    const reply = await respondCore(messages, prompt);
    const finalOpener = opener || continuityOpener || '';
    return finalOpener && !reply.startsWith(finalOpener) ? finalOpener + reply : reply;
  } catch {
    return 'Maaf, ada bagian dari sistem saya yang sempat error saat memproses ini. Coba ulangi atau tanyakan dengan kata lain?';
  }
}

async function respondCore(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

  // Dipicu eksplisit lewat tombol "Pencarian Web" di UI (composer.js kirim
  // prefix "googling ") - langsung ke tool websearch TANPA lewat heuristik
  // lain (teaching/factoid/tokoh/dst) dulu. Kalau tidak, kalimat seperti
  // "googling apa itu fisika" bisa salah kena detectTeaching's "X itu Y"
  // regex duluan (guard-nya cuma cek AWAL kalimat "apa/siapa/dst", dan di
  // sini kalimat diawali "googling" jadi lolos guard itu) sebelum sempat
  // ketemu detectTool('websearch') yang letaknya jauh di bawah.
  if (routerIntent.detectTool(text) === 'websearch') {
    const websearchReply = await runTool('websearch', text, messages);
    if (websearchReply) {
      ragetDb.addNote(text, websearchReply, null, 'websearch');
      return postProcess(websearchReply);
    }
  }

  const emergencyReply = contextEngine.tryEmergency(text);
  if (emergencyReply) {
    ragetDb.addNote(text, emergencyReply, null, 'context_emergency');
    return postProcess(emergencyReply);
  }

  const stylePrefReply = contextEngine.tryStylePreference(text);
  if (stylePrefReply) {
    ragetDb.addNote(text, stylePrefReply, null, 'context_style_preference');
    return postProcess(stylePrefReply);
  }

  const multiIntent = await tryMultiIntent(text, messages);
  if (multiIntent) {
    ragetDb.addNote(text, multiIntent, null, 'multi_intent');
    return postProcess(multiIntent);
  }

  const quizReply = quizSession.checkPending(text);
  if (quizReply) {
    ragetDb.addNote(text, quizReply, null, 'kuis');
    return postProcess(quizReply);
  }

  const frameworkApplyReply = frameworkApply.checkPending(text);
  if (frameworkApplyReply) {
    ragetDb.addNote(text, frameworkApplyReply, null, 'framework_apply');
    return postProcess(frameworkApplyReply);
  }

  const modeCmd = routerIntent.detectModeCommand(text);
  if (modeCmd) {
    memoryLong.remember(modeCmd.key, modeCmd.value);
    const reply = 'Oke, mulai sekarang saya jawab dengan mode ' + modeCmd.value + '.';
    ragetDb.addNote(text, reply, null, 'mode_pref');
    return postProcess(reply);
  }

  const stemPrecise = stemEngine.tryLogic(text) || stemEngine.tryAlgebra(text) || stemEngine.tryCalculus(text) || stemEngine.tryPhysics(text) || worldContext.tryCountNumbers(text);
  if (stemPrecise) {
    ragetDb.addNote(text, stemPrecise, null, 'stem');
    return postProcess(stemPrecise);
  }

  const rating = routerIntent.detectRating(text);
  if (rating !== null) {
    ragetDb.rateLast(rating);
    const reply = rating
      ? 'Terima kasih atas masukannya, senang bisa membantu!'
      : 'Maaf jawaban sebelumnya kurang pas. Bisa dijelaskan lebih lanjut apa yang salah supaya saya bisa perbaiki?';
    ragetDb.addNote(text, reply, null, 'feedback');
    return postProcess(reply);
  }

  if (toolsMath.isMathStatement(text)) {
    const expr = toolsMath.extractMathExpr(text) || text;
    memoryLong.rememberNote(expr);
    const reply = 'Baik, saya catat: ' + text.replace(/\?+$/, '') + '.';
    ragetDb.addNote(text, reply, null, 'math_statement');
    return postProcess(reply);
  }

  memoryLong.learnFromText(text);

  const mathReply = toolsMath.tryMath(text);
  if (mathReply) {
    ragetDb.addNote(text, mathReply, null, 'hitung');
    return postProcess(mathReply);
  }

  const reminderReply = toolsReminder.tryReminder(text);
  if (reminderReply) {
    ragetDb.addNote(text, reminderReply, null, 'reminder');
    return postProcess(reminderReply);
  }

  const ocrReply = await toolsImport.tryOCR(text, messages);
  if (ocrReply) {
    ragetDb.addNote(text, ocrReply, null, 'ocr');
    return postProcess(ocrReply);
  }

  const translateReply = await toolsImport.tryTranslate(text);
  if (translateReply) {
    ragetDb.addNote(text, translateReply, null, 'translate');
    return postProcess(translateReply);
  }

  const calendarImportReply = toolsTemporal.tryCalendarImport(messages);
  if (calendarImportReply) {
    ragetDb.addNote(text, calendarImportReply, null, 'calendar_import');
    return postProcess(calendarImportReply);
  }

  const pdfImportReply = await toolsImport.tryPdfImport(messages);
  if (pdfImportReply) {
    ragetDb.addNote(text, pdfImportReply, null, 'pdf_import');
    return postProcess(pdfImportReply);
  }

  const notionImportReply = await toolsImport.tryNotionImport(messages);
  if (notionImportReply) {
    ragetDb.addNote(text, notionImportReply, null, 'notion_import');
    return postProcess(notionImportReply);
  }

  const evernoteImportReply = await toolsImport.tryEvernoteImport(messages);
  if (evernoteImportReply) {
    ragetDb.addNote(text, evernoteImportReply, null, 'evernote_import');
    return postProcess(evernoteImportReply);
  }

  const whatsappImportReply = await toolsImport.tryWhatsappImport(messages);
  if (whatsappImportReply) {
    ragetDb.addNote(text, whatsappImportReply, null, 'whatsapp_import');
    return postProcess(whatsappImportReply);
  }

  const textFileReply = await toolsImport.tryTextFileQA(text, messages);
  if (textFileReply) {
    ragetDb.addNote(text, textFileReply, null, 'text_file_qa');
    return postProcess(textFileReply);
  }

  const calendarQueryReply = toolsTemporal.tryCalendarQuery(text);
  if (calendarQueryReply) {
    ragetDb.addNote(text, calendarQueryReply, null, 'calendar_query');
    return postProcess(calendarQueryReply);
  }

  const independenceReply = await toolsTemporal.tryIndependenceDay(text);
  if (independenceReply) {
    ragetDb.addNote(text, independenceReply, null, 'temporal');
    return postProcess(independenceReply);
  }

  const followupId = await knowledgeGraph.tryFollowupId(text);
  if (followupId) {
    ragetDb.addNote(text, followupId, null, 'kg_followup');
    return postProcess(followupId);
  }

  const stemDict =
    stemEngine.tryScienceField(text) ||
    stemEngine.tryBodySystem(text) ||
    stemEngine.tryClassification(text) ||
    stemEngine.tryEcology(text) ||
    stemEngine.tryTechConcept(text) ||
    (await worldContext.tryHariByDate(text)) ||
    (await worldContext.tryHariByName(text)) ||
    worldContext.tryDetectLanguage(text) ||
    intelligenceRumus.tryFrameworkLookup(text);
  if (stemDict) {
    ragetDb.addNote(text, stemDict, null, 'stem');
    return postProcess(stemDict);
  }

  const kulinerReply = await kulinerStore.tryKuliner(text);
  if (kulinerReply) {
    ragetDb.addNote(text, kulinerReply, null, 'kuliner');
    return postProcess(kulinerReply);
  }

  const mataPelajaranReply = await datariesBridge.mataPelajaran(text);
  if (mataPelajaranReply) {
    ragetDb.addNote(text, mataPelajaranReply, null, 'mata_pelajaran');
    return postProcess(mataPelajaranReply);
  }

  const factoid = await tryFactoid(text, messages);
  if (factoid) {
    ragetDb.addNote(text, factoid, null, 'factoid');
    return postProcess(factoid);
  }

  if (bilingual.detectLang(text) === 'en') {
    const factoidEn = await bilingual.tryFactoidEn(text);
    if (factoidEn) {
      ragetDb.addNote(text, factoidEn, null, 'factoid_en');
      return postProcess(factoidEn);
    }
    const followupEn = await knowledgeGraph.tryFollowupEn(text);
    if (followupEn) {
      ragetDb.addNote(text, followupEn, null, 'kg_followup');
      return postProcess(followupEn);
    }
    const aboutEn = await knowledgeGraph.tryAboutEn(text);
    if (aboutEn) {
      ragetDb.addNote(text, aboutEn, null, 'kg_about');
      return postProcess(aboutEn);
    }
  }

  const tokohReply = await tokohStore.tryTokoh(text);
  if (tokohReply) {
    ragetDb.addNote(text, tokohReply, null, 'tokoh');
    return postProcess(tokohReply);
  }

  const extras = await datariesBridge.extras(text);
  if (extras) {
    ragetDb.addNote(text, extras, null, 'dataries_extras');
    return postProcess(extras);
  }

  const csReply = socialEngine.tryLatte(text) || socialEngine.tryHeard(text) || socialEngine.tryThreeA(text);
  if (csReply) {
    ragetDb.addNote(text, csReply, null, 'social');
    return postProcess(csReply);
  }

  const stemReply = stemEngine.tryStem(text);
  if (stemReply) {
    ragetDb.addNote(text, stemReply, null, 'stem');
    return postProcess(stemReply);
  }

  const socialReply = socialEngine.trySocial(text);
  if (socialReply) {
    ragetDb.addNote(text, socialReply, null, 'social');
    return postProcess(socialReply);
  }

  const contextReply = await contextEngine.tryContext(text);
  if (contextReply) {
    ragetDb.addNote(text, contextReply, null, 'context');
    return postProcess(contextReply);
  }

  const worldReply = await worldContext.tryWorldContext(text);
  if (worldReply) {
    ragetDb.addNote(text, worldReply, null, 'world_context');
    return postProcess(worldReply);
  }

  const frameworkKind = frameworkApply.detectStart(text);
  if (frameworkKind) {
    const frameworkStart = frameworkApply.start(frameworkKind);
    ragetDb.addNote(text, frameworkStart, null, 'framework_apply');
    return postProcess(frameworkStart);
  }

  const suggestFramework = intelligenceRumus.trySuggestFramework(text);
  if (suggestFramework) {
    ragetDb.addNote(text, suggestFramework, null, 'intelligence_rumus');
    return postProcess(suggestFramework);
  }

  const teaching = routerIntent.detectTeaching(text);
  if (teaching) {
    const value = teaching.value.charAt(0).toUpperCase() + teaching.value.slice(1);
    memoryLong.learnFact(teaching.subject, value);
    const reply = 'Baik, saya catat: ' + teaching.subject + ' adalah ' + value + '.';
    ragetDb.addNote(text, reply, null, 'teaching');
    return postProcess(reply);
  }

  const toolKind = routerIntent.detectTool(text);
  if (toolKind) {
    const toolReply = await runTool(toolKind, text, messages);
    if (toolReply) {
      ragetDb.addNote(text, toolReply, null, toolKind);
      return postProcess(toolReply);
    }
  }

  const recalled = recallFromMemory(text);
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

  const greet = llmEngine.tryGreeting(text, { personaName: persona.name, tonePreference });
  if (greet) {
    ragetDb.addNote(text, greet, null, 'greeting');
    return postProcess(greet);
  }

  const interject = llmEngine.tryInterjection(text);
  if (interject) {
    ragetDb.addNote(text, interject, null, 'interjection');
    return postProcess(interject);
  }

  const dailyTalk = llmEngine.tryDailyTalk(text, { personaName: persona.name, tonePreference });
  if (dailyTalk) {
    ragetDb.addNote(text, dailyTalk, null, 'daily_talk');
    return postProcess(dailyTalk);
  }

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

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}
