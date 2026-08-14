import { libLoader } from '../system-libs/lib-loader.js';

const JSZIP_URL = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
const PACKAGE_SIZE_MB = 1;

let downloadState = 'idle';

function isReady() {
  return typeof window !== 'undefined' && !!window.JSZip;
}

async function downloadPackage() {
  if (isReady()) {
    downloadState = 'ready';
    return true;
  }
  downloadState = 'downloading';
  try {
    await libLoader.loadScript(JSZIP_URL, isReady);
    downloadState = 'ready';
    return true;
  } catch (e) {
    downloadState = 'failed';
    return false;
  }
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(fileName) {
  return String(fileName || '')
    .replace(/\.(html|md)$/i, '')
    .replace(/\s[a-f0-9]{32}$/i, '')
    .trim();
}

async function importZip(arrayBuffer) {
  if (!isReady()) {
    return {
      ok: false,
      stub: true,
      message: 'Fitur impor Notion butuh paket unduhan satu kali (±' + PACKAGE_SIZE_MB + ' MB). Buka Settings > Unduhan Fitur untuk mengaktifkan.',
    };
  }
  try {
    const zip = await window.JSZip.loadAsync(arrayBuffer);
    const chunks = [];
    const paths = Object.keys(zip.files);
    for (const path of paths) {
      const entry = zip.files[path];
      if (entry.dir || !/\.(html|md)$/i.test(path)) continue;
      const content = await entry.async('string');
      const text = /\.html$/i.test(path) ? stripHtml(content) : content;
      if (!text.trim()) continue;
      const parts = path.split('/').filter(Boolean);
      const breadcrumb = parts.slice(0, -1).map(cleanTitle).join(' > ');
      chunks.push({ title: cleanTitle(parts[parts.length - 1]), breadcrumb, text: text.slice(0, 4000) });
    }
    return { ok: true, chunks };
  } catch (e) {
    return { ok: false, stub: false, message: 'Gagal membuka file ZIP Notion ini.' };
  }
}

export const notionImporter = Object.freeze({
  isReady,
  downloadPackage,
  importZip,
  get state() {
    return downloadState;
  },
  packageSizeMB: PACKAGE_SIZE_MB,
});
