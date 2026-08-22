// Provider Raget Neural (vNext Fase C) - jembatan tipis antara kontrak
// provider model (llm-models.js, id 'raget-neural-50m') dan mesin transformer
// di raget-llm/neural/. SENGAJA lazy-load penuh (dynamic import + fetch
// checkpoint hanya saat init() pertama dipanggil) - modul ini hanya tersentuh
// kalau pengguna aktif memilih model "Raget Neural (50M)" di picker.

let cache = null;
let modelReady = false;
let initPromise = null;

async function loadEngine() {
  if (cache) return cache;
  const { RATEGOAN } = await import('./neural/llm-core.js');
  cache = { RATEGOAN };
  return cache;
}

async function doInit() {
  try {
    const { RATEGOAN } = await loadEngine();
    const res = await fetch(new URL('../raget-data/neural/raget-neural-50m.safetensors', import.meta.url));
    if (!res.ok) throw new Error('checkpoint fetch gagal: HTTP ' + res.status);
    const buffer = await res.arrayBuffer();
    RATEGOAN.restoreFromCheckpointSafetensors(buffer);
    modelReady = true;
    return true;
  } catch (e) {
    modelReady = false;
    return false;
  }
}

function init() {
  if (!initPromise) initPromise = doInit();
  return initPromise;
}

function ready() {
  return modelReady;
}

async function generate(messages, prompt) {
  const ok = modelReady || (await init());
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

async function getStats() {
  if (!modelReady) return null;
  try {
    const { RATEGOAN } = await loadEngine();
    return RATEGOAN.getStats();
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
