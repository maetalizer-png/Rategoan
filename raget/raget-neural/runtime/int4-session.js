import { bpeShell } from '../bpe-shell.js';
import { LLMSampler } from '../llm-sampler.js';
import { executeLayerPasses, probeGpu } from './webgpu-runner.js';

function parseSafetensors(buffer) {
  const view = new DataView(buffer);
  const headerLen = Number(view.getBigUint64(0, true));
  const headerBytes = new Uint8Array(buffer, 8, headerLen);
  const header = JSON.parse(new TextDecoder().decode(headerBytes));
  const dataStart = 8 + headerLen;
  const meta = header.__metadata__ || {};
  if (meta.format !== 'rategoan-int4-block32-affine') {
    throw new Error('bukan checkpoint int4 block-32');
  }
  return { buffer, header, dataStart, meta };
}

function viewOf(parsed, name) {
  const desc = parsed.header[name];
  if (!desc) throw new Error('tensor hilang ' + name);
  const start = parsed.dataStart + desc.data_offsets[0];
  const len = desc.data_offsets[1] - desc.data_offsets[0];
  if (desc.dtype === 'F32') return new Float32Array(parsed.buffer, start, len / 4);
  return new Uint8Array(parsed.buffer, start, len);
}

function dequantInto(packed, scales, zeros, n, dest) {
  for (let i = 0; i < n; i += 1) {
    const byte = packed[i >> 1];
    const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
    const b = i >> 5;
    dest[i] = (q - zeros[b]) * scales[b];
  }
}

function gemv(weight, rows, cols, x, y) {
  for (let r = 0; r < rows; r += 1) {
    let acc = 0;
    const row = r * cols;
    let c = 0;
    for (; c + 8 <= cols; c += 8) {
      acc += weight[row + c] * x[c]
        + weight[row + c + 1] * x[c + 1]
        + weight[row + c + 2] * x[c + 2]
        + weight[row + c + 3] * x[c + 3]
        + weight[row + c + 4] * x[c + 4]
        + weight[row + c + 5] * x[c + 5]
        + weight[row + c + 6] * x[c + 6]
        + weight[row + c + 7] * x[c + 7];
    }
    for (; c < cols; c += 1) acc += weight[row + c] * x[c];
    y[r] = acc;
  }
}

function rmsNorm(x, gamma, y) {
  let sum = 0;
  for (let i = 0; i < x.length; i += 1) sum += x[i] * x[i];
  const inv = 1 / Math.sqrt(sum / x.length + 1e-6);
  for (let i = 0; i < x.length; i += 1) y[i] = x[i] * inv * gamma[i];
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

export function openInt4Checkpoint(input) {
  let buffer;
  if (input instanceof ArrayBuffer) buffer = input;
  else if (input && input.byteOffset === 0 && input.byteLength === input.buffer.byteLength) buffer = input.buffer;
  else buffer = input.buffer.slice(input.byteOffset, input.byteOffset + input.byteLength);
  const parsed = parseSafetensors(buffer);
  const d = Number(parsed.meta.d_model);
  const layers = Number(parsed.meta.n_layers);
  const nHeads = Number(parsed.meta.n_heads);
  const nKv = Number(parsed.meta.n_kv_heads);
  const dk = Number(parsed.meta.head_dim);
  const ff = Number(parsed.meta.intermediate_size);
  const packedHead = viewOf(parsed, 'lm_head.weight');
  const fromTensor = d > 0 ? Math.floor((packedHead.length * 2) / d) : 0;
  const fromMeta = Number(parsed.meta.vocab) || 0;
  const vocab = Math.max(8, fromMeta && fromTensor ? Math.min(fromMeta, fromTensor) : (fromMeta || fromTensor || bpeShell.VOCAB_SIZE));
  const scratch = new Float32Array(Math.max(ff * d, nHeads * dk * d, 1));
  const gammaFinal = viewOf(parsed, 'final_norm.gamma');

  function project(name, rows, cols, x, y) {
    const n = rows * cols;
    dequantInto(viewOf(parsed, name), viewOf(parsed, name + '.scale'), viewOf(parsed, name + '.zero'), n, scratch);
    gemv(scratch, rows, cols, x, y);
  }

  function embed(id, y) {
    const cols = d;
    const packed = viewOf(parsed, 'embedding.weight');
    const scales = viewOf(parsed, 'embedding.weight.scale');
    const zeros = viewOf(parsed, 'embedding.weight.zero');
    const base = id * cols;
    for (let c = 0; c < cols; c += 1) {
      const i = base + c;
      const byte = packed[i >> 1] || 0;
      const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
      y[c] = (q - (zeros[i >> 5] || 0)) * (scales[i >> 5] || 0);
    }
  }

  function step(id, cache) {
    const x = new Float32Array(d);
    const h = new Float32Array(d);
    embed(id, x);
    executeLayerPasses(layers, (pass) => {
      const layer = pass.layer;
      const p = 'layers.' + layer + '.';
      rmsNorm(x, viewOf(parsed, p + 'ln1.gamma'), h);
      const q = new Float32Array(nHeads * dk);
      const k = new Float32Array(nKv * dk);
      const v = new Float32Array(nKv * dk);
      project(p + 'attention.Wq', nHeads * dk, d, h, q);
      project(p + 'attention.Wk', nKv * dk, d, h, k);
      project(p + 'attention.Wv', nKv * dk, d, h, v);
      cache[layer].k.push(k);
      cache[layer].v.push(v);
      const mixed = new Float32Array(nHeads * dk);
      const seq = cache[layer].k.length;
      const scale = 1 / Math.sqrt(dk);
      const group = nHeads / nKv;
      for (let head = 0; head < nHeads; head += 1) {
        const kv = Math.floor(head / group);
        let max = -Infinity;
        const scores = new Float32Array(seq);
        for (let s = 0; s < seq; s += 1) {
          let dot = 0;
          const kk = cache[layer].k[s];
          for (let j = 0; j < dk; j += 1) dot += q[head * dk + j] * kk[kv * dk + j];
          scores[s] = dot * scale;
          if (scores[s] > max) max = scores[s];
        }
        let den = 0;
        for (let s = 0; s < seq; s += 1) {
          scores[s] = Math.exp(scores[s] - max);
          den += scores[s];
        }
        for (let j = 0; j < dk; j += 1) {
          let acc = 0;
          for (let s = 0; s < seq; s += 1) acc += (scores[s] / den) * cache[layer].v[s][kv * dk + j];
          mixed[head * dk + j] = acc;
        }
      }
      const attn = new Float32Array(d);
      project(p + 'attention.Wo', d, nHeads * dk, mixed, attn);
      addInto(x, attn);
      rmsNorm(x, viewOf(parsed, p + 'ln2.gamma'), h);
      const gate = new Float32Array(ff);
      const up = new Float32Array(ff);
      const hidden = new Float32Array(ff);
      project(p + 'ffn.Wgate', ff, d, h, gate);
      project(p + 'ffn.Wup', ff, d, h, up);
      siluMul(gate, up, hidden);
      const down = new Float32Array(d);
      project(p + 'ffn.Wdown', d, ff, hidden, down);
      addInto(x, down);
    });
    rmsNorm(x, gammaFinal, h);
    const logits = new Float32Array(vocab);
    const packed = viewOf(parsed, 'lm_head.weight');
    const scales = viewOf(parsed, 'lm_head.weight.scale');
    const zeros = viewOf(parsed, 'lm_head.weight.zero');
    for (let idOut = 0; idOut < vocab; idOut += 1) {
      let acc = 0;
      const base = idOut * d;
      for (let c = 0; c < d; c += 1) {
        const i = base + c;
        const byte = packed[i >> 1] || 0;
        const q = (i & 1) ? ((byte >>> 4) & 15) : (byte & 15);
        acc += ((q - (zeros[i >> 5] || 0)) * (scales[i >> 5] || 0)) * h[c];
      }
      logits[idOut] = acc;
    }
    return logits;
  }

  return {
    trained: parsed.meta.trained === 'true',
    tier: parsed.meta.tier,
    vocab: vocab,
    async generate(text, options) {
      const opts = options || {};
      const requested = Number(opts.maxNewTokens) > 0 ? Number(opts.maxNewTokens) : 32;
      const maxNew = Math.max(1, Math.min(128, requested));
      const promptCap = Number(opts.maxPromptTokens) > 0 ? Number(opts.maxPromptTokens) : 256;
      const ids = encodePrompt(text, promptCap);
      if (!ids.length) ids.push(1);
      const cache = [];
      for (let i = 0; i < layers; i += 1) cache.push({ k: [], v: [] });
      const gpu = await probeGpu();
      const device = gpu && gpu.ok ? 'webgpu-jadwal+cpu-gemv' : 'cpu-gemv';
      const eos = new Set(bpeShell.eosIds());
      let logits = null;
      for (let i = 0; i < ids.length; i += 1) {
        if (opts.signal && opts.signal.aborted) break;
        logits = step(ids[i], cache);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      const generated = [];
      const recent = ids.slice();
      let shown = '';
      for (let n = 0; n < maxNew; n += 1) {
        if (opts.signal && opts.signal.aborted) break;
        if (!logits) break;
        const next = pickToken(logits, opts, recent);
        if (!Number.isInteger(next) || next < 0 || next >= vocab || eos.has(next)) break;
        generated.push(next);
        recent.push(next);
        const full = bpeShell.decodeIds(generated);
        const piece = full.slice(shown.length);
        shown = full;
        if (piece && typeof opts.onToken === 'function') opts.onToken(piece, next);
        logits = step(next, cache);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return {
        text: shown,
        tokenIds: generated,
        trained: parsed.meta.trained === 'true',
        device: device,
        vocab: vocab,
      };
    },
  };
}
