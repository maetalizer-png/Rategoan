// Kontrak provider model: setiap entri WAJIB punya engineClass yang jujur,
// supaya UI (js/sheets/models.js) tidak pernah menyamarkan satu kelas engine
// sebagai kelas lain. Tiga kelas yang dikenal: 'rule-template' (aktif
// sekarang - deterministik, tanpa pelatihan), 'local-neural' (Raget Neural -
// adaptasi mesin transformer dari proyek kesempatan-os-/kesem-llm, lihat
// raget/raget-llm/neural/), dan 'external' (opsional - provider API
// eksternal, belum diimplementasikan).
const ENGINE_CLASS_LABEL = Object.freeze({
  'rule-template': 'Rule / Template',
  'local-neural': 'Neural Lokal (Eksperimental)',
  external: 'Provider Eksternal',
});

const MODELS = Object.freeze([
  Object.freeze({
    id: 'raget-template-1',
    name: 'Raget',
    description: 'Mesin balasan lokal berbasis pola dan konteks, tanpa API key.',
    engineClass: 'rule-template',
  }),
  Object.freeze({
    id: 'raget-neural-50m',
    name: 'Raget Neural (50M)',
    description:
      'Transformer 49,99 juta parameter (massive50m), diadaptasi dari kesempatan-os-/kesem-llm, vocab BPE ' +
      '30.368. Sudah menjalani training nyata (gradient descent, 5.707 step di korpus gabungan Rategoan) - ' +
      'output SUDAH gramatikal (kalimat Bahasa Indonesia bersambung, tanda baca wajar) TAPI belum akurat ' +
      'secara faktual dan belum konvergen penuh (5.707 step jauh dari cukup untuk model seukuran ini) - ' +
      'jawaban bisa ngawur/tidak nyambung dengan pertanyaan, bukan sekadar belum optimal. Jatuh otomatis ke ' +
      'Raget (rule-based) kalau gagal dimuat.',
    engineClass: 'local-neural',
  }),
]);

function find(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

function classLabel(engineClass) {
  return ENGINE_CLASS_LABEL[engineClass] || engineClass;
}

// Status aktif sebelumnya konstanta statis (cuma metadata) - vNext Fase C
// menjadikannya stateful sungguhan (localStorage) supaya js/ai/ai.js bisa
// tahu model MANA yang harus dipakai untuk generate(), bukan cuma kosmetik
// di UI picker. Satu sumber kebenaran dipakai bersama oleh js/sheets/
// models.js (UI picker) dan js/ai/ai.js (routing generate).
const ACTIVE_KEY = 'rategoan_model';

function getActive() {
  try {
    const v = localStorage.getItem(ACTIVE_KEY);
    if (v && find(v)) return v;
  } catch (e) {}
  return MODELS[0].id;
}

function setActive(id) {
  if (!find(id)) return;
  try {
    localStorage.setItem(ACTIVE_KEY, id);
  } catch (e) {}
}

export const llmModels = Object.freeze({
  list: MODELS,
  get active() {
    return getActive();
  },
  setActive,
  find,
  classLabel,
});
