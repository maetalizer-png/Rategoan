const NETWORK_FAIL_MESSAGE =
  'Gagal mengakses internet untuk pencarian ini — bisa karena tidak ada koneksi, atau Wikipedia sedang memblokir akses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi pencarian internet langsung bergantung pada koneksi perangkat ini.';

async function fetchJson(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function searchWikipedia(query, lang) {
  const searchUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=opensearch&search=' +
    encodeURIComponent(query) + '&limit=1&namespace=0&format=json&origin=*';
  const data = await fetchJson(searchUrl);
  const title = data && data[1] && data[1][0];
  if (!title) return null;
  const summaryUrl = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const summary = await fetchJson(summaryUrl);
  if (!summary || !summary.extract) return null;
  const page = summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page;
  return { title: summary.title, extract: summary.extract, url: page || null, lang };
}

async function search(query) {
  const q = String(query || '').trim();
  if (!q) return { ok: false, message: 'Mau cari apa di internet?' };
  if (typeof fetch !== 'function') return { ok: false, message: NETWORK_FAIL_MESSAGE };
  try {
    let result = await searchWikipedia(q, 'id');
    if (!result) result = await searchWikipedia(q, 'en');
    if (!result) return { ok: false, message: 'Sudah dicari di internet tapi tidak ketemu hasil yang relevan untuk "' + q + '".' };
    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, message: NETWORK_FAIL_MESSAGE };
  }
}

export const webSearch = Object.freeze({ search });
