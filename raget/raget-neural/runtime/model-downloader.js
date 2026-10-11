export const MODEL_CACHE = 'rategoan-model-cache';
export const NEURAL_CACHE = 'rategoan-neural-cache';
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

export async function digestSha256(bytes) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let subtle = null;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    subtle = crypto.subtle;
  } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
    subtle = globalThis.crypto.subtle;
  }
  if (subtle) {
    const buf = await subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  const { createHash } = await import('node:crypto');
  return createHash('sha256').update(data).digest('hex');
}

export async function downloadModel(options) {
  const url = String((options && options.url) || '');
  const size = Math.max(0, Math.floor(Number(options && options.size) || 0));
  const chunk = (options && options.chunk) || MODEL_CHUNK;
  const cacheName = (options && options.cacheName) || MODEL_CACHE;
  const fetchImpl = (options && options.fetchImpl) || fetch;
  const store = (options && options.store) || memoryStore();
  const expected = (options && options.chunkHashes) || [];
  const ranges = planRanges(size, chunk);
  const parts = [];
  const digests = [];
  let fetched = 0;
  for (let i = 0; i < ranges.length; i += 1) {
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    let bytes = await store.get(cacheName, key);
    if (!bytes) {
      const res = await fetchImpl(url, { headers: { Range: 'bytes=' + range.start + '-' + range.end } });
      const raw = new Uint8Array(await res.arrayBuffer());
      const digest = await digestSha256(raw);
      if (expected[i] && expected[i] !== digest) {
        const err = new Error('checksum_mismatch');
        err.name = 'ChecksumError';
        err.index = i;
        throw err;
      }
      bytes = raw;
      await store.put(cacheName, key, bytes);
      fetched += 1;
      digests.push(digest);
    } else {
      digests.push(await digestSha256(bytes));
    }
    parts.push(bytes);
  }
  return { bytes: concat(parts), ranges: ranges.length, fetched, cache: cacheName, digests };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function downloadConcurrentChunks(options) {
  const url = String((options && options.url) || '');
  const size = Math.max(0, Math.floor(Number(options && options.size) || 0));
  const chunk = (options && options.chunk) || MODEL_CHUNK;
  const cacheName = (options && options.cacheName) || MODEL_CACHE;
  const fetchImpl = (options && options.fetchImpl) || fetch;
  const store = (options && options.store) || memoryStore();
  const control = (options && options.control) || { paused: false, cancelled: false };
  const onProgress = options && options.onProgress;
  const onEarlyReady = options && options.onEarlyReady;
  const concurrency = Math.max(1, Math.min(4, Math.floor(Number(options && options.concurrency) || 4)));
  const ranges = planRanges(size, chunk);
  const earlyBytes = Math.min(size, Math.max(0, Math.floor(Number(options && options.earlyBytes) || 0)));
  let earlyAt = -1;
  if (earlyBytes > 0) {
    for (let i = 0; i < ranges.length; i += 1) {
      if (ranges[i].end + 1 >= earlyBytes) {
        earlyAt = i;
        break;
      }
    }
  }
  const done = new Array(ranges.length).fill(false);
  let next = 0;
  let loaded = 0;
  let peak = 0;
  let networkHits = 0;
  let earlyFired = false;
  let stopError = null;
  const t0 = Date.now();

  function report(index, seal) {
    const sec = Math.max(0.001, (Date.now() - t0) / 1000);
    const speed = loaded / sec;
    const eta = speed > 0 ? Math.max(0, (size - loaded) / speed) : 0;
    if (onProgress) {
      onProgress({
        loaded: loaded,
        total: size,
        seal: seal,
        speed: speed,
        eta: eta,
        parts: ranges.length,
        index: index,
        source: networkHits > 0 ? 'network' : 'cache',
        early: earlyFired,
      });
    }
  }

  function checkEarly() {
    if (earlyFired || earlyAt < 0) return;
    for (let i = 0; i <= earlyAt; i += 1) {
      if (!done[i]) return;
    }
    earlyFired = true;
    if (onEarlyReady) onEarlyReady({ parts: earlyAt + 1, bytes: ranges[earlyAt].end + 1 });
  }

  async function pull(i) {
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    const expect = range.end - range.start + 1;
    let bytes = await store.get(cacheName, key);
    const fromCache = !!bytes;
    if (!bytes) {
      const res = await fetchImpl(url, { headers: { Range: 'bytes=' + range.start + '-' + range.end } });
      if (typeof res.status === 'number' && res.status !== 200 && res.status !== 206) {
        throw new Error('HTTP ' + res.status);
      }
      const raw = new Uint8Array(await res.arrayBuffer());
      bytes = raw.length === expect ? raw : raw.slice(0, expect);
      if (bytes.length !== expect) throw new Error('potongan pendek ' + bytes.length + '/' + expect);
      await store.put(cacheName, key, bytes);
      networkHits += 1;
    }
    if (bytes.length > peak) peak = bytes.length;
    loaded += bytes.length;
    const seal = fromCache ? '' : await digestSha256(bytes);
    bytes = null;
    done[i] = true;
    checkEarly();
    report(i, seal);
  }

  async function worker() {
    while (!stopError) {
      while (control.paused && !control.cancelled && !stopError) await sleep(40);
      if (stopError) return;
      if (control.cancelled) {
        stopError = new Error('dibatalkan');
        return;
      }
      const i = next;
      next += 1;
      if (i >= ranges.length) return;
      try {
        await pull(i);
      } catch (e) {
        if (!stopError) stopError = e instanceof Error ? e : new Error('gagal');
        return;
      }
    }
  }

  const runners = [];
  const workers = ranges.length === 0 ? 0 : Math.min(concurrency, ranges.length);
  for (let k = 0; k < workers; k += 1) runners.push(worker());
  await Promise.all(runners);
  if (stopError) throw stopError;
  return { parts: ranges.length, bytesHeld: 0, peakChunk: peak, size: size, early: earlyFired };
}
