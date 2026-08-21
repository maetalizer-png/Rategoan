import { LLMEmbedding } from './llm-embedding.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMWeights } from './llm-weights.js';
import { LLMQuantization } from './llm-quantization.js';

const Logger = {
    info: function () {  },
    warn: function () {  },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireQuantization() {
    return LLMQuantization;
}

const CHECKPOINT_FORMAT_VERSION = 3;








function packQuantizedMatrix(q) {
    return {
        rows: q.rows,
        cols: q.cols,
        scale: q.scale,
        zeroPoint: q.zeroPoint,
        dataB64: LLMWeights.typedArrayToBase64(q.data)
    };
}

function unpackQuantizedMatrix(packed) {
    return {
        rows: packed.rows,
        cols: packed.cols,
        scale: packed.scale,
        zeroPoint: packed.zeroPoint,
        data: LLMWeights.base64ToInt8Array(packed.dataB64)
    };
}

function packQuantizedLayer(layer) {
    return {
        attention: {
            Wq: packQuantizedMatrix(layer.attention.Wq),
            Wk: packQuantizedMatrix(layer.attention.Wk),
            Wv: packQuantizedMatrix(layer.attention.Wv),
            Wo: packQuantizedMatrix(layer.attention.Wo)
        },
        ffn: {
            W1: packQuantizedMatrix(layer.ffn.W1),
            b1: layer.ffn.b1,
            W2: packQuantizedMatrix(layer.ffn.W2),
            b2: layer.ffn.b2
        },
        ln1: layer.ln1,
        ln2: layer.ln2
    };
}

function unpackQuantizedLayer(packed) {
    return {
        attention: {
            Wq: unpackQuantizedMatrix(packed.attention.Wq),
            Wk: unpackQuantizedMatrix(packed.attention.Wk),
            Wv: unpackQuantizedMatrix(packed.attention.Wv),
            Wo: unpackQuantizedMatrix(packed.attention.Wo)
        },
        ffn: {
            W1: unpackQuantizedMatrix(packed.ffn.W1),
            b1: packed.ffn.b1,
            W2: unpackQuantizedMatrix(packed.ffn.W2),
            b2: packed.ffn.b2
        },
        ln1: packed.ln1,
        ln2: packed.ln2
    };
}




function createCheckpoint(model, metadata) {
    const Q = requireQuantization();
    metadata = metadata || {};

    
    
    
    const vocabEntries = Array.from(model.vocab.tokenToId.entries());

    
    
    
    
    
    
    
    const quantized = Q.quantizeModel(model);
    const packedWeights = {
        quantized: true,
        embeddingMatrix: packQuantizedMatrix(quantized.embeddingMatrix),
        decoderWeights: {
            layers: quantized.decoderWeights.layers.map(packQuantizedLayer),
            finalNorm: quantized.decoderWeights.finalNorm
        }
    };

    return {
        checkpointFormatVersion: CHECKPOINT_FORMAT_VERSION,
        createdAt: Date.now(),
        metadata: {
            name: metadata.name || 'kesempatan-llm-checkpoint',
            description: metadata.description || '',
            trainingSteps: metadata.trainingSteps || 0
        },
        config: model.config,
        merges: model.merges,
        vocabEntries: vocabEntries,
        weights: packedWeights
    };
}




function restoreModelFromCheckpoint(checkpoint) {
    const Q = requireQuantization();
    if (checkpoint.checkpointFormatVersion !== CHECKPOINT_FORMAT_VERSION) {
        throw new Error('[LLMCheckpoint] versi checkpoint tidak cocok (dapat: ' +
            checkpoint.checkpointFormatVersion + ', diharapkan: ' + CHECKPOINT_FORMAT_VERSION +
            ') — checkpoint lama (format 1, bobot mentah tak terkuantisasi) tidak didukung lagi ' +
            'karena itulah yang menyebabkan gagal tersimpan (kuota localStorage terlampaui). ' +
            'Biarkan initialize() jatuh ke jalur training baru.');
    }

    const tokenToId = new Map(checkpoint.vocabEntries);
    const idToToken = new Map();
    tokenToId.forEach(function (id, token) { idToToken.set(id, token); });

    const vocab = Object.freeze({
        tokenToId: tokenToId,
        idToToken: idToToken,
        size: tokenToId.size,
        unkId: checkpoint.config.specialTokenIds.UNK,
        padId: checkpoint.config.specialTokenIds.PAD,
        bosId: checkpoint.config.specialTokenIds.BOS,
        eosId: checkpoint.config.specialTokenIds.EOS
    });

    const packed = checkpoint.weights;
    const quantized = {
        embeddingMatrix: unpackQuantizedMatrix(packed.embeddingMatrix),
        decoderWeights: {
            layers: packed.decoderWeights.layers.map(unpackQuantizedLayer),
            finalNorm: packed.decoderWeights.finalNorm
        }
    };
    const weights = Q.dequantizeModel(quantized);
    
    
    const E = LLMEmbedding;
    weights.decoderWeights.outputProjection = E.transpose(weights.embeddingMatrix);

    return {
        config: checkpoint.config,
        merges: checkpoint.merges,
        vocab: vocab,
        embeddingMatrix: weights.embeddingMatrix,
        decoderWeights: weights.decoderWeights
    };
}

















const IDB_NAME = 'kesempatan_llm_checkpoints';
const IDB_VERSION = 1;
const IDB_STORE = 'checkpoints';

function openCheckpointDB() {
    return new Promise(function (resolve, reject) {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE, { keyPath: 'name' });
            }
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || new Error('Gagal membuka IndexedDB')); };
    });
}

async function saveCheckpointToStorage(checkpoint, name) {
    try {
        const db = await openCheckpointDB();
        await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({ name: name, checkpoint: checkpoint, savedAt: Date.now() });
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function () { reject(tx.error || new Error('Gagal menulis checkpoint ke IndexedDB')); };
        });
        db.close();
        return { success: true, key: name, sizeBytes: JSON.stringify(checkpoint).length };
    } catch (e) {
        
        
        
        
        return { success: false, error: e.message || String(e) };
    }
}

async function loadCheckpointFromStorage(name) {
    try {
        const db = await openCheckpointDB();
        const result = await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(name);
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error || new Error('Gagal membaca checkpoint dari IndexedDB')); };
        });
        db.close();
        return result ? result.checkpoint : null;
    } catch (e) {
        return null;
    }
}

async function listCheckpoints() {
    try {
        const db = await openCheckpointDB();
        const names = await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).getAllKeys();
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error || new Error('Gagal membaca daftar checkpoint')); };
        });
        db.close();
        return names;
    } catch (e) {
        return [];
    }
}

async function deleteCheckpoint(name) {
    try {
        const db = await openCheckpointDB();
        await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).delete(name);
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function () { reject(tx.error || new Error('Gagal menghapus checkpoint')); };
        });
        db.close();
    } catch (e) {
        Logger.warn('LLMCheckpoint', 'Gagal hapus checkpoint (bukan masalah fatal): ' + e.message);
    }
}

export const LLMCheckpoint = {
    CHECKPOINT_FORMAT_VERSION: CHECKPOINT_FORMAT_VERSION,
    createCheckpoint: createCheckpoint,
    restoreModelFromCheckpoint: restoreModelFromCheckpoint,
    saveCheckpointToStorage: saveCheckpointToStorage,
    loadCheckpointFromStorage: loadCheckpointFromStorage,
    listCheckpoints: listCheckpoints,
    deleteCheckpoint: deleteCheckpoint
};
Logger.info('LLMCheckpoint', 'llm-checkpoint.js loaded');
