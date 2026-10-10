import http from 'node:http';
import https from 'node:https';

export const BODY_LIMIT = 1048576;
export const UPSTREAM_LIMIT = 2097152;
export const DNS_TIMEOUT_MS = 2000;

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

function tooBig() {
  const err = new Error('payload_terlalu_besar');
  err.statusCode = 413;
  err.payload = { jsonrpc: '2.0', error: { code: -32600, message: 'payload_terlalu_besar' }, id: null };
  return err;
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return Promise.resolve(req.body);
  if (typeof req.body === 'string' && req.body) {
    if (Buffer.byteLength(req.body) > BODY_LIMIT) return Promise.reject(tooBig());
    try { return Promise.resolve(JSON.parse(req.body)); } catch (e) { return Promise.reject(invalidJson()); }
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    let failed = false;
    req.on('data', (chunk) => {
      if (failed) return;
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > BODY_LIMIT) {
        failed = true;
        reject(tooBig());
        if (typeof req.destroy === 'function') req.destroy();
        return;
      }
      chunks.push(buf);
    });
    req.on('end', () => {
      if (failed) return;
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) { resolve({}); return; }
      try { resolve(JSON.parse(raw)); } catch (e) { reject(invalidJson()); }
    });
    req.on('error', () => { if (!failed) reject(invalidJson()); });
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
  const abort = globalThis.AbortSignal;
  const signal = abort && typeof abort.timeout === 'function' ? abort.timeout(15000) : undefined;
  const init = { method: method || 'GET', headers };
  if (signal) init.signal = signal;
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
  if (Buffer.byteLength(text) > UPSTREAM_LIMIT) {
    sendRpcError(res, 502, -32603, 'payload_terlalu_besar');
    return;
  }
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

export function rpcBodyOk(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return false;
  if (Object.prototype.hasOwnProperty.call(body, 'jsonrpc') && body.jsonrpc !== '2.0') return false;
  if (body.name != null && typeof body.name !== 'string') return false;
  if (body.parameters != null) {
    const params = body.parameters;
    if (!params || typeof params !== 'object' || Array.isArray(params)) return false;
  }
  return true;
}

export function lookupWithTimeout(lookup, host, ms) {
  const limit = ms == null ? DNS_TIMEOUT_MS : ms;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('dns_timeout')), limit);
    Promise.resolve().then(() => lookup(host)).then((value) => {
      clearTimeout(timer);
      resolve(value);
    }, (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

export async function pinPublicHttp(raw, lookup, timeoutMs) {
  const href = publicHttpUrl(raw);
  if (!href) return null;
  const url = new URL(href);
  const host = url.hostname;
  const literal = /^\d+\.\d+\.\d+\.\d+$/.test(host) || host.indexOf(':') >= 0;
  let address = host;
  if (!literal) {
    if (typeof lookup !== 'function') return null;
    let records;
    try { records = await lookupWithTimeout(lookup, host, timeoutMs); } catch (e) { return null; }
    const list = Array.isArray(records) ? records : [records];
    if (!list.length) return null;
    for (let i = 0; i < list.length; i += 1) {
      const item = typeof list[i] === 'string' ? list[i] : list[i] && list[i].address;
      if (!item || ipIsPrivate(item)) return null;
    }
    const first = list[0];
    address = typeof first === 'string' ? first : first.address;
  } else if (ipIsPrivate(host)) return null;
  return { href, host, address };
}

export function fetchPinned(pin, init) {
  if (!pin || !pin.address || ipIsPrivate(pin.address)) return Promise.reject(new Error('pin_hilang'));
  const url = new URL(pin.href);
  const lib = url.protocol === 'https:' ? https : http;
  const max = (init && init.maxBytes) || UPSTREAM_LIMIT;
  const timeout = (init && init.timeout) || 8000;
  const family = String(pin.address).indexOf(':') >= 0 ? 6 : 4;
  return new Promise((resolve, reject) => {
    let settled = false;
    const fail = (err) => { if (!settled) { settled = true; reject(err); } };
    const ok = (value) => { if (!settled) { settled = true; resolve(value); } };
    const req = lib.request({
      protocol: url.protocol,
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: (init && init.method) || 'GET',
      headers: Object.assign({
        host: pin.host,
        'user-agent': 'Mozilla/5.0 (compatible; Rategoan/1.0)',
      }, (init && init.headers) || {}),
      servername: pin.host,
      lookup(hostname, options, cb) { cb(null, pin.address, family); },
      timeout,
    }, (res) => {
      const chunks = [];
      let size = 0;
      res.on('data', (chunk) => {
        size += chunk.length;
        if (size > max) {
          fail(new Error('payload_terlalu_besar'));
          req.destroy();
        } else chunks.push(chunk);
      });
      res.on('end', () => {
        ok({
          status: res.statusCode || 0,
          headers: {
            get(name) {
              const value = res.headers[String(name).toLowerCase()];
              if (value == null) return null;
              return Array.isArray(value) ? value[0] : value;
            },
          },
          text() { return Promise.resolve(Buffer.concat(chunks).toString('utf8')); },
        });
      });
    });
    req.on('timeout', () => { req.destroy(); fail(new Error('timeout')); });
    req.on('error', (err) => fail(err || new Error('gagal')));
    req.end();
  });
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
    try { records = await lookupWithTimeout(lookup, host, DNS_TIMEOUT_MS); } catch (e) { return null; }
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
