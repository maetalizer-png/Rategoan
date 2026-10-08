export const WATCHDOG_MS = 5000;
export const MEMORY_CAP = 120 * 1024 * 1024;
export const INT4_BLOCK = 32;
export const MAX_DEVIATION = 0.015;

export function withWatchdog(work, ms) {
  const limit = ms > 0 ? ms : WATCHDOG_MS;
  let timer = null;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error('watchdog');
      err.name = 'WatchdogError';
      reject(err);
    }, limit);
  });
  return Promise.race([Promise.resolve().then(work), timeout]).finally(() => {
    if (timer) clearTimeout(timer);
  });
}

export function memoryUnderBudget(bytes, limit) {
  const cap = limit > 0 ? limit : MEMORY_CAP;
  return Math.max(0, Number(bytes) || 0) < cap;
}

export function maxDeviation(original, restored) {
  const left = original || [];
  const right = restored || [];
  const n = Math.min(left.length, right.length);
  let worst = 0;
  for (let i = 0; i < n; i += 1) {
    const base = Math.abs(left[i]) || 1;
    const delta = Math.abs(left[i] - right[i]) / base;
    if (delta > worst) worst = delta;
  }
  return worst;
}

export function blockDeviationOk(original, restored) {
  return maxDeviation(original, restored) < MAX_DEVIATION;
}
