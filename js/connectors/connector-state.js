import { idbGateway } from '../../raget/raget-database/idb-gateway.js';

const KEY = 'rategoan_connectors_state';

const CATALOG = {
  google_drive: { display_name: 'Google Drive Workspace', tools_count: 11, scopes: ['drive'] },
  github: { display_name: 'GitHub Developer', tools_count: 45, scopes: ['repo', 'read:user'], auth_type: 'oauth' },
  gmail: { display_name: 'Gmail Assistant', tools_count: 30, scopes: ['gmail.modify'] },
  google_calendar: { display_name: 'Google Calendar', tools_count: 6, scopes: ['calendar'] },
  web_search_reader: { display_name: 'Web Search & Reader', tools_count: 4, system_native: true, connected: true },
  local_sandbox: { display_name: 'Sandbox Komputer & Kode', tools_count: 5, system_native: true, connected: true },
  local_document_vault: { display_name: 'Vault Dokumen', tools_count: 6, system_native: true, connected: true },
  local_vision_ocr: { display_name: 'Mata & OCR', tools_count: 4, system_native: true, connected: true },
  local_voice_audio: { display_name: 'Suara & Audio', tools_count: 4, system_native: true, connected: true },
  local_math_compute: { display_name: 'Hitung & Data', tools_count: 5, system_native: true, connected: true },
  local_artifact_canvas: { display_name: 'Kanvas Artefak', tools_count: 5, system_native: true, connected: true },
  local_agenda_routine: { display_name: 'Agenda Lokal', tools_count: 5, system_native: true, connected: true },
};

function blank() {
  const services = {};
  Object.keys(CATALOG).forEach((id) => {
    const meta = CATALOG[id];
    services[id] = {
      connected: !!meta.connected,
      display_name: meta.display_name,
      tools_count: meta.tools_count,
      scopes: meta.scopes || [],
      system_native: !!meta.system_native,
      reconnect_required: false,
      auth_type: meta.auth_type || 'oauth',
    };
  });
  return { version: '1.0', autonomous_discovery: true, services };
}

function freshen(state) {
  const now = Date.now();
  Object.keys(state.services || {}).forEach((id) => {
    const svc = state.services[id];
    if (!svc || svc.system_native) return;
    if (svc.connected && svc.token_expires_at && svc.token_expires_at < now) {
      svc.connected = false;
      svc.reconnect_required = true;
    }
  });
  return state;
}

function read() {
  if (cache) return freshen(cache);
  const base = blank();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return base;
    const parsed = JSON.parse(raw);
    const services = Object.assign({}, base.services, parsed.services || {});
    Object.keys(base.services).forEach((id) => {
      services[id] = Object.assign({}, base.services[id], services[id] || {});
      services[id].tools_count = base.services[id].tools_count;
      services[id].display_name = base.services[id].display_name;
      if (base.services[id].system_native) {
        services[id].connected = true;
        services[id].system_native = true;
      }
    });
    return freshen({
      version: '1.0',
      autonomous_discovery: parsed.autonomous_discovery !== false,
      services,
    });
  } catch (e) {
    return base;
  }
}

function write(state) {
  cache = state;
  localStorage.setItem(KEY, JSON.stringify(stripTokens(state)));
  persistVault(state).catch(() => {});
  return state;
}

const VAULT = 'rategoan_connectors_vault';
const KEYID = 'rategoan_connectors_aes';
let cache = null;

function stripTokens(state) {
  const copy = JSON.parse(JSON.stringify(state));
  Object.keys(copy.services || {}).forEach((id) => {
    if (copy.services[id]) delete copy.services[id].access_token;
  });
  return copy;
}

function b64(bytes) {
  let raw = '';
  bytes.forEach((n) => { raw += String.fromCharCode(n); });
  return btoa(raw);
}

function fromB64(raw) {
  const bin = atob(raw);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

const SALT_KEY = 'rategoan_vault_salt';
const ITERATIONS = 100000;

function memoryBox() {
  if (typeof localStorage !== 'undefined') return localStorage;
  if (!memoryBox.fallback) memoryBox.fallback = new Map();
  return memoryBox.fallback;
}

function boxGet(box, key) {
  if (!box) return '';
  if (typeof box.getItem === 'function') return box.getItem(key) || '';
  return box.get(key) || '';
}

function boxSet(box, key, value) {
  if (!box) return;
  if (typeof box.setItem === 'function') box.setItem(key, value);
  else box.set(key, value);
}

export async function deriveVaultKey(storage) {
  const box = storage || memoryBox();
  let saltRaw = boxGet(box, SALT_KEY);
  if (!saltRaw) {
    saltRaw = b64(crypto.getRandomValues(new Uint8Array(16)));
    boxSet(box, SALT_KEY, saltRaw);
  }
  const salt = fromB64(saltRaw);
  const material = await crypto.subtle.importKey('raw', salt, 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

function openKeyDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB'));
      return;
    }
    const req = indexedDB.open('rategoan_vault_keys', 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('keys')) db.createObjectStore('keys');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readCryptoKey() {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readonly');
    const req = tx.objectStore('keys').get('aes');
    req.onsuccess = () => {
      const row = req.result;
      resolve(row && row.algorithm && row.extractable === false ? row : null);
    };
    req.onerror = () => reject(req.error);
  });
}

async function writeCryptoKey(key) {
  const db = await openKeyDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('keys', 'readwrite');
    tx.objectStore('keys').put(key, 'aes');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
}

async function aesKey() {
  try {
    const existing = await readCryptoKey();
    if (existing && existing.extractable === false) return existing;
  } catch (e) { /* kunci turunan dipakai di bawah */ }
  try {
    const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    await writeCryptoKey(key);
    try { await idbGateway.setList('connector-aes', []); } catch (err) { /* brankas lama dikosongkan */ }
    try { memoryBox().removeItem(KEYID); } catch (err) { /* tidak ada localStorage */ }
    return key;
  } catch (e) {
    return deriveVaultKey();
  }
}

async function persistVault(state) {
  if (!globalThis.crypto || !crypto.subtle) return;
  const tokens = {};
  Object.keys(state.services || {}).forEach((id) => {
    const token = state.services[id] && state.services[id].access_token;
    if (token) tokens[id] = token;
  });
  const key = await aesKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(tokens)));
  const pack = { iv: b64(iv), data: b64(new Uint8Array(cipher)) };
  try { await idbGateway.setList('connector-vault', [pack]); } catch (e) { console.warn('[Rategoan Fallback] connector-vault:', e); }
  localStorage.removeItem(VAULT);
}

export async function hydrateConnectorSecrets() {
  const stored = read();
  cache = stored;
  let pack = null;
  try {
    const rows = await idbGateway.getList('connector-vault');
    pack = rows && rows[0] ? rows[0] : null;
  } catch (e) {
    pack = null;
  }
  if (!pack) {
    try { pack = JSON.parse(localStorage.getItem(VAULT) || 'null'); } catch (e) { pack = null; }
  }
  if (!pack || !crypto.subtle) return stored;
  try {
    const key = await aesKey();
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: fromB64(pack.iv) }, key, fromB64(pack.data));
    const tokens = JSON.parse(new TextDecoder().decode(plain));
    Object.keys(tokens).forEach((id) => {
      if (cache.services[id]) cache.services[id].access_token = tokens[id];
    });
    if (localStorage.getItem(VAULT)) await persistVault(cache);
  } catch (e) {
    return stored;
  }
  return cache;
}

export const connectorState = {
  KEY,
  read,
  write,
  token(id) {
    const svc = read().services[id];
    return (svc && svc.access_token) || '';
  },
  setDiscovery(on) {
    const state = read();
    state.autonomous_discovery = !!on;
    return write(state);
  },
  markConnected(id, info) {
    const state = read();
    const svc = state.services[id];
    if (!svc || svc.system_native) return state;
    const expiresIn = Number(info.expiresIn || 3600);
    svc.connected = true;
    svc.reconnect_required = false;
    svc.access_token = info.access_token || '';
    svc.token_expires_at = Date.now() + expiresIn * 1000;
    if (id === 'github') svc.account_username = info.account || svc.account_username || '';
    else svc.account_email = info.account || svc.account_email || '';
    return write(state);
  },
  disconnect(id) {
    const state = read();
    const svc = state.services[id];
    if (!svc || svc.system_native) return state;
    svc.connected = false;
    svc.access_token = '';
    svc.reconnect_required = false;
    svc.token_expires_at = 0;
    return write(state);
  },
  absorbReturn() {
    const hash = location.hash.startsWith('#') ? location.hash.slice(1) : '';
    if (hash.includes('access_token=')) {
      history.replaceState(null, '', location.pathname + location.search);
      throw new Error('Token fragmen URL ditolak');
    }
    const params = new URLSearchParams(location.search);
    if (params.get('access_token')) {
      history.replaceState(null, '', location.pathname + location.hash);
      throw new Error('Token URL ditolak');
    }
    if (params.get('oauth') === 'cookie' && params.get('connector')) {
      const id = params.get('connector');
      const state = read();
      const svc = state.services[id];
      if (svc && !svc.system_native) {
        svc.connected = true;
        svc.reconnect_required = false;
        svc.access_token = '';
        svc.cookie_session = true;
        write(state);
      }
      params.delete('oauth');
      params.delete('connector');
      const next = location.pathname + (params.toString() ? '?' + params.toString() : '') + location.hash;
      history.replaceState(null, '', next);
      return true;
    }
    return false;
  },
};
