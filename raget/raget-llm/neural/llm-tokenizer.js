const END_OF_WORD = '</w>';

const NO_SPACE_BEFORE = new Set(['.', ',', '!', '?', ':', ';', ')', ']', '}', "'", '"']);

function preTokenize(text) {
    const matches = text.match(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu);
    return matches || [];
}

function wordToSymbols(word) {
    return word.split('').concat([END_OF_WORD]);
}

async function trainBPE(corpusTexts, numMerges, options) {
    options = options || {};
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 20;
    if (!Array.isArray(corpusTexts) || corpusTexts.length === 0) {
        throw new Error('[LLMTokenizer] trainBPE butuh array teks korpus yang tidak kosong');
    }
    numMerges = Number.isInteger(numMerges) && numMerges > 0 ? numMerges : 1000;

    
    const wordFreq = new Map();
    corpusTexts.forEach(function (text) {
        preTokenize(String(text)).forEach(function (word) {
            const existing = wordFreq.get(word);
            if (existing) {
                existing.freq += 1;
            } else {
                wordFreq.set(word, { symbols: wordToSymbols(word), freq: 1 });
            }
        });
    });

    const merges = [];
    const vocabSet = new Set();
    wordFreq.forEach(function (entry) {
        entry.symbols.forEach(function (s) { vocabSet.add(s); });
    });

    for (let step = 0; step < numMerges; step++) {
        
        const pairCounts = new Map();
        wordFreq.forEach(function (entry) {
            const symbols = entry.symbols;
            for (let i = 0; i < symbols.length - 1; i++) {
                const pairKey = symbols[i] + '\u0001' + symbols[i + 1];
                pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + entry.freq);
            }
        });

        if (pairCounts.size === 0) {
            break; 
        }

        
        let bestPairKey = null;
        let bestCount = -1;
        pairCounts.forEach(function (count, pairKey) {
            if (count > bestCount) {
                bestCount = count;
                bestPairKey = pairKey;
            }
        });

        if (bestCount < 2) {
            break; 
        }

        const parts = bestPairKey.split('\u0001');
        const left = parts[0];
        const right = parts[1];
        const merged = left + right;

        merges.push([left, right]);
        vocabSet.add(merged);

        
        wordFreq.forEach(function (entry) {
            const symbols = entry.symbols;
            const next = [];
            let i = 0;
            while (i < symbols.length) {
                if (i < symbols.length - 1 && symbols[i] === left && symbols[i + 1] === right) {
                    next.push(merged);
                    i += 2;
                } else {
                    next.push(symbols[i]);
                    i += 1;
                }
            }
            entry.symbols = next;
        });

        if (step > 0 && step % yieldEvery === 0) {
            await new Promise(function (resolve) { setTimeout(resolve, 0); });
        }
        
        
        
        
        if (step > 0 && step % 200 === 0) {
        }
    }

    return {
        merges: merges,
        vocab: Array.from(vocabSet).sort()
    };
}

function applyBPEToWord(word, merges) {
    let symbols = wordToSymbols(word);
    if (symbols.length === 1) {
        return symbols;
    }

    
    
    
    for (let m = 0; m < merges.length; m++) {
        const left = merges[m][0];
        const right = merges[m][1];
        const merged = left + right;
        let changed = true;
        while (changed) {
            changed = false;
            for (let i = 0; i < symbols.length - 1; i++) {
                if (symbols[i] === left && symbols[i + 1] === right) {
                    symbols = symbols.slice(0, i).concat([merged], symbols.slice(i + 2));
                    changed = true;
                    break;
                }
            }
        }
        if (symbols.length === 1) {
            break;
        }
    }
    return symbols;
}

function tokenize(text, merges) {
    if (!Array.isArray(merges)) {
        throw new Error('[LLMTokenizer] tokenize butuh array `merges` hasil trainBPE()');
    }
    const words = preTokenize(String(text));
    let pieces = [];
    words.forEach(function (word) {
        pieces = pieces.concat(applyBPEToWord(word, merges));
    });
    return pieces;
}

function detokenize(pieces) {
    let text = '';
    let word = '';

    pieces.forEach(function (piece) {
        if (piece.endsWith(END_OF_WORD)) {
            word += piece.slice(0, -END_OF_WORD.length);
            if (word.length > 0) {
                if (text.length > 0 && !NO_SPACE_BEFORE.has(word)) {
                    text += ' ';
                }
                text += word;
            }
            word = '';
        } else {
            word += piece;
        }
    });
    if (word.length > 0) {
        if (text.length > 0) {
            text += ' ';
        }
        text += word;
    }
    return text;
}

export const LLMTokenizer = {
    preTokenize: preTokenize,
    trainBPE: trainBPE,
    tokenize: tokenize,
    detokenize: detokenize,
    END_OF_WORD: END_OF_WORD,
    NO_SPACE_BEFORE: NO_SPACE_BEFORE
};
