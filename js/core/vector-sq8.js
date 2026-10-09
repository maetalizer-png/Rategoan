export function quantizeAffine(data, count, dim) {
  const qdata = new Int8Array(count * dim);
  for (let i = 0; i < count; i += 1) {
    const base = i * dim;
    let vmin = Infinity;
    let vmax = -Infinity;
    for (let d = 0; d < dim; d += 1) {
      const value = data[base + d];
      if (value < vmin) vmin = value;
      if (value > vmax) vmax = value;
    }
    const span = vmax - vmin;
    if (!(span > 0)) continue;
    const scale = span / 255;
    for (let d = 0; d < dim; d += 1) {
      let q = Math.round((data[base + d] - vmin) / scale) - 128;
      if (q > 127) q = 127;
      else if (q < -128) q = -128;
      qdata[base + d] = q;
    }
  }
  return qdata;
}

export function sqDist16(qdata, dim, index, q) {
  const base = index * dim;
  let sum = 0;
  let d = 0;
  for (; d + 16 <= dim; d += 16) {
    const a0 = qdata[base + d] - q[d];
    const a1 = qdata[base + d + 1] - q[d + 1];
    const a2 = qdata[base + d + 2] - q[d + 2];
    const a3 = qdata[base + d + 3] - q[d + 3];
    const a4 = qdata[base + d + 4] - q[d + 4];
    const a5 = qdata[base + d + 5] - q[d + 5];
    const a6 = qdata[base + d + 6] - q[d + 6];
    const a7 = qdata[base + d + 7] - q[d + 7];
    const a8 = qdata[base + d + 8] - q[d + 8];
    const a9 = qdata[base + d + 9] - q[d + 9];
    const a10 = qdata[base + d + 10] - q[d + 10];
    const a11 = qdata[base + d + 11] - q[d + 11];
    const a12 = qdata[base + d + 12] - q[d + 12];
    const a13 = qdata[base + d + 13] - q[d + 13];
    const a14 = qdata[base + d + 14] - q[d + 14];
    const a15 = qdata[base + d + 15] - q[d + 15];
    sum += a0 * a0 + a1 * a1 + a2 * a2 + a3 * a3 + a4 * a4 + a5 * a5 + a6 * a6 + a7 * a7
      + a8 * a8 + a9 * a9 + a10 * a10 + a11 * a11 + a12 * a12 + a13 * a13 + a14 * a14 + a15 * a15;
  }
  for (; d < dim; d += 1) {
    const diff = qdata[base + d] - q[d];
    sum += diff * diff;
  }
  return sum;
}

export function warmupVectorEngine() {
  const q = new Int8Array(16);
  const row = new Int8Array(16);
  for (let i = 0; i < 16; i += 1) {
    q[i] = i - 8;
    row[i] = 8 - i;
  }
  let acc = 0;
  for (let n = 0; n < 10; n += 1) acc += sqDist16(row, 16, 0, q);
  return acc;
}

let warmed = false;
export function scheduleVectorWarmup() {
  if (warmed) return;
  warmed = true;
  const run = () => { warmupVectorEngine(); };
  const idle = globalThis.requestIdleCallback;
  if (typeof idle === 'function') idle(run);
  else run();
}
