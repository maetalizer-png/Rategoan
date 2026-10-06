export function kvPages(tokenCount, pageSize = 16) {
  const tokens = Math.max(0, Math.floor(Number(tokenCount) || 0));
  const size = pageSize > 0 ? Math.floor(pageSize) : 16;
  return { pageSize: size, pages: Math.ceil(tokens / size), tokens };
}

export async function probeGpu() {
  const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return { ok: false, reason: 'WebGPU tidak tersedia' };
  const adapter = await gpu.requestAdapter();
  if (!adapter) return { ok: false, reason: 'Adapter tidak ditemukan' };
  return { ok: true, reason: '' };
}
