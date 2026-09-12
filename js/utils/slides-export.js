const PPTXGENJS_VERSION = '3.12.0';
const PPTXGENJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/PptxGenJS/' + PPTXGENJS_VERSION + '/pptxgen.bundle.min.js';
const BULLETS_PER_SLIDE = 4;
const MAX_SLIDES = 20;

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

// Sama pola dengan pdf-extract.js: dimuat lazy dari CDN, bukan di-bundle -
// cuma dipakai sesekali, tidak sepadan menambah ukuran PWA offline.
function ensurePptxGenJs() {
  if (window.PptxGenJS) return Promise.resolve(window.PptxGenJS);
  if (!loadPromise) {
    loadPromise = loadScript(PPTXGENJS_SRC).then(() => window.PptxGenJS);
  }
  return loadPromise;
}

// Bagi teks jadi kerangka slide: 1 slide judul + slide isi (maks 4 poin
// tiap slide, dari kalimat berurutan) - transformasi STRUKTUR dari teks
// yang sudah ada, bukan mengarang konten baru (Rategoan tidak generatif).
export function buildOutline(text, judul) {
  const sentences = String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.length > 3);
  const slides = [{ title: judul, bullets: [] }];
  for (let i = 0; i < sentences.length && slides.length < MAX_SLIDES; i += BULLETS_PER_SLIDE) {
    slides.push({
      title: judul + ' (' + slides.length + '/' + Math.ceil(Math.min(sentences.length, MAX_SLIDES * BULLETS_PER_SLIDE) / BULLETS_PER_SLIDE) + ')',
      bullets: sentences.slice(i, i + BULLETS_PER_SLIDE),
    });
  }
  return slides;
}

export async function exportSlides(slides, fileName) {
  const PptxGenJS = await ensurePptxGenJs();
  const pptx = new PptxGenJS();
  slides.forEach((slide, i) => {
    const s = pptx.addSlide();
    s.addText(slide.title, { x: 0.5, y: 0.4, w: 9, h: 1, fontSize: i === 0 ? 32 : 26, bold: true, color: '1a1a1a' });
    if (slide.bullets && slide.bullets.length) {
      s.addText(
        slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })),
        { x: 0.6, y: 1.5, w: 8.8, h: 5, fontSize: 16, color: '333333', valign: 'top' }
      );
    }
  });
  await pptx.writeFile({ fileName: fileName || 'slide.pptx' });
}
