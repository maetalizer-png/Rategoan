import { buildPptxBytes, downloadBytes } from './pptx-local.js';

const BULLETS_PER_SLIDE = 3;
const MAX_CONTENT = 5;

function cleanSource(text) {
  return String(text || '')
    .replace(/Sumber::[^\n]+/g, '')
    .replace(/\(Sumber:[^)]+\)/g, '')
    .replace(/#{1,3}\s+/g, '')
    .replace(/^\s*[-•]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function shortPhrase(s, maxWords) {
  let t = String(s || '').replace(/^\s*[-•]\s*/, '').replace(/\s+/g, ' ').trim();
  t = t.replace(/[.!?]+$/, '');
  const words = t.split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  if (words.length <= maxWords) return t;
  return words.slice(0, maxWords).join(' ');
}

function titleCase(s, fallback) {
  const t = shortPhrase(s, 6);
  if (!t) return fallback || 'Isi';
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export function buildOutline(text, judul) {
  const raw = cleanSource(text);
  const sentences = raw.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter((s) => s.length > 8);
  const title = String(judul || 'Presentasi').replace(/\s+/g, ' ').trim() || 'Presentasi';
  const slides = [{ kind: 'cover', title: title, bullets: sentences[0] ? [shortPhrase(sentences[0], 16)] : [] }];
  const body = sentences.slice(sentences.length > 1 ? 1 : 0);
  const points = body.map((s) => shortPhrase(s, 12)).filter(Boolean);
  for (let i = 0; i < points.length && slides.filter((x) => x.kind === 'body').length < MAX_CONTENT; i += BULLETS_PER_SLIDE) {
    const chunk = points.slice(i, i + BULLETS_PER_SLIDE);
    slides.push({ kind: 'body', title: titleCase(chunk[0], title), bullets: chunk });
  }
  const closeBits = points.slice(0, 2);
  slides.push({
    kind: 'close',
    title: 'Intinya',
    bullets: closeBits.length ? closeBits : [shortPhrase(sentences[0] || title, 14)],
  });
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
