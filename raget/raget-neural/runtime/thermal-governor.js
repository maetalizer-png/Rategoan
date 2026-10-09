export function nextBatch(state) {
  const src = state || {};
  const battery = Number(src.battery == null ? 1 : src.battery);
  const hot = src.thermal === 'hot' || Number(src.celsius || 0) >= 42;
  const batch = Math.max(1, Number(src.batch) || 1);
  if (battery < 0.2 || hot) return Math.max(1, Math.floor(batch / 2));
  return batch;
}
