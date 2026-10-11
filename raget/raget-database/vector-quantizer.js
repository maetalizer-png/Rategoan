import { searchInt8Rows } from './simd128.js';

export function quantizeSymmetric(values) {
  const src = values instanceof Float32Array ? values : Float32Array.from(values || []);
  const data = new Int8Array(src.length);
  for (let i = 0; i < src.length; i += 1) {
    let q = Math.round(src[i] * 127);
    if (q > 127) q = 127;
    else if (q < -127) q = -127;
    data[i] = q;
  }
  return { data, scale: 1 / 127 };
}

export function dequantizeSymmetric(packed) {
  const data = packed && packed.data ? packed.data : packed;
  const scale = packed && packed.scale ? packed.scale : (1 / 127);
  const out = new Float32Array(data.length);
  for (let i = 0; i < data.length; i += 1) out[i] = data[i] * scale;
  return out;
}

export function safeNorm(vector) {
  let sum = 0;
  const n = vector ? vector.length : 0;
  for (let i = 0; i < n; i += 1) sum += vector[i] * vector[i];
  if (!(sum > 0)) return 0;
  return Math.sqrt(sum);
}

export function dotInt8x8(matrix, base, query, dim) {
  let acc = 0;
  let i = 0;
  const end = dim - (dim % 8);
  for (; i < end; i += 8) {
    const o = base + i;
    acc += matrix[o] * query[i]
      + matrix[o + 1] * query[i + 1]
      + matrix[o + 2] * query[i + 2]
      + matrix[o + 3] * query[i + 3]
      + matrix[o + 4] * query[i + 4]
      + matrix[o + 5] * query[i + 5]
      + matrix[o + 6] * query[i + 6]
      + matrix[o + 7] * query[i + 7];
  }
  for (; i < dim; i += 1) acc += matrix[base + i] * query[i];
  return acc;
}

export function searchInt8Top1(matrix, count, dim, query) {
  if (dim % 16 === 0) {
    const hit = searchInt8Rows(matrix, count, dim, query);
    if (hit) return hit;
  }
  let best = 0;
  let bestScore = -1e15;
  for (let row = 0; row < count; row += 1) {
    const base = row * dim;
    let acc = 0;
    for (let i = 0; i < dim; i += 8) {
      const o = base + i;
      acc += matrix[o] * query[i]
        + matrix[o + 1] * query[i + 1]
        + matrix[o + 2] * query[i + 2]
        + matrix[o + 3] * query[i + 3]
        + matrix[o + 4] * query[i + 4]
        + matrix[o + 5] * query[i + 5]
        + matrix[o + 6] * query[i + 6]
        + matrix[o + 7] * query[i + 7];
    }
    if (acc > bestScore) {
      bestScore = acc;
      best = row;
    }
  }
  return { id: best, score: bestScore };
}

export function searchInt8Matrix(matrix, count, dim, query, k) {
  const q = query instanceof Int8Array ? query : quantizeSymmetric(query).data;
  const limit = k > 0 ? k : 1;
  if (limit === 1 && dim % 8 === 0) return [searchInt8Top1(matrix, count, dim, q)];
  const top = [];
  for (let row = 0; row < count; row += 1) {
    const score = dotInt8x8(matrix, row * dim, q, dim);
    if (top.length < limit) {
      top.push({ id: row, score });
      if (top.length === limit) top.sort((a, b) => b.score - a.score);
    } else if (score > top[limit - 1].score) {
      top[limit - 1] = { id: row, score };
      top.sort((a, b) => b.score - a.score);
    }
  }
  return top;
}
