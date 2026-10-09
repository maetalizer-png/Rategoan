const BLOB_TTL = 300000;
const live = new Map();

export function trackBlob(url, now) {
  const t = now == null ? Date.now() : now;
  live.set(String(url), t);
  return url;
}

export function retainBlob(url, now) {
  if (!live.has(String(url))) return false;
  live.set(String(url), now == null ? Date.now() : now);
  return true;
}

export function sweepBlobs(now, revoke) {
  const t = now == null ? Date.now() : now;
  const drop = [];
  live.forEach((at, url) => {
    if (t - at > BLOB_TTL) drop.push(url);
  });
  drop.forEach((url) => {
    live.delete(url);
    if (typeof revoke === 'function') revoke(url);
    else if (typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') URL.revokeObjectURL(url);
  });
  return drop;
}
