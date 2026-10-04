import { llmEngine } from '../../raget-template/llm-engine.js';
import { memoryLong } from '../../raget-memory/memory-long.js';
import { ragetDb } from '../../raget-database/raget-db.js';
import { datariesBridge } from '../dataries-bridge.js';
import { quizSession } from '../quiz-session.js';
import { toolsMath } from '../tools-math.js';
import { toolsReminder } from '../tools-reminder.js';
import { toolsTemporal } from '../tools-temporal.js';
import { toolsImport } from '../tools-import.js';
import { routerIntent } from '../router-intent.js';
import { bilingual } from '../bilingual.js';
import { knowledgeGraph } from '../knowledge-graph.js';
import { stemEngine } from '../stem-engine.js';
import { socialEngine } from '../social-engine.js';
import { contextEngine } from '../context-engine.js';
import { worldContext } from '../world-context.js';
import { intelligenceRumus } from '../intelligence-rumus.js';
import { tokohStore } from '../tokoh-store.js';
import { kulinerStore } from '../kuliner-store.js';
import { frameworkApply } from '../framework-apply.js';
import { memoryPreference } from '../../../js/state/memory-preference.js';
import { postProcess, tryMultiIntent } from './agent-stream.js';
import { finishRespond } from './agent-stream.js';
import {loadPersona, runTool, tryFactoid} from './agent-context.js';

export async function respondCore(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

  // Dipicu eksplisit lewat tombol "Pencarian Web" di UI (composer.js kirim
  // prefix "googling ") - langsung ke tool websearch TANPA lewat heuristik
  // lain (teaching/factoid/tokoh/dst) dulu. Kalau tidak, kalimat seperti
  // "googling apa itu fisika" bisa salah kena detectTeaching's "X itu Y"
  // regex duluan (guard-nya cuma cek AWAL kalimat "apa/siapa/dst", dan di
  // sini kalimat diawali "googling" jadi lolos guard itu) sebelum sempat
  // ketemu detectTool('websearch') yang letaknya jauh di bawah.
  const earlyToolKind = routerIntent.detectTool(text);
  if (earlyToolKind === 'websearch' || earlyToolKind === 'cuaca_live' || earlyToolKind === 'berita_live') {
    const earlyReply = await runTool(earlyToolKind, text, messages);
    if (earlyReply) {
      ragetDb.addNote(text, earlyReply, null, earlyToolKind);
      return postProcess(earlyReply);
    }
  }

  const greetEarly = llmEngine.tryGreeting(text, { personaName: 'Raget' });
  if (greetEarly) {
    ragetDb.addNote(text, greetEarly, null, 'greeting');
    return postProcess(greetEarly);
  }
  const dailyEarly = llmEngine.tryDailyTalk(text, { personaName: 'Raget' });
  if (dailyEarly) {
    ragetDb.addNote(text, dailyEarly, null, 'daily_talk');
    return postProcess(dailyEarly);
  }
  if (earlyToolKind === 'kode') {
    const kodeReply = await runTool('kode', text, messages);
    if (kodeReply) {
      ragetDb.addNote(text, kodeReply, null, 'kode');
      return postProcess(kodeReply);
    }
  }

  // File dilampirkan lewat tombol "File" di attach sheet cuma berlaku untuk
  // SATU pesan ini (attach.consume() di composer.js mengosongkannya lagi
  // setelah terkirim) - jadi cukup cek attach di pesan TERAKHIR. Sama
  // seperti websearch di atas, ini aksi eksplisit user (pilih file lewat
  // tombol) jadi harus menang duluan sebelum heuristik lain nyasar.
  const lastMsg = Array.isArray(messages) && messages.length ? messages[messages.length - 1] : null;
  if (lastMsg && lastMsg.attach && lastMsg.attach.fileText) {
    const fileReply = await runTool('file_qa', text, messages);
    if (fileReply) {
      ragetDb.addNote(text, fileReply, null, 'file_qa');
      return postProcess(fileReply);
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

  const multiIntent = await tryMultiIntent(text, messages, respondCore);
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

  if (memoryPreference.get()) memoryLong.learnFromText(text);

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

  const personaEarly = await loadPersona();
  const tonePreferenceEarly = contextEngine.getStylePreference();
  const greet = llmEngine.tryGreeting(text, { personaName: personaEarly.name, tonePreference: tonePreferenceEarly });
  if (greet) {
    ragetDb.addNote(text, greet, null, 'greeting');
    return postProcess(greet);
  }
  const interject = llmEngine.tryInterjection(text);
  if (interject) {
    ragetDb.addNote(text, interject, null, 'interjection');
    return postProcess(interject);
  }
  const dailyTalk = llmEngine.tryDailyTalk(text, { personaName: personaEarly.name, tonePreference: tonePreferenceEarly });
  if (dailyTalk) {
    ragetDb.addNote(text, dailyTalk, null, 'daily_talk');
    return postProcess(dailyTalk);
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
  return finishRespond(text, messages);
}
