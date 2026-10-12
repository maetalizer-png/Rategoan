export function rejectUnsafeHtml(raw) {
  const text = String(raw == null ? '' : raw);
  if (/<script|javascript:|onerror\s*=|onload\s*=/i.test(text)) {
    throw new TypeError('trusted_types_ditolak');
  }
  return text;
}

export function createSovereignPolicy() {
  const tt = globalThis.trustedTypes;
  if (!tt || typeof tt.createPolicy !== 'function') return null;
  try {
    return tt.createPolicy('rategoan', {
      createHTML(input) {
        return rejectUnsafeHtml(input);
      },
    });
  } catch (e) {
    return null;
  }
}
