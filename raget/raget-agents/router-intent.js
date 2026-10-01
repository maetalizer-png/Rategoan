import { detectTone, detectMood } from '../../shared/text.js';
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

const DEVLOG_SEJARAH_RE = /\b(sejarahmu|riwayatmu|riwayat\s+pengembanganmu)\b/i;
const DEVLOG_CARA_KERJA_RE = /\b(bagaimana\s+|gimana\s+)?cara\s+kerjamu\b/i;
const DEVLOG_JILID_RE = /\b(jilid|ronde)\s+[\w.-]+\s+(ngapain|ngerjain\s+apa|itu\s+ngapain)\b|\bapa\s+yang\s+dikerjakan\s+(di\s+)?(jilid|ronde)\s+[\w.-]+/i;
const DEVLOG_BUG_RE = /\bbug\s+(paling\s+)?ter?sulit(mu)?\b/i;
const DEVLOG_PEMBUAT_RE = /\bsiapa\s+(yang\s+)?(membuat|menciptakan|mengembangkan)mu\b|\bsiapa\s+pembuatmu\b/i;
const DEVLOG_SKOR_RE = /\bperkembangan\s+skormu\b|\bskormu\s+(sekarang\s+)?(gimana|bagaimana)\b/i;

function detectTool(prompt) {
  const t = String(prompt || '').trim().toLowerCase();
  if (DEVLOG_SEJARAH_RE.test(t)) return 'devlog_sejarah';
  if (DEVLOG_CARA_KERJA_RE.test(t)) return 'devlog_cara_kerja';
  if (DEVLOG_JILID_RE.test(t)) return 'devlog_jilid';
  if (DEVLOG_BUG_RE.test(t)) return 'devlog_bug_tersulit';
  if (DEVLOG_PEMBUAT_RE.test(t)) return 'devlog_pembuat';
  if (DEVLOG_SKOR_RE.test(t)) return 'devlog_skor';
  if (/^(mulai\s+|main\s+|kasih\s+(aku\s+|saya\s+)?|minta\s+|mau\s+(main\s+)?|coba\s+)?kuis\b/.test(t)) return 'kuis';
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+hari(\s+ini)?(\s+saya)?\b/.test(t)) return 'ringkas_hari';
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+minggu(\s+ini)?(\s+saya)?\b|digest\s+mingguan/.test(t)) return 'ringkas_minggu';
  if (/^(ringkas(kan)?|rangkum(kan)?)\s+(percakapan|chat)\b/.test(t)) return 'ringkas_percakapan';
  if (/^ringkas(kan)?\b|^rangkum(kan)?\b/.test(t)) return 'ringkas';
  if (/^bersihkan\s+duplikat/.test(t)) return 'bersihkan_duplikat';
  if (/ekspor\s+log|export\s+log|unduh\s+log/.test(t)) return 'ekspor';
  if (/laporan\s+otak/.test(t)) return 'laporan_otak';
  if (/share\s*(ke)?\s*wa\b|bagikan\s*(ke)?\s*whatsapp/.test(t)) return 'share_wa';
  if (/export\s+chat|download\s+percakapan|unduh\s+percakapan|ekspor\s+chat/.test(t)) return 'export_chat';
  if (/export\s+catatan|ekspor\s+catatan|unduh\s+catatan/.test(t)) return 'export_catatan';
  if (/^bagikan\s+kartu\s+/.test(t)) return 'bagikan_kartu';
  if (/^(buat|tulis|draft)\s+email\b/.test(t)) return 'email';
  if (/terapkan\s+auto-?fewshot/.test(t)) return 'apply_fewshot';
  if (/batalkan\s+auto-?fewshot/.test(t)) return 'revert_fewshot';
  if (/\b(dari koleksi|di koleksi|tanya koleksi)\b/.test(t)) return 'cari_koleksi';
  if (/apa\s+yang\s+saya\s+simpan\s+tentang|apa\s+saja\s+yang\s+(saya\s+)?simpan\s+(di\s+)?koleksi/.test(t)) return 'cari_koleksi';
  if (/cari\s+.*di\s+semua|apa\s+yang\s+saya\s+punya\s+tentang/.test(t)) return 'cari_semua';
  if (/^bedah\s+https?:\/\//.test(t)) return 'bedah_url';
  if (/^riset\b/.test(t) || /\briset\s+mendalam\b/.test(t)) return 'websearch';
  if (/\b(cari|carikan|search)\b.*\binternet\b|^googling\s+/.test(t)) return 'websearch';
  if (detectCuacaLive(t)) return 'cuaca_live';
  if (detectBeritaTopic(t) !== null) return 'berita_live';
  if (/^ingat\s+(apa\s+)?(yang\s+saya\s+(catat|pernah\s+(bilang|cerita)|simpan)|soal|tentang)\b/.test(t)) return 'cari';
  if (/^ingat\s+(bahwa\s+)?/.test(t)) return 'ingat';
  if (/^lupakan\b/.test(t)) return 'lupakan';
  if (/\bjam\s+berapa\b|\btanggal\s+berapa\b|\bhari\s+apa\b/.test(t)) return 'waktu';
  if (/apa\s+yang\s+kamu\s+tahu\s+tentang\b/.test(t)) return 'cari';
  if (/^bandingkan\s+/.test(t)) return 'bandingkan';
  if (/^[a-z0-9\s]{2,40}\s+vs\.?\s+[a-z0-9\s]{2,40}$/.test(t)) return 'bandingkan_vs';
  if (/^(kelebihan|kekurangan)\s*(dan|\/|serta)?\s*(kelebihan|kekurangan)?\s+/.test(t)) return 'kelebihan_kekurangan';
  if (/\b(buat(kan)?|tulis|susun)\s+(dokumen|laporan|makalah|catatan)\b/.test(t)) return 'dokumen';
  if (toolsKode.isCodeQuestion(t)) return 'kode';
  if (/^(cara|langkah)\s+/.test(t) && !LAYANAN_KEYWORDS_RE.test(t)) return 'cara';
  if (/^(kasih|beri|berikan|boleh|minta)?\s*ide\b/.test(t)) return 'ide';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?manfaat\s+/.test(t)) return 'manfaat';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?fungsi\s+(dari\s+|utama\s+)?/.test(t)) return 'fungsi';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?tujuan\s+(dari\s+|utama\s+)?/.test(t)) return 'tujuan';
  if (/^(apa\s+(saja\s+)?|sebutkan\s+)?penyebab\s+(dari\s+|utama\s+)?/.test(t)) return 'penyebab';
  if (/^(jelaskan|apa\s+itu|tentang)\s+/.test(t)) return 'jelaskan';
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
  moodOpener,
  detectRating,
  detectTeaching,
  detectTool,
  detectCuacaLive,
  detectBeritaTopic,
  detectModeCommand,
  classifyIntent,
  detectAnswerType,
  isClarifyReply,
  ABOUT_RE,
  QUESTION_LEAD_RE,
});
