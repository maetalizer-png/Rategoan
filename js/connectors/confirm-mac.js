export function canonicalPayload(value) {
  if (Array.isArray(value)) return '[' + value.map((item) => canonicalPayload(item)).join(',') + ']';
  if (value && typeof value === 'object') {
    return '{' + Object.keys(value).sort().map((key) => JSON.stringify(key) + ':' + canonicalPayload(value[key])).join(',') + '}';
  }
  return JSON.stringify(value == null ? null : value);
}

export async function requestConfirmNonce(tool, params, token) {
  const headers = { 'content-type': 'application/json' };
  if (token) headers.authorization = 'Bearer ' + token;
  const res = await fetch('/api/confirm-challenge', {
    method: 'POST',
    headers,
    body: JSON.stringify({ tool: String(tool || ''), parameters: params || {} }),
  });
  if (!res.ok) return '';
  const data = await res.json();
  return data && data.nonce ? String(data.nonce) : '';
}
