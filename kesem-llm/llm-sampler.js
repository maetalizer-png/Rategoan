import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMJSONGrammar } from './llm-json-grammar.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// SOFTMAX (numerically stable) — duplikat kecil disengaja, sama
// seperti alasan llm-runtime.js: llm-sampler.js tidak WAJIB bergantung ke
// llm-attention.js cuma buat softmax dasar.
// ============================================================
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
    return probabilities.length - 1; // jaga-jaga pembulatan floating point
}

// ============================================================
// STRATEGI 1: GREEDY — selalu ambil logit tertinggi, deterministik
// ============================================================
function greedySample(logits) {
    return argmax(logits);
}

// ============================================================
// STRATEGI 2: TEMPERATURE — skala logits sebelum softmax.
// temperature < 1 → lebih "yakin"/tajam, > 1 → lebih acak/kreatif
// ============================================================
function temperatureSample(logits, temperature) {
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = softmax(scaled);
    return sampleFromProbabilities(probs);
}

// ============================================================
// STRATEGI 3: TOP-K — cuma pertimbangkan K token dengan logit
// tertinggi, sisanya dibuang sebelum sampling.
// ============================================================
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

// ============================================================
// STRATEGI 4: TOP-P / NUCLEUS — urutkan probabilitas menurun,
// pertahankan himpunan terkecil yang jumlah kumulatifnya >= p.
// ============================================================
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

// ============================================================
// REPETITION PENALTY — turunkan logit token yang sudah muncul di
// sequence yang baru digenerate (CTRL-style: logit positif dibagi
// penalty, logit negatif dikali penalty, supaya keduanya bergerak
// ke arah "kurang mungkin dipilih lagi"). penalty=1 = tidak ada efek.
// ============================================================
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

// ============================================================
// CONSTRAINED JSON OUTPUT (Fase 0 roadmap) — mask logits so only
// tokens that keep the output on track to be valid JSON can be
// sampled. Guarantees JSON.parse()-validity of the STRUCTURE only
// (brackets/quotes/commas/number syntax) — it says nothing about
// whether field values are semantically correct, which is a separate,
// much harder problem this deliberately does not attempt.
// ============================================================

// A BPE piece's raw text carries a word-boundary suffix (llm-tokenizer.js's
// END_OF_WORD) that isn't part of the actual output characters.
function pieceInfo(id, vocab) {
    const raw = vocab.idToToken.get(id);
    if (raw === undefined) return null;
    const eow = LLMTokenizer.END_OF_WORD;
    const endsWord = raw.endsWith(eow);
    const core = endsWord ? raw.slice(0, -eow.length) : raw;
    return { core: core, endsWord: endsWord };
}

// detokenize() (llm-tokenizer.js) inserts a space BEFORE a new word starts,
// UNLESS that whole word turns out to be a single NO_SPACE_BEFORE
// punctuation character — and JSON's true/false/null literals and numbers
// are NEVER valid with a space in the middle (unlike string CONTENT, which
// tolerates a space anywhere). Evaluated one candidate token at a time
// (no multi-token lookahead into what the rest of an eventual word will
// be), so this conservatively assumes a space WILL land whenever it can't
// yet prove the single-char-punctuation exception applies — it can only
// reject a few technically-fine continuations this way, never accept one
// that would actually come out corrupted by an inserted space.
function impliedText(wordBoundaryPending, piece) {
    if (!wordBoundaryPending) return piece.core;
    const isSinglePunctWord = piece.endsWord && piece.core.length === 1 && LLMTokenizer.NO_SPACE_BEFORE.has(piece.core);
    return isSinglePunctWord ? piece.core : ' ' + piece.core;
}

// Returns { logits, anyValid }. anyValid=false means EVERY vocab token
// would break JSON structure from this grammar state (should be rare —
// base ASCII punctuation is normally present in any BPE vocab trained on
// real text — but a fixed, finite vocab can never be proven exhaustive).
// Callers MUST use the returned (unmasked) logits in that case rather
// than sample from an all -Infinity row, which would break generation
// outright — fail open, never fail closed into a stuck/broken generator.
function constrainLogitsToJSON(logits, vocab, grammarState, eosId, wordBoundaryPending) {
    const masked = logits.slice();
    let anyValid = false;
    for (let id = 0; id < masked.length; id++) {
        if (masked[id] === -Infinity) continue; // already excluded upstream (PAD/UNK/BOS/invalid ids)
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
        Logger.warn('LLMSampler', 'constrainLogitsToJSON: tidak ada token valid dari vocab pada state ini — fail-open, lanjut tanpa constraint di langkah ini');
        return { logits: logits, anyValid: false };
    }
    return { logits: masked, anyValid: true };
}

// Dipanggil setelah sample() mengembalikan sebuah token id sungguhan —
// majukan grammar state DAN status word-boundary dengan teks token itu,
// supaya langkah berikutnya tahu persis posisi struktur JSON saat ini
// (termasuk apakah token berikutnya akan mendapat spasi tersisip di
// depannya oleh detokenize()).
function advanceJSONGrammar(grammarState, tokenId, vocab, eosId, wordBoundaryPending) {
    if (tokenId === eosId) return { state: grammarState, wordBoundaryPending: wordBoundaryPending };
    const piece = pieceInfo(tokenId, vocab);
    if (!piece) return { state: grammarState, wordBoundaryPending: wordBoundaryPending };
    const text = impliedText(wordBoundaryPending, piece);
    const next = LLMJSONGrammar.stepText(grammarState, text) || grammarState;
    return { state: next, wordBoundaryPending: piece.endsWord };
}

// ============================================================
// DISPATCHER
// ============================================================
// options.strategy: 'greedy' | 'temperature' | 'topK' | 'topP' (default 'temperature')
// options.repetitionPenalty + options.recentTokenIds: opsional, diterapkan
// ke logits SEBELUM strategi pemilihan token manapun (termasuk greedy).
// options.jsonGrammarState + options.vocab + options.eosId: opsional —
// kalau ketiganya diisi, constrainLogitsToJSON() diterapkan sebelum
// strategi manapun (jadi berlaku sama untuk greedy/temperature/topK/topP).
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

window.LLMSampler = LLMSampler;

Logger.info('LLMSampler', 'llm-sampler.js loaded');
