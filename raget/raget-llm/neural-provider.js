// Provider Raget Neural (vNext Fase C) - jembatan tipis antara kontrak
// provider model (llm-models.js, id 'raget-neural-50m') dan mesin transformer
// di raget-llm/neural/. SENGAJA lazy-load penuh (dynamic import + fetch
// checkpoint hanya saat init() pertama dipanggil) - modul ini hanya tersentuh
// kalau pengguna aktif memilih model "Raget Neural (50M)" di picker.
//
// MEGA-BATCH RAGETAN ROUND 5 - FASE 3: mode Server (opsional, lihat
// js/state/llm-mode.js) memanggil endpoint HTTP eksternal (server 1-file di
// raget-tools/serve-massive50m.py, dideploy ke VPS/HF Spaces) yang menyajikan
// checkpoint YANG SAMA - berguna untuk checkpoint besar yang lebih berat
// dijalankan di browser lambat/perangkat lemah.
//
// MEGA-BATCH RAGETAN ROUND 6 - FASE 4: 3 tingkat mode (js/state/llm-mode.js) -
// 'lokal-ringan' (50M, default, paling ringan/kompatibel), 'lokal-berat'
// (100M, dicoba HANYA kalau navigator.deviceMemory tidak menandakan
// perangkat lemah - API itu sendiri opsional/Chrome-only, kalau tidak ada
// tetap DICOBA tapi dengan fallback penuh), 'server' (biasanya 100M di
// HF Spaces/VPS). FALLBACK BERJENJANG - gagal di tingkat manapun (device
// lemah terdeteksi, fetch checkpoint 100M gagal, server mati/timeout) selalu
// jatuh ke 'lokal-ringan' (satu-satunya tingkat yang dijamin cocok di semua
// perangkat) - generate() TIDAK PERNAH gagal total selama checkpoint 50M ada.

import { llmMode } from '../../js/state/llm-mode.js';

const SERVER_TIMEOUT_MS = 8000;
const CHECKPOINT_BY_TIER = {
  ringan: '../raget-data/neural/raget-neural-50m.safetensors',
  berat: '../raget-data/neural/raget-neural-massive100m.safetensors',
};

let cache = null;
let loadedTier = null; // 'ringan' | 'berat' | null (belum ada model dimuat)
let initPromises = {}; // per-tier, supaya switch tingkat tidak balapan

async function loadEngine() {
  if (cache) return cache;
  const { RATEGOAN } = await import('./neural/llm-core.js');
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

// Kompatibilitas nama lama (dipakai bridge lain yang sudah ada) - default
// ke tingkat 'ringan' (perilaku Round 5 dan sebelumnya, tidak berubah).
function init() {
  return ensureTier('ringan');
}

function ready() {
  return loadedTier !== null;
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

async function generateLocal(prompt, preferredTier) {
  if (preferredTier === 'berat') {
    const cap = llmMode.deviceCapability();
    // Perangkat DIKETAHUI lemah (<4GB) -> jangan coba 100M sama sekali,
    // langsung ke tingkat ringan (hemat bandwidth+memori, bukan cuma waktu).
    if (!(cap.known && cap.strong === false)) {
      const heavyText = await generateWithTier('berat', prompt);
      if (heavyText) return heavyText;
      // 100M gagal dimuat/generate (device sungguh tidak sanggup, atau
      // checkpoint belum ada) -> fallback berjenjang ke 50M.
    }
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
  const mode = llmMode.mode();
  if (mode === 'server') {
    const url = llmMode.serverUrl();
    if (url) {
      const serverText = await generateServer(prompt, url);
      if (serverText) return serverText;
      // Server mati/timeout/error -> fallback berjenjang ke lokal ringan
      // (setting pengguna TIDAK diubah, tetap "Server" sampai diganti manual).
    }
    return generateLocal(prompt, 'ringan');
  }
  if (mode === 'lokal-berat') {
    return generateLocal(prompt, 'berat');
  }
  return generateLocal(prompt, 'ringan');
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
  init,
  ready,
  generate,
  getStats,
});
