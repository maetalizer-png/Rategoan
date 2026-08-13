const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// SKOR RELEVANSI — word-overlap sederhana (BUKAN semantic
// embedding — bobot KESEMPATAN LLM belum dilatih, jadi jujur
// pakai heuristik leksikal dulu daripada pura-pura "semantic
// search" yang sebenarnya belum bisa diandalkan)
// ============================================================
function tokenizeSimple(text) {
    return String(text).toLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
}

function scoreRelevance(query, text) {
    const queryWords = new Set(tokenizeSimple(query));
    if (queryWords.size === 0) return 0;
    const textWords = tokenizeSimple(text);
    let matches = 0;
    const seen = new Set();
    textWords.forEach(function (w) {
        if (queryWords.has(w) && !seen.has(w)) {
            matches++;
            seen.add(w);
        }
    });
    return matches / queryWords.size;
}

function rankAndTrim(candidates, query, topK) {
    return candidates
        .map(function (c) { return Object.assign({}, c, { score: scoreRelevance(query, c.text) }); })
        .filter(function (c) { return c.score > 0; })
        .sort(function (a, b) { return b.score - a.score; })
        .slice(0, topK);
}

// ============================================================
// SUMBER 1: VECTOR MEMORY
// ============================================================
// API dikonfirmasi dari memory/m-core.js + m-index.js (window.VectorMemory):
// search(query, options) dengan options.topK — BUKAN angka mentah.
async function retrieveFromVectorMemory(query, topK) {
    const VM = window.VectorMemory;
    if (!VM || typeof VM.search !== 'function') return [];

    try {
        const results = await VM.search(query, { topK: topK });
        if (!Array.isArray(results)) return [];

        return results.map(function (r) {
            return { source: 'memory', text: typeof r === 'string' ? r : String(r.text || '') };
        });
    } catch (e) {
        Logger.warn('LLMRetriever', 'retrieveFromVectorMemory gagal: ' + e.message);
        return [];
    }
}

// ============================================================
// SUMBER 2: KESDATABASE
// ============================================================
async function retrieveFromDatabase(query, topK) {
    const DB = window.KESDatabase || window.db || window.Database;
    if (!DB) return [];

    try {
        let results = null;
        if (typeof DB.search === 'function') {
            results = await DB.search(query, topK);
        } else if (typeof DB.find === 'function') {
            results = await DB.find(query, topK);
        } else if (typeof DB.query === 'function') {
            results = await DB.query(query, topK);
        }
        if (!Array.isArray(results)) return [];

        return results.map(function (r) {
            const text = typeof r === 'string' ? r : JSON.stringify(r);
            return { source: 'database', text: text };
        });
    } catch (e) {
        Logger.warn('LLMRetriever', 'retrieveFromDatabase gagal: ' + e.message);
        return [];
    }
}

// ============================================================
// SUMBER 3: WORLD.JS __STATIC_DATA (data statis dunia)
// ============================================================
function retrieveFromWorldData(query, topK) {
    const staticData = window.__STATIC_DATA;
    if (!Array.isArray(staticData) || staticData.length === 0) return [];

    const candidates = staticData
        .map(function (item) {
            const text = typeof item === 'string' ? item : JSON.stringify(item);
            return { source: 'world', text: text };
        });

    return rankAndTrim(candidates, query, topK);
}

// ============================================================
// GABUNGAN — panggil semua sumber yang tersedia PARALEL, gabung,
// ranking ulang lintas-sumber, kembalikan topK keseluruhan.
// ============================================================
async function retrieveAll(query, options) {
    options = options || {};
    const topKPerSource = options.topKPerSource || 5;
    const topKFinal = options.topKFinal || 5;

    const [memoryResults, databaseResults] = await Promise.all([
        retrieveFromVectorMemory(query, topKPerSource),
        retrieveFromDatabase(query, topKPerSource)
    ]);
    const worldResults = retrieveFromWorldData(query, topKPerSource);

    const allCandidates = [].concat(memoryResults, databaseResults, worldResults);
    return rankAndTrim(allCandidates, query, topKFinal);
}

export const LLMRetriever = {
    scoreRelevance: scoreRelevance,
    retrieveFromVectorMemory: retrieveFromVectorMemory,
    retrieveFromDatabase: retrieveFromDatabase,
    retrieveFromWorldData: retrieveFromWorldData,
    retrieveAll: retrieveAll
};

window.LLMRetriever = LLMRetriever;

Logger.info('LLMRetriever', 'llm-retriever.js loaded');
