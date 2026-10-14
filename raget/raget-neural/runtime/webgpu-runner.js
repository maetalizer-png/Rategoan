import { LLMQuantization } from '../llm-quantization.js';

const PAGE = 16;

export function kvPages(tokenCount, pageSize = PAGE) {
  const tokens = Math.max(0, Math.floor(Number(tokenCount) || 0));
  const size = pageSize > 0 ? Math.floor(pageSize) : PAGE;
  return { pageSize: size, pages: Math.ceil(tokens / size), tokens };
}

export function createPageTable() {
  const pages = [];
  return {
    alloc(tokenCount) {
      const tokens = Math.max(0, Math.floor(Number(tokenCount) || 0));
      const count = Math.ceil(tokens / PAGE);
      const start = pages.length;
      for (let i = 0; i < count; i++) pages.push(new Float32Array(PAGE));
      return { start, pages: count, tokens };
    },
    write(pageIndex, values) {
      const page = pages[pageIndex];
      if (!page) return 0;
      const src = values || [];
      let n = 0;
      for (let i = 0; i < PAGE && i < src.length; i++) {
        page[i] = Number(src[i]) || 0;
        n += 1;
      }
      return n;
    },
    read(pageIndex) {
      const page = pages[pageIndex];
      return page ? Array.from(page) : [];
    },
    release(start, count) {
      let n = 0;
      for (let i = start; i < start + count && i < pages.length; i++) {
        if (pages[i]) n += 1;
        pages[i] = null;
      }
      return n;
    },
    live() {
      return pages.filter(Boolean).length;
    },
  };
}

export function packInt4(values) {
  const src = values || [];
  const out = new Uint8Array(Math.ceil(src.length / 2));
  for (let i = 0; i < src.length; i++) {
    const nibble = Math.max(0, Math.min(15, Math.round(Number(src[i]) || 0)));
    if (i % 2 === 0) out[i >> 1] = nibble;
    else out[i >> 1] |= nibble << 4;
  }
  return out;
}

export function unpackInt4(packed, length) {
  const src = packed || new Uint8Array();
  const out = new Float32Array(Math.max(0, length || 0));
  for (let i = 0; i < out.length; i++) {
    const byte = src[i >> 1] || 0;
    out[i] = i % 2 === 0 ? (byte & 15) : (byte >> 4);
  }
  return out;
}

let gpuDevice = null;
let shaderF16 = false;

async function sharedDevice() {
  if (gpuDevice) return gpuDevice;
  const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return null;
  const adapter = await gpu.requestAdapter();
  if (!adapter) return null;
  shaderF16 = probeShaderF16(adapter).f16;
  gpuDevice = await adapter.requestDevice();
  gpuDevice.lost.then(() => { gpuDevice = null; });
  return gpuDevice;
}

export const DEQUANT_BLOCK_SHADER = '@group(0) @binding(0) var<storage, read> packed: array<u32>;'
  + '@group(0) @binding(1) var<storage, read_write> out: array<f32>;'
  + '@group(0) @binding(2) var<storage, read> scales: array<f32>;'
  + '@group(0) @binding(3) var<storage, read> zeros: array<f32>;'
  + '@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {'
  + 'let i = id.x; if (i >= arrayLength(&out)) { return; }'
  + 'let byteIndex = i / 2u; let word = packed[byteIndex / 4u];'
  + 'let shift = (byteIndex % 4u) * 8u; let byte = (word >> shift) & 0xffu;'
  + 'let nibble = select(byte >> 4u, byte & 0xfu, (i & 1u) == 0u);'
  + 'let block = i / 32u; out[i] = (f32(nibble) - zeros[block]) * scales[block]; }';

async function dequantBlocksOnGpu(packed) {
  const device = await sharedDevice();
  if (!device) return null;
  const nibbles = packInt4(packed.nibbles);
  const scales = packed.scales;
  const zeros = packed.zeros;
  const length = packed.length;
  let inBuf = null;
  let outBuf = null;
  let readBuf = null;
  let scaleBuf = null;
  let zeroBuf = null;
  try {
    const module = device.createShaderModule({ code: DEQUANT_BLOCK_SHADER });
    const words = Math.ceil(nibbles.length / 4);
    const src = new Uint8Array(words * 4);
    src.set(nibbles);
    inBuf = device.createBuffer({ size: src.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    scaleBuf = device.createBuffer({ size: Math.max(4, scales.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    zeroBuf = device.createBuffer({ size: Math.max(4, zeros.byteLength), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    outBuf = device.createBuffer({ size: length * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    readBuf = device.createBuffer({ size: length * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(inBuf, 0, src);
    device.queue.writeBuffer(scaleBuf, 0, scales);
    device.queue.writeBuffer(zeroBuf, 0, zeros);
    const layout = device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      ],
    });
    const bind = device.createBindGroup({
      layout,
      entries: [
        { binding: 0, resource: { buffer: inBuf } },
        { binding: 1, resource: { buffer: outBuf } },
        { binding: 2, resource: { buffer: scaleBuf } },
        { binding: 3, resource: { buffer: zeroBuf } },
      ],
    });
    const pipeline = device.createComputePipeline({
      layout: device.createPipelineLayout({ bindGroupLayouts: [layout] }),
      compute: { module, entryPoint: 'main' },
    });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(Math.ceil(length / 64));
    pass.end();
    encoder.copyBufferToBuffer(outBuf, 0, readBuf, 0, length * 4);
    device.queue.submit([encoder.finish()]);
    await readBuf.mapAsync(GPUMapMode.READ);
    const values = Array.from(new Float32Array(readBuf.getMappedRange()));
    readBuf.unmap();
    return values;
  } finally {
    if (inBuf) inBuf.destroy();
    if (outBuf) outBuf.destroy();
    if (readBuf) readBuf.destroy();
    if (scaleBuf) scaleBuf.destroy();
    if (zeroBuf) zeroBuf.destroy();
  }
}

export function planLayerPasses(layerCount) {
  const count = Math.max(0, layerCount | 0);
  const bytes = 26 * 1024 * 1024;
  const passes = [];
  for (let i = 0; i < count; i += 1) passes.push({ layer: i, bytes });
  return passes;
}

export function executeLayerPasses(layerCount, run) {
  const passes = planLayerPasses(layerCount);
  let peak = 0;
  let live = 0;
  for (let i = 0; i < passes.length; i += 1) {
    const buf = { layer: passes[i].layer, bytes: passes[i].bytes, destroyed: false };
    live = buf.bytes;
    if (live > peak) peak = live;
    if (typeof run === 'function') run(buf);
    buf.destroyed = true;
    live = 0;
  }
  return { peak: peak, live: live, passes: passes.length, bytes: passes.length ? passes[0].bytes : 0 };
}

export async function dequantInt4(values) {
  const packed = LLMQuantization.quantizeInt4Blocks(values || []);
  const cpu = Array.from(LLMQuantization.dequantizeInt4Blocks(packed));
  try {
    const gpuValues = await dequantBlocksOnGpu(packed);
    if (gpuValues && gpuValues.length === cpu.length) return { device: 'gpu', values: gpuValues, packed: packed };
  } catch (e) { /* CPU tetap benar bila GPU tidak ada. */ }
  return { device: 'cpu', values: cpu, packed: packed };
}

export async function probeGpu() {
  const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return { ok: false, reason: 'WebGPU tidak tersedia' };
  const adapter = await gpu.requestAdapter();
  if (!adapter) return { ok: false, reason: 'Adapter tidak ditemukan' };
  return { ok: true, reason: '' };
}

export const GEMV_INT4_SHADER = '@group(0) @binding(0) var<storage, read> packed: array<u32>;'
  + '@group(0) @binding(1) var<storage, read> vecx: array<f32>;'
  + '@group(0) @binding(2) var<storage, read> scales: array<f32>;'
  + '@group(0) @binding(3) var<storage, read> zeros: array<f32>;'
  + '@group(0) @binding(4) var<storage, read_write> y: array<f32>;'
  + '@group(0) @binding(5) var<uniform> dims: vec2<u32>;'
  + 'var<workgroup> red: array<f32, 64>;'
  + '@compute @workgroup_size(64) fn main(@builtin(local_invocation_id) lid: vec3<u32>, @builtin(workgroup_id) wid: vec3<u32>) {'
  + 'let row = wid.x; let lane = lid.x; let cols = dims.y; var acc = 0.0;'
  + 'if (row < dims.x) { let rowBase = row * cols;'
  + 'for (var c = lane; c < cols; c = c + 64u) {'
  + 'let i = rowBase + c; let byteIndex = i / 2u; let word = packed[byteIndex / 4u];'
  + 'let shift = (byteIndex % 4u) * 8u; let byte = (word >> shift) & 0xffu;'
  + 'let nibble = select(byte >> 4u, byte & 0xfu, (i & 1u) == 0u);'
  + 'let block = i / 32u;'
  + 'if (block < arrayLength(&scales) && block < arrayLength(&zeros)) {'
  + 'let w = (f32(nibble) - zeros[block]) * scales[block]; acc = acc + w * vecx[c]; } } }'
  + 'red[lane] = acc; workgroupBarrier();'
  + 'var offset = 32u;'
  + 'loop { if (offset == 0u) { break; } if (lane < offset) { red[lane] = red[lane] + red[lane + offset]; } workgroupBarrier(); offset = offset >> 1u; }'
  + 'if (lane == 0u && row < dims.x) { y[row] = red[0]; } }';

export const GPU_WEIGHT_CACHE_CAP = 16;
const gpuWeightCache = new Map();

export function gpuCacheSize() {
  return gpuWeightCache.size;
}

export function trackGpuWeight(packed, scale, zero) {
  const hit = gpuWeightCache.get(packed);
  const known = !!(hit && hit.scale === scale && hit.zero === zero);
  if (known) return true;
  if (gpuWeightCache.has(packed)) gpuWeightCache.delete(packed);
  gpuWeightCache.set(packed, { scale: scale, zero: zero });
  while (gpuWeightCache.size > GPU_WEIGHT_CACHE_CAP) {
    const oldest = gpuWeightCache.keys().next().value;
    const entry = gpuWeightCache.get(oldest);
    if (entry && entry.bufA && typeof entry.bufA.destroy === 'function') entry.bufA.destroy();
    if (entry && entry.bufB && typeof entry.bufB.destroy === 'function') entry.bufB.destroy();
    gpuWeightCache.delete(oldest);
  }
  return false;
}
let gemvPipe = null;
let gemvArena = null;
let gemvArenaDevice = null;
let waveArena = [];
let waveArenaDevice = null;

function pad4(bytes) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if ((src.byteOffset % 4) === 0 && (src.byteLength % 4) === 0) return src;
  const words = Math.ceil(src.byteLength / 4);
  const out = new Uint8Array(words * 4);
  out.set(src);
  return out;
}

function dropWaveArena() {
  if (!waveArena.length) return;
  const list = waveArena.splice(0);
  waveArenaDevice = null;
  list.forEach((slot) => {
    ['packedBuf', 'xBuf', 'scaleBuf', 'zeroBuf', 'yBuf', 'readBuf', 'dimBuf'].forEach((key) => {
      try { if (slot[key]) slot[key].destroy(); } catch (e) { /* buffer sudah lepas */ }
    });
  });
}

function dropArena() {
  dropWaveArena();
  if (!gemvArena) return;
  const box = gemvArena;
  gemvArena = null;
  gemvArenaDevice = null;
  Object.keys(box).forEach((key) => {
    try { if (box[key] && typeof box[key].destroy === 'function') box[key].destroy(); } catch (e) { /* buffer sudah lepas */ }
  });
}

function ensureWaveSlot(device, index, need) {
  if (waveArenaDevice && waveArenaDevice !== device) dropWaveArena();
  waveArenaDevice = device;
  const packedSize = Math.max(8 * 1024 * 1024, need.packed);
  const scaleSize = Math.max(2 * 1024 * 1024, need.scale, need.zero);
  const xSize = Math.max(5632 * 4, need.x);
  const ySize = Math.max(5632 * 4, need.y);
  const prev = waveArena[index];
  if (prev
    && prev.packedBuf.size >= packedSize
    && prev.xBuf.size >= xSize
    && prev.scaleBuf.size >= scaleSize
    && prev.zeroBuf.size >= scaleSize
    && prev.yBuf.size >= ySize
    && prev.readBuf.size >= ySize) {
    return prev;
  }
  if (prev) {
    ['packedBuf', 'xBuf', 'scaleBuf', 'zeroBuf', 'yBuf', 'readBuf', 'dimBuf'].forEach((key) => {
      try { if (prev[key]) prev[key].destroy(); } catch (e) { /* lepas */ }
    });
  }
  const slot = {
    packedBuf: device.createBuffer({ size: packedSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    xBuf: device.createBuffer({ size: xSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    scaleBuf: device.createBuffer({ size: scaleSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    zeroBuf: device.createBuffer({ size: scaleSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    yBuf: device.createBuffer({ size: ySize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    readBuf: device.createBuffer({ size: ySize, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }),
    dimBuf: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
  };
  waveArena[index] = slot;
  return slot;
}

function ensureArena(device, need) {
  const packedSize = Math.max(32768000, need.packed);
  const scaleSize = Math.max(8192000, need.scale, need.zero);
  const xSize = Math.max(5632 * 4, need.x);
  const ySize = Math.max(32000 * 4, need.y);
  if (gemvArena && gemvArenaDevice === device
    && gemvArena.packed.size >= packedSize
    && gemvArena.x.size >= xSize
    && gemvArena.scale.size >= scaleSize
    && gemvArena.zero.size >= need.zero
    && gemvArena.y.size >= ySize
    && gemvArena.read.size >= ySize) {
    return gemvArena;
  }
  dropArena();
  gemvArenaDevice = device;
  gemvArena = {
    packed: device.createBuffer({ size: packedSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    x: device.createBuffer({ size: xSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    scale: device.createBuffer({ size: scaleSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    zero: device.createBuffer({ size: Math.max(scaleSize, need.zero), usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST }),
    y: device.createBuffer({ size: ySize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC }),
    read: device.createBuffer({ size: ySize, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST }),
    dim: device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST }),
  };
  return gemvArena;
}

export async function gemvInt4(packedBytes, scales, zeros, x, rows, cols) {
  const device = await sharedDevice();
  if (!device || !rows || !cols) return null;
  const packed = pad4(packedBytes);
  const scaleSrc = scales instanceof Float32Array ? scales : new Float32Array(scales);
  const zeroSrc = zeros instanceof Float32Array ? zeros : new Float32Array(zeros);
  const xSrc = x instanceof Float32Array ? x : new Float32Array(x);
  const yBytes = rows * 4;
  try {
    if (!gemvPipe || gemvDeviceLost() || gemvArenaDevice !== device) {
      if (gemvArenaDevice && gemvArenaDevice !== device) dropArena();
      const module = device.createShaderModule({ code: GEMV_INT4_SHADER });
      gemvPipe = device.createComputePipeline({
        layout: 'auto',
        compute: { module: module, entryPoint: 'main' },
      });
    }
    const arena = ensureArena(device, {
      packed: packed.byteLength,
      x: Math.max(4, xSrc.byteLength),
      scale: Math.max(4, scaleSrc.byteLength),
      zero: Math.max(4, zeroSrc.byteLength),
      y: yBytes,
    });
    const reuse = arena.lastPackedRef === packedBytes && arena.lastScaleRef === scales && arena.lastZeroRef === zeros;
    if (!reuse) {
      device.queue.writeBuffer(arena.packed, 0, packed);
      device.queue.writeBuffer(arena.scale, 0, scaleSrc);
      device.queue.writeBuffer(arena.zero, 0, zeroSrc);
      arena.lastPackedRef = packedBytes;
      arena.lastScaleRef = scales;
      arena.lastZeroRef = zeros;
      trackGpuWeight(packedBytes, scales, zeros);
    }
    device.queue.writeBuffer(arena.x, 0, xSrc);
    device.queue.writeBuffer(arena.dim, 0, new Uint32Array([rows, cols, 0, 0]));
    const bind = device.createBindGroup({
      layout: gemvPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: arena.packed } },
        { binding: 1, resource: { buffer: arena.x } },
        { binding: 2, resource: { buffer: arena.scale } },
        { binding: 3, resource: { buffer: arena.zero } },
        { binding: 4, resource: { buffer: arena.y } },
        { binding: 5, resource: { buffer: arena.dim } },
      ],
    });
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(gemvPipe);
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(rows);
    pass.end();
    encoder.copyBufferToBuffer(arena.y, 0, arena.read, 0, yBytes);
    device.queue.submit([encoder.finish()]);
    await arena.read.mapAsync(GPUMapMode.READ);
    const out = new Float32Array(arena.read.getMappedRange(0, yBytes).slice(0));
    arena.read.unmap();
    return out;
  } catch (e) {
    gemvPipe = null;
    dropArena();
    return null;
  }
}

function gemvDeviceLost() {
  return false;
}

export function chainEncoderPlan(layerCount) {
  const layers = Math.max(0, layerCount | 0);
  return { micro: layers * 7, submits: layers * 2, perLayer: layers ? 2 : 0 };
}

export function probeShaderF16(adapter) {
  const features = adapter && adapter.features;
  const has = !!(features && typeof features.has === 'function' && features.has('shader-f16'));
  return { f16: has, registerScale: has ? 0.5 : 1 };
}

export function shaderF16Active() {
  return shaderF16;
}

export const WORKGROUP_REDUCTION_SHADER = '@group(0) @binding(0) var<storage, read> partial: array<f32>;'
  + '@group(0) @binding(1) var<storage, read_write> out: array<f32>;'
  + 'var<workgroup> scratch: array<f32, 64>;'
  + '@compute @workgroup_size(64) fn main(@builtin(local_invocation_id) local: vec3<u32>, @builtin(workgroup_id) group: vec3<u32>) {'
  + 'let lane = local.x;'
  + 'scratch[lane] = partial[group.x * 64u + lane];'
  + 'workgroupBarrier();'
  + 'var stride = 32u;'
  + 'loop {'
  + 'if (lane < stride) { scratch[lane] = scratch[lane] + scratch[lane + stride]; }'
  + 'workgroupBarrier();'
  + 'stride = stride >> 1u;'
  + 'if (stride == 0u) { break; }'
  + '}'
  + 'if (lane == 0u) { out[group.x] = scratch[0]; }'
  + '}';

export function reduceWorkgroup(values) {
  const src = values || [];
  const out = [];
  for (let base = 0; base < src.length; base += 64) {
    let sum = 0;
    for (let lane = 0; lane < 64; lane += 1) sum += Number(src[base + lane]) || 0;
    out.push(sum);
  }
  return out;
}

async function submitWave(device, wave) {
  if (!gemvPipe || gemvDeviceLost()) {
    const module = device.createShaderModule({ code: GEMV_INT4_SHADER });
    gemvPipe = device.createComputePipeline({
      layout: 'auto',
      compute: { module: module, entryPoint: 'main' },
    });
  }
  const slots = [];
  for (let i = 0; i < wave.length; i += 1) {
    const job = wave[i];
    const packed = pad4(job.packed);
    const scaleSrc = job.scales instanceof Float32Array ? job.scales : new Float32Array(job.scales);
    const zeroSrc = job.zeros instanceof Float32Array ? job.zeros : new Float32Array(job.zeros);
    const xSrc = job.x instanceof Float32Array ? job.x : new Float32Array(job.x);
    const rows = job.rows | 0;
    const cols = job.cols | 0;
    const yBytes = Math.max(4, rows * 4);
    const slot = ensureWaveSlot(device, i, {
      packed: Math.max(4, packed.byteLength),
      x: Math.max(4, xSrc.byteLength),
      scale: Math.max(4, scaleSrc.byteLength),
      zero: Math.max(4, zeroSrc.byteLength),
      y: yBytes,
    });
    slot.rows = rows;
    slot.yBytes = yBytes;
    const reuse = slot.lastPackedRef === job.packed && slot.lastScaleRef === job.scales && slot.lastZeroRef === job.zeros;
    if (!reuse) {
      device.queue.writeBuffer(slot.packedBuf, 0, packed);
      device.queue.writeBuffer(slot.scaleBuf, 0, scaleSrc);
      device.queue.writeBuffer(slot.zeroBuf, 0, zeroSrc);
      slot.lastPackedRef = job.packed;
      slot.lastScaleRef = job.scales;
      slot.lastZeroRef = job.zeros;
    }
    device.queue.writeBuffer(slot.xBuf, 0, xSrc);
    device.queue.writeBuffer(slot.dimBuf, 0, new Uint32Array([rows, cols, 0, 0]));
    slots.push(slot);
  }
  const encoder = device.createCommandEncoder();
  for (let i = 0; i < slots.length; i += 1) {
    const slot = slots[i];
    const bind = device.createBindGroup({
      layout: gemvPipe.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: slot.packedBuf } },
        { binding: 1, resource: { buffer: slot.xBuf } },
        { binding: 2, resource: { buffer: slot.scaleBuf } },
        { binding: 3, resource: { buffer: slot.zeroBuf } },
        { binding: 4, resource: { buffer: slot.yBuf } },
        { binding: 5, resource: { buffer: slot.dimBuf } },
      ],
    });
    const pass = encoder.beginComputePass();
    pass.setPipeline(gemvPipe);
    pass.setBindGroup(0, bind);
    pass.dispatchWorkgroups(slot.rows);
    pass.end();
    encoder.copyBufferToBuffer(slot.yBuf, 0, slot.readBuf, 0, slot.yBytes);
  }
  device.queue.submit([encoder.finish()]);
  const outs = [];
  for (let i = 0; i < slots.length; i += 1) {
    const slot = slots[i];
    await slot.readBuf.mapAsync(GPUMapMode.READ);
    outs.push(new Float32Array(slot.readBuf.getMappedRange(0, slot.yBytes).slice(0)));
    slot.readBuf.unmap();
  }
  return outs;
}

export async function gemvInt4Chain(jobs) {
  const list = Array.isArray(jobs) ? jobs : [];
  const plan = chainEncoderPlan(list.length ? 1 : 0);
  if (!list.length) return { ok: false, submits: 0, plan: plan, values: null };
  const device = await sharedDevice();
  if (!device) return { ok: false, submits: 0, plan: plan, values: null };
  try {
    const values = await submitWave(device, list);
    return { ok: true, submits: 1, plan: plan, values: values };
  } catch (e) {
    gemvPipe = null;
    dropWaveArena();
    return { ok: false, submits: 0, plan: plan, values: null };
  }
}
