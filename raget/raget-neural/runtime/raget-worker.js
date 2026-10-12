import { openInt4Stream } from './int4-session.js';
import { createRangeReader, openCacheStore, WEIGHT_SPEC, openSyncWeight } from './weight-cache.js';

let sessionPromise = null;

function session() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const sync = await openSyncWeight('raget-neural-1.5b.safetensors');
      if (sync && sync.size > 8) return openInt4Stream(sync);
      const store = openCacheStore();
      const reader = createRangeReader(store, WEIGHT_SPEC.url, WEIGHT_SPEC.size, WEIGHT_SPEC.chunk, WEIGHT_SPEC.cache, 4);
      return openInt4Stream(reader);
    })();
  }
  return sessionPromise;
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.op !== 'generate') return;
  try {
    const live = await session();
    const out = await live.generate(String(msg.prompt || ''), {
      maxNewTokens: msg.maxNewTokens,
      maxLayers: msg.maxLayers,
      temperature: msg.temperature,
      topK: msg.topK,
      topP: msg.topP,
      repetitionPenalty: msg.repetitionPenalty,
      onToken(piece) {
        self.postMessage({ id: msg.id, type: 'token', piece: piece });
      },
    });
    self.postMessage({
      id: msg.id,
      type: 'done',
      text: out.text,
      tokenIds: out.tokenIds,
      device: out.device,
      trained: out.trained,
    });
  } catch (e) {
    sessionPromise = null;
    self.postMessage({ id: msg.id, type: 'error', message: e && e.message ? e.message : 'gagal' });
  }
};
