export function onlineAttention(q, keys, values) {
  let max = -Infinity;
  let sum = 0;
  const acc = new Array(values[0].length).fill(0);
  for (let i = 0; i < keys.length; i += 1) {
    let score = 0;
    for (let d = 0; d < q.length; d += 1) score += q[d] * keys[i][d];
    const next = score > max ? score : max;
    const alpha = max === -Infinity ? 0 : Math.exp(max - next);
    const weight = Math.exp(score - next);
    sum = sum * alpha + weight;
    for (let d = 0; d < acc.length; d += 1) acc[d] = acc[d] * alpha + weight * values[i][d];
    max = next;
  }
  return acc.map((value) => value / sum);
}

export function standardAttention(q, keys, values) {
  const scores = keys.map((key) => {
    let score = 0;
    for (let d = 0; d < q.length; d += 1) score += q[d] * key[d];
    return score;
  });
  const max = Math.max.apply(null, scores);
  const exps = scores.map((score) => Math.exp(score - max));
  const sum = exps.reduce((total, value) => total + value, 0);
  const acc = new Array(values[0].length).fill(0);
  exps.forEach((weight, index) => {
    const share = weight / sum;
    for (let d = 0; d < acc.length; d += 1) acc[d] += share * values[index][d];
  });
  return acc;
}
