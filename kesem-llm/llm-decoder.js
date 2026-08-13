import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMTransformer } from './llm-transformer.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireDeps() {
    return { E: LLMEmbedding, A: LLMAttention, T: LLMTransformer };
}

// Buat bobot untuk `config.nLayers` blok transformer + LayerNorm final
// + matriks proyeksi ke logits vocab (dModel × vocabSize).
//
// CATATAN ARSITEKTUR: outputProjection TIDAK di-tie ke embedding
// matrix di tahap ini (dua matriks terpisah, walau ukurannya sama
// vocabSize×dModel vs dModel×vocabSize) — weight tying (teknik umum
// GPT-2 untuk mengurangi jumlah parameter) bisa ditambah nanti di
// llm-trainer.js tanpa mengubah bentuk fungsi di sini.
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

// x: seqLen×dModel (embedding + positional encoding)
// Mengembalikan representasi tersembunyi TERAKHIR (belum diproyeksi
// ke logits) — dipisah dari projectToLogits() supaya hidden state
// bisa dipakai ulang untuk keperluan lain (mis. embedding kalimat).
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

// Versi ber-cache — layerCaches: array of {K,V} per layer (null di
// elemen manapun berarti "belum ada cache", dipakai di panggilan
// pertama utk prompt awal). Mengembalikan { hidden, layerCaches }
// (cache sudah diperbarui, dipakai lagi di panggilan generate berikutnya).
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


// hidden: seqLen×dModel → logits: seqLen×vocabSize
function projectToLogits(hidden, decoderWeights) {
    return LLMEmbedding.matmul(hidden, decoderWeights.outputProjection);
}

export const LLMDecoder = {
    createDecoderWeights: createDecoderWeights,
    runDecoder: runDecoder,
    runDecoderCached: runDecoderCached,
    projectToLogits: projectToLogits
};

window.LLMDecoder = LLMDecoder;

Logger.info('LLMDecoder', 'llm-decoder.js loaded');
