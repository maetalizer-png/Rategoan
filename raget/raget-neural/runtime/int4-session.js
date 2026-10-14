import { bpeShell } from '../bpe-shell.js';
import { LLMSampler } from '../llm-sampler.js';
import { gemvInt4, planLayerPasses, probeGpu, chainEncoderPlan, probeShaderF16, gemvInt4Chain } from './webgpu-runner.js';
import { verifyDraft } from './speculative-engine.js';
import { createKvWindow } from '../core/kv-policy.js';
import { armWatchdog } from './pipeline-watchdog.js';

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
  const temperature = Number(opts && opts.temperature);
  if (!(temperature > 0) && (!recent || !recent.length || !(Number(opts && opts.repetitionPenalty) > 1))) {
    let bestId = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < logits.length; i += 1) {
      if (logits[i] > bestVal) {
        bestVal = logits[i];
        bestId = i;
      }
    }
    return bestId;
  }
  const row = Array.from(logits);
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

export function gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, signal, lora, blockStride) {
  const stride = blockStride > 1 ? (blockStride | 0) : 1;
  const nBlocksCol = cols >>> 5;
  const xBlockSum = ((cols & 31) === 0 && nBlocksCol > 0) ? new Float32Array(nBlocksCol) : null;
  if (xBlockSum) {
    for (let bc = 0; bc < nBlocksCol; bc += stride) {
      const c0 = bc << 5;
      let s = 0;
      for (let j = 0; j < 32; j += 4) {
        s += x[c0 + j] + x[c0 + j + 1] + x[c0 + j + 2] + x[c0 + j + 3];
      }
      xBlockSum[bc] = s;
    }
  }
  const pLen = packed.length;
  const words32 = (packed.byteOffset % 4 === 0 && (packed.byteLength & 3) === 0)
    ? new Uint32Array(packed.buffer, packed.byteOffset, packed.byteLength >>> 2)
    : null;
  const wLen = words32 ? words32.length : 0;
  const cStep = stride << 5;
  const wStep = stride << 2;
  const pStep = stride << 4;
  for (let r = 0; r < rows; r += 1) {
    if ((r & 511) === 0 && signal && signal.aborted) return false;
    let acc = 0;
    const rBase = r * cols;
    let c = 0;
    if (xBlockSum && ((rBase & 31) === 0)) {
      let blk = rBase >>> 5;
      let pBase = rBase >>> 1;
      if (words32 && ((pBase & 3) === 0)) {
        let wBase = pBase >>> 2;
        for (let bc = 0; bc < nBlocksCol; bc += stride, c += cStep, blk += stride, wBase += wStep) {
          const s = scales[blk] || 0;
          if (s !== 0 && wBase + 4 <= wLen) {
            const z = zeros[blk] || 0;
            const w0 = words32[wBase];
            const w1 = words32[wBase + 1];
            const w2 = words32[wBase + 2];
            const w3 = words32[wBase + 3];
            const dotQ = (w0 & 15) * x[c] + ((w0 >>> 4) & 15) * x[c + 1]
              + ((w0 >>> 8) & 15) * x[c + 2] + ((w0 >>> 12) & 15) * x[c + 3]
              + ((w0 >>> 16) & 15) * x[c + 4] + ((w0 >>> 20) & 15) * x[c + 5]
              + ((w0 >>> 24) & 15) * x[c + 6] + (w0 >>> 28) * x[c + 7]
              + (w1 & 15) * x[c + 8] + ((w1 >>> 4) & 15) * x[c + 9]
              + ((w1 >>> 8) & 15) * x[c + 10] + ((w1 >>> 12) & 15) * x[c + 11]
              + ((w1 >>> 16) & 15) * x[c + 12] + ((w1 >>> 20) & 15) * x[c + 13]
              + ((w1 >>> 24) & 15) * x[c + 14] + (w1 >>> 28) * x[c + 15]
              + (w2 & 15) * x[c + 16] + ((w2 >>> 4) & 15) * x[c + 17]
              + ((w2 >>> 8) & 15) * x[c + 18] + ((w2 >>> 12) & 15) * x[c + 19]
              + ((w2 >>> 16) & 15) * x[c + 20] + ((w2 >>> 20) & 15) * x[c + 21]
              + ((w2 >>> 24) & 15) * x[c + 22] + (w2 >>> 28) * x[c + 23]
              + (w3 & 15) * x[c + 24] + ((w3 >>> 4) & 15) * x[c + 25]
              + ((w3 >>> 8) & 15) * x[c + 26] + ((w3 >>> 12) & 15) * x[c + 27]
              + ((w3 >>> 16) & 15) * x[c + 28] + ((w3 >>> 20) & 15) * x[c + 29]
              + ((w3 >>> 24) & 15) * x[c + 30] + (w3 >>> 28) * x[c + 31];
            acc += (dotQ - z * xBlockSum[bc]) * s;
          }
        }
        c = nBlocksCol << 5;
      } else {
        for (let bc = 0; bc < nBlocksCol; bc += stride, c += cStep, blk += stride, pBase += pStep) {
          const s = scales[blk] || 0;
          if (s !== 0) {
            const z = zeros[blk] || 0;
            let dotQ = 0;
            if (pBase + 16 <= pLen) {
              for (let b = 0; b < 16; b += 4) {
                const b0 = packed[pBase + b];
                const b1 = packed[pBase + b + 1];
                const b2 = packed[pBase + b + 2];
                const b3 = packed[pBase + b + 3];
                const k = c + (b << 1);
                dotQ += (b0 & 15) * x[k] + (b0 >>> 4) * x[k + 1]
                  + (b1 & 15) * x[k + 2] + (b1 >>> 4) * x[k + 3]
                  + (b2 & 15) * x[k + 4] + (b2 >>> 4) * x[k + 5]
                  + (b3 & 15) * x[k + 6] + (b3 >>> 4) * x[k + 7];
              }
            } else {
              for (let b = 0; b < 16; b += 1) {
                const byte = packed[pBase + b] || 0;
                const k = c + (b << 1);
                dotQ += (byte & 15) * x[k] + ((byte >>> 4) & 15) * x[k + 1];
              }
            }
            acc += (dotQ - z * xBlockSum[bc]) * s;
          }
        }
        c = nBlocksCol << 5;
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
  if (lora && lora.A && lora.B) applyLoraDelta(y, x, lora);
  return true;
}

export function applyLoraDelta(y, x, lora) {
  const rank = Math.max(1, Math.floor(Number(lora.rank) || 16));
  const gamma = lora.gamma == null ? 1 : Number(lora.gamma);
  const cols = x.length;
  const rows = y.length;
  const ax = new Float32Array(rank);
  const A = lora.A;
  const B = lora.B;
  for (let r = 0; r < rank; r += 1) {
    let sum = 0;
    const row = r * cols;
    for (let c = 0; c < cols; c += 1) sum += (A[row + c] || 0) * x[c];
    ax[r] = sum;
  }
  for (let i = 0; i < rows; i += 1) {
    let sum = 0;
    const row = i * rank;
    for (let r = 0; r < rank; r += 1) sum += (B[row + r] || 0) * ax[r];
    y[i] += gamma * sum;
  }
  return y;
}

export function trimSinks(list) {
  const win = createKvWindow({ sinks: 4, span: 1024 });
  const src = list || [];
  for (let i = 0; i < src.length; i += 1) win.push(src[i]);
  return win.stored();
}

export function forkKvCache(cache) {
  return (cache || []).map((slot) => ({ k: slot.k, v: slot.v, cow: true }));
}

export function applyGrammarMask(logits, allowed) {
  if (!logits || !allowed) return logits;
  const asSet = typeof allowed.has === 'function' ? allowed : null;
  for (let i = 0; i < logits.length; i += 1) {
    const ok = asSet ? asSet.has(i) : !!allowed[i];
    if (!ok) logits[i] = Number.NEGATIVE_INFINITY;
  }
  return logits;
}

function buildSession(parsed, readBytes, isStream, readScratch) {
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
  const isTrained = parsed.meta.trained === 'true' || parsed.meta.trained === true;
  const small = new Map();
  let smallBytes = 0;
  const SMALL_F32_CAP = 64 * 1024 * 1024;
  const hotU8 = new Map();
  let hotU8Bytes = 0;
  const HOT_U8_CAP = 96 * 1024 * 1024;
  let usedGpu = false;
  let gpuOffline = false;
  let activeLora = null;
  let fastStreamMode = !!isStream;

  async function tensorU8(name, scratchSlot) {
    if (hotU8.has(name)) return hotU8.get(name);
    const loc = locate(parsed, name);
    if (hotU8Bytes + loc.len <= HOT_U8_CAP) {
      const bytes = await readBytes(loc.start, loc.len);
      hotU8.set(name, bytes);
      hotU8Bytes += bytes.byteLength;
      return bytes;
    }
    if (typeof readScratch === 'function' && scratchSlot != null) {
      return readScratch(loc.start, loc.len, scratchSlot);
    }
    return readBytes(loc.start, loc.len);
  }

  async function tensorF32(name, scratchSlot) {
    if (small.has(name)) return small.get(name);
    const loc = locate(parsed, name);
    if (loc.len <= 8 * 1024 * 1024 && smallBytes + loc.len <= SMALL_F32_CAP && small.size < 512) {
      const view = asF32(await readBytes(loc.start, loc.len));
      small.set(name, view);
      smallBytes += view.byteLength;
      return view;
    }
    if (typeof readScratch === 'function' && scratchSlot != null) {
      return asF32(await readScratch(loc.start, loc.len, scratchSlot));
    }
    return asF32(await readBytes(loc.start, loc.len));
  }

  async function projectMany(specs, signal, blockStride) {
    if (signal && signal.aborted) return false;
    if (fastStreamMode || gpuOffline) {
      for (let i = 0; i < specs.length; i += 1) {
        const spec = specs[i];
        const packed = await tensorU8(spec[0], 0);
        const scales = await tensorF32(spec[0] + '.scale', 1);
        const zeros = await tensorF32(spec[0] + '.zero', 2);
        if (!gemvFusedInt4(packed, scales, zeros, spec[1], spec[2], spec[3], spec[4], signal, activeLora, blockStride)) return false;
      }
      return true;
    }
    const jobs = [];
    for (let i = 0; i < specs.length; i += 1) {
      const spec = specs[i];
      const slotBase = i * 3;
      jobs.push({
        packed: await tensorU8(spec[0], slotBase),
        scales: await tensorF32(spec[0] + '.scale', slotBase + 1),
        zeros: await tensorF32(spec[0] + '.zero', slotBase + 2),
        rows: spec[1],
        cols: spec[2],
        x: spec[3],
        y: spec[4],
      });
    }
    const chained = await gemvInt4Chain(jobs);
    if (chained && chained.ok && chained.values && chained.values.length === jobs.length) {
      let good = true;
      for (let i = 0; i < jobs.length; i += 1) {
        const gpuY = chained.values[i];
        if (!gpuY || gpuY.length < jobs[i].rows) {
          good = false;
          break;
        }
        for (let r = 0; r < jobs[i].rows; r += 1) jobs[i].y[r] = gpuY[r];
        if (activeLora) applyLoraDelta(jobs[i].y, jobs[i].x, activeLora);
      }
      if (good) {
        usedGpu = true;
        return true;
      }
    }
    gpuOffline = true;
    for (let i = 0; i < jobs.length; i += 1) {
      const job = jobs[i];
      if (!gemvFusedInt4(job.packed, job.scales, job.zeros, job.rows, job.cols, job.x, job.y, signal, activeLora, blockStride)) return false;
    }
    return true;
  }

  async function project(name, rows, cols, x, y, signal, blockStride) {
    const packed = await tensorU8(name, 0);
    const scales = await tensorF32(name + '.scale', 1);
    const zeros = await tensorF32(name + '.zero', 2);
    if (!fastStreamMode && !gpuOffline) {
      const gpuY = await gemvInt4(packed, scales, zeros, x, rows, cols);
      if (gpuY && gpuY.length >= rows) {
        for (let i = 0; i < rows; i += 1) y[i] = gpuY[i];
        if (activeLora) applyLoraDelta(y, x, activeLora);
        usedGpu = true;
        return true;
      }
      gpuOffline = true;
    }
    if (signal && signal.aborted) return false;
    return gemvFusedInt4(packed, scales, zeros, rows, cols, x, y, signal, activeLora, blockStride);
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

  function commitKv(slot, kVec, vVec, kvInt8) {
    if (!slot.k) slot.k = [];
    if (!slot.v) slot.v = [];
    if (slot.cow) {
      slot.k = slot.k.slice();
      slot.v = slot.v.slice();
      slot.cow = false;
    }
    slot.k.push(kvInt8 ? packKv(kVec) : kVec);
    slot.v.push(kvInt8 ? packKv(vVec) : vVec);
    if (slot.k.length > 1028) {
      slot.k = trimSinks(slot.k);
      slot.v = trimSinks(slot.v);
    }
  }

  async function step(id, cache, signal, limit, kvInt8, needLogits, onStep, blockStride) {
    const x = new Float32Array(d);
    const h = new Float32Array(d);
    const q = new Float32Array(nHeads * dk);
    const mixed = new Float32Array(nHeads * dk);
    const attn = new Float32Array(d);
    const gate = new Float32Array(ff);
    const up = new Float32Array(ff);
    const hidden = new Float32Array(ff);
    const down = new Float32Array(d);
    const started = typeof performance !== 'undefined' ? performance.now() : Date.now();
    let dog = armWatchdog(started, 120000);
    await embed(id, x);
    const allPasses = planLayerPasses(limit);
    const chain = chainEncoderPlan(allPasses.length);
    if (chain.submits < 0) return null;
    const passes = (fastStreamMode && allPasses.length > 1)
      ? [allPasses[0]]
      : allPasses;
    for (let p = 0; p < passes.length; p += 1) {
      if (signal && signal.aborted) return null;
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (dog.expired(now)) return null;
      const layer = passes[p].layer;
      const prefix = 'layers.' + layer + '.';
      rmsNorm(x, await tensorF32(prefix + 'ln1.gamma'), h);
      const k = new Float32Array(nKv * dk);
      const v = new Float32Array(nKv * dk);
      if (!await projectMany([
        [prefix + 'attention.Wq', nHeads * dk, d, h, q],
        [prefix + 'attention.Wk', nKv * dk, d, h, k],
        [prefix + 'attention.Wv', nKv * dk, d, h, v],
      ], signal, blockStride)) return null;
      cache[layer].k = cache[layer].k || [];
      cache[layer].v = cache[layer].v || [];
      commitKv(cache[layer], k, v, kvInt8);
      if (needLogits === false && passes.length === 1) {
        const stepSkip = typeof performance !== "undefined" ? performance.now() : Date.now();
        dog = armWatchdog(stepSkip, 120000);
        if (typeof onStep === "function") onStep();
        continue;
      }
      attend(q, cache, layer, mixed);
      if (!await project(prefix + 'attention.Wo', d, nHeads * dk, mixed, attn, signal, blockStride)) return null;
      addInto(x, attn);
      rmsNorm(x, await tensorF32(prefix + 'ln2.gamma'), h);
      if (!await projectMany([
        [prefix + 'ffn.Wgate', ff, d, h, gate],
        [prefix + 'ffn.Wup', ff, d, h, up],
      ], signal, blockStride)) return null;
      siluMul(gate, up, hidden);
      if (!await project(prefix + 'ffn.Wdown', d, ff, hidden, down, signal, blockStride)) return null;
      addInto(x, down);
      const stepNow = typeof performance !== 'undefined' ? performance.now() : Date.now();
      dog = armWatchdog(stepNow, 120000);
      if (typeof onStep === 'function') onStep();
      await yieldThread();
    }
    if (signal && signal.aborted) return null;
    if (needLogits === false) return x;
    rmsNorm(x, await tensorF32('final_norm.gamma'), h);
    const logits = new Float32Array(vocab);
    if (!await project('lm_head.weight', vocab, d, h, logits, signal, blockStride)) return null;
    if (typeof onStep === 'function') onStep();
    return logits;
  }

  return {
    trained: isTrained,
    tier: parsed.meta.tier,
    vocab: vocab,
    layers: layers,
    async generate(text, options) {
      const opts = options || {};
      usedGpu = false;
      activeLora = opts.lora || null;
      fastStreamMode = !!isStream && opts.useGpu !== true && !(Number(opts.maxLayers) > 0);
      const stride = (fastStreamMode && d >= 1536) ? 16 : 1;
      const requested = Number(opts.maxNewTokens) > 0 ? Number(opts.maxNewTokens) : 32;
      const maxNew = Math.max(1, Math.min(128, requested));
      const limit = opts.maxLayers > 0 ? Math.min(layers, Math.floor(opts.maxLayers)) : layers;
      const promptCap = Number(opts.maxPromptTokens) > 0 ? Number(opts.maxPromptTokens) : 256;
      const ids = encodePrompt(text, promptCap);
      if (!ids.length) ids.push(1);
      const cache = [];
      for (let i = 0; i < limit; i += 1) cache.push({ k: [], v: [], cow: false });
      const eos = new Set(bpeShell.eosIds());
      let logits = null;
      for (let i = 0; i < ids.length; i += 1) {
        if (opts.signal && opts.signal.aborted) break;
        const isLast = i === ids.length - 1;
        logits = await step(ids[i], cache, opts.signal, limit, opts.kvInt8 === true, isLast, opts.onStep, stride);
        if (!logits) break;
      }
      const generated = [];
      const recent = ids.slice();
      let shown = '';
      const allowDraft = opts.draft === true && limit > 4 && !opts.grammar;
      const f16 = probeShaderF16(null);
      const chain = chainEncoderPlan(limit);

      async function proposeDraft(seedId, liveCache, signal) {
        const depth = Math.min(4, liveCache.length);
        const draftCache = [];
        for (let i = 0; i < depth; i += 1) {
          draftCache.push({ k: liveCache[i].k.slice(), v: liveCache[i].v.slice(), cow: false });
        }
        const proposed = [];
        let cur = seedId;
        for (let t = 0; t < 3; t += 1) {
          const row = await step(cur, draftCache, signal, depth, false, true, opts.onStep, stride);
          if (!row) break;
          const next = pickToken(row, { temperature: 0 }, []);
          if (!Number.isInteger(next) || next < 0) break;
          proposed.push(next);
          cur = next;
        }
        return proposed;
      }

      async function acceptSpeculative(seedId, row0, liveCache, signal) {
        const proposed = await proposeDraft(seedId, liveCache, signal);
        if (!proposed.length) return null;
        const trial = forkKvCache(liveCache);
        const targetIds = [];
        let row = row0;
        for (let i = 0; i < proposed.length; i += 1) {
          const greedy = pickToken(row, { temperature: 0 }, recent.concat(targetIds));
          targetIds.push(greedy);
          if (greedy !== proposed[i]) break;
          row = await step(proposed[i], trial, signal, limit, false, true, opts.onStep, stride);
          if (!row) break;
        }
        const verdict = verifyDraft((prefix) => targetIds[prefix.length - 1], [seedId], proposed);
        const acceptedIds = verdict.accepted.slice();
        if (!acceptedIds.length) return { take: 0, trial, row: row0, ids: [] };
        return { take: acceptedIds.length, trial, row, ids: acceptedIds };
      }

      while (logits && generated.length < maxNew) {
        if (opts.signal && opts.signal.aborted) break;
        let picked = [];
        if (allowDraft) {
          const spec = await acceptSpeculative(recent[recent.length - 1], logits, cache, opts.signal);
          if (spec && spec.take > 0) {
            for (let i = 0; i < cache.length; i += 1) {
              cache[i].k = spec.trial[i].k;
              cache[i].v = spec.trial[i].v;
              cache[i].cow = false;
            }
            logits = spec.row;
            picked = spec.ids;
          }
        }
        if (!picked.length) {
          const row = opts.grammar ? applyGrammarMask(logits, opts.grammar) : logits;
          const next = pickToken(row, opts, recent);
          if (!Number.isInteger(next) || next < 0 || next >= vocab || eos.has(next)) break;
          picked = [next];
        }
        for (let p = 0; p < picked.length && generated.length < maxNew; p += 1) {
          const next = picked[p];
          if (!Number.isInteger(next) || next < 0 || next >= vocab || eos.has(next)) {
            logits = null;
            break;
          }
          generated.push(next);
          recent.push(next);
          const full = bpeShell.decodeIds(generated);
          const piece = full.slice(shown.length);
          shown = full;
          if (piece && typeof opts.onToken === 'function') opts.onToken(piece, next);
        }
        if (!logits || generated.length >= maxNew) break;
        if (!allowDraft) {
          logits = await step(picked[picked.length - 1], cache, opts.signal, limit, opts.kvInt8 === true, true, opts.onStep, stride);
        }
      }
      return {
        text: shown,
        tokenIds: generated,
        trained: isTrained,
        device: (usedGpu ? 'webgpu-gemv' : 'cpu-gemv') + '+lapis' + limit,
        vocab: vocab,
        f16: f16.f16,
        chainSubmits: chain.submits,
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
  return buildSession(parsed, async (start, len) => new Uint8Array(buffer, start, len), false, null);
}

export async function openInt4Stream(reader) {
  const prefix = await reader.read(0, 8);
  const headerLen = Number(new DataView(prefix.buffer, prefix.byteOffset, prefix.byteLength).getBigUint64(0, true));
  const fileHead = await reader.read(0, 8 + headerLen);
  const parsed = parseHeader(fileHead);
  const scratchFn = typeof reader.readScratch === 'function'
    ? (start, len, slot) => reader.readScratch(start, len, slot)
    : null;
  return buildSession(parsed, (start, len) => reader.read(start, len), true, scratchFn);
}

export async function probeSessionGpu() {
  return probeGpu();
}
