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
    // outputProjection dihitung di sini sebagai matriks terpisah (arsitektur),
    // tapi saat runtime nilainya adalah TRANSPOSE embeddingMatrix (weight
    // tying, lihat llm-checkpoint.js) - tidak disimpan dua kali di disk.
    // Jadi angka dari fungsi ini (parameter arsitektur) > jumlah nilai unik
    // yang benar-benar tersimpan di file checkpoint, selisihnya persis
    // vocabSize x dModel. Kedua angka sama-sama valid, jawab pertanyaan beda.
    total += countMatrixParams(model.decoderWeights.outputProjection);

    return total;
}

export const LLMWeights = {
    countParameters: countParameters,
};
