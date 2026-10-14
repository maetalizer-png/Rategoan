let sync = null;
let handlePromise = null;
let opQueue = Promise.resolve();

async function handle() {
  if (sync) return sync;
  if (handlePromise) return handlePromise;
  handlePromise = (async () => {
    const root = await navigator.storage.getDirectory();
    const file = await root.getFileHandle('raget-neural-1.5b.safetensors', { create: true });
    sync = await file.createSyncAccessHandle();
    return sync;
  })();
  try {
    return await handlePromise;
  } finally {
    handlePromise = null;
  }
}

function hashWindow(bytes) {
  return bytes.byteLength > 65536 ? bytes.subarray(0, 65536) : bytes;
}

async function processMessage(msg) {
  if (msg.op === 'close') {
    try {
      if (sync) {
        sync.flush();
        sync.close();
        sync = null;
      }
      self.postMessage({ id: msg.id, op: 'closed', ok: true });
    } catch (e) {
      sync = null;
      self.postMessage({ id: msg.id, op: 'closed', ok: false });
    }
    return;
  }
  if (msg.op === 'digest') {
    try {
      const io = await handle();
      const length = Math.max(0, msg.length | 0);
      const sampleLen = Math.min(length, 65536);
      const buf = new Uint8Array(sampleLen);
      const n = io.read(buf, { at: msg.offset || 0 });
      const slice = typeof n === 'number' && n >= 0 ? buf.subarray(0, n) : buf;
      let digest = '';
      if (self.crypto && crypto.subtle) {
        const hashed = await crypto.subtle.digest('SHA-256', slice);
        digest = Array.from(new Uint8Array(hashed)).map((b) => b.toString(16).padStart(2, '0')).join('');
      }
      self.postMessage({ id: msg.id, op: 'digest', ok: true, digest: digest });
    } catch (e) {
      self.postMessage({ id: msg.id, op: 'digest', ok: false, digest: '' });
    }
    return;
  }
  if (msg.op !== 'write') return;
  try {
    const io = await handle();
    const raw = msg.bytes;
    const bytes = raw instanceof Uint8Array
      ? raw
      : new Uint8Array(raw instanceof ArrayBuffer ? raw : (raw || 0));
    const written = io.write(bytes, { at: msg.offset || 0 });
    if (typeof written === 'number' && written !== bytes.byteLength) {
      self.postMessage({ id: msg.id, ok: false });
      return;
    }
    if (msg.flush === true) io.flush();
    let digest = '';
    if (msg.hash && self.crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', hashWindow(bytes));
      digest = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    }
    self.postMessage({ id: msg.id, ok: true, digest: digest });
  } catch (e) {
    self.postMessage({ id: msg.id, ok: false });
  }
}

self.onmessage = (event) => {
  const msg = (event && event.data) || {};
  opQueue = opQueue.then(() => processMessage(msg)).catch(() => {});
};
