// Adapter deterministik. Membungkus mesin lokal yang sudah ada.
// Bukan jalur chat: engine-router hanya mengantri adapter neural.
import { agent } from '../raget-agents/agent.js';

async function init() {
  return true;
}

async function ask(prompt, context) {
  const messages = (context && context.messages) || [];
  return agent.respond(messages, prompt);
}

function status() {
  return {
    ready: true,
    reason: 'Mesin deterministik lokal. Bukan jalur chat.',
  };
}

export const deterministicAdapter = Object.freeze({
  id: 'template',
  label: 'Raget 1.0 Kilat',
  init,
  ask,
  status,
});