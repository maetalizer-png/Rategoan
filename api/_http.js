export function sendJson(res, code, body) {
  res.statusCode = code;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.setHeader('cache-control', 'no-store');
  res.end(JSON.stringify(body));
}

export function sendRpcError(res, status, code, message) {
  sendJson(res, status, { jsonrpc: '2.0', error: { code, message: String(message || '') }, id: null });
}

export function queryOf(req) {
  if (req.query && typeof req.query === 'object' && Object.keys(req.query).length) return req.query;
  const host = req.headers.host || 'localhost';
  const url = new URL(req.url || '/', 'http://' + host);
  return Object.fromEntries(url.searchParams.entries());
}

function invalidJson() {
  const err = new Error('invalid_json');
  err.statusCode = 400;
  err.payload = { jsonrpc: '2.0', error: { code: -32700, message: 'invalid_json' }, id: null };
  return err;
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body) {
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.reject(invalidJson()); }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks.map((chunk) => Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))).toString('utf8');
      if (!raw) { resolve({}); return; }
      try { resolve(JSON.parse(raw)); } catch (e) { reject(invalidJson()); }
    });
    req.on('error', () => reject(invalidJson()));
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

const ALLOWED_ORIGINS = new Set([
  'https://rategoan.vercel.app',
  'https://egoan.vercel.app',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
]);

export function allowOptions(req, res) {
  const origin = (req.headers && req.headers.origin) || originOf(req);
  if (ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('access-control-allow-origin', origin);
  } else {
    res.setHeader('access-control-allow-origin', 'null');
  }
  res.setHeader('access-control-allow-headers', 'authorization, content-type, x-rategoan-confirm-nonce');
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
    sendRpcError(res, 502, -32603, 'upstream_unreachable');
    return;
  }
  const text = await upstream.text();
  res.statusCode = upstream.status;
  res.setHeader('content-type', upstream.headers.get('content-type') || 'application/json; charset=utf-8');
  res.end(text);
}

export function ipIsPrivate(host) {
  const raw = String(host || '').toLowerCase().replace(/^\[|\]$/g, '');
  let v4 = raw;
  if (raw.indexOf('::ffff:') === 0) v4 = raw.slice(7);
  if (v4 === '0.0.0.0' || v4 === '::' || v4 === '::1') return true;
  if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(v4)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v4)) return true;
  if (raw === '::1' || raw.indexOf('fe80:') === 0 || raw.indexOf('fc') === 0 || raw.indexOf('fd') === 0) return true;
  return false;
}

export function publicHttpUrl(raw) {
  let url;
  try { url = new URL(String(raw || '')); } catch (e) { return null; }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
  const host = url.hostname.toLowerCase();
  if (host === 'localhost' || host.endsWith('.local') || host === '0.0.0.0' || host === '::1') return null;
  if (ipIsPrivate(host)) return null;
  return url.toString();
}

export async function resolvePublicHttpUrl(raw, lookup, hops) {
  const first = publicHttpUrl(raw);
  if (!first) return null;
  const url = new URL(first);
  const host = url.hostname;
  const literal = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.indexOf(':') >= 0;
  if (!literal && typeof lookup === 'function') {
    let records;
    try { records = await lookup(host); } catch (e) { return null; }
    const list = Array.isArray(records) ? records : [records];
    if (!list.length) return null;
    for (let i = 0; i < list.length; i += 1) {
      const address = typeof list[i] === 'string' ? list[i] : list[i].address;
      if (ipIsPrivate(address)) return null;
    }
  }
  const cap = hops == null ? 3 : hops;
  if (cap <= 0) return first;
  return first;
}
