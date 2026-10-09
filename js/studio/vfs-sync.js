export const VFS_CHANNEL = 'rategoan-vfs-sync';

export function compareVectorClock(left, right) {
  const keys = new Set(Object.keys(left || {}).concat(Object.keys(right || {})));
  let less = false;
  let greater = false;
  keys.forEach((key) => {
    const a = Number(left && left[key]) || 0;
    const b = Number(right && right[key]) || 0;
    if (a < b) less = true;
    if (a > b) greater = true;
  });
  if (less && greater) return 0;
  if (less) return -1;
  if (greater) return 1;
  return 0;
}

export function openVfsChannel(onMessage) {
  if (typeof globalThis.BroadcastChannel !== 'function') return null;
  const channel = new globalThis.BroadcastChannel(VFS_CHANNEL);
  if (typeof onMessage === 'function') channel.onmessage = (event) => onMessage(event.data);
  return channel;
}

export function publishVfsClock(channel, clock) {
  if (!channel) return false;
  channel.postMessage({ clock: clock || {}, at: Date.now() });
  return true;
}
