import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireDeps() {
    return { E: LLMEmbedding, A: LLMAttention };
}

// ============================================================
// LAYER NORMALIZATION
// ============================================================
// Normalisasi tiap baris (across dModel) ke mean=0, var=1, lalu
// skala+geser pakai parameter gamma/beta yang bisa dipelajari.
function createLayerNormParams(dModel) {
    return {
        gamma: new Array(dModel).fill(1),
        beta: new Array(dModel).fill(0)
    };
}

function layerNormRow(row, gamma, beta, eps) {
    const n = row.length;
    let mean = 0;
    for (let i = 0; i < n; i++) mean += row[i];
    mean /= n;

    let variance = 0;
    for (let i = 0; i < n; i++) {
        const d = row[i] - mean;
        variance += d * d;
    }
    variance /= n;

    const invStd = 1 / Math.sqrt(variance + eps);
    const out = new Array(n);
    for (let i = 0; i < n; i++) {
        out[i] = (row[i] - mean) * invStd * gamma[i] + beta[i];
    }
    return out;
}

function layerNorm(x, params, eps) {
    eps = eps || 1e-5;
    return x.map(function (row) { return layerNormRow(row, params.gamma, params.beta, eps); });
}

// ============================================================
// FEED-FORWARD NETWORK
// ============================================================
// 2 lapis linear dengan aktivasi GELU di antaranya:
// FFN(x) = GELU(x·W1 + b1)·W2 + b2   (dModel → dFF → dModel)
function createFFNWeights(dModel, dFF, initStd) {
    return {
        W1: LLMEmbedding.randomMatrix(dModel, dFF, initStd),
        b1: LLMEmbedding.zerosVector(dFF),
        W2: LLMEmbedding.randomMatrix(dFF, dModel, initStd),
        b2: LLMEmbedding.zerosVector(dModel)
    };
}

// Aproksimasi GELU (tanh-based) — standar dipakai GPT-2/BERT,
// lebih murah dihitung daripada bentuk exact-nya (erf).
function gelu(x) {
    const c = Math.sqrt(2 / Math.PI);
    return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
}

function feedForward(x, ffnWeights) {
    const hidden = LLMEmbedding.addBiasRows(LLMEmbedding.matmul(x, ffnWeights.W1), ffnWeights.b1)
        .map(function (row) { return row.map(gelu); });
    return LLMEmbedding.addBiasRows(LLMEmbedding.matmul(hidden, ffnWeights.W2), ffnWeights.b2);
}

// ============================================================
// BLOK TRANSFORMER (attention + FFN + 2x LayerNorm + residual)
// ============================================================
function createTransformerBlockWeights(config) {
    const dModel = config.dModel;
    return {
        attention: LLMAttention.createAttentionWeights(dModel, config.initStd),
        ffn: createFFNWeights(dModel, config.dFF, config.initStd),
        ln1: createLayerNormParams(dModel),
        ln2: createLayerNormParams(dModel)
    };
}

// x: seqLen×dModel. mask (opsional): dari LLMAttention.createCausalMask()
// untuk blok decoder, null/undefined untuk blok encoder (bidirectional).
function transformerBlock(x, blockWeights, config, mask) {
    const { E, A } = requireDeps();

    const normed1 = layerNorm(x, blockWeights.ln1);
    const attnOut = A.multiHeadAttention(normed1, blockWeights.attention, config.nHeads, mask);
    const afterAttn = E.addMatrices(x, attnOut); // residual 1

    const normed2 = layerNorm(afterAttn, blockWeights.ln2);
    const ffnOut = feedForward(normed2, blockWeights.ffn);
    const afterFFN = E.addMatrices(afterAttn, ffnOut); // residual 2

    return afterFFN;
}

// Versi ber-cache dari transformerBlock — x cuma token BARU (1 token
// tiap langkah generate, atau seluruh prompt di panggilan pertama).
// Residual/FFN TIDAK diubah logikanya sama sekali, cuma beroperasi
// pada ukuran yang lebih kecil (newLen, bukan seqLen penuh).
function transformerBlockCached(x, blockWeights, config, cache) {
    const { E, A } = requireDeps();

    const normed1 = layerNorm(x, blockWeights.ln1);
    const attnResult = A.multiHeadAttentionCached(normed1, blockWeights.attention, config.nHeads, cache);
    const afterAttn = E.addMatrices(x, attnResult.output); // residual 1

    const normed2 = layerNorm(afterAttn, blockWeights.ln2);
    const ffnOut = feedForward(normed2, blockWeights.ffn);
    const afterFFN = E.addMatrices(afterAttn, ffnOut); // residual 2

    return { output: afterFFN, cache: attnResult.cache };
}

export const LLMTransformer = {
    createLayerNormParams: createLayerNormParams,
    layerNorm: layerNorm,
    gelu: gelu,
    createFFNWeights: createFFNWeights,
    feedForward: feedForward,
    createTransformerBlockWeights: createTransformerBlockWeights,
    transformerBlock: transformerBlock,
    transformerBlockCached: transformerBlockCached
};

window.LLMTransformer = LLMTransformer;

Logger.info('LLMTransformer', 'llm-transformer.js loaded');
