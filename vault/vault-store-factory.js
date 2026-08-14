export function createVaultStore(key, maxItems) {
  const MAX = maxItems || 300;

  function readAll() {
    try {
      const raw = localStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function writeAll(list) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (e) {}
  }

  function addAll(items, meta) {
    const list = readAll();
    const withIds = (items || []).map((it) =>
      Object.assign(
        { id: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), addedAt: Date.now() },
        meta || {},
        it
      )
    );
    const merged = list.concat(withIds);
    writeAll(merged.slice(-MAX));
    return withIds.length;
  }

  function allItems() {
    return readAll();
  }

  function search(query, limit) {
    const words = String(query || '')
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2);
    if (!words.length) return [];
    const scored = readAll()
      .map((item) => {
        const hay = ((item.title || '') + ' ' + (item.text || '')).toLowerCase();
        const score = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
        return { item, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit || 5).map((s) => s.item);
  }

  return Object.freeze({ addAll, allItems, search });
}
