import { LLMEmbedding } from './llm-embedding.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireEmbedding() {
    return LLMEmbedding;
}

// ============================================================
// INISIALISASI BOBOT
// ============================================================
// 4 matriks proyeksi dModel×dModel: Query, Key, Value, Output.
// Nilai awal random (belum dilatih) — sama seperti llm-embedding.js.
function createAttentionWeights(dModel, initStd) {
    const E = requireEmbedding();
    return {
        Wq: E.randomMatrix(dModel, dModel, initStd),
        Wk: E.randomMatrix(dModel, dModel, initStd),
        Wv: E.randomMatrix(dModel, dModel, initStd),
        Wo: E.randomMatrix(dModel, dModel, initStd)
    };
}

// ============================================================
// CAUSAL MASK
// ============================================================
// seqLen×seqLen — posisi j > i (lihat ke depan) diberi -Infinity
// supaya softmax menekannya jadi ~0 (autoregressive: token cuma
// boleh "lihat" dirinya sendiri & token sebelumnya).
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

// ============================================================
// SOFTMAX (per baris, numerically stable — kurangi max dulu)
// ============================================================
function softmaxRow(row) {
    let max = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > max) max = row[i];
    }
    // Baris semua -Infinity (mis. posisi pertama causal mask kalau
    // salah setup) — jaga-jaga supaya tidak jadi NaN.
    if (max === -Infinity) {
        return row.map(function () { return 1 / row.length; });
    }
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
}

// ============================================================
// SCALED DOT-PRODUCT ATTENTION
// ============================================================
// Q,K,V: seqLen×dHead. mask (opsional): seqLen×seqLen aditif.
// Attention(Q,K,V) = softmax(QK^T / sqrt(dHead) + mask) V
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

// ============================================================
// MULTI-HEAD ATTENTION
// ============================================================
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

// x: seqLen×dModel. weights: hasil createAttentionWeights().
// mask (opsional): seqLen×seqLen, pakai createCausalMask() untuk decoder.
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

// ============================================================
// KV-CACHE — hanya hitung Q/K/V untuk token BARU (bukan seluruh
// sequence diulang tiap langkah generate). K/V lama digabung dari
// cache. scaledDotProductAttention() TIDAK diubah sama sekali (sudah
// generik, mendukung Q lebih pendek dari K/V) — mengurangi risiko,
// fungsi yang sudah diverifikasi tetap utuh.
// ============================================================
function createCausalMaskWithCache(newLen, cacheLen) {
    const totalLen = cacheLen + newLen;
    const mask = new Array(newLen);
    for (let i = 0; i < newLen; i++) {
        const row = new Array(totalLen);
        const allowedUpTo = cacheLen + i; // posisi terakhir yang boleh diperhatikan
        for (let j = 0; j < totalLen; j++) {
            row[j] = j > allowedUpTo ? -Infinity : 0;
        }
        mask[i] = row;
    }
    return mask;
}

// x: newLen×dModel (token BARU saja — 1 token tiap langkah generate,
// atau seluruh prompt di panggilan pertama). cache: {K,V} per-head
// dari langkah sebelumnya (null di panggilan pertama).
// Mengembalikan { output, cache } — cache sudah diperbarui (K/V baru
// digabung), dipakai lagi di panggilan berikutnya.
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


export const LLMAttention = {
    createAttentionWeights: createAttentionWeights,
    createCausalMask: createCausalMask,
    createCausalMaskWithCache: createCausalMaskWithCache,
    softmaxRow: softmaxRow,
    scaledDotProductAttention: scaledDotProductAttention,
    multiHeadAttention: multiHeadAttention,
    multiHeadAttentionCached: multiHeadAttentionCached,
    splitHeads: splitHeads,
    mergeHeads: mergeHeads
};

window.LLMAttention = LLMAttention;

Logger.info('LLMAttention', 'llm-attention.js loaded');
