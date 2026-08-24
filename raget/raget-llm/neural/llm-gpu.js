import { LLMEmbedding } from './llm-embedding.js';

const MATMUL_WGSL = `
struct Dims {
m: u32,
k: u32,
n: u32,
};

@group(0) @binding(0) var<uniform> dims: Dims;
@group(0) @binding(1) var<storage, read> matA: array<f32>;
@group(0) @binding(2) var<storage, read> matB: array<f32>;
@group(0) @binding(3) var<storage, read_write> matOut: array<f32>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
let row = gid.x;
let col = gid.y;
if (row >= dims.m || col >= dims.n) {
    return;
}
var sum: f32 = 0.0;
for (var p: u32 = 0u; p < dims.k; p = p + 1u) {
    sum = sum + matA[row * dims.k + p] * matB[p * dims.n + col];
}
matOut[row * dims.n + col] = sum;
}
`;

let gpuState = null; 

function flatten(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const out = new Float32Array(rows * cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            out[i * cols + j] = matrix[i][j];
        }
    }
    return out;
}

function unflatten(flat, rows, cols) {
    const out = new Array(rows);
    for (let i = 0; i < rows; i++) {
        const row = new Array(cols);
        for (let j = 0; j < cols; j++) {
            row[j] = flat[i * cols + j];
        }
        out[i] = row;
    }
    return out;
}

async function gpuMatmulRaw(A, B, device, pipeline) {
    const m = A.length;
    const k = A[0].length;
    const n = B[0].length;

    const flatA = flatten(A);
    const flatB = flatten(B);

    const bufA = device.createBuffer({ size: flatA.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    const bufB = device.createBuffer({ size: flatB.byteLength, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST });
    const outSize = m * n * 4;
    const bufOut = device.createBuffer({ size: outSize, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC });
    const bufReadback = device.createBuffer({ size: outSize, usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST });
    const bufDims = device.createBuffer({ size: 16, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });

    device.queue.writeBuffer(bufA, 0, flatA);
    device.queue.writeBuffer(bufB, 0, flatB);
    device.queue.writeBuffer(bufDims, 0, new Uint32Array([m, k, n, 0]));

    const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
            { binding: 0, resource: { buffer: bufDims } },
            { binding: 1, resource: { buffer: bufA } },
            { binding: 2, resource: { buffer: bufB } },
            { binding: 3, resource: { buffer: bufOut } }
        ]
    });

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(Math.ceil(m / 8), Math.ceil(n / 8));
    pass.end();
    encoder.copyBufferToBuffer(bufOut, 0, bufReadback, 0, outSize);
    device.queue.submit([encoder.finish()]);

    await bufReadback.mapAsync(GPUMapMode.READ);
    const result = unflatten(new Float32Array(bufReadback.getMappedRange().slice(0)), m, n);
    bufReadback.unmap();

    bufA.destroy();
    bufB.destroy();
    bufOut.destroy();
    bufReadback.destroy();
    bufDims.destroy();

    return result;
}

function cpuMatmul(A, B) {
    const m = A.length, k = A[0].length, n = B[0].length;
    const out = new Array(m);
    for (let i = 0; i < m; i++) {
        const row = new Array(n).fill(0);
        for (let p = 0; p < k; p++) {
            for (let j = 0; j < n; j++) {
                row[j] += A[i][p] * B[p][j];
            }
        }
        out[i] = row;
    }
    return out;
}

function randomMatrix(rows, cols) {
    const m = new Array(rows);
    for (let i = 0; i < rows; i++) {
        m[i] = new Array(cols);
        for (let j = 0; j < cols; j++) {
            m[i][j] = Math.random() * 2 - 1;
        }
    }
    return m;
}

function matricesClose(A, B, epsilon) {
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < A[0].length; j++) {
            if (Math.abs(A[i][j] - B[i][j]) > epsilon) {
                return false;
            }
        }
    }
    return true;
}

async function selfTest(device, pipeline, dModel) {
    
    
    const sizes = [[4, 4, 4], [16, 8, 16], [dModel, dModel, dModel]];
    for (const [m, k, n] of sizes) {
        const A = randomMatrix(m, k);
        const B = randomMatrix(k, n);
        const cpuResult = cpuMatmul(A, B);
        const gpuResult = await gpuMatmulRaw(A, B, device, pipeline);
        if (!matricesClose(cpuResult, gpuResult, 1e-3)) {
            return false;
        }
    }

    
    
    const testA = randomMatrix(dModel, dModel);
    const testB = randomMatrix(dModel, dModel);
    const REPEATS = 5;

    const tCpu0 = performance.now();
    for (let i = 0; i < REPEATS; i++) {
        cpuMatmul(testA, testB);
    }
    const cpuMs = (performance.now() - tCpu0) / REPEATS;

    const tGpu0 = performance.now();
    for (let i = 0; i < REPEATS; i++) {
        await gpuMatmulRaw(testA, testB, device, pipeline);
    }
    const gpuMs = (performance.now() - tGpu0) / REPEATS;

    if (gpuMs >= cpuMs) {
        return false;
    }

    return true;
}

async function initGPU(dModel) {
    if (gpuState) {
        return true;
    }
    if (!navigator.gpu) {
        return false;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            return false;
        }
        const device = await adapter.requestDevice();
        const shaderModule = device.createShaderModule({ code: MATMUL_WGSL });
        const pipeline = device.createComputePipeline({
            layout: 'auto',
            compute: { module: shaderModule, entryPoint: 'main' }
        });

        const passed = await selfTest(device, pipeline, dModel || 128);
        if (!passed) {
            return false;
        }

        gpuState = { device: device, pipeline: pipeline };
        return true;
    } catch (e) {
        return false;
    }
}

function isReady() {
    return gpuState !== null;
}

async function matmul(A, B) {
    if (!gpuState) {
        throw new Error('[LLMGpu] GPU belum siap — cek isReady() dulu, jangan panggil matmul() langsung');
    }
    return await gpuMatmulRaw(A, B, gpuState.device, gpuState.pipeline);
}

// MEGA-BATCH RAGETAN ROUND 6 - FASE 1: dispatcher matmul otomatis GPU/CPU -
// dipakai HANYA oleh jalur inference async baru (llm-attention.js
// multiHeadAttentionCachedAsync dkk), TIDAK PERNAH oleh jalur sync lama
// (dipakai training via llm-trainer.js) supaya training tidak tersentuh.
// GPU error di tengah generate (device lost dkk) -> matikan gpuState dan
// fallback ke CPU utk sisa sesi, tidak pernah melempar ke pemanggil.
async function matmulAuto(A, B) {
    if (gpuState) {
        try {
            return await matmul(A, B);
        } catch (e) {
            gpuState = null;
        }
    }
    return LLMEmbedding.matmul(A, B);
}

export const LLMGpu = {
    initGPU: initGPU,
    isReady: isReady,
    matmul: matmul,
    matmulAuto: matmulAuto
};
