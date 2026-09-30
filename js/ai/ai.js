import { engine } from './engine.js';
import { engineRouter } from '../../raget/raget-agents/engine-router.js';
import { memory } from './memory.js';
import { memoryPreference } from '../state/memory-preference.js';

const NEURAL_ANSWERS_ENABLED = true;

async function generate(messages, prompt) {
  await engine.ensureReady();
  const useMem = memoryPreference.get();
  const result = await engineRouter.ask(prompt, {
    messages,
    neuralAnswersEnabledFlag: NEURAL_ANSWERS_ENABLED,
    memoryOn: useMem,
    facts: useMem ? memory.recallFacts() : {},
    recent: useMem ? memory.recentContext(messages, 6) : [],
  });
  return result.reply;
}

function setStatus(text) {
  engine.setStatus(text);
}

export const ai = Object.freeze({
  generate,
  setStatus,
  memory,
  get ready() {
    return engine.ready;
  },
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.ai = ai;
}
