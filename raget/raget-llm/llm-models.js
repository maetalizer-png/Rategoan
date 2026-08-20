// Kontrak provider model: setiap entri WAJIB punya engineClass yang jujur,
// supaya UI (js/sheets/models.js) tidak pernah menyamarkan satu kelas engine
// sebagai kelas lain. Tiga kelas yang dikenal: 'rule-template' (aktif
// sekarang - deterministik, tanpa pelatihan), 'local-neural' (rencana -
// adaptasi mesin transformer dari proyek kesempatan-os-/kesem-llm), dan
// 'external' (opsional - provider API eksternal, belum diimplementasikan).
const ENGINE_CLASS_LABEL = Object.freeze({
  'rule-template': 'Rule / Template',
  'local-neural': 'Neural Lokal',
  external: 'Provider Eksternal',
});

const MODELS = Object.freeze([
  Object.freeze({
    id: 'raget-template-1',
    name: 'Raget',
    description: 'Mesin balasan lokal berbasis pola dan konteks, tanpa API key.',
    engineClass: 'rule-template',
  }),
]);

function find(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

function classLabel(engineClass) {
  return ENGINE_CLASS_LABEL[engineClass] || engineClass;
}

export const llmModels = Object.freeze({
  list: MODELS,
  active: 'raget-template-1',
  find,
  classLabel,
});
