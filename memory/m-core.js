import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';
import { MemoryUtils } from './m-utilities.js';
import { calculateSimilarity } from './m-metrics.js';
import { WASMEngine, GPUEngine, HNSWEngine, LSHEngine } from './m-engines.js';
import { ProductQuantization } from './m-quantization.js';
import { DistributedIndex } from './m-indexers.js';
import { MultimodalEmbedding } from './m-embeddings.js';
import { AutoTuner } from './m-tuner.js';
import { FederatedLearning } from './m-federated-learning.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Config = MemoryConfig;
const Logger = Utils.Logger;

// ============================================================
// KONTRAK PENYIMPANAN — FROZEN
// JANGAN rename STORAGE_KEY. Evolusi format data dilakukan
// lewat SCHEMA_VERSION di DALAM payload, bukan ganti nama kunci.
// ============================================================
const STORAGE_KEY = 'kes_vector_memory';
const SCHEMA_VERSION = 1;

// ============================================================
// MAIN CLASS
// ============================================================
class VectorMemoryCore {
    constructor() {
        this.wasm = typeof WASMEngine === 'function'
            ? new WASMEngine()
            : {
                load: async function () {},
                isLoaded: function () {
                    return false;
                },
                cosineSimilarity: function () {
                    return 0;
                }
            };

        this.gpu = typeof GPUEngine === 'function'
            ? new GPUEngine()
            : {
                init: async function () {},
                isAvailable: function () {
                    return false;
                },
                compute: async function () {
                    return null;
                }
            };

        this.pq = typeof ProductQuantization === 'function'
            ? new ProductQuantization()
            : {
                train: async function () {},
                encode: function (vector) {
                    return vector;
                },
                decode: function () {
                    return null;
                },
                isTrained: function () {
                    return false;
                }
            };

        this.lsh = typeof LSHEngine === 'function'
            ? new LSHEngine()
            : {
                add: function () {},
                search: function () {
                    return [];
                },
                clear: function () {},
                getStats: function () {
                    return {
                        buckets: 0
                    };
                }
            };

        this.hnsw = typeof HNSWEngine === 'function'
            ? new HNSWEngine()
            : {
                add: function () {},
                search: function () {
                    return [];
                },
                entryPoint: null,
                getStats: function () {
                    return {
                        vectors: 0
                    };
                }
            };

        this.distributed = typeof DistributedIndex === 'function'
            ? new DistributedIndex()
            : {
                add: function () {},
                search: async function () {
                    return [];
                },
                getStats: function () {
                    return {
                        totalVectors: 0
                    };
                },
                clear: function () {}
            };

        this.multimodal = typeof MultimodalEmbedding === 'function'
            ? new MultimodalEmbedding()
            : {
                load: async function () {},
                embed: async function () {
                    return [];
                },
                embedText: async function () {
                    return [];
                },
                isLoaded: function () {
                    return false;
                }
            };

        this.tuner = typeof AutoTuner === 'function'
            ? new AutoTuner()
            : {
                tune: async function () {
                    return null;
                },
                getStats: function () {
                    return {};
                }
            };

        this.vectors = [];
        this.index = new Map();
        this.cache = new Map();
        this.isLoaded = false;
        this._indexRebuilt = false;

        this.stats = {
            totalVectors: 0,
            searches: 0,
            averageSearchTime: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this._readyPromise = this._init();
    }

    // ============================================================
    // INIT
    // ============================================================
    async _init() {
        try {
            await this.wasm.load();
            await this.gpu.init();
            await this.multimodal.load();
            await this._loadFromStorage();

            if (this.vectors.length > 100) {
                await this.pq.train(this.vectors.slice(0, 1000));
            }

            setTimeout(function () {
                this._rebuildIndex();
            }.bind(this), 5000);

            if (this.vectors.length > 10) {
                const testQueries = this.vectors.slice(0, 10).map(function (item) {
                    return item.text;
                });

                await this.tuner.tune(this.vectors, testQueries);
            }

            this.isLoaded = true;

            Logger.info('VectorMemoryCore', 'Loaded ' + this.vectors.length + ' vectors');
        } catch (error) {
            Logger.error('VectorMemoryCore', 'Init failed: ' + error.message);
        }
    }

    // ============================================================
    // REBUILD INDEX
    // ============================================================
    _rebuildIndex() {
        if (this._indexRebuilt) {
            return;
        }

        if (this.vectors.length === 0) {
            return;
        }

        const startTime = Date.now();

        Logger.info('VectorMemoryCore', 'Rebuilding index for ' + this.vectors.length + ' vectors');

        for (const vector of this.vectors) {
            if (!vector || !Array.isArray(vector.embedding)) {
                continue;
            }

            this.hnsw.add(vector.id, vector.embedding);
            this.lsh.add(vector.id, vector.embedding);
            this.distributed.add(vector);
        }

        this._indexRebuilt = true;

        const elapsed = Date.now() - startTime;

        Logger.info('VectorMemoryCore', 'Index rebuilt in ' + elapsed + 'ms');
    }

    // ============================================================
    // STORAGE
    // ============================================================
    async _loadFromStorage() {
        const data = MemoryUtils.loadFromStorage
            ? MemoryUtils.loadFromStorage(STORAGE_KEY)
            : this._fallbackLoad();

        if (data) {
            const version = data.schemaVersion || 1;

            this.vectors = Array.isArray(data.vectors) ? data.vectors : [];
            this.stats = data.stats || this.stats;

            if (version > SCHEMA_VERSION) {
                Logger.warn('VectorMemoryCore', 'Data schema lebih baru dari kode: ' + version);
            }
        }
    }

    _fallbackLoad() {
        try {
            if (typeof localStorage === 'undefined') {
                return null;
            }

            const data = localStorage.getItem(STORAGE_KEY);

            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }

    async _saveToStorage() {
        const saved = MemoryUtils.saveToStorage
            ? MemoryUtils.saveToStorage(STORAGE_KEY, {
                schemaVersion: SCHEMA_VERSION,
                vectors: this.vectors,
                stats: this.stats
            })
            : this._fallbackSave();

        return saved;
    }

    _fallbackSave() {
        try {
            if (typeof localStorage === 'undefined') {
                return false;
            }

            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                schemaVersion: SCHEMA_VERSION,
                vectors: this.vectors,
                stats: this.stats
            }));

            return true;
        } catch (error) {
            return false;
        }
    }

    // ============================================================
    // ID GENERATOR
    // ============================================================
    _generateId() {
        if (MemoryUtils.generateId) {
            return MemoryUtils.generateId();
        }

        return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
    }

    // ============================================================
    // SIMPLE EMBEDDING
    // ============================================================
    async _simpleEmbed(text) {
        if (MemoryUtils.simpleEmbed) {
            return MemoryUtils.simpleEmbed(text);
        }

        const dim = Config.DIMENSION || 384;
        const vec = new Array(dim).fill(0);
        const safeText = String(text || '');

        if (!safeText) {
            return vec;
        }

        const words = safeText
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, '')
            .split(/\s+/)
            .filter(function (word) {
                return word.length > 0;
            });

        if (words.length === 0) {
            return vec;
        }

        for (const word of words) {
            let hash = 0;

            for (let i = 0; i < word.length; i++) {
                hash = ((hash << 5) - hash) + word.charCodeAt(i);
                hash |= 0;
            }

            const idx = Math.abs(hash) % dim;

            vec[idx] += 1 / words.length;
        }

        const norm = Math.sqrt(vec.reduce(function (sum, value) {
            return sum + value * value;
        }, 0));

        if (norm > 0) {
            for (let i = 0; i < dim; i++) {
                vec[i] /= norm;
            }
        }

        return vec;
    }

    // ============================================================
    // SAVE
    // ============================================================
    async save(text, metadata, image, audio) {
        metadata = metadata || {};

        let embedding;

        if (this.multimodal.isLoaded() && Config.MULTIMODAL_ENABLED) {
            embedding = await this.multimodal.embed(text, image, audio);
        } else {
            embedding = await this._simpleEmbed(text);
        }

        const vector = {
            id: this._generateId(),
            text: String(text || ''),
            embedding: embedding,
            metadata: metadata,
            timestamp: Date.now()
        };

        this.vectors.push(vector);
        this.index.set(vector.id, vector);

        if (this._indexRebuilt) {
            this.hnsw.add(vector.id, embedding);
            this.lsh.add(vector.id, embedding);
            this.distributed.add(vector);
        }

        this.cache.set(vector.id, vector);

        const persisted = await this._saveToStorage();
        if (!persisted) {
            Logger.warn('VectorMemoryCore', 'Persist failed (storage quota?) — memory kept in-session only, will be lost on reload: ' + vector.id);
        }

        this.stats.totalVectors = this.vectors.length;

        if (this.vectors.length > Config.MAX_MEMORY) {
            await this.prune();
        }

        if (Config.FEDERATED_LEARNING_ENABLED && FederatedLearning) {
            FederatedLearning.sync({
                agentPreferences: metadata.agentPreferences || {},
                agentWeights: metadata.agentWeights || {},
                qTable: metadata.qTable || {}
            });
        }

        return vector;
    }

    // ============================================================
    // SEARCH
    // ============================================================
    async search(query, options) {
        if (!this._indexRebuilt && this.vectors.length > 0) {
            this._rebuildIndex();
        }

        const startTime = performance.now();

        options = options || {};

        const topK = options.topK || 5;
        const metric = options.metric || 'cosine';
        const threshold = options.threshold || Config.SIMILARITY_THRESHOLD || 0.1;
        const filter = options.filter || null;
        const useCache = options.useCache !== undefined ? options.useCache : true;
        const useGPU = options.useGPU !== undefined ? options.useGPU : true;
        const useLSH = options.useLSH !== undefined ? options.useLSH : true;
        const useHNSW = options.useHNSW !== undefined ? options.useHNSW : true;

        const cacheKey = String(query) + '|' + topK + '|' + metric;

        if (useCache) {
            const cached = this.cache.get(cacheKey);

            if (cached) {
                this.stats.cacheHits++;
                this.stats.searches++;

                return cached;
            }

            this.stats.cacheMisses++;
        }

        let queryEmbedding;

        if (this.multimodal.isLoaded() && Config.MULTIMODAL_ENABLED) {
            queryEmbedding = await this.multimodal.embedText(query);
        } else {
            queryEmbedding = await this._simpleEmbed(query);
        }

        let results = [];

        if (useGPU && this.gpu.isAvailable()) {
            const gpuResults = await this.gpu.compute(this.vectors, queryEmbedding);

            if (Array.isArray(gpuResults)) {
                results = this.vectors.map(function (vector, index) {
                    return Object.assign({}, vector, {
                        similarity: gpuResults[index] || 0
                    });
                });
            }
        }

        if (useHNSW && this.hnsw.entryPoint && results.length === 0) {
            const hnswResults = this.hnsw.search(queryEmbedding, topK * 2);

            const ids = hnswResults.map(function (item) {
                return item.id;
            });

            results = this.vectors.filter(function (vector) {
                return ids.includes(vector.id);
            });

            results.forEach(function (vector) {
                const found = hnswResults.find(function (item) {
                    return item.id === vector.id;
                });

                vector.similarity = found ? found.similarity : 0;
            });
        }

        if (useLSH && results.length < topK) {
            const lshIds = this.lsh.search(queryEmbedding, new Set(this.vectors.map(function (vector) {
                return vector.id;
            })));

            const lshResults = this.vectors.filter(function (vector) {
                return lshIds.includes(vector.id);
            });

            const merged = new Map();

            for (const vector of results) {
                merged.set(vector.id, vector);
            }

            for (const vector of lshResults) {
                if (!merged.has(vector.id)) {
                    const similarity = calculateSimilarity
                        ? calculateSimilarity(queryEmbedding, vector.embedding, metric)
                        : this._calculateSimilarity(queryEmbedding, vector.embedding);

                    vector.similarity = similarity;

                    merged.set(vector.id, vector);
                }
            }

            results = Array.from(merged.values());
        }

        if (results.length < topK) {
            const scored = this.vectors.map(function (vector) {
                return Object.assign({}, vector, {
                    similarity: calculateSimilarity
                        ? calculateSimilarity(queryEmbedding, vector.embedding, metric)
                        : this._calculateSimilarity(queryEmbedding, vector.embedding)
                });
            }.bind(this));

            const filtered = scored.filter(function (vector) {
                return vector.similarity > threshold;
            });

            const merged = new Map();

            for (const vector of results) {
                merged.set(vector.id, vector);
            }

            for (const vector of filtered) {
                if (!merged.has(vector.id)) {
                    merged.set(vector.id, vector);
                }
            }

            results = Array.from(merged.values());
        }

        results.sort(function (a, b) {
            return b.similarity - a.similarity;
        });

        if (filter) {
            results = results.filter(function (vector) {
                for (const key in filter) {
                    if (!vector.metadata || vector.metadata[key] !== filter[key]) {
                        return false;
                    }
                }

                return true;
            });
        }

        const staticData = Array.isArray(window.__STATIC_DATA)
            ? window.__STATIC_DATA
            : [];

        let staticResults = [];

        if (staticData.length > 0 && !options.skipStatic) {
            const keywords = String(query || '')
                .toLowerCase()
                .split(/\s+/)
                .filter(function (keyword) {
                    return keyword.length > 0;
                });

            staticResults = staticData.filter(function (item) {
                const text = String(item.text || '').toLowerCase();

                return keywords.some(function (keyword) {
                    return text.includes(keyword);
                });
            }).slice(0, topK);

            if (staticResults.length > 0) {
                staticResults = staticResults.map(function (item) {
                    return Object.assign({}, item, {
                        similarity: 0.5,
                        _source: 'static'
                    });
                });

                const combined = results.concat(staticResults);

                combined.sort(function (a, b) {
                    return b.similarity - a.similarity;
                });

                results = combined.slice(0, topK);
            }
        }

        if (useCache) {
            this.cache.set(cacheKey, results);
        }

        this.stats.searches++;

        const duration = performance.now() - startTime;

        this.stats.averageSearchTime =
            (this.stats.averageSearchTime * (this.stats.searches - 1) + duration) / this.stats.searches;

        return results;
    }

    _calculateSimilarity(vec1, vec2) {
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

    // ============================================================
    // PUBLIC METHODS
    // ============================================================
    async get(id) {
        const vector = this.vectors.find(function (item) {
            return item.id === id;
        }) || this.index.get(id) || null;

        if (vector) {
            this.stats.cacheHits++;
        }

        return vector;
    }

    async delete(id) {
        const index = this.vectors.findIndex(function (item) {
            return item.id === id;
        });

        if (index !== -1) {
            this.vectors.splice(index, 1);
            this.index.delete(id);
            this.cache.delete(id);

            await this._saveToStorage();

            return true;
        }

        return false;
    }

    async prune() {
        const now = Date.now();
        const expiryTime = 7 * 24 * 60 * 60 * 1000;

        this.vectors = this.vectors.filter(function (vector) {
            return now - vector.timestamp < expiryTime;
        });

        if (this.vectors.length > Config.MAX_MEMORY) {
            this.vectors.sort(function (a, b) {
                return a.timestamp - b.timestamp;
            });

            this.vectors = this.vectors.slice(-Config.MAX_MEMORY);
        }

        this.index.clear();

        for (const vector of this.vectors) {
            this.index.set(vector.id, vector);
        }

        await this._saveToStorage();

        Logger.info('VectorMemoryCore', 'Pruned to ' + this.vectors.length + ' vectors');
    }

    async optimize() {
        this.hnsw = typeof HNSWEngine === 'function'
            ? new HNSWEngine()
            : this.hnsw;

        if (this.lsh && typeof this.lsh.clear === 'function') {
            this.lsh.clear();
        }

        for (const vector of this.vectors) {
            if (!vector || !Array.isArray(vector.embedding)) {
                continue;
            }

            this.hnsw.add(vector.id, vector.embedding);
            this.lsh.add(vector.id, vector.embedding);
        }

        if (this.vectors.length > 100) {
            await this.pq.train(this.vectors.slice(0, 1000));
        }

        this.cache.clear();

        Logger.info('VectorMemoryCore', 'Optimized all indexes');
    }

    async clear() {
        this.vectors = [];

        this.index.clear();
        this.cache.clear();

        this.hnsw = typeof HNSWEngine === 'function'
            ? new HNSWEngine()
            : this.hnsw;

        if (this.lsh && typeof this.lsh.clear === 'function') {
            this.lsh.clear();
        }

        await this._saveToStorage();

        Logger.info('VectorMemoryCore', 'Cleared all vectors');
    }

    async getStats() {
        const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0
            ? Math.round((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100) + '%'
            : '0%';

        const staticCount = Array.isArray(window.__STATIC_DATA)
            ? window.__STATIC_DATA.length
            : 0;

        return {
            total: this.vectors.length,
            limit: Config.MAX_MEMORY,
            staticData: staticCount,
            searches: this.stats.searches,
            averageSearchTime: this.stats.averageSearchTime.toFixed(2) + 'ms',
            cacheHitRate: hitRate,
            wasm: !!(this.wasm && typeof this.wasm.isLoaded === 'function' && this.wasm.isLoaded()),
            gpu: !!(this.gpu && typeof this.gpu.isAvailable === 'function' && this.gpu.isAvailable()),
            pq: !!(this.pq && typeof this.pq.isTrained === 'function' && this.pq.isTrained()),
            hnsw: !!this.hnsw.entryPoint,
            lsh: this.lsh.getStats().buckets > 0,
            multimodal: !!(this.multimodal && typeof this.multimodal.isLoaded === 'function' && this.multimodal.isLoaded()),
            distributed: this.distributed.getStats().totalVectors,
            autoTuner: this.tuner.getStats(),
            dimension: Config.DIMENSION,
            federated: !!Config.FEDERATED_LEARNING_ENABLED
        };
    }

    async exportJSON() {
        return JSON.stringify({
            exportDate: new Date().toISOString(),
            vectors: this.vectors,
            stats: this.stats
        }, null, 2);
    }

    async importJSON(jsonStr, merge) {
        merge = merge !== undefined ? merge : true;

        try {
            const data = JSON.parse(jsonStr);

            if (!data.vectors || !Array.isArray(data.vectors)) {
                throw new Error('Invalid format');
            }

            if (!merge) {
                this.vectors = [];
                this.index.clear();
                this.cache.clear();
            }

            this.vectors.push.apply(this.vectors, data.vectors);

            for (const vector of data.vectors) {
                this.index.set(vector.id, vector);
            }

            await this._saveToStorage();
            await this.optimize();

            Logger.info('VectorMemoryCore', 'Imported ' + data.vectors.length + ' vectors');

            return true;
        } catch (error) {
            Logger.error('VectorMemoryCore', 'Import failed: ' + error.message);

            return false;
        }
    }

    async batchSave(items) {
        const results = [];

        if (!Array.isArray(items)) {
            return results;
        }

        const batchSize = Config.BATCH_SIZE || 1000;

        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);

            const promises = batch.map(function (item) {
                return this.save(item.text, item.metadata, item.image, item.audio);
            }.bind(this));

            const batchResults = await Promise.all(promises);

            results.push.apply(results, batchResults);
        }

        return results;
    }

    getAnalytics() {
        const hitRate = this.stats.cacheHits + this.stats.cacheMisses > 0
            ? Math.round((this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses)) * 100)
            : 0;

        const staticCount = Array.isArray(window.__STATIC_DATA)
            ? window.__STATIC_DATA.length
            : 0;

        return {
            totalVectors: this.vectors.length,
            staticData: staticCount,
            searches: this.stats.searches,
            averageSearchTime: this.stats.averageSearchTime,
            cacheHitRate: hitRate,
            wasm: !!(this.wasm && typeof this.wasm.isLoaded === 'function' && this.wasm.isLoaded()),
            gpu: !!(this.gpu && typeof this.gpu.isAvailable === 'function' && this.gpu.isAvailable()),
            pq: !!(this.pq && typeof this.pq.isTrained === 'function' && this.pq.isTrained()),
            hnsw: !!this.hnsw.entryPoint,
            lsh: this.lsh.getStats().buckets,
            multimodal: !!(this.multimodal && typeof this.multimodal.isLoaded === 'function' && this.multimodal.isLoaded()),
            distributed: this.distributed.getStats().totalVectors,
            federated: !!Config.FEDERATED_LEARNING_ENABLED
        };
    }

    getFederatedWeights() {
        if (FederatedLearning) {
            return FederatedLearning.getGlobalWeights();
        }

        return {};
    }

    async syncFederated() {
        if (FederatedLearning) {
            return await FederatedLearning.sync({
                agentPreferences: {},
                agentWeights: {},
                qTable: {}
            });
        }

        return false;
    }
}

export { VectorMemoryCore };

KESEMPATAN.Memory.VectorMemoryCore = VectorMemoryCore;
KESEMPATAN.Memory.VectorMemoryEngine = VectorMemoryCore;

// Bridge for consumers not yet migrated to import { VectorMemoryCore } from './m-core.js'.
window._memoryClass = VectorMemoryCore;

if (window._memoryModules) {
    window._memoryModules.core = true;
}

if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('memory-core-ready'));
}

Logger.info('MemoryCore', 'Core class exposed to global');
