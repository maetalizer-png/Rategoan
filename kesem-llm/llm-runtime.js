import { LLMConfig } from './llm-config.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMInference } from './llm-inference.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireDeps() {
    return {
        Config: LLMConfig,
        Tokenizer: LLMTokenizer,
        Vocabulary: LLMVocabulary,
        Inference: LLMInference
    };
}
// ============================================================
// BUAT MODEL
// ============================================================
async function createModel(options) {
    const { Config, Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    if (!Array.isArray(options.corpus) || options.corpus.length === 0) {
        throw new Error('[LLMRuntime] createModel butuh options.corpus (array teks buat latih tokenizer)');
    }
    const config = Config.createConfig(options.configOptions || {});
    const numMerges = Math.max(1, config.model.vocabSize - 4 - 256);
    const bpeResult = await Tokenizer.trainBPE(options.corpus, numMerges, { yieldEvery: options.yieldEvery });
    const vocab = Vocabulary.buildVocabulary(
        bpeResult.vocab,
        config.specialTokens,
        config.specialTokenIds,
        config.model.vocabSize
    );
    const weights = Inference.createModelWeights(config.model);
    return {
        config: config,
        merges: bpeResult.merges,
        vocab: vocab,
        embeddingMatrix: weights.embeddingMatrix,
        decoderWeights: weights.decoderWeights
    };
}
// ============================================================
// SAMPLING DASAR
// ============================================================
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
function sampleWeighted(probabilities) {
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
// Q1 (Juli 2026, DIPERBAIKI setelah verifikasi empiris menunjukkan mask
// awal tidak cukup): mask SEMUA id yang TIDAK punya token nyata di
// vocab.idToToken — bukan cuma unkId literal. decode() (llm-vocabulary.js)
// mengembalikan string "<unk>" utk id APAPUN yang tidak ada di map, dan
// BPE sering menghasilkan vocabulary AKTUAL lebih kecil dari vocabSize
// yang dikonfigurasi (banyak id di ujung atas TIDAK PERNAH dipetakan ke
// token nyata) — model bisa memilih id "kosong" itu, semuanya decode
// jadi <unk> walau bukan unkId resmi. Daftar id valid dihitung SEKALI
// per model (cache di closure, bukan per-token) demi performa.
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
function maskSpecialTokens(logits, vocab) {
    const masked = logits.slice();
    if (typeof vocab.unkId === 'number') masked[vocab.unkId] = -Infinity;
    if (typeof vocab.padId === 'number') masked[vocab.padId] = -Infinity;
    if (typeof vocab.bosId === 'number') masked[vocab.bosId] = -Infinity;
    // Blokir SEMUA id tanpa token nyata (akar masalah sebenarnya —
    // lihat catatan di atas), bukan cuma id spesial yang bernama.
    const invalidIds = getInvalidIdMask(vocab, logits.length);
    for (let i = 0; i < invalidIds.length; i++) {
        masked[invalidIds[i]] = -Infinity;
    }
    return masked;
}
function sampleNextToken(logits, temperature, greedy, samplingOptions) {
    samplingOptions = samplingOptions || {};
    if (greedy) {
        // Repetition penalty tetap berlaku di mode greedy juga — tanpa itu
        // greedy decoding gampang terjebak loop "kata yang sama berulang".
        if (window.LLMSampler) {
            let penalized = window.LLMSampler.applyRepetitionPenalty(logits, samplingOptions.recentTokenIds, samplingOptions.repetitionPenalty);
            if (samplingOptions.jsonGrammarState && samplingOptions.vocab) {
                penalized = window.LLMSampler.constrainLogitsToJSON(penalized, samplingOptions.vocab, samplingOptions.jsonGrammarState, samplingOptions.eosId, samplingOptions.wordBoundaryPending).logits;
            }
            return window.LLMSampler.argmax(penalized);
        }
        return argmax(logits);
    }
    if (window.LLMSampler) {
        return window.LLMSampler.sample(logits, {
            strategy: 'topP',
            p: typeof samplingOptions.topP === 'number' ? samplingOptions.topP : 0.9,
            temperature: temperature,
            repetitionPenalty: samplingOptions.repetitionPenalty,
            recentTokenIds: samplingOptions.recentTokenIds,
            jsonGrammarState: samplingOptions.jsonGrammarState,
            vocab: samplingOptions.vocab,
            eosId: samplingOptions.eosId,
            wordBoundaryPending: samplingOptions.wordBoundaryPending
        });
    }
    const T = Math.max(1e-6, temperature);
    const scaled = logits.map(function (v) { return v / T; });
    const probs = window.LLMAttention ? window.LLMAttention.softmaxRow(scaled) : softmaxFallback(scaled);
    return sampleWeighted(probs);
}
function softmaxFallback(row) {
    const max = Math.max.apply(null, row);
    const exps = row.map(function (x) { return Math.exp(x - max); });
    const sum = exps.reduce(function (a, b) { return a + b; }, 0);
    return exps.map(function (e) { return e / sum; });
}
// ============================================================
// STOP SIGNAL — baca dari options.stopSignal (objek atau fungsi)
// ============================================================
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
// ============================================================
// GENERATE — loop token demi token (ASYNC, tidak membekukan UI)
// ============================================================
// options: { maxNewTokens, temperature, greedy, yieldEvery, stopSignal }
// yieldEvery: lepas kendali ke browser tiap sekian token (default 1 =
//   tiap token, paling responsif). Satu forward pass tetap sinkron,
//   tapi jeda antar-token membuat layar bisa scroll & klik diproses.
// stopSignal: objek {stopped:true} atau fungsi ()=>boolean; kalau true
//   di awal suatu langkah, loop berhenti (stoppedBySignal=true).
async function generate(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    const pieces = Tokenizer.tokenize(promptText, model.merges);
    const promptIds = Vocabulary.encode(pieces, model.vocab);
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
        const logits = Inference.getNextTokenLogits(ids, model, model.config.model);
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy, {
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
    const generatedPieces = Vocabulary.decode(generatedIds, model.vocab);
    const text = Tokenizer.detokenize(generatedPieces);
    return {
        text: text,
        tokenIds: generatedIds,
        tokensGenerated: generatedIds.length,
        stoppedAtEos: stoppedAtEos,
        stoppedBySignal: stoppedBySignal
    };
}
// Versi KV-CACHE dari generate() — panggilan PERTAMA proses seluruh
// prompt sekali (bangun cache awal), langkah SELANJUTNYA cuma proses 1
// token baru lewat forwardCached() (bukan mengulang seluruh sequence
// yang terus tumbuh tiap langkah seperti generate() lama). Solusi O(n)
// menggantikan O(n²) — inilah akar lambatnya generate() sebelumnya.
// generate() lama TIDAK diubah/dihapus, tetap tersedia sbg referensi.
async function generateCached(model, promptText, options) {
    const { Tokenizer, Vocabulary, Inference } = requireDeps();
    options = options || {};
    const maxNewTokens = Number.isInteger(options.maxNewTokens) ? options.maxNewTokens : model.config.runtime.maxNewTokens;
    const temperature = typeof options.temperature === 'number' ? options.temperature : model.config.runtime.temperature;
    const greedy = typeof options.greedy === 'boolean' ? options.greedy : model.config.runtime.greedy;
    const topP = typeof options.topP === 'number' ? options.topP : model.config.runtime.topP;
    const repetitionPenalty = typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : model.config.runtime.repetitionPenalty;
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 1;
    // Opt-in only (Fase 0 roadmap: constrained JSON output) — default
    // behavior for every existing caller is completely unchanged unless
    // they explicitly pass constrainJSON:true. window.LLMJSONGrammar comes
    // from llm-json-grammar.js (imported transitively via llm-sampler.js).
    const constrainJSON = options.constrainJSON === true && !!window.LLMJSONGrammar;
    let jsonGrammarState = constrainJSON ? window.LLMJSONGrammar.createState() : null;
    // Tracks whether detokenize() would insert a space before the NEXT
    // token's text (true right after a token that completed a "word") —
    // needed because JSON literals/numbers can't tolerate an inserted
    // space, unlike string content (see llm-sampler.js's impliedText()).
    let jsonWordBoundaryPending = false;
    const pieces = Tokenizer.tokenize(promptText, model.merges);
    const promptIds = Vocabulary.encode(pieces, model.vocab);
    let ids = [model.vocab.bosId].concat(promptIds);
    // FIX ROOT CAUSE SEBENARNYA (Juli 2026, ditemukan dari laporan
    // pengguna nyata): panggilan PERTAMA forwardCached() (di bawah)
    // memproses SELURUH prompt tanpa cache (belum ada apa pun utk
    // di-cache) — biayanya O(promptLen²), TIDAK terbantu KV-cache
    // sama sekali (cache cuma membantu token SETELAH prompt). Prompt
    // agen ASLI (~422 token, bukan prompt pendek uji coba sebelumnya)
    // bikin langkah ini sendiri makan puluhan detik di SKALA MANAPUN
    // (diukur: 24,6 detik di preset medium, 37 detik di large) —
    // inilah akar lambat sebenarnya, BUKAN soal ukuran model semata.
    // Dibatasi khusus jalur lokal, simpan bagian AKHIR prompt (biasanya
    // berisi topik/instruksi spesifik, bukan cuma system prompt umum).
    // FIX (Juli 2026, rekomendasi eksternal yang tepat): truncation
    // SEBELUMNYA cuma simpan bagian AKHIR prompt — tapi identitas agen
    // ("Anda adalah RahmadRaharjo, agen analisis...") ada di system
    // prompt di AWAL (lihat buildPrompt() di workflow.js), bukan di
    // akhir. Simpan-akhir-saja membuang identitas agen, kemungkinan
    // penyebab jawaban terasa generik/kurang sesuai karakter masing2
    // agen. MIDDLE TRUNCATION: simpan AWAL (identitas+instruksi inti)
    // DAN AKHIR (topik+format output yang diminta), buang bagian TENGAH
    // (biasanya few-shot examples — panjang tapi kurang kritis
    // dibanding identitas & instruksi output).
    const LOCAL_MAX_PROMPT_TOKENS = 150;
    if (ids.length > LOCAL_MAX_PROMPT_TOKENS) {
        const headLen = Math.floor(LOCAL_MAX_PROMPT_TOKENS * 0.4); // ~40% utk identitas/awal
        const tailLen = LOCAL_MAX_PROMPT_TOKENS - headLen - 1; // sisanya utk topik/akhir (−1 utk BOS)
        const head = ids.slice(1, 1 + headLen); // lewati BOS lama, diambil lagi di bawah
        const tail = ids.slice(ids.length - tailLen);
        ids = [model.vocab.bosId].concat(head, tail);
    }
    if (ids.length >= model.config.model.maxContextLength) {
        ids = ids.slice(ids.length - model.config.model.maxContextLength + 1);
    }

    // Panggilan PERTAMA: proses SELURUH prompt sekali, bangun cache awal.
    let result = Inference.forwardCached(ids, model, model.config.model, null, 0);
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
        const nextId = sampleNextToken(maskSpecialTokens(logits, model.vocab), temperature, greedy, {
            topP: topP,
            repetitionPenalty: repetitionPenalty,
            recentTokenIds: generatedIds.slice(-64),
            jsonGrammarState: jsonGrammarState,
            vocab: model.vocab,
            eosId: model.vocab.eosId,
            wordBoundaryPending: jsonWordBoundaryPending
        });
        if (nextId === model.vocab.eosId) {
            stoppedAtEos = true;
            break;
        }
        if (constrainJSON && window.LLMSampler) {
            const advanced = window.LLMSampler.advanceJSONGrammar(jsonGrammarState, nextId, model.vocab, model.vocab.eosId, jsonWordBoundaryPending);
            jsonGrammarState = advanced.state;
            jsonWordBoundaryPending = advanced.wordBoundaryPending;
        }
        generatedIds.push(nextId);
        if ((step + 1) % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        if (step + 1 >= maxNewTokens) {
            break; // token terakhir sudah di-sample, tidak perlu forward lagi
        }
        // Langkah SELANJUTNYA: cuma proses token BARU yang baru di-sample
        // (1 token), pakai & perbarui cache — BUKAN mengulang seluruh
        // sequence dari awal.
        result = Inference.forwardCached([nextId], model, model.config.model, layerCaches, positionOffset);
        layerCaches = result.layerCaches;
        positionOffset += 1;
    }
    const generatedPieces = Vocabulary.decode(generatedIds, model.vocab);
    const text = Tokenizer.detokenize(generatedPieces);
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

window.LLMRuntime = LLMRuntime;

Logger.info('LLMRuntime', 'llm-runtime.js loaded');
