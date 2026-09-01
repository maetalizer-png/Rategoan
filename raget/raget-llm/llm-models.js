const MODELS = Object.freeze([
  Object.freeze({
    id: 'raget-template-1',
    name: 'Raget',
    engineClass: 'rule-template',
  }),
  Object.freeze({
    id: 'raget-neural-50m',
    name: 'Raget 50M',
    engineClass: 'local-neural',
    neuralTier: 'lokal-ringan',
  }),
  Object.freeze({
    id: 'raget-neural-100m',
    name: 'Raget 100M',
    engineClass: 'local-neural',
    neuralTier: 'lokal-berat',
  }),
  Object.freeze({
    id: 'raget-neural-200m',
    name: 'Raget 200M',
    engineClass: 'local-neural',
    neuralTier: 'lokal-super',
    desc: 'Eksperimental, belum koheren penuh · unduh ±163 MB sekali',
    downloadSizeMB: 163,
  }),
]);

function find(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

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
});
