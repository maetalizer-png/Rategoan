import { llmEngine } from '../../raget/raget-llm/llm-engine.js';
import { $ } from '../utils/dom.js';

function setStatus(text) {
  const el = $('model-status');
  if (!el) return;
  el.textContent = text || '';
  el.classList.toggle('active', !!text);
}

async function ensureReady() {
  if (llmEngine.ready) return true;
  setStatus('Memuat mesin…');
  const ok = await llmEngine.init();
  setStatus(ok ? 'RAGET' : 'Mesin gagal dimuat');
  return ok;
}

export const engine = Object.freeze({
  ensureReady,
  setStatus,
  get ready() {
    return llmEngine.ready;
  },
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.llm = engine;
}
