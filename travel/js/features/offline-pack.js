export const PACK_CACHE = 'travel_pack_v1';

export async function packStatus() {
  if (!('caches' in window)) return { supported: false, downloaded: false, count: 0 };
  try {
    const has = await caches.has(PACK_CACHE);
    if (!has) return { supported: true, downloaded: false, count: 0 };
    const cache = await caches.open(PACK_CACHE);
    const keys = await cache.keys();
    return { supported: true, downloaded: keys.length > 0, count: keys.length };
  } catch (e) {
    return { supported: false, downloaded: false, count: 0 };
  }
}

function withController(fn) {
  return new Promise((resolve) => {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker.controller) {
      resolve({ ok: false, reason: 'no-sw' });
      return;
    }
    const channel = new MessageChannel();
    channel.port1.onmessage = (e) => resolve(e.data || { ok: false });
    navigator.serviceWorker.controller.postMessage(fn(), [channel.port2]);
  });
}

export function downloadPack() {
  return withController(() => ({ type: 'CACHE_PACK' }));
}

export function clearPack() {
  return withController(() => ({ type: 'CLEAR_PACK' }));
}
