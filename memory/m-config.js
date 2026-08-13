const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

export const MemoryConfig = Object.freeze({
    DIMENSION: 384,
    // Eviction threshold for _saveToStorage()'s localStorage backing (JSON.stringify
    // of the full vectors array on every save). A 384-dim embedding + metadata
    // serializes to roughly 8-9KB per record, and localStorage quota is realistically
    // ~5-10MB total (shared with every other key this app uses) — the old value
    // (10,000,000) was far above what any browser can hold, so prune() (which IS
    // already called automatically from save() whenever this threshold is exceeded)
    // never ran before QuotaExceededError started silently failing every write. 500
    // records is ~4-4.5MB worst case, leaving headroom for the rest of the app's
    // localStorage usage.
    MAX_MEMORY: 500,
    CACHE_TTL: 3600000,
    BATCH_SIZE: 1000,
    SIMILARITY_THRESHOLD: 0.1,
    AUTO_OPTIMIZE_INTERVAL: 300000,
    ENCRYPTION_ENABLED: true,
    INDEX_REBUILD_THRESHOLD: 10000,
    NUM_SHARDS: 4,
    NUM_HASH_FUNCTIONS: 10,
    PQ_SUBVECTORS: 8,
    PQ_CENTROIDS: 256,
    HNSW_MAX_CONNECTIONS: 16,
    HNSW_EF_CONSTRUCTION: 200,
    HNSW_EF_SEARCH: 50,
    GPU_ENABLED: true,
    WASM_ENABLED: false,
    MULTIMODAL_ENABLED: true,
    FEDERATED_LEARNING_ENABLED: true,
    AUTO_TUNE_K_FOLD: 5,
    WASM_PATH: 'vector_memory.wasm'
});

KESEMPATAN.Memory.MemoryConfig = MemoryConfig;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('MemoryConfig', 'Loaded');
}
