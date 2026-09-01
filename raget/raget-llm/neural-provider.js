
import { llmMode } from '../../js/state/llm-mode.js';

const SERVER_TIMEOUT_MS = 8000;
const CHECKPOINT_BY_TIER = {
  ringan: '../raget-data/neural/raget-neural-massive50m.safetensors',
  berat: '../raget-data/neural/raget-neural-massive100m.safetensors',
  // super = tier "Raget 200M": TIDAK dibundel di repo (>100MB, kebijakan
  // CHECKPOINT-POLICY.md), diunduh opt-in dari Release GitHub. sw.js
  // meng-cache origin ini supaya offline setelah unduhan pertama.
  super: 'https://github.com/maetalizer-png/Rategoan/releases/download/checkpoint-200m/raget-neural-massive200m.safetensors',
};
const PACKAGE_SIZE_MB = { super: 163 };

let cache = null;
let loadedTier = null;
let initPromises = {};

async function loadEngine() {
  if (cache) return cache;
  const { RATEGOAN } = await import('./neural/llm-core.js');
  cache = { RATEGOAN };
  return cache;
}

let lastDownloadError = null;

async function doInitTier(tier) {
  lastDownloadError = null;
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
    // TypeError tanpa status HTTP = fetch gagal sebelum ada respons -
    // pada tier 'super' ini SELALU berarti diblokir CORS oleh hosting
    // GitHub Release (dikonfirmasi lewat pengujian langsung: asset
    // Release GitHub tidak pernah mengirim header Access-Control-Allow-
    // Origin), BUKAN sekadar koneksi lambat/terputus - retry TIDAK akan
    // pernah berhasil sampai file dipindah ke hosting yang mendukung
    // CORS (mis. Hugging Face Hub).
    lastDownloadError = e instanceof TypeError ? 'cors' : 'lainnya';
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

function init() {
  return ensureTier('ringan');
}

function ready() {
  return loadedTier !== null;
}

function tierReady(tier) {
  return loadedTier === tier;
}

// Unduhan opt-in eksplisit (dipanggil dari UI pemilih model setelah user
// konfirmasi, BUKAN otomatis dari alur chat) - dipakai tier "super" (200M).
function downloadTier(tier) {
  return ensureTier(tier);
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
  if (preferredTier === 'super') {
    // Tidak pernah memicu unduhan 163MB diam-diam dari alur chat - hanya
    // pakai tier super kalau memang SUDAH diunduh+dimuat lewat opt-in UI.
    if (tierReady('super')) {
      const superText = await generateWithTier('super', prompt);
      if (superText) return superText;
    }
    return generateWithTier('ringan', prompt);
  }
  if (preferredTier === 'berat') {
    const cap = llmMode.deviceCapability();
    if (!(cap.known && cap.strong === false)) {
      const heavyText = await generateWithTier('berat', prompt);
      if (heavyText) return heavyText;
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
    }
    return generateLocal(prompt, 'ringan');
  }
  if (mode === 'lokal-berat') {
    return generateLocal(prompt, 'berat');
  }
  if (mode === 'lokal-super') {
    return generateLocal(prompt, 'super');
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
  tierReady,
  downloadTier,
  packageSizeMB: PACKAGE_SIZE_MB,
  get lastDownloadError() {
    return lastDownloadError;
  },
});
