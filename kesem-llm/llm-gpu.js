// WebGPU acceleration for matmul — the dominant compute cost in transformer
// forward passes (Q/K/V projections, attention scores, FFN layers).
//
// Untested on real GPU hardware (Node.js sandbox has no WebGPU
// implementation), so this module requires itself to pass two checks
// before being used at all:
//   1. CORRECTNESS — GPU matmul result compared against the long-tested
//      CPU result across several matrix sizes, must match within a small
//      floating-point tolerance.
//   2. SPEED — GPU timed against CPU at the actual matrix sizes this model
//      uses (dModel~128); the model is small enough that GPU overhead
//      (buffer upload, dispatch, readback) can outweigh the benefit.
// If either check fails — results differ, GPU unavailable, or GPU is
// slower — this module disables itself and the system keeps running on
// CPU exactly as before. No "silently wrong" risk: unless both correct AND
// fast are confirmed, it's not used at all.
//
// Scope: inference (generate()) only, never training (llm-trainer.js) —
// the CPU matmul path that already passed gradient-checking stays
// untouched for training.

const Logger = window.Utils?.Logger || {
    info: function () {},
    warn: function () {},
    error: function () {}
};

// Shader WGSL — matmul naif A[m x k] * B[k x n] = hasil[m x n],
// 1 thread GPU per elemen hasil. Konvensi baris-mayor (row-major),
// sama persis dengan matmul() versi CPU di llm-embedding.js.
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

let gpuState = null; // { device, pipeline } kalau siap & terverifikasi, null kalau tidak

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

// Matmul GPU MENTAH — tanpa verifikasi, dipanggil internal saja
// (setelah gpuState terbukti valid lewat selfTest()).
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

// Verifikasi kebenaran+kecepatan — WAJIB lolos sebelum GPU dipakai
// sama sekali. dModel: dimensi sebenarnya dipakai model aktif,
// supaya perbandingan kecepatan relevan (bukan ukuran sembarang).
async function selfTest(device, pipeline, dModel) {
    // 1) Kebenaran — 3 ukuran berbeda, toleransi longgar (float32 GPU
    // vs float64 JS CPU wajar sedikit beda di digit terakhir).
    const sizes = [[4, 4, 4], [16, 8, 16], [dModel, dModel, dModel]];
    for (const [m, k, n] of sizes) {
        const A = randomMatrix(m, k);
        const B = randomMatrix(k, n);
        const cpuResult = cpuMatmul(A, B);
        const gpuResult = await gpuMatmulRaw(A, B, device, pipeline);
        if (!matricesClose(cpuResult, gpuResult, 1e-3)) {
            Logger.warn('LLMGpu', 'Verifikasi kebenaran GAGAL (ukuran ' + m + 'x' + k + 'x' + n + ') — GPU dinonaktifkan, pakai CPU');
            return false;
        }
    }

    // 2) Kecepatan — pada dimensi SEBENARNYA dipakai model ini.
    // Model kecil = overhead dispatch GPU bisa kalah dari CPU.
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

    Logger.info('LLMGpu', 'Benchmark matmul ' + dModel + 'x' + dModel + ' — CPU: ' + cpuMs.toFixed(2) + 'ms, GPU: ' + gpuMs.toFixed(2) + 'ms');

    if (gpuMs >= cpuMs) {
        Logger.warn('LLMGpu', 'GPU tidak lebih cepat dari CPU di ukuran model ini — GPU dinonaktifkan, tetap pakai CPU');
        return false;
    }

    Logger.info('LLMGpu', 'GPU terverifikasi benar & lebih cepat (' + (cpuMs / gpuMs).toFixed(1) + 'x) — diaktifkan untuk inference');
    return true;
}

async function initGPU(dModel) {
    if (gpuState) {
        return true;
    }
    if (!navigator.gpu) {
        Logger.info('LLMGpu', 'WebGPU tidak tersedia di browser ini — pakai CPU');
        return false;
    }
    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            Logger.info('LLMGpu', 'Tidak ada GPU adapter — pakai CPU');
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
        Logger.warn('LLMGpu', 'Inisialisasi GPU gagal (' + e.message + ') — pakai CPU');
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

export const LLMGpu = {
    initGPU: initGPU,
    isReady: isReady,
    matmul: matmul
};

window.LLMGpu = LLMGpu;

Logger.info('LLMGpu', 'llm-gpu.js loaded');
