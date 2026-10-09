import { respondCore } from './core/agent-loop.js';
import { createRespond } from './core/agent-stream.js';
import { mountNamespace } from '../../js/core/namespace.js';

const respond = createRespond(respondCore);

export const agent = Object.freeze({
  respond,
});

if (typeof window !== 'undefined') mountNamespace('agent', agent);
