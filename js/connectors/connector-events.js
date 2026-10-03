export function emitConnector(name, detail) {
  window.dispatchEvent(new CustomEvent(name, { detail: detail || {} }));
}

export function onConnector(name, fn) {
  window.addEventListener(name, fn);
  return () => window.removeEventListener(name, fn);
}
