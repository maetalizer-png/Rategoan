export function ternaryDot(vector, weights) {
  let sum = 0;
  for (let i = 0; i < vector.length; i += 1) {
    const bit = weights[i];
    if (bit === 1) sum += vector[i];
    else if (bit === -1) sum -= vector[i];
  }
  return sum;
}
