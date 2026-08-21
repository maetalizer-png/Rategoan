// Provider Raget Neural (vNext Fase C) - jembatan tipis antara kontrak
// provider model (llm-models.js, id 'raget-neural-50m') dan mesin transformer
// yang diadaptasi di raget-llm/neural/ (asal: kesempatan-os-/kesem-llm/).
//
// SENGAJA lazy-load penuh (dynamic import + fetch checkpoint hanya saat
// init() pertama dipanggil) - TIDAK PERNAH diimport statis dari agent.js atau
// rantai import js/main.js. Ini pelajaran langsung dari bug top-level-await
// di migrasi domain hari internasional (Fase B): apa pun yang bisa lambat
// TIDAK BOLEH menunda evaluasi modul yang berada di rantai bootstrap utama.
// Modul ini hanya tersentuh sama sekali kalau pengguna aktif memilih model
// "Raget Neural (50M)" di picker - opt-in murni, sesuai roadmap.

let cache = null; // { LLMCore } setelah modul neural/ dimuat
let modelReady = false;
let initPromise = null;

async function loadEngine() {
  if (cache) return cache;
  const { LLMCore } = await import('./neural/llm-core.js');
  cache = { LLMCore };
  return cache;
}

async function doInit() {
  try {
    const { LLMCore } = await loadEngine();
    const res = await fetch(new URL('../raget-data/neural/checkpoint-50m.json', import.meta.url));
    if (!res.ok) throw new Error('checkpoint fetch gagal: HTTP ' + res.status);
    const checkpoint = await res.json();
    LLMCore.restoreFromCheckpointObject(checkpoint);
    modelReady = true;
    return true;
  } catch (e) {
    console.error('[Raget Neural] gagal inisialisasi, akan jatuh ke rule engine:', e);
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
    const { LLMCore } = await loadEngine();
    const out = await LLMCore.generateText(String(prompt || ''), {
      maxNewTokens: 60,
      temperature: 0.9,
      greedy: false,
    });
    const text = out && out.text ? out.text.trim() : '';
    return text || null;
  } catch (e) {
    console.error('[Raget Neural] generate() gagal:', e);
    return null;
  }
}

async function getStats() {
  if (!modelReady) return null;
  try {
    const { LLMCore } = await loadEngine();
    return LLMCore.getStats();
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
