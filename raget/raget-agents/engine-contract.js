
const REQUIRED_KEYS = ['id', 'label', 'init', 'ask', 'status'];

function isValidAdapter(adapter) {
  if (!adapter || typeof adapter !== 'object') return false;
  if (!REQUIRED_KEYS.every((k) => k in adapter)) return false;
  if (typeof adapter.id !== 'string' || !adapter.id) return false;
  if (typeof adapter.label !== 'string' || !adapter.label) return false;
  if (typeof adapter.init !== 'function') return false;
  if (typeof adapter.ask !== 'function') return false;
  if (typeof adapter.status !== 'function') return false;
  return true;
}

export const engineContract = Object.freeze({
  REQUIRED_KEYS,
  isValidAdapter,
});
