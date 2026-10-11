// Adapter 2/2 — Raget 1.0. Status mengikuti neural-provider, bukan ready palsu.
import { neuralProvider } from './neural-provider.js';
import { enginePreference } from '../../js/state/engine-preference.js';

const ASK_MS = 8000;

async function init() {
  if (typeof neuralProvider.prefetchBest === 'function') {
    neuralProvider.prefetchBest();
  }
  return neuralProvider.ready();
}

function status() {
  const loaded = neuralProvider.ready();
  const chosen = enginePreference.get() === 'neural';
  return {
    ready: loaded || chosen,
    reason: loaded ? 'Raget 1.0 siap' : (chosen ? 'Raget 1.0 dimuat saat dipakai' : 'Raget 1.0 belum dipilih'),
  };
}

async function ask(prompt, context) {
  const ctrl = new AbortController();
  const external = context && context.signal;
  if (external) {
    if (external.aborted) ctrl.abort();
    else external.addEventListener('abort', () => ctrl.abort(), { once: true });
  }
  const timer = setTimeout(() => ctrl.abort(), ASK_MS);
  try {
    const reply = await neuralProvider.generate([], String(prompt || ''), {
      signal: ctrl.signal,
      large: !!(context && context.large),
    });
    if (external && external.aborted) throw new Error('dibatalkan');
    if (ctrl.signal.aborted) throw new Error('Raget 1.0 timeout');
    if (reply && !/^\d+$/.test(String(reply).trim())) return reply;
    return 'Saya Raget. Tulis pertanyaan yang lebih spesifik, saya jawab dari pengetahuan di perangkat ini.';
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
