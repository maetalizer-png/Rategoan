import { respondCore } from './core/agent-loop.js';
import { createRespond } from './core/agent-stream.js';

const respond = createRespond(respondCore);

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') {
  window.RG = window.RG || {};
  window.RG.agent = agent;
}
