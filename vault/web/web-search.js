const NETWORK_FAIL_MESSAGE =
  'Gagal mengakses internet untuk pencarian ini — bisa karena tidak ada koneksi, atau Wikipedia sedang memblokir akses dari sini. Raget 100% berjalan lokal tanpa server perantara, jadi pencarian internet langsung bergantung pada koneksi perangkat ini.';

const FETCH_TIMEOUT_MS = 12000;
const STOP = {
  yang: 1, dan: 1, atau: 1, dari: 1, untuk: 1, dengan: 1, pada: 1, ini: 1, itu: 1,
  di: 1, ke: 1, the: 1, of: 1, a: 1, an: 1, tentang: 1, soal: 1, para: 1, suatu: 1,
};

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

function queryWords(q) {
  return String(q || '')
    .toLowerCase()
    .replace(/\bilmu\s+(?=\p{L})/gu, ' ')
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP[w] && w !== 'ilmu');
}

function scoreText(text, words) {
  const t = String(text || '').toLowerCase();
  let n = 0;
  for (let i = 0; i < words.length; i += 1) {
    if (t.includes(words[i])) n += 1;
  }
  return n;
}

function isListIntent(q) {
  return /\b(ilmuwan|tokoh|ahli|pakar|daftar|matematikawan|fisikawan|sastrawan|pahlawan|penemu|peneliti)\b/i.test(q);
}

function looksLikePerson(title, snippet, words) {
  const t = String(title || '');
  if (/^daftar\b/i.test(t)) return false;
  if (/^(matematikawan|ilmuwan|fisikawan|kimiawan|logika matematika|ilmuwan komputer|ilmu komputer)\b/i.test(t)) return false;
  if (/\b(logika|teori|ilmu|matematika|fisika|kimia|biologi)\b/i.test(t) && t.split(/\s+/).length <= 3) return false;
  const blob = (t + ' ' + snippet).toLowerCase();
  if (words && words.indexOf('indonesia') >= 0) {
    const local = /indonesia|nusantara|jawa|sumatera|jakarta|bandung|yogyakarta|surabaya|medan/.test(blob);
    const foreign = /tiongkok|china|yunani|eropa|amerika|prancis|jepang|india|arab/.test(blob);
    if (foreign && !local) return false;
    if (!local && !/lahir/.test(blob)) return false;
  }
  const sn = String(snippet || '');
  if (/\b(lahir|adalah seorang|adalah ilmuwan|adalah matematikawan|adalah fisikawan|adalah tokoh)\b/i.test(sn)) return true;
  return /^[A-Z][\p{L}.-]+(\s+[A-Z][\p{L}.-]+){1,4}$/u.test(t);
}

function altQueries(q) {
  const seen = {};
  const out = [];
  const add = (s) => {
    const v = String(s || '').replace(/\s+/g, ' ').trim();
    const key = v.toLowerCase();
    if (!v || seen[key]) return;
    seen[key] = 1;
    out.push(v);
  };
  add(q);
  const mapped = q
    .replace(/ilmuwan\s+matematika/gi, 'matematikawan')
    .replace(/ilmuwan\s+fisika/gi, 'fisikawan')
    .replace(/ilmuwan\s+kimia/gi, 'kimiawan')
    .replace(/ilmuwan\s+biologi/gi, 'ahli biologi');
  add(mapped);
  if (isListIntent(q) && !/^daftar\b/i.test(q)) {
    add('Daftar ' + mapped);
    const field = mapped.replace(/\b(ilmuwan|tokoh|ahli|pakar|daftar)\b/gi, '').replace(/\s+/g, ' ').trim();
    if (field) add('Daftar ' + field);
  }
  return out.slice(0, 3);
}

async function fetchOutline(title, lang) {
  const url = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/mobile-sections/' + encodeURIComponent(title);
  try {
    const data = await fetchJson(url);
    const rem = (data && data.remaining && data.remaining.sections) || [];
    const skip = /referensi|catatan|lihat juga|pranala|pustaka|bacaan|catatan kaki|sumber/i;
    return rem
      .map((s) => String(s.line || '').replace(/<[^>]+>/g, '').trim())
      .filter((line) => line && !skip.test(line) && line.length < 48)
      .slice(0, 5);
  } catch (e) {
    return [];
  }
}

async function fetchExtractByTitle(title, lang) {
  const url =
    'https://' + lang + '.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&exchars=900&redirects=1&titles=' +
    encodeURIComponent(title) + '&format=json&origin=*';
  const data = await fetchJson(url);
  const pages = data && data.query && data.query.pages;
  if (!pages) return '';
  const page = pages[Object.keys(pages)[0]];
  return page && page.extract ? String(page.extract).replace(/\s+/g, ' ').trim() : '';
}

async function fetchSummaryByTitle(title, lang) {
  const summaryUrl = 'https://' + lang + '.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(title);
  const summary = await fetchJson(summaryUrl);
  if (!summary || !summary.extract) return null;
  const page = summary.content_urls && summary.content_urls.desktop && summary.content_urls.desktop.page;
  let extract = summary.extract;
  try {
    const longer = await fetchExtractByTitle(summary.title || title, lang);
    if (longer && longer.length > extract.length) extract = longer;
  } catch (e) {}
  let outline = [];
  try {
    outline = await fetchOutline(summary.title || title, lang);
  } catch (e) {}
  return { title: summary.title, extract, outline, url: page || wikiPageUrl(summary.title || title, lang), lang, source: 'wikipedia' };
}

function stripSearchSnippet(html) {
  return String(html || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

async function rawWikiHits(query, lang) {
  const fullTextUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=query&list=search&srsearch=' +
    encodeURIComponent(query) + '&srlimit=5&srprop=snippet&format=json&origin=*';
  const fullTextData = await fetchJson(fullTextUrl);
  const hits = (fullTextData && fullTextData.query && fullTextData.query.search) || [];
  if (hits.length) {
    return hits.map((h) => ({
      title: h.title,
      snippet: stripSearchSnippet(h.snippet),
      url: wikiPageUrl(h.title, lang),
      lang,
    }));
  }
  const openSearchUrl =
    'https://' + lang + '.wikipedia.org/w/api.php?action=opensearch&search=' +
    encodeURIComponent(query) + '&limit=5&namespace=0&format=json&origin=*';
  const openSearchData = await fetchJson(openSearchUrl);
  const titles = (openSearchData && openSearchData[1]) || [];
  return titles.map((title) => ({ title, snippet: '', url: wikiPageUrl(title, lang), lang }));
}

function rankHits(hits, words) {
  const uniq = [];
  const seen = {};
  hits.forEach((h) => {
    const key = String(h.title || '').toLowerCase();
    if (!key || seen[key]) return;
    seen[key] = 1;
    const titleScore = scoreText(h.title, words);
    const snScore = scoreText(h.snippet, words);
    let score = titleScore * 3 + snScore;
    if (/^daftar\b/i.test(h.title) && isListIntent(words.join(' '))) score += 2;
    uniq.push({ ...h, score, titleScore });
  });
  uniq.sort((a, b) => b.score - a.score);
  return uniq;
}

async function searchWikipediaRanked(query, lang) {
  const words = queryWords(query);
  const queries = altQueries(query);
  const bag = [];
  for (let i = 0; i < queries.length; i += 1) {
    const part = await rawWikiHits(queries[i], lang);
    bag.push.apply(bag, part);
  }
  const ranked = rankHits(bag, words);
  if (!ranked.length) return null;
  const need = words.length >= 3 ? 2 : 1;
  let primary = ranked.find((h) => h.titleScore >= need) || ranked.find((h) => h.score >= need) || ranked[0];
  const summary = await fetchSummaryByTitle(primary.title, lang);
  if (!summary) return null;
  const rest = ranked.filter((h) => h.title !== primary.title);
  const main = (words[words.length - 1] || words[0] || '').toLowerCase();
  const related = rest.filter((h) => {
    const title = String(h.title || '').toLowerCase();
    if (!title || title === 'ilmu' || title === 'ilmu pengetahuan') return false;
    if (/^fakultas\b/.test(title) || /^ilmu kebumian\b/.test(title)) return false;
    if (title.split(/\s+/).length === 1 && main && title !== main) return false;
    if (!main) return false;
    if (words.length <= 2) return title.includes(main);
    return title.includes(main) || scoreText(h.title + ' ' + h.snippet, words) >= 2;
  }).slice(0, 3);
  const people = ranked.filter((h) => looksLikePerson(h.title, h.snippet, words)).slice(0, 6);
  const listMode = isListIntent(query) && people.length >= 2;
  const weak = primary.titleScore < need && words.length >= 3;
  return {
    ...summary,
    related,
    people,
    mode: listMode ? 'list' : 'article',
    weak,
    query,
  };
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
    people: [],
    mode: 'article',
    weak: false,
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
    people: [],
    mode: 'article',
    weak: false,
  };
}

async function search(query) {
  const q = String(query || '').trim();
  if (!q) return { ok: false, message: 'Mau cari apa di internet?' };
  if (typeof fetch !== 'function') return { ok: false, message: NETWORK_FAIL_MESSAGE };
  try {
    let result = await searchWikipediaRanked(q, 'id');
    if (!result) result = await searchWikipediaRanked(q, 'en');
    if (!result) result = await searchWiktionary(q, 'id');
    if (!result) result = await searchWiktionary(q, 'en');
    if (!result) result = await searchWikidata(q);
    if (!result) {
      return {
        ok: false,
        message: 'Sudah dicari di Wikipedia, Wiktionary, dan Wikidata, tapi tidak ketemu yang relevan untuk "' + q + '".',
      };
    }
    return { ok: true, related: result.related || [], people: result.people || [], mode: result.mode || 'article', weak: !!result.weak, ...result };
  } catch (e) {
    return { ok: false, message: NETWORK_FAIL_MESSAGE };
  }
}

export const webSearch = Object.freeze({ search });
