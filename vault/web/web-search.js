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
  return { title: summary.title, extract: summary.extract, url: page || null, lang, source: 'wikipedia' };
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

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, '').trim();
}

// Wiktionary itu kamus kata per kata (bukan mesin cari teks penuh) - cuma
// masuk akal untuk query satu-dua kata. Dipakai sebagai fallback TERAKHIR
// kalau Wikipedia (ID maupun EN) sama sekali tidak nemu apa-apa, supaya
// pertanyaan definisi kata pendek masih punya peluang terjawab dari sumber
// lain di luar Wikipedia - bukan cuma satu domain terus.
async function searchWiktionary(query, lang) {
  const term = query.trim();
  if (!term || term.split(/\s+/).length > 3) return null;
  const url = 'https://' + lang + '.wiktionary.org/api/rest_v1/page/definition/' + encodeURIComponent(term);
  let data;
  try {
    data = await fetchJson(url);
  } catch (e) {
    return null;
  }
  const langKey = data && Object.keys(data)[0];
  const entry = langKey && data[langKey] && data[langKey][0];
  const defs = entry && entry.definitions;
  if (!defs || !defs.length) return null;
  const list = defs.slice(0, 3).map((d, i) => (i + 1) + '. ' + stripHtml(d.definition)).filter((s) => s.length > 2);
  if (!list.length) return null;
  return {
    title: term,
    extract: (entry.partOfSpeech ? entry.partOfSpeech + '\n' : '') + list.join('\n'),
    url: 'https://' + lang + '.wiktionary.org/wiki/' + encodeURIComponent(term),
    lang,
    source: 'wiktionary',
  };
}

async function search(query) {
  const q = String(query || '').trim();
  if (!q) return { ok: false, message: 'Mau cari apa di internet?' };
  if (typeof fetch !== 'function') return { ok: false, message: NETWORK_FAIL_MESSAGE };
  try {
    let result = await searchWikipedia(q, 'id');
    if (!result) result = await searchWikipedia(q, 'en');
    if (!result) result = await searchWiktionary(q, 'id');
    if (!result) result = await searchWiktionary(q, 'en');
    if (!result) return { ok: false, message: 'Sudah dicari di internet (Wikipedia & Wiktionary) tapi tidak ketemu hasil yang relevan untuk "' + q + '".' };
    return { ok: true, ...result };
  } catch (e) {
    return { ok: false, message: NETWORK_FAIL_MESSAGE };
  }
}

export const webSearch = Object.freeze({ search });
