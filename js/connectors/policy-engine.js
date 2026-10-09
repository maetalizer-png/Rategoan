import { sha256Sync } from '../studio/vfs-git.js';

function levelOf(name) {
  const key = String(name || '').toLowerCase();
  if (!key) return 5;
  if (/delet|reset|destroy|revoke|hapus/.test(key)) return 5;
  if (/github|drive|gmail|fetch|network|http|push/.test(key)) return 4;
  if (/write|edit|stage|commit|vfs/.test(key)) return 3;
  if (/draft/.test(key)) return 2;
  if (/read|get|list|grep/.test(key)) return 1;
  if (/info|meta|symbol|catalog|status/.test(key)) return 0;
  return 5;
}

const BANNED = /^(token|access_token|secret|password|authorization|cookie|api_key|apikey|auth)$/i;

const DEFAULT_ALLOW = [
  'per_page', 'page', 'sort', 'direction', 'state', 'q', 'type', 'since', 'until',
  'pageToken', 'fields', 'orderBy', 'query', 'ref', 'sha', 'branch', 'message',
  'content', 'title', 'body', 'name', 'description', 'color', 'public', 'folder_id',
  'file_id', 'parent_id', 'path', 'mimeType', 'parents', 'add_parents', 'remove_parents',
  'alt', 'pageSize', 'base', 'head', 'draft', 'labels', 'assignees',
  'idempotency_key', 'nonce',
];

export const NONCE_CAP = 1000;
export const LOCK_MS = 120000;
const nonceLedger = new Map();
const lockUntil = new Map();
const policyAudit = [];

function isPlainObject(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
}

function rememberAudit(row) {
  policyAudit.push(row);
  if (policyAudit.length > 80) policyAudit.shift();
}

export function readPolicyAudit() {
  return policyAudit.slice();
}

export function claimNonce(nonce) {
  const key = String(nonce || '');
  if (!key || nonceLedger.has(key)) return false;
  nonceLedger.set(key, Date.now());
  while (nonceLedger.size > NONCE_CAP) {
    const oldest = nonceLedger.keys().next().value;
    nonceLedger.delete(oldest);
  }
  return true;
}

export function level5Locked(name, now) {
  return (lockUntil.get(String(name || '')) || 0) > now;
}

function screenValue(key, val, banned, kept) {
  if (typeof val === 'function' || typeof val === 'symbol') {
    banned.push(key);
    return;
  }
  if (Array.isArray(val)) {
    const next = [];
    val.forEach((item, index) => {
      const box = {};
      const label = key + '[' + index + ']';
      screenValue(label, item, banned, box);
      if (Object.prototype.hasOwnProperty.call(box, label)) next.push(box[label]);
    });
    kept[key] = next;
    return;
  }
  if (isPlainObject(val)) {
    const inner = filterParams(val);
    inner.banned.forEach((name) => banned.push(key + '.' + name));
    kept[key] = inner.kept;
    return;
  }
  if (val == null || typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
    kept[key] = val;
    return;
  }
  banned.push(key);
}

export function filterParams(params, allow, used) {
  const permit = new Set(allow && allow.length ? allow : DEFAULT_ALLOW);
  const skip = used || new Set();
  const kept = {};
  const banned = [];
  Object.keys(params || {}).forEach((key) => {
    if (skip.has(key)) return;
    if (BANNED.test(key)) {
      banned.push(key);
      return;
    }
    if (!permit.has(key)) return;
    screenValue(key, params[key], banned, kept);
  });
  return { kept, banned };
}

function freshNonce() {
  const bytes = new Uint8Array(16);
  const box = globalThis.crypto;
  if (!box || typeof box.getRandomValues !== 'function') throw new Error('WebCrypto tidak tersedia');
  box.getRandomValues(bytes);
  return Array.from(bytes, (n) => n.toString(16).padStart(2, '0')).join('');
}

export class PolicyEngine {
  constructor(opts = {}) {
    this.confirmed = typeof opts.confirmed === 'function' ? opts.confirmed : () => false;
    this.reauth = typeof opts.reauth === 'function' ? opts.reauth : () => false;
    this.now = typeof opts.now === 'function' ? opts.now : () => Date.now();
  }

  assert(name, args) {
    const level = levelOf(name);
    const payload = args && typeof args === 'object' ? args : {};
    const now = this.now();
    if (level >= 5 && level5Locked(name, now)) {
      const err = new Error('kunci_120');
      err.level = level;
      throw err;
    }
    if (level >= 5 && !this.reauth(name, payload)) {
      lockUntil.set(String(name || ''), now + LOCK_MS);
      const err = new Error('Otentikasi ulang diperlukan');
      err.level = level;
      throw err;
    }
    if (level >= 3 && !this.confirmed(name, payload)) {
      const err = new Error('Konfirmasi diff diperlukan');
      err.level = level;
      throw err;
    }
    const screened = filterParams(payload);
    if (screened.banned.length) {
      rememberAudit({ name: String(name || ''), level, status: 'ditolak', at: Date.now() });
      const err = new Error('parameter_ditolak');
      err.level = level;
      throw err;
    }
    const clean = Object.assign({}, screened.kept);
    const basis = Object.assign({}, clean);
    delete basis.nonce;
    delete basis.idempotency_key;
    clean.idempotency_key = sha256Sync(String(name || '') + '\n' + JSON.stringify(basis));
    if (!clean.nonce) clean.nonce = freshNonce();
    if (!claimNonce(clean.nonce)) {
      rememberAudit({ name: String(name || ''), level, status: 'nonce_ulang', at: Date.now() });
      const err = new Error('nonce_ulang');
      err.level = level;
      throw err;
    }
    rememberAudit({ name: String(name || ''), level, status: 'izin', at: Date.now() });
    return { name: String(name || ''), level, args: clean };
  }
}
