import { hashText, pickVariant } from '../utils/text.js';

const FALLBACK_TEXT = 'Maaf, saya belum paham. Coba ulangi dengan kata lain?';
const GENERIC_PREFIX = 'Saya catat:';

const TIME_GREETING_RE = /^(selamat|met)?\s*(pagi|siang|sore|malam)\b|^good\s*(morning|afternoon|evening|night)\b/i;
const PLAIN_GREETING_RE = /^(halo+|hai+|hey+|hi)\b|^assalamu.?alaikum\b|^permisi\b/i;
const QUESTION_WORDS = ['apa', 'siapa', 'kapan', 'dimana', 'di mana', 'mengapa', 'kenapa', 'bagaimana', 'berapa', 'gimana'];

const TIME_GREETING_TEMPLATES = {
  pagi: [
    'Selamat pagi! Ada yang bisa saya bantu?',
    'Pagi! Semoga harimu menyenangkan, mau mulai dari mana?',
    'Pagi juga, ada rencana apa hari ini?',
  ],
  siang: ['Selamat siang! Ada yang bisa dibantu?', 'Siang, gimana harimu sejauh ini? Yuk, mau bahas apa?'],
  sore: ['Selamat sore! Ada yang bisa saya bantu?', 'Sore juga, gimana harimu sejauh ini?'],
  malam: [
    'Selamat malam! Ada yang bisa saya bantu?',
    'Malam juga, mau ngobrol soal apa malam ini?',
    'Malam, semoga harimu berjalan baik. Ada yang bisa dibantu?',
  ],
};

const EN_PERIOD_MAP = { morning: 'pagi', afternoon: 'siang', evening: 'sore', night: 'malam' };

function mirrorTemplates(statedPeriod, devicePeriod) {
  return [
    'Selamat ' + statedPeriod + ' juga! (Di sini masih ' + devicePeriod + ', tapi tetap semangat ya)',
    statedPeriod.charAt(0).toUpperCase() + statedPeriod.slice(1) + ' juga! (Waktu di perangkatku sih masih ' + devicePeriod + ')',
  ];
}

const PLAIN_GREETING_TEMPLATES = [
  'Halo! Saya {name}, ada yang bisa dibantu?',
  'Hai, senang bisa ngobrol denganmu. Mau bahas apa?',
  'Halo juga! Ceritakan apa yang sedang kamu pikirkan.',
];

const SMALLTALK = [
  {
    key: 'siapa',
    re: /siapa\s+(kamu|anda)\b|kamu\s+siapa/i,
    templates: [
      'Saya {name}, asisten lokal di Rategoan — semua obrolan kita tersimpan di perangkatmu sendiri.',
      'Kenalkan, saya {name}. Saya bisa bantu jawab, ringkas, hitung, dan ingat hal penting selama kita ngobrol.',
    ],
  },
  {
    key: 'kabar',
    re: /\bkabar\s*(kamu|anda|lu|elu)\b|\bkabarmu\b|\b(apa|gimana|bagaimana)\s+kabar\b|how\s+are\s+you/i,
    templates: [
      'Saya baik, terima kasih sudah nanya! Kamu sendiri gimana kabarnya?',
      'Baik-baik saja di sini. Ada yang ingin kamu ceritakan hari ini?',
    ],
    templatesFormal: [
      'Saya baik, terima kasih sudah bertanya. Bagaimana kabar Anda hari ini?',
      'Baik-baik saja, terima kasih. Ada yang bisa saya bantu?',
    ],
  },
  {
    key: 'terima_kasih',
    re: /terima\s*kasih|makasih|thanks|thank\s*you/i,
    templates: ['Sama-sama! Kalau ada pertanyaan lain, tinggal tanya saja.', 'Senang bisa bantu. Ada lagi yang mau ditanyakan?'],
  },
  {
    key: 'jumpa',
    re: /sampai\s+jumpa|dad+ah|^bye\b|selamat\s+tinggal/i,
    templates: [
      'Sampai jumpa! Saya di sini kalau kamu butuh sesuatu lagi.',
      'Dadah! Jangan ragu balik lagi kalau ada yang mau dibahas.',
    ],
  },
  {
    key: 'kemampuan',
    re: /kamu\s+bisa\s+apa|kemampuan(mu|kamu)?\b|apa\s+yang\s+bisa\s+kamu\s+lakukan/i,
    templates: [
      'Saya bisa ngobrol, meringkas teks, menghitung, kasih ide konten, jelaskan istilah, dan mengingat hal penting soal kamu — semua tanpa internet.',
      'Beberapa hal yang bisa saya bantu: ringkas, hitung, cari info dari catatan, dan nemenin ngobrol santai.',
    ],
  },
];

const FOLLOWUPS = {
  greeting: ['Ada topik tertentu yang ingin kamu bahas?', 'Mau mulai dari mana hari ini?'],
  smalltalk: ['Ada hal lain yang ingin kamu ceritakan?'],
};

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

function detectTone(text) {
  const t = String(text || '').toLowerCase();
  if (/\banda\b/.test(t)) return 'formal';
  if (/\b(lu|elu|gw|gue|bro|kak|cuy|bang)\b/.test(t)) return 'casual';
  return 'neutral';
}

function matchSmalltalk(text, options) {
  const entry = SMALLTALK.find((s) => s.re.test(text));
  if (!entry) return null;
  const tone = detectTone(text);
  const pool = tone === 'formal' && entry.templatesFormal ? entry.templatesFormal : entry.templates;
  const picked = pickVariant('small_' + entry.key + '_' + tone, pool, text);
  const reply = withName(picked, options.personaName);
  return maybeFollowUp(reply, FOLLOWUPS.smalltalk);
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
    return maybeFollowUp(reply, FOLLOWUPS.greeting);
  }

  const templates = TIME_GREETING_TEMPLATES[devicePeriod];
  const reply = withName(pickVariant('greet_time_' + devicePeriod, templates, devicePeriod), options.personaName);
  return maybeFollowUp(reply, FOLLOWUPS.greeting);
}

function replyPlainGreeting(text, options) {
  const reply = withName(pickVariant('greet_plain', PLAIN_GREETING_TEMPLATES, text), options.personaName);
  return maybeFollowUp(reply, FOLLOWUPS.greeting);
}

function replyQuestion(prompt, context) {
  const topic = lastTopic(context);
  const echo = prompt.replace(/\?+$/, '').trim();
  const templates =
    topic && topic !== echo
      ? [
          'Menurutmu bagaimana kaitannya dengan "' + topic + '"? Boleh dijelaskan sedikit lebih detail soal "' + echo + '"?',
          'Melanjutkan dari "' + topic + '", soal "' + echo + '" — bisa ceritakan konteksnya supaya saya bisa bantu lebih tepat?',
        ]
      : [
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

const SLANG_MAP = {
  gak: 'tidak', ga: 'tidak', nggak: 'tidak', ngga: 'tidak',
  bt: 'bosan', gws: 'cepat sembuh', bgt: 'banget',
  yg: 'yang', dr: 'dari', utk: 'untuk', jd: 'jadi', dg: 'dengan',
  km: 'kamu', gw: 'saya', gue: 'saya',
};

function normalizeSlang(text) {
  return String(text || '')
    .split(/(\s+)/)
    .map((tok) => SLANG_MAP[tok.toLowerCase()] || tok)
    .join('');
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

  if (isQuestion(text)) return replyQuestion(text, context);
  return replyGeneric(text, context);
}

let initialized = false;

async function init() {
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
