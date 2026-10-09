export function subgroupCaps(adapterInfo) {
  const name = String(adapterInfo || '');
  const ok = /apple|m[1-4]|snapdragon|adreno/i.test(name);
  return { subgroups: ok, reason: ok ? 'hardware' : 'fallback' };
}
