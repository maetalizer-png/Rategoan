import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMTransformer } from './llm-transformer.js';

function requireDeps() {
    return { E: LLMEmbedding, A: LLMAttention, T: LLMTransformer };
}

function createDecoderWeights(config) {
    const { T, E } = requireDeps();
    const layers = new Array(config.nLayers);
    for (let i = 0; i < config.nLayers; i++) {
        layers[i] = T.createTransformerBlockWeights(config);
    }
    return {
        layers: layers,
        finalNorm: T.createLayerNormParams(config.dModel),
        outputProjection: E.randomMatrix(config.dModel, config.vocabSize, config.initStd)
    };
}

function runDecoder(x, decoderWeights, config) {
    const { T, A } = requireDeps();
    const seqLen = x.length;
    const mask = A.createCausalMask(seqLen);

    let hidden = x;
    for (let i = 0; i < decoderWeights.layers.length; i++) {
        hidden = T.transformerBlock(hidden, decoderWeights.layers[i], config, mask);
    }
    return T.layerNorm(hidden, decoderWeights.finalNorm);
}

function runDecoderCached(x, decoderWeights, config, layerCaches) {
    const { T } = requireDeps();
    let hidden = x;
    const nextCaches = new Array(decoderWeights.layers.length);
    for (let i = 0; i < decoderWeights.layers.length; i++) {
        const result = T.transformerBlockCached(hidden, decoderWeights.layers[i], config, layerCaches ? layerCaches[i] : null);
        hidden = result.output;
        nextCaches[i] = result.cache;
    }
    return { hidden: T.layerNorm(hidden, decoderWeights.finalNorm), layerCaches: nextCaches };
}

function projectToLogits(hidden, decoderWeights) {
    return LLMEmbedding.matmul(hidden, decoderWeights.outputProjection);
}

export const LLMDecoder = {
    createDecoderWeights: createDecoderWeights,
    runDecoder: runDecoder,
    runDecoderCached: runDecoderCached,
    projectToLogits: projectToLogits
};
