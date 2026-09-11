const NETWORK_FAIL_MESSAGE =
  'Gagal mengakses internet untuk pencarian ini — bisa karena tidak ada koneksi, atau Wikipedia sedang memblokir akses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi pencarian internet langsung bergantung pada koneksi perangkat ini.';

async function fetchJson(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

async function fetchSummaryByTitle(title, lang) {
  const summaryUrl = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const summary = await fetchJson(summaryUrl);
  if (!summary || !summary.extract) return null;
  const page = summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page;
  return { title: summary.title, extract: summary.extract, url: page || null, lang };
}

// Pencarian teks penuh (action=query&list=search) dipakai sebagai jalur utama
// karena bisa cocokkan ISI artikel, bukan cuma awalan judul persis seperti
// opensearch - jadi query natural seperti "ilmuwan matematika terkenal" tetap
// bisa nemu artikel relevan meski judulnya tidak diawali kata itu persis.
// opensearch dipertahankan sebagai fallback kalau full-text search kosong.
async function searchWikipedia(query, lang) {
  const fullTextUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
    encodeURIComponent(query) + '&srlimit=1&format=json&origin=*';
  const fullTextData = await fetchJson(fullTextUrl);
  const hit = fullTextData && fullTextData.query && fullTextData.query.search && fullTextData.query.search[0];
  if (hit && hit.title) {
    const result = await fetchSummaryByTitle(hit.title, lang);
    if (result) return result;
  }

  const openSearchUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=opensearch&search=' +
    encodeURIComponent(query) + '&limit=1&namespace=0&format=json&origin=*';
  const openSearchData = await fetchJson(openSearchUrl);
  const title = openSearchData && openSearchData[1] && openSearchData[1][0];
  if (!title) return null;
  return await fetchSummaryByTitle(title, lang);
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
