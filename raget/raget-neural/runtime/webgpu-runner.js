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

async function dequantOnGpu(packed, length) {
  const device = await sharedDevice();
  if (!device) return null;
  let inBuf = null;
  let outBuf = null;
  let readBuf = null;
  try {
    const module = device.createShaderModule({
    code: '@group(0) @binding(0) var<storage, read> packed: array<u32>;'
      + '@group(0) @binding(1) var<storage, read_write> out: array<f32>;'
      + '@compute @workgroup_size(64) fn main(@builtin(global_invocation_id) id: vec3<u32>) {'
      + 'let i = id.x; if (i >= arrayLength(&out)) { return; }'
      + 'let byteIndex = i / 2u; let word = packed[byteIndex / 4u];'
      + 'let shift = (byteIndex % 4u) * 8u; let byte = (word >> shift) & 0xffu;'
      + 'let nibble = select(byte >> 4u, byte & 0xfu, (i & 1u) == 0u);'
      + 'out[i] = f32(nibble); }',
  });
  const words = Math.ceil(packed.length / 4);
  const src = new Uint8Array(words * 4);
  src.set(packed);
  inBuf = device.createBuffer({ size: src.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
  outBuf = device.createBuffer({ size: length * 4, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
  readBuf = device.createBuffer({ size: length * 4, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(inBuf, 0, src);
  const layout = device.createBindGroupLayout({
    entries: [
      { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'read-only-storage' } },
      { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },
    ],
  });
  const bind = device.createBindGroup({
    layout,
    entries: [
      { binding: 0, resource: { buffer: inBuf } },
      { binding: 1, resource: { buffer: outBuf } },
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
  }
}

export async function dequantInt4(values) {
  const src = values || [];
  const packed = packInt4(src);
  const cpu = Array.from(unpackInt4(packed, src.length));
  try {
    const gpuValues = await dequantOnGpu(packed, src.length);
    if (gpuValues && gpuValues.length === cpu.length) return { device: 'gpu', values: gpuValues };
  } catch (e) { /* CPU tetap benar bila GPU tidak ada. */ }
  return { device: 'cpu', values: cpu };
}

export async function probeGpu() {
  const gpu = typeof navigator !== 'undefined' ? navigator.gpu : null;
  if (!gpu || typeof gpu.requestAdapter !== 'function') return { ok: false, reason: 'WebGPU tidak tersedia' };
  const adapter = await gpu.requestAdapter();
  if (!adapter) return { ok: false, reason: 'Adapter tidak ditemukan' };
  return { ok: true, reason: '' };
}
