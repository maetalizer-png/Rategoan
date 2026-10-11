const VOCAB_SIZE = 32000;
const SPECIALS = ['<|endoftext|>', '<|bos|>', '<|pad|>', '</s>', '\n\nPengguna:'];
const STOP = new Set(['<|endoftext|>', '</s>', '\n\nPengguna:']);

let cached = null;

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

function encodeBytes(text) {
  const shell = buildShell();
  const raw = new TextEncoder().encode(String(text));
  const word = new Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) word[i] = shell.byteToChar[raw[i]];
  while (word.length > 1) {
    let best = -1;
    let bestRank = Infinity;
    for (let i = 0; i < word.length - 1; i += 1) {
      const key = word[i] + ' ' + word[i + 1];
      const got = shell.rank.get(key);
      if (got != null && got < bestRank) {
        bestRank = got;
        best = i;
      }
    }
    if (best < 0) break;
    word.splice(best, 2, word[best] + word[best + 1]);
  }
  return word.map((tok) => shell.tokenToId.get(tok));
}

function pieceBytes(shell, token) {
  if (STOP.has(token) || token === '<|bos|>' || token === '<|pad|>') return null;
  const out = [];
  for (const ch of token) {
    const b = shell.charToByte.get(ch);
    if (b == null) return null;
    out.push(b);
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
  encodeBytes,
  decodeIds,
  eosIds,
  tokenizerDocument,
});
