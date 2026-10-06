
import { llmMode } from '../../js/state/llm-mode.js';

const HF = 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/';
const CHECKPOINT_BY_TIER = {
  // Semua checkpoint ada di Hugging Face, bukan git dan bukan GitHub
  // Release. Asset Release tidak mengirim Access-Control-Allow-Origin,
  // jadi fetch() browser gagal diam-diam. HF resolve/main mengirim
  // access-control-allow-origin: *. URL absolut tetap valid untuk
  // `new URL(..., import.meta.url)`.
  ringan: HF + 'raget-neural-massive50m.safetensors',
  berat: HF + 'raget-neural-massive100m.safetensors',
  super: HF + 'raget-neural-massive200m.safetensors',
};

let cache = null;
let loadedTier = null;
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
    RATEGOAN.restoreFromCheckpointSafetensors(buffer);
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

// Perangkat lemah (RAM<4GB terdeteksi) dilewati dari tier "berat"
// (100M) supaya tidak macet/OOM di HP low-end - bukan pilihan
// pengguna, murni penjaga keamanan runtime.
function deviceCanHandleBerat() {
  const mem = typeof navigator !== 'undefined' ? navigator.deviceMemory : undefined;
  return !(typeof mem === 'number' && mem < 4);
}

// Diambil sekali secara diam-diam saat app dibuka (lihat main.js) -
// TIDAK PERNAH menunggu ini sebelum membalas chat. Kalau sampai
// selesai sebelum pesan berikutnya dikirim, cascade generate() di
// bawah otomatis memakainya (tierReady('super') jadi true); kalau
// belum/gagal, cascade turun ke tier lebih ringan tanpa pengguna
// sadar ada percobaan unduhan sama sekali.
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
  if (!ok) return null;
  try {
    const { RATEGOAN } = await loadEngine();
    const out = await RATEGOAN.generateText(String(prompt || ''), {
      maxNewTokens: 60,
      temperature: 0.9,
      greedy: false,
      stopSignal: options && options.signal,
    });
    if (options && options.signal && options.signal.aborted) return null;
    const text = out && out.text ? out.text.trim() : '';
    return text || null;
  } catch (e) {
    return null;
  }
}

async function generateLocal(prompt, options) {
  if (tierReady('super')) {
    const superText = await generateWithTier('super', prompt, options);
    if (superText) return superText;
  }
  if (deviceCanHandleBerat()) {
    const heavyText = await generateWithTier('berat', prompt, options);
    if (heavyText) return heavyText;
  }
  return generateWithTier('ringan', prompt, options);
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

export const neuralProvider = Object.freeze({
  prefetchBest,
  ready,
  generate,
  getStats,
});
