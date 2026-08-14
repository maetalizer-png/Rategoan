import { llmEngine } from '../rategoan-llm/llm-engine.js';
import { memoryShort } from '../raget-memory/memory-short.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { memoryIndex } from '../raget-memory/memory-index.js';
import { ragetDb } from '../raget-database/raget-db.js';
import { agentTools } from './agent-tools.js';
import { datariesBridge } from './dataries-bridge.js';
import { dataries } from '../dataries/index.js';

const DEFAULT_PERSONA = { name: 'Raget', style: 'ramah, hangat, sedikit humor, tetap jujur dan singkat', rules: [] };

const RATING_GOOD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(bagus|keren|mantap|oke|tepat)|^bagus\b|^mantap\b/i;
const RATING_BAD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(jelek|salah|kurang\s*tepat|ngawur)|^salah\b|^jelek\b/i;

const CLARIFY_MARKERS = /info tambahan dulu|ceritakan konteksnya|bagaimana kaitannya|apa yang sudah kamu ketahui/i;

const QUESTION_LEAD_RE = /^(siapa|apa|dimana|di\s*mana|kapan|berapa)\b/i;
const ABOUT_RE = /^(ceritakan\s+tentang|cerita\s+(soal|tentang))\s+/i;

const FACTOID_TEMPLATES = [(a) => a + '.', (a) => a + ', setahu saya.', (a) => 'Setahu saya, ' + a + '.'];

const GREETING_LEAD_RE =
  /^(halo+|hai+|hey+|hi)\b|^assalamu.?alaikum\b|^permisi\b|^(selamat|met)?\s*(pagi|siang|sore|malam)\b|^good\s*(morning|afternoon|evening|night)\b/i;
const KABAR_RE = /apa\s+kabar/i;

let sapaanCache = null;

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

async function loadSapaan() {
  if (sapaanCache) return sapaanCache;
  try {
    const [greetings, interaktif] = await Promise.all([
      dataries.loadRegion('sapaan', 'greetings'),
      dataries.loadRegion('sapaan', 'interaktif'),
    ]);
    sapaanCache = { greetings: greetings || [], interaktif: interaktif || [] };
  } catch (e) {
    sapaanCache = { greetings: [], interaktif: [] };
  }
  return sapaanCache;
}

async function tryGreetingFromSapaan(text) {
  const t = text.trim();
  const isKabar = KABAR_RE.test(t);
  const isGreeting = !isKabar && GREETING_LEAD_RE.test(t);
  if (!isKabar && !isGreeting) return null;

  const turnKey = isKabar ? 'greet_sapaan_kabar' : 'greet_sapaan_time';
  const turn = variantTurns.get(turnKey) || 0;
  variantTurns.set(turnKey, turn + 1);
  if (turn % 2 === 1) return null;

  const data = await loadSapaan();
  const pool = isKabar ? data.interaktif : data.greetings;
  if (!pool.length) return null;
  const idx = (turn + hashText(t)) % pool.length;
  return pool[idx].text;
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
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b/.test(t)) return 'waktu';
  if (/apa\s+yang\s+kamu\s+tahu\s+tentang\b/.test(t)) return 'cari';
  if (/^hitung\b/.test(t) || isMathQuestion(t)) return 'hitung';
  if (/^bandingkan\s+/.test(t)) return 'bandingkan';
  if (/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s+/.test(t)) return 'kelebihan_kekurangan';
  if (/^(cara|langkah)\s+/.test(t)) return 'cara';
  if (/^(kasih|beri|berikan|boleh|minta)?\s*ide\b/.test(t)) return 'ide';
  if (/^jelaskan\s+/.test(t)) return 'jelaskan';
  return null;
}

async function runTool(kind, prompt, messages) {
  if (kind === 'ringkas') return agentTools.ringkas(prompt.replace(/^(ringkas(kan)?|rangkum(kan)?)\s*:?\s*/i, ''));
  if (kind === 'ringkas_percakapan') return agentTools.ringkasPercakapan(messages);
  if (kind === 'hitung') {
    if (/%\s*dari\b/i.test(prompt)) return agentTools.hitung(prompt);
    const expr = extractMathExpr(prompt) || prompt.replace(/^(hitung|berapa)\s*/i, '');
    return agentTools.hitung(expr);
  }
  if (kind === 'waktu') return agentTools.waktu(prompt);
  if (kind === 'cari') return agentTools.cari(prompt.replace(/apa\s+yang\s+kamu\s+tahu\s+tentang\s*/i, ''));
  if (kind === 'ingat') return agentTools.ingat(prompt);
  if (kind === 'lupakan') return agentTools.lupakan(prompt);
  if (kind === 'ekspor') return agentTools.eksporLog();
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

async function tryFactoid(text, messages) {
  const t = text.trim();

  const topic = lastTopicOf(messages);
  const dataries = await datariesBridge.factoid(t, { lastTopic: topic });
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

async function respond(messages, prompt) {
  const text = String(prompt || '').trim();
  if (!text) return postProcess('');

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

  const sapaan = await tryGreetingFromSapaan(text);
  if (sapaan) {
    const reply = personalize(sapaan, text);
    ragetDb.addNote(text, reply, null, 'greeting');
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

  const teaching = detectTeaching(text);
  if (teaching) {
    const value = teaching.value.charAt(0).toUpperCase() + teaching.value.slice(1);
    memoryLong.learnFact(teaching.subject, value);
    const reply = 'Baik, saya catat: ' + teaching.subject + ' adalah ' + value + '.';
    ragetDb.addNote(text, reply, null, 'teaching');
    return postProcess(reply);
  }

  const factoid = await tryFactoid(text, messages);
  if (factoid) {
    ragetDb.addNote(text, factoid, null, 'factoid');
    return postProcess(factoid);
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
    const relevant = await memoryIndex.search(text, 3);
    const candidate = relevant.find((r) => !tooSimilar(text, r.text));
    if (candidate) {
      reply += '\n\n(Catatan terkait: ' + candidate.text.slice(0, 120) + ')';
    }
  }

  ragetDb.addNote(text, reply, null, 'chat');
  return reply;
}

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}
