export async function getWebCrypto() {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) return window.crypto;
  if (typeof self !== 'undefined' && self.crypto && self.crypto.subtle) return self.crypto;
  if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) return globalThis.crypto;
  try {
    const nodeCrypto = await import('node:crypto');
    if (nodeCrypto.webcrypto) return nodeCrypto.webcrypto;
  } catch (err) {
    throw new Error('WebCrypto API is unavailable in the current runtime environment.');
  }
  throw new Error('Failed to resolve a valid WebCrypto implementation.');
}
