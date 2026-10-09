export function mountNamespace(key, value) {
  const root = typeof window !== 'undefined' ? window : null;
  if (!root) return null;
  if (!root.Rategoan || typeof root.Rategoan !== 'object') {
    root.Rategoan = {
      ai: null,
      llm: null,
      agent: null,
      stream: null,
      vfs: null,
      mesin: null,
    };
  }
  if (key) root.Rategoan[key] = value;
  root.RG = root.Rategoan;
  return root.Rategoan;
}
