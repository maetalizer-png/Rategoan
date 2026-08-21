import { engine } from './engine.js';
import { agent } from '../../raget/raget-agents/agent.js';
import { llmModels } from '../../raget/raget-llm/llm-models.js';
import { neuralProvider } from '../../raget/raget-llm/neural-provider.js';

// Routing model (vNext Fase C): kalau model aktif kelasnya 'local-neural',
// coba Raget Neural dulu - GAGAL/belum siap (checkpoint belum termuat, error
// inferensi) jatuh otomatis ke rule engine (agent.respond), bukan diam/error
// ke pengguna. Rule engine tetap default untuk model manapun selain neural -
// jalur ini nol overhead tambahan untuk pengalaman normal.
async function generate(messages, prompt) {
  await engine.ensureReady();
  const active = llmModels.find(llmModels.active);
  if (active && active.engineClass === 'local-neural') {
    const neuralReply = await neuralProvider.generate(messages, prompt);
    if (neuralReply) return neuralReply;
  }
  return agent.respond(messages, prompt);
}

function setStatus(text) {
  engine.setStatus(text);
}

export const ai = Object.freeze({
  generate,
  setStatus,
  get ready() {
    return engine.ready;
  },
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.ai = ai;
}
