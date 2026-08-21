import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMTransformer } from './llm-transformer.js';
import { LLMSampler } from './llm-sampler.js';
import { LLMOptimizer } from './llm-optimizer.js';
import { LLMScheduler } from './llm-scheduler.js';

const Logger = {
    info: function () {  },
    warn: function () {  },
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
















function crossEntropyLossAndGrad(logits, targetIds) {
    const { S } = requireDeps();
    const seqLen = logits.length;
    let totalLoss = 0;
    const dLogits = new Array(seqLen);

    for (let t = 0; t < seqLen; t++) {
        const probs = S.softmax(logits[t]);
        const target = targetIds[t];
        const p = Math.max(probs[target], 1e-12); 
        totalLoss += -Math.log(p);

        dLogits[t] = probs.map(function (v) { return v / seqLen; });
        dLogits[t][target] -= 1 / seqLen;
    }

    return { loss: totalLoss / seqLen, dLogits: dLogits };
}






function linearBackward(x, W, dY) {
    const { E } = requireDeps();
    return {
        dX: E.matmul(dY, E.transpose(W)),
        dW: E.matmul(E.transpose(x), dY)
    };
}


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



function scaledDotProductAttentionBackward(Q, K, V, weights, dOutput) {
    const { E } = requireDeps();
    const dHead = Q[0].length;
    const scale = 1 / Math.sqrt(dHead);

    
    const dV = E.matmul(E.transpose(weights), dOutput);
    
    const dWeights = E.matmul(dOutput, E.transpose(V));

    
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

    
    const outLin = linearBackward(merged, blockAttentionWeights.Wo, dOutput);
    const dMerged = outLin.dX;

    
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

    
    const dFfnOut = dOutput;
    const dAfterAttnFromResidual2 = dOutput;

    const ffnW2Lin = linearWithBiasBackward(cache.ffnHiddenPost, blockWeights.ffn.W2, dFfnOut);
    const dFfnHiddenPost = ffnW2Lin.dX;
    const dFfnHiddenPre = geluBackward(cache.ffnHiddenPre, dFfnHiddenPost);
    const ffnW1Lin = linearWithBiasBackward(cache.normed2, blockWeights.ffn.W1, dFfnHiddenPre);
    const dNormed2 = ffnW1Lin.dX;

    const ln2Grad = layerNormBackward(cache.afterAttn, blockWeights.ln2, dNormed2);
    const dAfterAttn = E.addMatrices(dAfterAttnFromResidual2, ln2Grad.dX);

    
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
        return grads; 
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
    
    
    
    
    model.decoderWeights.outputProjection = E.transpose(model.embeddingMatrix);

    return loss;
}













async function trainOnCorpus(model, tokenizedSequences, options) {
    options = options || {};
    const epochs = options.epochs || 1;
    const baseLearningRate = options.learningRate || 1e-3;
    const schedule = options.schedule || null;
    
    
    
    
    
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const onProgress = typeof options.onProgress === 'function' ? options.onProgress : null;

    
    
    
    
    
    
    
    
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
            const lr = schedule && LLMScheduler
                ? LLMScheduler.getLearningRate(schedule, step)
                : baseLearningRate;

            const loss = trainStep(model, seq, lr, options.maxGradNorm, options);
            epochLoss += loss;
            count += 1;
            history.push({ step: step, epoch: epoch, loss: loss, learningRate: lr });

            
            
            
            
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
Logger.info('LLMTrainer', 'llm-trainer.js loaded');
