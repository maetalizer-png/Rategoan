function nodeCrypto() {
  const proc = globalThis.process;
  if (!proc || typeof proc.getBuiltinModule !== 'function') return null;
  try {
    return proc.getBuiltinModule('node:crypto');
  } catch (err) {
    return null;
  }
}

export function getSecureRandomBytesSync(len) {
  const n = Math.max(0, Number(len) || 0);
  const web = globalThis.crypto;
  if (web && typeof web.getRandomValues === 'function') {
    const buf = new Uint8Array(n);
    web.getRandomValues(buf);
    return buf;
  }
  const node = nodeCrypto();
  if (!node) throw new Error('WebCrypto tidak tersedia');
  return new Uint8Array(node.randomBytes(n));
}

export function getUniversalCryptoSync() {
  const web = globalThis.crypto;
  if (web && typeof web.getRandomValues === 'function' && web.subtle) return web;
  const node = nodeCrypto();
  if (!node) throw new Error('WebCrypto tidak tersedia');
  return {
    getRandomValues(buf) {
      buf.set(node.randomBytes(buf.length));
      return buf;
    },
    subtle: web && web.subtle ? web.subtle : null,
    randomUUID: node.randomUUID ? () => node.randomUUID() : undefined,
  };
}

export async function digestSha256(bytes) {
  const web = globalThis.crypto;
  if (web && web.subtle) {
    const raw = await web.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(raw), (n) => n.toString(16).padStart(2, '0')).join('');
  }
  const node = nodeCrypto();
  if (!node) throw new Error('WebCrypto tidak tersedia');
  return node.createHash('sha256').update(bytes).digest('hex');
}
