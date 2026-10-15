// Adapter 2/2 — Raget 1.0. Abort hanya dari pengguna, bukan timer 30 detik.
import { neuralProvider } from './neural-provider.js';
import { enginePreference } from '../../js/state/engine-preference.js';

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
    return enginePreference.get() === 'neural' ? 'tinggi' : 'rendah';
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
  const messages = (context && Array.isArray(context.messages)) ? context.messages : [];
  try {
    const opts = {
      signal: ctrl.signal,
      large: !!(context && context.large) || mode === 'tinggi',
      modelPrefix: (context && context.modelPrefix) ? String(context.modelPrefix) : '',
      recent: (context && Array.isArray(context.recent)) ? context.recent : [],
      facts: (context && context.facts && typeof context.facts === 'object') ? context.facts : null,
    };
    if (mode) opts.mode = mode;
    const reply = await neuralProvider.generate(messages, String(prompt || ''), opts);
    if (external && external.aborted) throw new Error('dibatalkan');
    if (ctrl.signal.aborted) return null;
    if (reply && !/^\d+$/.test(String(reply).trim())) return reply;
    return null;
  } catch (e) {
    if (external && external.aborted) throw new Error('dibatalkan');
    return null;
  }
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget 1.0 Cerdas',
  init,
  ask,
  status,
});
