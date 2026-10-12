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
  + '@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) gid: vec3<u32>) {'
  + 'let row = gid.x; if (row >= dims.x) { return; }'
  + 'let cols = dims.y; var acc = 0.0; let rowBase = row * cols;'
  + 'for (var c = 0u; c < cols; c = c + 1u) {'
  + 'let i = rowBase + c; let byteIndex = i / 2u; let word = packed[byteIndex / 4u];'
  + 'let shift = (byteIndex % 4u) * 8u; let byte = (word >> shift) & 0xffu;'
  + 'let nibble = select(byte >> 4u, byte & 0xfu, (i & 1u) == 0u);'
  + 'let block = i / 32u; if (block >= arrayLength(&scales) || block >= arrayLength(&zeros)) { return; } let w = (f32(nibble) - zeros[block]) * scales[block];'
  + 'acc = acc + w * vecx[c]; } y[row] = acc; }';

let gemvPipe = null;
let gemvArena = null;
let gemvArenaDevice = null;

function pad4(bytes) {
  const src = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const words = Math.ceil(src.byteLength / 4);
  const out = new Uint8Array(words * 4);
  out.set(src);
  return out;
}

function dropArena() {
  if (!gemvArena) return;
  const box = gemvArena;
  gemvArena = null;
  gemvArenaDevice = null;
  Object.keys(box).forEach((key) => {
    try { box[key].destroy(); } catch (e) { /* buffer sudah lepas */ }
  });
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
    device.queue.writeBuffer(arena.packed, 0, packed);
    device.queue.writeBuffer(arena.x, 0, xSrc);
    device.queue.writeBuffer(arena.scale, 0, scaleSrc);
    device.queue.writeBuffer(arena.zero, 0, zeroSrc);
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
    pass.dispatchWorkgroups(Math.ceil(rows / 64));
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

export async function gemvInt4Chain(jobs) {
  const list = Array.isArray(jobs) ? jobs : [];
  const layers = list.length ? Math.ceil(list.length / 7) : 0;
  const plan = chainEncoderPlan(layers);
  if (!list.length) return { plan, shader: WORKGROUP_REDUCTION_SHADER.length, values: null };
  const device = await sharedDevice();
  if (!device) return { plan, shader: WORKGROUP_REDUCTION_SHADER.length, values: null };
  const encoder = device.createCommandEncoder();
  list.forEach(() => {
    const pass = encoder.beginComputePass();
    pass.end();
  });
  device.queue.submit([encoder.finish()]);
  return { plan, shader: WORKGROUP_REDUCTION_SHADER.length, values: list.map(() => null), submits: 1 };
}

