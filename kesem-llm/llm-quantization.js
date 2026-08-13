const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// AFFINE QUANTIZATION (int8, rentang -127..127)
// ============================================================
// Rumus: quantized = round((value - zeroPoint) / scale)
//        value ≈ quantized * scale + zeroPoint
// scale dihitung dari rentang aktual nilai matriks (min-max),
// jadi tiap matriks punya scale/zeroPoint sendiri (per-tensor
// quantization — lebih akurat daripada 1 scale global untuk
// semua bobot model, karena tiap layer punya distribusi beda).
function quantizeMatrix(matrix) {
    const rows = matrix.length;
    const cols = matrix[0] ? matrix[0].length : 0;

    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const v = matrix[i][j];
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }

    if (min === max) {
        // Matriks konstan (edge case, mis. bias awal 0 semua) —
        // scale 1 supaya tidak dibagi nol.
        min -= 0.5;
        max += 0.5;
    }

    const scale = (max - min) / 254; // rentang int8 -127..127 = 254 langkah
    const zeroPoint = min;

    const data = new Int8Array(rows * cols);
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const q = Math.round((matrix[i][j] - zeroPoint) / scale) - 127;
            data[i * cols + j] = Math.max(-127, Math.min(127, q));
        }
    }

    return { data: data, rows: rows, cols: cols, scale: scale, zeroPoint: zeroPoint };
}

function dequantizeMatrix(quantized) {
    const { data, rows, cols, scale, zeroPoint } = quantized;
    const matrix = new Array(rows);
    for (let i = 0; i < rows; i++) {
        const row = new Array(cols);
        for (let j = 0; j < cols; j++) {
            row[j] = (data[i * cols + j] + 127) * scale + zeroPoint;
        }
        matrix[i] = row;
    }
    return matrix;
}

// ============================================================
// KUANTISASI SELURUH MODEL
// ============================================================
function quantizeModel(model) {
    function quantizeLayer(layer) {
        return {
            attention: {
                Wq: quantizeMatrix(layer.attention.Wq),
                Wk: quantizeMatrix(layer.attention.Wk),
                Wv: quantizeMatrix(layer.attention.Wv),
                Wo: quantizeMatrix(layer.attention.Wo)
            },
            ffn: {
                W1: quantizeMatrix(layer.ffn.W1),
                b1: layer.ffn.b1,  // vektor bias dibiarkan float — kecil, dampak kompresi minim
                W2: quantizeMatrix(layer.ffn.W2),
                b2: layer.ffn.b2
            },
            ln1: layer.ln1, // LayerNorm gamma/beta dibiarkan float — sensitif presisi
            ln2: layer.ln2
        };
    }

    return {
        quantized: true,
        embeddingMatrix: quantizeMatrix(model.embeddingMatrix),
        decoderWeights: {
            layers: model.decoderWeights.layers.map(quantizeLayer),
            finalNorm: model.decoderWeights.finalNorm,
            outputProjection: quantizeMatrix(model.decoderWeights.outputProjection)
        }
    };
}

function dequantizeModel(quantizedModel) {
    function dequantizeLayer(layer) {
        return {
            attention: {
                Wq: dequantizeMatrix(layer.attention.Wq),
                Wk: dequantizeMatrix(layer.attention.Wk),
                Wv: dequantizeMatrix(layer.attention.Wv),
                Wo: dequantizeMatrix(layer.attention.Wo)
            },
            ffn: {
                W1: dequantizeMatrix(layer.ffn.W1),
                b1: layer.ffn.b1,
                W2: dequantizeMatrix(layer.ffn.W2),
                b2: layer.ffn.b2
            },
            ln1: layer.ln1,
            ln2: layer.ln2
        };
    }

    return {
        embeddingMatrix: dequantizeMatrix(quantizedModel.embeddingMatrix),
        decoderWeights: {
            layers: quantizedModel.decoderWeights.layers.map(dequantizeLayer),
            finalNorm: quantizedModel.decoderWeights.finalNorm,
            // outputProjection OPSIONAL (v3+ checkpoint tidak
            // menyimpannya lagi — weight tying, direkonstruksi via
            // transpose oleh pemanggil di llm-checkpoint.js). Kalau
            // ADA (mis. dipanggil dari jalur lain yang masih kirim
            // model utuh), tetap didequantisasi seperti biasa.
            outputProjection: quantizedModel.decoderWeights.outputProjection
                ? dequantizeMatrix(quantizedModel.decoderWeights.outputProjection)
                : undefined
        }
    };
}

export const LLMQuantization = {
    quantizeMatrix: quantizeMatrix,
    dequantizeMatrix: dequantizeMatrix,
    quantizeModel: quantizeModel,
    dequantizeModel: dequantizeModel
};

window.LLMQuantization = LLMQuantization;

Logger.info('LLMQuantization', 'llm-quantization.js loaded');
