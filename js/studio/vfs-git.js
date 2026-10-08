function rotr(n, x) {
  return (x >>> n) | (x << (32 - n));
}

const K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

export function sha256Sync(input) {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input;
  const bitHi = Math.floor((bytes.length * 8) / 0x100000000);
  const bitLo = (bytes.length * 8) >>> 0;
  const withOne = bytes.length + 1;
  const mod = withOne % 64;
  const pad = mod <= 56 ? 56 - mod : 120 - mod;
  const buf = new Uint8Array(withOne + pad + 8);
  buf.set(bytes);
  buf[bytes.length] = 0x80;
  const view = new DataView(buf.buffer);
  view.setUint32(buf.length - 8, bitHi);
  view.setUint32(buf.length - 4, bitLo);
  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Uint32Array(64);
  for (let i = 0; i < buf.length; i += 64) {
    for (let t = 0; t < 16; t += 1) w[t] = view.getUint32(i + t * 4);
    for (let t = 16; t < 64; t += 1) {
      const s0 = rotr(7, w[t - 15]) ^ rotr(18, w[t - 15]) ^ (w[t - 15] >>> 3);
      const s1 = rotr(17, w[t - 2]) ^ rotr(19, w[t - 2]) ^ (w[t - 2] >>> 10);
      w[t] = (w[t - 16] + s0 + w[t - 7] + s1) >>> 0;
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;
    for (let t = 0; t < 64; t += 1) {
      const s1 = rotr(6, e) ^ rotr(11, e) ^ rotr(25, e);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + K[t] + w[t]) >>> 0;
      const s0 = rotr(2, a) ^ rotr(13, a) ^ rotr(22, a);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7].map((n) => n.toString(16).padStart(8, '0')).join('');
}

export class VfsGit {
  constructor(seed = {}) {
    this.blobs = new Map();
    this.trees = new Map();
    this.commits = new Map();
    this.refs = new Map([['HEAD', ''], ['main', '']]);
    this.worktree = new Map();
    Object.keys(seed).forEach((path) => this.stage(path, seed[path]));
  }

  snapshot() {
    return new Map(this.worktree);
  }

  restore(snap) {
    this.worktree = new Map(snap || []);
  }

  rollback(snap) {
    this.restore(snap);
  }

  stage(path, content) {
    const body = String(content == null ? '' : content);
    const hash = sha256Sync(body);
    this.blobs.set(hash, body);
    this.worktree.set(String(path), body);
    return hash;
  }

  treeHash() {
    const names = Array.from(this.worktree.keys()).sort();
    const tree = {};
    const rows = names.map((path) => {
      const hash = sha256Sync(this.worktree.get(path));
      this.blobs.set(hash, this.worktree.get(path));
      tree[path] = hash;
      return path + '\0' + hash;
    });
    const hash = sha256Sync(rows.join('\n'));
    this.trees.set(hash, tree);
    return hash;
  }

  casRef(refName, expectedCommit, newCommit) {
    const current = this.refs.get(refName) || '';
    if (expectedCommit !== null && current !== expectedCommit) {
      throw new Error('CAS Ref Conflict on ' + refName + ': expected ' + expectedCommit + ', got ' + current);
    }
    this.refs.set(refName, newCommit);
    return true;
  }

  reset(seed = {}) {
    this.blobs = new Map();
    this.trees = new Map();
    this.commits = new Map();
    this.refs = new Map([['HEAD', ''], ['main', '']]);
    this.worktree = new Map();
    Object.keys(seed).forEach((path) => this.stage(path, seed[path]));
  }

  commit(msg, opts) {
    const tree = this.treeHash();
    const parent = this.refs.get('HEAD') || '';
    const time = Date.now();
    const note = String(msg || '');
    const id = sha256Sync(JSON.stringify({ tree, parent, msg: note, time }));
    this.commits.set(id, { id, msg: note, tree, parent, time });
    if (!(opts && opts.moveRefs === false)) {
      this.refs.set('HEAD', id);
      this.refs.set('main', id);
    }
    return id;
  }

  head() {
    return this.commits.get(this.refs.get('HEAD') || '') || null;
  }

  toJSON() {
    return {
      head: this.refs.get('HEAD') || '',
      main: this.refs.get('main') || '',
      blobs: this.blobs.size,
      trees: this.trees.size,
      commits: Array.from(this.commits.values()),
    };
  }
}
