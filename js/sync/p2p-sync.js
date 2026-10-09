export async function createSyncKey() {
  return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
}

export async function sealProject(key, project) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plain = new TextEncoder().encode(JSON.stringify(project || {}));
  const data = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plain));
  return { iv, data };
}

export async function openProject(key, pack) {
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: pack.iv }, key, pack.data);
  return JSON.parse(new TextDecoder().decode(plain));
}
