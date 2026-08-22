import { LLMRuntime } from './llm-runtime.js';
import { LLMCheckpoint } from './llm-checkpoint.js';
import { LLMTrainer } from './llm-trainer.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMWeights } from './llm-weights.js';
import { LLMGpu } from './llm-gpu.js';

let activeModel = null;
let gpuAttempted = false;
let gpuStatus = { attempted: false, active: false };

function warmupGpu(model) {
    if (gpuAttempted) return;
    gpuAttempted = true;
    const dModel = model && model.config && model.config.model ? model.config.model.dModel : 128;
    LLMGpu.initGPU(dModel)
        .then((active) => { gpuStatus = { attempted: true, active, dModel }; })
        .catch((e) => { gpuStatus = { attempted: true, active: false, error: e.message, dModel }; });
}

async function initialize(options) {
    options = options || {};
    if (options.fromCheckpoint) {
        const saved = await LLMCheckpoint.loadCheckpointFromStorage(options.fromCheckpoint);
        if (saved) {
            activeModel = LLMCheckpoint.restoreModelFromCheckpointSafetensors(saved);
            warmupGpu(activeModel);
            return activeModel;
        }
    }
    if (!options.corpus) {
        throw new Error('[RATEGOAN] initialize butuh options.corpus (kalau tidak ada checkpoint valid untuk dipulihkan)');
    }
    activeModel = await LLMRuntime.createModel({ corpus: options.corpus, configOptions: options.configOptions });
    warmupGpu(activeModel);
    if (!options.skipAutoTrain) {
        try {
            const maxSequences = Number.isInteger(options.autoTrainMaxSequences) ? options.autoTrainMaxSequences : 30;
            const sequences = options.corpus
                .slice(0, maxSequences)
                .map((text) => {
                    const pieces = LLMTokenizer.tokenize(text, activeModel.merges);
                    const ids = LLMVocabulary.encode(pieces, activeModel.vocab);
                    return [activeModel.vocab.bosId].concat(ids, [activeModel.vocab.eosId]);
                })
                .filter((seq) => seq.length >= 2);
            if (sequences.length > 0) {
                const epochs = Number.isInteger(options.autoTrainEpochs) ? options.autoTrainEpochs : 1;
                const learningRate = typeof options.autoTrainLearningRate === 'number' ? options.autoTrainLearningRate : 1e-3;
                await LLMTrainer.trainOnCorpus(activeModel, sequences, { epochs, learningRate, optimizer: 'adam' });
            }
        } catch (e) {
            /* auto-training gagal - lanjut dengan bobot awal, bukan kondisi fatal */
        }
    }
    return activeModel;
}

function isReady() {
    return activeModel !== null;
}

function getModel() {
    if (!activeModel) {
        throw new Error('[RATEGOAN] Belum ada model aktif — panggil initialize() dulu');
    }
    return activeModel;
}

async function generateText(promptText, options) {
    return await LLMRuntime.generateCached(getModel(), promptText, options);
}

async function train(corpusTexts, options) {
    const model = getModel();
    const sequences = corpusTexts.map((text) => {
        const pieces = LLMTokenizer.tokenize(text, model.merges);
        const ids = LLMVocabulary.encode(pieces, model.vocab);
        return [model.vocab.bosId].concat(ids, [model.vocab.eosId]);
    });
    return await LLMTrainer.trainOnCorpus(model, sequences, options);
}

async function save(name, metadata) {
    const checkpointBytes = LLMCheckpoint.createCheckpointSafetensors(getModel(), metadata);
    return await LLMCheckpoint.saveCheckpointToStorage(checkpointBytes, name);
}

async function load(name) {
    const saved = await LLMCheckpoint.loadCheckpointFromStorage(name);
    if (!saved) {
        throw new Error('[RATEGOAN] Checkpoint "' + name + '" tidak ditemukan');
    }
    activeModel = LLMCheckpoint.restoreModelFromCheckpointSafetensors(saved);
    return activeModel;
}

function buildCheckpointSafetensors(metadata) {
    return LLMCheckpoint.createCheckpointSafetensors(getModel(), metadata);
}

function restoreFromCheckpointSafetensors(checkpointBytes) {
    activeModel = LLMCheckpoint.restoreModelFromCheckpointSafetensors(checkpointBytes);
    warmupGpu(activeModel);
    return activeModel;
}

function getStats() {
    const model = getModel();
    return {
        vocabSize: model.vocab.size,
        configuredVocabSize: model.config.model.vocabSize,
        dModel: model.config.model.dModel,
        nLayers: model.config.model.nLayers,
        nHeads: model.config.model.nHeads,
        maxContextLength: model.config.model.maxContextLength,
        parameterCount: LLMWeights.countParameters(model),
        gpu: gpuStatus,
    };
}

export const RATEGOAN = Object.freeze({
    initialize,
    isReady,
    getModel,
    generateText,
    train,
    save,
    load,
    buildCheckpointSafetensors,
    restoreFromCheckpointSafetensors,
    getStats,
});
