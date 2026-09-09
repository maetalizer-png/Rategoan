import { LLMEmbedding } from './llm-embedding.js';
import { LLMDecoder } from './llm-decoder.js';

function requireDeps() {
    return { E: LLMEmbedding, D: LLMDecoder };
}

function createModelWeights(config) {
    const { E, D } = requireDeps();
    const embeddingMatrix = E.createEmbeddingMatrix(config.vocabSize, config.dModel, config.initStd);
    const decoderWeights = D.createDecoderWeights(config);

    decoderWeights.outputProjection = E.transpose(embeddingMatrix);

    return {
        embeddingMatrix: embeddingMatrix,
        decoderWeights: decoderWeights
    };
}

function forward(tokenIds, model, config) {
    const { E, D } = requireDeps();

    if (!Array.isArray(tokenIds) || tokenIds.length === 0) {
        throw new Error('[LLMInference] forward butuh tokenIds non-kosong');
    }
    if (tokenIds.length > config.maxContextLength) {
        throw new Error('[LLMInference] panjang sequence (' + tokenIds.length + ') melebihi maxContextLength (' + config.maxContextLength + ')');
    }

    const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, tokenIds);
    const posEnc = E.getPositionalEncoding(tokenIds.length, config.dModel);
    const x = E.addPositionalEncoding(tokenEmbeddings, posEnc);

    const hidden = D.runDecoder(x, model.decoderWeights, config);
    return D.projectToLogits(hidden, model.decoderWeights);
}

function forwardCached(newTokenIds, model, config, layerCaches, positionOffset) {
    const { E, D } = requireDeps();

    if (!Array.isArray(newTokenIds) || newTokenIds.length === 0) {
        throw new Error('[LLMInference] forwardCached butuh newTokenIds non-kosong');
    }
    const totalLen = positionOffset + newTokenIds.length;
    if (totalLen > config.maxContextLength) {
        throw new Error('[LLMInference] panjang sequence (' + totalLen + ') melebihi maxContextLength (' + config.maxContextLength + ')');
    }

    const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, newTokenIds);

    const fullPosEnc = E.getPositionalEncoding(totalLen, config.dModel);
    const posEncForNew = fullPosEnc.slice(positionOffset, totalLen);
    const x = E.addPositionalEncoding(tokenEmbeddings, posEncForNew);

    const result = D.runDecoderCached(x, model.decoderWeights, config, layerCaches);
    const logits = D.projectToLogits(result.hidden, model.decoderWeights);
    return { logits: logits, layerCaches: result.layerCaches };
}

function getNextTokenLogits(tokenIds, model, config) {
    const logits = forward(tokenIds, model, config);
    return logits[logits.length - 1];
}

async function forwardCachedAsync(newTokenIds, model, config, layerCaches, positionOffset) {
    const { E, D } = requireDeps();

    if (!Array.isArray(newTokenIds) || newTokenIds.length === 0) {
        throw new Error('[LLMInference] forwardCachedAsync butuh newTokenIds non-kosong');
    }
    const totalLen = positionOffset + newTokenIds.length;
    if (totalLen > config.maxContextLength) {
        throw new Error('[LLMInference] panjang sequence (' + totalLen + ') melebihi maxContextLength (' + config.maxContextLength + ')');
    }

    const tokenEmbeddings = E.lookupEmbeddings(model.embeddingMatrix, newTokenIds);
    const fullPosEnc = E.getPositionalEncoding(totalLen, config.dModel);
    const posEncForNew = fullPosEnc.slice(positionOffset, totalLen);
    const x = E.addPositionalEncoding(tokenEmbeddings, posEncForNew);

    const result = await D.runDecoderCachedAsync(x, model.decoderWeights, config, layerCaches);
    const logits = await D.projectToLogitsAsync(result.hidden, model.decoderWeights);
    return { logits: logits, layerCaches: result.layerCaches };
}

export const LLMInference = {
    createModelWeights: createModelWeights,
    forward: forward,
    forwardCached: forwardCached,
    forwardCachedAsync: forwardCachedAsync,
    getNextTokenLogits: getNextTokenLogits
};
