import { prepareSource } from './ast-heal.js';

export const AUTOSAVE_MS = 30000;
const journal = new Map();
const autosave = new Map();

export function readVfsJournal() {
  return Array.from(journal.values()).map((row) => ({
    id: row.id,
    status: row.status,
  }));
}

export function writeAutosave(key, snapshot) {
  autosave.set(String(key || 'aktif'), { at: Date.now(), snapshot });
  return AUTOSAVE_MS;
}

export function readAutosave(key) {
  return autosave.get(String(key || 'aktif')) || null;
}

export function crashAfterPrepare(git) {
  const id = 'crash-' + journal.size;
  journal.set(id, {
    id,
    status: 'PREPARE',
    snap: git.snapshot(),
    refs: new Map(git.refs),
  });
  return id;
}

export function recoverOpenJournal(git) {
  let recovered = 0;
  journal.forEach((row) => {
    if (row.status !== 'PREPARE') return;
    if (git && row.snap && typeof git.rollback === 'function') git.rollback(row.snap);
    if (git && row.refs) row.refs.forEach((value, ref) => git.refs.set(ref, value));
    row.status = 'ROLLED_BACK';
    recovered += 1;
  });
  return recovered;
}

export class VfsTransaction {
  constructor(vfs, git) {
    this.vfs = vfs;
    this.git = git;
    this.snapshot = null;
    this.refSnap = null;
    this.vfsSnap = null;
  }

  begin() {
    this.snapshot = this.git.snapshot();
    this.refSnap = new Map(this.git.refs);
    this.vfsSnap = this.vfs && typeof this.vfs.snapshot === 'function' ? this.vfs.snapshot() : null;
  }

  restoreRefs() {
    if (!this.refSnap) return;
    this.refSnap.forEach((value, key) => this.git.refs.set(key, value));
  }

  async commitBatch(mutations) {
    if (!this.snapshot) this.begin();
    const txId = 'tx-' + Date.now().toString(36) + '-' + journal.size;
    journal.set(txId, {
      id: txId,
      status: 'PREPARE',
      snap: this.snapshot,
      refs: new Map(this.refSnap || []),
    });
    const prevHead = this.git.refs.get('HEAD') || '';
    const prevMain = this.git.refs.get('main') || '';
    const staged = [];
    try {
      Object.keys(mutations || {}).forEach((path) => {
        const prepared = prepareSource(path, mutations[path]);
        const body = prepared.code;
        this.git.stage(path, body);
        staged.push([path, body]);
      });
      staged.forEach(([path, body]) => {
        if (this.vfs && typeof this.vfs.write === 'function') this.vfs.write(path, body);
      });
      const commitId = this.git.commit('Agent automated update', { moveRefs: false });
      this.git.casRef('HEAD', prevHead, commitId);
      this.git.casRef('main', prevMain, commitId);
      const row = journal.get(txId);
      if (row) row.status = 'COMMITTED';
      writeAutosave('aktif', this.git.snapshot());
      return commitId;
    } catch (err) {
      this.git.rollback(this.snapshot);
      this.restoreRefs();
      const row = journal.get(txId);
      if (row) row.status = 'ROLLED_BACK';
      if (this.vfsSnap && this.vfs && typeof this.vfs.reset === 'function') {
        this.vfs.reset({});
        this.vfs.load(this.vfsSnap);
      }
      throw err;
    }
  }
}
