import { llmEngine } from '../rategoan-llm/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { memoryContext } from '../raget-memory/memory-context.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { agentTools } from './agent-tools.js';
import { datariesBridge } from './dataries-bridge.js';
import { scorer } from './scorer.js';
import { reminderParser } from '../vault/reminders/parser.js';
import { remindersStore } from '../vault/reminders/reminders-store.js';
import { reminderScheduler } from '../vault/reminders/scheduler.js';
import { emailComposer } from '../vault/email/composer.js';
import { icsParser } from '../vault/calendar/ics-parser.js';
import { calendarStore } from '../vault/calendar/calendar-store.js';
import { lazyModules } from './lazy-modules.js';
import { pickVariant, hashText, detectTone, detectMood } from '../utils/text.js';
import { retrieval } from '../raget-retrieval/retrieve.js';
import { planner } from './planner.js';
import { quality } from './quality.js';
import { readWeb } from '../vault/web/read-web.js';
import { quizSession } from './quiz-session.js';
import { collectionStore } from '../raget-memory/collection-store.js';
import { collectionSearch } from '../raget-memory/collection-search.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

const RATING_GOOD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(bagus|keren|mantap|oke|tepat)|^bagus\b|^mantap\b/i;
const RATING_BAD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(jelek|salah|kurang\s*tepat|ngawur)|^salah\b|^jelek\b/i;

const CLARIFY_MARKERS = /info tambahan dulu|ceritakan konteksnya|bagaimana kaitannya|apa yang sudah kamu ketahui/i;

const QUESTION_LEAD_RE = /^(siapa|apa|dimana|di\s*mana|kapan|berapa)\b/i;
const ABOUT_RE = /^(apa\s+yang\s+kamu\s+ketahui\s+tentang|ceritakan\s+tentang|cerita\s+(soal|tentang)|tentang|info)\s+/i;

const FACTOID_TEMPLATES = [(a) => a + '.', (a) => a + ', setahu saya.', (a) => 'Setahu saya, ' + a + '.'];

const MOOD_OPENERS = {
  sedih: { casual: 'Aduh, kedengarannya lagi sedih ya. ', formal: 'Turut prihatin mendengarnya. ', neutral: 'Kedengarannya lagi sedih ya. ' },
  capek: { casual: 'Wah, pasti capek banget ya. ', formal: 'Semoga Anda bisa segera beristirahat. ', neutral: 'Kedengarannya lagi capek ya. ' },
  marah: { casual: 'Wah, kedengarannya lagi kesel ya. ', formal: 'Saya memahami kekesalan Anda. ', neutral: 'Kedengarannya lagi kesal ya. ' },
  senang: { casual: 'Seneng deh dengernya! ', formal: 'Senang mendengarnya. ', neutral: 'Senang mendengarnya. ' },
  bosan: { casual: 'Lagi bosan ya? ', formal: 'Semoga harimu segera lebih menarik. ', neutral: 'Kedengarannya lagi bosan ya. ' },
};

function moodOpener(text) {
  const mood = detectMood(text);
  if (!mood) return '';
  const tone = detectTone(text);
  const pool = MOOD_OPENERS[mood];
  return pool[tone] || pool.neutral;
}

let personaCache = null;
let fewshotCache = null;

async function loadPersona() {
  if (personaCache) return personaCache;
  try {
    const res = await fetch(new URL('../dataset/persona.json', import.meta.url));
    personaCache = res.ok ? await res.json() : null;
  } catch (e) {
    personaCache = null;
  }
  return personaCache || DEFAULT_PERSONA;
}

async function loadFewshot() {
  if (fewshotCache) return fewshotCache;
  try {
    const res = await fetch(new URL('../dataset/fewshot.json', import.meta.url));
    const data = res.ok ? await res.json() : [];
    fewshotCache = Array.isArray(data) ? data : [];
  } catch (e) {
    fewshotCache = [];
  }
  return fewshotCache;
}

const FEWSHOT_MATCH_THRESHOLD = 0.5;

function matchFewshot(examples, text) {
  const corpus = examples.map((ex) => ({ ex, text: String(ex.q || '') }));
  const found = retrieval.best(text, corpus, { threshold: FEWSHOT_MATCH_THRESHOLD });
  return found ? found.item.ex : null;
}

function detectRating(text) {
  const t = text.trim();
  if (RATING_GOOD_RE.test(t)) return true;
  if (RATING_BAD_RE.test(t)) return false;
  return null;
}

function replaceMathWords(text) {
  return text
    .replace(/(\d+)\s*ditambah\s*(\d+)/gi, '$1+$2')
    .replace(/(\d+)\s*dikurang\s*(\d+)/gi, '$1-$2')
    .replace(/(\d+)\s*kali\s*(\d+)/gi, '$1*$2')
    .replace(/(\d+)\s*dibagi\s*(\d+)/gi, '$1/$2');
}

function extractMathExpr(text) {
  const replaced = replaceMathWords(text);
  const matches = replaced.match(/[0-9]+(?:\s*[+\-*/]\s*[0-9]+)+/g);
  if (!matches || !matches.length) return null;
  return matches.sort((a, b) => b.length - a.length)[0].replace(/\s+/g, '');
}

function isMathStatement(t) {
  return /hasilnya\s*-?[0-9]/i.test(t) && !/\bberapa\b/i.test(t);
}

function looksLikeMath(t) {
  const stripped = t
    .replace(/^(hitung|berapa)\s*/i, '')
    .replace(/\s*(hasilnya|sama\s*dengan)?\s*\??$/i, '')
    .trim();
  return stripped.length > 0 && /[0-9]/.test(stripped) && /^[0-9()\s+\-*/.]+$/.test(stripped);
}

function isMathQuestion(t) {
  if (isMathStatement(t)) return false;
  if (/%\s*dari\b/.test(t)) return true;
  if (looksLikeMath(t)) return true;
  return !!extractMathExpr(t);
}

function detectTeaching(text) {
  const t = text.trim();
  if (/\?$/.test(t)) return null;
  if (
    /^(apa|siapa|dimana|di\s*mana|kapan|berapa|bagaimana|mengapa|kenapa|jelaskan|cara|langkah|ringkas|rangkum|ide|ingat|lupakan|bandingkan|kelebihan|kekurangan|hitung)\b/i.test(
      t
    )
  )
    return null;
  const m = t.match(/^(.+?)\s+adalah\s+(.+)$/i) || t.match(/^(.+?)\s+itu\s+(.+)$/i);
  if (!m) return null;
  const subject = m[1].trim();
  const value = m[2].replace(/[.!]+$/, '').trim();
  if (!subject || !value || subject.split(/\s+/).length > 8 || value.split(/\s+/).length > 12) return null;
  return { subject, value };
}

function detectTool(prompt) {
  const t = String(prompt || '').trim().toLowerCase();
  if (/^(mulai\s+|main\s+)?kuis\b/.test(t)) return 'kuis';
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+hari(\s+ini)?(\s+saya)?\b/.test(t)) return 'ringkas_hari';
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+(percakapan|chat)\b/.test(t)) return 'ringkas_percakapan';
  if (/^ringkas(kan)?\b|^rangkum(kan)?\b/.test(t)) return 'ringkas';
  if (/ekspor\s+log|export\s+log|unduh\s+log/.test(t)) return 'ekspor';
  if (/laporan\s+otak/.test(t)) return 'laporan_otak';
  if (/share\s*(ke)?\s*wa\b|bagikan\s*(ke)?\s*whatsapp/.test(t)) return 'share_wa';
  if (/export\s+chat|download\s+percakapan|unduh\s+percakapan|ekspor\s+chat/.test(t)) return 'export_chat';
  if (/export\s+catatan|ekspor\s+catatan|unduh\s+catatan/.test(t)) return 'export_catatan';
  if (/^bagikan\s+kartu\s+/.test(t)) return 'bagikan_kartu';
  if (/^(buat|tulis|draft)\s+email\b/.test(t)) return 'email';
  if (/apa\s+yang\s+saya\s+simpan\s+tentang|apa\s+saja\s+yang\s+(saya\s+)?simpan\s+(di\s+)?koleksi/.test(t)) return 'cari_koleksi';
  if (/cari\s+.*di\s+semua|apa\s+yang\s+saya\s+punya\s+tentang/.test(t)) return 'cari_semua';
  if (/^bedah\s+https?:\/\//.test(t)) return 'bedah_url';
  if (/^ingat\s+(apa\s+)?(yang\s+saya\s+(catat|pernah\s+(bilang|cerita)|simpan)|soal|tentang)\b/.test(t)) return 'cari';
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b/.test(t)) return 'waktu';
  if (/apa\s+yang\s+kamu\s+tahu\s+tentang\b/.test(t)) return 'cari';
  if (/^bandingkan\s+/.test(t)) return 'bandingkan';
  if (/^[a-z0-9\s]{2,40}\s+vs\.?\s+[a-z0-9\s]{2,40}$/.test(t)) return 'bandingkan_vs';
  if (/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s+/.test(t)) return 'kelebihan_kekurangan';
  if (/^(cara|langkah)\s+/.test(t)) return 'cara';
  if (/^(kasih|beri|berikan|boleh|minta)?\s*ide\b/.test(t)) return 'ide';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?manfaat\s+/.test(t)) return 'manfaat';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?fungsi\s+(dari\s+|utama\s+)?/.test(t)) return 'fungsi';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?tujuan\s+(dari\s+|utama\s+)?/.test(t)) return 'tujuan';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?penyebab\s+(dari\s+|utama\s+)?/.test(t)) return 'penyebab';
  if (/^jelaskan\s+/.test(t)) return 'jelaskan';
  return null;
}

function tryMath(text) {
  const t = text.trim();
  if (!/^hitung\b/i.test(t) && !isMathQuestion(t.toLowerCase())) return null;
  if (/%\s*dari\b/i.test(t)) return agentTools.hitung(t);
  const expr = extractMathExpr(t) || t.replace(/^(hitung|berapa)\s*/i, '');
  return agentTools.hitung(expr);
}

function formatEventTime(timestamp) {
  return new Date(timestamp).toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function tryCalendarImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.ics$/i.test(att.name || '')) return null;
  const events = icsParser.parseICS(att.fileText);
  if (!events.length) return 'File .ics dibaca tapi tidak ada acara yang ditemukan di dalamnya.';
  const count = calendarStore.addAll(events);
  return 'Berhasil impor ' + count + ' acara dari file kalender.';
}

async function tryPdfImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileBinary || !/\.pdf$/i.test(att.name || '')) return null;
  const pdfReader = await lazyModules.getPdfReader();
  const result = await pdfReader.parsePDF(att.fileBinary);
  if (!result.ok) return result.message;
  const chunker = await lazyModules.getChunker();
  const parts = chunker.chunkText(result.text, 1500);
  const pdfStore = await lazyModules.getPdfStore();
  const count = await pdfStore.addAll(parts.map((t) => ({ title: att.name, text: t })), { source: 'pdf', fileName: att.name });
  return 'Berhasil impor PDF "' + att.name + '" (' + result.pages + ' halaman, ' + count + ' bagian tersimpan).';
}

async function tryNotionImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileBinary || !/\.zip$/i.test(att.name || '')) return null;
  const notionImporter = await lazyModules.getNotionImporter();
  const result = await notionImporter.importZip(att.fileBinary);
  if (!result.ok) return result.message;
  if (!result.chunks.length) return 'File ZIP dibaca tapi tidak ditemukan halaman Notion (.html/.md) di dalamnya.';
  const notionStore = await lazyModules.getNotionStore();
  const count = await notionStore.addAll(result.chunks, { source: 'notion' });
  return 'Berhasil impor ' + count + ' halaman Notion dari "' + att.name + '".';
}

async function tryEvernoteImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.enex$/i.test(att.name || '')) return null;
  const evernoteImporter = await lazyModules.getEvernoteImporter();
  const result = evernoteImporter.importENEX(att.fileText);
  if (!result.ok) return result.message;
  const evernoteStore = await lazyModules.getEvernoteStore();
  const count = await evernoteStore.addAll(result.chunks, { source: 'evernote' });
  return 'Berhasil impor ' + count + ' catatan Evernote dari "' + att.name + '".';
}

async function tryWhatsappImport(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.fileText || !/\.txt$/i.test(att.name || '')) return null;
  const whatsappImporter = await lazyModules.getWhatsappImporter();
  const result = whatsappImporter.importWhatsApp(att.fileText);
  if (!result.ok) return result.message;
  const whatsappStore = await lazyModules.getWhatsappStore();
  const count = await whatsappStore.addAll(result.chunks, { source: 'whatsapp' });
  return 'Berhasil impor riwayat WhatsApp "' + att.name + '" (' + result.messageCount + ' pesan, ' + count + ' bagian tersimpan).';
}

function tryCalendarQuery(text) {
  const t = text.trim().toLowerCase();
  if (/jadwal\s+hari\s+ini|apa\s+jadwal\s+hari\s+ini/.test(t)) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    const events = calendarStore.eventsBetween(start.getTime(), end.getTime());
    if (!events.length) return 'Tidak ada jadwal untuk hari ini.';
    return 'Jadwal hari ini:\n' + events.map((e) => '- ' + e.summary + ' (' + formatEventTime(e.start) + ')').join('\n');
  }
  if (/jadwal\s+minggu\s+ini/.test(t)) {
    const start = new Date();
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    const events = calendarStore.eventsBetween(start.getTime(), end.getTime());
    if (!events.length) return 'Tidak ada jadwal untuk minggu ini.';
    return 'Jadwal minggu ini:\n' + events.map((e) => '- ' + e.summary + ' (' + formatEventTime(e.start) + ')').join('\n');
  }
  if (/kapan\s+.*(meeting|rapat|acara|jadwal)\s+(selanjutnya|berikutnya)/.test(t)) {
    const next = calendarStore.nextUpcoming(Date.now());
    if (!next) return 'Belum ada jadwal mendatang yang tercatat.';
    return 'Acara selanjutnya: ' + next.summary + ' pada ' + formatEventTime(next.start) + '.';
  }
  return null;
}

const OCR_TRIGGER_RE = /baca\s+foto\s+ini|apa\s+isi\s+gambar|extract\s+text|ringkas\s+catatan\s+ini|berapa\s+total|apa\s+yang\s+dibicarakan/i;

async function tryOCR(text, messages) {
  const list = Array.isArray(messages) ? messages : [];
  const last = list[list.length - 1];
  const att = last && last.attach;
  if (!att || !att.full) return null;
  if (!OCR_TRIGGER_RE.test(text)) return null;

  const ocrReader = await lazyModules.getOcrReader();
  const result = await ocrReader.recognize(att.full);
  if (!result.ok) return result.message;

  memoryLong.rememberNote(result.text);

  if (/berapa\s+total/i.test(text)) {
    const totalMatch = result.text.match(/total[^\d]*(\d[\d.,]*)/i);
    if (totalMatch) return 'Total belanja: ' + totalMatch[1] + ' (dari hasil baca foto).';
    return 'Teks berhasil dibaca dari foto, tapi tidak ditemukan nilai "total" yang jelas:\n' + result.text.slice(0, 300);
  }
  if (/ringkas/i.test(text)) return agentTools.ringkas(result.text);
  return 'Isi gambar:\n' + result.text.slice(0, 500);
}

const LANG_NAME_MAP = {
  inggris: 'en', english: 'en', indonesia: 'id', jepang: 'ja', japanese: 'ja',
  korea: 'ko', mandarin: 'zh', china: 'zh', spanyol: 'es', prancis: 'fr',
  jerman: 'de', arab: 'ar', rusia: 'ru',
};

async function tryTranslate(text) {
  const m = text.match(/^terjemahkan\s+(.+?)\s+ke\s+(?:bahasa\s+)?(\w+)$/i) || text.match(/^translate\s+(.+?)\s+(?:to|ke)\s+(\w+)$/i);
  if (m) {
    const content = m[1];
    const lang = LANG_NAME_MAP[m[2].toLowerCase()] || m[2].toLowerCase();
    const translator = await lazyModules.getTranslator();
    const result = await translator.translate(content, lang);
    return result.ok ? 'Terjemahan: ' + result.text : result.message;
  }
  const m2 = text.match(/apa\s+bahasa\s+inggrisnya\s+(.+)$/i);
  if (m2) {
    const translator = await lazyModules.getTranslator();
    const result = await translator.translate(m2[1], 'en');
    return result.ok ? '"' + m2[1] + '" dalam bahasa Inggris: ' + result.text : result.message;
  }
  return null;
}

function formatReminderTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

const REMINDER_CANCEL_RE = /^(batalkan|batal|hapus)\s+(pengingat|reminder)\b/i;
const REMINDER_TRIGGER_RE = /^(ingatkan\s+saya|reminder|jangan\s+lupa)\b/i;
const QUICK_NOTE_RE = /^catat\s+/i;

function tryReminder(text) {
  const t = text.trim();

  if (REMINDER_CANCEL_RE.test(t)) {
    const cancelled = remindersStore.cancelLatest();
    return cancelled ? 'Baik, pengingat "' + cancelled.action + '" sudah dibatalkan.' : 'Tidak ada pengingat aktif untuk dibatalkan.';
  }

  const isReminderTrigger = REMINDER_TRIGGER_RE.test(t) || QUICK_NOTE_RE.test(t);
  if (!isReminderTrigger) return null;

  const parsed = reminderParser.parseReminder(t);
  if (parsed) {
    remindersStore.add(parsed);
    reminderScheduler.requestPermission();
    const recurText = parsed.recur === 'weekly' ? ' (berulang tiap minggu)' : parsed.recur === 'daily' ? ' (berulang tiap hari)' : '';
    return 'Oke, saya ingatkan "' + parsed.action + '" pada ' + formatReminderTime(parsed.timestamp) + recurText + '.';
  }

  if (QUICK_NOTE_RE.test(t)) {
    const note = t.replace(QUICK_NOTE_RE, '').trim();
    if (!note) return null;
    memoryLong.rememberNote(note);
    return 'Baik, saya catat: ' + note + '.';
  }

  return null;
}

async function runTool(kind, prompt, messages) {
  if (kind === 'ringkas') return agentTools.ringkas(prompt.replace(/^(ringkas(kan)?|rangkum(kan)?)\s*:?\s*/i, ''));
  if (kind === 'ringkas_percakapan') return agentTools.ringkasPercakapan(messages);
  if (kind === 'ringkas_hari') return await agentTools.ringkasHari();
  if (kind === 'kuis') return await quizSession.ask();
  if (kind === 'waktu') return agentTools.waktu(prompt);
  if (kind === 'cari') {
    const q = prompt
      .replace(/apa\s+yang\s+kamu\s+tahu\s+tentang\s*/i, '')
      .replace(/^ingat\s+(apa\s+)?(yang\s+saya\s+(catat|pernah\s+(bilang|cerita)|simpan)|soal|tentang)\s*/i, '');
    return agentTools.cari(q);
  }
  if (kind === 'ingat') return agentTools.ingat(prompt);
  if (kind === 'lupakan') return agentTools.lupakan(prompt);
  if (kind === 'ekspor') return agentTools.eksporLog();
  if (kind === 'laporan_otak') return agentTools.laporanOtak();
  if (kind === 'share_wa') return agentTools.shareToWhatsApp({ title: 'Chat', messages: messages || [] });
  if (kind === 'export_chat') {
    const p = prompt.toLowerCase();
    const format = /markdown|\bmd\b/.test(p) ? 'markdown' : /json/.test(p) ? 'json' : /pdf/.test(p) ? 'pdf' : 'txt';
    return agentTools.exportChat({ title: 'Chat', messages: messages || [] }, format);
  }
  if (kind === 'bagikan_kartu') {
    const negara = prompt.replace(/^bagikan\s+kartu\s+/i, '').trim();
    const result = await agentTools.bagikanKartu(negara);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'country_card', text: result, tag: 'artefak', chatTitle: 'Kartu ' + negara }).catch(() => {});
    return result;
  }
  if (kind === 'export_catatan') {
    const format = /markdown|\bmd\b/i.test(prompt) ? 'markdown' : 'txt';
    const result = agentTools.eksporCatatan(format);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'export', text: result, tag: 'artefak', chatTitle: 'Ekspor Catatan' }).catch(() => {});
    return result;
  }
  if (kind === 'email') {
    const result = await emailComposer.generateEmail(prompt);
    collectionStore.addItem({ kind: 'artifact', artifactType: 'email_draft', text: result, tag: 'artefak', chatTitle: 'Draft Email' }).catch(() => {});
    return result;
  }
  if (kind === 'cari_koleksi') {
    const q = prompt.replace(/apa\s+yang\s+saya\s+simpan\s+tentang/i, '').replace(/apa\s+saja\s+yang\s+(saya\s+)?simpan\s+(di\s+)?koleksi/i, '').trim();
    return await agentTools.cariKoleksi(q);
  }
  if (kind === 'cari_semua') {
    const q = prompt.replace(/cari\s+/i, '').replace(/di\s+semua\s*(sumber)?/i, '').replace(/apa\s+yang\s+saya\s+punya\s+tentang/i, '').trim();
    return await agentTools.cariSemua(q);
  }
  if (kind === 'bedah_url') {
    const url = (prompt.match(/https?:\/\/\S+/i) || [])[0];
    if (!url) return 'URL tidak ditemukan. Format: bedah https://...';
    const result = await readWeb.read(url);
    if (!result.ok) return result.message;
    return 'Ringkasan halaman:\n\n' + agentTools.ringkas(result.text);
  }
  if (kind === 'jelaskan') {
    const topic = prompt
      .replace(/^jelaskan\s*/i, '')
      .replace(/^apa\s+itu\s*/i, '')
      .replace(/^tentang\s*/i, '')
      .trim();
    return agentTools.jelaskan(topic);
  }
  if (kind === 'cara') {
    const topic = prompt.replace(/^(cara|langkah)\s*(untuk|buat|biar)?\s*/i, '').trim();
    return agentTools.cara(topic);
  }
  if (kind === 'ide') {
    const topic = prompt
      .replace(/^(kasih|beri|berikan|boleh|minta)\s+/i, '')
      .replace(/ide\s+(konten\s+)?(tentang|soal|untuk)?\s*/i, '')
      .trim();
    return agentTools.ide(topic);
  }
  if (kind === 'manfaat') {
    const topic = prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?manfaat\s+(dari\s+|dan\s+)?/i, '').trim();
    return agentTools.manfaat(topic);
  }
  if (kind === 'fungsi') {
    const topic = prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?fungsi\s+(dari\s+|utama\s+)?/i, '').trim();
    return agentTools.fungsi(topic);
  }
  if (kind === 'tujuan') {
    const topic = prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?tujuan\s+(dari\s+|utama\s+)?/i, '').trim();
    return agentTools.tujuan(topic);
  }
  if (kind === 'penyebab') {
    const topic = prompt.replace(/^(apa\s+(saja\s+)?|sebutkan\s+)?penyebab\s+(dari\s+|utama\s+)?/i, '').trim();
    return agentTools.penyebab(topic);
  }
  if (kind === 'bandingkan') {
    const m = prompt.match(/^bandingkan\s+(.+?)\s+(dan|dengan|vs\.?|atau)\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[3].trim()) : null;
  }
  if (kind === 'bandingkan_vs') {
    const m = prompt.match(/^(.+?)\s+vs\.?\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[2].trim()) : null;
  }
  if (kind === 'kelebihan_kekurangan') {
    const topic = prompt
      .replace(/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s*/i, '')
      .trim();
    return agentTools.kelebihanKekurangan(topic);
  }
  return null;
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

  if (ABOUT_RE.test(t)) return null;

  const isQuestionLike = QUESTION_LEAD_RE.test(t) || /\?$/.test(t);
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

function detectAnswerType(text) {
  const t = text.trim().toLowerCase();
  if (/^apa\s*itu\b/.test(t)) return 'definisi';
  if (/\b(sebutkan|ide|manfaat)\b/.test(t)) return 'daftar';
  if (/\b(cara|langkah)\b/.test(t)) return 'prosedur';
  if (/\bbandingkan\b/.test(t)) return 'perbandingan';
  if (/^(berapa|hitung)\b/.test(t)) return 'matematika';
  return 'terbuka';
}

const COLLECTION_REF_THRESHOLD = 0.35;

async function personalize(reply, text) {
  const isGreetingLike = /^(halo|hai|hi|hey|selamat|met|good|assalamu)/i.test(text.trim());
  const nama = memoryLong.recall('nama');
  if (isGreetingLike && nama && !reply.includes(nama)) {
    reply = reply.replace(/([!,])/, ', ' + nama + '$1');
  }
  if (!isGreetingLike && hashText(reply + text) % 100 < 15) {
    const suka = memoryLong.recall('suka');
    const pekerjaan = memoryLong.recall('pekerjaan');
    if (suka && suka.length) {
      reply += ' (Ngomong-ngomong, kudengar kamu suka ' + suka[suka.length - 1] + ' ya?)';
    } else if (pekerjaan) {
      reply += ' (Btw, gimana kabar kerjaan sebagai ' + pekerjaan + '?)';
    } else {
      const items = await collectionStore.allItems();
      if (items.length) {
        const textTokens = scorer.tokenize(text);
        const itemTokens = items.map((it) => scorer.tokenize(it.text));
        const scores = scorer.scoreIntent(textTokens, itemTokens);
        let bestIdx = -1, bestScore = COLLECTION_REF_THRESHOLD;
        scores.forEach((s, i) => { if (s >= bestScore) { bestScore = s; bestIdx = i; } });
        if (bestIdx >= 0) {
          reply += ' (Ini mirip dengan yang pernah kamu simpan dari koleksi kamu: "' + items[bestIdx].text.slice(0, 60) + (items[bestIdx].text.length > 60 ? '…' : '') + '")';
        }
      }
    }
  }
  return reply;
}

function isClarifyReply(text) {
  return CLARIFY_MARKERS.test(text) || text.startsWith('Saya catat:');
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

const MODE_COMMAND_RE = /^(jawab\s+(singkat|ringkas|detail)|mode\s+(santai|formal))\s*$/i;

function detectModeCommand(text) {
  const m = text.trim().match(MODE_COMMAND_RE);
  if (!m) return null;
  if (m[2]) return { key: 'mode_richness', value: /detail/i.test(m[2]) ? 'detail' : 'singkat' };
  if (m[3]) return { key: 'mode_tone', value: m[3].toLowerCase() };
  return null;
}

function classifyIntent(t) {
  if (/^hitung\b/i.test(t) || isMathQuestion(t.toLowerCase())) return 'hitung';
  if (REMINDER_TRIGGER_RE.test(t) || QUICK_NOTE_RE.test(t)) return 'reminder';
  const tool = detectTool(t);
  if (tool) return tool;
  return null;
}

async function tryMultiIntent(text, messages) {
  const parts = text.split(/\s+dan\s+/i);
  if (parts.length !== 2) return null;
  const [a, b] = parts.map((p) => p.trim());
  if (!a || !b) return null;
  const typeA = classifyIntent(a);
  const typeB = classifyIntent(b);
  if (!typeA || !typeB || typeA === typeB) return null;
  const replyA = await respondCore(messages, a);
  const replyB = await respondCore(messages, b);
  return replyA + '\n\n---\n\n' + replyB;
}

async function respond(messages, prompt) {
  const text = String(prompt || '').trim();
  const opener = text ? moodOpener(text) : '';
  const reply = await respondCore(messages, prompt);
  return opener && !reply.startsWith(opener) ? opener + reply : reply;
}

async function respondCore(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

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

  const modeCmd = detectModeCommand(text);
  if (modeCmd) {
    memoryLong.remember(modeCmd.key, modeCmd.value);
    const reply = 'Oke, mulai sekarang saya jawab dengan mode ' + modeCmd.value + '.';
    ragetDb.addNote(text, reply, null, 'mode_pref');
    return postProcess(reply);
  }

  const rating = detectRating(text);
  if (rating !== null) {
    ragetDb.rateLast(rating);
    const reply = rating
      ? 'Terima kasih atas masukannya, senang bisa membantu!'
      : 'Maaf jawaban sebelumnya kurang pas. Bisa dijelaskan lebih lanjut apa yang salah supaya saya bisa perbaiki?';
    ragetDb.addNote(text, reply, null, 'feedback');
    return postProcess(reply);
  }

  if (isMathStatement(text)) {
    const expr = extractMathExpr(text) || text;
    memoryLong.rememberNote(expr);
    const reply = 'Baik, saya catat: ' + text.replace(/\?+$/, '') + '.';
    ragetDb.addNote(text, reply, null, 'math_statement');
    return postProcess(reply);
  }

  memoryLong.learnFromText(text);

  const mathReply = tryMath(text);
  if (mathReply) {
    ragetDb.addNote(text, mathReply, null, 'hitung');
    return postProcess(mathReply);
  }

  const reminderReply = tryReminder(text);
  if (reminderReply) {
    ragetDb.addNote(text, reminderReply, null, 'reminder');
    return postProcess(reminderReply);
  }

  const ocrReply = await tryOCR(text, messages);
  if (ocrReply) {
    ragetDb.addNote(text, ocrReply, null, 'ocr');
    return postProcess(ocrReply);
  }

  const translateReply = await tryTranslate(text);
  if (translateReply) {
    ragetDb.addNote(text, translateReply, null, 'translate');
    return postProcess(translateReply);
  }

  const calendarImportReply = tryCalendarImport(messages);
  if (calendarImportReply) {
    ragetDb.addNote(text, calendarImportReply, null, 'calendar_import');
    return postProcess(calendarImportReply);
  }

  const pdfImportReply = await tryPdfImport(messages);
  if (pdfImportReply) {
    ragetDb.addNote(text, pdfImportReply, null, 'pdf_import');
    return postProcess(pdfImportReply);
  }

  const notionImportReply = await tryNotionImport(messages);
  if (notionImportReply) {
    ragetDb.addNote(text, notionImportReply, null, 'notion_import');
    return postProcess(notionImportReply);
  }

  const evernoteImportReply = await tryEvernoteImport(messages);
  if (evernoteImportReply) {
    ragetDb.addNote(text, evernoteImportReply, null, 'evernote_import');
    return postProcess(evernoteImportReply);
  }

  const whatsappImportReply = await tryWhatsappImport(messages);
  if (whatsappImportReply) {
    ragetDb.addNote(text, whatsappImportReply, null, 'whatsapp_import');
    return postProcess(whatsappImportReply);
  }

  const calendarQueryReply = tryCalendarQuery(text);
  if (calendarQueryReply) {
    ragetDb.addNote(text, calendarQueryReply, null, 'calendar_query');
    return postProcess(calendarQueryReply);
  }

  const hariLagiMatch = text.toLowerCase().match(/berapa\s+hari\s+lagi\s+(.+?)\s+merdeka/);
  if (hariLagiMatch) {
    const result = await datariesBridge.daysUntilIndependence(hariLagiMatch[1].trim());
    if (result) {
      ragetDb.addNote(text, result, null, 'temporal');
      return postProcess(result);
    }
  }

  const factoid = await tryFactoid(text, messages);
  if (factoid) {
    let reply = factoid;
    if (quizSession.shouldOffer(text)) {
      reply += '\n\nMau coba 1 soal kuis?\n\n' + (await quizSession.ask());
    }
    ragetDb.addNote(text, reply, null, 'factoid');
    return postProcess(reply);
  }

  const extras = await datariesBridge.extras(text);
  if (extras) {
    ragetDb.addNote(text, extras, null, 'dataries_extras');
    return postProcess(extras);
  }

  const teaching = detectTeaching(text);
  if (teaching) {
    const value = teaching.value.charAt(0).toUpperCase() + teaching.value.slice(1);
    memoryLong.learnFact(teaching.subject, value);
    const reply = 'Baik, saya catat: ' + teaching.subject + ' adalah ' + value + '.';
    ragetDb.addNote(text, reply, null, 'teaching');
    return postProcess(reply);
  }

  const toolKind = detectTool(text);
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

  const persona = await loadPersona();
  const shortContext = memoryShort.recent(messages, 10);

  const preSearch = await memoryIndex.search(text, 5);
  const dataFallback = await datariesBridge.datariesFallback(text);
  const plannedFallback = planner.planFallback(text, preSearch.concat(dataFallback));

  let reply;
  if (plannedFallback) {
    reply = postProcess(plannedFallback);
    reply = await personalize(reply, text);
  } else {
    let raw = await llmEngine.generate(shortContext, text, { personaName: persona.name });

    if (llmEngine.isWeak(raw)) {
      const fewshot = await loadFewshot();
      const example = matchFewshot(fewshot, text);
      if (example && example.a) raw = example.a;
    }

    reply = postProcess(raw);
    reply = await personalize(reply, text);
  }

  if (!plannedFallback && !isClarifyReply(reply)) {
    const candidate = preSearch.find((r) => !tooSimilar(text, r.text));
    if (candidate && candidate.score >= scorer.CONFIDENCE_THRESHOLD) {
      reply += '\n\n(Catatan terkait: ' + candidate.text.slice(0, 120) + ')';
    }
  }

  ragetDb.addNote(text, reply, null, 'chat_' + detectAnswerType(text));
  return reply;
}

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}
