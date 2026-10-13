let sync = null;

async function handle() {
  if (sync) return sync;
  const root = await navigator.storage.getDirectory();
  const file = await root.getFileHandle('raget-neural-1.5b.safetensors', { create: true });
  sync = await file.createSyncAccessHandle();
  return sync;
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.op !== 'write') return;
  try {
    const io = await handle();
    const bytes = msg.bytes instanceof Uint8Array ? msg.bytes : new Uint8Array(msg.bytes || 0);
    io.write(bytes, { at: msg.offset || 0 });
    io.flush();
    let digest = '';
    if (msg.hash && self.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', bytes);
      digest = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    self.postMessage({ id: msg.id, ok: true, digest: digest });
  } catch (e) {
    self.postMessage({ id: msg.id, ok: false });
  }
};
