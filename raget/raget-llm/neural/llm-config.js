const SPECIAL_TOKENS = Object.freeze({
    PAD: '<pad>',
    UNK: '<unk>',
    BOS: '<bos>',
    EOS: '<eos>'
});

const SPECIAL_TOKEN_IDS = Object.freeze({
    PAD: 0,
    UNK: 1,
    BOS: 2,
    EOS: 3
});

const TINY = Object.freeze({
    name: 'tiny',
    vocabSize: 8000,
    dModel: 128,
    nLayers: 4,
    nHeads: 4,
    dFF: 512,
    maxContextLength: 256,
    dropoutRate: 0.0,
    initStd: 0.02
});

const SMALL = Object.freeze({
    name: 'small',
    vocabSize: 32000,
    dModel: 512,
    nLayers: 8,
    nHeads: 8,
    dFF: 2048,
    maxContextLength: 1024,
    dropoutRate: 0.1,
    initStd: 0.02
});

const COMPACT = Object.freeze({
    name: 'compact',
    vocabSize: 4000,
    dModel: 256,
    nLayers: 6,
    nHeads: 8,
    dFF: 1024,
    maxContextLength: 512,
    dropoutRate: 0.05,
    initStd: 0.02
});

const MEDIUM = Object.freeze({
    name: 'medium',
    vocabSize: 16000,
    dModel: 384,
    nLayers: 14,
    nHeads: 8,
    dFF: 1536,
    maxContextLength: 512,
    dropoutRate: 0.1,
    initStd: 0.02
});

const LARGE = Object.freeze({
    name: 'large',
    vocabSize: 16000,
    dModel: 640,
    nLayers: 8,
    nHeads: 8,
    dFF: 2560,
    maxContextLength: 512,
    dropoutRate: 0.1,
    initStd: 0.02
});

const MASSIVE50M = Object.freeze({
    name: 'massive50m',
    vocabSize: 30368,
    dModel: 512,
    nLayers: 6,
    nHeads: 8,
    dFF: 2048,
    maxContextLength: 512,
    dropoutRate: 0.1,
    initStd: 0.02
});

const PRESETS = Object.freeze({ tiny: TINY, compact: COMPACT, medium: MEDIUM, large: LARGE, small: SMALL, massive50m: MASSIVE50M });

const BACKENDS = Object.freeze({
    CPU_JS: 'cpu-js',  
    WEBGPU: 'webgpu'   
});

const DEFAULT_RUNTIME = Object.freeze({
    backend: BACKENDS.CPU_JS,
    precision: 'f32',
    seed: 42,
    logLevel: 'warn',
    maxNewTokens: 128,
    minNewTokens: 8,




    temperature: 0.4,
    topP: 0.88,
    repetitionPenalty: 1.15,
    greedy: false            
});

function createRuntimeConfig(overrides) {
    overrides = overrides || {};
    const merged = Object.assign({}, DEFAULT_RUNTIME, overrides);
    return Object.freeze(merged);
}

function validateConfig(config) {
    const errors = [];

    if (!Number.isInteger(config.vocabSize) || config.vocabSize <= 4) {
        errors.push('vocabSize harus integer > 4 (menyisakan ruang 4 token spesial)');
    }
    if (!Number.isInteger(config.dModel) || config.dModel <= 0) {
        errors.push('dModel harus integer positif');
    }
    if (!Number.isInteger(config.nHeads) || config.nHeads <= 0) {
        errors.push('nHeads harus integer positif');
    }
    if (Number.isInteger(config.dModel) && Number.isInteger(config.nHeads) &&
        config.nHeads > 0 && config.dModel % config.nHeads !== 0) {
        errors.push('dModel (' + config.dModel + ') harus habis dibagi nHeads (' + config.nHeads + ')');
    }
    if (!Number.isInteger(config.nLayers) || config.nLayers <= 0) {
        errors.push('nLayers harus integer positif');
    }
    if (!Number.isInteger(config.dFF) || config.dFF <= 0) {
        errors.push('dFF harus integer positif');
    }
    if (!Number.isInteger(config.maxContextLength) || config.maxContextLength <= 0) {
        errors.push('maxContextLength harus integer positif');
    }
    if (typeof config.dropoutRate !== 'number' || config.dropoutRate < 0 || config.dropoutRate >= 1) {
        errors.push('dropoutRate harus number di rentang [0, 1)');
    }

    if (errors.length > 0) {
        throw new Error('[LLMConfig] Config tidak valid:\n- ' + errors.join('\n- '));
    }
    return true;
}

function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(function (key) {
        const value = obj[key];
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}

function createConfig(options) {
    options = options || {};
    const presetName = options.preset || 'tiny';
    const preset = PRESETS[presetName];
    if (!preset) {
        throw new Error('[LLMConfig] Preset "' + presetName + '" tidak dikenal. Tersedia: ' + Object.keys(PRESETS).join(', '));
    }

    const model = Object.assign({}, preset, options.modelOverrides || {});
    validateConfig(model);

    const runtime = createRuntimeConfig(options.runtimeOverrides || {});

    return deepFreeze({
        model: model,
        runtime: runtime,
        specialTokens: SPECIAL_TOKENS,
        specialTokenIds: SPECIAL_TOKEN_IDS
    });
}

export const LLMConfig = {
    createConfig: createConfig,
    PRESETS: PRESETS,
    SPECIAL_TOKENS: SPECIAL_TOKENS,
    SPECIAL_TOKEN_IDS: SPECIAL_TOKEN_IDS
};
