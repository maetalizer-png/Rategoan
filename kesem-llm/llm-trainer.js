import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMTransformer } from './llm-transformer.js';
import { LLMSampler } from './llm-sampler.js';
import { LLMOptimizer } from './llm-optimizer.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireDeps() {
    return {
        E: LLMEmbedding,
        A: LLMAttention,
        T: LLMTransformer,
        S: LLMSampler,
        O: LLMOptimizer
    };
}

// ============================================================
// CROSS-ENTROPY LOSS + GRADIEN (digabung — turunan softmax+CE
// sangat sederhana kalau dihitung bersamaan: dLogits = p - oneHot)
// ============================================================
// 🔧 FIX BUG LAMA (ditemukan Juli 2026 lewat gradient checking numerik
// saat verifikasi weight tying — TIDAK terkait tying, sudah ada sejak
// awal): loss dibagi seqLen (rata-rata per-token), TAPI dLogits
// sebelumnya TIDAK PERNAH ikut dibagi seqLen — gradien selalu
// 'seqLen' kali terlalu besar dibanding yang seharusnya untuk loss
// rata-rata yang dilaporkan (contoh: 3x terlalu besar untuk sequence
// 3 token, 10x untuk 10 token). Learning rate EFEKTIF jadi jauh
// lebih besar dari yang di-set, kemungkinan ikut berkontribusi ke
// training yang kurang stabil. Diverifikasi numerik (finite-
// difference vs analitik): rasio SEBELUM fix persis 1/seqLen di
// setiap elemen, SESUDAH fix jadi 1:1 (selisih <1e-6).
function crossEntropyLossAndGrad(logits, targetIds) {
    const { S } = requireDeps();
    const seqLen = logits.length;
    let totalLoss = 0;
    const dLogits = new Array(seqLen);

    for (let t = 0; t < seqLen; t++) {
        const probs = S.softmax(logits[t]);
        const target = targetIds[t];
        const p = Math.max(probs[target], 1e-12); // jaga-jaga log(0)
        totalLoss += -Math.log(p);

        dLogits[t] = probs.map(function (v) { return v / seqLen; });
        dLogits[t][target] -= 1 / seqLen;
    }

    return { loss: totalLoss / seqLen, dLogits: dLogits };
}

// ============================================================
// BACKWARD PRIMITIF
// ============================================================

// y = x @ W  (tanpa bias) — dipakai proyeksi Q/K/V/O & outputProjection
function linearBackward(x, W, dY) {
    const { E } = requireDeps();
    return {
        dX: E.matmul(dY, E.transpose(W)),
        dW: E.matmul(E.transpose(x), dY)
    };
}

// y = x @ W + b — dipakai FFN
function linearWithBiasBackward(x, W, dY) {
    const { E } = requireDeps();
    const lin = linearBackward(x, W, dY);
    const dB = new Array(dY[0].length).fill(0);
    for (let i = 0; i < dY.length; i++) {
        for (let j = 0; j < dY[i].length; j++) {
            dB[j] += dY[i][j];
        }
    }
    return { dX: lin.dX, dW: lin.dW, dB: dB };
}

// Turunan GELU (aproksimasi tanh, SAMA persis dengan forward di llm-transformer.js)
function geluDerivative(x) {
    const c = Math.sqrt(2 / Math.PI);
    const inner = c * (x + 0.044715 * x * x * x);
    const t = Math.tanh(inner);
    const dInner = c * (1 + 3 * 0.044715 * x * x);
    return 0.5 * (1 + t) + 0.5 * x * (1 - t * t) * dInner;
}

function geluBackward(preActivation, dOut) {
    return preActivation.map(function (row, i) {
        return row.map(function (x, j) { return dOut[i][j] * geluDerivative(x); });
    });
}

// LayerNorm backward — formula gabungan standar:
// dX_i = (1/std) * (dXhat_i - mean(dXhat) - xhat_i * mean(dXhat·xhat))
function layerNormBackwardRow(x, gamma, beta, dY, eps) {
    const n = x.length;
    let mean = 0;
    for (let i = 0; i < n; i++) mean += x[i];
    mean /= n;

    let variance = 0;
    for (let i = 0; i < n; i++) {
        const d = x[i] - mean;
        variance += d * d;
    }
    variance /= n;
    const std = Math.sqrt(variance + eps);

    const xhat = x.map(function (v) { return (v - mean) / std; });
    const dXhat = dY.map(function (v, i) { return v * gamma[i]; });

    let meanDXhat = 0;
    let meanDXhatXhat = 0;
    for (let i = 0; i < n; i++) {
        meanDXhat += dXhat[i];
        meanDXhatXhat += dXhat[i] * xhat[i];
    }
    meanDXhat /= n;
    meanDXhatXhat /= n;

    const dX = new Array(n);
    for (let i = 0; i < n; i++) {
        dX[i] = (dXhat[i] - meanDXhat - xhat[i] * meanDXhatXhat) / std;
    }

    const dGamma = dY.map(function (v, i) { return v * xhat[i]; });
    const dBeta = dY.slice();

    return { dX: dX, dGamma: dGamma, dBeta: dBeta };
}

function layerNormBackward(x, params, dY, eps) {
    eps = eps || 1e-5;
    const dGamma = new Array(x[0].length).fill(0);
    const dBeta = new Array(x[0].length).fill(0);
    const dX = new Array(x.length);

    for (let t = 0; t < x.length; t++) {
        const rowResult = layerNormBackwardRow(x[t], params.gamma, params.beta, dY[t], eps);
        dX[t] = rowResult.dX;
        for (let i = 0; i < dGamma.length; i++) {
            dGamma[i] += rowResult.dGamma[i];
            dBeta[i] += rowResult.dBeta[i];
        }
    }

    return { dX: dX, dGamma: dGamma, dBeta: dBeta };
}

// Backward attention skala-titik untuk SATU head.
// Forward: scores = QK^T/sqrt(d) + mask, weights = softmax(scores), out = weights@V
function scaledDotProductAttentionBackward(Q, K, V, weights, dOutput) {
    const { E } = requireDeps();
    const dHead = Q[0].length;
    const scale = 1 / Math.sqrt(dHead);

    // dV = weights^T @ dOutput
    const dV = E.matmul(E.transpose(weights), dOutput);
    // dWeights = dOutput @ V^T
    const dWeights = E.matmul(dOutput, E.transpose(V));

    // Backward softmax per baris: dScores_i = weights_i * (dWeights_i - sum(dWeights_i * weights_i))
    const dScores = weights.map(function (row, i) {
        let dot = 0;
        for (let j = 0; j < row.length; j++) {
            dot += dWeights[i][j] * row[j];
        }
        return row.map(function (w, j) { return w * (dWeights[i][j] - dot); });
    });

    const dScoresScaled = dScores.map(function (row) { return row.map(function (v) { return v * scale; }); });

    const dQ = E.matmul(dScoresScaled, K);
    const dK = E.matmul(E.transpose(dScoresScaled), Q);

    return { dQ: dQ, dK: dK, dV: dV };
}

// Backward multi-head attention penuh (mengulang forward supaya dapat cache Q/K/V/weights per head).
function multiHeadAttentionBackward(x, blockAttentionWeights, nHeads, mask, dOutput) {
    const { E, A } = requireDeps();

    const Q = E.matmul(x, blockAttentionWeights.Wq);
    const K = E.matmul(x, blockAttentionWeights.Wk);
    const V = E.matmul(x, blockAttentionWeights.Wv);

    const Qh = A.splitHeads(Q, nHeads);
    const Kh = A.splitHeads(K, nHeads);
    const Vh = A.splitHeads(V, nHeads);

    const headOutputs = new Array(nHeads);
    const headWeights = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        const result = A.scaledDotProductAttention(Qh[h], Kh[h], Vh[h], mask);
        headOutputs[h] = result.output;
        headWeights[h] = result.weights;
    }
    const merged = A.mergeHeads(headOutputs);

    // ===== BACKWARD =====
    const outLin = linearBackward(merged, blockAttentionWeights.Wo, dOutput);
    const dMerged = outLin.dX;

    // splitHeads = kebalikan dari mergeHeads untuk keperluan gradien
    const dHeadOutputs = A.splitHeads(dMerged, nHeads);

    const dQh = new Array(nHeads);
    const dKh = new Array(nHeads);
    const dVh = new Array(nHeads);
    for (let h = 0; h < nHeads; h++) {
        const g = scaledDotProductAttentionBackward(Qh[h], Kh[h], Vh[h], headWeights[h], dHeadOutputs[h]);
        dQh[h] = g.dQ;
        dKh[h] = g.dK;
        dVh[h] = g.dV;
    }

    // mergeHeads = kebalikan dari splitHeads untuk keperluan gradien
    const dQ = A.mergeHeads(dQh);
    const dK = A.mergeHeads(dKh);
    const dV = A.mergeHeads(dVh);

    const qLin = linearBackward(x, blockAttentionWeights.Wq, dQ);
    const kLin = linearBackward(x, blockAttentionWeights.Wk, dK);
    const vLin = linearBackward(x, blockAttentionWeights.Wv, dV);

    const dX = E.addMatrices(E.addMatrices(qLin.dX, kLin.dX), vLin.dX);

    return {
        dX: dX,
        dWq: qLin.dW, dWk: kLin.dW, dWv: vLin.dW, dWo: outLin.dW
    };
}

// ============================================================
// FORWARD DENGAN CACHE (per blok transformer)
// ============================================================
function transformerBlockForwardWithCache(x, blockWeights, config, mask) {
    const { E, A, T } = requireDeps();

    const normed1 = T.layerNorm(x, blockWeights.ln1);
    const attnOut = A.multiHeadAttention(normed1, blockWeights.attention, config.nHeads, mask);
    const afterAttn = E.addMatrices(x, attnOut);

    const normed2 = T.layerNorm(afterAttn, blockWeights.ln2);
    const ffnHiddenPre = E.addBiasRows(E.matmul(normed2, blockWeights.ffn.W1), blockWeights.ffn.b1);
    const ffnHiddenPost = ffnHiddenPre.map(function (row) { return row.map(T.gelu); });
    const ffnOut = E.addBiasRows(E.matmul(ffnHiddenPost, blockWeights.ffn.W2), blockWeights.ffn.b2);
    const afterFFN = E.addMatrices(afterAttn, ffnOut);

    return {
        output: afterFFN,
        cache: { x: x, normed1: normed1, afterAttn: afterAttn, normed2: normed2, ffnHiddenPre: ffnHiddenPre, ffnHiddenPost: ffnHiddenPost }
    };
}

function transformerBlockBackward(cache, blockWeights, config, mask, dOutput) {
    const { E, T } = requireDeps();

    // residual 2: afterFFN = afterAttn + ffnOut → gradien mengalir utuh ke DUA cabang
    const dFfnOut = dOutput;
    const dAfterAttnFromResidual2 = dOutput;

    const ffnW2Lin = linearWithBiasBackward(cache.ffnHiddenPost, blockWeights.ffn.W2, dFfnOut);
    const dFfnHiddenPost = ffnW2Lin.dX;
    const dFfnHiddenPre = geluBackward(cache.ffnHiddenPre, dFfnHiddenPost);
    const ffnW1Lin = linearWithBiasBackward(cache.normed2, blockWeights.ffn.W1, dFfnHiddenPre);
    const dNormed2 = ffnW1Lin.dX;

    const ln2Grad = layerNormBackward(cache.afterAttn, blockWeights.ln2, dNormed2);
    const dAfterAttn = E.addMatrices(dAfterAttnFromResidual2, ln2Grad.dX);

    // residual 1: afterAttn = x + attnOut → gradien mengalir utuh ke DUA cabang
    const dAttnOut = dAfterAttn;
    const dXFromResidual1 = dAfterAttn;

    const attnGrad = multiHeadAttentionBackward(cache.normed1, blockWeights.attention, config.nHeads, mask, dAttnOut);
    const dNormed1 = attnGrad.dX;

    const ln1Grad = layerNormBackward(cache.x, blockWeights.ln1, dNormed1);
    const dX = E.addMatrices(dXFromResidual1, ln1Grad.dX);

    return {
        dX: dX,
        gradients: {
            attention: { Wq: attnGrad.dWq, Wk: attnGrad.dWk, Wv: attnGrad.dWv, Wo: attnGrad.dWo },
            ffn: { W1: ffnW1Lin.dW, b1: ffnW1Lin.dB, W2: ffnW2Lin.dW, b2: ffnW2Lin.dB },
            ln1: { gamma: ln1Grad.dGamma, beta: ln1Grad.dBeta },
            ln2: { gamma: ln2Grad.dGamma, beta: ln2Grad.dBeta }
        }
    };
}

// ============================================================
// FORWARD PENUH (embedding → N blok → finalNorm → logits) DENGAN CACHE
// ============================================================
function forwardWithCache(tokenIds, model, config) {
    const { E, T, A } = requireDeps();

    const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, tokenIds);
    const posEnc = E.getPositionalEncoding(tokenIds.length, config.dModel);
    const x0 = E.addPositionalEncoding(tokenEmbeddings, posEnc);
    const mask = A.createCausalMask(tokenIds.length);

    const layerCaches = [];
    let hidden = x0;
    for (let i = 0; i < model.decoderWeights.layers.length; i++) {
        const result = transformerBlockForwardWithCache(hidden, model.decoderWeights.layers[i], config, mask);
        layerCaches.push(result.cache);
        hidden = result.output;
    }

    const finalHiddenPreNorm = hidden;
    const finalHidden = T.layerNorm(finalHiddenPreNorm, model.decoderWeights.finalNorm);
    const logits = E.matmul(finalHidden, model.decoderWeights.outputProjection);

    return {
        logits: logits,
        cache: { tokenIds: tokenIds, x0: x0, layerCaches: layerCaches, finalHiddenPreNorm: finalHiddenPreNorm, finalHidden: finalHidden, mask: mask }
    };
}

function backward(cache, dLogits, model, config) {
    const { E, T } = requireDeps();

    const outProjLin = linearBackward(cache.finalHidden, model.decoderWeights.outputProjection, dLogits);
    const dFinalHidden = outProjLin.dX;
    const dOutputProjection = outProjLin.dW;

    const finalNormGrad = layerNormBackward(cache.finalHiddenPreNorm, model.decoderWeights.finalNorm, dFinalHidden);
    let dHidden = finalNormGrad.dX;

    const layerGradients = new Array(model.decoderWeights.layers.length);
    for (let i = model.decoderWeights.layers.length - 1; i >= 0; i--) {
        const blockResult = transformerBlockBackward(cache.layerCaches[i], model.decoderWeights.layers[i], config, cache.mask, dHidden);
        layerGradients[i] = blockResult.gradients;
        dHidden = blockResult.dX;
    }

    // dHidden sekarang gradien terhadap x0 (embedding + positional encoding).
    // Positional encoding tidak punya parameter, jadi seluruh dHidden
    // adalah gradien buat embedding — di-scatter-add ke baris token yang
    // relevan (token yang sama di posisi berbeda gradiennya diakumulasi).
    const dEmbeddingMatrix = E.zerosMatrix(model.embeddingMatrix.length, config.dModel);
    for (let t = 0; t < cache.tokenIds.length; t++) {
        const id = cache.tokenIds[t];
        for (let d = 0; d < config.dModel; d++) {
            dEmbeddingMatrix[id][d] += dHidden[t][d];
        }
    }

    return {
        dEmbeddingMatrix: dEmbeddingMatrix,
        layerGradients: layerGradients,
        dFinalNorm: { gamma: finalNormGrad.dGamma, beta: finalNormGrad.dBeta },
        dOutputProjection: dOutputProjection
    };
}

// ============================================================
// GRADIENT CLIPPING (by global norm) — praktik standar training
// transformer, cegah SGD polos overshoot kalau kebetulan gradien
// di satu langkah jadi besar (umum terjadi di model kecil/awal
// training, tanpa ini loss bisa melonjak sesekali alih-alih turun
// stabil).
// ============================================================
function tensorSquaredNormSum(tensor) {
    let sum = 0;
    if (Array.isArray(tensor[0])) {
        for (let i = 0; i < tensor.length; i++) {
            for (let j = 0; j < tensor[i].length; j++) {
                sum += tensor[i][j] * tensor[i][j];
            }
        }
    } else {
        for (let i = 0; i < tensor.length; i++) {
            sum += tensor[i] * tensor[i];
        }
    }
    return sum;
}

function scaleTensor(tensor, factor) {
    if (Array.isArray(tensor[0])) {
        return tensor.map(function (row) { return row.map(function (v) { return v * factor; }); });
    }
    return tensor.map(function (v) { return v * factor; });
}

function clipGradientsByGlobalNorm(grads, maxNorm) {
    const allTensors = [grads.dEmbeddingMatrix, grads.dFinalNorm.gamma, grads.dFinalNorm.beta, grads.dOutputProjection];
    grads.layerGradients.forEach(function (g) {
        allTensors.push(g.attention.Wq, g.attention.Wk, g.attention.Wv, g.attention.Wo);
        allTensors.push(g.ffn.W1, g.ffn.b1, g.ffn.W2, g.ffn.b2);
        allTensors.push(g.ln1.gamma, g.ln1.beta, g.ln2.gamma, g.ln2.beta);
    });

    let totalSquared = 0;
    allTensors.forEach(function (t) { totalSquared += tensorSquaredNormSum(t); });
    const globalNorm = Math.sqrt(totalSquared);

    if (globalNorm <= maxNorm || globalNorm === 0) {
        return grads; // tidak perlu di-clip
    }

    const factor = maxNorm / globalNorm;
    grads.dEmbeddingMatrix = scaleTensor(grads.dEmbeddingMatrix, factor);
    grads.dFinalNorm.gamma = scaleTensor(grads.dFinalNorm.gamma, factor);
    grads.dFinalNorm.beta = scaleTensor(grads.dFinalNorm.beta, factor);
    grads.dOutputProjection = scaleTensor(grads.dOutputProjection, factor);
    grads.layerGradients.forEach(function (g) {
        g.attention.Wq = scaleTensor(g.attention.Wq, factor);
        g.attention.Wk = scaleTensor(g.attention.Wk, factor);
        g.attention.Wv = scaleTensor(g.attention.Wv, factor);
        g.attention.Wo = scaleTensor(g.attention.Wo, factor);
        g.ffn.W1 = scaleTensor(g.ffn.W1, factor);
        g.ffn.b1 = scaleTensor(g.ffn.b1, factor);
        g.ffn.W2 = scaleTensor(g.ffn.W2, factor);
        g.ffn.b2 = scaleTensor(g.ffn.b2, factor);
        g.ln1.gamma = scaleTensor(g.ln1.gamma, factor);
        g.ln1.beta = scaleTensor(g.ln1.beta, factor);
        g.ln2.gamma = scaleTensor(g.ln2.gamma, factor);
        g.ln2.beta = scaleTensor(g.ln2.beta, factor);
    });

    return grads;
}

// ============================================================
// TRAIN STEP — forward, loss, backward, update parameter
// ============================================================
// Adam opt-in lewat options.optimizer==='adam' (default tetap SGD,
// tidak mengubah perilaku yang sudah berjalan). Adam TIDAK menyentuh
// forward/backward/loss di atas (sudah diverifikasi gradient-checking
// sebelumnya) — cuma mengganti rumus UPDATE dari gradien yang sudah
// benar, jadi jauh lebih rendah risiko daripada mengubah backward().
function getAdamState(model, O) {
    if (!model._adamState) {
        model._adamState = {
            embeddingMatrix: O.createAdamState(model.embeddingMatrix),
            layers: model.decoderWeights.layers.map(function (layer) {
                return {
                    attention: {
                        Wq: O.createAdamState(layer.attention.Wq),
                        Wk: O.createAdamState(layer.attention.Wk),
                        Wv: O.createAdamState(layer.attention.Wv),
                        Wo: O.createAdamState(layer.attention.Wo)
                    },
                    ffn: {
                        W1: O.createAdamState(layer.ffn.W1),
                        b1: O.createAdamState(layer.ffn.b1),
                        W2: O.createAdamState(layer.ffn.W2),
                        b2: O.createAdamState(layer.ffn.b2)
                    },
                    ln1: { gamma: O.createAdamState(layer.ln1.gamma), beta: O.createAdamState(layer.ln1.beta) },
                    ln2: { gamma: O.createAdamState(layer.ln2.gamma), beta: O.createAdamState(layer.ln2.beta) }
                };
            }),
            finalNorm: {
                gamma: O.createAdamState(model.decoderWeights.finalNorm.gamma),
                beta: O.createAdamState(model.decoderWeights.finalNorm.beta)
            }
            // outputProjection TIDAK punya state Adam sendiri lagi —
            // weight tying berarti tidak ada update independen untuk
            // itu, gradiennya digabung ke embeddingMatrix (lihat
            // trainStep). Baris ini sengaja dihapus, bukan alpa.
        };
    }
    return model._adamState;
}

function trainStep(model, tokenIds, learningRate, maxGradNorm, options) {
    const { O, E } = requireDeps();
    maxGradNorm = typeof maxGradNorm === 'number' ? maxGradNorm : 1.0;
    options = options || {};
    const useAdam = options.optimizer === 'adam';
    const adamConfig = useAdam ? O.createAdamConfig({ learningRate: learningRate }) : null;
    const adamState = useAdam ? getAdamState(model, O) : null;
    function update(param, grad, stateRef) {
        return useAdam ? O.adamUpdate(param, grad, stateRef, adamConfig) : O.sgdUpdate(param, grad, learningRate);
    }

    if (tokenIds.length < 2) {
        throw new Error('[LLMTrainer] trainStep butuh minimal 2 token (1 input + 1 target)');
    }

    // Sekuens auto-train dibangun dari prompt agen ASLI (bisa jauh
    // lebih panjang dari maxContextLength) — dipotong di sini, satu
    // titik otoritatif yang melindungi semua pemanggil trainStep.
    const maxLen = model.config.model.maxContextLength;
    if (tokenIds.length > maxLen) {
        tokenIds = tokenIds.slice(0, maxLen);
        if (tokenIds.length < 2) {
            throw new Error('[LLMTrainer] trainStep: sequence terpotong jadi < 2 token setelah dibatasi maxContextLength');
        }
    }

    const inputIds = tokenIds.slice(0, -1);
    const targetIds = tokenIds.slice(1);

    const { logits, cache } = forwardWithCache(inputIds, model, model.config.model);
    const { loss, dLogits } = crossEntropyLossAndGrad(logits, targetIds);
    const grads = clipGradientsByGlobalNorm(backward(cache, dLogits, model, model.config.model), maxGradNorm);

    // WEIGHT TYING — outputProjection = transpose(embeddingMatrix),
    // jadi loss punya 2 JALUR pengaruh ke embeddingMatrix yang SAMA:
    // (1) lookup token langsung → grads.dEmbeddingMatrix, (2) lewat
    // proyeksi ke logits (outputProjection) → grads.dOutputProjection.
    // Gradien totalnya adalah JUMLAH keduanya (dOutputProjection
    // ditranspos dulu, karena arah pengaruhnya lewat matriks yang
    // ditranspos) — BUKAN diperbarui 2x terpisah, itu salah secara
    // matematis untuk parameter yang diikat. Diverifikasi lewat
    // gradient checking numerik (finite-difference vs analitik).
    const combinedEmbeddingGrad = E.addMatrices(grads.dEmbeddingMatrix, E.transpose(grads.dOutputProjection));
    model.embeddingMatrix = update(model.embeddingMatrix, combinedEmbeddingGrad, adamState && adamState.embeddingMatrix);

    model.decoderWeights.layers.forEach(function (layer, i) {
        const g = grads.layerGradients[i];
        const s = adamState && adamState.layers[i];
        layer.attention.Wq = update(layer.attention.Wq, g.attention.Wq, s && s.attention.Wq);
        layer.attention.Wk = update(layer.attention.Wk, g.attention.Wk, s && s.attention.Wk);
        layer.attention.Wv = update(layer.attention.Wv, g.attention.Wv, s && s.attention.Wv);
        layer.attention.Wo = update(layer.attention.Wo, g.attention.Wo, s && s.attention.Wo);
        layer.ffn.W1 = update(layer.ffn.W1, g.ffn.W1, s && s.ffn.W1);
        layer.ffn.b1 = update(layer.ffn.b1, g.ffn.b1, s && s.ffn.b1);
        layer.ffn.W2 = update(layer.ffn.W2, g.ffn.W2, s && s.ffn.W2);
        layer.ffn.b2 = update(layer.ffn.b2, g.ffn.b2, s && s.ffn.b2);
        layer.ln1.gamma = update(layer.ln1.gamma, g.ln1.gamma, s && s.ln1.gamma);
        layer.ln1.beta = update(layer.ln1.beta, g.ln1.beta, s && s.ln1.beta);
        layer.ln2.gamma = update(layer.ln2.gamma, g.ln2.gamma, s && s.ln2.gamma);
        layer.ln2.beta = update(layer.ln2.beta, g.ln2.beta, s && s.ln2.beta);
    });

    model.decoderWeights.finalNorm.gamma = update(model.decoderWeights.finalNorm.gamma, grads.dFinalNorm.gamma, adamState && adamState.finalNorm.gamma);
    model.decoderWeights.finalNorm.beta = update(model.decoderWeights.finalNorm.beta, grads.dFinalNorm.beta, adamState && adamState.finalNorm.beta);
    // Sinkronkan ulang (BUKAN update kedua terpisah — itu salah,
    // sudah digabung di gradien embeddingMatrix di atas). outputProjection
    // harus selalu = transpose(embeddingMatrix TERBARU) supaya forward
    // pass langkah berikutnya tetap konsisten dengan bobot yang baru.
    model.decoderWeights.outputProjection = E.transpose(model.embeddingMatrix);

    return loss;
}

// ============================================================
// TRAIN DI ATAS KORPUS — loop epoch × kalimat, pakai scheduler kalau ada
// ============================================================
// 🔧 FIX (root cause "layar macet" — bagian ke-2, lihat juga
// llm-tokenizer.js/llm-runtime.js untuk bagian ke-1/trainBPE): trainOnCorpus()
// menjalankan epochs × jumlah kalimat forward+backward LENGKAP secara
// sinkron — tiap panggilan trainStep() jauh lebih berat daripada 1
// iterasi merge BPE (melibatkan seluruh transformer, bukan cuma
// hitung pasangan simbol). Sekarang async, yield ke event loop tiap
// `yieldEvery` langkah (default 3 — lebih sering dari trainBPE karena
// tiap langkah di sini jauh lebih mahal) supaya auto-training di
// llm-core.js initialize() tidak mengunci render/input.
async function trainOnCorpus(model, tokenizedSequences, options) {
    options = options || {};
    const epochs = options.epochs || 1;
    const baseLearningRate = options.learningRate || 1e-3;
    const schedule = options.schedule || null;
    // 🔧 FIX (macet di HP sungguhan): default diturunkan dari 3 ke 1 —
    // yield ANTAR langkah tidak membantu kalau 1 langkah itu sendiri
    // sudah berat (lihat fix panjang sekuens di trainStep()); yield
    // tiap langkah adalah margin aman untuk perangkat mobile yang jauh
    // lebih lambat dari mesin pengembangan.
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    // 🔧 FIX PERTAHANAN BERLAPIS: yield SEGERA di sini, sebelum
    // trainStep() PERTAMA — supaya SIAPA PUN pemanggil trainOnCorpus()
    // (baik yang meng-await maupun yang sengaja tidak, seperti
    // trainInBackgroundThenSave() di workflow.js) TIDAK PERNAH secara
    // tidak sengaja menjalankan 1 langkah training penuh (berat)
    // secara sinkron sebagai bagian dari tick/task pemanggilnya
    // sendiri. Lihat catatan lengkap di workflow.js untuk kronologi
    // bug ini.
    await new Promise(function (resolve) { setTimeout(resolve, 0); });

    const history = [];
    let step = 0;
    const totalSteps = tokenizedSequences.filter(function (s) { return s.length >= 2; }).length * epochs;

    for (let epoch = 0; epoch < epochs; epoch++) {
        let epochLoss = 0;
        let count = 0;
        for (let s = 0; s < tokenizedSequences.length; s++) {
            const seq = tokenizedSequences[s];
            if (seq.length < 2) continue;

            step += 1;
            const lr = schedule && window.LLMScheduler
                ? window.LLMScheduler.getLearningRate(schedule, step)
                : baseLearningRate;

            const loss = trainStep(model, seq, lr, options.maxGradNorm, options);
            epochLoss += loss;
            count += 1;
            history.push({ step: step, epoch: epoch, loss: loss, learningRate: lr });

            // 🆕 Progres terlihat (opsional) — supaya training yang
            // makan waktu lama tidak terlihat seperti macet/hang di
            // mata pengguna. Tidak wajib dipakai pemanggil (default
            // no-op), jadi tidak mengubah perilaku kalau tidak diminta.
            if (onProgress) {
                onProgress({ step: step, totalSteps: totalSteps, epoch: epoch, loss: loss });
            }

            if (step % yieldEvery === 0) {
                await new Promise(function (resolve) { setTimeout(resolve, 0); });
            }
        }
        Logger.info('LLMTrainer', 'Epoch ' + epoch + ' selesai, avg loss: ' + (count ? (epochLoss / count).toFixed(4) : 'n/a'));
    }

    return { history: history, finalStep: step };
}

export const LLMTrainer = {
    crossEntropyLossAndGrad: crossEntropyLossAndGrad,
    linearBackward: linearBackward,
    linearWithBiasBackward: linearWithBiasBackward,
    geluBackward: geluBackward,
    layerNormBackward: layerNormBackward,
    scaledDotProductAttentionBackward: scaledDotProductAttentionBackward,
    multiHeadAttentionBackward: multiHeadAttentionBackward,
    transformerBlockForwardWithCache: transformerBlockForwardWithCache,
    transformerBlockBackward: transformerBlockBackward,
    forwardWithCache: forwardWithCache,
    backward: backward,
    clipGradientsByGlobalNorm: clipGradientsByGlobalNorm,
    trainStep: trainStep,
    trainOnCorpus: trainOnCorpus
};

window.LLMTrainer = LLMTrainer;

Logger.info('LLMTrainer', 'llm-trainer.js loaded');
