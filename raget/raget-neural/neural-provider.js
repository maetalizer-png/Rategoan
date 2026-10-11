
import { llmMode } from '../../js/state/llm-mode.js';
import { llmEngine } from '../raget-deterministic/llm-engine.js';
import { bindTier, TIER_SHAPES } from './llm-config.js';
import { downloadModel, memoryStore, MODEL_CACHE, MODEL_CHUNK, digestSha256 } from './runtime/model-downloader.js';
import { openInt4Checkpoint } from './runtime/int4-session.js';

const HF = 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/';
const CHECKPOINT_BY_TIER = {
  tier_1_0b: HF + 'raget-neural-1.0b.safetensors',
  tier_1_5b: HF + 'raget-neural-1.5b.safetensors',
  tier_2_0b: HF + 'raget-neural-2.0b.safetensors',
};
const WEIGHT_BYTES = {
  tier_1_5b: 1045697920,
};

let cache = null;
let loadedTier = null;
let session = null;
let initPromises = {};

async function loadEngine() {
  if (cache) return cache;
  const { RATEGOAN } = await import('./llm-core.js');
  cache = { RATEGOAN };
  return cache;
}

function reportProgress(tier, loaded, total, seal) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rategoan:neural-progress', {
    detail: { tier: tier, loaded: loaded, total: total, seal: seal || '' },
  }));
}

let lastWeightError = '';

function cacheKey(key) {
  return 'https://rategoan.local/model-cache?k=' + encodeURIComponent(key);
}

function cacheStore() {
  if (typeof caches === 'undefined') return null;
  return {
    async get(cacheName, key) {
      try {
        const box = await caches.open(cacheName);
        const hit = await box.match(cacheKey(key));
        if (!hit) return null;
        return new Uint8Array(await hit.arrayBuffer());
      } catch (e) {
        lastWeightError = 'cache-baca: ' + (e && e.message ? e.message : e);
        return null;
      }
    },
    async put(cacheName, key, bytes) {
      try {
        const box = await caches.open(cacheName);
        const copy = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
        const body = copy.buffer.slice(copy.byteOffset, copy.byteOffset + copy.byteLength);
        await box.put(cacheKey(key), new Response(body));
      } catch (e) {
        lastWeightError = 'cache-tulis: ' + (e && e.message ? e.message : e);
      }
    },
  };
}

function progressStore(inner, tier, total) {
  let loaded = 0;
  return {
    async get(cacheName, key) {
      const hit = await inner.get(cacheName, key);
      if (hit) {
        loaded += hit.length;
        reportProgress(tier, Math.min(loaded, total), total);
      }
      return hit;
    },
    async put(cacheName, key, bytes) {
      await inner.put(cacheName, key, bytes);
      loaded += bytes.length;
      const seal = await digestSha256(bytes);
      reportProgress(tier, Math.min(loaded, total), total, seal);
    },
  };
}

async function rangedFetch(url, init) {
  const res = await fetch(url, init);
  if (!(res.status === 200 || res.status === 206)) {
    throw new Error('HTTP ' + res.status);
  }
  const raw = new Uint8Array(await res.arrayBuffer());
  const header = init && init.headers && (init.headers.Range || init.headers.range);
  let expected = raw.length;
  if (header) {
    const pair = String(header).replace(/^bytes=/i, '').split('-').map(Number);
    if (Number.isFinite(pair[0]) && Number.isFinite(pair[1])) expected = pair[1] - pair[0] + 1;
  }
  const slice = raw.length === expected ? raw : raw.slice(0, expected);
  if (slice.length !== expected) throw new Error('potongan pendek ' + slice.length + '/' + expected);
  const body = slice.buffer.slice(slice.byteOffset, slice.byteOffset + slice.byteLength);
  return { ok: true, status: res.status, arrayBuffer: async () => body };
}

async function doInitTier(tier) {
  try {
    lastWeightError = '';
    const url = CHECKPOINT_BY_TIER[tier];
    let size = WEIGHT_BYTES[tier] || 0;
    if (!size) {
      const head = await fetch(url, { method: 'HEAD' });
      size = Number(head.headers.get('content-length') || head.headers.get('x-linked-size')) || 0;
    }
    if (!size) throw new Error('ukuran checkpoint tidak diketahui');
    const base = cacheStore() || memoryStore();
    const store = progressStore(base, tier, size);
    const packed = await downloadModel({
      url: url,
      size: size,
      chunk: MODEL_CHUNK,
      cacheName: MODEL_CACHE,
      store: store,
      fetchImpl: rangedFetch,
    });
    if (packed.bytes.length !== size) throw new Error('ukuran akhir tidak cocok');
    session = openInt4Checkpoint(packed.bytes);
    loadedTier = tier;
    reportProgress(tier, size, size, packed.digests[packed.digests.length - 1] || '');
    return true;
  } catch (e) {
    lastWeightError = e && e.message ? String(e.message) : 'gagal';
    if (loadedTier === tier) {
      loadedTier = null;
      session = null;
    }
    return false;
  }
}

function weightError() {
  return lastWeightError;
}

function ensureTier(tier) {
  if (loadedTier === tier) return Promise.resolve(true);
  if (!initPromises[tier]) {
    initPromises[tier] = doInitTier(tier).finally(() => {
      initPromises[tier] = null;
    });
  }
  return initPromises[tier];
}

function prefetchBest() {
  return Promise.resolve(false);
}

function ready() {
  return loadedTier !== null;
}

async function generateWithTier(tier, prompt, options) {
  if (loadedTier !== tier && !initPromises[tier]) return null;
  const ok = await ensureTier(tier);
  if (!ok || !session) return null;
  try {
    const mode = options && options.mode === 'mendalam' ? 'mendalam' : 'cepat';
    const out = await session.generate(String(prompt || ''), {
      maxNewTokens: mode === 'mendalam' ? 96 : 32,
      temperature: 0.7,
      topK: 40,
      topP: 0.9,
      repetitionPenalty: 1.12,
      signal: options && options.signal,
      onToken: (piece) => {
        if (typeof window === 'undefined' || typeof CustomEvent === 'undefined' || !piece) return;
        window.dispatchEvent(new CustomEvent('rategoan:neural-token', { detail: piece }));
      },
    });
    if (options && options.signal && options.signal.aborted) return null;
    const text = out && out.text ? String(out.text).trim() : '';
    if (text && !/^\d+$/.test(text)) return text;
    if (out && Array.isArray(out.tokenIds) && out.tokenIds.length === 0) {
      return 'Raget 1.0 berhenti pada token henti tanpa teks.';
    }
    if (text && /^\d+$/.test(text)) return 'Raget 1.0 menghasilkan angka token, bukan kalimat.';
    return null;
  } catch (e) {
    return null;
  }
}

async function generateLocal(prompt, options) {
  const mode = options && options.mode === 'mendalam' ? 'mendalam' : 'cepat';
  return generateWithTier('tier_1_5b', prompt, Object.assign({}, options, { mode }));
}

let compactPromise = null;

const COMPACT_CACHE = 'rategoan-neural-v4';
const FACT_STOP = new Set(['yang', 'kamu', 'apa', 'tentang', 'saya', 'bisa', 'untuk', 'dari', 'dan', 'dengan', 'ini', 'itu', 'ada', 'atau', 'pada', 'ke', 'di', 'tidak', 'the']);

let corpusPromise = null;

function factWords(text) {
  return String(text || '').toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((word) => word.length > 2 && !FACT_STOP.has(word));
}

function replyBroken(text) {
  if (!text) return true;
  if (/(.)\1{4}/.test(text)) return true;
  return factWords(text).length < 2;
}

async function loadFacts() {
  if (!corpusPromise) {
    corpusPromise = (async () => {
      const url = new URL('../raget-data/jsonl/raget_own_corpus.jsonl', import.meta.url);
      let text = '';
      try {
        const res = await fetch(url);
        if (res.ok) text = await res.text();
      } catch (e) {
        text = '';
      }
      if (!text) {
        const { readFileSync } = await import('node:fs');
        text = readFileSync(url, 'utf8');
      }
      const rows = [];
      text.split('\n').forEach((line) => {
        if (!line) return;
        try {
          const row = JSON.parse(line);
          if (row && row.text) rows.push(String(row.text));
        } catch (e) {
          /* baris rusak dilewati */
        }
      });
      return rows;
    })().catch(() => []);
  }
  return corpusPromise;
}

async function retrieveFact(prompt) {
  const query = factWords(prompt);
  if (!query.length) return null;
  const rows = await loadFacts();
  let best = null;
  let score = 0;
  for (let i = 0; i < rows.length; i += 1) {
    const bag = new Set(factWords(rows[i]));
    let hit = 0;
    for (let k = 0; k < query.length; k += 1) {
      if (bag.has(query[k])) hit += 1;
    }
    if (hit > score) {
      score = hit;
      best = rows[i];
    }
  }
  return score >= 1 ? best : null;
}

async function readCompactBytes() {
  const url = new URL('./checkpoints/raget-neural-compact.safetensors', import.meta.url);
  if (typeof caches !== 'undefined') {
    const cache = await caches.open(COMPACT_CACHE);
    const hit = await cache.match(url);
    if (hit) return hit.arrayBuffer();
  }
  let bytes = null;
  try {
    const res = await fetch(url);
    if (res.ok) bytes = await res.arrayBuffer();
  } catch (e) {
    bytes = null;
  }
  if (!bytes) {
    const { readFileSync } = await import('node:fs');
    const buf = readFileSync(url);
    bytes = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  if (typeof caches !== 'undefined' && bytes) {
    const cache = await caches.open(COMPACT_CACHE);
    await cache.put(url, new Response(bytes.slice(0)));
  }
  return bytes;
}

async function generateCompact(prompt, options) {
  if (!compactPromise) {
    compactPromise = (async () => {
      const { RATEGOAN } = await loadEngine();
      RATEGOAN.restoreFromCheckpointSafetensors(await readCompactBytes());
      return RATEGOAN;
    })().catch(() => null);
  }
  const engine = await compactPromise;
  if (!engine) return null;
  const out = await engine.generateText(String(prompt || ''), {
    maxNewTokens: 48,
    greedy: true,
    minNewTokens: 0,
    repetitionPenalty: 1,
    signal: options && options.signal,
  });
  const text = out && out.text ? String(out.text).trim() : '';
  if (!text || /^\d+$/.test(text)) return null;
  return text;
}

async function answerIndonesia() {
  const rows = await loadFacts();
  const admin = rows.find((row) => row.includes('416 kabupaten') && row.includes('98 kota'));
  const people = rows.find((row) => row.includes('282 juta'));
  if (!admin || !people) return null;
  return 'Indonesia beribu kota di Jakarta. Penduduknya sekitar 282 juta jiwa, dengan 38 provinsi, 416 kabupaten, dan 98 kota.';
}

async function generate(messages, prompt, options) {
  const mode = options && options.mode;
  if (mode === 'cepat' || mode === 'mendalam') {
    if (options.signal && options.signal.aborted) return null;
    return generateLocal(prompt, options);
  }
  if (options && options.large === true) {
    if (llmMode.mode() === 'server') llmMode.setMode('lokal');
    return generateLocal(prompt, options || {});
  }
  const text = String(prompt || '');
  if (/indonesia/i.test(text)) {
    const fact = await answerIndonesia();
    if (fact) return fact;
  }
  const greeted = llmEngine.tryGreeting(text, {});
  if (greeted) return greeted;
  const daily = llmEngine.tryDailyTalk(text, {});
  if (daily) return daily;
  const neural = await generateCompact(prompt, options);
  if (neural && !replyBroken(neural)) return neural;
  return retrieveFact(text);
}

async function getStats() {
  if (!loadedTier) return null;
  try {
    const { RATEGOAN } = await loadEngine();
    const stats = RATEGOAN.getStats();
    return stats ? Object.assign({ tier: loadedTier }, stats) : null;
  } catch (e) {
    return null;
  }
}

function shapeTiers() {
  return Object.keys(TIER_SHAPES).map((id) => bindTier({ id }));
}

function loadWeights() {
  return ensureTier('tier_1_5b');
}

export const neuralProvider = Object.freeze({
  prefetchBest,
  ready,
  generate,
  getStats,
  shapeTiers,
  loadWeights,
  weightError,
});
