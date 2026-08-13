const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// TOKEN SPESIAL
// ============================================================
// ID token spesial DIJAMIN selalu 0-3, berapapun ukuran vocab-nya.
// llm-vocabulary.js WAJIB mematuhi kontrak ini saat membangun tabel token.
const SPECIAL_TOKENS = Object.freeze({
    PAD: '<pad>',
    UNK: '<unk>',
    BOS: '<bos>',
    EOS: '<eos>'
});

const SPECIAL_TOKEN_IDS = Object.freeze({
    PAD: 0,
    UNK: 1,
    BOS: 2,
    EOS: 3
});

// ============================================================
// PRESET ARSITEKTUR
// ============================================================
// "tiny" — preset default sepanjang Tahap 0-10 (sebelum training
// nyata), cukup kecil supaya forward pass tetap cepat di JS murni
// tanpa GPU/WebGPU.
const TINY = Object.freeze({
    name: 'tiny',
    vocabSize: 8000,
    dModel: 128,
    nLayers: 4,
    nHeads: 4,
    dFF: 512,
    maxContextLength: 256,
    dropoutRate: 0.0,
    initStd: 0.02
});

// "small" — target setelah pipeline tokenizer→vocabulary→training
// terbukti benar di preset tiny.
const SMALL = Object.freeze({
    name: 'small',
    vocabSize: 32000,
    dModel: 512,
    nLayers: 8,
    nHeads: 8,
    dFF: 2048,
    maxContextLength: 1024,
    dropoutRate: 0.1,
    initStd: 0.02
});

// "compact" — langkah antara tiny dan small (~7 juta parameter),
// dipakai untuk menguji stabilitas & kualitas di perangkat sebelum
// naik ke kelas 100M+ yang butuh GPU dan korpus jauh lebih besar.
const COMPACT = Object.freeze({
    name: 'compact',
    vocabSize: 4000,
    dModel: 256,
    nLayers: 6,
    nHeads: 8,
    dFF: 1024,
    maxContextLength: 512,
    dropoutRate: 0.05,
    initStd: 0.02
});

// "medium" — ~31 juta parameter DENGAN weight tying + state Adam
// Float32Array (scratchpad, recycling in-place). Titik ini TERVERIFIKASI
// aman lewat pengujian nyata (training 15 kalimat, Adam, heap 1GB) —
// BUKAN dihitung teoritis. Target awal 50 juta (dModel 512/768+, 14-16
// layer) TERBUKTI OOM bahkan dengan optimasi ini — biang keroknya
// alokasi array sementara selama backward pass (belum diimplementasi
// ulang jadi scratchpad/buffer-reuse, itu pekerjaan lanjutan berisiko
// lebih tinggi karena menyentuh kode gradient-checked). Lihat catatan
// lengkap di kesempatan-llm.md.
const MEDIUM = Object.freeze({
    name: 'medium',
    vocabSize: 16000,
    dModel: 384,
    nLayers: 14,
    nHeads: 8,
    dFF: 1536,
    maxContextLength: 512,
    dropoutRate: 0.1,
    initStd: 0.02
});

// "large" — ~49,6 juta parameter, TEMUAN PRESISI Juli 2026: profiling
// memori tahap-per-tahap menunjukkan backward() (BUKAN forward/Adam)
// adalah konsumen memori dominan — menyimpan gradien 14 layer
// sekaligus (perlu utk update simultan) lebih mahal daripada 8 layer
// yang lebih lebar dengan jumlah parameter setara. dModel besar +
// layer sedikit mendekati target 50 juta dengan margin memori lebih
// baik daripada dModel kecil + layer banyak (preset "medium").
// TERVERIFIKASI: training 15 kalimat (Adam) berhasil di heap 1536MB —
// TAPI margin lebih tipis dari "medium" (yang aman bahkan di 512MB),
// jadi TIDAK otomatis jadi default aktif, tersedia untuk dipilih
// kalau device terbukti punya cukup headroom memori.
const LARGE = Object.freeze({
    name: 'large',
    vocabSize: 16000,
    dModel: 640,
    nLayers: 8,
    nHeads: 8,
    dFF: 2560,
    maxContextLength: 512,
    dropoutRate: 0.1,
    initStd: 0.02
});

const PRESETS = Object.freeze({ tiny: TINY, compact: COMPACT, medium: MEDIUM, large: LARGE, small: SMALL });

// ============================================================
// SETTING RUNTIME (eksekusi — terpisah dari arsitektur model)
// ============================================================
const BACKENDS = Object.freeze({
    CPU_JS: 'cpu-js',  // vanilla JS — satu-satunya yang tersedia sekarang
    WEBGPU: 'webgpu'   // reserved untuk migrasi nanti
});

const DEFAULT_RUNTIME = Object.freeze({
    backend: BACKENDS.CPU_JS,
    precision: 'f32',
    seed: 42,
    logLevel: 'warn',
    maxNewTokens: 128,       // batas default token yang digenerate per panggilan
    // Model ~50 juta parameter jauh lebih rentan berhalusinasi/mengulang
    // kalimat dibanding model eksternal besar — suhu & nucleus dibatasi
    // lebih ketat (0.3-0.5 / 0.85-0.9) sebagai default, plus repetition
    // penalty supaya tidak terjebak loop kalimat yang sama.
    temperature: 0.4,
    topP: 0.88,
    repetitionPenalty: 1.15,
    greedy: false            // false = sampling suhu; true = selalu ambil token termungkin
});

function createRuntimeConfig(overrides) {
    overrides = overrides || {};
    const merged = Object.assign({}, DEFAULT_RUNTIME, overrides);
    return Object.freeze(merged);
}

// ============================================================
// VALIDASI
// ============================================================
// Dijalankan sekali tiap createConfig() dipanggil — modul lain
// (llm-attention.js, llm-embedding.js, dst) boleh asumsikan config yang
// mereka terima selalu valid, tanpa validasi ulang.
function validateConfig(config) {
    const errors = [];

    if (!Number.isInteger(config.vocabSize) || config.vocabSize <= 4) {
        errors.push('vocabSize harus integer > 4 (menyisakan ruang 4 token spesial)');
    }
    if (!Number.isInteger(config.dModel) || config.dModel <= 0) {
        errors.push('dModel harus integer positif');
    }
    if (!Number.isInteger(config.nHeads) || config.nHeads <= 0) {
        errors.push('nHeads harus integer positif');
    }
    if (Number.isInteger(config.dModel) && Number.isInteger(config.nHeads) &&
        config.nHeads > 0 && config.dModel % config.nHeads !== 0) {
        errors.push('dModel (' + config.dModel + ') harus habis dibagi nHeads (' + config.nHeads + ')');
    }
    if (!Number.isInteger(config.nLayers) || config.nLayers <= 0) {
        errors.push('nLayers harus integer positif');
    }
    if (!Number.isInteger(config.dFF) || config.dFF <= 0) {
        errors.push('dFF harus integer positif');
    }
    if (!Number.isInteger(config.maxContextLength) || config.maxContextLength <= 0) {
        errors.push('maxContextLength harus integer positif');
    }
    if (typeof config.dropoutRate !== 'number' || config.dropoutRate < 0 || config.dropoutRate >= 1) {
        errors.push('dropoutRate harus number di rentang [0, 1)');
    }

    if (errors.length > 0) {
        throw new Error('[LLMConfig] Config tidak valid:\n- ' + errors.join('\n- '));
    }
    return true;
}

function deepFreeze(obj) {
    Object.getOwnPropertyNames(obj).forEach(function (key) {
        const value = obj[key];
        if (value && typeof value === 'object' && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });
    return Object.freeze(obj);
}

// ============================================================
// PUBLIC API
// ============================================================
function createConfig(options) {
    options = options || {};
    const presetName = options.preset || 'tiny';
    const preset = PRESETS[presetName];
    if (!preset) {
        throw new Error('[LLMConfig] Preset "' + presetName + '" tidak dikenal. Tersedia: ' + Object.keys(PRESETS).join(', '));
    }

    const model = Object.assign({}, preset, options.modelOverrides || {});
    validateConfig(model);

    const runtime = createRuntimeConfig(options.runtimeOverrides || {});

    return deepFreeze({
        model: model,
        runtime: runtime,
        specialTokens: SPECIAL_TOKENS,
        specialTokenIds: SPECIAL_TOKEN_IDS
    });
}

export const LLMConfig = {
    createConfig: createConfig,
    PRESETS: PRESETS,
    SPECIAL_TOKENS: SPECIAL_TOKENS,
    SPECIAL_TOKEN_IDS: SPECIAL_TOKEN_IDS
};

window.LLMConfig = LLMConfig;

Logger.info('LLMConfig', 'llm-config.js loaded');
