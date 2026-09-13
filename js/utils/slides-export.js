import { buildPptxBytes, downloadBytes } from './pptx-local.js';

const MAX_BODY = 4;

function cleanSource(text) {
  return String(text || '')
    .replace(/Sumber::[^\n]+/g, '')
    .replace(/\(Sumber:[^)]+\)/g, '')
    .replace(/Ketuk Unduh file slide[^\n]*/gi, '')
    .replace(/#{1,3}\s+/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function sentencesOf(text) {
  return cleanSource(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter((s) => s.length > 12 && !/^yang biasa dibahas/i.test(s));
}

function finishSentence(s) {
  let t = String(s || '').replace(/^\s*[-•]\s*/, '').replace(/\s+/g, ' ').trim();
  t = t.replace(/[,:;]+$/, '');
  if (!t) return '';
  const words = t.split(/\s+/);
  if (words.length > 28) {
    t = words.slice(0, 28).join(' ').replace(/[,:;]+$/, '');
  }
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

function keyOf(s) {
  return finishSentence(s)
    .toLowerCase()
    .replace(/[^a-z0-9à-ÿ\s]/gi, '')
    .split(/\s+/)
    .slice(0, 8)
    .join(' ');
}

function classify(s) {
  const t = String(s || '').toLowerCase();
  if (/\b(sejarah|milenia|abad|era|prasejarah|tertua|paling tua)\b/.test(t)) return 'sejarah';
  if (/\b(tujuan|memahami)\b/.test(t)) return 'tujuan';
  if (/\b(disebut|ahli|tokoh|ilmuwan)\b/.test(t)) return 'orang';
  if (/\b(cabang|spesialisasi|biofisika)\b/.test(t)) return 'cabang';
  if (/\b(adalah|merupakan|yaitu)\b/.test(t)) return 'definisi';
  return 'pokok';
}

const SECTION = {
  definisi: 'Pengertian',
  tujuan: 'Tujuan',
  orang: 'Istilah',
  sejarah: 'Sejarah singkat',
  cabang: 'Cabang dan kaitan',
  pokok: 'Pokok bahasan',
};

export function buildOutline(text, judul) {
  const title = String(judul || 'Presentasi').replace(/\s+/g, ' ').trim() || 'Presentasi';
  const raw = sentencesOf(text).map(finishSentence).filter(Boolean);
  const seen = new Set();
  const unique = [];
  raw.forEach((s) => {
    const k = keyOf(s);
    if (!k || seen.has(k)) return;
    seen.add(k);
    unique.push(s);
  });
  const coverLine = unique[0] || title + '.';
  const slides = [{ kind: 'cover', title: title, bullets: [coverLine] }];
  const rest = unique.slice(1);
  const buckets = {};
  rest.forEach((s) => {
    const c = classify(s);
    if (!buckets[c]) buckets[c] = [];
    if (buckets[c].length < 3) buckets[c].push(s);
  });
  const order = ['definisi', 'tujuan', 'orang', 'sejarah', 'cabang', 'pokok'];
  order.forEach((c) => {
    if (slides.filter((x) => x.kind === 'body').length >= MAX_BODY) return;
    const items = buckets[c];
    if (!items || !items.length) return;
    slides.push({ kind: 'body', title: SECTION[c], bullets: items });
  });
  const close =
    unique.find((s) => classify(s) === 'tujuan') ||
    unique.find((s) => s !== coverLine) ||
    coverLine;
  slides.push({ kind: 'close', title: 'Yang perlu diingat', bullets: [close] });
  return slides;
}

export function previewOutline(slides) {
  const lines = ['# Pratinjau slide', ''];
  slides.forEach((s, i) => {
    const label = s.kind === 'cover' ? 'Cover' : s.kind === 'close' ? 'Penutup' : 'Isi';
    lines.push((i + 1) + '. ' + label + ' — ' + s.title);
    (s.bullets || []).forEach((b) => lines.push('- ' + b));
    lines.push('');
  });
  return lines.join('\n').trim();
}

export async function exportSlides(slides, fileName) {
  const bytes = buildPptxBytes(slides);
  downloadBytes(bytes, fileName || 'slide.pptx');
}

let held = null;

export function rememberSlide(outline, fileName) {
  held = { outline, fileName };
  return held;
}

export function heldSlide() {
  return held;
}
