export function layoutForTask(task) {
  const text = String(task || '');
  if (/kanvas luas|pratinjau luas|expanded/i.test(text)) return 'expanded';
  if (/baca|fokus|dokumen panjang/i.test(text)) return 'focus';
  return 'split';
}

export function applyLayout(root, mode) {
  if (!root || !root.classList) return mode || 'split';
  root.classList.remove('is-focus', 'is-expanded');
  if (mode === 'focus') root.classList.add('is-focus');
  if (mode === 'expanded') root.classList.add('is-expanded');
  return mode || 'split';
}
