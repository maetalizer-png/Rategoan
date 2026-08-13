import { LLMCore } from './llm-core.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};
function requireCore() {
    return LLMCore;
}
// ============================================================
// isReady() — dipakai workflow.js buat percabangan kondisional
// gerbang apiKey (lihat rencana integrasi di [[kesempatan-llm]])
// ============================================================
function isReady() {
    return LLMCore.isReady();
}
// ============================================================
// GENERATE — kontrak utama, dipanggil dari executeAgent()
// ============================================================
async function generate(promptText, agentName, topic, extraOptions) {
    const Core = requireCore();
    if (!Core.isReady()) {
        throw new Error('[LLMApi] KESEMPATAN LLM belum diinisialisasi — panggil LLMCore.initialize() dulu');
    }
    const agentConfig = (typeof window.getAgentConfig === 'function')
        ? window.getAgentConfig(agentName)
        : {};
    const options = Object.assign({}, extraOptions || {});
    if (typeof agentConfig.temperature === 'number') {
        options.temperature = agentConfig.temperature;
    }
    if (typeof agentConfig.maxTokens === 'number') {
        options.maxNewTokens = agentConfig.maxTokens;
    }
    // FIX PERCEPATAN: agentConfig.maxTokens (mis. 700-1500) di-tuning
    // untuk API eksternal cepat — TIDAK cocok untuk model lokal yang
    // menghasilkan token satu-per-satu jauh lebih lambat (setiap token
    // butuh forward pass penuh lewat semua layer). Dibatasi KHUSUS jalur
    // lokal di sini saja (agentConfig ASLI tidak diubah — fallback ke
    // provider luar via ai-clients.js tetap pakai nilai penuh). Memangkas
    // waktu generate lokal signifikan DAN mengurangi peluang kena timeout
    // 45 detik (LLM_GENERATE_TIMEOUT_MS di workflow.js) sama sekali.
    // FIX PENTING (Juli 2026, dari review eksternal + verifikasi presisi
    // sendiri): 50 token TERLALU KECIL utk skema JSON ~19 field (agent,
    // status, reasoning_summary, score, confidence, insight[], strategy[],
    // risk[], recommendation, +9 skor numerik). Dihitung: JSON minimal
    // yg BENAR-BENAR lengkap butuh ~175 token — jauh di atas 50. Ini
    // kemungkinan penyebab NYATA banyak output gagal parse jadi JSON
    // (bukan cuma soal model kurang latihan seperti dugaan sebelumnya).
    // Dinaikkan ke 220 (175+margin secukupnya utk variasi panjang teks),
    // tetap jauh di bawah nilai asli agentConfig (700-1500) shg durasi
    // tetap terkendali dibanding sebelum ada cap sama sekali.
    const LOCAL_MAX_NEW_TOKENS_CAP = 220;
    if (!options.maxNewTokens || options.maxNewTokens > LOCAL_MAX_NEW_TOKENS_CAP) {
        options.maxNewTokens = LOCAL_MAX_NEW_TOKENS_CAP;
    }
    // FIX KUALITAS: batasi temperature khusus jalur lokal ke rentang 0.3-0.5.
    // agentConfig.temperature (0.1-0.85 tergantung agen) di-tuning utk
    // model eksternal yang sudah matang — suhu tinggi menghasilkan variasi
    // kreatif yang WAJAR di model besar, tapi di model lokal yang masih
    // kecil/kurang terlatih, suhu tinggi memperbesar peluang sampling
    // memilih token langka/kurang terlatih yang decode jadi <unk> — pola
    // persis yang terlihat di laporan user (skor 40 + <unk> berulang utk
    // agen bersuhu tinggi, sementara agen bersuhu rendah hasilnya lebih
    // koheren). Batas bawah 0.3 mencegah suhu terlalu rendah (0.1-0.2)
    // membuat output kaku/berulang. agentConfig ASLI tidak diubah
    // (fallback ke luar tetap pakai nilai asli).
    const LOCAL_MIN_TEMPERATURE = 0.3;
    const LOCAL_MAX_TEMPERATURE = 0.5;
    if (typeof options.temperature !== 'number') {
        options.temperature = 0.4;
    } else if (options.temperature > LOCAL_MAX_TEMPERATURE) {
        options.temperature = LOCAL_MAX_TEMPERATURE;
    } else if (options.temperature < LOCAL_MIN_TEMPERATURE) {
        options.temperature = LOCAL_MIN_TEMPERATURE;
    }
    let finalPrompt = promptText;
    if (window.LLMRetriever && window.LLMContextBuilder) {
        try {
            const model = Core.getModel();
            // Model ~50 juta parameter gampang "tenggelam" kalau context window
            // dipenuhi cuplikan yang kurang relevan — batasi ke Top-2/Top-3 saja
            // (bukan Top-5 seperti sebelumnya) supaya sinyal yang masuk lebih padat.
            const snippets = await window.LLMRetriever.retrieveAll(topic || promptText, { topKPerSource: 2, topKFinal: 3 });
            if (snippets.length > 0) {
                const built = window.LLMContextBuilder.buildContext(topic || 'Analisis peluang', promptText, snippets, model, options);
                finalPrompt = built.prompt;
            }
        } catch (e) {
            Logger.warn('LLMApi', 'Pengayaan konteks (RAG) dilewati: ' + e.message);
        }
    }
    const useRefine = options.useRefine === true || agentConfig.useRefine === true;
    let result;
    if (useRefine && window.LLMReasoning) {
        const model = Core.getModel();
        const chained = await window.LLMReasoning.draftThenRefine(model, finalPrompt, null, options);
        result = chained.refined;
    } else {
        // 🔧 TAHAP 2 (anti-macet): generateText sekarang async — wajib
        // di-await supaya `result` berisi objek {text, tokensGenerated},
        // bukan Promise. Aman ditempel dulu: sebelum llm-runtime.js
        // di-update, generateText mengembalikan nilai sinkron yang
        // tetap benar kalau di-await.
        result = await Core.generateText(finalPrompt, options);
    }
    Logger.info('LLMApi', 'generate() untuk agent "' + agentName + '" — ' + result.tokensGenerated + ' token dihasilkan' + (useRefine ? ' (draft+refine)' : ''));
    return result.text;
}
export const LLMApi = {
    isReady: isReady,
    generate: generate
};

window.LLMApi = LLMApi;

Logger.info('LLMApi', 'llm-api.js loaded');
