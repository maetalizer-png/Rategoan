import { memoryStore, MODEL_CACHE, MODEL_CHUNK, downloadConcurrentChunks as fetchConcurrent } from './model-downloader.js';

export const WEIGHT_ROOM = Math.floor(1.5 * 1024 * 1024 * 1024);
export const EARLY_READY_BYTES = 233706880;
export const RANGE_SLOTS = 4;
export const DOWNLOAD_STREAMS = 4;
export const WEIGHT_SPEC = Object.freeze({
  url: 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/raget-neural-1.5b.safetensors',
  size: 1045697920,
  chunk: MODEL_CHUNK,
  cache: MODEL_CACHE,
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
    async put(cacheName, key, bytes) {
      const box = await caches.open(cacheName);
      const copy = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
      await box.put(cacheKey(key), new Response(copy));
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
