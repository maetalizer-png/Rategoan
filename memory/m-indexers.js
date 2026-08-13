import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';
import { calculateSimilarity } from './m-metrics.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

export class DistributedIndex {
    constructor() {
        this.shards = new Map();
        this.numShards = Config.NUM_SHARDS || 4;
        this.isReady = false;

        for (let i = 0; i < this.numShards; i++) {
            this.shards.set(i, {
                vectors: [],
                index: new Map(),
                count: 0
            });
        }
    }

    _getShardId(vectorId) {
        const id = String(vectorId || '');

        if (!id) {
            return 0;
        }

        let hash = 0;

        for (let i = 0; i < id.length; i++) {
            hash = ((hash << 5) - hash) + id.charCodeAt(i);
            hash |= 0;
        }

        return Math.abs(hash) % this.numShards;
    }

    add(vector) {
        if (!vector || vector.id === undefined || vector.id === null) {
            return false;
        }

        const shardId = this._getShardId(vector.id);
        const shard = this.shards.get(shardId);

        if (!shard) {
            return false;
        }

        shard.vectors.push(vector);
        shard.index.set(vector.id, vector);
        shard.count++;

        return true;
    }

    async search(query, options) {
        if (!Array.isArray(query) || query.length === 0) {
            return [];
        }

        options = options || {};

        const topK = options.topK || 5;
        const metric = options.metric || 'cosine';
        const threshold = options.threshold || 0.1;

        const results = await Promise.all(
            Array.from(this.shards.values()).map(async function (shard) {
                const validVectors = shard.vectors.filter(function (item) {
                    return item && Array.isArray(item.embedding) && item.embedding.length > 0;
                });

                const scored = validVectors.map(function (item) {
                    const similarity = calculateSimilarity
                        ? calculateSimilarity(query, item.embedding, metric)
                        : this._cosineSimilarity(query, item.embedding);

                    return Object.assign({}, item, {
                        similarity: similarity
                    });
                }.bind(this));

                return scored
                    .filter(function (item) {
                        return item.similarity > threshold;
                    })
                    .sort(function (a, b) {
                        return b.similarity - a.similarity;
                    })
                    .slice(0, topK);
            }.bind(this))
        );

        return results.flat()
            .sort(function (a, b) {
                return b.similarity - a.similarity;
            })
            .slice(0, topK);
    }

    _cosineSimilarity(vec1, vec2) {
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

    getStats() {
        const stats = {
            totalVectors: 0,
            shards: []
        };

        for (const [id, shard] of this.shards) {
            stats.shards.push({
                id: id,
                count: shard.count,
                vectorCount: shard.vectors.length
            });

            stats.totalVectors += shard.count;
        }

        return stats;
    }

    clear() {
        for (const shard of this.shards.values()) {
            shard.vectors = [];
            shard.index.clear();
            shard.count = 0;
        }
    }
}

KESEMPATAN.Memory.DistributedIndex = DistributedIndex;

Logger.info('MemoryIndexers', 'Distributed Index loaded');
