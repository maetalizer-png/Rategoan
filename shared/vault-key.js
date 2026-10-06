let key = null;

export const vaultKey = {
  current() { return key; },
  hold(next) { key = next || null; },
  drop() { key = null; },
};
