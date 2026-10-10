import { createRequire } from 'node:module';

function loadNodeCrypto() {
  try {
    const node = createRequire(import.meta.url)('node:crypto');
    if (!node || typeof node.randomFillSync !== 'function') return null;
    return node;
  } catch (err) {
    return null;
  }
}

export function getSecureRandomBytesSync(len) {
  const n = Math.max(0, Number(len) || 0);
  const node = loadNodeCrypto();
  if (node && typeof node.randomFillSync === 'function') {
    const buf = new Uint8Array(n);
    node.randomFillSync(buf);
    return buf;
  }
  const web = globalThis.crypto;
  if (web && typeof web.getRandomValues === 'function') {
    const buf = new Uint8Array(n);
    web.getRandomValues(buf);
    return buf;
  }
  if (node && typeof node.randomBytes === 'function') return new Uint8Array(node.randomBytes(n));
  throw new Error('WebCrypto tidak tersedia');
}

export function getUniversalCryptoSync() {
  const node = loadNodeCrypto();
  if (node && node.webcrypto && node.webcrypto.subtle) {
    const subtle = node.webcrypto.subtle;
    const web = node.webcrypto;
    return {
      getRandomValues(buf) {
        if (web && typeof web.getRandomValues === 'function') return web.getRandomValues(buf);
        node.randomFillSync(buf);
        return buf;
      },
      subtle,
      randomUUID: typeof web.randomUUID === 'function' ? () => web.randomUUID() : undefined,
    };
  }
  const web = globalThis.crypto;
  if (web && typeof web.getRandomValues === 'function' && web.subtle) return web;
  throw new Error('WebCrypto tidak tersedia');
}

export async function digestSha256(bytes) {
  const box = getUniversalCryptoSync();
  if (box.subtle) {
    const raw = await box.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(raw), (n) => n.toString(16).padStart(2, '0')).join('');
  }
  const node = loadNodeCrypto();
  if (!node) throw new Error('WebCrypto tidak tersedia');
  return node.createHash('sha256').update(bytes).digest('hex');
}
