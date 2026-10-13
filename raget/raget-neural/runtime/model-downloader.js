import { meshHasChunk, publishMeshChunk, takeMeshChunk } from '../../../js/sync/p2p-sync.js';

export const MODEL_CACHE = 'rategoan-model-cache';
export const NEURAL_CACHE = 'rategoan-neural-cache';
export const MODEL_CHUNK = 4 * 1024 * 1024;
export const PREFETCH_AHEAD = 4;
export const PROGRESS_GRAIN = 256 * 1024;
export const DOWNLOAD_ATTEMPTS = 4;
export const OPFS_ACK_MS = 20000;
export const READ_IDLE_MS = 15000;
export const MODEL_REVISION = '53c362a5d8b403d1983cf46151595c466ff8b095';

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

export function downloadBackoffMs(attempt, rand) {
  const n = Math.max(0, Math.floor(Number(attempt) || 0));
  const exp = Math.min(2000, 200 * (2 ** n));
  const unit = typeof rand === 'number' ? rand : Math.random();
  const jitter = Math.floor(Math.max(0, Math.min(0.999, unit)) * 150);
  return exp + jitter;
}

export async function lockPersistentStorage() {
  const nav = globalThis.navigator;
  if (!nav || !nav.storage || typeof nav.storage.persist !== 'function') return false;
  try {
    if (typeof nav.storage.persisted === 'function' && await nav.storage.persisted()) return true;
    return !!(await nav.storage.persist());
  } catch (e) {
    return false;
  }
}

function joinParts(parts, length) {
  if (parts.length === 1 && parts[0].byteOffset === 0 && parts[0].byteLength === length) return parts[0];
  const out = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.byteLength;
  });
  return out;
}

export function headerValue(res, name) {
  if (!res || !res.headers) return '';
  const wanted = String(name || '').toLowerCase();
  if (typeof res.headers.get === 'function') return String(res.headers.get(wanted) || res.headers.get(name) || '');
  return String(res.headers[wanted] || res.headers[name] || '');
}

export function contentRangeMatches(header, range, total) {
  const match = /bytes\s+(\d+)\s*-\s*(\d+)\s*\/\s*(\d+|\*)/i.exec(String(header || ''));
  if (!match || !range) return false;
  if (Number(match[1]) !== range.start || Number(match[2]) !== range.end) return false;
  if (typeof total === 'number') {
    if (match[3] === '*') return false;
    return Number(match[3]) === total;
  }
  return true;
}

function readSlice(reader, idleMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('stream timeout'));
      try { reader.cancel(); } catch (e) { /* pembaca sudah lepas */ }
    }, idleMs);
    reader.read().then((value) => {
      clearTimeout(timer);
      resolve(value);
    }, (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

async function readResponseBytes(res, expect, onBytes, idleMs, signal) {
  const body = res && res.body;
  if (body && typeof body.getReader === 'function') {
    const reader = body.getReader();
    const stop = () => {
      try { reader.cancel(); } catch (e) { /* pembaca sudah lepas */ }
    };
    if (signal) {
      if (signal.aborted) {
        stop();
        throw new Error('dibatalkan');
      }
      signal.addEventListener('abort', stop, { once: true });
    }
    const parts = [];
    let got = 0;
    try {
      while (got < expect) {
        if (signal && signal.aborted) throw new Error('dibatalkan');
        const step = await readSlice(reader, idleMs > 0 ? idleMs : READ_IDLE_MS);
        if (step.done) break;
        const value = step.value;
        if (!value || !value.byteLength) continue;
        const take = Math.min(value.byteLength, expect - got);
        const piece = take === value.byteLength ? value : value.subarray(0, take);
        parts.push(piece);
        got += piece.byteLength;
        if (onBytes) onBytes(got);
      }
    } finally {
      if (signal) signal.removeEventListener('abort', stop);
      try { reader.releaseLock(); } catch (e) { /* kunci sudah lepas */ }
    }
    if (got !== expect) throw new Error('potongan pendek ' + got + '/' + expect);
    return joinParts(parts, got);
  }
  if (signal && signal.aborted) throw new Error('dibatalkan');
  const raw = new Uint8Array(await res.arrayBuffer());
  const bytes = raw.length === expect ? raw : raw.subarray(0, expect);
  if (bytes.length !== expect) throw new Error('potongan pendek ' + bytes.length + '/' + expect);
  if (onBytes) {
    let shown = 0;
    const grain = PROGRESS_GRAIN > 0 ? PROGRESS_GRAIN : bytes.length;
    while (shown < bytes.length) {
      shown = Math.min(bytes.length, shown + grain);
      onBytes(shown);
    }
  }
  return bytes;
}

export function maskedBytes(size, chunk, revision) {
  const total = Math.max(0, Math.floor(Number(size) || 0));
  const step = chunk > 0 ? Math.floor(chunk) : MODEL_CHUNK;
  if (!total || !step) return 0;
  let bits = [];
  try {
    if (typeof localStorage === 'undefined') return 0;
    const key = 'rategoan_chunks_mask:' + String(revision || MODEL_REVISION);
    const raw = localStorage.getItem(key) || '';
    bits = raw ? raw.split(',') : [];
  } catch (e) {
    return 0;
  }
  let sum = 0;
  const n = Math.ceil(total / step);
  for (let i = 0; i < n; i += 1) {
    if (bits[i] !== '1') continue;
    const start = i * step;
    sum += Math.min(step, total - start);
  }
  return sum;
}

export async function downloadConcurrentChunks(options) {
  await lockPersistentStorage();
  const url = String((options && options.url) || '');
  const size = Math.max(0, Math.floor(Number(options && options.size) || 0));
  const chunk = (options && options.chunk) || MODEL_CHUNK;
  const cacheName = (options && options.cacheName) || MODEL_CACHE;
  const fetchImpl = (options && options.fetchImpl) || fetch;
  const control = (options && options.control) || { paused: false, cancelled: false };
  const netAbort = new AbortController();
  if (control && typeof control === 'object') {
    control.abortNetwork = () => {
      try { netAbort.abort(); } catch (e) { /* sudah batal */ }
    };
  }
  const onProgress = options && options.onProgress;
  const onEarlyReady = options && options.onEarlyReady;
  const wait = (options && options.sleepImpl) || sleep;
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
  const inflight = new Map();
  let next = 0;
  let committedVerifiedBytes = 0;
  let loaded = 0;
  let peak = 0;
  let networkHits = 0;
  let earlyFired = false;
  let stopError = null;
  const t0 = Date.now();
  const samples = [{ t: t0, loaded: 0 }];
  const mesh = options && options.mesh === true;
  const revision = String((options && options.revision) || MODEL_REVISION);
  const expectedHashes = (options && options.chunkHashes) || [];
  const maskKey = 'rategoan_chunks_mask:' + revision;
  const readIdle = Math.max(1, Math.floor(Number(options && options.readIdleMs) || 0) || READ_IDLE_MS);
  const primed = new Map();
  let opfsPort = null;
  let opfsSeq = 0;

  function visibleLoaded() {
    let extra = 0;
    inflight.forEach((n) => { extra += n; });
    return committedVerifiedBytes + extra;
  }

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

  function ownBuffer(bytes) {
    const raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
    if (raw.byteOffset === 0 && raw.byteLength === raw.buffer.byteLength) {
      return { payload: raw, transferBuf: raw.buffer };
    }
    const payload = new Uint8Array(raw.byteLength);
    payload.set(raw);
    return { payload: payload, transferBuf: payload.buffer };
  }

  function mirrorOpfs(offset, bytes) {
    const port = opfsWorker();
    if (!port || !bytes) return Promise.reject(new Error('OPFS tidak tersedia'));
    const id = opfsSeq + 1;
    opfsSeq = id;
    const owned = ownBuffer(bytes);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        port.removeEventListener('message', onMsg);
        reject(new Error('OPFS timeout'));
      }, OPFS_ACK_MS);
      function onMsg(event) {
        if (!event.data || event.data.id !== id) return;
        clearTimeout(timer);
        port.removeEventListener('message', onMsg);
        if (event.data.ok !== true) {
          reject(new Error('OPFS gagal'));
          return;
        }
        resolve({ ok: true, digest: event.data.digest || '' });
      }
      port.addEventListener('message', onMsg);
      try {
        port.postMessage({ op: 'write', id: id, offset: offset, bytes: owned.payload, hash: true }, [owned.transferBuf]);
      } catch (e) {
        clearTimeout(timer);
        port.removeEventListener('message', onMsg);
        reject(e instanceof Error ? e : new Error('OPFS gagal'));
      }
    });
  }

  function maskBits() {
    try {
      if (typeof localStorage === 'undefined') return [];
      const raw = localStorage.getItem(maskKey) || '';
      return raw ? raw.split(',') : [];
    } catch (e) {
      return [];
    }
  }

  async function fetchRange(range, expect, onBytes) {
    let last = null;
    for (let attempt = 0; attempt < DOWNLOAD_ATTEMPTS; attempt += 1) {
      if (control.cancelled || netAbort.signal.aborted) throw new Error('dibatalkan');
      try {
        const res = await fetchImpl(url, {
          method: 'GET',
          headers: { Range: 'bytes=' + range.start + '-' + range.end },
          cache: 'no-store',
          credentials: 'omit',
          redirect: 'follow',
          signal: netAbort.signal,
        });
        if (!res || res.status !== 206) throw new Error('HTTP ' + (res && res.status));
        if (!contentRangeMatches(headerValue(res, 'content-range'), range, size)) {
          throw new Error('Content-Range tidak cocok');
        }
        return await readResponseBytes(res, expect, onBytes, readIdle, netAbort.signal);
      } catch (e) {
        last = e instanceof Error ? e : new Error('gagal');
        if (control.cancelled || netAbort.signal.aborted) throw new Error('dibatalkan');
        if (attempt + 1 >= DOWNLOAD_ATTEMPTS) break;
        if (onBytes) onBytes(0);
        await wait(downloadBackoffMs(attempt));
      }
    }
    throw last || new Error('gagal');
  }

  let verifiedSize = null;
  function chunkCovered(index) {
    if (verifiedSize == null) return false;
    return verifiedSize >= ranges[index].end + 1;
  }

  async function probeOpfsBytes() {
    if (options && typeof options.opfsSize === 'number' && Number.isFinite(options.opfsSize)) {
      return Math.max(0, Math.floor(options.opfsSize));
    }
    const nav = globalThis.navigator;
    if (!nav || !nav.storage || typeof nav.storage.getDirectory !== 'function') return null;
    try {
      const root = await nav.storage.getDirectory();
      const handle = await root.getFileHandle(String((options && options.fileName) || 'raget-neural-1.5b.safetensors'));
      const file = await handle.getFile();
      return Math.max(0, Number(file.size) || 0);
    } catch (e) {
      return 0;
    }
  }

  function prime(i) {
    if (i < 0 || i >= ranges.length) return null;
    if (primed.has(i)) return primed.get(i);
    const range = ranges[i];
    const key = url + '#' + range.start + '-' + range.end;
    const expect = range.end - range.start + 1;
    const job = (async () => {
      if (maskBits()[i] === '1' && chunkCovered(i) && await resumeDigestOk(i)) return { bytes: null, fromCache: true, sealed: true, key: key, expect: expect };
      if (mesh && meshHasChunk(i)) {
        const shared = takeMeshChunk(i);
        if (shared && shared.length === expect) return { bytes: shared, fromCache: true, key: key, expect: expect };
      }
      const bytes = await fetchRange(range, expect, (got) => noteStream(i, got));
      return { bytes: bytes, fromCache: false, key: key, expect: expect };
    })();
    const tracked = job.then((value) => value, (err) => ({ __err: err }));
    primed.set(i, tracked);
    return tracked;
  }

  function windowSpeed() {
    const now = Date.now();
    const seen = visibleLoaded();
    samples.push({ t: now, loaded: seen });
    const cut = now - 5000;
    while (samples.length > 2 && samples[0].t < cut) samples.shift();
    const a = samples[0];
    const dt = Math.max(0.001, (now - a.t) / 1000);
    const delta = seen - a.loaded;
    if (delta > 0) return delta / dt;
    return seen / Math.max(0.001, (now - t0) / 1000);
  }

  function markChunk(index) {
    try {
      if (typeof localStorage === 'undefined') return;
      const raw = localStorage.getItem(maskKey) || '';
      const bits = raw ? raw.split(',') : [];
      bits[index] = '1';
      localStorage.setItem(maskKey, bits.join(','));
    } catch (e) { /* penyimpanan tidak ada */ }
  }

  function report(index, seal) {
    const seen = visibleLoaded();
    const verified = committedVerifiedBytes;
    let shown = seen;
    if (size > 0 && verified < size && shown >= size) shown = size - 1;
    if (size > 0 && verified >= size) shown = size;
    loaded = shown;
    const speed = windowSpeed();
    const eta = speed > 0 ? Math.max(0, (size - verified) / speed) : 0;
    if (onProgress) {
      onProgress({
        loaded: loaded,
        total: size,
        visibleLoaded: seen,
        committedVerifiedBytes: verified,
        seal: seal,
        speed: speed,
        eta: eta,
        parts: ranges.length,
        index: index,
        source: networkHits > 0 ? 'network' : 'opfs',
        early: earlyFired,
        phase: seal ? 'WRITING_OPFS' : 'TRANSFERRING',
      });
    }
  }

  function noteStream(index, gotBytes) {
    const prev = inflight.get(index) || 0;
    const nextBytes = Math.max(0, gotBytes | 0);
    inflight.set(index, nextBytes);
    if (nextBytes < prev || prev === 0 || Math.floor(nextBytes / PROGRESS_GRAIN) > Math.floor(prev / PROGRESS_GRAIN)) {
      report(index, '');
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

  async function persist(offset, bytes, key) {
    const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || 0);
    const payload = new Uint8Array(src.byteLength);
    payload.set(src);
    if (options && typeof options.diskWrite === 'function') {
      const noted = await options.diskWrite(cacheName, key, payload);
      const digest = noted && noted.digest ? String(noted.digest) : '';
      return { ok: true, digest: digest };
    }
    return mirrorOpfs(offset, payload);
  }

  function askOpfs(message) {
    const port = opfsWorker();
    if (!port) return Promise.reject(new Error('OPFS tidak tersedia'));
    const id = opfsSeq + 1;
    opfsSeq = id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        port.removeEventListener('message', onMsg);
        reject(new Error('OPFS timeout'));
      }, OPFS_ACK_MS);
      function onMsg(event) {
        if (!event.data || event.data.id !== id) return;
        clearTimeout(timer);
        port.removeEventListener('message', onMsg);
        if (event.data.ok !== true) {
          reject(new Error('OPFS gagal'));
          return;
        }
        resolve(event.data);
      }
      port.addEventListener('message', onMsg);
      try {
        port.postMessage(Object.assign({ id: id }, message));
      } catch (e) {
        clearTimeout(timer);
        port.removeEventListener('message', onMsg);
        reject(e instanceof Error ? e : new Error('OPFS gagal'));
      }
    });
  }

  async function resumeDigestOk(index) {
    const wanted = expectedHashes[index];
    if (!wanted) return true;
    const range = ranges[index];
    const expect = range.end - range.start + 1;
    if (options && typeof options.opfsDigest === 'function') {
      const got = await options.opfsDigest(range.start, expect);
      return got === wanted;
    }
    try {
      const row = await askOpfs({ op: 'digest', offset: range.start, length: expect });
      return !!(row && row.digest === wanted);
    } catch (e) {
      return false;
    }
  }

  async function pull(i) {
    const got = await prime(i);
    if (!got || got.__err) throw (got && got.__err) || new Error('gagal');
    const range = ranges[i];
    const ahead = i + PREFETCH_AHEAD;
    let seal = '';
    let held = got.expect;
    if (!got.sealed && !got.fromCache) {
      held = got.bytes ? got.bytes.length : 0;
      if (mesh && got.bytes) publishMeshChunk(i, got.bytes.slice());
      if (ahead < ranges.length && primed.size < 4) prime(ahead);
      let writeAck = null;
      for (let wAttempt = 0; wAttempt < 3; wAttempt += 1) {
        try {
          writeAck = await persist(range.start, got.bytes, got.key);
          if (writeAck && writeAck.ok === true) break;
        } catch (err) {
          if (wAttempt === 2) throw err;
          await wait(500 * (wAttempt + 1));
        }
      }
      const ack = writeAck;
      if (!ack || ack.ok !== true) throw new Error('tulis OPFS gagal');
      if (expectedHashes[i] && ack.digest !== expectedHashes[i]) {
        const err = new Error('checksum_mismatch');
        err.name = 'ChecksumError';
        throw err;
      }
      seal = ack.digest || 'opfs';
      networkHits += 1;
      markChunk(i);
    } else if (ahead < ranges.length && primed.size < 4) {
      prime(ahead);
      held = got.bytes ? got.bytes.length : got.expect;
    }
    inflight.delete(i);
    if (held > peak) peak = held;
    if (!got.sealed) committedVerifiedBytes += held;
    loaded = committedVerifiedBytes;
    primed.delete(i);
    if (got) got.bytes = null;
    done[i] = true;
    checkEarly();
    report(i, seal || 'opfs');
    if (range.end < range.start) throw new Error('rentang kosong');
  }

  async function worker() {
    while (!stopError) {
      while (control.paused && !control.cancelled && !stopError) await wait(40);
      if (stopError) return;
      if (control.cancelled) {
        try { netAbort.abort(); } catch (e) { /* sudah batal */ }
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

  async function releaseOpfs() {
    const port = opfsPort;
    if (!port) return;
    const id = opfsSeq + 1;
    opfsSeq = id;
    try {
      await new Promise((resolve) => {
        const timer = setTimeout(() => {
          port.removeEventListener('message', onMsg);
          resolve();
        }, 2000);
        function onMsg(event) {
          if (!event.data || event.data.id !== id) return;
          clearTimeout(timer);
          port.removeEventListener('message', onMsg);
          resolve();
        }
        port.addEventListener('message', onMsg);
        try {
          port.postMessage({ op: 'close', id: id });
        } catch (e) {
          clearTimeout(timer);
          port.removeEventListener('message', onMsg);
          resolve();
        }
      });
    } finally {
      try { port.terminate(); } catch (e) { /* worker sudah tutup */ }
      opfsPort = null;
    }
  }

  verifiedSize = await probeOpfsBytes();
  const preset = maskBits();
  for (let i = 0; i < ranges.length; i += 1) {
    if (preset[i] === '1' && chunkCovered(i)) committedVerifiedBytes += ranges[i].end - ranges[i].start + 1;
  }
  loaded = committedVerifiedBytes;
  if (committedVerifiedBytes > 0) report(0, 'opfs');

  const runners = [];
  const workers = ranges.length === 0 ? 0 : Math.min(concurrency, ranges.length);
  for (let k = 0; k < workers; k += 1) runners.push(worker());
  try {
    await Promise.all(runners);
    if (stopError) throw stopError;
    return { parts: ranges.length, bytesHeld: 0, peakChunk: peak, size: size, early: earlyFired };
  } finally {
    await releaseOpfs();
  }
}
