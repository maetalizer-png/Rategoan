import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMJSONGrammar } from './llm-json-grammar.js';

function softmax(row) {
    let max = -Infinity;
    for (let i = 0; i < row.length; i++) {
        if (row[i] > max) max = row[i];
    }
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
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

function sampleFromProbabilities(probabilities) {
    const r = Math.random();
    let cumulative = 0;
    for (let i = 0; i < probabilities.length; i++) {
        cumulative += probabilities[i];
        if (r <= cumulative) {
            return i;
        }
    }
    return probabilities.length - 1; 
}

function greedySample(logits) {
    return argmax(logits);
}

function temperatureSample(logits, temperature) {
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = softmax(scaled);
    return sampleFromProbabilities(probs);
}

function topKSample(logits, k, temperature) {
    k = Math.max(1, Math.min(k, logits.length));
    const indexed = logits.map(function (v, i) { return { v: v, i: i }; });
    indexed.sort(function (a, b) { return b.v - a.v; });
    const topIndices = indexed.slice(0, k).map(function (e) { return e.i; });

    const filtered = logits.map(function (v, i) {
        return topIndices.includes(i) ? v : -Infinity;
    });

    const T = Math.max(1e-6, temperature);
    const scaled = filtered.map(function (v) { return v === -Infinity ? -Infinity : v / T; });
    const probs = softmax(scaled);
    return sampleFromProbabilities(probs);
}

function topPSample(logits, p, temperature) {
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = softmax(scaled);

    const indexed = probs.map(function (prob, i) { return { prob: prob, i: i }; });
    indexed.sort(function (a, b) { return b.prob - a.prob; });

    let cumulative = 0;
    const nucleus = [];
    for (let n = 0; n < indexed.length; n++) {
        nucleus.push(indexed[n]);
        cumulative += indexed[n].prob;
        if (cumulative >= p) {
            break;
        }
    }

    const nucleusSum = nucleus.reduce(function (sum, e) { return sum + e.prob; }, 0);
    const renormalized = nucleus.map(function (e) { return e.prob / nucleusSum; });

    const chosenLocal = sampleFromProbabilities(renormalized);
    return nucleus[chosenLocal].i;
}

function applyRepetitionPenalty(logits, recentTokenIds, penalty) {
    if (!penalty || penalty === 1 || !recentTokenIds || recentTokenIds.length === 0) {
        return logits;
    }
    const seen = new Set(recentTokenIds);
    return logits.map(function (v, i) {
        if (!seen.has(i)) return v;
        return v > 0 ? v / penalty : v * penalty;
    });
}

function pieceInfo(id, vocab) {
    const raw = vocab.idToToken.get(id);
    if (raw === undefined) return null;
    const eow = LLMTokenizer.END_OF_WORD;
    const endsWord = raw.endsWith(eow);
    const core = endsWord ? raw.slice(0, -eow.length) : raw;
    return { core: core, endsWord: endsWord };
}

function impliedText(wordBoundaryPending, piece) {
    if (!wordBoundaryPending) return piece.core;
    const isSinglePunctWord = piece.endsWord && piece.core.length === 1 && LLMTokenizer.NO_SPACE_BEFORE.has(piece.core);
    return isSinglePunctWord ? piece.core : ' ' + piece.core;
}

function constrainLogitsToJSON(logits, vocab, grammarState, eosId, wordBoundaryPending) {
    const masked = logits.slice();
    let anyValid = false;
    for (let id = 0; id < masked.length; id++) {
        if (masked[id] === -Infinity) continue; 
        if (id === eosId) {
            if (LLMJSONGrammar.isComplete(grammarState)) anyValid = true;
            else masked[id] = -Infinity;
            continue;
        }
        const piece = pieceInfo(id, vocab);
        if (!piece || piece.core.length === 0) { masked[id] = -Infinity; continue; }
        const text = impliedText(wordBoundaryPending, piece);
        if (!LLMJSONGrammar.stepText(grammarState, text)) { masked[id] = -Infinity; continue; }
        anyValid = true;
    }
    if (!anyValid) {
        return { logits: logits, anyValid: false };
    }
    return { logits: masked, anyValid: true };
}

function advanceJSONGrammar(grammarState, tokenId, vocab, eosId, wordBoundaryPending) {
    if (tokenId === eosId) return { state: grammarState, wordBoundaryPending: wordBoundaryPending };
    const piece = pieceInfo(tokenId, vocab);
    if (!piece) return { state: grammarState, wordBoundaryPending: wordBoundaryPending };
    const text = impliedText(wordBoundaryPending, piece);
    const next = LLMJSONGrammar.stepText(grammarState, text) || grammarState;
    return { state: next, wordBoundaryPending: piece.endsWord };
}

function sample(logits, options) {
    options = options || {};
    const strategy = options.strategy || 'temperature';
    const temperature = typeof options.temperature === 'number' ? options.temperature : 0.8;
    let penalizedLogits = applyRepetitionPenalty(logits, options.recentTokenIds, options.repetitionPenalty);
    if (options.jsonGrammarState && options.vocab) {
        penalizedLogits = constrainLogitsToJSON(penalizedLogits, options.vocab, options.jsonGrammarState, options.eosId, options.wordBoundaryPending).logits;
    }

    switch (strategy) {
        case 'greedy':
            return greedySample(penalizedLogits);
        case 'topK':
            return topKSample(penalizedLogits, options.k || 40, temperature);
        case 'topP':
            return topPSample(penalizedLogits, options.p || 0.9, temperature);
        case 'temperature':
            return temperatureSample(penalizedLogits, temperature);
        default:
            throw new Error('[LLMSampler] strategy "' + strategy + '" tidak dikenal');
    }
}

export const LLMSampler = {
    softmax: softmax,
    argmax: argmax,
    greedySample: greedySample,
    temperatureSample: temperatureSample,
    topKSample: topKSample,
    topPSample: topPSample,
    applyRepetitionPenalty: applyRepetitionPenalty,
    constrainLogitsToJSON: constrainLogitsToJSON,
    advanceJSONGrammar: advanceJSONGrammar,
    sample: sample
};
