const MAX_CHARS = 4000;
const CORS_MESSAGE =
  'Tidak bisa mengambil isi halaman ini langsung dari browser karena situs tersebut memblokir akses lintas-origin (CORS), atau sedang offline. Raget 100% berjalan lokal tanpa server perantara, jadi pengambilan konten web bergantung sepenuhnya pada izin CORS dari situs tujuan.';

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function read(url) {
  if (typeof fetch !== 'function') {
    return { ok: false, stub: true, message: CORS_MESSAGE };
  }
  let res;
  try {
    res = await fetch(url, { mode: 'cors' });
  } catch (e) {
    return { ok: false, stub: true, message: CORS_MESSAGE };
  }
  if (!res.ok) {
    return { ok: false, stub: false, message: 'Gagal mengambil halaman (status ' + res.status + ').' };
  }
  let html;
  try {
    html = await res.text();
  } catch (e) {
    return { ok: false, stub: false, message: 'Gagal membaca isi halaman.' };
  }
  const text = stripHtml(html).slice(0, MAX_CHARS);
  if (!text) return { ok: false, stub: false, message: 'Halaman berhasil diambil tapi tidak ada teks yang bisa dibaca.' };
  return { ok: true, text };
}

export const readWeb = Object.freeze({ read });
