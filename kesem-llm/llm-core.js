import { LLMRuntime } from './llm-runtime.js';
import { LLMCheckpoint } from './llm-checkpoint.js';
import { LLMTrainer } from './llm-trainer.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMWeights } from './llm-weights.js';
import { LLMGpu } from './llm-gpu.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireDeps() {
    return {
        Runtime: LLMRuntime,
        Checkpoint: LLMCheckpoint,
        Trainer: LLMTrainer,
        Tokenizer: LLMTokenizer
    };
}
let activeModel = null;

// ============================================================
// GPU WARM-UP (Fase 1 roadmap: llm-gpu.js sudah punya kernel WebGPU +
// self-verifikasi kebenaran/kecepatan sejak lama, tapi initGPU() tidak
// pernah dipanggil siapa pun — kapabilitasnya menganggur total. Ini
// HANYA menjalankan verifikasi itu sekali per lifetime Worker dan
// mencatat hasilnya lewat getStats(); TIDAK mengubah forward pass
// inference/training yang sudah ada (llm-attention.js/llm-transformer.js
// tetap 100% CPU seperti sebelumnya). Menyambungkan matmul asli ke GPU
// butuh membuat seluruh rantai forward pass (dipakai bersama training)
// jadi async, dan tidak bisa diverifikasi di sandbox ini sama sekali
// (navigator.gpu tidak ada) — jadi TIDAK dilakukan di sini. Langkah ini
// membuat verdict self-test-nya kelihatan (aktif & lebih cepat, atau
// dinonaktifkan otomatis + alasannya) sebagai dasar keputusan berbasis
// data untuk penyambungan penuh nanti, bukan tebakan.
// ============================================================
let gpuAttempted = false;
let gpuStatus = { attempted: false, active: false };

function warmupGpu(model) {
    if (gpuAttempted) return;
    gpuAttempted = true;
    const dModel = model && model.config && model.config.model ? model.config.model.dModel : 128;
    LLMGpu.initGPU(dModel).then(function (active) {
        gpuStatus = { attempted: true, active: active, dModel: dModel };
    }).catch(function (e) {
        gpuStatus = { attempted: true, active: false, error: e.message, dModel: dModel };
    });
}

// ============================================================
// INISIALISASI
// ============================================================
async function initialize(options) {
    const { Runtime, Checkpoint, Trainer, Tokenizer } = requireDeps();
    options = options || {};
    if (options.fromCheckpoint) {
        const saved = await Checkpoint.loadCheckpointFromStorage(options.fromCheckpoint);
        if (saved) {
            activeModel = Checkpoint.restoreModelFromCheckpoint(saved);
            Logger.info('LLMCore', 'Model dipulihkan dari checkpoint "' + options.fromCheckpoint + '"');
            warmupGpu(activeModel);
            return activeModel;
        }
        Logger.warn('LLMCore', 'Checkpoint "' + options.fromCheckpoint + '" tidak ditemukan, bikin model baru');
    }
    if (!options.corpus) {
        throw new Error('[LLMCore] initialize butuh options.corpus (kalau tidak ada checkpoint valid untuk dipulihkan)');
    }
    activeModel = await Runtime.createModel({ corpus: options.corpus, configOptions: options.configOptions });
    Logger.info('LLMCore', 'Model baru dibuat (vocab size: ' + activeModel.vocab.size + ')');
    warmupGpu(activeModel);
    if (!options.skipAutoTrain) {
        try {
            const maxSequences = Number.isInteger(options.autoTrainMaxSequences) ? options.autoTrainMaxSequences : 30;
            const sequences = options.corpus
                .slice(0, maxSequences)
                .map(function (text) {
                    const pieces = Tokenizer.tokenize(text, activeModel.merges);
                    const ids = LLMVocabulary.encode(pieces, activeModel.vocab);
                    return [activeModel.vocab.bosId].concat(ids, [activeModel.vocab.eosId]);
                })
                .filter(function (seq) { return seq.length >= 2; });
            if (sequences.length > 0) {
                const epochs = Number.isInteger(options.autoTrainEpochs) ? options.autoTrainEpochs : 1;
                const learningRate = typeof options.autoTrainLearningRate === 'number' ? options.autoTrainLearningRate : 1e-3;
                const trainResult = await Trainer.trainOnCorpus(activeModel, sequences, {
                    epochs: epochs,
                    learningRate: learningRate,
                    optimizer: 'adam',
                    onProgress: function (p) {
                        if (p.step % 5 === 0 || p.step === p.totalSteps) {
                            Logger.info('LLMCore', 'Training... langkah ' + p.step + '/' + p.totalSteps + ' (loss: ' + p.loss.toFixed(3) + ')');
                        }
                    }
                });
                Logger.info('LLMCore', 'Auto-training selesai: ' + trainResult.finalStep + ' langkah (' + epochs + ' epoch, ' + sequences.length + ' kalimat)');
            }
        } catch (e) {
            Logger.warn('LLMCore', 'Auto-training gagal, lanjut dengan bobot awal: ' + e.message);
        }
    }
    return activeModel;
}
function isReady() {
    return activeModel !== null;
}
function getModel() {
    if (!activeModel) {
        throw new Error('[LLMCore] Belum ada model aktif — panggil initialize() dulu');
    }
    return activeModel;
}
// ============================================================
// GENERATE
// ============================================================
// 🔧 TAHAP 2 (anti-macet): generateText sekarang async supaya bisa
// meng-await Runtime.generate() yang (setelah llm-runtime.js diperbarui)
// melepas kendali ke event loop tiap token. Sebelum runtime diperbarui,
// Runtime.generate masih sinkron — `await` pada nilai sinkron tetap
// mengembalikan nilai itu apa adanya, jadi perubahan ini AMAN ditempel
// lebih dulu: perilaku tidak berubah sampai runtime ikut di-update.
async function generateText(promptText, options) {
    const { Runtime } = requireDeps();
    return await Runtime.generateCached(getModel(), promptText, options);
}
// ============================================================
// TRAIN
// ============================================================
async function train(corpusTexts, options) {
    const { Trainer, Tokenizer } = requireDeps();
    const model = getModel();
    const sequences = corpusTexts.map(function (text) {
        const pieces = Tokenizer.tokenize(text, model.merges);
        const ids = LLMVocabulary.encode(pieces, model.vocab);
        return [model.vocab.bosId].concat(ids, [model.vocab.eosId]);
    });
    return await Trainer.trainOnCorpus(model, sequences, options);
}
// ============================================================
// SIMPAN / MUAT
// ============================================================
async function save(name, metadata) {
    const { Checkpoint } = requireDeps();
    const checkpoint = Checkpoint.createCheckpoint(getModel(), metadata);
    return await Checkpoint.saveCheckpointToStorage(checkpoint, name);
}
async function load(name) {
    const { Checkpoint } = requireDeps();
    // FIX KRITIS: loadCheckpointFromStorage() sekarang ASYNC (IndexedDB,
    // bukan localStorage lagi) — SEBELUMNYA kode ini memperlakukan
    // hasilnya sbg nilai langsung, padahal itu Promise (selalu truthy,
    // dan restoreModelFromCheckpoint() akan menerima objek Promise alih-
    // alih data checkpoint asli — salah total). Sekarang di-await dengan
    // benar.
    const saved = await Checkpoint.loadCheckpointFromStorage(name);
    if (!saved) {
        throw new Error('[LLMCore] Checkpoint "' + name + '" tidak ditemukan');
    }
    activeModel = Checkpoint.restoreModelFromCheckpoint(saved);
    return activeModel;
}
// ============================================================
// CHECKPOINT SEBAGAI OBJEK MURNI (tanpa localStorage) — dipakai
// llm-worker.js, yang TIDAK punya akses localStorage (API itu cuma
// ada di Window, bukan di Worker). Thread utama yang menyimpan/
// membaca localStorage; worker cuma mengolah datanya.
// ============================================================
function buildCheckpointObject(metadata) {
    const { Checkpoint } = requireDeps();
    return Checkpoint.createCheckpoint(getModel(), metadata);
}
function restoreFromCheckpointObject(checkpointObj) {
    const { Checkpoint } = requireDeps();
    activeModel = Checkpoint.restoreModelFromCheckpoint(checkpointObj);
    warmupGpu(activeModel);
    return activeModel;
}
function getStats() {
    const model = getModel();
    const W = LLMWeights;
    return {
        vocabSize: model.vocab.size,
        configuredVocabSize: model.config.model.vocabSize,
        dModel: model.config.model.dModel,
        nLayers: model.config.model.nLayers,
        nHeads: model.config.model.nHeads,
        maxContextLength: model.config.model.maxContextLength,
        parameterCount: W ? W.countParameters(model) : null,
        gpu: gpuStatus
    };
}
export const LLMCore = {
    initialize: initialize,
    isReady: isReady,
    getModel: getModel,
    generateText: generateText,
    train: train,
    save: save,
    load: load,
    buildCheckpointObject: buildCheckpointObject,
    restoreFromCheckpointObject: restoreFromCheckpointObject,
    getStats: getStats
};

window.LLMCore = LLMCore;

Logger.info('LLMCore', 'llm-core.js loaded');
