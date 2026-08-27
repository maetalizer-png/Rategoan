import { engine } from './engine.js';
import { agent } from '../../raget/raget-agents/agent.js';
import { llmModels } from '../../raget/raget-llm/llm-models.js';
import { neuralProvider } from '../../raget/raget-llm/neural-provider.js';

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
