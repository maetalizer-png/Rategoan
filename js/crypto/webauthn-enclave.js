import { getUniversalCryptoSync } from '../core/isomorphic-crypto.js';

export async function enrollBiometric() {
  const nav = globalThis.navigator;
  if (!nav || !nav.credentials || typeof nav.credentials.create !== 'function') {
    return { ok: false, reason: 'webauthn' };
  }
  const challenge = new Uint8Array(32);
  try {
    const uCrypto = getUniversalCryptoSync();
    if (uCrypto && uCrypto.getRandomValues) uCrypto.getRandomValues(challenge);
  } catch (e) { /* tantangan tetap acak nol bila crypto tidak ada */ }
  try {
    const cred = await nav.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Rategoan' },
        user: { id: challenge, name: 'operator', displayName: 'Operator' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 15000,
        extensions: { prf: { eval: { first: challenge } } },
      },
    });
    return { ok: !!cred, reason: cred ? '' : 'kosong' };
  } catch (error) {
    return { ok: false, reason: error && error.name ? String(error.name) : 'webauthn' };
  }
}

export async function sealWithPrf(prfBytes) {
  const raw = prfBytes instanceof Uint8Array ? prfBytes : new Uint8Array(prfBytes || []);
  if (raw.length < 32) return { ok: false, reason: 'prf' };
  let subtle = null;
  try {
    const uCrypto = getUniversalCryptoSync();
    subtle = uCrypto && uCrypto.subtle;
  } catch (e) {
    const web = globalThis.crypto;
    subtle = web && web.subtle;
  }
  if (!subtle) return { ok: false, reason: 'crypto' };
  const key = await subtle.importKey('raw', raw.slice(0, 32), { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  return { ok: true, extractable: key.extractable === true, algorithm: key.algorithm.name };
}
