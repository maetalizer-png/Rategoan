import { prepareSource } from './ast-heal.js';

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
      return commitId;
    } catch (err) {
      this.git.rollback(this.snapshot);
      this.restoreRefs();
      if (this.vfsSnap && this.vfs && typeof this.vfs.reset === 'function') {
        this.vfs.reset({});
        this.vfs.load(this.vfsSnap);
      }
      throw err;
    }
  }
}
