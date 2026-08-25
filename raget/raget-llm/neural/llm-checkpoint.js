import { LLMEmbedding } from './llm-embedding.js';
import { LLMQuantization } from './llm-quantization.js';
import { LLMConfig } from './llm-config.js';

const HEADER_LENGTH_BYTES = 8;

function align4(n) {
    return (n + 3) & ~3;
}

function createTensorWriter() {
    const header = {};
    const quant = {};
    const chunks = [];
    let offset = 0;

    function place(bytes) {
        const start = offset;
        chunks.push(bytes);
        offset += bytes.byteLength;
        const pad = (4 - (offset % 4)) % 4;
        if (pad) {
            chunks.push(new Uint8Array(pad));
            offset += pad;
        }
        return { start, end: start + bytes.byteLength };
    }

    function writeMatrix(name, q) {
        const bytes = new Uint8Array(q.data.buffer, q.data.byteOffset, q.data.byteLength);
        const { start, end } = place(bytes);
        header[name] = { dtype: 'I8', shape: [q.rows, q.cols], data_offsets: [start, end] };
        quant[name] = { scale: q.scale, zeroPoint: q.zeroPoint };
    }

    function writeVector(name, arr) {
        const f32 = arr instanceof Float32Array ? arr : Float32Array.from(arr);
        const bytes = new Uint8Array(f32.buffer, f32.byteOffset, f32.byteLength);
        const { start, end } = place(bytes);
        header[name] = { dtype: 'F32', shape: [f32.length], data_offsets: [start, end] };
    }

    return { writeMatrix, writeVector, header, quant, get chunks() { return chunks; }, get totalBytes() { return offset; } };
}

function writeLayerTensors(writer, prefix, layer) {
    writer.writeMatrix(prefix + 'attention.Wq', layer.attention.Wq);
    writer.writeMatrix(prefix + 'attention.Wk', layer.attention.Wk);
    writer.writeMatrix(prefix + 'attention.Wv', layer.attention.Wv);
    writer.writeMatrix(prefix + 'attention.Wo', layer.attention.Wo);
    writer.writeMatrix(prefix + 'ffn.W1', layer.ffn.W1);
    writer.writeVector(prefix + 'ffn.b1', layer.ffn.b1);
    writer.writeMatrix(prefix + 'ffn.W2', layer.ffn.W2);
    writer.writeVector(prefix + 'ffn.b2', layer.ffn.b2);
    writer.writeVector(prefix + 'ln1.gamma', layer.ln1.gamma);
    writer.writeVector(prefix + 'ln1.beta', layer.ln1.beta);
    writer.writeVector(prefix + 'ln2.gamma', layer.ln2.gamma);
    writer.writeVector(prefix + 'ln2.beta', layer.ln2.beta);
}

function createCheckpointSafetensors(model, metadata) {
    metadata = metadata || {};
    const quantized = LLMQuantization.quantizeModel(model);
    const writer = createTensorWriter();

    writer.writeMatrix('embedding.weight', quantized.embeddingMatrix);
    quantized.decoderWeights.layers.forEach((layer, i) => writeLayerTensors(writer, 'layers.' + i + '.', layer));
    writer.writeVector('final_norm.gamma', quantized.decoderWeights.finalNorm.gamma);
    writer.writeVector('final_norm.beta', quantized.decoderWeights.finalNorm.beta);

    const rategoanMeta = {
        name: metadata.name || 'rategoan-neural-checkpoint',
        description: metadata.description || '',
        createdAt: metadata.createdAt || new Date().toISOString(),
        trained: !!metadata.trained,
        trainingSteps: metadata.trainingSteps || 0,
        trainingMinutes: metadata.trainingMinutes || 0,
        corpusSize: metadata.corpusSize || 0,
        config: model.config,
        merges: model.merges,
        vocabEntries: Array.from(model.vocab.tokenToId.entries()),
        quant: writer.quant,
    };

    const fullHeader = Object.assign({}, writer.header, {
        __metadata__: { rategoan: JSON.stringify(rategoanMeta) },
    });

    const rawHeaderBytes = new TextEncoder().encode(JSON.stringify(fullHeader));
    const prefixLength = align4(HEADER_LENGTH_BYTES + rawHeaderBytes.byteLength);
    const headerBytes = new Uint8Array(prefixLength - HEADER_LENGTH_BYTES);
    headerBytes.set(rawHeaderBytes, 0);
    headerBytes.fill(0x20, rawHeaderBytes.byteLength);

    const out = new Uint8Array(prefixLength + writer.totalBytes);
    const view = new DataView(out.buffer);
    view.setBigUint64(0, BigInt(headerBytes.byteLength), true);
    out.set(headerBytes, HEADER_LENGTH_BYTES);

    let pos = prefixLength;
    for (const chunk of writer.chunks) {
        out.set(chunk, pos);
        pos += chunk.byteLength;
    }
    return out;
}

function readLayerTensors(reader, prefix) {
    return {
        attention: {
            Wq: reader(prefix + 'attention.Wq'),
            Wk: reader(prefix + 'attention.Wk'),
            Wv: reader(prefix + 'attention.Wv'),
            Wo: reader(prefix + 'attention.Wo'),
        },
        ffn: {
            W1: reader(prefix + 'ffn.W1'),
            b1: reader(prefix + 'ffn.b1'),
            W2: reader(prefix + 'ffn.W2'),
            b2: reader(prefix + 'ffn.b2'),
        },
        ln1: { gamma: reader(prefix + 'ln1.gamma'), beta: reader(prefix + 'ln1.beta') },
        ln2: { gamma: reader(prefix + 'ln2.gamma'), beta: reader(prefix + 'ln2.beta') },
    };
}

function restoreModelFromCheckpointSafetensors(input) {
    const buffer = input instanceof ArrayBuffer ? input : input.buffer;
    const view = new DataView(buffer);
    const headerLength = Number(view.getBigUint64(0, true));
    const headerBytes = new Uint8Array(buffer, HEADER_LENGTH_BYTES, headerLength);
    const header = JSON.parse(new TextDecoder().decode(headerBytes));
    const tensorDataStart = HEADER_LENGTH_BYTES + headerLength;

    if (!header.__metadata__ || !header.__metadata__.rategoan) {
        throw new Error('[LLMCheckpoint] bukan file SafeTensors checkpoint Rategoan yang valid (metadata "rategoan" tidak ada)');
    }
    const rategoanMeta = JSON.parse(header.__metadata__.rategoan);
    const quant = rategoanMeta.quant;

    function readTensor(name) {
        const desc = header[name];
        if (!desc) throw new Error('[LLMCheckpoint] tensor "' + name + '" tidak ada di checkpoint');
        const [start, end] = desc.data_offsets;
        const absStart = tensorDataStart + start;
        if (desc.dtype === 'I8') {
            const data = new Int8Array(buffer, absStart, end - start);
            const q = quant[name];
            return { data, rows: desc.shape[0], cols: desc.shape[1], scale: q.scale, zeroPoint: q.zeroPoint };
        }
        const floatView = new Float32Array(buffer, absStart, (end - start) / 4);
        return Array.from(floatView);
    }

    const tokenToId = new Map(rategoanMeta.vocabEntries);
    const idToToken = new Map();
    tokenToId.forEach((id, token) => idToToken.set(id, token));
    const vocab = Object.freeze({
        tokenToId,
        idToToken,
        size: tokenToId.size,
        unkId: rategoanMeta.config.specialTokenIds.UNK,
        padId: rategoanMeta.config.specialTokenIds.PAD,
        bosId: rategoanMeta.config.specialTokenIds.BOS,
        eosId: rategoanMeta.config.specialTokenIds.EOS,
    });

    const nLayers = rategoanMeta.config.model.nLayers;
    const layers = [];
    for (let i = 0; i < nLayers; i++) {
        layers.push(readLayerTensors(readTensor, 'layers.' + i + '.'));
    }
    const quantized = {
        embeddingMatrix: readTensor('embedding.weight'),
        decoderWeights: {
            layers,
            finalNorm: { gamma: readTensor('final_norm.gamma'), beta: readTensor('final_norm.beta') },
        },
    };

    const weights = LLMQuantization.dequantizeModel(quantized);
    weights.decoderWeights.outputProjection = LLMEmbedding.transpose(weights.embeddingMatrix);

    return {
        // BUG FIX Round 10: checkpoint lama (mis. raget-neural-tiny.safetensors,
        // dilatih sebelum runtime.minNewTokens ada di DEFAULT_RUNTIME) menyimpan
        // config.runtime TANPA field itu. Sebelumnya config dipakai verbatim,
        // jadi field yang hilang jadi `undefined` di runtime dan generate()
        // di llm-runtime.js diam-diam fallback ke minNewTokens=0 - EOS TIDAK
        // pernah ditekan, model bisa berhenti di token pertama (diagnostik:
        // diagnose-neural-generation-report.json, teks jadi ":" / "::" / "").
        // Merge runtime yang tersimpan DI ATAS DEFAULT_RUNTIME saat ini supaya
        // field baru yang ditambahkan setelah checkpoint lama dilatih tetap
        // dapat nilai default yang masuk akal, bukan undefined.
        config: Object.assign({}, rategoanMeta.config, { runtime: LLMConfig.createRuntimeConfig(rategoanMeta.config.runtime) }),
        merges: rategoanMeta.merges,
        vocab,
        embeddingMatrix: weights.embeddingMatrix,
        decoderWeights: weights.decoderWeights,
        checkpointMeta: {
            name: rategoanMeta.name,
            description: rategoanMeta.description,
            createdAt: rategoanMeta.createdAt,
            trained: rategoanMeta.trained,
            trainingSteps: rategoanMeta.trainingSteps,
            trainingMinutes: rategoanMeta.trainingMinutes,
            corpusSize: rategoanMeta.corpusSize,
        },
    };
}

const IDB_NAME = 'rategoan_neural_checkpoints';
const IDB_VERSION = 1;
const IDB_STORE = 'checkpoints';

function openCheckpointDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE, { keyPath: 'name' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('Gagal membuka IndexedDB'));
    });
}

async function saveCheckpointToStorage(checkpointBytes, name) {
    try {
        const blob = new Blob([checkpointBytes], { type: 'application/octet-stream' });
        const db = await openCheckpointDB();
        await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({ name, blob, savedAt: Date.now() });
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Gagal menulis checkpoint ke IndexedDB'));
        });
        db.close();
        return { success: true, key: name, sizeBytes: blob.size };
    } catch (e) {
        return { success: false, error: e.message || String(e) };
    }
}

async function loadCheckpointFromStorage(name) {
    try {
        const db = await openCheckpointDB();
        const result = await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(name);
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error || new Error('Gagal membaca checkpoint dari IndexedDB'));
        });
        db.close();
        if (!result) return null;
        return await result.blob.arrayBuffer();
    } catch (e) {
        return null;
    }
}

async function listCheckpoints() {
    try {
        const db = await openCheckpointDB();
        const names = await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).getAllKeys();
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error || new Error('Gagal membaca daftar checkpoint'));
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
        await new Promise((resolve, reject) => {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).delete(name);
            tx.oncomplete = () => resolve();
            tx.onerror = () => reject(tx.error || new Error('Gagal menghapus checkpoint'));
        });
        db.close();
    } catch (e) {
        /* penghapusan checkpoint bukan operasi kritis, gagal senyap */
    }
}

export const LLMCheckpoint = {
    createCheckpointSafetensors,
    restoreModelFromCheckpointSafetensors,
    saveCheckpointToStorage,
    loadCheckpointFromStorage,
    listCheckpoints,
    deleteCheckpoint,
};
