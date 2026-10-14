import { answerComposer } from '../../raget/raget-agents/answer-composer.js';

const MAX_CHARS = 4000;
const CORS_MESSAGE =
  'Tidak bisa mengambil isi halaman ini — situs tujuan memblokir akses langsung (CORS/anti-bot) dan jalur cadangan (Jina Reader) juga gagal, atau sedang offline. Raget 100% berjalan lokal tanpa server perantara, jadi pengambilan konten web bergantung sepenuhnya pada izin situs tujuan.';

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchDirect(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const html = await res.text();
  return stripHtml(html).slice(0, MAX_CHARS);
}

async function fetchViaJina(url) {
  const res = await fetch('https://r.jina.ai/' + url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  return String(text || '').trim().slice(0, MAX_CHARS);
}

function blockedUrl(raw) {
  let url;
  try { url = new URL(String(raw || '')); } catch (e) { return true; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return true;
  if (url.username || url.password) return true;
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '').split('%')[0];
  if (host === 'localhost' || host === 'metadata' || host === 'metadata.google.internal' || host.endsWith('.local') || host.endsWith('.internal') || host === '0.0.0.0' || host === '255.255.255.255' || host === '::' || host === '::1') return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
  if (/^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./.test(host)) return true;
  if (/^198\.1[89]\./.test(host)) return true;
  if (/^(192\.0\.0\.|192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(host)) return true;
  if (/^(22[4-9]|23\d|24\d|25[0-5])\./.test(host)) return true;
  if (host.indexOf(':') >= 0 && (/^f[cd]/.test(host) || host.startsWith('fe80') || host.includes('ffff:'))) return true;
  return false;
}

async function read(url) {
  if (blockedUrl(url)) return { ok: false, stub: true, message: 'Alamat privat ditolak.' };
  if (typeof fetch !== 'function') {
    return { ok: false, stub: true, message: CORS_MESSAGE };
  }
  try {
    const text = await fetchDirect(url);
    if (text) return { ok: true, text: await answerComposer.lockAnswer('', text) };
  } catch (e) { console.warn('[Rategoan Fallback] read-web:', e); }
  try {
    const text = await fetchViaJina(url);
    if (text) return { ok: true, text: await answerComposer.lockAnswer('', text), viaJina: true };
  } catch (e) { console.warn('[Rategoan Fallback] read-web:', e); }
  return { ok: false, stub: true, message: CORS_MESSAGE };
}

export const readWeb = Object.freeze({ read });
