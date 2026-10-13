import { openInt4Stream } from './int4-session.js';
import { openSyncWeight, safetensorsHeaderOk } from './weight-cache.js';

let sessionPromise = null;

function session() {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const sync = await openSyncWeight('raget-neural-1.5b.safetensors');
      if (!safetensorsHeaderOk(sync)) {
        if (sync && typeof sync.close === 'function') {
          try { sync.close(); } catch (e) { /* gagang buruk */ }
        }
        throw new Error('header safetensors rusak');
      }
      return openInt4Stream(sync);
    })();
  }
  return sessionPromise;
}

self.onmessage = async (event) => {
  const msg = event.data || {};
  if (msg.op !== 'generate') return;
  let timed = false;
  let cap = 0;
  const arm = () => {
    clearTimeout(cap);
    cap = setTimeout(() => {
      timed = true;
      sessionPromise = null;
      self.postMessage({ id: msg.id, type: 'error', message: 'nalar timeout' });
    }, 30000);
  };
  arm();
  try {
    const live = await session();
    if (timed) return;
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
        if (timed) return;
        arm();
        self.postMessage({ id: msg.id, type: 'token', piece: piece });
      },
    });
    if (timed) return;
    clearTimeout(cap);
    self.postMessage({
      id: msg.id,
      type: 'done',
      text: out.text,
      tokenIds: out.tokenIds,
      device: out.device,
      trained: out.trained,
    });
  } catch (e) {
    clearTimeout(cap);
    sessionPromise = null;
    if (timed) return;
    self.postMessage({ id: msg.id, type: 'error', message: e && e.message ? e.message : 'gagal' });
  }
};