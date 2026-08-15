const MODELS = Object.freeze([
  Object.freeze({
    id: 'raget-template-1',
    name: 'Raget',
    description: 'Mesin balasan lokal berbasis pola dan konteks, tanpa API key.',
  }),
]);

function find(id) {
  return MODELS.find((m) => m.id === id) || MODELS[0];
}

export const llmModels = Object.freeze({
  list: MODELS,
  active: 'raget-template-1',
  find,
});
