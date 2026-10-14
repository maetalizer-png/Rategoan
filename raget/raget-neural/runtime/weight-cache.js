import { memoryStore, MODEL_CACHE, MODEL_CHUNK, MODEL_REVISION, downloadConcurrentChunks as fetchConcurrent } from './model-downloader.js';

export const WEIGHT_ROOM = Math.floor(1.5 * 1024 * 1024 * 1024);
export const EARLY_READY_BYTES = 233706880;
export const EARLY_PROGRESS_BYTES = 80 * 1024 * 1024;
export const RANGE_SLOTS = 4;
export const DOWNLOAD_STREAMS = 4;
export const WEIGHT_SPEC = Object.freeze({
  url: 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/raget-neural-1.5b.safetensors',
  size: 1045697920,
  chunk: MODEL_CHUNK,
  cache: MODEL_CACHE,
  revision: MODEL_REVISION,
  chunkHashes: Object.freeze([]),
});

export function cacheStore() {
  if (typeof caches === 'undefined') return null;
  return {
    async get(cacheName, key) {
      const box = await caches.open(cacheName);
      const hit = await box.match(cacheKey(key));
      if (!hit) return null;
      return new Uint8Array(await hit.arrayBuffer());
    },
    async put() {
      return;
    },
  };
}

export function openCacheStore() {
  return cacheStore() || memoryStore();
}

function cacheKey(key) {
  return 'https://rategoan.local/model-cache?k=' + encodeURIComponent(key);
}

export async function storageFree() {
  if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
    return { known: false, free: 0 };
  }
  try {
    const est = await navigator.storage.estimate();
    if (!est || !est.quota) return { known: false, free: 0 };
    return { known: true, free: Math.max(0, est.quota - (est.usage || 0)), quota: est.quota, usage: est.usage || 0 };
  } catch (e) {
    return { known: false, free: 0 };
  }
}

export async function cacheHas(cacheName, key) {
  if (typeof caches === 'undefined') return false;
  const box = await caches.open(cacheName);
  const hit = await box.match(cacheKey(key));
  return !!hit;
}

export async function downloadConcurrentChunks(options) {
  const roomNeed = Number(options && options.roomNeed) || 0;
  if (roomNeed) {
    const room = await storageFree();
    if (room.known && room.free < roomNeed) {
      const gb = (room.free / (1024 * 1024 * 1024)).toFixed(2);
      throw new Error('ruang tidak cukup, tersisa ' + gb + ' GB');
    }
  }
  const opts = Object.assign({}, options, {
    concurrency: (options && options.concurrency) || DOWNLOAD_STREAMS,
  });
  return fetchConcurrent(opts);
}

export async function downloadWeightChunks(options) {
  return downloadConcurrentChunks(options);
}

export function readSyncBlock(sync, offset, length) {
  const buf = new Uint8Array(length);
  const n = sync.read(buf, { at: offset });
  return n === length ? buf : buf.subarray(0, Math.max(0, n));
}

const HEADER_CAP = 64 * 1024;
const REQUIRED_TENSORS = [
  'embedding.weight',
  'lm_head.weight',
  'layers.0.attention.Wq',
  'layers.0.ln1.gamma',
  'layers.27.ffn.Wdown',
];

export function safetensorsHeaderOk(sync) {
  try {
    if (!sync || typeof sync.read !== 'function') return false;
    const size = Number(sync.size) || 0;
    if (size < 16) return false;
    const raw = sync.read(0, 8);
    if (!raw || raw.length < 8 || !raw.buffer) return false;
    const view = new DataView(raw.buffer, raw.byteOffset || 0, raw.byteLength);
    let headerLen = 0;
    try { headerLen = Number(view.getBigUint64(0, true)); } catch (e) { return false; }
    if (!headerLen || headerLen > HEADER_CAP) return false;
    if (size < 8 + headerLen) return false;
    const slice = sync.read(8, headerLen);
    if (!slice || slice.length < headerLen) return false;
    const header = JSON.parse(new TextDecoder().decode(slice));
    const meta = header && header.__metadata__;
    if (!meta || meta.format !== 'rategoan-int4-block32-affine') return false;
    for (let i = 0; i < REQUIRED_TENSORS.length; i += 1) {
      if (!header[REQUIRED_TENSORS[i]]) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function inspectWeightFile(name) {
  const nav = globalThis.navigator;
  if (!nav || !nav.storage || typeof nav.storage.getDirectory !== 'function') return null;
  try {
    const root = await nav.storage.getDirectory();
    const handle = await root.getFileHandle(String(name || 'raget-neural-1.5b.safetensors'));
    const file = await handle.getFile();
    const head = new Uint8Array(await file.slice(0, 65536).arrayBuffer());
    return {
      size: file.size,
      read(offset, length) {
        const start = Math.max(0, offset | 0);
        const end = Math.min(head.length, start + Math.max(0, length | 0));
        if (end <= start) return new Uint8Array(0);
        return head.subarray(start, end);
      },
    };
  } catch (e) {
    return null;
  }
}

export async function openSyncWeight(name) {
  const nav = globalThis.navigator;
  if (!nav || !nav.storage || typeof nav.storage.getDirectory !== 'function') return null;
  try {
    const root = await nav.storage.getDirectory();
    const handle = await root.getFileHandle(String(name || 'raget-neural-1.5b.safetensors'));
    const sync = await handle.createSyncAccessHandle();
    return {
      size: sync.getSize(),
      read(offset, length) {
        return readSyncBlock(sync, offset, length);
      },
      close() { sync.close(); },
    };
  } catch (e) {
    return null;
  }
}

export function createRangeReader(store, url, size, chunk, cacheName, slots) {
  const step = chunk || MODEL_CHUNK;
  const name = cacheName || MODEL_CACHE;
  const cap = Math.max(1, Math.floor(Number(slots) || RANGE_SLOTS));
  const hot = new Map();
  const order = [];
  return {
    size: size,
    slots: cap,
    async read(offset, length) {
      const out = new Uint8Array(length);
      let done = 0;
      while (done < length) {
        const pos = offset + done;
        const aligned = Math.floor(pos / step) * step;
        let buf = hot.get(aligned);
        if (!buf) {
          const end = Math.min(size, aligned + step) - 1;
          buf = await store.get(name, url + '#' + aligned + '-' + end);
          if (!buf) throw new Error('potongan hilang');
          hot.set(aligned, buf);
          order.push(aligned);
          while (order.length > cap) {
            const old = order.shift();
            hot.delete(old);
          }
        } else {
          const idx = order.indexOf(aligned);
          if (idx >= 0) order.splice(idx, 1);
          order.push(aligned);
        }
        const local = pos - aligned;
        const n = Math.min(buf.length - local, length - done);
        if (n <= 0) throw new Error('potongan hilang');
        out.set(buf.subarray(local, local + n), done);
        done += n;
      }
      return out;
    },
  };
}
