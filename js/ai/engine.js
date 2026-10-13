import { neuralProvider } from '../../raget/raget-neural/neural-provider.js';
import { $ } from '../../shared/dom.js';
import { mountNamespace } from '../core/namespace.js';

function setStatus(text) {
  const el = $('model-status');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('active', !!text);
}

async function ensureReady() {
  try {
    if (neuralProvider.ready()) {
      setStatus('RAGET');
      return true;
    }
    const booted = await neuralProvider.bootWeights();
    setStatus(booted ? 'RAGET' : '');
    return true;
  } catch (e) {
    setStatus('');
    return true;
  }
}

export const engine = Object.freeze({
  ensureReady,
  setStatus,
  get ready() {
    return neuralProvider.ready();
  },
});

if (typeof window !== 'undefined') mountNamespace('llm', engine);
