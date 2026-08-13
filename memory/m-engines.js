import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

class WASMEngine {
    constructor() {
        this.wasm = null;
        this.isReady = false;
        this.memory = null;
        this.useWasm = Config.WASM_ENABLED || false;
    }

    async load() {
        if (this.isReady) {
            return;
        }

        if (!this.useWasm) {
            await this._loadFallback();
            return;
        }

        try {
            if (typeof WebAssembly === 'undefined') {
                throw new Error('WebAssembly unavailable');
            }

            if (typeof fetch === 'undefined') {
                throw new Error('Fetch unavailable');
            }

            const response = await fetch(Config.WASM_PATH || 'vector_memory.wasm');

            if (!response.ok) {
                throw new Error('WASM file not found');
            }

            const bytes = await response.arrayBuffer();

            const wasmModule = await WebAssembly.instantiate(bytes, {
                env: {
                    memory: new WebAssembly.Memory({
                        initial: 256,
                        maximum: 512
                    }),
                    _malloc: this._malloc.bind(this),
                    _free: this._free.bind(this)
                }
            });

            this.wasm = wasmModule.instance.exports;
            this.memory = this.wasm.memory;
            this.isReady = true;

            Logger.info('WASMEngine', 'WASM native loaded');
        } catch (error) {
            Logger.warn('WASMEngine', 'WASM failed, using fallback');
            await this._loadFallback();
        }
    }

    async _loadFallback() {
        this.wasm = {
            cosine_similarity: function (vec1, vec2) {
                if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
                    return 0;
                }

                const len = Math.min(vec1.length, vec2.length);

                if (len === 0) {
                    return 0;
                }

                let dot = 0;
                let norm1 = 0;
                let norm2 = 0;

                for (let i = 0; i < len; i++) {
                    dot += vec1[i] * vec2[i];
                    norm1 += vec1[i] * vec1[i];
                    norm2 += vec2[i] * vec2[i];
                }

                if (norm1 === 0 || norm2 === 0) {
                    return 0;
                }

                return dot / (Math.sqrt(norm1) * Math.sqrt(norm2));
            }
        };

        this.isReady = true;

        Logger.info('WASMEngine', 'Fallback engine loaded');
    }

    _malloc(size) {
        if (this.wasm && typeof this.wasm._malloc === 'function') {
            return this.wasm._malloc(size);
        }

        return 0;
    }

    _free(ptr) {
        if (this.wasm && typeof this.wasm._free === 'function') {
            this.wasm._free(ptr);
        }
    }

    cosineSimilarity(vec1, vec2) {
        if (!Array.isArray(vec1) || !Array.isArray(vec2)) {
            return 0;
        }

        if (!this.wasm) {
            return 0;
        }

        if (typeof this.wasm._cosine_similarity === 'function' && this.memory) {
            const len = Math.min(vec1.length, vec2.length);

            if (len === 0) {
                return 0;
            }

            const ptr1 = this._malloc(len * 4);
            const ptr2 = this._malloc(len * 4);

            if (ptr1 && ptr2) {
                const heap = new Float32Array(this.memory.buffer);

                heap.set(vec1.slice(0, len), ptr1 / 4);
                heap.set(vec2.slice(0, len), ptr2 / 4);

                const result = this.wasm._cosine_similarity(ptr1, ptr2, len);

                this._free(ptr1);
                this._free(ptr2);

                return result;
            }
        }

        if (typeof this.wasm.cosine_similarity === 'function') {
            return this.wasm.cosine_similarity(vec1, vec2);
        }

        return 0;
    }

    isLoaded() {
        return this.isReady;
    }
}

// ============================================================
// GPU ENGINE
// ============================================================
class GPUEngine {
    constructor() {
        this.device = null;
        this.pipeline = null;
        this.isReady = false;
    }

    async init() {
        if (this.isReady) {
            return;
        }

        try {
            if (!Config.GPU_ENABLED) {
                throw new Error('GPU disabled by config');
            }

            if (!navigator.gpu) {
                throw new Error('WebGPU unavailable');
            }

            const adapter = await navigator.gpu.requestAdapter();

            if (!adapter) {
                throw new Error('No GPU adapter');
            }

            this.device = await adapter.requestDevice();

            const shaderCode = `
                @group(0) @binding(0) var<storage, read> vectors: array<vec4f>;
                @group(0) @binding(1) var<storage, read> query: vec4f;
                @group(0) @binding(2) var<storage, read_write> results: array<f32>;

                @compute @workgroup_size(256)
                fn main(@builtin(global_invocation_id) id: vec3u) {
                    let idx = id.x;

                    if (idx >= arrayLength(&vectors)) {
                        return;
                    }

                    let v = vectors[idx];
                    let q = query;

                    var dot = 0.0;
                    var norm1 = 0.0;
                    var norm2 = 0.0;

                    for (var i = 0; i < 4; i++) {
                        dot += v[i] * q[i];
                        norm1 += v[i] * v[i];
                        norm2 += q[i] * q[i];
                    }

                    if (norm1 > 0.0 && norm2 > 0.0) {
                        results[idx] = dot / (sqrt(norm1) * sqrt(norm2));
                    } else {
                        results[idx] = 0.0;
                    }
                }
            `;

            const shaderModule = this.device.createShaderModule({
                code: shaderCode
            });

            this.pipeline = this.device.createComputePipeline({
                layout: 'auto',
                compute: {
                    module: shaderModule,
                    entryPoint: 'main'
                }
            });

            this.isReady = true;

            Logger.info('GPUEngine', 'WebGPU initialized');
        } catch (error) {
            Logger.warn('GPUEngine', 'WebGPU not available: ' + error.message);
            this.isReady = false;
        }
    }

    async compute(vectors, query) {
        if (!this.isReady || !Config.GPU_ENABLED) {
            return null;
        }

        if (!Array.isArray(vectors) || vectors.length === 0) {
            return null;
        }

        if (typeof GPUBufferUsage === 'undefined' || typeof GPUMapMode === 'undefined') {
            return null;
        }

        try {
            const numVectors = vectors.length;

            const vectorData = new Float32Array(numVectors * 4);

            for (let i = 0; i < numVectors; i++) {
                const item = vectors[i] || {};
                const vec = item.embedding || item;

                if (!Array.isArray(vec)) {
                    continue;
                }

                for (let j = 0; j < 4 && j < vec.length; j++) {
                    vectorData[(i * 4) + j] = vec[j] || 0;
                }
            }

            const queryData = new Float32Array(4);
            const queryItem = query || {};
            const queryVector = queryItem.embedding || queryItem;

            if (Array.isArray(queryVector)) {
                for (let i = 0; i < 4 && i < queryVector.length; i++) {
                    queryData[i] = queryVector[i] || 0;
                }
            }

            const vectorBuffer = this.device.createBuffer({
                size: vectorData.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });

            const queryBuffer = this.device.createBuffer({
                size: queryData.byteLength,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });

            const resultBuffer = this.device.createBuffer({
                size: numVectors * 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
            });

            this.device.queue.writeBuffer(vectorBuffer, 0, vectorData);
            this.device.queue.writeBuffer(queryBuffer, 0, queryData);

            const bindGroup = this.device.createBindGroup({
                layout: this.pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0,
                        resource: {
                            buffer: vectorBuffer
                        }
                    },
                    {
                        binding: 1,
                        resource: {
                            buffer: queryBuffer
                        }
                    },
                    {
                        binding: 2,
                        resource: {
                            buffer: resultBuffer
                        }
                    }
                ]
            });

            const commandEncoder = this.device.createCommandEncoder();
            const passEncoder = commandEncoder.beginComputePass();

            passEncoder.setPipeline(this.pipeline);
            passEncoder.setBindGroup(0, bindGroup);
            passEncoder.dispatchWorkgroups(Math.ceil(numVectors / 256));
            passEncoder.end();

            this.device.queue.submit([commandEncoder.finish()]);

            const readBuffer = this.device.createBuffer({
                size: numVectors * 4,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
            });

            const copyEncoder = this.device.createCommandEncoder();

            copyEncoder.copyBufferToBuffer(
                resultBuffer,
                0,
                readBuffer,
                0,
                numVectors * 4
            );

            this.device.queue.submit([copyEncoder.finish()]);

            await readBuffer.mapAsync(GPUMapMode.READ);

            const resultData = new Float32Array(readBuffer.getMappedRange());
            const results = Array.from(resultData);

            readBuffer.unmap();

            return results;
        } catch (error) {
            Logger.error('GPUEngine', 'Compute failed: ' + error.message);
            return null;
        }
    }

    isAvailable() {
        return this.isReady;
    }
}

// ============================================================
// HNSW ENGINE
// ============================================================
class HNSWEngine {
    constructor() {
        this.graph = new Map();
        this.entryPoint = null;
        this.maxConnections = Config.HNSW_MAX_CONNECTIONS || 16;
        this.efConstruction = Config.HNSW_EF_CONSTRUCTION || 200;
        this.efSearch = Config.HNSW_EF_SEARCH || 50;
        this.layerCount = 0;
        this.vectors = new Map();
    }

    add(vectorId, vector) {
        if (!vectorId || !Array.isArray(vector) || vector.length === 0) {
            return;
        }

        this.vectors.set(vectorId, vector);

        if (!this.entryPoint) {
            this.entryPoint = vectorId;

            this.graph.set(vectorId, {
                neighbors: new Set(),
                layer: 0
            });

            return;
        }

        const neighbors = this._findNearest(vector, this.efConstruction);

        this.graph.set(vectorId, {
            neighbors: new Set(neighbors),
            layer: 0
        });

        for (const neighborId of neighbors) {
            const neighbor = this.graph.get(neighborId);

            if (!neighbor) {
                continue;
            }

            neighbor.neighbors.add(vectorId);

            if (neighbor.neighbors.size > this.maxConnections) {
                const sorted = this._sortNeighbors(neighborId, this.maxConnections);
                neighbor.neighbors = new Set(sorted);
            }
        }

        this.layerCount = Math.max(this.layerCount, 1);
    }

    _findNearest(vector, k) {
        if (!this.entryPoint || !Array.isArray(vector)) {
            return [];
        }

        const candidates = new Map();
        const visited = new Set();

        const entryVec = this.vectors.get(this.entryPoint);

        if (!entryVec) {
            return [];
        }

        const dist = this._cosineDistance(vector, entryVec);

        candidates.set(this.entryPoint, dist);

        let best = this.entryPoint;
        let bestDist = dist;

        for (let i = 0; i < this.efConstruction; i++) {
            let improved = false;

            const current = best;
            const neighbors = this.graph.get(current);

            if (!neighbors) {
                break;
            }

            for (const neighborId of neighbors.neighbors) {
                if (visited.has(neighborId)) {
                    continue;
                }

                visited.add(neighborId);

                const neighborVec = this.vectors.get(neighborId);

                if (!neighborVec) {
                    continue;
                }

                const d = this._cosineDistance(vector, neighborVec);

                candidates.set(neighborId, d);

                if (d < bestDist) {
                    bestDist = d;
                    best = neighborId;
                    improved = true;
                }
            }

            if (!improved) {
                break;
            }
        }

        return Array.from(candidates.entries())
            .sort(function (a, b) {
                return a[1] - b[1];
            })
            .slice(0, k)
            .map(function (item) {
                return item[0];
            });
    }

    _sortNeighbors(vectorId, k) {
        const vector = this.vectors.get(vectorId);

        if (!vector) {
            return [];
        }

        const neighbors = this.graph.get(vectorId);

        if (!neighbors) {
            return [];
        }

        return Array.from(neighbors.neighbors)
            .map(function (id) {
                const vec = this.vectors.get(id);

                return {
                    id: id,
                    dist: vec ? this._cosineDistance(vector, vec) : Infinity
                };
            }.bind(this))
            .sort(function (a, b) {
                return a.dist - b.dist;
            })
            .slice(0, k)
            .map(function (item) {
                return item.id;
            });
    }

    _cosineDistance(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return 1;
        }

        const len = Math.min(a.length, b.length);

        if (len === 0) {
            return 1;
        }

        let dot = 0;
        let normA = 0;
        let normB = 0;

        for (let i = 0; i < len; i++) {
            dot += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }

        if (normA === 0 || normB === 0) {
            return 1;
        }

        return 1 - (dot / (Math.sqrt(normA) * Math.sqrt(normB)));
    }

    search(query, k) {
        k = k || 10;

        if (!this.entryPoint || !Array.isArray(query) || query.length === 0) {
            return [];
        }

        const candidates = new Map();
        const visited = new Set();

        const entryVec = this.vectors.get(this.entryPoint);

        if (!entryVec) {
            return [];
        }

        const dist = this._cosineDistance(query, entryVec);

        candidates.set(this.entryPoint, dist);

        let best = this.entryPoint;
        let bestDist = dist;

        for (let i = 0; i < this.efSearch; i++) {
            let improved = false;

            const current = best;
            const neighbors = this.graph.get(current);

            if (!neighbors) {
                break;
            }

            for (const neighborId of neighbors.neighbors) {
                if (visited.has(neighborId)) {
                    continue;
                }

                visited.add(neighborId);

                const neighborVec = this.vectors.get(neighborId);

                if (!neighborVec) {
                    continue;
                }

                const d = this._cosineDistance(query, neighborVec);

                candidates.set(neighborId, d);

                if (d < bestDist) {
                    bestDist = d;
                    best = neighborId;
                    improved = true;
                }
            }

            if (!improved) {
                break;
            }
        }

        return Array.from(candidates.entries())
            .sort(function (a, b) {
                return a[1] - b[1];
            })
            .slice(0, k)
            .map(function (item) {
                return {
                    id: item[0],
                    similarity: 1 - item[1]
                };
            });
    }

    getStats() {
        return Object.freeze({
            vectors: this.vectors.size,
            layers: this.layerCount,
            entryPoint: this.entryPoint,
            maxConnections: this.maxConnections
        });
    }
}

// ============================================================
// LSH ENGINE
// ============================================================
class LSHEngine {
    constructor() {
        this.buckets = new Map();
        this.numHashFunctions = Config.NUM_HASH_FUNCTIONS || 10;
        this.randomProjections = [];

        this._initRandomProjections();
    }

    _initRandomProjections() {
        const dim = Config.DIMENSION || 384;

        for (let i = 0; i < this.numHashFunctions; i++) {
            const projection = [];

            for (let d = 0; d < dim; d++) {
                projection.push(Math.random() * 2 - 1);
            }

            this.randomProjections.push(projection);
        }
    }

    hash(vector) {
        if (!Array.isArray(vector) || vector.length === 0) {
            return '';
        }

        const hashes = [];

        for (const projection of this.randomProjections) {
            let dot = 0;

            for (let i = 0; i < vector.length && i < projection.length; i++) {
                dot += vector[i] * projection[i];
            }

            hashes.push(dot > 0 ? 1 : 0);
        }

        return hashes.join('');
    }

    add(vectorId, vector) {
        if (!vectorId) {
            return;
        }

        const hash = this.hash(vector);

        if (!hash) {
            return;
        }

        if (!this.buckets.has(hash)) {
            this.buckets.set(hash, new Set());
        }

        this.buckets.get(hash).add(vectorId);
    }

    search(query, candidates) {
        const hash = this.hash(query);

        if (!hash) {
            return [];
        }

        const bucket = this.buckets.get(hash);

        if (!bucket) {
            return [];
        }

        const results = [];

        for (const id of bucket) {
            if (!candidates || candidates.has(id)) {
                results.push(id);
            }
        }

        return results;
    }

    getStats() {
        let totalSize = 0;

        for (const bucket of this.buckets.values()) {
            totalSize += bucket.size;
        }

        return Object.freeze({
            buckets: this.buckets.size,
            hashFunctions: this.numHashFunctions,
            averageBucketSize: this.buckets.size > 0
                ? Math.round(totalSize / this.buckets.size)
                : 0
        });
    }

    clear() {
        this.buckets.clear();
    }
}

export { WASMEngine, GPUEngine, HNSWEngine, LSHEngine };

KESEMPATAN.Memory.WASMEngine = WASMEngine;
KESEMPATAN.Memory.GPUEngine = GPUEngine;
KESEMPATAN.Memory.HNSWEngine = HNSWEngine;
KESEMPATAN.Memory.LSHEngine = LSHEngine;

Logger.info('MemoryEngines', 'Engines loaded');
