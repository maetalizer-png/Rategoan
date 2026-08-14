import { idbGateway } from '../raget-database/idb-gateway.js';

const KEY = 'raget_collection';
const MAX_ITEMS = 500;
const ARCHIVE_AFTER_MS = 30 * 24 * 60 * 60 * 1000;

function makeId() {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

async function readAll() {
  const list = await idbGateway.getList(KEY);
  return Array.isArray(list) ? list : [];
}

async function writeAll(list) {
  await idbGateway.setList(KEY, list.slice(-MAX_ITEMS));
}

function autoArchive(list) {
  const now = Date.now();
  let changed = false;
  list.forEach((it) => {
    if (!it.pinned && !it.archived && now - it.time > ARCHIVE_AFTER_MS) {
      it.archived = true;
      changed = true;
    }
  });
  return changed;
}

async function addItem(data) {
  const list = await readAll();
  const item = {
    id: makeId(),
    kind: data.kind || 'chat',
    text: String(data.text || ''),
    role: data.role || 'ai',
    chatTitle: data.chatTitle || '',
    tag: data.tag || 'umum',
    note: data.note || '',
    artifactType: data.artifactType || null,
    time: Date.now(),
    pinned: false,
    archived: false,
  };
  list.push(item);
  await writeAll(list);
  return item;
}

async function allItems(opts) {
  const options = opts || {};
  const list = await readAll();
  if (autoArchive(list)) await writeAll(list);
  if (options.includeArchived) return list;
  return list.filter((it) => !it.archived);
}

async function findItem(id) {
  const list = await readAll();
  return list.find((it) => it.id === id) || null;
}

async function updateItem(id, patch) {
  const list = await readAll();
  const item = list.find((it) => it.id === id);
  if (!item) return null;
  Object.assign(item, patch);
  await writeAll(list);
  return item;
}

async function removeItem(id) {
  const list = await readAll();
  const next = list.filter((it) => it.id !== id);
  if (next.length === list.length) return false;
  await writeAll(next);
  return true;
}

async function togglePin(id) {
  const list = await readAll();
  const item = list.find((it) => it.id === id);
  if (!item) return null;
  item.pinned = !item.pinned;
  if (item.pinned) item.archived = false;
  await writeAll(list);
  return item;
}

async function restore(id) {
  return updateItem(id, { archived: false });
}

async function existsByText(text) {
  const list = await readAll();
  const t = String(text || '').trim();
  return list.some((it) => it.text.trim() === t);
}

async function stats() {
  const list = await readAll();
  const active = list.filter((it) => !it.archived);
  const byTag = new Map();
  active.forEach((it) => byTag.set(it.tag, (byTag.get(it.tag) || 0) + 1));
  const topTags = Array.from(byTag.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({ tag, count }));
  return {
    total: active.length,
    pinned: active.filter((it) => it.pinned).length,
    archived: list.filter((it) => it.archived).length,
    topTags,
  };
}

async function importItems(items) {
  if (!Array.isArray(items)) return 0;
  const list = await readAll();
  const existingIds = new Set(list.map((it) => it.id));
  let added = 0;
  items.forEach((raw) => {
    if (!raw || typeof raw !== 'object') return;
    const id = raw.id || makeId();
    if (existingIds.has(id)) return;
    existingIds.add(id);
    list.push({
      id,
      kind: raw.kind || 'chat',
      text: String(raw.text || ''),
      role: raw.role || 'ai',
      chatTitle: raw.chatTitle || '',
      tag: raw.tag || 'umum',
      note: raw.note || '',
      artifactType: raw.artifactType || null,
      time: raw.time || Date.now(),
      pinned: !!raw.pinned,
      archived: !!raw.archived,
    });
    added++;
  });
  await writeAll(list);
  return added;
}

const INTENT_TAGS = {
  factoid: 'faktoid',
  dataries_extras: 'faktoid',
  hitung: 'hitung',
  reminder: 'pengingat',
  recall: 'ingatan',
  personalize: 'ingatan',
};

function tagFromIntent(intent) {
  if (!intent) return 'umum';
  if (INTENT_TAGS[intent]) return INTENT_TAGS[intent];
  if (String(intent).startsWith('chat_')) return 'obrolan';
  return 'umum';
}

export const collectionStore = Object.freeze({
  tagFromIntent,
  addItem,
  allItems,
  findItem,
  updateItem,
  removeItem,
  togglePin,
  restore,
  existsByText,
  stats,
  importItems,
});
