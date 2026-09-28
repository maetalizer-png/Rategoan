// Adapter 2/2 - Neural. Bungkus neural-provider.js (cascade unduh+cache
// 200M -> 100M -> 50M) yang SUDAH ADA dan SUDAH dilatih nyata di GPU gratis
// Colab berkali-kali.
import { neuralProvider } from './neural-provider.js';

async function init() {
  return true;
}

async function ask(prompt, context) {
  const messages = (context && context.messages) || [];
  const reply = await neuralProvider.generate(messages, prompt);
  if (!reply) {
    throw new Error('Raget 1.0: checkpoint belum termuat.');
  }
  return reply;
}

function status() {
  return {
    ready: true,
    reason: 'Raget 1.0',
  };
}

export const neuralAdapter = Object.freeze({
  id: 'neural',
  label: 'Raget 1.0',
  init,
  ask,
  status,
});
