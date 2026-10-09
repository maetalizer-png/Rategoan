export function mse(left, right) {
  const n = Math.min(left.length, right.length) || 1;
  let sum = 0;
  for (let i = 0; i < n; i += 1) {
    const diff = left[i] - right[i];
    sum += diff * diff;
  }
  return sum / n;
}

export function adjustScale(scale, guard) {
  if (guard && guard.ok) return scale;
  return Number(scale) * 0.5;
}

export function accuracyGuard(left, right, limit) {
  const err = mse(left, right);
  const cap = limit == null ? 0.015 : limit;
  return { ok: err <= cap, mse: err };
}
