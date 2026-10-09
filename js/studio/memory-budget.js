export const MEMORY_BUDGET = 30 * 1024 * 1024;

export function workspaceBytes(files) {
  let total = 0;
  Object.keys(files || {}).forEach((path) => {
    total += String(files[path] == null ? '' : files[path]).length;
  });
  return total;
}

export function withinBudget(files) {
  return workspaceBytes(files) < MEMORY_BUDGET;
}

export function packText(text) {
  const src = String(text || '');
  const parts = [];
  let i = 0;
  while (i < src.length) {
    let n = 1;
    while (i + n < src.length && src[i + n] === src[i] && n < 65535) n += 1;
    parts.push([src[i], n]);
    i += n;
  }
  return parts;
}

export function unpackText(parts) {
  return (parts || []).map((row) => String(row[0]).repeat(row[1])).join('');
}
