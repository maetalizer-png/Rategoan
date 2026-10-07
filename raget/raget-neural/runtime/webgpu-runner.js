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

async function sharedDevice() {
  if (gpuDevice) return gpuDevice;
  const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return null;
  const adapter = await gpu.requestAdapter();
  if (!adapter) return null;
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
