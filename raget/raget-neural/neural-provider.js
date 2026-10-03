
import { llmMode } from '../../js/state/llm-mode.js';

const SERVER_TIMEOUT_MS = 8000;
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

async function doInitTier(tier) {
  try {
    const { RATEGOAN } = await loadEngine();
    const res = await fetch(new URL(CHECKPOINT_BY_TIER[tier], import.meta.url));
    if (!res.ok) throw new Error('checkpoint fetch gagal (' + tier + '): HTTP ' + res.status);
    const buffer = await res.arrayBuffer();
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
  ensureTier('super').catch(() => {});
}

function ready() {
  return loadedTier !== null;
}

function tierReady(tier) {
  return loadedTier === tier;
}

async function generateWithTier(tier, prompt) {
  const ok = await ensureTier(tier);
  if (!ok) return null;
  try {
    const { RATEGOAN } = await loadEngine();
    const out = await RATEGOAN.generateText(String(prompt || ''), {
      maxNewTokens: 60,
      temperature: 0.9,
      greedy: false,
    });
    const text = out && out.text ? out.text.trim() : '';
    return text || null;
  } catch (e) {
    return null;
  }
}

// Cascade otomatis: pakai mesin terbaik yang SUDAH siap tanpa memicu
// unduhan baru di tengah chat (200M cuma dipakai kalau prefetchBest()
// sudah selesai duluan) - super -> berat -> ringan.
async function generateLocal(prompt) {
  if (tierReady('super')) {
    const superText = await generateWithTier('super', prompt);
    if (superText) return superText;
  }
  if (deviceCanHandleBerat()) {
    const heavyText = await generateWithTier('berat', prompt);
    if (heavyText) return heavyText;
  }
  return generateWithTier('ringan', prompt);
}

async function generateServer(prompt, url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SERVER_TIMEOUT_MS);
  try {
    const res = await fetch(url.replace(/\/+$/, '') + '/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: String(prompt || ''), maxNewTokens: 60, temperature: 0.9 }),
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data && typeof data.text === 'string' ? data.text.trim() : '';
    return text || null;
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function generate(messages, prompt) {
  if (llmMode.mode() === 'server') {
    const url = llmMode.serverUrl();
    if (url) {
      const serverText = await generateServer(prompt, url);
      if (serverText) return serverText;
    }
  }
  return generateLocal(prompt);
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
