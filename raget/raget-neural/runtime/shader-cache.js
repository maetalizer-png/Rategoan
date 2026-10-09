import { sha256Sync } from '../../../js/studio/vfs-git.js';

const memory = new Map();

export function rememberShader(source) {
  const hash = sha256Sync(String(source || ''));
  memory.set(hash, String(source || ''));
  return hash;
}

export function recallShader(hash) {
  return memory.has(hash) ? memory.get(hash) : null;
}
