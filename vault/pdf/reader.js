const PDFJS_MJS_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.min.mjs';
const PDFJS_WORKER_URL = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';
const PACKAGE_SIZE_MB = 10;

let downloadState = 'idle';

function isReady() {
  return typeof window !== 'undefined' && !!window.pdfjsLib;
}

async function downloadPackage() {
  if (isReady()) {
    downloadState = 'ready';
    return true;
  }
  downloadState = 'downloading';
  try {
    const mod = await import(PDFJS_MJS_URL);
    mod.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_URL;
    window.pdfjsLib = mod;
    downloadState = 'ready';
    return true;
  } catch (e) {
    downloadState = 'failed';
    return false;
  }
}

async function parsePDF(arrayBuffer) {
  if (!isReady()) {
    return {
      ok: false,
      stub: true,
      message: 'Fitur baca PDF butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
    };
  }
  try {
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((it) => it.str).join(' ') + '\n';
    }
    return { ok: true, text: text.trim(), pages: pdf.numPages };
  } catch (e) {
    return { ok: false, stub: false, message: 'Gagal membaca file PDF ini.' };
  }
}

export const pdfReader = Object.freeze({
  isReady,
  downloadPackage,
  parsePDF,
  get state() {
    return downloadState;
  },
  packageSizeMB: PACKAGE_SIZE_MB,
});
