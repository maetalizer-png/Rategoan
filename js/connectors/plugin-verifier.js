import { getWebCrypto } from '../crypto/get-web-crypto.js';

const trustedSpki = new Set();

function bytesToB64(bytes) {
  let raw = '';
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  view.forEach((n) => { raw += String.fromCharCode(n); });
  return btoa(raw);
}

async function spkiId(box, key) {
  const raw = await box.subtle.exportKey('spki', key);
  return bytesToB64(raw);
}

export async function signPlugin(payload) {
  const box = await getWebCrypto();
  const pair = await box.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  trustedSpki.add(await spkiId(box, pair.publicKey));
  const bytes = new TextEncoder().encode(String(payload || ''));
  const signature = new Uint8Array(await box.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, bytes));
  return { publicKey: pair.publicKey, signature, payload: String(payload || '') };
}

export async function verifyPlugin(pack) {
  if (!pack || !pack.publicKey || !pack.signature) return false;
  const box = await getWebCrypto();
  const id = await spkiId(box, pack.publicKey);
  if (!trustedSpki.has(id)) return false;
  const bytes = new TextEncoder().encode(String(pack.payload || ''));
  return box.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pack.publicKey, pack.signature, bytes);
}