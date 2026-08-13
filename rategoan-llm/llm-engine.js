const FALLBACK_TEXT = 'Maaf, saya belum paham. Coba ulangi dengan kata lain?';

const GREETING_WORDS = ['halo', 'hai', 'hi', 'hey', 'pagi', 'siang', 'sore', 'malam', 'assalamualaikum', 'permisi'];
const QUESTION_WORDS = ['apa', 'siapa', 'kapan', 'dimana', 'di mana', 'mengapa', 'kenapa', 'bagaimana', 'berapa', 'gimana'];

let greetingTurn = 0;
let questionTurn = 0;
let genericTurn = 0;
let initialized = false;

function isGreeting(text) {
  const t = text.toLowerCase();
  return GREETING_WORDS.some((g) => t === g || t.startsWith(g + ' ') || t.startsWith(g + ',') || t.startsWith(g + '!'));
}

function isQuestion(text) {
  const t = text.trim().toLowerCase();
  if (t.endsWith('?')) return true;
  return QUESTION_WORDS.some((w) => t.startsWith(w + ' ') || t.includes(' ' + w + ' '));
}

function lastTopic(context) {
  const list = Array.isArray(context) ? context : [];
  const lastUser = [...list].reverse().find((m) => m.role === 'user');
  return lastUser ? lastUser.text.slice(0, 60) : null;
}

function pick(templates, turn) {
  return templates[turn % templates.length];
}

function replyGreeting(name) {
  const label = name || 'Raget';
  const templates = [
    'Halo! Saya ' + label + ', ada yang bisa dibantu?',
    'Hai, senang bisa ngobrol denganmu. Mau bahas apa hari ini?',
    'Halo juga! Ceritakan apa yang sedang kamu pikirkan.',
  ];
  const reply = pick(templates, greetingTurn);
  greetingTurn++;
  return reply;
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
  const reply = pick(templates, questionTurn);
  questionTurn++;
  return reply;
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
          'Baik, soal "' + prompt + '" — melanjutkan dari yang kita bahas sebelumnya, saya catat ya. Ada detail lain yang ingin ditambahkan?',
          'Saya catat "' + prompt + '", masih berkaitan dengan "' + topic + '". Mau saya bantu lebih spesifik di bagian mana?',
        ]
      : ['Saya catat: "' + prompt + '". Ceritakan lebih lanjut supaya saya bisa membantu lebih baik.'];
  const reply = pick(templates, genericTurn);
  genericTurn++;
  return reply;
}

function craft(prompt, context, options) {
  const text = String(prompt || '').trim();
  if (!text) return FALLBACK_TEXT;
  const opts = options || {};
  if (/^ringkas(kan)?\b/i.test(text)) return replySummarize(text);
  if (/ide konten/i.test(text)) return replyContentIdeas(text);
  if (/^jelaskan\b/i.test(text)) return replyExplain(text);
  if (isGreeting(text)) return replyGreeting(opts.personaName);
  if (isQuestion(text)) return replyQuestion(text, context);
  return replyGeneric(text, context);
}

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

export const llmEngine = Object.freeze({
  init,
  generate,
  isFallback,
  get ready() {
    return initialized;
  },
});
