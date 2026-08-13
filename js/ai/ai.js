import { engine } from './engine.js';
import { agent } from '../../ai-agent/agent.js';

async function generate(messages, prompt) {
  await engine.ensureReady();
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
