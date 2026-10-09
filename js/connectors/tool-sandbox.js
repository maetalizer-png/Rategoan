export function createToolSandbox(capabilities) {
  const allow = new Set(capabilities || []);
  return {
    can(cap) { return allow.has(cap); },
    fetch(url) {
      if (!allow.has('net:fetch')) throw new Error('kapabilitas');
      return String(url || '');
    },
    read(path) {
      if (!allow.has('fs:read')) throw new Error('kapabilitas');
      return String(path || '');
    },
  };
}
