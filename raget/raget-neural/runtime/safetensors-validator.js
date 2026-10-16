export function safetensorsPayloadOk(sync) {
  try {
    if (!sync || typeof sync.read !== 'function') return false;
    const size = Number(sync.size) || 0;
    if (size < 16) return false;
    const raw = sync.read(0, 8);
    if (!raw || raw.length < 8 || !raw.buffer) return false;
    const view = new DataView(raw.buffer, raw.byteOffset || 0, raw.byteLength);
    let headerLen = 0;
    try { headerLen = Number(view.getBigUint64(0, true)); } catch (e) { return false; }
    if (!headerLen || headerLen > 64 * 1024) return false;
    const headerEnd = 8 + headerLen;
    if (size < headerEnd) return false;
    const payload = size - headerEnd;
    if (payload <= 0) return false;
    const slice = sync.read(8, headerLen);
    if (!slice || slice.length < headerLen) return false;
    const header = JSON.parse(new TextDecoder().decode(slice));
    if (!header || typeof header !== 'object') return false;
    const ranges = [];
    const keys = Object.keys(header);
    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i];
      if (key === '__metadata__') continue;
      const tensor = header[key];
      if (!tensor || typeof tensor.dtype !== 'string' || !tensor.dtype) return false;
      if (!Array.isArray(tensor.shape)) return false;
      for (let d = 0; d < tensor.shape.length; d += 1) {
        const dim = tensor.shape[d];
        if (!Number.isInteger(dim) || dim < 0) return false;
      }
      const off = tensor.data_offsets;
      if (!Array.isArray(off) || off.length !== 2) return false;
      const start = Number(off[0]);
      const end = Number(off[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return false;
      if (start < 0 || end <= start || end > payload) return false;
      ranges.push([start, end]);
    }
    if (!ranges.length) return false;
    ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    for (let i = 1; i < ranges.length; i += 1) {
      if (ranges[i][0] < ranges[i - 1][1]) return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function validateSafetensors(sync) {
  return safetensorsPayloadOk(sync);
}
