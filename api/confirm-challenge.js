import { createHash, randomBytes } from 'node:crypto';
import { allowOptions, readBody, sendJson } from './_http.js';

export const CONFIRM_TTL_MS = 60000;
const ledger = new Map();

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

export function issueConfirmChallenge(tool, params, now) {
  const t = now == null ? Date.now() : now;
  sweep(t);
  const nonce = randomBytes(24).toString('hex');
  ledger.set(nonce, {
    tool: String(tool || ''),
    hash: payloadHash(params),
    exp: t + CONFIRM_TTL_MS,
  });
  return nonce;
}

function sweep(t) {
  ledger.forEach((row, key) => {
    if (row.exp < t) ledger.delete(key);
  });
}

export function verifyConfirm(header, tool, params, now) {
  const nonce = String(header || '');
  const t = now == null ? Date.now() : now;
  sweep(t);
  const row = ledger.get(nonce);
  if (!row) return false;
  ledger.delete(nonce);
  if (row.exp < t) return false;
  if (row.tool !== String(tool || '')) return false;
  return row.hash === payloadHash(params);
}

export function __resetConfirmLedgerForTesting() {
  ledger.clear();
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
  const nonce = issueConfirmChallenge(body.tool || body.name, body.parameters || {});
  sendJson(res, 200, { nonce, ttl: CONFIRM_TTL_MS });
}
