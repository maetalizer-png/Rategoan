import { sha256Sync } from '../studio/vfs-git.js';

const CONFIRM_KEY = 'rategoan-confirm';
const WINDOW_MS = 120000;

function hexToBytes(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function concat(a, b) {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

function sha256Bytes(data) {
  return hexToBytes(sha256Sync(data));
}

export function hmacSha256Hex(keyText, message) {
  const block = 64;
  let key = new TextEncoder().encode(String(keyText));
  if (key.length > block) key = sha256Bytes(key);
  const ipad = new Uint8Array(block);
  const opad = new Uint8Array(block);
  ipad.fill(0x36);
  opad.fill(0x5c);
  for (let i = 0; i < key.length; i += 1) {
    ipad[i] ^= key[i];
    opad[i] ^= key[i];
  }
  const msg = typeof message === 'string' ? new TextEncoder().encode(message) : message;
  const inner = sha256Bytes(concat(ipad, msg));
  return sha256Sync(concat(opad, inner));
}

export function canonicalPayload(value) {
  if (Array.isArray(value)) return '[' + value.map((item) => canonicalPayload(item)).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalPayload(value[key])).join(',') + '}';
  }
  return JSON.stringify(value == null ? null : value);
}

function confirmBody(tool, params, expiry) {
  return String(tool || '') + '\n' + sha256Sync(canonicalPayload(params || {})) + '\n' + expiry;
}

export function signConfirm(tool, params, now) {
  const expiry = String((now == null ? Date.now() : now) + WINDOW_MS);
  return expiry + '.' + hmacSha256Hex(CONFIRM_KEY, confirmBody(tool, params, expiry));
}

export function verifyConfirm(header, tool, params, now) {
  const raw = String(header || '');
  const cut = raw.indexOf('.');
  if (cut < 1) return false;
  const expiry = raw.slice(0, cut);
  const mac = raw.slice(cut + 1);
  const exp = Number(expiry);
  const t = now == null ? Date.now() : now;
  if (!Number.isFinite(exp) || exp < t || exp > t + WINDOW_MS) return false;
  const expect = hmacSha256Hex(CONFIRM_KEY, confirmBody(tool, params, expiry));
  if (expect.length !== mac.length) return false;
  let diff = 0;
  for (let i = 0; i < expect.length; i += 1) diff |= expect.charCodeAt(i) ^ mac.charCodeAt(i);
  return diff === 0;
}
