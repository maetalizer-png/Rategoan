import { prepareSource } from './ast-heal.js';
import { vfsPath } from './vfs.js';
import { JOURNAL_STORE, putRow, allRows } from '../../raget/raget-database/durable-store.js';

export const AUTOSAVE_MS = 30000;
const journal = new Map();
const autosave = new Map();
let lockChain = Promise.resolve();

export function withVfsLock(fn) {
  const locks = globalThis.navigator && globalThis.navigator.locks;
  if (locks && typeof locks.request === 'function') {
    return locks.request('rategoan-vfs-wal', { mode: 'exclusive' }, () => fn());
  }
  const run = lockChain.then(() => fn());
  lockChain = run.then(() => {}, () => {});
  return run;
}

function plainFiles(git) {
  const files = {};
  if (git && typeof git.snapshot === 'function') {
    git.snapshot().forEach((value, path) => { files[path] = value; });
  }
  return files;
}

async function remember(row) {
  journal.set(row.id, row);
  const pending = putRow(JOURNAL_STORE, {
    id: row.id,
    status: row.status,
    files: row.files || null,
  });
  if (typeof indexedDB !== 'undefined') await pending;
  return row.id;
}

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
  remember({
    id,
    status: 'PREPARE',
    snap: git.snapshot(),
    refs: new Map(git.refs),
    files: plainFiles(git),
  });
  return id;
}

export function recoverOpenJournal(git) {
  let recovered = 0;
  journal.forEach((row) => {
    if (row.status !== 'PREPARE') return;
    if (git && row.snap && typeof git.rollback === 'function') git.rollback(row.snap);
    else if (git && row.files) {
      Object.keys(row.files).forEach((path) => git.stage(path, row.files[path]));
    }
    if (git && row.refs) row.refs.forEach((value, ref) => git.refs.set(ref, value));
    row.status = 'ROLLED_BACK';
    remember(row);
    recovered += 1;
  });
  return recovered;
}

export async function bootRecover(git) {
  const rows = await allRows(JOURNAL_STORE);
  rows.forEach((row) => {
    if (!row || journal.has(row.id)) return;
    journal.set(row.id, row);
  });
  return recoverOpenJournal(git);
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
    return withVfsLock(() => this.applyCommit(mutations));
  }

  async applyCommit(mutations) {
    if (!this.snapshot) this.begin();
    const txId = 'tx-' + Date.now().toString(36) + '-' + journal.size;
    await remember({
      id: txId,
      status: 'PREPARE',
      snap: this.snapshot,
      refs: new Map(this.refSnap || []),
      files: plainFiles({ snapshot: () => this.snapshot }),
    });
    const prevHead = this.git.refs.get('HEAD') || '';
    const prevMain = this.git.refs.get('main') || '';
    const staged = [];
    try {
      Object.keys(mutations || {}).forEach((path) => {
        const safe = vfsPath(path);
        const prepared = prepareSource(safe, mutations[path]);
        const body = prepared.code;
        this.git.stage(safe, body);
        staged.push([safe, body]);
      });
      staged.forEach(([path, body]) => {
        if (this.vfs && typeof this.vfs.write === 'function') this.vfs.write(path, body);
      });
      const commitId = this.git.commit('Agent automated update', { moveRefs: false });
      this.git.casRef('HEAD', prevHead, commitId);
      this.git.casRef('main', prevMain, commitId);
      const row = journal.get(txId);
      if (row) {
        row.status = 'COMMITTED';
        await remember(row);
      }
      writeAutosave('aktif', this.git.snapshot());
      return commitId;
    } catch (err) {
      this.git.rollback(this.snapshot);
      this.restoreRefs();
      const row = journal.get(txId);
      if (row) {
        row.status = 'ROLLED_BACK';
        await remember(row);
      }
      if (this.vfsSnap && this.vfs && typeof this.vfs.reset === 'function') {
        this.vfs.reset({});
        this.vfs.load(this.vfsSnap);
      }
      throw err;
    }
  }
}
