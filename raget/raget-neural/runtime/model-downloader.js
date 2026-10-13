import { meshHasChunk, publishMeshChunk, takeMeshChunk } from '../../../js/sync/p2p-sync.js';

export const MODEL_CACHE = 'rategoan-model-cache';
export const NEURAL_CACHE = 'rategoan-neural-cache';
export const MODEL_CHUNK = 20 * 1024 * 1024;
export const PREFETCH_AHEAD = 4;

export function deltaChunkPlan(previous, next) {
  const oldH = previous || [];
  const neu = next || [];
  const changed = [];
  const n = Math.max(oldH.length, neu.length);
  for (let i = 0; i < n; i += 1) {
    if (oldH[i] !== neu[i]) changed.push(i);
  }
  const kept = n - changed.length;
  return { changed, kept, ratio: n ? changed.length / n : 0 };
}

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
  const concurrency = Math.max(1, Math.min(6, Math.floor(Number(options && options.concurrency) || 6)));
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
  const samples = [{ t: t0, loaded: 0 }];
  const mesh = options && options.mesh === true;
  const primed = new Map();
  let opfsPort = null;
  let opfsSeq = 0;

  function opfsWorker() {
    if (opfsPort) return opfsPort;
    if (typeof Worker !== 'function') return null;
    try {
      opfsPort = new Worker(new URL('./opfs-writer-worker.js', import.meta.url));
    } catch (e) {
      opfsPort = null;
    }
    return opfsPort;
  }

  function mirrorOpfs(offset, bytes) {
    const port = opfsWorker();
    if (!port || !bytes) return Promise.resolve();
    const id = opfsSeq + 1;
    opfsSeq = id;
    const copy = bytes.slice();
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        port.removeEventListener('message', onMsg);
        resolve();
      }, 4000);
      function onMsg(event) {
        if (!event.data || event.data.id !== id) return;
        clearTimeout(timer);
        port.removeEventListener('message', onMsg);
        resolve(event.data.digest || '');
      }
      port.addEventListener('message', onMsg);
      try {
        port.postMessage({ op: 'write', id: id, offset: offset, bytes: copy, hash: true });
      } catch (e) {
        clearTimeout(timer);
        resolve();
      }
    });
  }

  function prime(i) {
    if (i < 0 || i >= ranges.length) return null;
    if (primed.has(i)) return primed.get(i);
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    const expect = range.end - range.start + 1;
    const job = (async () => {
      const cached = await store.get(cacheName, key);
      if (cached) return { bytes: cached, fromCache: true, key, expect };
      if (mesh && meshHasChunk(i)) {
        const shared = takeMeshChunk(i);
        if (shared && shared.length === expect) return { bytes: shared, fromCache: true, key, expect };
      }
      const res = await fetchImpl(url, { headers: { Range: 'bytes=' + range.start + '-' + range.end } });
      if (typeof res.status === 'number' && res.status !== 200 && res.status !== 206) {
        throw new Error('HTTP ' + res.status);
      }
      const raw = new Uint8Array(await res.arrayBuffer());
      const bytes = raw.length === expect ? raw : raw.slice(0, expect);
      if (bytes.length !== expect) throw new Error('potongan pendek ' + bytes.length + '/' + expect);
      return { bytes, fromCache: false, key, expect };
    })();
    const tracked = job.then((value) => value, (err) => ({ __err: err }));
    primed.set(i, tracked);
    return tracked;
  }

  function windowSpeed() {
    const now = Date.now();
    samples.push({ t: now, loaded: loaded });
    const cut = now - 5000;
    while (samples.length > 2 && samples[0].t < cut) samples.shift();
    const a = samples[0];
    const dt = Math.max(0.001, (now - a.t) / 1000);
    const delta = loaded - a.loaded;
    if (delta > 0) return delta / dt;
    return loaded / Math.max(0.001, (now - t0) / 1000);
  }

  function markChunk(index) {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem('rategoan_chunks_mask') || '';
      const bits = raw ? raw.split(',') : [];
      bits[index] = '1';
      localStorage.setItem('rategoan_chunks_mask', bits.join(','));
    } catch (e) { /* penyimpanan tidak ada */ }
  }

  function report(index, seal) {
    const speed = windowSpeed();
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

  async function mirrorToWorker(offset, bytes) {
    return mirrorOpfs(offset, bytes);
  }

  async function pull(i) {
    const got = await prime(i);
    if (!got || got.__err) throw (got && got.__err) || new Error('gagal');
    const range = ranges[i];
    const ahead = i + PREFETCH_AHEAD;
    let seal = '';
    if (!got.fromCache) {
      const writing = store.put(cacheName, got.key, got.bytes);
      if (ahead < ranges.length && primed.size < 4) prime(ahead);
      await writing;
      if (mesh) publishMeshChunk(i, got.bytes);
      seal = (await mirrorToWorker(range.start, got.bytes)) || '';
      networkHits += 1;
      markChunk(i);
    } else if (ahead < ranges.length && primed.size < 4) {
      prime(ahead);
    }
    const held = got.bytes ? got.bytes.length : 0;
    if (held > peak) peak = held;
    loaded += held;
    primed.delete(i);
    got.bytes = null;
    done[i] = true;
    checkEarly();
    report(i, seal);
    if (range.end < range.start) throw new Error('rentang kosong');
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
