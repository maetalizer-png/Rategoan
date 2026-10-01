import { libLoader } from '../../shared/lib-loader.js';

const TESSERACT_URL = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
const PACKAGE_SIZE_MB = 15;

let downloadState = 'idle';

function isReady() {
  return typeof window !== 'undefined' && !!window.Tesseract;
}

async function downloadPackage() {
  if (isReady()) {
    downloadState = 'ready';
    return true;
  }
  downloadState = 'downloading';
  try {
    await libLoader.loadScript(TESSERACT_URL, isReady);
    downloadState = 'ready';
    return true;
  } catch (e) {
    downloadState = 'failed';
    return false;
  }
}

async function recognize(file) {
  if (!isReady()) {
    return {
      ok: false,
      stub: true,
      message: 'Fitur baca gambar (OCR) butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
    };
  }
  try {
    const result = await window.Tesseract.recognize(file, 'eng+ind');
    return { ok: true, text: String(result.data.text || '').trim() };
  } catch (e) {
    return { ok: false, stub: false, message: 'OCR gagal membaca gambar ini.' };
  }
}

export const ocrReader = Object.freeze({
  isReady,
  downloadPackage,
  recognize,
  get state() {
    return downloadState;
  },
  packageSizeMB: PACKAGE_SIZE_MB,
});
