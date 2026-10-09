export function nextBatch(state) {
  const src = state || {};
  const battery = Number(src.battery == null ? 1 : src.battery);
  const hot = src.thermal === 'hot' || Number(src.celsius || 0) >= 42;
  const batch = Math.max(1, Number(src.batch) || 1);
  if (battery < 0.2 || hot) return Math.max(1, Math.floor(batch / 2));
  return batch;
}

export function thermalGovernor(sample) {
  const temp = Number(sample && sample.tempC) || 0;
  const battery = sample && sample.battery != null ? Number(sample.battery) : 1;
  const hot = temp >= 42 || battery <= 0.2;
  return {
    throttle: hot,
    hz: hot ? 4 : 12,
    batch: nextBatch({ battery, celsius: temp, batch: hot ? 4 : 12 }),
    reason: hot ? (battery <= 0.2 ? 'baterai' : 'suhu') : 'normal',
  };
}
