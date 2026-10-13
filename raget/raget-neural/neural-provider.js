
import { personaLora, pullLora } from '../../js/chat/persona.js';
import { llmMode } from '../../js/state/llm-mode.js';
import { hudBudget } from '../../js/studio/telemetry.js';
import { bindTier, TIER_SHAPES } from './llm-config.js';
import { openInt4Stream } from './runtime/int4-session.js';
import {
  WEIGHT_ROOM,
  WEIGHT_SPEC,
  EARLY_PROGRESS_BYTES,
  downloadConcurrentChunks,
  openSyncWeight,
  storageFree,
  safetensorsHeaderOk,
} from './runtime/weight-cache.js';

export const MODEL_STATUS = Object.freeze({
  NOT_DOWNLOADED: 'NOT_DOWNLOADED',
  DOWNLOADING: 'DOWNLOADING',
  READY: 'READY',
  FAILED: 'FAILED',
});
export const INFERENCE_MS = 30000;

const HF = 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/';
const CHECKPOINT_BY_TIER = {
  tier_1_0b: HF + 'raget-neural-1.0b.safetensors',
  tier_1_5b: HF + 'raget-neural-1.5b.safetensors',
  tier_2_0b: HF + 'raget-neural-2.0b.safetensors',
};
const WEIGHT_BYTES = {
  tier_1_5b: WEIGHT_SPEC.size,
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

function reportProgress(detail) {
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rategoan:neural-progress', { detail: detail }));
}

let lastWeightError = '';
let weightReader = null;
const control = { paused: false, cancelled: false };
let worker = null;
let workerJob = 0;
let earlyFlag = false;
const earlyWaiters = [];
let bootPromise = null;
const INSTALL_KEY = 'rategoan_weights_1_5b_installed';
const PARTS_KEY = 'rategoan_weights_1_5b_parts';
let modelStatus = MODEL_STATUS.NOT_DOWNLOADED;
let lastEnvelope = { ok: false, status: MODEL_STATUS.NOT_DOWNLOADED, error: '', reply: null };

function remember(patch) {
  if (patch && patch.status) modelStatus = patch.status;
  lastEnvelope = {
    ok: !!(patch && patch.ok === true),
    status: modelStatus,
    error: patch && patch.error ? String(patch.error) : '',
    reply: patch && patch.reply != null ? String(patch.reply) : null,
  };
  return lastEnvelope;
}

function currentEnvelope() {
  return lastEnvelope;
}

function currentStatus() {
  return modelStatus;
}

function weightError() {
  return lastWeightError;
}

function weightPaused() {
  return control.paused;
}

function pauseWeights() {
  control.paused = true;
}

function resumeWeights() {
  control.paused = false;
}

function cancelWeights() {
  control.cancelled = true;
  control.paused = false;
  earlyFlag = false;
}

function installedFlag() {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(INSTALL_KEY) === 'true';
  } catch (e) {
    return false;
  }
}

function sealInstalled(parts) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(INSTALL_KEY, 'true');
    localStorage.setItem(PARTS_KEY, String(parts || 50));
  } catch (e) {
    /* penyimpanan pribadi ditolak */
  }
}

function clearInstalled() {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(INSTALL_KEY);
    localStorage.removeItem(PARTS_KEY);
  } catch (e) {
    /* penyimpanan pribadi ditolak */
  }
}

async function bootWeights() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    if (loadedTier && weightReader && safetensorsHeaderOk(weightReader)) {
      remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: null });
      return true;
    }
    if (!installedFlag()) {
      remember({ ok: false, status: MODEL_STATUS.NOT_DOWNLOADED, error: '', reply: null });
      return false;
    }
    const sync = await openSyncWeight('raget-neural-1.5b.safetensors');
    if (!safetensorsHeaderOk(sync)) {
      if (sync && typeof sync.close === 'function') {
        try { sync.close(); } catch (e) { /* gagang buruk */ }
      }
      weightReader = null;
      loadedTier = null;
      earlyFlag = false;
      clearInstalled();
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'header safetensors rusak', reply: null });
      return false;
    }
    weightReader = sync;
    loadedTier = 'tier_1_5b';
    earlyFlag = true;
    remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: null });
    return true;
  })();
  try {
    return await bootPromise;
  } finally {
    bootPromise = null;
  }
}

function haltInference() {
  if (worker) {
    worker.terminate();
    worker = null;
  }
}

function ensureWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./runtime/raget-worker.js', import.meta.url), { type: 'module' });
  return worker;
}

async function doInitTier(tier) {
  try {
    lastWeightError = '';
    control.cancelled = false;
    remember({ ok: false, status: MODEL_STATUS.DOWNLOADING, error: '', reply: null });
    const url = CHECKPOINT_BY_TIER[tier];
    let size = WEIGHT_BYTES[tier] || 0;
    if (!size) {
      const head = await fetch(url, { method: 'HEAD' });
      size = Number(head.headers.get('content-length') || head.headers.get('x-linked-size')) || 0;
    }
    if (!size) throw new Error('ukuran checkpoint tidak diketahui');
    const chunk = WEIGHT_SPEC.chunk;
    const sync = await openSyncWeight('raget-neural-1.5b.safetensors');
    if (sync && typeof sync.close === 'function') {
      try { sync.close(); } catch (e) { /* lepas kunci sebelum tulis */ }
    }
    weightReader = { size: size, read() { throw new Error('bobot belum tertulis di OPFS'); } };
    session = null;
    const packed = await downloadConcurrentChunks({
      url: url,
      size: size,
      chunk: chunk,
      revision: WEIGHT_SPEC.revision,
      cacheName: WEIGHT_SPEC.cache,
      control: control,
      concurrency: 6,
      mesh: typeof window !== 'undefined',
      roomNeed: tier === 'tier_1_5b' ? WEIGHT_ROOM : 0,
      earlyBytes: tier === 'tier_1_5b' ? EARLY_PROGRESS_BYTES : 0,
      onEarlyReady: () => {
        markEarly(tier);
      },
      onProgress: (detail) => reportProgress(Object.assign({ tier: tier }, detail)),
    });
    if (packed.bytesHeld !== 0) throw new Error('buffer monolitik tidak boleh dibuat');
    const sealed = await openSyncWeight('raget-neural-1.5b.safetensors');
    if (!safetensorsHeaderOk(sealed)) {
      if (sealed && typeof sealed.close === 'function') {
        try { sealed.close(); } catch (e) { /* gagang buruk */ }
      }
      throw new Error('header safetensors rusak');
    }
    weightReader = sealed;
    markEarly(tier);
    sealInstalled(packed.parts);
    remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: null });
    reportProgress({ tier: tier, loaded: size, total: size, seal: '', speed: 0, eta: 0, parts: packed.parts, source: 'cache', early: false });
    return true;
  } catch (e) {
    lastWeightError = e && e.message ? String(e.message) : 'gagal';
    const badHeader = lastWeightError.indexOf('header safetensors') >= 0;
    if (badHeader || !earlyFlag) {
      session = null;
      if (badHeader || loadedTier === tier) {
        loadedTier = null;
        weightReader = null;
        earlyFlag = false;
      }
      if (badHeader) clearInstalled();
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: lastWeightError, reply: null });
      failEarly();
      return false;
    }
    return true;
  }
}

function markEarly(tier) {
  earlyFlag = true;
  loadedTier = tier;
  const list = earlyWaiters.splice(0);
  list.forEach((fn) => fn(true));
}

function failEarly() {
  const list = earlyWaiters.splice(0);
  list.forEach((fn) => fn(false));
}

function untilEarly() {
  if (earlyFlag && weightReader) return Promise.resolve(true);
  return new Promise((resolve) => earlyWaiters.push(resolve));
}

function ensureTier(tier) {
  if (earlyFlag && weightReader && loadedTier === tier && !control.cancelled) return Promise.resolve(true);
  if (!initPromises[tier]) {
    initPromises[tier] = doInitTier(tier).finally(() => {
      initPromises[tier] = null;
    });
  }
  const pending = initPromises[tier];
  return Promise.race([untilEarly(), pending]);
}

function prefetchBest() {
  return Promise.resolve(false);
}

function ready() {
  return loadedTier !== null;
}

function textFrom(out, options) {
  if (options && options.signal && options.signal.aborted) return null;
  const text = out && out.text ? String(out.text).trim() : '';
  if (text && !/^\d+$/.test(text)) return text;
  if (out && Array.isArray(out.tokenIds) && out.tokenIds.length === 0) {
    return 'Raget 1.0 berhenti pada token henti tanpa teks.';
  }
  if (text && /^\d+$/.test(text)) return 'Raget 1.0 menghasilkan angka token, bukan kalimat.';
  return null;
}

function runOnWorker(prompt, genOpts, signal) {
  const id = workerJob + 1;
  workerJob = id;
  const live = ensureWorker();
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(cap);
      live.removeEventListener('message', onMsg);
      live.removeEventListener('error', onErr);
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve(value);
    };
    const cap = setTimeout(() => {
      haltInference();
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'nalar timeout', reply: null });
      finish(null);
    }, INFERENCE_MS);
    const onAbort = () => {
      haltInference();
      if (!lastEnvelope.error) remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'dibatalkan', reply: null });
      finish(null);
    };
    const onErr = () => {
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'worker gagal', reply: null });
      finish(null);
    };
    const onMsg = (ev) => {
      const data = ev.data || {};
      if (data.id !== id) return;
      if (data.type === 'token' && data.piece && genOpts.onToken) genOpts.onToken(data.piece);
      if (data.type === 'done') finish(data);
      if (data.type === 'error') {
        remember({ ok: false, status: MODEL_STATUS.FAILED, error: data.message || 'gagal', reply: null });
        finish(null);
      }
    };
    if (signal) {
      if (signal.aborted) {
        onAbort();
        return;
      }
      signal.addEventListener('abort', onAbort, { once: true });
    }
    live.addEventListener('message', onMsg);
    live.addEventListener('error', onErr);
    live.postMessage({
      id: id,
      op: 'generate',
      prompt: prompt,
      maxNewTokens: genOpts.maxNewTokens,
      maxLayers: genOpts.maxLayers,
      draft: genOpts.draft === true,
      lora: genOpts.lora || null,
      temperature: genOpts.temperature,
      topK: genOpts.topK,
      topP: genOpts.topP,
      repetitionPenalty: genOpts.repetitionPenalty,
    });
  });
}

async function generateWithTier(tier, prompt, options) {
  if (globalThis.__RG_MODEL_FOLLOWER__ && globalThis.__RG_MODEL_BUS__ && typeof globalThis.__RG_MODEL_BUS__.ask === 'function') {
    const remote = await globalThis.__RG_MODEL_BUS__.ask(String(prompt || ''));
    if (remote) return remote;
  }
  const mode = options && options.mode === 'mendalam' ? 'mendalam' : 'cepat';
  if (installedFlag() && !(weightReader && loadedTier === tier && safetensorsHeaderOk(weightReader))) {
    await bootWeights();
  }
  if (!(earlyFlag && weightReader && loadedTier === tier)) {
    if (loadedTier !== tier && !initPromises[tier]) {
      remember({ ok: false, status: installedFlag() ? MODEL_STATUS.FAILED : modelStatus, error: lastWeightError || lastEnvelope.error || 'bobot belum siap', reply: null });
      return null;
    }
    const ok = await ensureTier(tier);
    if (!ok || !weightReader) {
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: lastWeightError || 'bobot belum siap', reply: null });
      return null;
    }
  }
  const progressive = !!(earlyFlag && weightReader && !installedFlag());
  const signal = options && options.signal;
  let lora = personaLora();
  if (lora) {
    try {
      const packed = await pullLora(lora.id);
      if (packed) lora = packed;
    } catch (e) { /* adapter di memori tetap dipakai */ }
  }
  const genOpts = {
    maxNewTokens: mode === 'mendalam' && !progressive ? hudBudget() : 32,
    maxLayers: mode === 'mendalam' && !progressive ? 0 : 4,
    draft: false,
    lora: lora,
    temperature: 0.7,
    topK: 40,
    topP: 0.9,
    repetitionPenalty: 1.12,
    signal: signal,
    onToken: (piece) => {
      if (typeof window === 'undefined' || typeof CustomEvent === 'undefined' || !piece) return;
      window.dispatchEvent(new CustomEvent('rategoan:neural-token', { detail: piece }));
    },
  };
  try {
    if (signal && signal.aborted) return null;
    if (typeof Worker === 'function' && typeof window !== 'undefined') {
      const out = await runOnWorker(String(prompt || ''), genOpts, signal);
      return textFrom(out, options);
    }
    if (!safetensorsHeaderOk(weightReader)) {
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'header safetensors rusak', reply: null });
      return null;
    }
    if (!session) session = await openInt4Stream(weightReader);
    const out = await session.generate(String(prompt || ''), genOpts);
    return textFrom(out, options);
  } catch (e) {
    remember({ ok: false, status: MODEL_STATUS.FAILED, error: e && e.message ? e.message : 'gagal', reply: null });
    return null;
  }
}

async function generateLocal(prompt, options) {
  const mode = options && options.mode === 'mendalam' ? 'mendalam' : 'cepat';
  return generateWithTier('tier_1_5b', prompt, Object.assign({}, options, { mode }));
}

async function generate(messages, prompt, options) {
  if (options && options.signal && options.signal.aborted) return null;
  if (options && options.large === true && llmMode.mode() === 'server') llmMode.setMode('lokal');
  if (installedFlag() && !(earlyFlag && weightReader && loadedTier)) await bootWeights();
  if ((earlyFlag && weightReader) || installedFlag()) {
    const reply = await generateLocal(prompt, options);
    if (reply == null) {
      remember({
        ok: false,
        status: modelStatus === MODEL_STATUS.READY ? MODEL_STATUS.FAILED : modelStatus,
        error: lastEnvelope.error || lastWeightError || 'nalar kosong',
        reply: null,
      });
    } else {
      remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: reply });
    }
    return reply;
  }
  loadWeights().catch(() => {});
  remember({ ok: false, status: MODEL_STATUS.DOWNLOADING, error: 'bobot belum terunduh', reply: null });
  reportProgress({
    loaded: 0,
    total: WEIGHT_BYTES.tier_1_5b || 0,
    early: false,
    pending: true,
    tier: 'tier_1_5b',
  });
  return null;
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

function cepatReady() {
  return earlyFlag;
}

function loadWeights() {
  control.cancelled = false;
  control.paused = false;
  return ensureTier('tier_1_5b');
}

export const neuralProvider = Object.freeze({
  prefetchBest,
  ready,
  generate,
  getStats,
  shapeTiers,
  loadWeights,
  pauseWeights,
  resumeWeights,
  cancelWeights,
  haltInference,
  weightPaused,
  weightError,
  storageFree,
  bootWeights,
  cepatReady,
  weightsInstalled: installedFlag,
  lastEnvelope: currentEnvelope,
  modelStatus: currentStatus,
});
