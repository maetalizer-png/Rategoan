const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

const END_OF_WORD = '</w>';

// Dipakai detokenize() di bawah, dan (di-export) oleh llm-sampler.js untuk
// mensimulasikan persis kapan detokenize() akan menyisipkan spasi antar-kata
// saat constrained JSON decoding menilai kandidat token — literal/angka JSON
// TIDAK tahan spasi di tengahnya, beda dengan isi string yang tahan spasi
// di mana pun.
const NO_SPACE_BEFORE = new Set(['.', ',', '!', '?', ':', ';', ')', ']', '}', "'", '"']);

// ============================================================
// PRE-TOKENISASI
// ============================================================
// Pecah teks jadi "kata" (runtun huruf/angka/underscore) dan
// tanda baca individual sebagai unit terpisah. Whitespace sendiri
// dibuang (batas kata sudah cukup direpresentasikan lewat END_OF_WORD).
function preTokenize(text) {
    const matches = text.match(/[\p{L}\p{N}_]+|[^\s\p{L}\p{N}_]/gu);
    return matches || [];
}

// Representasikan satu "kata" sebagai array karakter + penanda akhir kata.
function wordToSymbols(word) {
    return word.split('').concat([END_OF_WORD]);
}

// ============================================================
// TRAIN BPE
// ============================================================
// Pelatihan BPE standar: iteratif cari pasangan simbol bersebelahan
// yang paling sering muncul (di seluruh korpus, dibobot frekuensi
// kata), gabungkan jadi 1 simbol baru, catat aturan merge-nya.
// Berhenti setelah `numMerges` aturan terbentuk ATAU tidak ada lagi
// pasangan yang bisa digabung.
// 🔧 FIX (root cause "layar macet" saat KESEMPATAN LLM jalan): loop
// di bawah bisa mencapai ribuan iterasi (numMerges = vocabSize-4-256,
// mis. 2740 untuk vocabSize 3000), dan SETIAP iterasi melakukan 2x
// pemindaian penuh seluruh wordFreq (hitung pasangan + terapkan
// merge). Sebelumnya ini 100% sinkron tanpa jeda — JS single-thread
// browser terkunci total (tidak bisa render/respon apa pun) selama
// seluruh proses berjalan, baru "hidup lagi" setelah selesai. Sekarang
// trainBPE jadi async dan menyerahkan kontrol ke event loop setiap
// `yieldEvery` iterasi (default 20) lewat setTimeout(0) — pekerjaan
// totalnya sama persis, cuma dipecah jadi potongan kecil yang tidak
// mengunci render/input, jauh lebih terasa responsif walau total
// waktu keseluruhan sedikit lebih lama karena overhead yield.
async function trainBPE(corpusTexts, numMerges, options) {
    options = options || {};
    const yieldEvery = Number.isInteger(options.yieldEvery) && options.yieldEvery > 0 ? options.yieldEvery : 20;
    if (!Array.isArray(corpusTexts) || corpusTexts.length === 0) {
        throw new Error('[LLMTokenizer] trainBPE butuh array teks korpus yang tidak kosong');
    }
    numMerges = Number.isInteger(numMerges) && numMerges > 0 ? numMerges : 1000;

    // wordFreq: Map<string kata, {symbols: string[], freq: number}>
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
        // Hitung frekuensi tiap pasangan simbol bersebelahan.
        const pairCounts = new Map();
        wordFreq.forEach(function (entry) {
            const symbols = entry.symbols;
            for (let i = 0; i < symbols.length - 1; i++) {
                const pairKey = symbols[i] + '\u0001' + symbols[i + 1];
                pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + entry.freq);
            }
        });

        if (pairCounts.size === 0) {
            break; // tidak ada lagi yang bisa digabung
        }

        // Cari pasangan dengan frekuensi tertinggi (tie-break: urutan pertama ditemukan).
        let bestPairKey = null;
        let bestCount = -1;
        pairCounts.forEach(function (count, pairKey) {
            if (count > bestCount) {
                bestCount = count;
                bestPairKey = pairKey;
            }
        });

        if (bestCount < 2) {
            break; // pasangan cuma muncul 1x, tidak layak jadi aturan merge
        }

        const parts = bestPairKey.split('\u0001');
        const left = parts[0];
        const right = parts[1];
        const merged = left + right;

        merges.push([left, right]);
        vocabSet.add(merged);

        // Terapkan merge ini ke semua kata yang mengandung pasangan tsb.
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
        // 🆕 Progres terlihat untuk proses panjang — supaya kalau
        // numMerges/korpus masih besar, "Log Eksekusi" menunjukkan
        // tanda hidup tiap 200 merge, bukan diam total dari awal
        // sampai selesai (mudah disalahartikan sebagai macet).
        if (step > 0 && step % 200 === 0) {
            Logger.info('LLMTokenizer', 'Training BPE... merge ' + step + '/' + numMerges);
        }
    }

    return {
        merges: merges,
        vocab: Array.from(vocabSet).sort()
    };
}

// ============================================================
// APPLY BPE (encode teks baru pakai aturan merge yang sudah dilatih)
// ============================================================
function applyBPEToWord(word, merges) {
    let symbols = wordToSymbols(word);
    if (symbols.length === 1) {
        return symbols;
    }

    // Terapkan tiap aturan merge SESUAI URUTAN dipelajari (urutan
    // menentukan hasil akhir — merge yang dipelajari lebih dulu
    // dianggap "lebih mendasar").
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

// Gabungkan kembali array piece jadi teks. END_OF_WORD menandai
// batas kata — dibuang lalu diganti 1 spasi (kecuali sebelum tanda
// baca umum yang biasanya nempel tanpa spasi).
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

window.LLMTokenizer = LLMTokenizer;

Logger.info('LLMTokenizer', 'llm-tokenizer.js loaded');
