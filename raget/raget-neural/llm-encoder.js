import { LLMTransformer } from './llm-transformer.js';

function requireTransformer() {
    return LLMTransformer;
}

function createEncoderWeights(config) {
    const T = requireTransformer();
    const layers = new Array(config.nLayers);
    for (let i = 0; i < config.nLayers; i++) {
        layers[i] = T.createTransformerBlockWeights(config);
    }
    return {
        layers: layers,
        finalNorm: T.createLayerNormParams(config.dModel)
    };
}

function runEncoder(x, encoderWeights, config) {
    const T = requireTransformer();
    let hidden = x;
    for (let i = 0; i < encoderWeights.layers.length; i++) {
        hidden = T.transformerBlock(hidden, encoderWeights.layers[i], config, null);
    }
    return T.layerNorm(hidden, encoderWeights.finalNorm);
}

export const LLMEncoder = {
    createEncoderWeights: createEncoderWeights,
    runEncoder: runEncoder
};
