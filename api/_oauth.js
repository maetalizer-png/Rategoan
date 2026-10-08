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
  const bag = fields || {};
  const token = bag.access_token ? String(bag.access_token) : '';
  if (token) {
    const payload = Buffer.from(JSON.stringify({
      connector: bag.connector || '',
      access_token: token,
      expires_in: bag.expires_in || '',
      account: bag.account || '',
      state: bag.state || '',
    })).toString('base64url');
    const secure = process.env.VERCEL ? '; Secure' : '';
    res.setHeader('Set-Cookie', 'rg_oauth=' + encodeURIComponent(payload) + '; Path=/; HttpOnly; SameSite=Lax; Max-Age=28800' + secure);
  }
  if (bag.connector) url.searchParams.set('connector', String(bag.connector));
  url.searchParams.set('oauth', 'cookie');
  url.hash = '';
  res.statusCode = 302;
  res.setHeader('Location', url.toString());
  res.end();
}

export function beginOrJson(req, res, query, authorizeUrl, payload) {
  savePkce(res, payload);
  if (query.format === 'json') {
    sendJson(res, 200, { url: authorizeUrl, state: payload && payload.state ? payload.state : '' });
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
