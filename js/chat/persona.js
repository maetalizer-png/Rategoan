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
  } catch (e) { /* penyimpanan ditolak */ }
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

export function mountPersonaSelect(parent, id) {
  if (!parent || typeof document === 'undefined') return null;
  const existing = document.getElementById(id);
  if (existing) return existing;
  const label = document.createElement('label');
  label.className = 'model-speed-label';
  label.textContent = 'Persona';
  const select = document.createElement('select');
  select.id = id;
  PERSONAS.forEach((row) => {
    const opt = document.createElement('option');
    opt.value = row.id;
    opt.textContent = row.label;
    select.appendChild(opt);
  });
  select.value = personaId();
  select.addEventListener('change', () => setPersona(select.value));
  label.appendChild(select);
  parent.appendChild(label);
  return select;
}
