import { allowOptions, queryOf, readBody, resolvePublicHttpUrl, sendJson } from '../../_http.js';
import { lookup } from 'node:dns/promises';

export const WEB_TOOLS = [
  { name: 'web_search', level: 1 },
  { name: 'web_fetch_page', level: 1 },
  { name: 'web_news', level: 1 },
  { name: 'web_weather', level: 1 },
];

function decodeDuckLink(href) {
  const raw = String(href || '');
  try {
    const url = new URL(raw, 'https://duckduckgo.com');
    const uddg = url.searchParams.get('uddg');
    if (uddg) return uddg;
  } catch (e) { console.warn('[Rategoan Fallback] search:', e); }
  if (raw.indexOf('http') === 0) return raw;
  return '';
}

function parseResults(html) {
  const results = [];
  const re = /<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]*class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>|<a[^>]*class="[^"]*result__a[^"]*"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<td[^>]*class="[^"]*result-snippet[^"]*"[^>]*>([\s\S]*?)<\/td>/gi;
  let match = re.exec(html);
  while (match && results.length < 8) {
    const href = match[1] || match[4] || '';
    const titleHtml = match[2] || match[5] || '';
    const snippetHtml = match[3] || match[6] || '';
    const url = decodeDuckLink(href.replace(/&/g, '&'));
    const title = titleHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    const snippet = snippetHtml.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (url && title) results.push({ title, url, snippet });
    match = re.exec(html);
  }
  return results;
}

async function duck(query) {
  const res = await fetch('https://html.duckduckgo.com/html/', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'user-agent': 'Mozilla/5.0 (compatible; Rategoan/1.0)',
    },
    body: 'q=' + encodeURIComponent(query),
  });
  if (!res.ok) return [];
  return parseResults(await res.text());
}

function stripPage(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&/g, '&')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 8000);
}

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  const query = queryOf(req);
  if (req.method === 'GET' && query.catalog === '1') {
    sendJson(res, 200, { tools: WEB_TOOLS });
    return;
  }
  let body = {};
  if (req.method !== 'GET') {
    try { body = await readBody(req); } catch (e) {
      sendJson(res, (e && e.statusCode) || 400, (e && e.payload) || { error: 'invalid_json' });
      return;
    }
  }
  const name = body.name || 'web_search';
  const params = body.parameters || {};
  const q = query.q || params.q || params.query || '';
  try {
    if (name === 'web_fetch_page') {
      const lookupHost = (host) => lookup(host, { all: true });
      let url = await resolvePublicHttpUrl(params.url || q, lookupHost);
      if (!url) {
        sendJson(res, 400, { error: 'url_tidak_valid' });
        return;
      }
      let page;
      let hops = 0;
      while (hops < 3) {
        page = await fetch(url, {
          redirect: 'manual',
          headers: { 'user-agent': 'Mozilla/5.0 (compatible; Rategoan/1.0)' },
        });
        if (page.status < 300 || page.status >= 400) break;
        const next = page.headers.get('location');
        const resolved = await resolvePublicHttpUrl(new URL(next || '', url).toString(), lookupHost);
        if (!resolved) {
          sendJson(res, 400, { error: 'url_tidak_valid' });
          return;
        }
        url = resolved;
        hops += 1;
      }
      const text = stripPage(await page.text());
      sendJson(res, 200, { url, text, status: page.status });
      return;
    }
    let searchQuery = q;
    if (name === 'web_news') searchQuery = (q || 'berita') + ' berita';
    if (name === 'web_weather') searchQuery = (q || 'cuaca') + ' cuaca';
    if (!String(searchQuery || '').trim()) {
      sendJson(res, 400, { error: 'query_kosong' });
      return;
    }
    const results = await duck(searchQuery);
    sendJson(res, 200, { query: searchQuery, results });
  } catch (e) {
    sendJson(res, 502, { error: 'search_failed' });
  }
}
