// Online softmax FlashAttention-2: satu blok KV, tanpa matriks T x T.
fn online_step(score: f32, max_s: ptr<function, f32>, sum_s: ptr<function, f32>) -> f32 {
  let next = max((*max_s), score);
  let alpha = exp((*max_s) - next);
  let weight = exp(score - next);
  (*sum_s) = (*sum_s) * alpha + weight;
  (*max_s) = next;
  return weight;
}
