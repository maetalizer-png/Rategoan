import { LLMTransformer } from './llm-transformer.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireTransformer() {
    return LLMTransformer;
}

// Buat bobot untuk `config.nLayers` blok transformer + 1 LayerNorm
// final (konvensi umum: normalisasi sekali lagi di ujung stack).
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

// x: seqLen×dModel (embedding + positional encoding yang sudah digabung)
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

window.LLMEncoder = LLMEncoder;

Logger.info('LLMEncoder', 'llm-encoder.js loaded');
