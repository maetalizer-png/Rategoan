import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

export class ProductQuantization {
    constructor() {
        this.subvectors = Config.PQ_SUBVECTORS || 8;
        this.centroids = Config.PQ_CENTROIDS || 256;
        this.codebooks = [];
        this.isReady = false;
    }

    async train(vectors) {
        const validVectors = Array.isArray(vectors)
            ? vectors.filter(function (item) {
                return item && Array.isArray(item.embedding) && item.embedding.length > 0;
            })
            : [];

        if (validVectors.length < 100) {
            return;
        }

        try {
            const dim = validVectors[0].embedding.length;
            const subDim = Math.floor(dim / this.subvectors);

            if (subDim <= 0) {
                return;
            }

            this.codebooks = [];

            for (let s = 0; s < this.subvectors; s++) {
                const start = s * subDim;
                const end = (s === this.subvectors - 1) ? dim : (s + 1) * subDim;

                const subVectors = validVectors.map(function (item) {
                    return item.embedding.slice(start, end);
                });

                const codebook = this._kmeans(subVectors, this.centroids);

                this.codebooks.push(codebook);
            }

            this.isReady = true;

            Logger.info('PQ', 'Trained with ' + this.subvectors + ' subvectors');
        } catch (error) {
            Logger.error('PQ', 'Training failed: ' + error.message);
        }
    }

    _kmeans(data, k) {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }

        const maxIter = 20;
        const dim = data[0].length;
        const safeK = Math.min(k, data.length);
        const centroids = [];

        for (let i = 0; i < safeK; i++) {
            const idx = Math.floor(Math.random() * data.length);
            centroids.push(data[idx].slice());
        }

        for (let iter = 0; iter < maxIter; iter++) {
            const clusters = new Array(safeK);

            for (let i = 0; i < safeK; i++) {
                clusters[i] = [];
            }

            for (const point of data) {
                let minDist = Infinity;
                let minIdx = 0;

                for (let i = 0; i < safeK; i++) {
                    const dist = this._euclideanDistance(point, centroids[i]);

                    if (dist < minDist) {
                        minDist = dist;
                        minIdx = i;
                    }
                }

                clusters[minIdx].push(point);
            }

            for (let i = 0; i < safeK; i++) {
                if (clusters[i].length === 0) {
                    continue;
                }

                const newCentroid = new Array(dim).fill(0);

                for (const point of clusters[i]) {
                    for (let d = 0; d < dim; d++) {
                        newCentroid[d] += point[d];
                    }
                }

                for (let d = 0; d < dim; d++) {
                    newCentroid[d] /= clusters[i].length;
                }

                centroids[i] = newCentroid;
            }
        }

        return centroids;
    }

    _euclideanDistance(a, b) {
        if (!Array.isArray(a) || !Array.isArray(b)) {
            return Infinity;
        }

        const len = Math.min(a.length, b.length);

        if (len === 0) {
            return Infinity;
        }

        let sum = 0;

        for (let i = 0; i < len; i++) {
            const diff = a[i] - b[i];
            sum += diff * diff;
        }

        return Math.sqrt(sum);
    }

    encode(vector) {
        if (!this.isReady || !Array.isArray(vector) || vector.length === 0) {
            return vector;
        }

        const dim = vector.length;
        const subDim = Math.floor(dim / this.subvectors);

        if (subDim <= 0) {
            return vector;
        }

        const codes = [];

        for (let s = 0; s < this.subvectors; s++) {
            const start = s * subDim;
            const end = (s === this.subvectors - 1) ? dim : (s + 1) * subDim;
            const subVec = vector.slice(start, end);
            const codebook = this.codebooks[s];

            if (!Array.isArray(codebook) || codebook.length === 0) {
                codes.push(0);
                continue;
            }

            let minDist = Infinity;
            let minIdx = 0;

            for (let i = 0; i < codebook.length; i++) {
                const dist = this._euclideanDistance(subVec, codebook[i]);

                if (dist < minDist) {
                    minDist = dist;
                    minIdx = i;
                }
            }

            codes.push(minIdx);
        }

        return codes;
    }

    decode(codes) {
        if (!this.isReady || !Array.isArray(codes)) {
            return null;
        }

        const dim = Config.DIMENSION || 384;
        const subDim = Math.floor(dim / this.subvectors);

        if (subDim <= 0) {
            return null;
        }

        const vector = new Array(dim).fill(0);

        for (let s = 0; s < this.subvectors; s++) {
            const start = s * subDim;
            const end = (s === this.subvectors - 1) ? dim : (s + 1) * subDim;
            const codebook = this.codebooks[s];

            if (!Array.isArray(codebook)) {
                continue;
            }

            const centroid = codebook[codes[s]] || new Array(end - start).fill(0);

            for (let i = start; i < end; i++) {
                vector[i] = centroid[i - start] || 0;
            }
        }

        return vector;
    }

    isTrained() {
        return this.isReady;
    }
}

KESEMPATAN.Memory.ProductQuantization = ProductQuantization;

Logger.info('MemoryQuantization', 'Product Quantization loaded');
