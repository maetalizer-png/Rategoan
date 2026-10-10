import { createHash, createHmac, randomBytes } from 'node:crypto';
import { allowOptions, bearer, readBody, sendJson } from './_http.js';

export const CONFIRM_TTL_MS = 60000;
export const CONFIRM_CAP = 1000;
export const CONFIRM_RATE_CAP = 30;
export const CONFIRM_RATE_WINDOW = 60000;
const SERVER_SECRET = randomBytes(32);
const ledger = new Map();
const rates = new Map();

export function canonicalPayload(value) {
  if (Array.isArray(value)) return '[' + value.map((item) => canonicalPayload(item)).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalPayload(value[key])).join(',') + '}';
  }
  return JSON.stringify(value == null ? null : value);
}

function payloadHash(params) {
  return createHash('sha256').update(canonicalPayload(params || {})).digest('hex');
}

function macOf(session, tool, hash, exp) {
  return createHmac('sha256', SERVER_SECRET).update(String(session) + '\n' + tool + '\n' + hash + '\n' + exp).digest('hex');
}

export function issueConfirmChallenge(tool, params, now, session) {
  const bound = String(session || '');
  if (!bound) return '';
  const t = now == null ? Date.now() : now;
  sweep(t);
  while (ledger.size >= CONFIRM_CAP) {
    const oldest = ledger.keys().next().value;
    ledger.delete(oldest);
  }
  const nonce = randomBytes(24).toString('hex');
  const hash = payloadHash(params);
  const name = String(tool || '');
  const exp = t + CONFIRM_TTL_MS;
  ledger.set(nonce, { tool: name, hash, exp, session: bound, mac: macOf(bound, name, hash, exp) });
  return nonce;
}

function sweep(t) {
  ledger.forEach((row, key) => {
    if (row.exp < t) ledger.delete(key);
  });
}

export function verifyConfirm(header, tool, params, now, session) {
  const nonce = String(header || '');
  const t = now == null ? Date.now() : now;
  sweep(t);
  const row = ledger.get(nonce);
  if (!row) return false;
  ledger.delete(nonce);
  if (row.exp < t) return false;
  if (row.session !== String(session || '')) return false;
  if (row.mac !== macOf(row.session, row.tool, row.hash, row.exp)) return false;
  if (row.tool !== String(tool || '')) return false;
  return row.hash === payloadHash(params);
}

export function allowConfirmRate(key, now) {
  const t = now == null ? Date.now() : now;
  const id = String(key || 'anon');
  const row = rates.get(id);
  if (!row || t - row.start >= CONFIRM_RATE_WINDOW) {
    rates.set(id, { start: t, count: 1 });
    return true;
  }
  if (row.count >= CONFIRM_RATE_CAP) return false;
  row.count += 1;
  return true;
}

function clientKey(req) {
  const headers = (req && req.headers) || {};
  const fwd = String(headers['x-forwarded-for'] || headers['x-real-ip'] || '');
  const ip = fwd.split(',')[0].trim();
  if (ip) return ip;
  return (req && req.socket && req.socket.remoteAddress) || 'local';
}

export function __resetConfirmLedgerForTesting() {
  ledger.clear();
  rates.clear();
}

export default async function handler(req, res) {
  if (allowOptions(req, res)) return;
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'method' });
    return;
  }
  let body = {};
  try { body = await readBody(req); } catch (e) {
    sendJson(res, (e && e.statusCode) || 400, (e && e.payload) || { error: 'invalid_json' });
    return;
  }
  const token = bearer(req);
  if (!token) {
    sendJson(res, 401, { error: 'missing_token' });
    return;
  }
  if (!allowConfirmRate(clientKey(req))) {
    sendJson(res, 429, { error: 'terlalu_sering' });
    return;
  }
  const nonce = issueConfirmChallenge(body.tool || body.name, body.parameters || {}, undefined, token);
  if (!nonce) {
    sendJson(res, 400, { error: 'sesi_kosong' });
    return;
  }
  sendJson(res, 200, { nonce, ttl: CONFIRM_TTL_MS });
}
