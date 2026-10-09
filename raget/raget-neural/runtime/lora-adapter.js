export function applyLora(vector, a, b, scale) {
  const rank = a[0].length;
  if (rank !== 8) throw new Error('rank');
  const hidden = new Array(rank).fill(0);
  for (let r = 0; r < rank; r += 1) {
    for (let i = 0; i < vector.length; i += 1) hidden[r] += vector[i] * a[i][r];
  }
  const out = vector.slice();
  for (let o = 0; o < out.length; o += 1) {
    let add = 0;
    for (let r = 0; r < rank; r += 1) add += hidden[r] * b[r][o];
    out[o] += (scale || 1) * add;
  }
  return out;
}
