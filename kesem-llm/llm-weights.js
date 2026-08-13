const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

const FORMAT_VERSION = 1;

// ============================================================
// SERIALISASI (matriks kita sudah plain array, jadi ini terutama
// soal bungkus versi + validasi struktur, bukan konversi format)
// ============================================================
function serializeWeights(model) {
    if (!model || !model.embeddingMatrix || !model.decoderWeights) {
        throw new Error('[LLMWeights] serializeWeights butuh model dengan embeddingMatrix & decoderWeights');
    }
    return {
        formatVersion: FORMAT_VERSION,
        embeddingMatrix: model.embeddingMatrix,
        decoderWeights: model.decoderWeights
    };
}

function deserializeWeights(serialized) {
    if (!serialized || serialized.formatVersion !== FORMAT_VERSION) {
        throw new Error('[LLMWeights] format tidak dikenal atau versi tidak cocok (dapat: ' +
            (serialized && serialized.formatVersion) + ', diharapkan: ' + FORMAT_VERSION + ')');
    }
    if (!serialized.embeddingMatrix || !serialized.decoderWeights) {
        throw new Error('[LLMWeights] struktur serialized tidak lengkap');
    }
    return {
        embeddingMatrix: serialized.embeddingMatrix,
        decoderWeights: serialized.decoderWeights
    };
}

// ============================================================
// STATISTIK
// ============================================================
function countMatrixParams(matrix) {
    if (!Array.isArray(matrix) || matrix.length === 0) return 0;
    return matrix.length * (Array.isArray(matrix[0]) ? matrix[0].length : 1);
}

function countParameters(model) {
    let total = countMatrixParams(model.embeddingMatrix);

    model.decoderWeights.layers.forEach(function (layer) {
        total += countMatrixParams(layer.attention.Wq);
        total += countMatrixParams(layer.attention.Wk);
        total += countMatrixParams(layer.attention.Wv);
        total += countMatrixParams(layer.attention.Wo);
        total += countMatrixParams(layer.ffn.W1);
        total += layer.ffn.b1.length;
        total += countMatrixParams(layer.ffn.W2);
        total += layer.ffn.b2.length;
        total += layer.ln1.gamma.length + layer.ln1.beta.length;
        total += layer.ln2.gamma.length + layer.ln2.beta.length;
    });

    total += model.decoderWeights.finalNorm.gamma.length + model.decoderWeights.finalNorm.beta.length;
    total += countMatrixParams(model.decoderWeights.outputProjection);

    return total;
}

// Estimasi kasar penyimpanan mentah (float64 JS number = 8 byte).
// Angka sebenarnya di localStorage/JSON akan lebih besar (representasi
// teks), ini cuma acuan ukuran "bobot murni" di memori.
function estimateMemoryBytes(model) {
    return countParameters(model) * 8;
}

// ============================================================
// KONVERSI KE/DARI Float32Array (representasi lebih ringkas,
// dipakai llm-checkpoint.js kalau perlu hemat ruang penyimpanan)
// ============================================================
function matrixToFloat32(matrix) {
    const rows = matrix.length;
    const cols = matrix[0] ? matrix[0].length : 0;
    const flat = new Float32Array(rows * cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            flat[i * cols + j] = matrix[i][j];
        }
    }
    return { data: flat, rows: rows, cols: cols };
}

function float32ToMatrix(packed) {
    const matrix = new Array(packed.rows);
    for (let i = 0; i < packed.rows; i++) {
        const row = new Array(packed.cols);
        for (let j = 0; j < packed.cols; j++) {
            row[j] = packed.data[i * packed.cols + j];
        }
        matrix[i] = row;
    }
    return matrix;
}

// ============================================================
// TYPED ARRAY <-> BASE64 (byte-level, lossless)
// ============================================================
// 🆕 Dipakai llm-checkpoint.js untuk menyimpan bobot terkuantisasi
// (Int8Array dari llm-quantization.js) sebagai STRING ringkas di
// localStorage. Catatan penting: JSON.stringify() pada TypedArray
// TIDAK menghemat apa-apa (hasilnya objek `{"0":1,"1":2,...}`,
// malah lebih besar dari array biasa) — base64 atas byte mentah
// adalah cara yang benar-benar ringkas, bukan cuma "typed array".
function typedArrayToBase64(typedArray) {
    const bytes = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function base64ToInt8Array(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return new Int8Array(bytes.buffer);
}

export const LLMWeights = {
    FORMAT_VERSION: FORMAT_VERSION,
    serializeWeights: serializeWeights,
    deserializeWeights: deserializeWeights,
    countParameters: countParameters,
    estimateMemoryBytes: estimateMemoryBytes,
    matrixToFloat32: matrixToFloat32,
    float32ToMatrix: float32ToMatrix,
    typedArrayToBase64: typedArrayToBase64,
    base64ToInt8Array: base64ToInt8Array
};

window.LLMWeights = LLMWeights;

Logger.info('LLMWeights', 'llm-weights.js loaded');
