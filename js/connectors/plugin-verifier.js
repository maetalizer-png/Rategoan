export async function signPlugin(payload) {
  const pair = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const bytes = new TextEncoder().encode(String(payload || ''));
  const signature = new Uint8Array(await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, pair.privateKey, bytes));
  return { publicKey: pair.publicKey, signature, payload: String(payload || '') };
}

export async function verifyPlugin(pack) {
  if (!pack || !pack.publicKey || !pack.signature) return false;
  const bytes = new TextEncoder().encode(String(pack.payload || ''));
  return crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, pack.publicKey, pack.signature, bytes);
}
