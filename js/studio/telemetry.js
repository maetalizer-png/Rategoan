import { thermalGovernor } from '../../raget/raget-neural/runtime/thermal-governor.js';

const buckets = new Map();
const audits = [];

export function recordTelemetry(projectId, sample) {
  const id = String(projectId || 'local');
  const row = buckets.get(id) || { renders: 0, failures: 0, latencyMs: 0, alerts: 0 };
  row.renders += 1;
  const ms = Number(sample && sample.ms) || 0;
  row.latencyMs = ms;
  if (sample && sample.ok === false) row.failures += 1;
  if (ms > 20 && sample && sample.kind === 'parse') row.alerts += 1;
  buckets.set(id, row);
  return publicMetrics(id);
}

export function publicMetrics(projectId) {
  const row = buckets.get(String(projectId || 'local')) || { renders: 0, failures: 0, latencyMs: 0, alerts: 0 };
  return {
    renders: row.renders,
    failures: row.failures,
    latencyMs: row.latencyMs,
    alerts: row.alerts,
  };
}

export function auditEvent(kind) {
  const row = { t: Date.now(), kind: String(kind || 'event'), pii: false };
  audits.push(row);
  if (audits.length > 200) audits.shift();
  return row;
}

export function auditTail() {
  return audits.slice();
}

const perf = { prefillTps: 0, decodeTps: 0, vram: 0, throttle: false, maxNewTokens: 96 };

export function notePrefill(tokens, ms) {
  const n = Number(tokens) || 0;
  const t = Math.max(1, Number(ms) || 1);
  perf.prefillTps = Math.round((n * 1000) / t);
  return Object.assign({}, perf);
}

export function noteDecode(tokens, ms) {
  const n = Number(tokens) || 0;
  const t = Math.max(1, Number(ms) || 1);
  perf.decodeTps = Math.round((n * 1000) / t);
  return Object.assign({}, perf);
}

export function noteVram(bytes) {
  perf.vram = Math.max(0, Number(bytes) || 0);
  return Object.assign({}, perf);
}

export function sampleHud(sample) {
  const gov = thermalGovernor(sample || {});
  perf.throttle = gov.throttle;
  perf.maxNewTokens = gov.throttle ? 32 : 96;
  return {
    prefillTps: perf.prefillTps,
    decodeTps: perf.decodeTps,
    vram: perf.vram,
    throttle: perf.throttle,
    maxNewTokens: perf.maxNewTokens,
  };
}

export function hudBudget(sample) {
  return sampleHud(sample).maxNewTokens;
}

export function paintStudioHud(root, sample) {
  const row = sampleHud(sample);
  const scope = root && root.querySelector ? root : (typeof document !== 'undefined' ? document : null);
  if (!scope || typeof scope.querySelector !== 'function') return row;
  const tab = scope.querySelector('#tab-logs');
  if (tab && !tab.classList.contains('active')) return row;
  const box = scope.querySelector('#studio-hud');
  const host = box || (typeof document !== 'undefined' ? document.getElementById('studio-hud') : null);
  if (!host) return row;
  const tps = host.querySelector('#hud-tps');
  const vram = host.querySelector('#hud-vram');
  const heat = host.querySelector('#hud-thermal');
  if (tps) tps.textContent = 'Prefill ' + row.prefillTps + ' · Decode ' + row.decodeTps + ' tok/d';
  if (vram) vram.textContent = 'VRAM ' + Math.round(row.vram / (1024 * 1024)) + ' MB';
  if (heat) heat.textContent = row.throttle ? 'Throttle · token dipangkas' : 'Suhu normal';
  return row;
}
