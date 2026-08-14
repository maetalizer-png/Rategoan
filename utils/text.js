export const STOPWORDS = new Set([
  'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka',
  'yang', 'dan', 'atau', 'di', 'ke', 'dari', 'untuk', 'pada', 'dengan',
  'ini', 'itu', 'ada', 'apa', 'siapa', 'kapan', 'dimana', 'mengapa', 'kenapa', 'bagaimana', 'berapa',
  'saja', 'juga', 'akan', 'sudah', 'belum', 'tidak', 'bukan', 'ya', 'ga', 'gak', 'lalu', 'lanjut',
]);

export function hashText(text) {
  let h = 0;
  const s = String(text || '');
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

const variantTurns = new Map();
const variantLast = new Map();

export function pickVariant(intent, templates, text) {
  if (!templates || !templates.length) return '';
  if (templates.length === 1) return templates[0];
  const base = (variantTurns.get(intent) || 0) + hashText(text);
  let idx = base % templates.length;
  if (variantLast.get(intent) === idx) idx = (idx + 1) % templates.length;
  variantTurns.set(intent, (variantTurns.get(intent) || 0) + 1);
  variantLast.set(intent, idx);
  return templates[idx];
}

export function meaningfulWords(text) {
  return String(text || '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

export function detectTone(text) {
  const t = String(text || '').toLowerCase();
  if (/\banda\b/.test(t)) return 'formal';
  if (/\b(lu|elu|gw|gue|bro|kak|cuy|bang)\b/.test(t)) return 'casual';
  return 'neutral';
}
