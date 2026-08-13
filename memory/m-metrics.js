import { Utils } from '../js/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;

const Metrics = Object.freeze({
    COSINE: 'cosine',
    EUCLIDEAN: 'euclidean',
    MANHATTAN: 'manhattan',
    DOT_PRODUCT: 'dot_product',
    JACCARD: 'jaccard',
    PEARSON: 'pearson',
    SPEARMAN: 'spearman',
    KENDALL: 'kendall',
    HAMMING: 'hamming',
    CHEBYSHEV: 'chebyshev'
});

// ============================================================
// SAFE HELPERS
// ============================================================
function isValidVector(vec) {
    return Array.isArray(vec) && vec.length > 0;
}

function getSharedLength(vec1, vec2) {
    if (!isValidVector(vec1) || !isValidVector(vec2)) {
        return 0;
    }

    return Math.min(vec1.length, vec2.length);
}

// ============================================================
// METRIC FUNCTIONS
// ============================================================
function cosineSimilarity(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

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

function euclideanDistance(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let sum = 0;

    for (let i = 0; i < len; i++) {
        const diff = vec1[i] - vec2[i];
        sum += diff * diff;
    }

    return Math.sqrt(sum);
}

function manhattanDistance(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let sum = 0;

    for (let i = 0; i < len; i++) {
        sum += Math.abs(vec1[i] - vec2[i]);
    }

    return sum;
}

function dotProduct(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let sum = 0;

    for (let i = 0; i < len; i++) {
        sum += vec1[i] * vec2[i];
    }

    return sum;
}

function jaccardSimilarity(vec1, vec2) {
    if (!isValidVector(vec1) || !isValidVector(vec2)) {
        return 0;
    }

    const set1 = new Set(vec1);
    const set2 = new Set(vec2);

    let intersection = 0;

    for (const value of set1) {
        if (set2.has(value)) {
            intersection++;
        }
    }

    const union = set1.size + set2.size - intersection;

    if (union === 0) {
        return 0;
    }

    return intersection / union;
}

function pearsonCorrelation(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < len; i++) {
        sum1 += vec1[i];
        sum2 += vec2[i];
    }

    const mean1 = sum1 / len;
    const mean2 = sum2 / len;

    let num = 0;
    let den1 = 0;
    let den2 = 0;

    for (let i = 0; i < len; i++) {
        const d1 = vec1[i] - mean1;
        const d2 = vec2[i] - mean2;

        num += d1 * d2;
        den1 += d1 * d1;
        den2 += d2 * d2;
    }

    if (den1 === 0 || den2 === 0) {
        return 0;
    }

    return num / (Math.sqrt(den1) * Math.sqrt(den2));
}

function spearmanCorrelation(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len < 2) {
        return 0;
    }

    const ranks1 = vec1
        .slice(0, len)
        .map(function (value, index) {
            return {
                value: value,
                index: index
            };
        })
        .sort(function (a, b) {
            return a.value - b.value;
        })
        .map(function (item, rank) {
            item.rank = rank;
            return item;
        })
        .sort(function (a, b) {
            return a.index - b.index;
        });

    const ranks2 = vec2
        .slice(0, len)
        .map(function (value, index) {
            return {
                value: value,
                index: index
            };
        })
        .sort(function (a, b) {
            return a.value - b.value;
        })
        .map(function (item, rank) {
            item.rank = rank;
            return item;
        })
        .sort(function (a, b) {
            return a.index - b.index;
        });

    let dSum = 0;

    for (let i = 0; i < len; i++) {
        const d = ranks1[i].rank - ranks2[i].rank;
        dSum += d * d;
    }

    const denominator = len * (len * len - 1);

    if (denominator === 0) {
        return 0;
    }

    return 1 - (6 * dSum) / denominator;
}

function kendallCorrelation(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len < 2) {
        return 0;
    }

    let concordant = 0;
    let discordant = 0;

    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            const d1 = vec1[i] - vec1[j];
            const d2 = vec2[i] - vec2[j];

            if (d1 * d2 > 0) {
                concordant++;
            } else if (d1 * d2 < 0) {
                discordant++;
            }
        }
    }

    const total = concordant + discordant;

    if (total === 0) {
        return 0;
    }

    return (concordant - discordant) / total;
}

function hammingDistance(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let diff = 0;

    for (let i = 0; i < len; i++) {
        if (Math.round(vec1[i]) !== Math.round(vec2[i])) {
            diff++;
        }
    }

    return diff / len;
}

function chebyshevDistance(vec1, vec2) {
    const len = getSharedLength(vec1, vec2);

    if (len === 0) {
        return 0;
    }

    let maxDist = 0;

    for (let i = 0; i < len; i++) {
        const d = Math.abs(vec1[i] - vec2[i]);

        if (d > maxDist) {
            maxDist = d;
        }
    }

    return maxDist;
}

export function calculateSimilarity(vec1, vec2, metric) {
    if (!isValidVector(vec1) || !isValidVector(vec2)) {
        return 0;
    }

    metric = metric || Metrics.COSINE;

    switch (metric) {
        case Metrics.COSINE:
            return cosineSimilarity(vec1, vec2);

        case Metrics.EUCLIDEAN:
            return 1 / (1 + euclideanDistance(vec1, vec2));

        case Metrics.MANHATTAN:
            return 1 / (1 + manhattanDistance(vec1, vec2));

        case Metrics.DOT_PRODUCT:
            return Math.max(0, dotProduct(vec1, vec2));

        case Metrics.JACCARD:
            return jaccardSimilarity(vec1, vec2);

        case Metrics.PEARSON:
            return pearsonCorrelation(vec1, vec2);

        case Metrics.SPEARMAN:
            return spearmanCorrelation(vec1, vec2);

        case Metrics.KENDALL:
            return kendallCorrelation(vec1, vec2);

        case Metrics.HAMMING:
            return 1 - hammingDistance(vec1, vec2);

        case Metrics.CHEBYSHEV:
            return 1 / (1 + chebyshevDistance(vec1, vec2));

        default:
            return cosineSimilarity(vec1, vec2);
    }
}

export { Metrics as SimilarityMetrics };

KESEMPATAN.Memory.SimilarityMetrics = Metrics;
KESEMPATAN.Memory.calculateSimilarity = calculateSimilarity;

KESEMPATAN.Memory._metricsFunctions = Object.freeze({
    cosineSimilarity: cosineSimilarity,
    euclideanDistance: euclideanDistance,
    manhattanDistance: manhattanDistance,
    dotProduct: dotProduct,
    jaccardSimilarity: jaccardSimilarity,
    pearsonCorrelation: pearsonCorrelation,
    spearmanCorrelation: spearmanCorrelation,
    kendallCorrelation: kendallCorrelation,
    hammingDistance: hammingDistance,
    chebyshevDistance: chebyshevDistance
});

Logger.info('MemoryMetrics', 'Metrics loaded');
