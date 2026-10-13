// Adapter 2/2 — Raget 1.0. Status mengikuti neural-provider, bukan ready palsu.
import { neuralProvider } from './neural-provider.js';
import { enginePreference } from '../../js/state/engine-preference.js';

const INFERENCE_MS = 30000;

async function init() {
  if (typeof neuralProvider.prefetchBest === 'function') {
    neuralProvider.prefetchBest();
  }
  return neuralProvider.ready();
}

function status() {
  const loaded = neuralProvider.ready();
  let chosen = false;
  try {
    if (typeof localStorage !== 'undefined') {
      const pref = enginePreference.get();
      chosen = pref === 'neural' || pref === 'cloud';
    }
  } catch (e) {
    chosen = false;
  }
  return {
    ready: loaded || chosen,
    reason: loaded ? 'Raget 1.0 siap' : (chosen ? 'Raget 1.0 dimuat saat dipakai' : 'Raget 1.0 belum dipilih'),
  };
}

function uiMode() {
  if (typeof localStorage === 'undefined') return '';
  try {
    return enginePreference.get() === 'neural' ? 'mendalam' : 'cepat';
  } catch (e) {
    return '';
  }
}

async function ask(prompt, context) {
  const ctrl = new AbortController();
  const external = context && context.signal;
  if (external) {
    if (external.aborted) ctrl.abort();
    else external.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  const mode = uiMode();
  const timer = setTimeout(() => ctrl.abort(), INFERENCE_MS);
  try {
    const opts = {
      signal: ctrl.signal,
      large: !!(context && context.large),
    };
    if (mode) opts.mode = mode;
    const reply = await neuralProvider.generate([], String(prompt || ''), opts);
    if (external && external.aborted) throw new Error('dibatalkan');
    if (ctrl.signal.aborted) return null;
    if (reply && !/^\d+$/.test(String(reply).trim())) return reply;
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget 1.0 Cerdas',
  init,
  ask,
  status,
});
