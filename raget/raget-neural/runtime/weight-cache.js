import { planRanges, memoryStore, MODEL_CACHE, MODEL_CHUNK, digestSha256 } from './model-downloader.js';

export const WEIGHT_ROOM = Math.floor(1.5 * 1024 * 1024 * 1024);
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
      const body = copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
      await box.put(cacheKey(key), new Response(body));
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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function downloadWeightChunks(options) {
  const url = String(options.url || '');
  const size = Math.max(0, Math.floor(Number(options.size) || 0));
  const chunk = options.chunk || MODEL_CHUNK;
  const cacheName = options.cacheName || MODEL_CACHE;
  const fetchImpl = options.fetchImpl || fetch;
  const store = options.store || openCacheStore();
  const control = options.control || { paused: false, cancelled: false };
  const onProgress = options.onProgress;
  const roomNeed = Number(options.roomNeed) || 0;
  if (roomNeed) {
    const room = await storageFree();
    if (room.known && room.free < roomNeed) {
      const gb = (room.free / (1024 * 1024 * 1024)).toFixed(2);
      throw new Error('ruang tidak cukup, tersisa ' + gb + ' GB');
    }
  }
  const ranges = planRanges(size, chunk);
  let loaded = 0;
  const t0 = Date.now();
  let peak = 0;
  for (let i = 0; i < ranges.length; i += 1) {
    while (control.paused) {
      if (control.cancelled) throw new Error('dibatalkan');
      await sleep(40);
    }
    if (control.cancelled) throw new Error('dibatalkan');
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    const expect = range.end - range.start + 1;
    let bytes = await store.get(cacheName, key);
    if (!bytes) {
      const res = await fetchImpl(url, { headers: { Range: 'bytes=' + range.start + '-' + range.end } });
      if (typeof res.status === 'number' && res.status !== 200 && res.status !== 206) {
        throw new Error('HTTP ' + res.status);
      }
      const raw = new Uint8Array(await res.arrayBuffer());
      bytes = raw.length === expect ? raw : raw.slice(0, expect);
      if (bytes.length !== expect) throw new Error('potongan pendek ' + bytes.length + '/' + expect);
      await store.put(cacheName, key, bytes);
    }
    if (bytes.length > peak) peak = bytes.length;
    loaded += bytes.length;
    const seal = await digestSha256(bytes);
    bytes = null;
    const sec = Math.max(0.001, (Date.now() - t0) / 1000);
    const speed = loaded / sec;
    const eta = speed > 0 ? Math.max(0, (size - loaded) / speed) : 0;
    if (onProgress) onProgress({ loaded: loaded, total: size, seal: seal, speed: speed, eta: eta, parts: ranges.length, index: i });
  }
  return { parts: ranges.length, bytesHeld: 0, peakChunk: peak, size: size };
}

export function createRangeReader(store, url, size, chunk, cacheName) {
  const step = chunk || MODEL_CHUNK;
  const name = cacheName || MODEL_CACHE;
  let hot = null;
  let hotStart = -1;
  return {
    size: size,
    async read(offset, length) {
      const out = new Uint8Array(length);
      let done = 0;
      while (done < length) {
        const pos = offset + done;
        const aligned = Math.floor(pos / step) * step;
        if (!hot || hotStart !== aligned) {
          const end = Math.min(size, aligned + step) - 1;
          hot = await store.get(name, url + '#' + aligned + '-' + end);
          hotStart = aligned;
          if (!hot) throw new Error('potongan hilang');
        }
        const local = pos - hotStart;
        const n = Math.min(hot.length - local, length - done);
        if (n <= 0) throw new Error('potongan hilang');
        out.set(hot.subarray(local, local + n), done);
        done += n;
      }
      return out;
    },
  };
}
