import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

function requireDeps() {
    return { Tokenizer: LLMTokenizer, Vocabulary: LLMVocabulary };
}

// Hitung panjang token PERSIS pakai tokenizer+vocab model yang aktif
// (bukan estimasi kasar) — supaya budget context window akurat.
function countTokens(text, model) {
    const { Tokenizer, Vocabulary } = requireDeps();
    const pieces = Tokenizer.tokenize(text, model.merges);
    return Vocabulary.encode(pieces, model.vocab).length;
}

// ============================================================
// RAKIT KONTEKS
// ============================================================
// snippets: hasil LLMRetriever.retrieveAll() — array {source, text, score}
// Anggaran token: sisihkan `reserveForGeneration` token buat jawaban,
// sisanya (systemPrompt + query WAJIB masuk dulu, baru snippet
// dipangkas dari yang skornya PALING RENDAH kalau kelebihan).
function buildContext(query, systemPrompt, snippets, model, options) {
    options = options || {};
    const reserveForGeneration = options.reserveForGeneration || model.config.runtime.maxNewTokens;
    const budget = model.config.model.maxContextLength - reserveForGeneration;

    if (budget <= 0) {
        throw new Error('[LLMContextBuilder] maxContextLength terlalu kecil untuk reserveForGeneration yang diminta');
    }

    // 🔧 FIX (integrasi RAG↔LLM lokal — sebelumnya lapisan ini kode
    // mati secara praktis): prompt asli dari workflow.js buildPrompt()
    // (system prompt agen + few-shot + instruksi) HAMPIR SELALU jauh
    // lebih besar dari maxContextLength preset 'tiny' (256 token) yang
    // dipakai KESEMPATAN LLM. Versi lama di sini langsung THROW kalau
    // systemPrompt+query saja sudah melebihi anggaran — di praktiknya
    // ini SELALU terjadi untuk prompt agen nyata, jadi try/catch di
    // llm-api.js SELALU menangkapnya dan diam-diam skip seluruh pengayaan
    // RAG. Sekarang: kalau kelebihan, systemPrompt dipangkas (bukan throw).
    //
    // 🔧 FIX (konsistensi dgn generateCached() di llm-runtime.js): versi
    // SEBELUMNYA di sini memangkas cuma dari DEPAN, sama seperti yang
    // TERBUKTI keliru di generateCached() — identitas agen ("Anda adalah
    // RahmadRaharjo, agen analisis...") selalu ada di system prompt
    // paling AWAL (lihat buildPrompt() di workflow.js), jadi pangkas-dari-
    // depan-saja membuang identitas agen, bikin jawaban terasa generik.
    // Sekarang pangkas dari TENGAH: sisakan ~40% AWAL (identitas +
    // instruksi inti) dan sisanya di AKHIR (topik + format output yang
    // diminta), buang bagian tengah (biasanya few-shot — panjang tapi
    // kurang kritis). Dipangkas ~15% panjang karakter per iterasi.
    let effectiveSystemPrompt = systemPrompt || '';
    let header = effectiveSystemPrompt + '\n\nPertanyaan: ' + query + '\n\nKonteks:\n';
    let usedTokens = countTokens(header, model);

    let guard = 0;
    while (usedTokens > budget && effectiveSystemPrompt.length > 40 && guard < 20) {
        const totalKeep = Math.max(40, Math.floor(effectiveSystemPrompt.length * 0.85));
        const headLen = Math.floor(totalKeep * 0.4);
        const tailLen = totalKeep - headLen;
        const head = effectiveSystemPrompt.slice(0, headLen);
        const tail = tailLen > 0 ? effectiveSystemPrompt.slice(effectiveSystemPrompt.length - tailLen) : '';
        effectiveSystemPrompt = head + tail;
        header = effectiveSystemPrompt + '\n\nPertanyaan: ' + query + '\n\nKonteks:\n';
        usedTokens = countTokens(header, model);
        guard++;
    }

    if (usedTokens > budget) {
        throw new Error(
            '[LLMContextBuilder] Query saja (tanpa systemPrompt) masih ' + usedTokens +
            ' token, melebihi anggaran ' + budget + ' token (maxContextLength=' +
            model.config.model.maxContextLength + ' - reserveForGeneration=' + reserveForGeneration +
            ') — perbesar maxContextLength, perkecil reserveForGeneration, atau perpendek query'
        );
    }

    // Snippet diurutkan skor tertinggi dulu — kalau anggaran habis,
    // yang paling TIDAK relevan (skor rendah) yang dibuang duluan.
    const sorted = snippets.slice().sort(function (a, b) { return (b.score || 0) - (a.score || 0); });
    const includedSnippets = [];

    for (let i = 0; i < sorted.length; i++) {
        const line = '- [' + sorted[i].source + '] ' + sorted[i].text + '\n';
        const lineTokens = countTokens(line, model);
        if (usedTokens + lineTokens > budget) {
            break; // anggaran habis, sisanya (skor lebih rendah) dibuang
        }
        includedSnippets.push(sorted[i]);
        usedTokens += lineTokens;
    }

    const contextText = includedSnippets.map(function (s) { return '- [' + s.source + '] ' + s.text; }).join('\n');
    const finalPrompt = header + (contextText || '(tidak ada konteks tambahan)');

    return {
        prompt: finalPrompt,
        snippetsIncluded: includedSnippets.length,
        snippetsDropped: snippets.length - includedSnippets.length,
        tokensUsed: usedTokens,
        tokenBudget: budget
    };
}

export const LLMContextBuilder = {
    countTokens: countTokens,
    buildContext: buildContext
};

window.LLMContextBuilder = LLMContextBuilder;

Logger.info('LLMContextBuilder', 'llm-context-builder.js loaded');
