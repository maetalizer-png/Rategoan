const PDFJS_VERSION = '4.0.379';
const PDFJS_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.min.js';
const PDFJS_WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/' + PDFJS_VERSION + '/pdf.worker.min.js';
const MAX_PAGES = 40;
const MAX_CHARS = 40000;

let loadPromise = null;

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Gagal memuat pustaka pembaca PDF (cek koneksi internet)'));
    document.head.appendChild(s);
  });
}

function ensurePdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
  if (!loadPromise) {
    loadPromise = loadScript(PDFJS_SRC).then(() => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_SRC;
      return window.pdfjsLib;
    });
  }
  return loadPromise;
}

export async function extractPdfText(arrayBuffer) {
  const pdfjsLib = await ensurePdfJs();
  const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = Math.min(doc.numPages, MAX_PAGES);
  let out = '';
  for (let i = 1; i <= numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    out += content.items.map((it) => it.str).join(' ') + '\n';
    if (out.length > MAX_CHARS) break;
  }
  return out.slice(0, MAX_CHARS).trim();
}
