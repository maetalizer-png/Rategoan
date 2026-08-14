import { libLoader } from '../system-libs/lib-loader.js';

const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';
const PACKAGE_SIZE_MB = 30;
const SUPPORTED_LANGS = ['id', 'en', 'ja', 'ko', 'zh', 'es', 'fr', 'de', 'ar', 'ru'];

let pipelinePromise = null;
let downloadState = 'idle';

function isReady() {
  return !!pipelinePromise;
}

async function downloadPackage() {
  if (pipelinePromise) return true;
  downloadState = 'downloading';
  try {
    const mod = await libLoader.loadModule(TRANSFORMERS_URL);
    pipelinePromise = mod.pipeline('translation', 'Xenova/opus-mt-mul-en');
    await pipelinePromise;
    downloadState = 'ready';
    return true;
  } catch (e) {
    downloadState = 'failed';
    pipelinePromise = null;
    return false;
  }
}

function chunkText(text, size) {
  const s = String(text || '');
  const chunks = [];
  for (let i = 0; i < s.length; i += size) chunks.push(s.slice(i, i + size));
  return chunks.length ? chunks : [s];
}

async function translate(text, targetLang) {
  const lang = String(targetLang || '').toLowerCase();
  if (!SUPPORTED_LANGS.includes(lang)) {
    return { ok: false, stub: false, message: 'Bahasa tujuan "' + targetLang + '" belum didukung. Bahasa tersedia: ' + SUPPORTED_LANGS.join(', ') + '.' };
  }
  if (!pipelinePromise) {
    return {
      ok: false,
      stub: true,
      message: 'Fitur terjemahan butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
    };
  }
  if (lang !== 'en') {
    return { ok: false, stub: false, message: 'Paket saat ini hanya mendukung terjemahan ke bahasa Inggris (X→en). Dukungan arah lain akan ditambah di paket berikutnya.' };
  }
  try {
    const translator = await pipelinePromise;
    const chunks = chunkText(text, 500);
    const results = await Promise.all(chunks.map((c) => translator(c)));
    return { ok: true, text: results.map((r) => r[0].translation_text).join(' ') };
  } catch (e) {
    return { ok: false, stub: false, message: 'Terjemahan gagal diproses.' };
  }
}

export const translator = Object.freeze({
  isReady,
  downloadPackage,
  translate,
  get state() {
    return downloadState;
  },
  packageSizeMB: PACKAGE_SIZE_MB,
  supportedLangs: SUPPORTED_LANGS,
});
