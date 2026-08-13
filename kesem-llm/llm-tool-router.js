import { LLMRetriever } from './llm-retriever.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

const registry = new Map(); // name -> { matcher, executor, priority }

// ============================================================
// REGISTRASI TOOL
// ============================================================
// matcher(query) -> boolean (apakah tool ini relevan buat query ini)
// executor(query, options) -> Promise<any> (hasil dari tool ini)
function registerTool(name, matcher, executor, priority) {
    registry.set(name, { matcher: matcher, executor: executor, priority: priority || 0 });
}

function unregisterTool(name) {
    registry.delete(name);
}

// ============================================================
// ROUTE — cari semua tool yang matcher-nya bilang "ya", urut
// berdasar priority (makin tinggi makin didahulukan)
// ============================================================
function route(query) {
    const matched = [];
    registry.forEach(function (tool, name) {
        if (tool.matcher(query)) {
            matched.push({ name: name, priority: tool.priority });
        }
    });
    return matched.sort(function (a, b) { return b.priority - a.priority; }).map(function (m) { return m.name; });
}

async function executeTools(query, toolNames, options) {
    const results = {};
    for (let i = 0; i < toolNames.length; i++) {
        const name = toolNames[i];
        const tool = registry.get(name);
        if (!tool) continue;
        try {
            results[name] = await tool.executor(query, options);
        } catch (e) {
            Logger.warn('LLMToolRouter', 'Tool "' + name + '" gagal: ' + e.message);
            results[name] = null;
        }
    }
    return results;
}

// ============================================================
// SEMANTIC ROUTING — berbasis vector similarity (bukan cuma
// keyword substring). Tiap tool didaftari beberapa CONTOH FRASA
// representatif; di-embed sekali saat registrasi. Saat routing,
// query juga di-embed lalu dibandingkan (cosine) ke semua contoh
// — tool dianggap relevan kalau similarity terbaiknya melewati
// threshold. Jauh lebih tahan terhadap variasi kalimat daripada
// keyword matching murni ('berapa biaya iklan bulan ini' tidak
// mengandung kata 'data'/'riwayat' tapi maksudnya jelas tanya data).
// Bergantung window.MemoryUtils.simpleEmbed + window.calculateSimilarity
// (dari memory module) — keduanya DEPENDENCY OPSIONAL, dicek saat
// dipakai (bukan saat file dimuat), karena kesem-llm/ dan memory/
// dimuat lewat 2 loader independen tanpa jaminan urutan relatif.
// ============================================================
function embedText(text) {
    if (window.MemoryUtils && typeof window.MemoryUtils.simpleEmbed === 'function') {
        return window.MemoryUtils.simpleEmbed(text);
    }
    return null;
}

function registerSemanticTool(name, exemplarPhrases, executor, options) {
    options = options || {};
    const threshold = typeof options.threshold === 'number' ? options.threshold : 0.25;
    const priority = options.priority || 0;
    const fallbackKeywords = Array.isArray(options.fallbackKeywords) ? options.fallbackKeywords : [];

    // Embedding contoh dibangun MALAS (lazy) — baru dihitung saat
    // matcher pertama kali dipanggil, bukan saat registrasi, supaya
    // tidak gagal diam-diam kalau memory module belum sempat termuat
    // di titik registerDefaultTools() dipanggil (saat file ini load).
    let exemplarEmbeddings = null;

    function ensureExemplars() {
        if (exemplarEmbeddings === null) {
            exemplarEmbeddings = exemplarPhrases
                .map(embedText)
                .filter(function (e) { return Array.isArray(e); });
        }
        return exemplarEmbeddings;
    }

    registry.set(name, {
        matcher: function (query) {
            const calcSim = window.calculateSimilarity;
            const exemplars = ensureExemplars();

            if (exemplars.length > 0 && typeof calcSim === 'function') {
                const queryEmb = embedText(query);

                if (queryEmb) {
                    let bestSim = -Infinity;

                    for (const exemplarEmb of exemplars) {
                        const sim = calcSim(queryEmb, exemplarEmb, 'cosine');

                        if (sim > bestSim) {
                            bestSim = sim;
                        }
                    }

                    return bestSim >= threshold;
                }
            }

            // Fallback: infrastruktur embedding belum tersedia —
            // kembali ke keyword matching supaya tool tetap bisa
            // ter-route (lebih baik agak longgar daripada mati total).
            if (fallbackKeywords.length > 0) {
                const lower = query.toLowerCase();
                return fallbackKeywords.some(function (kw) { return lower.includes(kw); });
            }

            return false;
        },
        executor: executor,
        priority: priority
    });
}

// ============================================================
// TOOL BAWAAN — didaftarkan otomatis kalau sumbernya tersedia.
// 'database' & 'worldData' sekarang pakai semantic routing (contoh
// frasa representatif); fallback keyword tetap disertakan.
// ============================================================
function registerDefaultTools() {
    registerTool('vectorMemory',
        function () { return true; }, // fallback selalu relevan, priority rendah
        function (query, options) { return LLMRetriever.retrieveFromVectorMemory(query, (options && options.topK) || 5); },
        1
    );

    registerSemanticTool('database',
        [
            'berapa banyak data yang tersimpan',
            'lihat riwayat transaksi bulan lalu',
            'statistik penjualan minggu ini',
            'jumlah laporan yang sudah dibuat',
            'tampilkan history analisis sebelumnya'
        ],
        function (query, options) { return LLMRetriever.retrieveFromDatabase(query, (options && options.topK) || 5); },
        {
            priority: 2,
            threshold: 0.25,
            fallbackKeywords: ['data', 'riwayat', 'history', 'berapa', 'jumlah', 'statistik', 'laporan']
        }
    );

    registerTool('worldData',
        function () { return window.__STATIC_DATA && window.__STATIC_DATA.length > 0; },
        function (query, options) { return LLMRetriever.retrieveFromWorldData(query, (options && options.topK) || 5); },
        1
    );
}

registerDefaultTools();

export const LLMToolRouter = {
    registerTool: registerTool,
    registerSemanticTool: registerSemanticTool,
    unregisterTool: unregisterTool,
    route: route,
    executeTools: executeTools
};

window.LLMToolRouter = LLMToolRouter;

Logger.info('LLMToolRouter', 'llm-tool-router.js loaded');
