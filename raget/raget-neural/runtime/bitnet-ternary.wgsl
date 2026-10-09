// Bobot ternary {-1, 0, 1}: tambah, kurang, atau lompat. Bukan perkalian FP16.
fn ternary_dot(x: f32, w: i32, acc: ptr<function, f32>) {
  if (w == 1) { (*acc) = (*acc) + x; }
  else if (w == -1) { (*acc) = (*acc) - x; }
}
