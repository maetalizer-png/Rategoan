import { getWebCrypto } from '../crypto/get-web-crypto.js';

export function meshOffer(id) {
  return {
    id: String(id || 'peer'),
    transport: 'webrtc-datachannel',
    signaling: 'serverless',
    passkey: true,
    qr: true,
  };
}

export async function createSyncKey() {
  const box = await getWebCrypto();
  return box.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function sealProject(key, project) {
  const box = await getWebCrypto();
  const iv = box.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(project || {}));
  const data = new Uint8Array(await box.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return { iv, data };
}

export async function openProject(key, pack) {
  const box = await getWebCrypto();
  const plain = await box.subtle.decrypt({ name: 'AES-GCM', iv: pack.iv }, key, pack.data);
  return JSON.parse(new TextDecoder().decode(plain));
}