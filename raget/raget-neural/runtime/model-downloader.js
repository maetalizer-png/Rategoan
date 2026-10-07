export const MODEL_CACHE = 'rategoan-model-v5';
export const MODEL_CHUNK = 20 * 1024 * 1024;

export function planRanges(size, chunk) {
  const total = Math.max(0, Math.floor(Number(size) || 0));
  const step = chunk > 0 ? Math.floor(chunk) : MODEL_CHUNK;
  const ranges = [];
  for (let start = 0; start < total; start += step) {
    ranges.push({ start, end: Math.min(total, start + step) - 1 });
  }
  return ranges;
}

export function memoryStore() {
  const box = new Map();
  return {
    async get(cacheName, key) {
      return box.get(cacheName + '\n' + key) || null;
    },
    async put(cacheName, key, bytes) {
      box.set(cacheName + '\n' + key, bytes);
    },
  };
}

function concat(parts) {
  let length = 0;
  parts.forEach((part) => { length += part.length; });
  const out = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

export async function downloadModel(options) {
  const url = String((options && options.url) || '');
  const size = Math.max(0, Math.floor(Number(options && options.size) || 0));
  const chunk = (options && options.chunk) || MODEL_CHUNK;
  const cacheName = (options && options.cacheName) || MODEL_CACHE;
  const fetchImpl = (options && options.fetchImpl) || fetch;
  const store = (options && options.store) || memoryStore();
  const ranges = planRanges(size, chunk);
  const parts = [];
  let fetched = 0;
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    let bytes = await store.get(cacheName, key);
    if (!bytes) {
      const res = await fetchImpl(url, { headers: { Range: 'bytes=' + range.start + '-' + range.end } });
      const raw = new Uint8Array(await res.arrayBuffer());
      bytes = raw;
      await store.put(cacheName, key, bytes);
      fetched += 1;
    }
    parts.push(bytes);
  }
  return { bytes: concat(parts), ranges: ranges.length, fetched, cache: cacheName };
}
