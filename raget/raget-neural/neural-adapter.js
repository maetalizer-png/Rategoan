// Adapter 2/2 — Raget 1.0. Status mengikuti neural-provider, bukan ready palsu.
import { neuralProvider } from './neural-provider.js';

const ASK_MS = 8000;

async function init() {
  if (typeof neuralProvider.prefetchBest === 'function') {
    neuralProvider.prefetchBest();
  }
  return neuralProvider.ready();
}

function status() {
  const ready = neuralProvider.ready();
  return {
    ready,
    reason: ready ? 'Raget 1.0 siap' : 'Raget 1.0 belum termuat',
  };
}

async function ask(prompt, context) {
  const messages = (context && context.messages) || [];
  const work = neuralProvider.generate(messages, prompt);
  const reply = await Promise.race([
    work,
    new Promise((_, rej) => setTimeout(() => rej(new Error('Raget 1.0 timeout')), ASK_MS)),
  ]);
  if (!reply) throw new Error('Raget 1.0: checkpoint belum termuat.');
  return reply;
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget 1.0 Cerdas',
  init,
  ask,
  status,
});
