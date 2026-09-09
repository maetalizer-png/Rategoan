import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMGpu } from './llm-gpu.js';

function requireDeps() {
    return { E: LLMEmbedding, A: LLMAttention };
}

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

function createFFNWeights(dModel, dFF, initStd) {
    return {
        W1: LLMEmbedding.randomMatrix(dModel, dFF, initStd),
        b1: LLMEmbedding.zerosVector(dFF),
        W2: LLMEmbedding.randomMatrix(dFF, dModel, initStd),
        b2: LLMEmbedding.zerosVector(dModel)
    };
}

function gelu(x) {
    const c = Math.sqrt(2 / Math.PI);
    return 0.5 * x * (1 + Math.tanh(c * (x + 0.044715 * x * x * x)));
}

function feedForward(x, ffnWeights) {
    const hidden = LLMEmbedding.addBiasRows(LLMEmbedding.matmul(x, ffnWeights.W1), ffnWeights.b1)
        .map(function (row) { return row.map(gelu); });
    return LLMEmbedding.addBiasRows(LLMEmbedding.matmul(hidden, ffnWeights.W2), ffnWeights.b2);
}

function createTransformerBlockWeights(config) {
    const dModel = config.dModel;
    return {
        attention: LLMAttention.createAttentionWeights(dModel, config.initStd),
        ffn: createFFNWeights(dModel, config.dFF, config.initStd),
        ln1: createLayerNormParams(dModel),
        ln2: createLayerNormParams(dModel)
    };
}

function transformerBlock(x, blockWeights, config, mask) {
    const { E, A } = requireDeps();

    const normed1 = layerNorm(x, blockWeights.ln1);
    const attnOut = A.multiHeadAttention(normed1, blockWeights.attention, config.nHeads, mask);
    const afterAttn = E.addMatrices(x, attnOut);

    const normed2 = layerNorm(afterAttn, blockWeights.ln2);
    const ffnOut = feedForward(normed2, blockWeights.ffn);
    const afterFFN = E.addMatrices(afterAttn, ffnOut);

    return afterFFN;
}

function transformerBlockCached(x, blockWeights, config, cache) {
    const { E, A } = requireDeps();

    const normed1 = layerNorm(x, blockWeights.ln1);
    const attnResult = A.multiHeadAttentionCached(normed1, blockWeights.attention, config.nHeads, cache);
    const afterAttn = E.addMatrices(x, attnResult.output);

    const normed2 = layerNorm(afterAttn, blockWeights.ln2);
    const ffnOut = feedForward(normed2, blockWeights.ffn);
    const afterFFN = E.addMatrices(afterAttn, ffnOut);

    return { output: afterFFN, cache: attnResult.cache };
}

async function feedForwardAsync(x, ffnWeights) {
    const h1 = await LLMGpu.matmulAuto(x, ffnWeights.W1);
    const hidden = LLMEmbedding.addBiasRows(h1, ffnWeights.b1).map(function (row) { return row.map(gelu); });
    const h2 = await LLMGpu.matmulAuto(hidden, ffnWeights.W2);
    return LLMEmbedding.addBiasRows(h2, ffnWeights.b2);
}

async function transformerBlockCachedAsync(x, blockWeights, config, cache) {
    const { E, A } = requireDeps();

    const normed1 = layerNorm(x, blockWeights.ln1);
    const attnResult = await A.multiHeadAttentionCachedAsync(normed1, blockWeights.attention, config.nHeads, cache);
    const afterAttn = E.addMatrices(x, attnResult.output);

    const normed2 = layerNorm(afterAttn, blockWeights.ln2);
    const ffnOut = await feedForwardAsync(normed2, blockWeights.ffn);
    const afterFFN = E.addMatrices(afterAttn, ffnOut);

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
    transformerBlockCached: transformerBlockCached,
    feedForwardAsync: feedForwardAsync,
    transformerBlockCachedAsync: transformerBlockCachedAsync
};
