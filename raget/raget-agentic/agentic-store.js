// Riwayat Task Agentic AI - dibangun di atas idbGateway existing (kunci
// baru di database IndexedDB yang SAMA, bukan database kedua), meniru pola
// raget-memory/collection-store.js.
import { idbGateway } from '../raget-database/idb-gateway.js';

const KEY = 'raget_agentic_tasks';
const MAX_ITEMS = 100;

async function readAll() {
  const list = await idbGateway.getList(KEY);
  return Array.isArray(list) ? list : [];
}

async function writeAll(list) {
  await idbGateway.setList(KEY, list.slice(-MAX_ITEMS));
}

async function save(task) {
  const list = await readAll();
  const idx = list.findIndex((t) => t.id === task.id);
  if (idx >= 0) list[idx] = task;
  else list.push(task);
  await writeAll(list);
  return task;
}

async function allItems() {
  const list = await readAll();
  return list.slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

async function findItem(id) {
  const list = await readAll();
  return list.find((t) => t.id === id) || null;
}

async function removeItem(id) {
  const list = await readAll();
  const next = list.filter((t) => t.id !== id);
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}

export const agenticStore = Object.freeze({
  save,
  allItems,
  findItem,
  removeItem,
});
