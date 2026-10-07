import { LLMEmbedding } from './llm-embedding.js';
import { LLMGpu } from './llm-gpu.js';

function requireEmbedding() {
    return LLMEmbedding;
}

function createAttentionWeights(dModel, initStd) {
    const E = requireEmbedding();
    return {
        Wq: E.randomMatrix(dModel, dModel, initStd),
        Wk: E.randomMatrix(dModel, dModel, initStd),
        Wv: E.randomMatrix(dModel, dModel, initStd),
        Wo: E.randomMatrix(dModel, dModel, initStd)
    };
}

function createCausalMask(seqLen) {
    const mask = new Array(seqLen);
    for (let i = 0; i < seqLen; i++) {
        const row = new Array(seqLen);
        for (let j = 0; j < seqLen; j++) {
            row[j] = j > i ? -Infinity : 0;
        }
        mask[i] = row;
    }
    return mask;
}

function softmaxRow(row) {
    let max = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > max) max = row[i];
    }

    if (max === -Infinity) {
        return row.map(function () { return 1 / row.length; });
    }
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
}

function scaledDotProductAttention(Q, K, V, mask) {
    const E = requireEmbedding();
    const dHead = Q[0].length;
    const scale = 1 / Math.sqrt(dHead);

    const scores = E.matmul(Q, E.transpose(K)).map(function (row) {
        return row.map(function (v) { return v * scale; });
    });

    const maskedScores = mask
        ? scores.map(function (row, i) { return row.map(function (v, j) { return v + mask[i][j]; }); })
        : scores;

    const weights = maskedScores.map(softmaxRow);
    const output = E.matmul(weights, V);

    return { output: output, weights: weights };
}

function splitHeads(X, nHeads) {
    const seqLen = X.length;
    const dModel = X[0].length;
    const dHead = dModel / nHeads;
    const heads = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        const head = new Array(seqLen);
        for (let t = 0; t < seqLen; t++) {
            head[t] = X[t].slice(h * dHead, (h + 1) * dHead);
        }
        heads[h] = head;
    }
    return heads;
}

function mergeHeads(headOutputs) {
    const nHeads = headOutputs.length;
    const seqLen = headOutputs[0].length;
    const merged = new Array(seqLen);
    for (let t = 0; t < seqLen; t++) {
        let row = [];
        for (let h = 0; h < nHeads; h++) {
            row = row.concat(headOutputs[h][t]);
        }
        merged[t] = row;
    }
    return merged;
}

function multiHeadAttention(x, weights, nHeads, mask) {
    const E = requireEmbedding();

    const Q = E.matmul(x, weights.Wq);
    const K = E.matmul(x, weights.Wk);
    const V = E.matmul(x, weights.Wv);

    const Qh = splitHeads(Q, nHeads);
    const Kh = splitHeads(K, nHeads);
    const Vh = splitHeads(V, nHeads);

    const headOutputs = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        headOutputs[h] = scaledDotProductAttention(Qh[h], Kh[h], Vh[h], mask).output;
    }

    const merged = mergeHeads(headOutputs);
    return E.matmul(merged, weights.Wo);
}

function createCausalMaskWithCache(newLen, cacheLen) {
    const totalLen = cacheLen + newLen;
    const mask = new Array(newLen);
    for (let i = 0; i < newLen; i++) {
        const row = new Array(totalLen);
        const allowedUpTo = cacheLen + i;
        for (let j = 0; j < totalLen; j++) {
            row[j] = j > allowedUpTo ? -Infinity : 0;
        }
        mask[i] = row;
    }
    return mask;
}

function multiHeadAttentionCached(x, weights, nHeads, cache) {
    const E = requireEmbedding();

    const Qnew = E.matmul(x, weights.Wq);
    const Knew = E.matmul(x, weights.Wk);
    const Vnew = E.matmul(x, weights.Wv);

    const QhNew = splitHeads(Qnew, nHeads);
    const KhNew = splitHeads(Knew, nHeads);
    const VhNew = splitHeads(Vnew, nHeads);

    const cacheLen = cache ? cache.K[0].length : 0;
    const mask = createCausalMaskWithCache(x.length, cacheLen);

    const headOutputs = new Array(nHeads);
    const nextK = new Array(nHeads);
    const nextV = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        nextK[h] = cache ? cache.K[h].concat(KhNew[h]) : KhNew[h];
        nextV[h] = cache ? cache.V[h].concat(VhNew[h]) : VhNew[h];
        headOutputs[h] = scaledDotProductAttention(QhNew[h], nextK[h], nextV[h], mask).output;
    }

    const merged = mergeHeads(headOutputs);
    const output = E.matmul(merged, weights.Wo);

    return { output: output, cache: { K: nextK, V: nextV } };
}

async function multiHeadAttentionCachedAsync(x, weights, nHeads, cache) {
    const [Qnew, Knew, Vnew] = await Promise.all([
        LLMGpu.matmulAuto(x, weights.Wq),
        LLMGpu.matmulAuto(x, weights.Wk),
        LLMGpu.matmulAuto(x, weights.Wv)
    ]);

    const QhNew = splitHeads(Qnew, nHeads);
    const KhNew = splitHeads(Knew, nHeads);
    const VhNew = splitHeads(Vnew, nHeads);

    const cacheLen = cache ? cache.K[0].length : 0;
    const mask = createCausalMaskWithCache(x.length, cacheLen);

    const headOutputs = new Array(nHeads);
    const nextK = new Array(nHeads);
    const nextV = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        nextK[h] = cache ? cache.K[h].concat(KhNew[h]) : KhNew[h];
        nextV[h] = cache ? cache.V[h].concat(VhNew[h]) : VhNew[h];
        headOutputs[h] = scaledDotProductAttention(QhNew[h], nextK[h], nextV[h], mask).output;
    }

    const merged = mergeHeads(headOutputs);
    const output = await LLMGpu.matmulAuto(merged, weights.Wo);

    return { output: output, cache: { K: nextK, V: nextV } };
}

function kvHeadForQuery(queryHead, queryHeads, kvHeads) {
    const groups = Math.max(1, Math.floor(Math.max(1, queryHeads) / Math.max(1, kvHeads)));
    const head = Math.floor(queryHead / groups);
    return head < kvHeads ? head : kvHeads - 1;
}

function gqaKvBytes(tokens, kvHeads, dHead) {
    return Math.max(0, tokens) * Math.max(1, kvHeads) * Math.max(1, dHead) * 4 * 2;
}

function takeColumns(matrix, cols) {
    const width = Math.max(1, cols);
    return matrix.map(function (row) { return row.slice(0, width); });
}

function splitHeadsSized(X, nHeads, dHead) {
    const seqLen = X.length;
    const heads = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        const head = new Array(seqLen);
        for (let t = 0; t < seqLen; t++) {
            head[t] = X[t].slice(h * dHead, (h + 1) * dHead);
        }
        heads[h] = head;
    }
    return heads;
}

function groupedQueryAttention(x, weights, queryHeads, kvHeads, mask) {
    const E = requireEmbedding();
    const dModel = x[0].length;
    const qh = Math.max(1, queryHeads | 0);
    const kh = Math.max(1, Math.min(qh, kvHeads | 0));
    const dHead = dModel / qh;
    const kvDim = kh * dHead;
    const Q = E.matmul(x, weights.Wq);
    const K = E.matmul(x, takeColumns(weights.Wk, kvDim));
    const V = E.matmul(x, takeColumns(weights.Wv, kvDim));
    const Qh = splitHeads(Q, qh);
    const Kh = splitHeadsSized(K, kh, dHead);
    const Vh = splitHeadsSized(V, kh, dHead);
    const headOutputs = new Array(qh);
    for (let h = 0; h < qh; h++) {
        const kv = kvHeadForQuery(h, qh, kh);
        headOutputs[h] = scaledDotProductAttention(Qh[h], Kh[kv], Vh[kv], mask).output;
    }
    return {
        output: E.matmul(mergeHeads(headOutputs), weights.Wo),
        queryHeads: qh,
        kvHeads: kh
    };
}

function groupedQueryAttentionCached(x, weights, queryHeads, kvHeads, cache) {
    const E = requireEmbedding();
    const dModel = x[0].length;
    const qh = Math.max(1, queryHeads | 0);
    const kh = Math.max(1, Math.min(qh, kvHeads | 0));
    const dHead = dModel / qh;
    const kvDim = kh * dHead;
    const Q = E.matmul(x, weights.Wq);
    const K = E.matmul(x, takeColumns(weights.Wk, kvDim));
    const V = E.matmul(x, takeColumns(weights.Wv, kvDim));
    const Qh = splitHeads(Q, qh);
    const Kh = splitHeadsSized(K, kh, dHead);
    const Vh = splitHeadsSized(V, kh, dHead);
    const cacheLen = cache && cache.K && cache.K[0] ? cache.K[0].length : 0;
    const mask = createCausalMaskWithCache(x.length, cacheLen);
    const nextK = new Array(kh);
    const nextV = new Array(kh);
    for (let k = 0; k < kh; k++) {
        nextK[k] = cache && cache.K ? cache.K[k].concat(Kh[k]) : Kh[k];
        nextV[k] = cache && cache.V ? cache.V[k].concat(Vh[k]) : Vh[k];
    }
    const headOutputs = new Array(qh);
    for (let h = 0; h < qh; h++) {
        const kv = kvHeadForQuery(h, qh, kh);
        headOutputs[h] = scaledDotProductAttention(Qh[h], nextK[kv], nextV[kv], mask).output;
    }
    return {
        output: E.matmul(mergeHeads(headOutputs), weights.Wo),
        cache: { K: nextK, V: nextV, queryHeads: qh, kvHeads: kh }
    };
}

export const LLMAttention = {
    createAttentionWeights: createAttentionWeights,
    createCausalMask: createCausalMask,
    createCausalMaskWithCache: createCausalMaskWithCache,
    softmaxRow: softmaxRow,
    scaledDotProductAttention: scaledDotProductAttention,
    multiHeadAttention: multiHeadAttention,
    multiHeadAttentionCached: multiHeadAttentionCached,
    multiHeadAttentionCachedAsync: multiHeadAttentionCachedAsync,
    splitHeads: splitHeads,
    mergeHeads: mergeHeads,
    kvHeadForQuery: kvHeadForQuery,
    gqaKvBytes: gqaKvBytes,
    groupedQueryAttention: groupedQueryAttention,
    groupedQueryAttentionCached: groupedQueryAttentionCached
};
