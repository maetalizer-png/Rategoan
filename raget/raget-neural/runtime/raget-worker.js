import { openInt4Stream } from './int4-session.js';
import { openSyncWeight } from './weight-cache.js';

let sessionPromise = null;

function session() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const sync = await openSyncWeight('raget-neural-1.5b.safetensors');
      if (!sync || sync.size <= 8) throw new Error('bobot OPFS belum siap');
      return openInt4Stream(sync);
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
      draft: msg.draft === true,
      lora: msg.lora || null,
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
