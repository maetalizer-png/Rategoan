import { libLoader } from '../../shared/lib-loader.js';

const TRANSFORMERS_URL = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';
const PACKAGE_SIZE_MB = 60;
const SUPPORTED_LANGS = ['id', 'en', 'ja', 'ko', 'zh', 'es', 'fr', 'de', 'ar', 'ru'];
const MODEL_TO_EN = 'Xenova/opus-mt-mul-en';
const MODEL_EN_ID = 'Xenova/opus-mt-en-id';

let toEnPromise = null;
let enIdPromise = null;
let downloadState = 'idle';

function isReady() {
  return !!toEnPromise || !!enIdPromise;
}

async function downloadPackage() {
  if (toEnPromise && enIdPromise) return true;
  downloadState = 'downloading';
  try {
    const mod = await libLoader.loadModule(TRANSFORMERS_URL);
    if (!toEnPromise) toEnPromise = mod.pipeline('translation', MODEL_TO_EN);
    if (!enIdPromise) enIdPromise = mod.pipeline('translation', MODEL_EN_ID);
    await toEnPromise;
    try {
      await enIdPromise;
    } catch (e) {
      enIdPromise = null;
    }
    downloadState = 'ready';
    return true;
  } catch (e) {
    downloadState = 'failed';
    toEnPromise = null;
    enIdPromise = null;
    return false;
  }
}

function chunkText(text, size) {
  const s = String(text || '');
  const chunks = [];
  for (let i = 0; i < s.length; i += size) chunks.push(s.slice(i, i + size));
  return chunks.length ? chunks : [s];
}

async function runPipe(pipePromise, text) {
  const translator = await pipePromise;
  const chunks = chunkText(text, 500);
  const results = await Promise.all(chunks.map((c) => translator(c)));
  return results.map((r) => r[0].translation_text).join(' ');
}

async function translate(text, targetLang) {
  const lang = String(targetLang || '').toLowerCase();
  if (!SUPPORTED_LANGS.includes(lang)) {
    return { ok: false, stub: false, message: 'Bahasa tujuan "' + targetLang + '" belum didukung. Bahasa tersedia: ' + SUPPORTED_LANGS.join(', ') + '.' };
  }
  if (lang === 'id') {
    if (!enIdPromise) {
      return {
        ok: false,
        stub: !toEnPromise,
        message: toEnPromise
          ? 'Arah Inggris → Indonesia belum siap. Unduh ulang paket terjemahan dari Settings.'
          : 'Fitur terjemahan butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
      };
    }
    try {
      return { ok: true, text: await runPipe(enIdPromise, text) };
    } catch (e) {
      return { ok: false, stub: false, message: 'Terjemahan gagal diproses.' };
    }
  }
  if (lang !== 'en') {
    return { ok: false, stub: false, message: 'Paket saat ini mendukung terjemahan ke bahasa Inggris (X→en) dan Inggris → Indonesia (en→id).' };
  }
  if (!toEnPromise) {
    return {
      ok: false,
      stub: true,
      message: 'Fitur terjemahan butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
    };
  }
  try {
    return { ok: true, text: await runPipe(toEnPromise, text) };
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
