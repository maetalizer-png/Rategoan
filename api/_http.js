export function sendJson(res, code, body) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

export function queryOf(req) {
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length) return req.query;
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', 'http://' + host);
  return Object.fromEntries(url.searchParams.entries());
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.resolve({}); }
  }
  return new Promise((resolve) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))).toString('utf8');
      if (!raw) { resolve({}); return; }
      try { resolve(JSON.parse(raw)); } catch (e) { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

export function bearer(req) {
  const header = String(req.headers.authorization || req.headers.Authorization || '');
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

export function originOf(req) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const proto = String(req.headers['x-forwarded-proto'] || 'https').split(',')[0];
  return proto + '://' + host;
}

export function sameOrigin(req, value) {
  const origin = originOf(req);
  try {
    const url = new URL(value || '/', origin);
    if (url.origin !== new URL(origin).origin) return origin + '/';
    return url.origin + url.pathname;
  } catch (e) {
    return origin + '/';
  }
}

export function setCookie(res, name, value) {
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader('Set-Cookie', name + '=' + encodeURIComponent(value) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=600' + secure);
}

export function readCookie(req, name) {
  const raw = String(req.headers.cookie || '');
  const parts = raw.split(';');
  for (let i = 0; i < parts.length; i += 1) {
    const part = parts[i];
    const cut = part.indexOf('=');
    if (cut < 0) continue;
    if (part.slice(0, cut).trim() === name) {
      try { return decodeURIComponent(part.slice(cut + 1).trim()); } catch (e) { return ''; }
    }
  }
  return '';
}

export function allowOptions(req, res) {
  res.setHeader('access-control-allow-origin', originOf(req));
  res.setHeader('access-control-allow-headers', 'authorization, content-type');
  res.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }
  return false;
}

export function fillPath(path, params, used) {
  return String(path || '').replace(/\{(\w+)\}/g, (_, key) => {
    used.add(key);
    return encodeURIComponent(params && params[key] != null ? String(params[key]) : '');
  });
}

export function restParams(params, used) {
  const rest = {};
  Object.keys(params || {}).forEach((key) => {
    if (!used.has(key)) rest[key] = params[key];
  });
  return rest;
}

export async function forward(res, url, token, method, body, extraHeaders) {
  const headers = Object.assign({
    authorization: 'Bearer ' + token,
    accept: 'application/json',
  }, extraHeaders || {});
  const init = { method: method || 'GET', headers };
  if (body != null && method !== 'GET' && method !== 'HEAD') {
    headers['content-type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  let upstream;
  try {
    upstream = await fetch(url, init);
  } catch (e) {
    sendJson(res, 502, { error: 'upstream_unreachable' });
    return;
  }
  const text = await upstream.text();
  res.statusCode = upstream.status;
  res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
  res.end(text);
}

export function publicHttpUrl(raw) {
  let url;
  try { url = new URL(String(raw || '')); } catch (e) { return null; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host === '0.0.0.0' || host === '::1') return null;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host)) return null;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return null;
  return url.toString();
}
