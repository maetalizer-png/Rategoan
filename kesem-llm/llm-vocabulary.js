const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// BANGUN VOCABULARY
// ============================================================
// pieces: array string unik hasil LLMTokenizer.trainBPE(...).vocab
// specialTokenIds: dari LLMConfig.SPECIAL_TOKEN_IDS (PAD=0,UNK=1,BOS=2,EOS=3)
// maxVocabSize: dari config.model.vocabSize — piece kelebihan dipotong
//               (diprioritaskan piece yang datang lebih dulu di array,
//               llm-tokenizer.js sudah urutkan berdasar kemunculan merge).
function buildVocabulary(pieces, specialTokens, specialTokenIds, maxVocabSize) {
    if (!Array.isArray(pieces)) {
        throw new Error('[LLMVocabulary] buildVocabulary butuh array `pieces` dari LLMTokenizer');
    }
    if (!specialTokens || !specialTokenIds) {
        throw new Error('[LLMVocabulary] buildVocabulary butuh specialTokens & specialTokenIds dari LLMConfig');
    }

    const tokenToId = new Map();
    const idToToken = new Map();

    // Token spesial SELALU di ID 0-3, ditanam duluan sebelum apapun.
    const specialOrder = ['PAD', 'UNK', 'BOS', 'EOS'];
    specialOrder.forEach(function (key) {
        const token = specialTokens[key];
        const id = specialTokenIds[key];
        tokenToId.set(token, id);
        idToToken.set(id, token);
    });

    let nextId = specialOrder.length; // mulai dari 4
    const limit = Number.isInteger(maxVocabSize) && maxVocabSize > specialOrder.length
        ? maxVocabSize
        : Infinity;

    for (let i = 0; i < pieces.length && nextId < limit; i++) {
        const piece = pieces[i];
        if (!tokenToId.has(piece)) {
            tokenToId.set(piece, nextId);
            idToToken.set(nextId, piece);
            nextId++;
        }
    }

    return Object.freeze({
        tokenToId: tokenToId,
        idToToken: idToToken,
        size: tokenToId.size,
        unkId: specialTokenIds.UNK,
        padId: specialTokenIds.PAD,
        bosId: specialTokenIds.BOS,
        eosId: specialTokenIds.EOS
    });
}

// ============================================================
// ENCODE / DECODE
// ============================================================
function encode(pieces, vocab) {
    if (!Array.isArray(pieces)) {
        throw new Error('[LLMVocabulary] encode butuh array pieces');
    }
    return pieces.map(function (piece) {
        return vocab.tokenToId.has(piece) ? vocab.tokenToId.get(piece) : vocab.unkId;
    });
}

function decode(ids, vocab) {
    if (!Array.isArray(ids)) {
        throw new Error('[LLMVocabulary] decode butuh array ids');
    }
    const unkToken = vocab.idToToken.get(vocab.unkId);
    return ids.map(function (id) {
        return vocab.idToToken.has(id) ? vocab.idToToken.get(id) : unkToken;
    });
}

// Bungkus urutan token ID dengan BOS di depan & EOS di belakang —
// dipakai llm-inference.js/llm-runtime.js sebelum forward pass.
function wrapWithBosEos(ids, vocab) {
    return [vocab.bosId].concat(ids, [vocab.eosId]);
}

// Potong/tambal urutan token ID supaya panjangnya persis
// `maxLength` — dipakai llm-runtime.js untuk menjaga context window.
function padOrTruncate(ids, maxLength, vocab) {
    if (ids.length >= maxLength) {
        return ids.slice(0, maxLength);
    }
    const padded = ids.slice();
    while (padded.length < maxLength) {
        padded.push(vocab.padId);
    }
    return padded;
}

export const LLMVocabulary = {
    buildVocabulary: buildVocabulary,
    encode: encode,
    decode: decode,
    wrapWithBosEos: wrapWithBosEos,
    padOrTruncate: padOrTruncate
};

window.LLMVocabulary = LLMVocabulary;

Logger.info('LLMVocabulary', 'llm-vocabulary.js loaded');
