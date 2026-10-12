import { bpeShell } from '../bpe-shell.js';
import { LLMSampler } from '../llm-sampler.js';
import { gemvInt4, planLayerPasses, probeGpu } from './webgpu-runner.js';

function parseHeader(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const headerLen = Number(view.getBigUint64(0, true));
  if (bytes.length < 8 + headerLen) throw new Error('header terpotong');
  const headerBytes = bytes.subarray(8, 8 + headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  const meta = header.__metadata__ || {};
  if (meta.format !== 'rategoan-int4-block32-affine') throw new Error('bukan checkpoint int4 block-32');
  return { header: header, dataStart: 8 + headerLen, meta: meta };
}

function asF32(raw) {
  if ((raw.byteOffset % 4) === 0 && (raw.byteLength % 4) === 0) {
    return new Float32Array(raw.buffer, raw.byteOffset, raw.byteLength / 4);
  }
  const copy = new Uint8Array(raw.byteLength);
  copy.set(raw);
  return new Float32Array(copy.buffer);
}

async function yieldThread() {
  if (typeof document === 'undefined') return;
  const host = globalThis.scheduler;
  if (host && typeof host.yield === 'function') {
    await host.yield();
    return;
  }
  await new Promise((resolve) => setTimeout(resolve, 0));
}

function rmsNorm(x, gamma, y) {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += x[i] * x[i];
  const inv = 1 / Math.sqrt(sum / x.length + 1e-6);
  for (let i = 0; i < x.length; i += 1) y[i] = x[i] * inv * (gamma[i] || 1);
}

function siluMul(gate, up, y) {
  for (let i = 0; i < gate.length; i += 1) {
    const g = gate[i];
    y[i] = (g / (1 + Math.exp(-g))) * up[i];
  }
}

function addInto(dst, src) {
  for (let i = 0; i < dst.length; i += 1) dst[i] += src[i];
}

function encodePrompt(text, limit) {
  const ids = bpeShell.encodeBytes(String(text || ''));
  const cap = Math.max(1, limit || 256);
  if (ids.length <= cap) return ids;
  return ids.slice(ids.length - cap);
}

function pickToken(logits, opts, recent) {
  const row = Array.from(logits);
  const temperature = Number(opts && opts.temperature);
  if (!(temperature > 0)) return LLMSampler.greedySample(row);
  return LLMSampler.sampleAdaptive(row, {
    temperature: temperature,
    topK: (opts && opts.topK) || LLMSampler.SAMPLE_DEFAULTS.topK,
    topP: opts && typeof opts.topP === 'number' ? opts.topP : LLMSampler.SAMPLE_DEFAULTS.topP,
    repetitionPenalty: opts && typeof opts.repetitionPenalty === 'number' ? opts.repetitionPenalty : LLMSampler.SAMPLE_DEFAULTS.repetitionPenalty,
    recentTokenIds: recent,
  });
}

function locate(parsed, name) {
  const desc = parsed.header[name];
  if (!desc) throw new Error('tensor hilang ' + name);
  return {
    start: parsed.dataStart + desc.data_offsets[0],
    len: desc.data_offsets[1] - desc.data_offsets[0],
    f32: desc.dtype === 'F32',
  };
}

function gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, signal) {
  for (let r = 0; r < rows; r += 1) {
    if ((r & 511) === 0 && signal && signal.aborted) return false;
    let acc = 0;
    const rBase = r * cols;
    let c = 0;
    for (; c + 8 <= cols; c += 8) {
      for (let k = 0; k < 8; k += 1) {
        const i = rBase + c + k;
        const byte = packed[i >> 1] || 0;
        const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
        const blk = i >> 5;
        acc += (q - (zeros[blk] || 0)) * (scales[blk] || 0) * x[c + k];
      }
    }
    for (; c < cols; c += 1) {
      const i = rBase + c;
      const byte = packed[i >> 1] || 0;
      const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
      const blk = i >> 5;
      acc += (q - (zeros[blk] || 0)) * (scales[blk] || 0) * x[c];
    }
    y[r] = acc;
  }
  return true;
}

function buildSession(parsed, readBytes) {
  const d = Number(parsed.meta.d_model);
  const layers = Number(parsed.meta.n_layers);
  const nHeads = Number(parsed.meta.n_heads);
  const nKv = Number(parsed.meta.n_kv_heads);
  const dk = Number(parsed.meta.head_dim);
  const ff = Number(parsed.meta.intermediate_size);
  const fromMeta = Number(parsed.meta.vocab) || 0;
  const headLoc = locate(parsed, 'lm_head.weight');
  const fromTensor = d > 0 ? Math.floor((headLoc.len * 2) / d) : 0;
  const vocab = Math.max(8, fromMeta && fromTensor ? Math.min(fromMeta, fromTensor) : (fromMeta || fromTensor || bpeShell.VOCAB_SIZE));
  const small = new Map();
  let usedGpu = false;

  async function tensorU8(name) {
    const loc = locate(parsed, name);
    return readBytes(loc.start, loc.len);
  }

  async function tensorF32(name) {
    if (small.has(name)) return small.get(name);
    const loc = locate(parsed, name);
    const view = asF32(await readBytes(loc.start, loc.len));
    if (view.byteLength <= 65536) small.set(name, view);
    return view;
  }

  async function project(name, rows, cols, x, y, signal) {
    const packed = await tensorU8(name);
    const scales = await tensorF32(name + '.scale');
    const zeros = await tensorF32(name + '.zero');
    const gpuY = await gemvInt4(packed, scales, zeros, x, rows, cols);
    if (gpuY && gpuY.length >= rows) {
      for (let i = 0; i < rows; i += 1) y[i] = gpuY[i];
      usedGpu = true;
      return true;
    }
    if (signal && signal.aborted) return false;
    return gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, signal);
  }

  async function embed(id, y) {
    const loc = locate(parsed, 'embedding.weight');
    const scaleLoc = locate(parsed, 'embedding.weight.scale');
    const zeroLoc = locate(parsed, 'embedding.weight.zero');
    const rowBytes = Math.ceil(d / 2);
    const packed = await readBytes(loc.start + ((id * d) >> 1), rowBytes);
    const block0 = (id * d) >> 5;
    const blocks = Math.max(1, Math.ceil(d / 32));
    const scales = asF32(await readBytes(scaleLoc.start + block0 * 4, blocks * 4));
    const zeros = asF32(await readBytes(zeroLoc.start + block0 * 4, blocks * 4));
    for (let c = 0; c < d; c += 1) {
      const byte = packed[c >> 1] || 0;
      const q = (c & 1) ? ((byte >>> 4) & 15) : (byte & 15);
      const b = c >> 5;
      y[c] = (q - (zeros[b] || 0)) * (scales[b] || 0);
    }
  }

  function atKv(vec, index) {
    if (vec && vec.q) return vec.min + (vec.q[index] + 128) * vec.scale;
    return vec[index];
  }

  function packKv(vec) {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < vec.length; i += 1) {
      if (vec[i] < min) min = vec[i];
      if (vec[i] > max) max = vec[i];
    }
    if (!Number.isFinite(min)) min = 0;
    if (!Number.isFinite(max)) max = 0;
    const scale = (max - min) / 255 || 1;
    const q = new Int8Array(vec.length);
    for (let i = 0; i < vec.length; i += 1) {
      const u = Math.round((vec[i] - min) / scale);
      q[i] = Math.max(-128, Math.min(127, u - 128));
    }
    return { q: q, scale: scale, min: min };
  }

  function attend(q, cache, layer, mixed) {
    const seq = cache[layer].k.length;
    const scale = 1 / Math.sqrt(dk);
    const group = nHeads / nKv;
    for (let head = 0; head < nHeads; head += 1) {
      const kv = Math.floor(head / group);
      const base = head * dk;
      const kBase = kv * dk;
      let max = -Infinity;
      let sum = 0;
      for (let j = 0; j < dk; j += 1) mixed[base + j] = 0;
      for (let s = 0; s < seq; s += 1) {
        const kk = cache[layer].k[s];
        const vv = cache[layer].v[s];
        let score = 0;
        for (let j = 0; j < dk; j += 1) score += q[base + j] * scale * atKv(kk, kBase + j);
        const next = score > max ? score : max;
        const alpha = max === -Infinity ? 0 : Math.exp(max - next);
        const weight = Math.exp(score - next);
        sum = sum * alpha + weight;
        for (let j = 0; j < dk; j += 1) mixed[base + j] = mixed[base + j] * alpha + weight * atKv(vv, kBase + j);
        max = next;
      }
      const inv = sum ? 1 / sum : 0;
      for (let j = 0; j < dk; j += 1) mixed[base + j] *= inv;
    }
  }

  async function step(id, cache, signal, limit, kvInt8) {
    const x = new Float32Array(d);
    const h = new Float32Array(d);
    const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
    await embed(id, x);
    const passes = planLayerPasses(limit);
    for (let p = 0; p < passes.length; p += 1) {
      if (signal && signal.aborted) return null;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (now - started > 120000) return null;
      const layer = passes[p].layer;
      const prefix = 'layers.' + layer + '.';
      rmsNorm(x, await tensorF32(prefix + 'ln1.gamma'), h);
      const q = new Float32Array(nHeads * dk);
      const k = new Float32Array(nKv * dk);
      const v = new Float32Array(nKv * dk);
      if (!await project(prefix + 'attention.Wq', nHeads * dk, d, h, q, signal)) return null;
      if (!await project(prefix + 'attention.Wk', nKv * dk, d, h, k, signal)) return null;
      if (!await project(prefix + 'attention.Wv', nKv * dk, d, h, v, signal)) return null;
      cache[layer].k.push(kvInt8 ? packKv(k) : k);
      cache[layer].v.push(kvInt8 ? packKv(v) : v);
      const mixed = new Float32Array(nHeads * dk);
      attend(q, cache, layer, mixed);
      const attn = new Float32Array(d);
      if (!await project(prefix + 'attention.Wo', d, nHeads * dk, mixed, attn, signal)) return null;
      addInto(x, attn);
      rmsNorm(x, await tensorF32(prefix + 'ln2.gamma'), h);
      const gate = new Float32Array(ff);
      const up = new Float32Array(ff);
      const hidden = new Float32Array(ff);
      if (!await project(prefix + 'ffn.Wgate', ff, d, h, gate, signal)) return null;
      if (!await project(prefix + 'ffn.Wup', ff, d, h, up, signal)) return null;
      siluMul(gate, up, hidden);
      const down = new Float32Array(d);
      if (!await project(prefix + 'ffn.Wdown', d, ff, hidden, down, signal)) return null;
      addInto(x, down);
      await yieldThread();
    }
    if (signal && signal.aborted) return null;
    rmsNorm(x, await tensorF32('final_norm.gamma'), h);
    const logits = new Float32Array(vocab);
    if (!await project('lm_head.weight', vocab, d, h, logits, signal)) return null;
    return logits;
  }

  return {
    trained: parsed.meta.trained === 'true',
    tier: parsed.meta.tier,
    vocab: vocab,
    layers: layers,
    async generate(text, options) {
      const opts = options || {};
      usedGpu = false;
      const requested = Number(opts.maxNewTokens) > 0 ? Number(opts.maxNewTokens) : 32;
      const maxNew = Math.max(1, Math.min(128, requested));
      const limit = opts.maxLayers > 0 ? Math.min(layers, Math.floor(opts.maxLayers)) : layers;
      const promptCap = Number(opts.maxPromptTokens) > 0 ? Number(opts.maxPromptTokens) : 256;
      const ids = encodePrompt(text, promptCap);
      if (!ids.length) ids.push(1);
      const cache = [];
      for (let i = 0; i < limit; i += 1) cache.push({ k: [], v: [] });
      const eos = new Set(bpeShell.eosIds());
      let logits = null;
      for (let i = 0; i < ids.length; i += 1) {
        if (opts.signal && opts.signal.aborted) break;
        logits = await step(ids[i], cache, opts.signal, limit, opts.kvInt8 === true);
        if (!logits) break;
      }
      const generated = [];
      const recent = ids.slice();
      let shown = '';
      for (let n = 0; logits && n < maxNew; n += 1) {
        if (opts.signal && opts.signal.aborted) break;
        const next = pickToken(logits, opts, recent);
        if (!Number.isInteger(next) || next < 0 || next >= vocab || eos.has(next)) break;
        generated.push(next);
        recent.push(next);
        const full = bpeShell.decodeIds(generated);
        const piece = full.slice(shown.length);
        shown = full;
        if (piece && typeof opts.onToken === 'function') opts.onToken(piece, next);
        if (opts.signal && opts.signal.aborted) break;
        logits = await step(next, cache, opts.signal, limit);
      }
      return {
        text: shown,
        tokenIds: generated,
        trained: parsed.meta.trained === 'true',
        device: (usedGpu ? 'webgpu-gemv' : 'cpu-gemv') + '+lapis' + limit,
        vocab: vocab,
      };
    },
  };
}

export function openInt4Checkpoint(input) {
  let buffer;
  if (input instanceof ArrayBuffer) buffer = input;
  else if (input && input.byteOffset === 0 && input.byteLength === input.buffer.byteLength) buffer = input.buffer;
  else buffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  const parsed = parseHeader(new Uint8Array(buffer));
  return buildSession(parsed, async (start, len) => new Uint8Array(buffer, start, len));
}

export async function openInt4Stream(reader) {
  const prefix = await reader.read(0, 8);
  const headerLen = Number(new DataView(prefix.buffer, prefix.byteOffset, prefix.byteLength).getBigUint64(0, true));
  const fileHead = await reader.read(0, 8 + headerLen);
  const parsed = parseHeader(fileHead);
  return buildSession(parsed, (start, len) => reader.read(start, len));
}

export async function probeSessionGpu() {
  return probeGpu();
}
