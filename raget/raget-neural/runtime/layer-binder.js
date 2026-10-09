export const LAYER_BUDGET = Math.round(26.87 * 1024 * 1024);

export function bindLayers(count) {
  const n = Math.max(0, count | 0);
  const layers = [];
  for (let i = 0; i < n; i += 1) {
    layers.push({ index: i, bytes: LAYER_BUDGET, offset: i * LAYER_BUDGET });
  }
  return { layers, sequential: true, bytes: n * LAYER_BUDGET };
}
