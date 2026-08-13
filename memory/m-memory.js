// Static imports (in dependency order) replace the old runtime
// document.createElement('script') loader: the ES module graph itself now
// guarantees m-config.js -> m-utilities.js -> ... -> m-governance.js finish
// evaluating, in this order, before any code below runs.
import './m-config.js';
import './m-utilities.js';
import './m-metrics.js';
import './m-engines.js';
import './m-quantization.js';
import './m-indexers.js';
import './m-embeddings.js';
import './m-federated-learning.js';
import './m-tuner.js';
import './m-core.js';
import './m-index.js';
import './m-governance.js';
import { Utils } from '../js/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const Logger = Utils.Logger;

Logger.info('MemoryEntry', 'All 12 memory modules loaded');

if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('memory-ready'));
}

if (typeof window._onMemoryReady === 'function') {
    window._onMemoryReady();
}