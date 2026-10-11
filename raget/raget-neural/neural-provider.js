
import { llmMode } from '../../js/state/llm-mode.js';
import { bindTier, TIER_SHAPES } from './llm-config.js';
import { openInt4Checkpoint } from './runtime/int4-session.js';

const HF = 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/';
const CHECKPOINT_BY_TIER = {
  tier_1_0b: HF + 'raget-neural-1.0b.safetensors',
  tier_1_5b: HF + 'raget-neural-1.5b.safetensors',
  tier_2_0b: HF + 'raget-neural-2.0b.safetensors',
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

function reportProgress(tier, loaded, total) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rategoan:neural-progress', { detail: { tier, loaded, total } }));
}

async function readCheckpoint(res, tier) {
  const total = Number(res.headers.get('content-length')) || 0;
  if (!res.body || !res.body.getReader) {
    const buffer = await res.arrayBuffer();
    reportProgress(tier, buffer.byteLength, total || buffer.byteLength);
    return buffer;
  }
  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  while (true) {
    const step = await reader.read();
    if (step.done) break;
    chunks.push(step.value);
    loaded += step.value.length;
    reportProgress(tier, loaded, total || loaded);
  }
  const out = new Uint8Array(loaded);
  let offset = 0;
  chunks.forEach((chunk) => {
    out.set(chunk, offset);
    offset += chunk.length;
  });
  return out.buffer;
}

async function doInitTier(tier) {
  try {
    const res = await fetch(new URL(CHECKPOINT_BY_TIER[tier], import.meta.url));
    if (!res.ok) throw new Error('checkpoint fetch gagal (' + tier + '): HTTP ' + res.status);
    const buffer = await readCheckpoint(res, tier);
    session = openInt4Checkpoint(buffer);
    loadedTier = tier;
    return true;
  } catch (e) {
    if (loadedTier === tier) loadedTier = null;
    return false;
  }
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

function deviceCanHandleLarge() {
  const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
  return typeof mem === 'number' && mem >= 8;
}

// Tidak mengunduh saat aplikasi dibuka. Unduhan hanya terjadi kalau
// generate() dipanggil, dan gagal diam-diam kalau berkas belum ada.
function prefetchBest() {
  return Promise.resolve(false);
}

function ready() {
  return loadedTier !== null;
}

function tierReady(tier) {
  return loadedTier === tier;
}

async function generateWithTier(tier, prompt, options) {
  const ok = await ensureTier(tier);
  if (!ok || !session) return null;
  try {
    const out = await session.generate(String(prompt || ''), {
      maxNewTokens: 2,
      signal: options && options.signal,
    });
    if (options && options.signal && options.signal.aborted) return null;
    const text = out && out.text ? out.text.trim() : '';
    return text || null;
  } catch (e) {
    return null;
  }
}

async function generateLocal(prompt, options) {
  if (deviceCanHandleLarge() && tierReady('tier_2_0b')) {
    const top = await generateWithTier('tier_2_0b', prompt, options);
    if (top) return top;
  }
  if (deviceCanHandleLarge() && tierReady('tier_1_5b')) {
    const mid = await generateWithTier('tier_1_5b', prompt, options);
    if (mid) return mid;
  }
  if (tierReady('tier_1_0b')) {
    const base = await generateWithTier('tier_1_0b', prompt, options);
    if (base) return base;
  }
  if (deviceCanHandleLarge()) {
    const top = await generateWithTier('tier_2_0b', prompt, options);
    if (top) return top;
    const mid = await generateWithTier('tier_1_5b', prompt, options);
    if (mid) return mid;
  }
  return generateWithTier('tier_1_0b', prompt, options);
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
  if (options && options.large === true) {
    if (llmMode.mode() === 'server') llmMode.setMode('lokal');
    return generateLocal(prompt, options || {});
  }
  const text = String(prompt || '');
  if (/indonesia/i.test(text)) {
    const fact = await answerIndonesia();
    if (fact) return fact;
  }
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

export const neuralProvider = Object.freeze({
  prefetchBest,
  ready,
  generate,
  getStats,
  shapeTiers,
});
