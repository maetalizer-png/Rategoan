import { personaLora, pullLora } from '../../js/chat/persona.js';
import { llmMode } from '../../js/state/llm-mode.js';
import { hudBudget } from '../../js/studio/telemetry.js';
import { bindTier, TIER_SHAPES } from './llm-config.js';
import { maskedBytes } from './runtime/model-downloader.js';
import {
  WEIGHT_ROOM,
  WEIGHT_SPEC,
  EARLY_PROGRESS_BYTES,
  downloadConcurrentChunks,
  inspectWeightFile,
  storageFree,
  safetensorsHeaderOk,
} from './runtime/weight-cache.js';
import { safetensorsPayloadOk } from './runtime/safetensors-validator.js';

export const MODEL_STATUS = Object.freeze({
  NOT_DOWNLOADED: 'NOT_DOWNLOADED',
  DOWNLOADING: 'DOWNLOADING',
  READY: 'READY',
  FAILED: 'FAILED',
});
export const PIPELINE_PHASE = Object.freeze({
  TRANSFERRING: 'TRANSFERRING',
  WRITING_OPFS: 'WRITING_OPFS',
  VERIFYING_PAYLOAD: 'VERIFYING_PAYLOAD',
  INFERENCE_READY: 'INFERENCE_READY',
});

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
let initPromises = {};
let progressLoaded = 0;
let progressTotal = 0;

async function loadEngine() {
  if (cache) return cache;
  const { RATEGOAN } = await import('./llm-core.js');
  cache = { RATEGOAN };
  return cache;
}

function reportProgress(detail) {
  if (detail && typeof detail.loaded === 'number' && detail.loaded >= 0) progressLoaded = detail.loaded;
  if (detail && typeof detail.total === 'number' && detail.total > 0) progressTotal = detail.total;
  if (typeof window === 'undefined' || typeof CustomEvent === 'undefined') return;
  window.dispatchEvent(new CustomEvent('rategoan:neural-progress', { detail: detail }));
}

function queueLine() {
  const pct = progressTotal > 0 ? Math.max(0, Math.min(100, Math.round((progressLoaded / progressTotal) * 100))) : 0;
  return 'Bobot sedang diunduh (' + pct + '%). Obrolan akan otomatis aktif setelah unduhan selesai 100%.';
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
const ACTIVE_DL_KEY = 'rategoan_weights_downloading';
let modelStatus = MODEL_STATUS.NOT_DOWNLOADED;
let lastEnvelope = { ok: false, status: MODEL_STATUS.NOT_DOWNLOADED, error: '', reply: null, request_id: '', message_id: '' };
let pendingPrompts = [];
let promptSerial = 0;
let smokePassed = false;
let pipelinePhase = '';
const readyWaiters = [];
const activeWorkerJobs = new Set();

function remember(patch) {
  if (patch && patch.status) modelStatus = patch.status;
  const prev = lastEnvelope || {};
  lastEnvelope = {
    ok: !!(patch && patch.ok === true),
    status: modelStatus,
    error: patch && patch.error ? String(patch.error) : '',
    reply: patch && patch.reply != null ? String(patch.reply) : null,
    request_id: patch && patch.request_id ? String(patch.request_id) : (prev.request_id || ''),
    message_id: patch && patch.message_id ? String(patch.message_id) : (prev.message_id || ''),
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
  try { if (typeof localStorage !== 'undefined') localStorage.removeItem(ACTIVE_DL_KEY); } catch (e) { void e; }
  if (typeof control.abortNetwork === 'function') control.abortNetwork();
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
    localStorage.setItem(PARTS_KEY, String(parts || 250));
    localStorage.removeItem(ACTIVE_DL_KEY);
  } catch (e) { void e; }
}

function payloadTrusted(file) {
  return safetensorsHeaderOk(file) && safetensorsPayloadOk(file);
}

async function probeWeightBytes() {
  const nav = globalThis.navigator;
  if (!nav || !nav.storage || typeof nav.storage.getDirectory !== 'function') return null;
  try {
    const root = await nav.storage.getDirectory();
    const handle = await root.getFileHandle('raget-neural-1.5b.safetensors');
    const file = await handle.getFile();
    return Math.max(0, Number(file.size) || 0);
  } catch (e) {
    return null;
  }
}

async function quarantineCorrupt() {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(INSTALL_KEY);
      localStorage.removeItem(PARTS_KEY);
      localStorage.removeItem('rategoan_chunks_mask:' + WEIGHT_SPEC.revision);
      localStorage.removeItem('rategoan_chunks_hashes:' + WEIGHT_SPEC.revision);
      for (let i = localStorage.length - 1; i >= 0; i -= 1) {
        const k = localStorage.key(i);
        if (k && k.indexOf('rategoan_chunks_hashes:') === 0) localStorage.removeItem(k);
      }
    }
  } catch (e) { void e; }
  try {
    const nav = globalThis.navigator;
    if (nav && nav.storage && typeof nav.storage.getDirectory === 'function') {
      const root = await nav.storage.getDirectory();
      if (root && typeof root.removeEntry === 'function') await root.removeEntry('raget-neural-1.5b.safetensors');
    }
  } catch (e) { void e; }
  weightReader = null;
  loadedTier = null;
  earlyFlag = false;
  pipelinePhase = '';
  remember({ ok: false, status: MODEL_STATUS.NOT_DOWNLOADED, error: 'berkas bobot rusak, unduh ulang', reply: null });
}

function releaseReady() {
  const list = readyWaiters.splice(0);
  list.forEach((fn) => fn());
}

function untilReady(ms) {
  if (pipelinePhase === PIPELINE_PHASE.INFERENCE_READY && installedFlag()) return Promise.resolve(true);
  return new Promise((resolve) => {
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };
    const onReady = () => finish(pipelinePhase === PIPELINE_PHASE.INFERENCE_READY && installedFlag());
    const timer = setTimeout(() => {
      const at = readyWaiters.indexOf(onReady);
      if (at >= 0) readyWaiters.splice(at, 1);
      finish(false);
    }, ms);
    readyWaiters.push(onReady);
  });
}

async function smokeToken() {
  if (smokePassed) return true;
  if (typeof Worker !== 'function') {
    const ok = !!(weightReader && payloadTrusted(weightReader));
    if (ok) smokePassed = true;
    return ok;
  }
  try {
    const out = await runOnWorker('ok', {
      op: 'verify_session',
      maxNewTokens: 1,
      maxLayers: 0,
      timeoutMs: 5000,
      draft: false,
      lora: null,
      temperature: 0,
      topK: 1,
      topP: 1,
      repetitionPenalty: 1,
    }, null);
    const ok = !!(out && ((out.text && String(out.text).length) || (Array.isArray(out.tokenIds) && out.tokenIds.length)));
    if (ok) smokePassed = true;
    return ok;
  } catch (e) {
    return false;
  }
}

async function clearPendingTimers(item) {
  if (!item) return;
  if (item.timer) { clearTimeout(item.timer); item.timer = 0; }
}

async function flushPending() {
  while (pendingPrompts.length) {
    const job = pendingPrompts.shift();
    clearPendingTimers(job);
    const reply = await generateLocal(job.prompt, job.options || {});
    if (!reply || typeof window === 'undefined' || typeof CustomEvent === 'undefined') continue;
    window.dispatchEvent(new CustomEvent('rategoan:pending-reply', {
      detail: {
        prompt: job.prompt,
        reply: reply,
        request_id: job.request_id,
        message_id: job.message_id,
      },
    }));
  }
}

function queuePrompt(prompt, options) {
  const text = String(prompt || '');
  const last = pendingPrompts[pendingPrompts.length - 1];
  if (last && last.prompt === text && (Date.now() - (last.queuedAt || 0)) < 2000) {
    remember({
      ok: false,
      status: MODEL_STATUS.DOWNLOADING,
      error: queueLine(),
      reply: null,
      request_id: last.request_id,
      message_id: last.message_id,
    });
    return last;
  }
  promptSerial += 1;
  const job = {
    request_id: (options && options.request_id) || ('rq-' + promptSerial),
    message_id: (options && options.message_id) || ('msg-' + promptSerial),
    prompt: text,
    options: options || null,
    queuedAt: Date.now(),
  };
  pendingPrompts.push(job);
  remember({
    ok: false,
    status: MODEL_STATUS.DOWNLOADING,
    error: queueLine(),
    reply: null,
    request_id: job.request_id,
    message_id: job.message_id,
  });
  return job;
}

async function markInferenceReady() {
  const smoked = await smokeToken();
  if (!smoked) {
    remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'smoke inferensi gagal', reply: null });
    return false;
  }
  pipelinePhase = PIPELINE_PHASE.INFERENCE_READY;
  remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: null });
  const waiting = readyWaiters.length;
  releaseReady();
  if (!waiting) await flushPending();
  return true;
}

async function bootWeights() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    if (loadedTier && weightReader && payloadTrusted(weightReader)) {
      return markInferenceReady();
    }
    if (!installedFlag()) {
      if (modelStatus !== MODEL_STATUS.DOWNLOADING) {
        remember({ ok: false, status: MODEL_STATUS.NOT_DOWNLOADED, error: '', reply: null });
      }
      return false;
    }
    const file = await inspectWeightFile('raget-neural-1.5b.safetensors');
    if (!file) {
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'header safetensors rusak', reply: null });
      return false;
    }
    if (!payloadTrusted(file)) {
      await quarantineCorrupt();
      return false;
    }
    weightReader = file;
    loadedTier = 'tier_1_5b';
    earlyFlag = false;
    return markInferenceReady();
  })();
  try {
    return await bootPromise;
  } finally {
    bootPromise = null;
  }
}

function haltInference() {
  const jobs = Array.from(activeWorkerJobs);
  activeWorkerJobs.clear();
  jobs.forEach((fn) => {
    try { fn(null); } catch (e) { void e; }
  });
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
    pipelinePhase = PIPELINE_PHASE.TRANSFERRING;
    remember({ ok: false, status: MODEL_STATUS.DOWNLOADING, error: '', reply: null });
    const url = CHECKPOINT_BY_TIER[tier];
    let size = WEIGHT_BYTES[tier] || 0;
    if (!size) {
      const head = await fetch(url, { method: 'HEAD' });
      size = Number(head.headers.get('content-length') || head.headers.get('x-linked-size')) || 0;
    }
    if (!size) throw new Error('ukuran checkpoint tidak diketahui');
    const chunk = WEIGHT_SPEC.chunk;
    const packed = await downloadConcurrentChunks({
      url: url,
      size: size,
      chunk: chunk,
      revision: WEIGHT_SPEC.revision,
      cacheName: WEIGHT_SPEC.cache,
      control: control,
      concurrency: 6,
      chunkHashes: Array.isArray(WEIGHT_SPEC.chunkHashes) ? WEIGHT_SPEC.chunkHashes : [],
      mesh: typeof window !== 'undefined',
      roomNeed: tier === 'tier_1_5b' ? WEIGHT_ROOM : 0,
      earlyBytes: tier === 'tier_1_5b' ? EARLY_PROGRESS_BYTES : 0,
      onEarlyReady: () => {
        markEarly(tier);
      },
      onProgress: (detail) => {
        if (detail && detail.phase && pipelinePhase !== PIPELINE_PHASE.VERIFYING_PAYLOAD && pipelinePhase !== PIPELINE_PHASE.INFERENCE_READY) {
          pipelinePhase = detail.phase;
        }
        reportProgress(Object.assign({ tier: tier }, detail));
      },
    });
    if (packed.bytesHeld !== 0) throw new Error('buffer monolitik tidak boleh dibuat');
    pipelinePhase = PIPELINE_PHASE.VERIFYING_PAYLOAD;
    progressLoaded = size;
    progressTotal = size;
    const sealed = await inspectWeightFile('raget-neural-1.5b.safetensors');
    if (!sealed) throw new Error('berkas bobot belum terbaca');
    if (!payloadTrusted(sealed)) {
      await quarantineCorrupt();
      throw new Error('header safetensors rusak');
    }
    weightReader = sealed;
    markEarly(tier);
    const smoked = await markInferenceReady();
    if (!smoked) return false;
    sealInstalled(packed.parts);
    reportProgress({ tier: tier, loaded: size, total: size, seal: '', speed: 0, eta: 0, parts: packed.parts, source: 'cache', early: false });
    return true;
  } catch (e) {
    lastWeightError = e && e.message ? String(e.message) : 'gagal';
    const badHeader = lastWeightError.indexOf('header safetensors') >= 0;
    if (badHeader) {
      pipelinePhase = '';
      failEarly();
      return false;
    }
    if (loadedTier === tier) {
      loadedTier = null;
      weightReader = null;
    }
    earlyFlag = false;
    pipelinePhase = '';
    remember({ ok: false, status: MODEL_STATUS.FAILED, error: lastWeightError, reply: null });
    failEarly();
    return false;
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
  if (installedFlag() && weightReader && loadedTier === tier && !control.cancelled) return Promise.resolve(true);
  if (!initPromises[tier]) {
    initPromises[tier] = doInitTier(tier).finally(() => {
      initPromises[tier] = null;
    });
  }
  return initPromises[tier];
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
    let timer = 0;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      if (timer) clearTimeout(timer);
      activeWorkerJobs.delete(finish);
      live.removeEventListener('message', onMsg);
      live.removeEventListener('error', onErr);
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve(value);
    };
    activeWorkerJobs.add(finish);
    if (genOpts && Number(genOpts.timeoutMs) > 0) {
      timer = setTimeout(() => finish(null), Number(genOpts.timeoutMs));
    }
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
      if (data.type === 'step') {
        if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
          window.dispatchEvent(new CustomEvent('rategoan:neural-step', { detail: data }));
        }
      }
      if (data.type === 'token') {
        if (data.piece && genOpts.onToken) genOpts.onToken(data.piece);
      }
      if (data.type === 'done' || data.type === 'verified') finish(data);
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
      op: genOpts && genOpts.op === 'verify_session' ? 'verify_session' : 'generate',
      prompt: prompt,
      maxNewTokens: genOpts.maxNewTokens,
      maxLayers: genOpts.maxLayers,
      draft: genOpts.draft === true,
      lora: genOpts.lora || null,
      temperature: genOpts.temperature,
      topK: genOpts.topK,
      topP: genOpts.topP,
      repetitionPenalty: genOpts.repetitionPenalty,
      timeoutMs: genOpts && genOpts.timeoutMs,
    });
  });
}

async function generateWithTier(tier, prompt, options) {
  if (globalThis.__RG_MODEL_FOLLOWER__ && globalThis.__RG_MODEL_BUS__ && typeof globalThis.__RG_MODEL_BUS__.ask === 'function') {
    const remote = await globalThis.__RG_MODEL_BUS__.ask(String(prompt || ''));
    if (remote) return remote;
  }
  const mode = options && (options.mode === 'tinggi' || options.mode === 'mendalam') ? 'mendalam' : 'cepat';
  if (installedFlag() && modelStatus !== MODEL_STATUS.READY) await bootWeights();
  if (!installedFlag() || modelStatus !== MODEL_STATUS.READY) {
    remember({
      ok: false,
      status: installedFlag() ? MODEL_STATUS.FAILED : MODEL_STATUS.DOWNLOADING,
      error: installedFlag() ? (lastEnvelope.error || 'header safetensors rusak') : queueLine(),
      reply: null,
    });
    return null;
  }
  const signal = options && options.signal;
  let lora = personaLora();
  if (lora) {
    try {
      const packed = await pullLora(lora.id);
      if (packed) lora = packed;
    } catch (e) { void e; }
  }
  const genOpts = {
    maxNewTokens: mode === 'mendalam' ? hudBudget() : 32,
    maxLayers: 0,
    draft: false,
    lora: lora,
    temperature: mode === 'mendalam' ? 0.7 : 0,
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
    if (typeof Worker !== 'function') {
      remember({ ok: false, status: MODEL_STATUS.FAILED, error: 'worker inferensi tidak tersedia', reply: null });
      return null;
    }
    const out = await runOnWorker(String(prompt || ''), genOpts, signal);
    if (signal && signal.aborted) return null;
    return textFrom(out, options);
  } catch (e) {
    remember({ ok: false, status: MODEL_STATUS.FAILED, error: e && e.message ? e.message : 'gagal', reply: null });
    return null;
  }
}

function composeNeuralInput(prompt, options) {
  const base = String(prompt || '');
  const opts = options || {};
  const prefix = opts.modelPrefix ? String(opts.modelPrefix) : '';
  const facts = opts.facts && typeof opts.facts === 'object' && !Array.isArray(opts.facts) ? opts.facts : null;
  const recent = Array.isArray(opts.recent) ? opts.recent : [];
  const messages = Array.isArray(opts.messages) ? opts.messages : [];
  if (!prefix && !facts && !recent.length && !messages.length) return base;
  const parts = [];
  if (prefix) parts.push(prefix);
  if (facts) {
    const lines = [];
    Object.keys(facts).forEach((key) => {
      const value = facts[key];
      if (value == null || value === '') return;
      lines.push(key + ': ' + String(value));
    });
    if (lines.length) parts.push(lines.join('\n'));
  }
  const fold = (rows) => rows.map((row) => {
    if (!row) return '';
    if (typeof row === 'string') return row;
    const role = row.role ? String(row.role) : 'user';
    const text = row.text != null ? String(row.text) : '';
    return text ? (role + ': ' + text) : '';
  }).filter(Boolean);
  const history = fold(recent.length ? recent : messages.slice(-6));
  if (history.length) parts.push(history.join('\n'));
  parts.push(base);
  return parts.join('\n\n');
}

async function generateLocal(prompt, options) {
  const mode = options && (options.mode === 'tinggi' || options.mode === 'mendalam') ? 'mendalam' : 'cepat';
  const fullPrompt = composeNeuralInput(prompt, options);
  return generateWithTier('tier_1_5b', fullPrompt, Object.assign({}, options, { mode }));
}

async function generate(messages, prompt, options) {
  const bundled = Object.assign({}, options || {}, {
    messages: Array.isArray(messages) ? messages : [],
  });
  if (bundled.signal && bundled.signal.aborted) return null;
  if (bundled.large === true && llmMode.mode() === 'server') llmMode.setMode('lokal');
  if (installedFlag()) {
    await bootWeights();
    const reply = await generateLocal(prompt, bundled);
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
  const text = String(prompt || '');
  const job = queuePrompt(text, bundled);
  const atFull = pipelinePhase === PIPELINE_PHASE.VERIFYING_PAYLOAD
    || (progressTotal > 0 && progressLoaded >= progressTotal && !!initPromises.tier_1_5b);
  if (atFull) {
    const ready = await untilReady(3000);
    if (ready && installedFlag()) {
      const queue = pendingPrompts.splice(0, pendingPrompts.length);
      let mine = null;
      for (let i = 0; i < queue.length; i += 1) {
        const row = queue[i];
        const reply = await generateLocal(row.prompt, row.options || {});
        if (row.request_id === job.request_id) {
          mine = reply;
          continue;
        }
        if (!reply || typeof window === 'undefined' || typeof CustomEvent === 'undefined') continue;
        window.dispatchEvent(new CustomEvent('rategoan:pending-reply', {
          detail: { prompt: row.prompt, reply: reply, request_id: row.request_id, message_id: row.message_id },
        }));
      }
      if (mine == null) {
        remember({
          ok: false,
          status: modelStatus === MODEL_STATUS.READY ? MODEL_STATUS.FAILED : modelStatus,
          error: lastEnvelope.error || lastWeightError || 'nalar kosong',
          reply: null,
        });
      } else {
        remember({ ok: true, status: MODEL_STATUS.READY, error: '', reply: mine });
      }
      return mine;
    }
    remember({ ok: false, status: MODEL_STATUS.DOWNLOADING, error: '', reply: null });
    return null;
  }
  loadWeights().catch(() => {});
  remember({ ok: false, status: MODEL_STATUS.DOWNLOADING, error: queueLine(), reply: null });
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

async function resumeProgress() {
  const total = WEIGHT_BYTES.tier_1_5b || WEIGHT_SPEC.size || 0;
  let loaded = maskedBytes(total, WEIGHT_SPEC.chunk, WEIGHT_SPEC.revision);
  const physical = await probeWeightBytes();
  let wasActive = false;
  try { wasActive = typeof localStorage !== 'undefined' && localStorage.getItem(ACTIVE_DL_KEY) === '1'; } catch (e) { wasActive = false; }
  if (physical == null && !wasActive) return 0;
  if (physical != null && physical < total) loaded = Math.min(loaded, physical);
  if (loaded <= 0 && !wasActive) return 0;
  const isPending = loaded < total && !installedFlag();
  reportProgress({
    loaded: Math.max(0, loaded),
    total: total,
    tier: 'tier_1_5b',
    early: false,
    source: 'opfs',
    pending: isPending,
  });
  if (isPending && !control.paused && !control.cancelled) {
    loadWeights().catch(() => {});
  }
  return Math.max(0, loaded);
}

function loadWeights() {
  control.cancelled = false;
  control.paused = false;
  try { if (typeof localStorage !== 'undefined' && !installedFlag()) localStorage.setItem(ACTIVE_DL_KEY, '1'); } catch (e) { void e; }
  return ensureTier('tier_1_5b');
}

export const neuralProvider = Object.freeze({
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
  resumeProgress,
});
