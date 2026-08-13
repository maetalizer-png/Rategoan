import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

export class AutoTuner {
    constructor() {
        this.scores = [];
        this.bestConfig = null;
    }

    async tune(vectors, testQueries) {
        const safeVectors = Array.isArray(vectors) ? vectors : [];
        const safeQueries = Array.isArray(testQueries) ? testQueries : [];

        if (safeVectors.length === 0 || safeQueries.length === 0) {
            this.bestConfig = null;

            return null;
        }

        const configs = this._generateConfigs();
        const results = [];

        for (const config of configs) {
            const score = await this._crossValidate(config, safeVectors, safeQueries);

            results.push({
                config: config,
                score: score
            });

            this.scores.push({
                config: config,
                score: score
            });
        }

        results.sort(function (a, b) {
            return b.score - a.score;
        });

        this.bestConfig = results[0] ? results[0].config : null;

        Logger.info('AutoTuner', 'Best config selected');

        return this.bestConfig;
    }

    _generateConfigs() {
        return [
            {
                dimension: 128,
                threshold: 0.2,
                metric: 'cosine'
            },
            {
                dimension: 384,
                threshold: 0.15,
                metric: 'cosine'
            },
            {
                dimension: 768,
                threshold: 0.1,
                metric: 'cosine'
            },
            {
                dimension: 384,
                threshold: 0.15,
                metric: 'euclidean'
            },
            {
                dimension: 384,
                threshold: 0.15,
                metric: 'manhattan'
            }
        ];
    }

    async _crossValidate(config, vectors, testQueries) {
        const kFold = Config.AUTO_TUNE_K_FOLD || 5;

        if (!Array.isArray(vectors) || vectors.length === 0) {
            return 0;
        }

        const safeKFold = Math.max(1, Math.min(kFold, vectors.length));
        const foldSize = Math.max(1, Math.floor(vectors.length / safeKFold));

        const scores = [];
        const shuffled = vectors.slice();

        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = shuffled[i];

            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }

        for (let fold = 0; fold < safeKFold; fold++) {
            const start = fold * foldSize;
            const end = Math.min(shuffled.length, (fold + 1) * foldSize);

            const test = shuffled.slice(start, end);
            const train = shuffled.slice(0, start).concat(shuffled.slice(end));

            const model = await this._trainModel(train, config);
            const score = await this._evaluateModel(model, test, config);

            scores.push(score);
        }

        if (scores.length === 0) {
            return 0;
        }

        return scores.reduce(function (a, b) {
            return a + b;
        }, 0) / scores.length;
    }

    async _trainModel(vectors, config) {
        return {
            vectors: vectors,
            config: config
        };
    }

    async _evaluateModel(model, testVectors, config) {
        if (!Array.isArray(testVectors) || testVectors.length === 0) {
            return 0;
        }

        if (!model || !Array.isArray(model.vectors) || model.vectors.length === 0) {
            return 0;
        }

        const calcSim = KESEMPATAN.Memory.calculateSimilarity;

        if (typeof calcSim !== 'function') {
            return 0;
        }

        // Hormati config.dimension yang sedang diuji — potong ke N dimensi
        // pertama supaya parameter ini benar-benar memengaruhi hasil
        // evaluasi (sebelumnya cuma duduk di objek config, tak terpakai).
        const truncate = function (embedding) {
            return Array.isArray(embedding) && config.dimension
                ? embedding.slice(0, config.dimension)
                : embedding;
        };

        let totalScore = 0;
        let scored = 0;

        for (const test of testVectors) {
            if (!test || !Array.isArray(test.embedding)) {
                continue;
            }

            const testVec = truncate(test.embedding);
            let bestSim = -Infinity;

            for (const trainItem of model.vectors) {
                if (!trainItem || !Array.isArray(trainItem.embedding)) {
                    continue;
                }

                const sim = calcSim(testVec, truncate(trainItem.embedding), config.metric);

                if (sim > bestSim) {
                    bestSim = sim;
                }
            }

            if (bestSim > -Infinity) {
                totalScore += Math.max(0, bestSim);
                scored++;
            }
        }

        if (scored === 0) {
            return 0;
        }

        return (totalScore / scored) * 100;
    }

    getBest() {
        return this.bestConfig;
    }

    getStats() {
        let avgScore = 0;

        if (this.scores.length > 0) {
            const sum = this.scores.reduce(function (s, item) {
                return s + item.score;
            }, 0);

            avgScore = Math.round(sum / this.scores.length);
        }

        return {
            totalConfigs: this.scores.length,
            best: this.bestConfig,
            averageScore: avgScore
        };
    }
}

KESEMPATAN.Memory.AutoTuner = AutoTuner;

Logger.info('MemoryTuner', 'Auto-Tuner loaded');
