
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
    const { RATEGOAN } = await loadEngine();
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

async function generate(messages, prompt, options) {
  if (llmMode.mode() === 'server') llmMode.setMode('lokal');
  return generateLocal(prompt, options || {});
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
