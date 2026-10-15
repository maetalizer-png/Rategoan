const VOCAB_SIZE = 32000;
const SPECIALS = ['<|endoftext|>', '<|bos|>', '<|pad|>', '</s>', '\n\nPengguna:'];
const STOP = new Set(['<|endoftext|>', '</s>', '\n\nPengguna:']);

let cached = null;
let customShell = null;

function bytesToUnicode() {
  const bs = [];
  for (let i = 33; i <= 126; i += 1) bs.push(i);
  for (let i = 161; i <= 172; i += 1) bs.push(i);
  for (let i = 174; i <= 255; i += 1) bs.push(i);
  const cs = bs.slice();
  let n = 0;
  for (let b = 0; b < 256; b += 1) {
    if (bs.indexOf(b) === -1) {
      bs.push(b);
      cs.push(256 + n);
      n += 1;
    }
  }
  const byteToChar = new Array(256);
  const charToByte = new Map();
  for (let i = 0; i < bs.length; i += 1) {
    const ch = String.fromCharCode(cs[i]);
    byteToChar[bs[i]] = ch;
    charToByte.set(ch, bs[i]);
  }
  return { byteToChar, charToByte };
}

function buildShell() {
  if (customShell) return customShell;
  if (cached) return cached;
  const { byteToChar, charToByte } = bytesToUnicode();
  const idToToken = [];
  const tokenToId = new Map();
  SPECIALS.forEach((tok) => {
    tokenToId.set(tok, idToToken.length);
    idToToken.push(tok);
  });
  for (let b = 0; b < 256; b += 1) {
    const tok = byteToChar[b];
    if (!tokenToId.has(tok)) {
      tokenToId.set(tok, idToToken.length);
      idToToken.push(tok);
    }
  }
  const merges = [];
  for (let i = 0; i < 256 && idToToken.length < VOCAB_SIZE; i += 1) {
    for (let j = 0; j < 256 && idToToken.length < VOCAB_SIZE; j += 1) {
      const merged = byteToChar[i] + byteToChar[j];
      if (tokenToId.has(merged)) continue;
      tokenToId.set(merged, idToToken.length);
      idToToken.push(merged);
      merges.push(byteToChar[i] + ' ' + byteToChar[j]);
    }
  }
  if (idToToken.length !== VOCAB_SIZE) {
    throw new Error('[BpeShell] vocab ' + idToToken.length);
  }
  const rank = new Map();
  merges.forEach((pair, index) => rank.set(pair, index));
  cached = { idToToken, tokenToId, merges, rank, byteToChar, charToByte };
  return cached;
}

function loadCustomVocabulary(spec) {
  if (!spec || typeof spec !== 'object') return buildShell();
  const { byteToChar, charToByte } = bytesToUnicode();
  const idToToken = [];
  const tokenToId = new Map();
  if (Array.isArray(spec.vocab)) {
    for (let i = 0; i < spec.vocab.length; i += 1) {
      const tok = String(spec.vocab[i] ?? '');
      idToToken.push(tok);
      if (!tokenToId.has(tok)) tokenToId.set(tok, i);
    }
  } else if (spec.vocab && typeof spec.vocab === 'object') {
    const entries = Object.entries(spec.vocab).sort((a, b) => Number(a[1]) - Number(b[1]));
    for (let i = 0; i < entries.length; i += 1) {
      const [tok, id] = entries[i];
      const idx = Number.isInteger(Number(id)) ? Number(id) : idToToken.length;
      idToToken[idx] = String(tok);
      tokenToId.set(String(tok), idx);
    }
  }
  if (!idToToken.length) return buildShell();
  SPECIALS.forEach((tok) => {
    if (!tokenToId.has(tok)) {
      tokenToId.set(tok, idToToken.length);
      idToToken.push(tok);
    }
  });
  for (let b = 0; b < 256; b += 1) {
    const tok = byteToChar[b];
    if (!tokenToId.has(tok)) {
      tokenToId.set(tok, idToToken.length);
      idToToken.push(tok);
    }
  }
  const merges = Array.isArray(spec.merges) ? spec.merges.map((m) => (Array.isArray(m) ? m.join(' ') : String(m))) : [];
  const rank = new Map();
  merges.forEach((pair, index) => rank.set(pair, index));
  customShell = { idToToken, tokenToId, merges, rank, byteToChar, charToByte, custom: true };
  return customShell;
}

function resetVocabulary() {
  customShell = null;
  return buildShell();
}

function encodeBytes(text) {
  const shell = buildShell();
  const raw = new TextEncoder().encode(String(text));
  if (raw.length < 2) {
    const out = new Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) out[i] = shell.tokenToId.get(shell.byteToChar[raw[i]]);
    return out;
  }
  const tok = new Array(raw.length);
  const prev = new Array(raw.length);
  const next = new Array(raw.length);
  const alive = new Array(raw.length);
  const ver = new Array(raw.length).fill(0);
  for (let i = 0; i < raw.length; i += 1) {
    tok[i] = shell.byteToChar[raw[i]];
    prev[i] = i - 1;
    next[i] = i + 1 < raw.length ? i + 1 : -1;
    alive[i] = 1;
  }
  const heap = [];
  function better(a, b) {
    if (a.rank !== b.rank) return a.rank < b.rank;
    return a.i < b.i;
  }
  function up(n) {
    while (n > 0) {
      const p = (n - 1) >> 1;
      if (!better(heap[n], heap[p])) break;
      const swap = heap[n];
      heap[n] = heap[p];
      heap[p] = swap;
      n = p;
    }
  }
  function down(n) {
    for (;;) {
      let m = n;
      const l = n * 2 + 1;
      const r = l + 1;
      if (l < heap.length && better(heap[l], heap[m])) m = l;
      if (r < heap.length && better(heap[r], heap[m])) m = r;
      if (m === n) break;
      const swap = heap[n];
      heap[n] = heap[m];
      heap[m] = swap;
      n = m;
    }
  }
  function push(i) {
    if (i < 0 || next[i] < 0 || !alive[i] || !alive[next[i]]) return;
    const got = shell.rank.get(tok[i] + ' ' + tok[next[i]]);
    if (got == null) return;
    ver[i] += 1;
    heap.push({ rank: got, i: i, v: ver[i] });
    up(heap.length - 1);
  }
  function pop() {
    if (!heap.length) return null;
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      down(0);
    }
    return top;
  }
  for (let i = 0; i < raw.length - 1; i += 1) push(i);
  while (heap.length) {
    const item = pop();
    if (!item) break;
    const i = item.i;
    const j = next[i];
    if (j < 0 || !alive[i] || !alive[j] || item.v !== ver[i]) continue;
    if (shell.rank.get(tok[i] + ' ' + tok[j]) !== item.rank) continue;
    tok[i] = tok[i] + tok[j];
    alive[j] = 0;
    next[i] = next[j];
    if (next[i] >= 0) prev[next[i]] = i;
    if (prev[i] >= 0) push(prev[i]);
    push(i);
  }
  const out = [];
  for (let i = 0; i >= 0; i = next[i]) {
    if (alive[i]) out.push(shell.tokenToId.get(tok[i]));
  }
  return out;
}

function pieceBytes(shell, token) {
  if (STOP.has(token) || token === '<|bos|>' || token === '<|pad|>') return null;
  const out = [];
  for (const ch of token) {
    const b = shell.charToByte.get(ch);
    if (b == null) {
      const utf8 = new TextEncoder().encode(ch);
      for (let k = 0; k < utf8.length; k += 1) out.push(utf8[k]);
    } else {
      out.push(b);
    }
  }
  return Uint8Array.from(out);
}

function decodeIds(ids) {
  const shell = buildShell();
  const parts = [];
  for (let i = 0; i < ids.length; i += 1) {
    const tok = shell.idToToken[ids[i]];
    if (tok == null) continue;
    if (STOP.has(tok)) break;
    const bytes = pieceBytes(shell, tok);
    if (bytes) parts.push(bytes);
  }
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const flat = new Uint8Array(total);
  let at = 0;
  parts.forEach((part) => {
    flat.set(part, at);
    at += part.length;
  });
  return new TextDecoder('utf-8', { fatal: false }).decode(flat);
}

function eosIds() {
  const shell = buildShell();
  return SPECIALS.filter((tok) => STOP.has(tok)).map((tok) => shell.tokenToId.get(tok));
}

function tokenizerDocument() {
  const shell = buildShell();
  const vocab = {};
  shell.idToToken.forEach((tok, id) => { vocab[tok] = id; });
  return {
    version: '1.0',
    truncation: null,
    padding: null,
    added_tokens: SPECIALS.map((tok) => ({
      id: shell.tokenToId.get(tok),
      content: tok,
      single_word: false,
      lstrip: false,
      rstrip: false,
      normalized: false,
      special: true,
    })),
    normalizer: null,
    pre_tokenizer: { type: 'ByteLevel', add_prefix_space: false, trim_offsets: true, use_regex: false },
    post_processor: { type: 'ByteLevel', add_prefix_space: false, trim_offsets: true, use_regex: false },
    decoder: { type: 'ByteLevel', add_prefix_space: false, trim_offsets: true, use_regex: false },
    model: {
      type: 'BPE',
      dropout: null,
      unk_token: null,
      continuing_subword_prefix: '',
      end_of_word_suffix: '',
      fuse_unk: false,
      byte_fallback: false,
      ignore_merges: false,
      vocab,
      merges: shell.merges,
    },
  };
}

export const bpeShell = Object.freeze({
  VOCAB_SIZE,
  SPECIALS,
  buildShell,
  loadCustomVocabulary,
  resetVocabulary,
  encodeBytes,
  decodeIds,
  eosIds,
  tokenizerDocument,
});
