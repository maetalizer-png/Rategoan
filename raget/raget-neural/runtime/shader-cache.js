import { sha256Sync } from '../../../js/studio/vfs-git.js';
import { SHADER_STORE, putRow } from '../../raget-database/durable-store.js';

const memory = new Map();

export function rememberShader(source) {
  const hash = sha256Sync(String(source || ''));
  const body = String(source || '');
  memory.set(hash, body);
  putRow(SHADER_STORE, { id: hash, source: body }).catch(() => {});
  return hash;
}

export function recallShader(hash) {
  return memory.has(hash) ? memory.get(hash) : null;
}
