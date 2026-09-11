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

// Jina Reader (r.jina.ai) - jasa "pembaca" pihak ketiga yang bertindak
// seperti browser biasa untuk bypass proteksi anti-bot/CORS situs yang
// menolak fetch() langsung dari kode (banyak situs berita begini). Dipakai
// sebagai fallback KEDUA, bukan jalur utama - situs yang memang mengizinkan
// CORS tetap diakses langsung dulu tanpa tambahan dependensi pihak ketiga.
async function fetchViaJina(url) {
  const res = await fetch('https://r.jina.ai/' + url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const text = await res.text();
  return String(text || '').trim().slice(0, MAX_CHARS);
}

async function read(url) {
  if (typeof fetch !== 'function') {
    return { ok: false, stub: true, message: CORS_MESSAGE };
  }
  try {
    const text = await fetchDirect(url);
    if (text) return { ok: true, text };
  } catch (e) {
    // lanjut ke fallback Jina Reader
  }
  try {
    const text = await fetchViaJina(url);
    if (text) return { ok: true, text, viaJina: true };
  } catch (e) {
    // dua-duanya gagal
  }
  return { ok: false, stub: true, message: CORS_MESSAGE };
}

export const readWeb = Object.freeze({ read });
