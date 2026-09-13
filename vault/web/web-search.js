const NETWORK_FAIL_MESSAGE =
  'Gagal mengakses internet untuk pencarian ini — bisa karena tidak ada koneksi, atau Wikipedia sedang memblokir akses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi pencarian internet langsung bergantung pada koneksi perangkat ini.';

const FETCH_TIMEOUT_MS = 12000;

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { mode: 'cors', signal: controller.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

function wikiPageUrl(title, lang) {
  return 'https://' + lang + '.wikipedia.org/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
}

async function fetchSummaryByTitle(title, lang) {
  const summaryUrl = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const summary = await fetchJson(summaryUrl);
  if (!summary || !summary.extract) return null;
  const page = summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page;
  return { title: summary.title, extract: summary.extract, url: page || wikiPageUrl(summary.title || title, lang), lang, source: 'wikipedia' };
}

function stripSearchSnippet(html) {
  return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function searchWikipedia(query, lang) {
  const fullTextUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
    encodeURIComponent(query) + '&srlimit=5&srprop=snippet|timestamp&format=json&origin=*';
  const fullTextData = await fetchJson(fullTextUrl);
  const hits = (fullTextData && fullTextData.query && fullTextData.query.search) || [];
  let result = null;
  if (hits[0] && hits[0].title) {
    result = await fetchSummaryByTitle(hits[0].title, lang);
  }
  if (!result) {
    const openSearchUrl =
      'https://' + lang + '.wikipedia.org/w/api.php?action=opensearch&search=' +
      encodeURIComponent(query) + '&limit=5&namespace=0&format=json&origin=*';
    const openSearchData = await fetchJson(openSearchUrl);
    const titles = (openSearchData && openSearchData[1]) || [];
    if (titles[0]) result = await fetchSummaryByTitle(titles[0], lang);
    if (result) {
      result.related = titles.slice(1, 5).map((title) => ({
        title,
        snippet: '',
        url: wikiPageUrl(title, lang),
      }));
    }
    return result;
  }
  result.related = hits.slice(1).map((h) => ({
    title: h.title,
    snippet: stripSearchSnippet(h.snippet),
    url: wikiPageUrl(h.title, lang),
  }));
  return result;
}

function stripHtml(s) {
  return String(s || '').replace(/<[^>]+>/g, '').trim();
}

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
    related: [],
  };
}

async function searchWikidata(query) {
  const url =
    'https://www.wikidata.org/w/api.php?action=wbsearchentities&search=' +
    encodeURIComponent(query) + '&language=id&format=json&origin=*&limit=4';
  const data = await fetchJson(url);
  const hits = (data && data.search) || [];
  const hit = hits.find((h) => h.description) || hits[0];
  if (!hit || !hit.description) return null;
  const label = hit.label || query;
  return {
    title: label,
    extract: label + ' — ' + hit.description + '.',
    url: hit.concepturi || ('https://www.wikidata.org/wiki/' + hit.id),
    lang: 'id',
    source: 'wikidata',
    related: hits.slice(1, 4).filter((h) => h.label).map((h) => ({
      title: h.label,
      snippet: h.description || '',
      url: h.concepturi || ('https://www.wikidata.org/wiki/' + h.id),
    })),
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
    if (!result) result = await searchWikidata(q);
    if (!result) {
      return {
        ok: false,
        message: 'Sudah dicari di Wikipedia, Wiktionary, dan Wikidata, tapi tidak ketemu yang relevan untuk "' + q + '".',
      };
    }
    return { ok: true, related: result.related || [], ...result };
  } catch (e) {
    return { ok: false, message: NETWORK_FAIL_MESSAGE };
  }
}

export const webSearch = Object.freeze({ search });
