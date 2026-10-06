import { buildZip } from './zip-local.js';
import { vaultKey } from './vault-key.js';
import { store } from '../js/state/store.js';
import { workspace } from '../js/state/workspace.js';
import { memoryLong } from '../raget/raget-memory/memory-long.js';

const MAGIC = [0x52, 0x47, 0x56, 0x31];

function unzip(bytes) {
  const files = [];
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) break;
    const nameLen = view.getUint16(offset + 26, true);
    const extra = view.getUint16(offset + 28, true);
    const size = view.getUint32(offset + 22, true);
    const start = offset + 30 + nameLen + extra;
    const name = new TextDecoder().decode(bytes.subarray(offset + 30, offset + 30 + nameLen));
    files.push({ name, data: bytes.subarray(start, start + size) });
    offset = start + size;
  }
  return files;
}

function textOf(files, name) {
  const hit = files.find((file) => file.name === name);
  return hit ? new TextDecoder().decode(hit.data) : '';
}

export function mergeByTime(local, incoming) {
  const map = new Map((local || []).map((item) => [item.id, item]));
  (incoming || []).forEach((item) => {
    if (!item || item.id == null) return;
    const prev = map.get(item.id);
    const nextTime = item.updatedAt || item.time || 0;
    const prevTime = prev ? (prev.updatedAt || prev.time || 0) : -1;
    if (!prev || nextTime >= prevTime) map.set(item.id, item);
  });
  return [...map.values()];
}

export async function packVault(sessions, projects, notes) {
  const zip = buildZip([
    { name: 'manifest.json', data: JSON.stringify({ app: 'rategoan', time: Date.now() }) },
    { name: 'sessions.json', data: JSON.stringify(sessions || []) },
    { name: 'projects.json', data: JSON.stringify(projects || []) },
    { name: 'collections.json', data: JSON.stringify(notes || []) },
  ]);
  const key = vaultKey.current();
  if (!key) return zip;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, zip));
  const out = new Uint8Array(4 + iv.length + cipher.length);
  out.set(MAGIC, 0);
  out.set(iv, 4);
  out.set(cipher, 16);
  return out;
}

export async function unpackVault(bytes) {
  const raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let zip = raw;
  if (raw.length > 16 && raw[0] === MAGIC[0] && raw[1] === MAGIC[1] && raw[2] === MAGIC[2] && raw[3] === MAGIC[3]) {
    const key = vaultKey.current();
    if (!key) throw new Error('PIN dibutuhkan untuk membuka cadangan');
    const iv = raw.subarray(4, 16);
    const plain = new Uint8Array(await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, raw.subarray(16)));
    zip = plain;
  }
  const files = unzip(zip);
  return {
    sessions: JSON.parse(textOf(files, 'sessions.json') || '[]'),
    projects: JSON.parse(textOf(files, 'projects.json') || '[]'),
    notes: JSON.parse(textOf(files, 'collections.json') || '[]'),
  };
}

export async function exportVaultBytes() {
  const sessions = (store.get().sessions) || [];
  const projects = workspace.list();
  const notes = memoryLong.allNotes();
  return packVault(sessions, projects, notes);
}

export async function restoreVaultBytes(bytes) {
  const data = await unpackVault(bytes);
  const st = store.get();
  store.set({ sessions: mergeByTime(st.sessions, data.sessions), currentId: st.currentId });
  store.save();
  if (typeof document !== 'undefined') document.dispatchEvent(new CustomEvent('rategoan:sessions-restored'));
  return data;
}
