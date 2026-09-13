const PPTXGENJS_VERSION = '3.12.0';
const PPTXGENJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/' + PPTXGENJS_VERSION + '/pptxgen.bundle.min.js';
const BULLETS_PER_SLIDE = 3;
const MAX_CONTENT = 5;
const INK = '0B0C0E';
const PAPER = 'E8E6E1';
const MUTED = '9AA8B0';
const RULE = '8B8D86';

let loadPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat pustaka pembuat slide (cek koneksi internet)'));
    document.head.appendChild(s);
  });
}

function ensurePptxGenJs() {
  if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
  if (!loadPromise) loadPromise = loadScript(PPTXGENJS_SRC).then(() => window.PptxGenJS);
  return loadPromise;
}

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
  const PptxGenJS = await ensurePptxGenJs();
  const pptx = new PptxGenJS();
  slides.forEach((slide) => {
    const s = pptx.addSlide();
    s.background = { color: INK };
    s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.08, h: 5.63, fill: { color: RULE } });
    if (slide.kind === 'cover') {
      s.addText(slide.title, { x: 0.7, y: 1.8, w: 8.6, h: 1.4, fontSize: 34, bold: true, color: PAPER, fontFace: 'Calibri' });
      if (slide.bullets && slide.bullets[0]) {
        s.addText(slide.bullets[0], { x: 0.7, y: 3.3, w: 8.4, h: 1, fontSize: 16, color: MUTED, fontFace: 'Calibri' });
      }
      return;
    }
    s.addText(slide.title, { x: 0.7, y: 0.4, w: 8.6, h: 0.8, fontSize: 24, bold: true, color: PAPER, fontFace: 'Calibri' });
    if (slide.bullets && slide.bullets.length) {
      s.addText(
        slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        { x: 0.8, y: 1.4, w: 8.4, h: 3.6, fontSize: 18, color: PAPER, fontFace: 'Calibri', valign: 'top' }
      );
    }
  });
  await pptx.writeFile({ fileName: fileName || 'slide.pptx' });
}
