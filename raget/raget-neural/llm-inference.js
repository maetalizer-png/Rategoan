import { LLMEmbedding } from './llm-embedding.js';
import { LLMDecoder } from './llm-decoder.js';
import { LLMSampler } from './llm-sampler.js';

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

const STREAM_STOPS = ['<|endoftext|>', '\n\nPengguna:', '</s>'];

function cutStops(text) {
    let body = String(text || '');
    for (let i = 0; i < STREAM_STOPS.length; i += 1) {
        const at = body.indexOf(STREAM_STOPS[i]);
        if (at >= 0) body = body.slice(0, at);
    }
    return body;
}

async function* streamTokens(text, opt) {
    const shellMod = opt.shell ? null : await import('./bpe-shell.js');
    const shell = opt.shell || shellMod.bpeShell;
    const encode = opt.encode || ((value) => shell.encodeBytes(value));
    const decode = opt.decode || ((ids) => shell.decodeIds(ids));
    const eos = new Set(opt.eosIds || shell.eosIds());
    const signal = opt.signal;
    const maxNew = opt.maxNewTokens > 0 ? opt.maxNewTokens : 32;
    const context = encode(String(text || ''));
    const recent = [];
    const generated = [];
    let shown = '';
    for (let step = 0; step < maxNew; step += 1) {
        if (signal && signal.aborted) return;
        const logits = await opt.forward(context);
        const next = LLMSampler.sampleAdaptive(logits, {
            recentTokenIds: recent,
            temperature: opt.temperature,
            topK: opt.topK,
            topP: opt.topP,
            repetitionPenalty: opt.repetitionPenalty,
            jsonGrammarState: opt.jsonGrammarState,
            vocab: opt.grammarVocab,
            eosId: opt.eosId,
            wordBoundaryPending: opt.wordBoundaryPending,
        });
        if (eos.has(next)) return;
        recent.push(next);
        generated.push(next);
        context.push(next);
        const textNow = cutStops(decode(generated));
        const delta = textNow.slice(shown.length);
        shown = textNow;
        if (delta) yield delta;
        if (textNow.length < decode(generated).length) return;
    }
}

async function* generateTextStream(text, options) {
    const opt = options || {};
    if (typeof opt.forward === 'function') {
        yield* streamTokens(text, opt);
        return;
    }
    const body = cutStops(text);
    const parts = body.split(/(\s+)/).filter(Boolean);
    for (let i = 0; i < parts.length; i += 1) {
        if (opt.signal && opt.signal.aborted) return;
        yield parts[i];
    }
}

export const LLMInference = {
    createModelWeights: createModelWeights,
    forward: forward,
    forwardCached: forwardCached,
    forwardCachedAsync: forwardCachedAsync,
    getNextTokenLogits: getNextTokenLogits,
    generateTextStream: generateTextStream
};
