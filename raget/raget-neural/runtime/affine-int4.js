const LEVELS = 15;
const EPS = 1e-12;

export function safeNormEps(values) {
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) sum += values[i] * values[i];
  return Math.sqrt(sum + EPS);
}

export function rmsNorm(values, gamma) {
  const scale = gamma == null ? 1 : gamma;
  let sum = 0;
  for (let i = 0; i < values.length; i += 1) sum += values[i] * values[i];
  const rms = Math.sqrt(sum / values.length + EPS);
  const out = new Array(values.length);
  for (let i = 0; i < values.length; i += 1) out[i] = (values[i] / rms) * scale;
  return out;
}

export function ropeTheta(index, dk) {
  return 10000 ** (-2 * (index - 1) / dk);
}

export function swigluScalar(gate, up) {
  const sig = 1 / (1 + Math.exp(-gate));
  return (gate * sig) * up;
}

export function affineScale(min, max) {
  return (max - min) / LEVELS;
}

export function affineZero(min, scale) {
  return Math.round(-min / scale);
}

export function quantizeAffine4(value, scale, zero) {
  return Math.min(LEVELS, Math.max(0, Math.round(value / scale) + zero));
}

export function dequantizeAffine4(q, scale, zero) {
  return (q - zero) * scale;
}

export function mseBound(min, max) {
  const scale = affineScale(min, max);
  return (scale * scale) / 12;
}

export function packNibbles(q1, q2) {
  return (q1 & 0x0f) | ((q2 & 0x0f) << 4);
}

export function unpackNibbles(raw) {
  return [raw & 0x0f, (raw >>> 4) & 0x0f];
}

export function attentionParams(dModel, kvDim) {
  return (dModel * dModel) + (dModel * kvDim) + (dModel * kvDim) + (dModel * dModel);
}

export function mlpParams(dModel, dFF) {
  return 3 * dModel * dFF;
}

export function layerBufferBytes(params) {
  return (params * 0.5) + 2 * ((params / 32) * 2);
}

export function gqaKvBytes(layers, dModel, kvHeads, headDim) {
  return 2 * layers * dModel * kvHeads * headDim * 2;
}

export function rrfScore(ranks, k) {
  const damp = k == null ? 60 : k;
  let sum = 0;
  for (let i = 0; i < ranks.length; i += 1) sum += 1 / (damp + ranks[i]);
  return sum;
}
