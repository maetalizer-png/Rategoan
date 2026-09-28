import { detectTone, detectMood } from '../../utils/text.js';
import { toolsMath } from './tools-math.js';
import { toolsKode } from './tools-kode.js';

const RATING_GOOD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(bagus|keren|mantap|oke|tepat)|^bagus\b|^mantap\b/i;
const RATING_BAD_RE = /jawaban(mu|nya)?\s*(yang\s*)?(jelek|salah|kurang\s*tepat|ngawur)|^salah\b|^jelek\b/i;
const CLARIFY_MARKERS = /info tambahan dulu|ceritakan konteksnya|bagaimana kaitannya|apa yang sudah kamu ketahui/i;
const QUESTION_LEAD_RE = /^(siapa|apa|dimana|di\s*mana|kapan|berapa)\b/i;
const ABOUT_RE = /^(apa\s+yang\s+kamu\s+ketahui\s+tentang|ceritakan\s+tentang|cerita\s+(soal|tentang)|tentang|info)\s+/i;
const LAYANAN_KEYWORDS_RE = /\b(ktp|kk|sim|paspor|akta|npwp|dukcapil|pengaduan|komplain|loket|antr[ie]|berkas|calo)\b/i;
const CUACA_LIVE_RE = /^cuaca\s+(?:di\s+|kota\s+)?([a-z\s]{2,40}?)\s*(?:hari\s+ini|sekarang|saat\s+ini)?\??$/i;
const CUACA_EMOTION_WORDS_RE = /\b(panas|dingin|hujan|mendung|gerah|sejuk|deras|terik|adem)\b/i;

function detectCuacaLive(text) {
  const m = text.match(CUACA_LIVE_RE);
  if (!m) return null;
  const place = m[1].trim();
  if (!place || CUACA_EMOTION_WORDS_RE.test(place)) return null;
  return place;
}

const BERITA_LIVE_RE = /^(berita|kabar)\b.*\b(terkini|terbaru)\b|^(berita|kabar)\s+hari\s+ini\b|^(cari(kan)?)\s+(berita|kabar)\b/i;

function detectBeritaTopic(text) {
  if (!BERITA_LIVE_RE.test(text)) return null;
  return text.replace(/^(cari(kan)?)\s+/i, '').replace(/^(berita|kabar)\s+/i, '').replace(/\b(terkini|terbaru|hari\s+ini)\b/gi, '').replace(/^(tentang|soal)\s+/i, '').replace(/\?+$/, '').trim();
}

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

function detectRating(text) {
  const t = text.trim();
  if (RATING_GOOD_RE.test(t)) return true;
  if (RATING_BAD_RE.test(t)) return false;
  return null;
}

function detectTeaching(text) {
  const t = text.trim();
  if (/\?$/.test(t)) return null;
  if (/^(ap+a|siapa|dimana|di\s*mana|kapan|berapa|bagaimana|mengapa|kenapa|jelaskan|cara|langkah|ringkas|rangkum|ide|ingat|lupakan|bandingkan|kelebihan|kekurangan|hitung)\b/i.test(t)) return null;
  const m = t.match(/^(.+?)\s+adalah\s+(.+)$/i) || t.match(/^(.+?)\s+itu\s+(.+)$/i);
  if (!m) return null;
  const subject = m[1].trim();
  const value = m[2].replace(/[.!]+$/, '').trim();
  if (!subject || !value || subject.split(/\s+/).length > 8 || value.split(/\s+/).length > 12) return null;
  return { subject, value };
}

function detectTool(prompt) {
  const t = String(prompt || '').trim().toLowerCase();
  if (/\b(dari koleksi|di koleksi|tanya koleksi|yang saya simpan)\b/.test(t)) return 'cari_koleksi';
  if (/apa\s+yang\s+saya\s+simpan\s+tentang|apa\s+saja\s+yang\s+(saya\s+)?simpan\s+(di\s+)?koleksi/.test(t)) return 'cari_koleksi';
  if (/cari\s+.*di\s+semua|apa\s+yang\s+saya\s+punya\s+tentang/.test(t)) return 'cari_semua';
  if (/\b(cari|carikan|search)\b.*\binternet\b|^googling\s+/.test(t)) return 'websearch';
  if (/^bedah\s+https?:\/\//.test(t)) return 'bedah_url';
  if (/^ingat\s+(apa\s+)?(yang\s+saya\s+(catat|pernah\s+(bilang|cerita)|simpan)|soal|tentang)\b/.test(t)) return 'cari';
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/^(jelaskan|apa\s+itu|tentang)\s+/.test(t)) return 'jelaskan';
  if (toolsKode.isCodeQuestion(t)) return 'kode';
  return null;
}

function detectModeCommand(text) {
  const m = text.trim().match(/^(jawab\s+(singkat|ringkas|detail)|mode\s+(santai|formal))\s*$/i);
  if (!m) return null;
  if (m[2]) return { key: 'mode_richness', value: /detail/i.test(m[2]) ? 'detail' : 'singkat' };
  if (m[3]) return { key: 'mode_tone', value: m[3].toLowerCase() };
  return null;
}

function classifyIntent(t) {
  if (/^hitung\b/i.test(t) || toolsMath.isMathQuestion(t.toLowerCase())) return 'hitung';
  const tool = detectTool(t);
  if (tool) return tool;
  return null;
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

function isClarifyReply(text) {
  return CLARIFY_MARKERS.test(text) || text.startsWith('Saya catat:');
}

export const routerIntent = Object.freeze({
  moodOpener, detectRating, detectTeaching, detectTool, detectCuacaLive, detectBeritaTopic,
  detectModeCommand, classifyIntent, detectAnswerType, isClarifyReply, ABOUT_RE, QUESTION_LEAD_RE,
});
