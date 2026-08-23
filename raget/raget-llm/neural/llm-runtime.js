import { LLMConfig } from './llm-config.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMInference } from './llm-inference.js';
import { LLMSampler } from './llm-sampler.js';

async function createModel(options) {
    options = options || {};
    if (!Array.isArray(options.corpus) || options.corpus.length === 0) {
        throw new Error('[LLMRuntime] createModel butuh options.corpus (array teks buat latih tokenizer)');
    }
    const config = LLMConfig.createConfig(options.configOptions || {});
    const numMerges = Math.max(1, config.model.vocabSize - 4 - 256);
    const bpeResult = await LLMTokenizer.trainBPE(options.corpus, numMerges, { yieldEvery: options.yieldEvery });
    const vocab = LLMVocabulary.buildVocabulary(
        bpeResult.vocab,
        config.specialTokens,
        config.specialTokenIds,
        config.model.vocabSize
    );
    const weights = LLMInference.createModelWeights(config.model);
    return {
        config: config,
        merges: bpeResult.merges,
        vocab: vocab,
        embeddingMatrix: weights.embeddingMatrix,
        decoderWeights: weights.decoderWeights
    };
}

function argmax(row) {
    let bestIdx = 0;
    let bestVal = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > bestVal) {
            bestVal = row[i];
            bestIdx = i;
        }
    }
    return bestIdx;
}

const validIdCache = new WeakMap();
function getInvalidIdMask(vocab, vocabSize) {
    let cached = validIdCache.get(vocab);
    if (cached) return cached;
    const invalidIds = [];
    for (let id = 0; id < vocabSize; id++) {
        if (!vocab.idToToken.has(id)) invalidIds.push(id);
    }
    validIdCache.set(vocab, invalidIds);
    return invalidIds;
}
function maskSpecialTokens(logits, vocab, suppressEos) {
    const masked = logits.slice();
    if (typeof vocab.unkId === 'number') masked[vocab.unkId] = -Infinity;
    if (typeof vocab.padId === 'number') masked[vocab.padId] = -Infinity;
    if (typeof vocab.bosId === 'number') masked[vocab.bosId] = -Infinity;
    if (suppressEos && typeof vocab.eosId === 'number') masked[vocab.eosId] = -Infinity;
    const invalidIds = getInvalidIdMask(vocab, logits.length);
    for (let i = 0; i < invalidIds.length; i++) {
        masked[invalidIds[i]] = -Infinity;
    }
    return masked;
}
function sampleNextToken(logits, temperature, greedy, samplingOptions) {
    samplingOptions = samplingOptions || {};
    if (greedy) {
        const penalized = LLMSampler.applyRepetitionPenalty(logits, samplingOptions.recentTokenIds, samplingOptions.repetitionPenalty);
        return LLMSampler.argmax(penalized);
    }
    return LLMSampler.sample(logits, {
        strategy: 'topP',
        p: typeof samplingOptions.topP === 'number' ? samplingOptions.topP : 0.9,
        temperature: temperature,
        repetitionPenalty: samplingOptions.repetitionPenalty,
        recentTokenIds: samplingOptions.recentTokenIds
    });
}

function isStopped(options) {
    if (!options) {
        return false;
    }
    const s = options.stopSignal;
    if (!s) {
        return false;
    }
    if (typeof s === 'function') {
        return !!s();
    }
    if (typeof s === 'object') {
        return !!s.stopped;
    }
    return false;
}

async function generate(model, promptText, options) {
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const minNewTokens = Number.isInteger(options.minNewTokens) ? options.minNewTokens : (model.config.runtime.minNewTokens || 0);
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const pieces = LLMTokenizer.tokenize(promptText, model.merges);
    const promptIds = LLMVocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }
    const generatedIds = [];
    let stoppedAtEos = false;
    let stoppedBySignal = false;
    for (let step = 0; step < maxNewTokens; step++) {
        if (isStopped(options)) {
            stoppedBySignal = true;
            break;
        }
        if (ids.length >= model.config.model.maxContextLength) {
            break;
        }
        const logits = LLMInference.getNextTokenLogits(ids, model, model.config.model);
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab, generatedIds.length < minNewTokens), temperature, greedy, {
            topP: topP,
            repetitionPenalty: repetitionPenalty,
            recentTokenIds: generatedIds.slice(-64)
        });
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        ids.push(nextId);
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
    }
    const generatedPieces = LLMVocabulary.decode(generatedIds, model.vocab);
    const text = LLMTokenizer.detokenize(generatedPieces);
    return {
        text: text,
        tokenIds: generatedIds,
        tokensGenerated: generatedIds.length,
        stoppedAtEos: stoppedAtEos,
        stoppedBySignal: stoppedBySignal
    };
}

async function generateCached(model, promptText, options) {
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const minNewTokens = Number.isInteger(options.minNewTokens) ? options.minNewTokens : (model.config.runtime.minNewTokens || 0);
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const pieces = LLMTokenizer.tokenize(promptText, model.merges);
    const promptIds = LLMVocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);

    const LOCAL_MAX_PROMPT_TOKENS = 150;
    if (ids.length > LOCAL_MAX_PROMPT_TOKENS) {
        const headLen = Math.floor(LOCAL_MAX_PROMPT_TOKENS * 0.4);
        const tailLen = LOCAL_MAX_PROMPT_TOKENS - headLen - 1;
        const head = ids.slice(1, 1 + headLen);
        const tail = ids.slice(ids.length - tailLen);
        ids = [model.vocab.bosId].concat(head, tail);
    }
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }

    let result = LLMInference.forwardCached(ids, model, model.config.model, null, 0);
    let layerCaches = result.layerCaches;
    let positionOffset = ids.length;

    const generatedIds = [];
    let stoppedAtEos = false;
    let stoppedBySignal = false;
    for (let step = 0; step < maxNewTokens; step++) {
        if (isStopped(options)) {
            stoppedBySignal = true;
            break;
        }
        if (positionOffset >= model.config.model.maxContextLength) {
            break;
        }
        const logits = result.logits[result.logits.length - 1];
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab, generatedIds.length < minNewTokens), temperature, greedy, {
            topP: topP,
            repetitionPenalty: repetitionPenalty,
            recentTokenIds: generatedIds.slice(-64)
        });
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        if (step + 1 >= maxNewTokens) {
            break;
        }
        result = LLMInference.forwardCached([nextId], model, model.config.model, layerCaches, positionOffset);
        layerCaches = result.layerCaches;
        positionOffset += 1;
    }
    const generatedPieces = LLMVocabulary.decode(generatedIds, model.vocab);
    const text = LLMTokenizer.detokenize(generatedPieces);
    return {
        text: text,
        tokenIds: generatedIds,
        tokensGenerated: generatedIds.length,
        stoppedAtEos: stoppedAtEos,
        stoppedBySignal: stoppedBySignal
    };
}

export const LLMRuntime = {
    createModel: createModel,
    generate: generate,
    generateCached: generateCached,
    sampleNextToken: sampleNextToken,
    argmax: argmax
};
