import { createHash, randomBytes } from 'node:crypto';
import { originOf, readCookie, sameOrigin, sendJson, setCookie } from './_http.js';

const COOKIE = 'rg_pkce';

export function pkcePair() {
  const verifier = randomBytes(32).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  const state = randomBytes(16).toString('hex');
  return { verifier, challenge, state };
}

export function savePkce(res, payload) {
  setCookie(res, COOKIE, Buffer.from(JSON.stringify(payload)).toString('base64url'));
}

export function loadPkce(req) {
  const raw = readCookie(req, COOKIE);
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')); } catch (e) { return null; }
}

export function redirectWithToken(res, returnTo, fields) {
  const url = new URL(returnTo);
  const hash = new URLSearchParams();
  Object.keys(fields).forEach((key) => {
    if (fields[key] != null && fields[key] !== '') hash.set(key, String(fields[key]));
  });
  url.hash = hash.toString();
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
}

export function beginOrJson(req, res, query, authorizeUrl, payload) {
  savePkce(res, payload);
  if (query.format === 'json') {
    sendJson(res, 200, { url: authorizeUrl });
    return;
  }
  res.statusCode = 302;
  res.setHeader('Location', authorizeUrl);
  res.end();
}

export function callbackReturn(req, fallbackPath) {
  const pkce = loadPkce(req);
  return (pkce && pkce.returnTo) || sameOrigin(req, originOf(req) + (fallbackPath || '/'));
}
