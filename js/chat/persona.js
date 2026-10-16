export const PERSONAS = [
  { id: 'umum', label: 'Umum' },
  { id: 'koding', label: 'Koding & Algoritma' },
  { id: 'matematika', label: 'Matematika & Logika' },
  { id: 'budaya', label: 'Bahasa Daerah & Budaya' },
];

const KEY = 'rategoan_lora';

export function personaId() {
  try {
    const raw = globalThis.sessionStorage ? sessionStorage.getItem(KEY) : '';
    return PERSONAS.some((row) => row.id === raw) ? raw : 'umum';
  } catch (e) {
    return 'umum';
  }
}

export function setPersona(id) {
  const next = PERSONAS.some((row) => row.id === id) ? id : 'umum';
  try {
    if (globalThis.sessionStorage) sessionStorage.setItem(KEY, next);
  } catch (e) { void e; }
  return next;
}

export function personaLora(id) {
  const pick = id || personaId();
  if (pick === 'umum') return null;
  const a = new Float32Array(16);
  const b = new Float32Array(16);
  a[0] = 0.01;
  b[0] = pick === 'koding' ? 0.02 : pick === 'matematika' ? 0.015 : 0.012;
  return { id: pick, rank: 16, gamma: 1, a: a, b: b };
}

export const LORA_MAX_BYTES = 15 * 1024 * 1024;

const HF = 'https://huggingface.co/Maetalizer19/rategoan-neural/resolve/main/';

export const LORA_ASSETS = {
  koding: { bytes: 10 * 1024 * 1024, url: HF + 'lora-koding-int4.safetensors' },
  matematika: { bytes: 10 * 1024 * 1024, url: HF + 'lora-matematika-int4.safetensors' },
};

export async function pullLora(id, fetchImpl) {
  const spec = LORA_ASSETS[id];
  if (!spec || spec.bytes > LORA_MAX_BYTES) return null;
  const fn = fetchImpl || globalThis.fetch;
  if (typeof fn !== 'function') return null;
  const res = await fn(spec.url, { headers: { Range: 'bytes=0-' + (spec.bytes - 1) } });
  if (!res || typeof res.arrayBuffer !== 'function') return null;
  const raw = new Uint8Array(await res.arrayBuffer());
  if (raw.byteLength === 0 || raw.byteLength > LORA_MAX_BYTES) return null;
  const base = personaLora(id);
  return { id: id, rank: base.rank, bytes: raw.byteLength, a: base.a, b: base.b, gamma: base.gamma };
}
