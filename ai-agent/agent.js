import { llmEngine } from '../rategoan-llm/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { agentTools } from './agent-tools.js';
import { datariesBridge } from './dataries-bridge.js';
import { scorer } from './scorer.js';
import { reminderParser } from '../reminders/parser.js';
import { remindersStore } from '../reminders/reminders-store.js';
import { reminderScheduler } from '../reminders/scheduler.js';
import { emailComposer } from '../email/composer.js';
import { icsParser } from '../calendar/ics-parser.js';
import { calendarStore } from '../calendar/calendar-store.js';
import { ocrReader } from '../ocr/reader.js';
import { translator } from '../translate/translator.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

const RATING_GOOD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(bagus|keren|mantap|oke|tepat)|^bagus\b|^mantap\b/i;
const RATING_BAD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(jelek|salah|kurang\s*tepat|ngawur)|^salah\b|^jelek\b/i;

const CLARIFY_MARKERS = /info tambahan dulu|ceritakan konteksnya|bagaimana kaitannya|apa yang sudah kamu ketahui/i;

const QUESTION_LEAD_RE = /^(siapa|apa|dimana|di\s*mana|kapan|berapa)\b/i;
const ABOUT_RE = /^(apa\s+yang\s+kamu\s+ketahui\s+tentang|ceritakan\s+tentang|cerita\s+(soal|tentang)|tentang|info)\s+/i;

const FACTOID_TEMPLATES = [(a) => a + '.', (a) => a + ', setahu saya.', (a) => 'Setahu saya, ' + a + '.'];

let personaCache = null;
let fewshotCache = null;
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

function matchFewshot(examples, text) {
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  let best = null;
  let bestScore = 0;
  examples.forEach((ex) => {
    const hay = String(ex.q || '').toLowerCase();
    const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = ex;
    }
  });
  return bestScore > 0 ? best : null;
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
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+(percakapan|chat)\b/.test(t)) return 'ringkas_percakapan';
  if (/^ringkas(kan)?\b|^rangkum(kan)?\b/.test(t)) return 'ringkas';
  if (/ekspor\s+log|export\s+log|unduh\s+log/.test(t)) return 'ekspor';
  if (/laporan\s+otak/.test(t)) return 'laporan_otak';
  if (/share\s*(ke)?\s*wa\b|bagikan\s*(ke)?\s*whatsapp/.test(t)) return 'share_wa';
  if (/export\s+chat|download\s+percakapan|unduh\s+percakapan|ekspor\s+chat/.test(t)) return 'export_chat';
  if (/^(buat|tulis|draft)\s+email\b/.test(t)) return 'email';
  if (/cari\s+.*di\s+semua|apa\s+yang\s+saya\s+punya\s+tentang/.test(t)) return 'cari_semua';
  if (/^bedah\s+https?:\/\//.test(t)) return 'bedah_url';
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b/.test(t)) return 'waktu';
  if (/apa\s+yang\s+kamu\s+tahu\s+tentang\b/.test(t)) return 'cari';
  if (/^bandingkan\s+/.test(t)) return 'bandingkan';
  if (/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s+/.test(t)) return 'kelebihan_kekurangan';
  if (/^(cara|langkah)\s+/.test(t)) return 'cara';
  if (/^(kasih|beri|berikan|boleh|minta)?\s*ide\b/.test(t)) return 'ide';
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
    const result = await translator.translate(content, lang);
    return result.ok ? 'Terjemahan: ' + result.text : result.message;
  }
  const m2 = text.match(/apa\s+bahasa\s+inggrisnya\s+(.+)$/i);
  if (m2) {
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
  if (kind === 'waktu') return agentTools.waktu(prompt);
  if (kind === 'cari') return agentTools.cari(prompt.replace(/apa\s+yang\s+kamu\s+tahu\s+tentang\s*/i, ''));
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
  if (kind === 'email') return emailComposer.generateEmail(prompt);
  if (kind === 'cari_semua') {
    const q = prompt.replace(/cari\s+/i, '').replace(/di\s+semua\s*(sumber)?/i, '').replace(/apa\s+yang\s+saya\s+punya\s+tentang/i, '').trim();
    return await agentTools.cariSemua(q);
  }
  if (kind === 'bedah_url') {
    return 'Analisis konten web (bedah URL) belum tersedia karena Raget 100% berjalan lokal tanpa mengambil data dari internet. Fitur ini bisa ditambahkan sebagai paket opt-in terpisah bila diperlukan.';
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
  if (kind === 'bandingkan') {
    const m = prompt.match(/^bandingkan\s+(.+?)\s+(dan|dengan|vs\.?|atau)\s+(.+)$/i);
    return m ? agentTools.bandingkan(m[1].trim(), m[3].trim()) : null;
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
  const lastEntity = topic ? datariesBridge.extractKnownEntity(topic) : null;
  const dataries = await datariesBridge.factoid(t, { lastTopic: topic, lastEntity, lastQuery: topic, richness: getRichnessPref() });
  if (dataries) return dataries;

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

function personalize(reply, text) {
  const isGreetingLike = /^(halo|hai|hi|hey|selamat|met|good|assalamu)/i.test(text.trim());
  const nama = memoryLong.recall('nama');
  if (isGreetingLike && nama && !reply.includes(nama)) {
    reply = reply.replace(/([!,])/, ', ' + nama + '$1');
  }
  if (!isGreetingLike && Math.random() < 0.15) {
    const suka = memoryLong.recall('suka');
    const pekerjaan = memoryLong.recall('pekerjaan');
    if (suka && suka.length) {
      reply += ' (Ngomong-ngomong, kudengar kamu suka ' + suka[suka.length - 1] + ' ya?)';
    } else if (pekerjaan) {
      reply += ' (Btw, gimana kabar kerjaan sebagai ' + pekerjaan + '?)';
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

async function respond(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

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

  const calendarQueryReply = tryCalendarQuery(text);
  if (calendarQueryReply) {
    ragetDb.addNote(text, calendarQueryReply, null, 'calendar_query');
    return postProcess(calendarQueryReply);
  }

  const factoid = await tryFactoid(text, messages);
  if (factoid) {
    ragetDb.addNote(text, factoid, null, 'factoid');
    return postProcess(factoid);
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
  let raw = await llmEngine.generate(shortContext, text, { personaName: persona.name });

  if (llmEngine.isWeak(raw)) {
    const fewshot = await loadFewshot();
    const example = matchFewshot(fewshot, text);
    if (example && example.a) raw = example.a;
  }

  let reply = postProcess(raw);
  reply = personalize(reply, text);

  if (!isClarifyReply(reply)) {
    const relevant = await memoryIndex.search(text, 5);
    const queryTokens = scorer.tokenize(text);
    const scored = relevant
      .filter((r) => !tooSimilar(text, r.text))
      .map((r) => {
        const noteTokens = scorer.tokenize(r.text);
        const corpus = [queryTokens, noteTokens];
        const confidence = scorer.cosineSim(scorer.tfidfVector(queryTokens, corpus), scorer.tfidfVector(noteTokens, corpus));
        return { r, confidence };
      })
      .sort((a, b) => b.confidence - a.confidence);
    const best = scored[0];
    if (best && best.confidence >= scorer.CONFIDENCE_THRESHOLD) {
      reply += '\n\n(Catatan terkait: ' + best.r.text.slice(0, 120) + ')';
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
