import { hashText, pickVariant, detectTone, normalizeSlang } from '../../utils/text.js';

const FALLBACK_TEXT = 'Maaf, saya belum paham. Coba ulangi dengan kata lain?';
const GENERIC_PREFIX = 'Saya catat:';

const TIME_GREETING_RE = /^(selamat|met)?\s*(pagi|siang|sore|malam)\b|^good\s*(morning|afternoon|evening|night)\b/i;
const PLAIN_GREETING_RE = /^(halo+|hallo+|helo+|hello+|hai+|hey+|hi+|hei+)\b|^assalamu.?alaikum\b|^permisi\b|^pagi\b|^siang\b|^sore\b|^malam\b/i;
const QUESTION_WORDS = ['apa', 'siapa', 'kapan', 'dimana', 'di mana', 'mengapa', 'kenapa', 'bagaimana', 'berapa', 'gimana'];

// Template teks sapaan/smalltalk dipindah ke raget-data/json/sapaan/sapaan.json
// (skema tunggal Fase B, lihat roadmap vNext §3) - modul ini cuma menyimpan
// LOGIKA (regex pemicu smalltalk, tidak valid sebagai JSON) dan memuat teks
// via loadSapaan() lazy-cache, bukan literal array lagi. Dua-tiga baris
// fallback minimal di bawah ini SENGAJA tetap hardcode sebagai jaring
// pengaman kalau fetch JSON gagal (batas sistem, bukan data domain).
const SMALLTALK_TRIGGERS = {
  siapa: /siapa\s+(kamu|anda)\b|kamu\s+siapa/i,
  kabar: /\bkabar\s*(kamu|anda|lu|elu)\b|\bkabarmu\b|\b(apa|gimana|bagaimana)\s+kabar\b|how\s+are\s+you/i,
  terima_kasih: /terima\s*kasih|makasih|thanks|thank\s*you/i,
  jumpa: /sampai\s+jumpa|dad+ah|^bye\b|selamat\s+tinggal/i,
  kemampuan: /kamu\s+bisa\s+apa|kemampuan(mu|kamu)?\b|apa\s+yang\s+bisa\s+kamu\s+lakukan/i,
  bantu: /\b(tolong|bisa)\s+(bantu|bantuan)\b|\bbantu(in|kan)?\s+(saya|aku)\b|\bbutuh\s+bantuan\b/i,
};

const SAPAAN_FALLBACK_TEXT = 'Halo! Ada yang bisa saya bantu?';

let sapaanCache = null;

function indexSapaan(raw) {
  const idx = { time: {}, plain: [], smalltalk: {}, followup: { greeting: [], smalltalk: [] } };
  for (const e of Array.isArray(raw) ? raw : []) {
    const m = e && e.meta ? e.meta : {};
    if (m.jenis === 'waktu' && m.periode) idx.time[m.periode] = m.variants && m.variants.length ? m.variants : [e.teks];
    else if (m.jenis === 'plain') idx.plain = m.variants && m.variants.length ? m.variants : [e.teks];
    else if (m.jenis === 'smalltalk' && m.key)
      idx.smalltalk[m.key] = { templates: m.variants && m.variants.length ? m.variants : [e.teks], templatesFormal: m.variantsFormal || null };
    else if (m.jenis === 'followup') {
      idx.followup.greeting = m.greeting || [];
      idx.followup.smalltalk = m.smalltalk || [];
    }
  }
  return idx;
}

async function loadSapaan() {
  if (sapaanCache) return sapaanCache;
  try {
    const res = await fetch(new URL('../raget-data/json/sapaan/sapaan.json', import.meta.url));
    const raw = res.ok ? await res.json() : [];
    sapaanCache = indexSapaan(raw);
  } catch (e) {
    sapaanCache = indexSapaan([]);
  }
  return sapaanCache;
}

const EN_PERIOD_MAP = { morning: 'pagi', afternoon: 'siang', evening: 'sore', night: 'malam' };

function mirrorTemplates(statedPeriod, devicePeriod) {
  return [
    'Selamat ' + statedPeriod + ' juga! (Di sini masih ' + devicePeriod + ', tapi tetap semangat ya)',
    statedPeriod.charAt(0).toUpperCase() + statedPeriod.slice(1) + ' juga! (Waktu di perangkatku sih masih ' + devicePeriod + ')',
  ];
}

function withName(template, name) {
  return template.split('{name}').join(name || 'Raget');
}

function maybeFollowUp(reply, pool) {
  if (!pool || !pool.length) return reply;
  if (reply.length > 60) return reply;
  const h = hashText(reply);
  if (h % 100 >= 30) return reply;
  return reply + ' ' + pool[h % pool.length];
}

function timeOfDay(date) {
  const h = (date || new Date()).getHours();
  if (h >= 4 && h < 10) return 'pagi';
  if (h >= 10 && h < 15) return 'siang';
  if (h >= 15 && h < 18) return 'sore';
  return 'malam';
}

function isQuestion(text) {
  const t = text.trim().toLowerCase();
  if (t.endsWith('?')) return true;
  return QUESTION_WORDS.some((w) => t.startsWith(w + ' ') || t.includes(' ' + w + ' '));
}

function lastTopic(context) {
  const list = Array.isArray(context) ? context : [];
  const priorUsers = list.filter((m) => m.role === 'user');
  if (priorUsers.length < 2) return null;
  return priorUsers[priorUsers.length - 2].text.slice(0, 60);
}

function matchSmalltalk(text, options) {
  const key = Object.keys(SMALLTALK_TRIGGERS).find((k) => SMALLTALK_TRIGGERS[k].test(text));
  if (!key) return null;
  const entry = sapaanCache.smalltalk[key];
  if (!entry) return null;
  const tone = detectTone(text);
  const pool = tone === 'formal' && entry.templatesFormal ? entry.templatesFormal : entry.templates;
  const picked = pickVariant('small_' + key + '_' + tone, pool, text) || SAPAAN_FALLBACK_TEXT;
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, sapaanCache.followup.smalltalk);
}

function extractStatedPeriod(text) {
  const m = text.match(TIME_GREETING_RE);
  if (!m) return null;
  if (m[2]) return m[2].toLowerCase();
  if (m[3]) return EN_PERIOD_MAP[m[3].toLowerCase()] || null;
  return null;
}

function replyTimeGreeting(now, options, text) {
  const devicePeriod = timeOfDay(now);
  const statedPeriod = text ? extractStatedPeriod(text) : null;

  if (statedPeriod && statedPeriod !== devicePeriod) {
    const templates = mirrorTemplates(statedPeriod, devicePeriod);
    const reply = withName(pickVariant('greet_mirror_' + statedPeriod, templates, statedPeriod + devicePeriod), options.personaName);
    return maybeFollowUp(reply, sapaanCache.followup.greeting);
  }

  const templates = sapaanCache.time[devicePeriod] || [];
  const picked = pickVariant('greet_time_' + devicePeriod, templates, devicePeriod) || SAPAAN_FALLBACK_TEXT;
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, sapaanCache.followup.greeting);
}

function replyPlainGreeting(text, options) {
  const picked = pickVariant('greet_plain', sapaanCache.plain, text) || SAPAAN_FALLBACK_TEXT;
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, sapaanCache.followup.greeting);
}

function replyQuestion(prompt) {
  const echo = prompt.replace(/\?+$/, '').trim();
  const low = echo.toLowerCase();
  // Obrolan terbuka tanpa topik spesifik — jangan cuma memantulkan pertanyaan
  if (/\b(pendapat|opini|menurut)\b/.test(low) && !/\b(tentang|soal|mengenai)\b/.test(low)) {
    return pickVariant('q_opini', [
      'Aku bisa bantu menimbang sudut pandang, tapi butuh topiknya dulu. Mau bahas apa — kerja, produk, keputusan, atau yang lain?',
      'Pendapat yang pas biasanya tergantung konteks. Ceritakan situasinya sebentar, nanti aku bantu uraikan opsi dan pertimbangannya.',
    ], prompt);
  }
  if (/\b(bagaimana|gimana)\b/.test(low) && low.split(/\s+/).length <= 5) {
    return pickVariant('q_singkat', [
      'Bisa diperjelas sedikit? Misalnya situasi, tujuan, atau pilihan yang lagi kamu hadapi.',
      'Aku siap bantu. Tambahkan konteks singkat biar jawabannya tidak mengambang.',
    ], prompt);
  }
  const templates = [
    'Pertanyaan menarik soal "' + echo + '". Bisa ceritakan konteksnya sedikit lagi supaya jawaban saya lebih pas?',
    'Soal "' + echo + '", saya perlu sedikit info tambahan dulu — apa yang sudah kamu ketahui soal ini?',
  ];
  return pickVariant('question', templates, prompt);
}

function replySummarize(prompt) {
  const src = prompt.replace(/^ringkas(kan)?\s*:?\s*/i, '').trim() || prompt;
  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return 'Ringkasan: ' + src;
  const head = sentences[0];
  const tail = sentences[sentences.length - 1];
  return 'Ringkasan: ' + head + (tail !== head ? ' ... ' + tail : '');
}

function replyContentIdeas(prompt) {
  const topic =
    prompt
      .replace(/^(kasih|beri|berikan)\s+/i, '')
      .replace(/ide\s+konten\s*(tentang|soal|untuk)?\s*/i, '')
      .trim() || 'topik ini';
  return [
    '1. Bagikan tips praktis seputar ' + topic + ' dalam format singkat.',
    '2. Buat cerita atau pengalaman pribadi yang berhubungan dengan ' + topic + '.',
    '3. Rangkum kesalahan umum seputar ' + topic + ' beserta solusinya.',
  ].join('\n');
}

function replyExplain(prompt) {
  const topic =
    prompt
      .replace(/^jelaskan\s*/i, '')
      .replace(/^apa\s+itu\s*/i, '')
      .replace(/^tentang\s*/i, '')
      .trim() || 'hal ini';
  const label = topic.charAt(0).toUpperCase() + topic.slice(1);
  return (
    label +
    ' secara sederhana adalah konsep yang berkaitan dengan "' +
    topic +
    '". Contohnya, dalam percakapan sehari-hari, "' +
    topic +
    '" biasanya muncul saat membahas topik yang relevan dengannya.'
  );
}

function replyGeneric(prompt, context) {
  const topic = lastTopic(context);
  const templates =
    topic && topic !== prompt
      ? [
          GENERIC_PREFIX + ' "' + prompt + '" — melanjutkan dari yang kita bahas sebelumnya. Ada detail lain yang ingin ditambahkan?',
          GENERIC_PREFIX + ' "' + prompt + '", masih berkaitan dengan "' + topic + '". Mau saya bantu lebih spesifik di bagian mana?',
        ]
      : [GENERIC_PREFIX + ' "' + prompt + '". Ceritakan lebih lanjut supaya saya bisa membantu lebih baik.'];
  return pickVariant('generic', templates, prompt);
}

function craft(prompt, context, options) {
  const text = String(prompt || '').trim();
  if (!text) return FALLBACK_TEXT;
  const opts = options || {};

  if (/^ringkas(kan)?\b/i.test(text) && !/percakapan|chat\b/i.test(text)) return replySummarize(text);
  if (/ide konten/i.test(text)) return replyContentIdeas(text);
  if (/^jelaskan\b/i.test(text)) return replyExplain(text);

  if (TIME_GREETING_RE.test(text)) return replyTimeGreeting(opts.now, opts, text);
  if (PLAIN_GREETING_RE.test(text)) return replyPlainGreeting(text, opts);

  const smalltalk = matchSmalltalk(text, opts) || matchSmalltalk(normalizeSlang(text), opts);
  if (smalltalk) return smalltalk;

  if (isQuestion(text)) return replyQuestion(text);
  return replyGeneric(text, context);
}

let initialized = false;

async function init() {
  await loadSapaan();
  initialized = true;
  return true;
}

async function generate(context, prompt, options) {
  try {
    if (!initialized) await init();
    const history = Array.isArray(context) ? context.slice(-10) : [];
    return craft(prompt, history, options);
  } catch (e) {
    return FALLBACK_TEXT;
  }
}

function isFallback(text) {
  return text === FALLBACK_TEXT;
}

function isWeak(text) {
  return text === FALLBACK_TEXT || String(text || '').startsWith(GENERIC_PREFIX);
}

export const llmEngine = Object.freeze({
  init,
  generate,
  isFallback,
  isWeak,
  get ready() {
    return initialized;
  },
});
