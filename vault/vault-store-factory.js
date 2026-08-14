import { idbGateway } from '../raget-database/idb-gateway.js';
import { retrieval } from '../raget-retrieval/retrieve.js';

export function createVaultStore(key, maxItems) {
  const MAX = maxItems || 300;

  async function readAll() {
    const list = await idbGateway.getList(key);
    return Array.isArray(list) ? list : [];
  }

  async function writeAll(list) {
    await idbGateway.setList(key, list.slice(-MAX));
  }

  async function addAll(items, meta) {
    const list = await readAll();
    const withIds = (items || []).map((it) =>
      Object.assign(
        { id: 'v' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), addedAt: Date.now() },
        meta || {},
        it
      )
    );
    const merged = list.concat(withIds);
    await writeAll(merged);
    return withIds.length;
  }

  async function allItems() {
    return await readAll();
  }

  async function search(query, limit) {
    const list = await readAll();
    const corpus = list.map((item) => ({ item, text: (item.title || '') + ' ' + (item.text || '') }));
    const ranked = retrieval.rank(query, corpus, { threshold: retrieval.LIST_THRESHOLD, limit: limit || 5 });
    return ranked.map((r) => r.item.item);
  }

  return Object.freeze({ addAll, allItems, search });
}
