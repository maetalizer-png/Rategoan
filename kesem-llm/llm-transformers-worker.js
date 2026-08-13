// Core Engine v2 (module Worker) — menjalankan model bahasa pretrained
// SUNGGUHAN (bukan transformer buatan sendiri seperti kesem-llm/) lewat
// @huggingface/transformers (ONNX Runtime Web) — WebGPU sebagai backend
// eksekusi utama, otomatis fallback ke WASM/CPU kalau perangkat/browser
// tidak mendukung WebGPU atau pembuatan pipeline WebGPU gagal. Berjalan
// di Worker terpisah (module Worker, karena butuh `import`/`import()`)
// supaya unduhan + inferensi model besar tidak pernah membekukan UI thread.
//
// MODEL: 2 pilihan pretrained, dipilih pengguna lewat halaman Pengaturan
// (settings.js) dan disimpan di localStorage — lihat MODEL_REGISTRY di
// bawah. Default SmolLM2-135M-Instruct (jauh lebih kecil dari Qwen2.5-0.5B)
// dipakai kalau pengguna belum pernah memilih, karena model lebih kecil
// berarti kompatibilitas lintas-perangkat lebih luas (menghindari risiko
// memori overflow/perangkat overheat).
//
// CACHING: file model (bisa puluhan-ratusan MB) disimpan di IndexedDB
// lewat custom cache transformers.js (env.useCustomCache), BUKAN cache
// HTTP browser bawaan, konsisten dengan pola IndexedDB yang sudah dipakai
// di seluruh KESEMPATAN OS (lihat kesem-llm.js, kes-database.js). Kunci
// cache adalah URL berkas itu sendiri (termasuk nama repo model), jadi
// otomatis terpisah per model tanpa perlu penanganan khusus.

// MODEL_REGISTRY: tiap entri = daftar kandidat repo Hugging Face dicoba
// berurutan (kalau kandidat pertama tidak ditemukan/berpindah nama,
// otomatis coba kandidat berikutnya — tidak pernah gagal total cuma
// karena 1 nama repo salah). DEFAULT_MODEL_KEY dipakai kalau worker
// diinisialisasi tanpa modelKey eksplisit.
const MODEL_REGISTRY = {
    'smollm2-135m': {
        candidates: ['HuggingFaceTB/SmolLM2-135M-Instruct', 'onnx-community/SmolLM2-135M-Instruct-ONNX']
    },
    'qwen2.5-0.5b': {
        candidates: ['Qwen/Qwen2.5-0.5B-Instruct', 'onnx-community/Qwen2.5-0.5B-Instruct']
    }
};
const DEFAULT_MODEL_KEY = 'smollm2-135m';

// jsdelivr `+esm` membundel paket npm (ESM-first, tanpa build UMD resmi
// untuk v3) jadi modul ES siap-pakai lewat import() langsung di browser —
// tanpa perlu npm/bundler, konsisten dengan arsitektur "no build step"
// KESEMPATAN OS. unpkg jadi cadangan kalau jsdelivr sedang bermasalah.
const CDN_CANDIDATES = [
    'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/+esm',
    'https://unpkg.com/@huggingface/transformers@3?module'
];

const CACHE_DB_NAME = 'kesempatan_llm2_model_cache';
const CACHE_DB_VERSION = 1;
const CACHE_STORE = 'files';

function openCacheDB() {
    return new Promise(function (resolve, reject) {
        const req = indexedDB.open(CACHE_DB_NAME, CACHE_DB_VERSION);
        req.onupgradeneeded = function () {
            const db = req.result;
            if (!db.objectStoreNames.contains(CACHE_STORE)) {
                db.createObjectStore(CACHE_STORE);
            }
        };
        req.onsuccess = function () { resolve(req.result); };
        req.onerror = function () { reject(req.error || new Error('Gagal membuka IndexedDB cache model')); };
    });
}

// Implementasi minimal kontrak Cache Web API (match/put) yang dibutuhkan
// transformers.js env.customCache — disimpan di IndexedDB, bukan Cache
// Storage API bawaan browser, sesuai permintaan eksplisit. Best-effort:
// kegagalan baca/tulis cache TIDAK PERNAH menggagalkan pemuatan model,
// cuma berarti file itu diunduh ulang.
const idbModelCache = {
    match: async function (request) {
        const url = typeof request === 'string' ? request : request.url;
        try {
            const db = await openCacheDB();
            const record = await new Promise(function (resolve, reject) {
                const tx = db.transaction(CACHE_STORE, 'readonly');
                const req = tx.objectStore(CACHE_STORE).get(url);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
            db.close();
            if (!record) return undefined;
            return new Response(record.body, { headers: record.headers, status: 200 });
        } catch (e) {
            return undefined; // cache miss aman -> transformers.js fetch ulang dari jaringan
        }
    },
    put: async function (request, response) {
        const url = typeof request === 'string' ? request : request.url;
        try {
            const cloned = response.clone();
            const buf = await cloned.arrayBuffer();
            const headers = {};
            cloned.headers.forEach(function (v, k) { headers[k] = v; });
            const db = await openCacheDB();
            await new Promise(function (resolve, reject) {
                const tx = db.transaction(CACHE_STORE, 'readwrite');
                tx.objectStore(CACHE_STORE).put({ body: buf, headers: headers, savedAt: Date.now() }, url);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
            db.close();
        } catch (e) {
            // Best-effort — file besar/quota penuh dsb tidak boleh menggagalkan load model.
        }
    }
};

let transformersLib = null;
let generatorPipeline = null;
let activeDevice = null;
let activeModelId = null;
let activeModelKey = null;
let activeDtype = null;

async function loadTransformersLib() {
    if (transformersLib) return transformersLib;
    let lastErr = null;
    for (let i = 0; i < CDN_CANDIDATES.length; i++) {
        try {
            transformersLib = await import(/* webpackIgnore: true */ CDN_CANDIDATES[i]);
            return transformersLib;
        } catch (e) {
            lastErr = e;
        }
    }
    throw new Error('[TransformersWorker] Gagal memuat @huggingface/transformers dari semua CDN: ' + (lastErr && lastErr.message));
}

async function detectPreferredDevice() {
    if (typeof navigator !== 'undefined' && navigator.gpu) {
        try {
            const adapter = await navigator.gpu.requestAdapter();
            if (adapter) return 'webgpu';
        } catch (e) {
            // navigator.gpu ada tapi requestAdapter gagal -> WASM
        }
    }
    return 'wasm';
}

function postProgress(payload) {
    self.postMessage(Object.assign({ type: 'progress' }, payload));
}

// Bangun pipeline text-generation, coba device pilihan dulu; kalau
// device itu WebGPU dan pembuatan pipeline-nya gagal (adapter ada tapi
// model/browser combo tidak kompatibel — kasus nyata yang cukup umum),
// otomatis mundur ke WASM sebagai percobaan kedua sebelum benar2 menyerah.
// Mencoba tiap kandidat repo untuk modelKey terpilih sampai satu berhasil.
async function buildPipeline(preferredDevice, modelKey) {
    const { pipeline, env } = await loadTransformersLib();

    env.useCustomCache = true;
    env.customCache = idbModelCache;
    env.allowRemoteModels = true;

    const devicesToTry = preferredDevice === 'webgpu' ? ['webgpu', 'wasm'] : ['wasm'];
    const entry = MODEL_REGISTRY[modelKey] || MODEL_REGISTRY[DEFAULT_MODEL_KEY];

    let lastErr = null;
    for (const modelId of entry.candidates) {
        for (const device of devicesToTry) {
            const dtype = device === 'webgpu' ? 'q4' : 'q8';
            try {
                const pipe = await pipeline('text-generation', modelId, {
                    device: device,
                    dtype: dtype,
                    progress_callback: function (p) {
                        postProgress({
                            file: p.file || modelId,
                            status: p.status,
                            loaded: p.loaded || 0,
                            total: p.total || 0,
                            percent: p.total ? Math.round((p.loaded / p.total) * 100) : (p.progress || 0),
                            device: device,
                            modelId: modelId,
                            modelKey: modelKey
                        });
                    }
                });
                activeDevice = device;
                activeModelId = modelId;
                activeModelKey = modelKey;
                activeDtype = dtype;
                return pipe;
            } catch (e) {
                lastErr = e;
            }
        }
    }
    throw new Error('[TransformersWorker] Gagal membuat pipeline untuk semua kombinasi model/device: ' + (lastErr && lastErr.message));
}

async function initializeEngine(modelKey) {
    modelKey = MODEL_REGISTRY[modelKey] ? modelKey : DEFAULT_MODEL_KEY;
    if (generatorPipeline && activeModelKey === modelKey) {
        return { device: activeDevice, modelId: activeModelId, modelKey: activeModelKey, dtype: activeDtype };
    }
    if (generatorPipeline && activeModelKey !== modelKey) {
        // Pengguna ganti pilihan model -- lepas pipeline lama (bebaskan
        // RAM/VRAM) sebelum memuat yang baru, bukan menumpuk keduanya.
        disposeEngine();
    }
    const preferredDevice = await detectPreferredDevice();
    postProgress({ status: 'detecting-device', device: preferredDevice, percent: 0, modelKey: modelKey });
    generatorPipeline = await buildPipeline(preferredDevice, modelKey);
    postProgress({ status: 'ready', device: activeDevice, percent: 100, modelKey: modelKey });
    return { device: activeDevice, modelId: activeModelId, modelKey: activeModelKey, dtype: activeDtype };
}

function isReady() {
    return !!generatorPipeline;
}

// options: { systemPrompt, maxNewTokens, temperature, topP, repetitionPenalty }
async function generateText(userPrompt, options) {
    if (!generatorPipeline) {
        throw new Error('[TransformersWorker] Engine belum diinisialisasi — panggil initialize dulu');
    }
    options = options || {};
    const messages = [];
    if (options.systemPrompt) {
        messages.push({ role: 'system', content: String(options.systemPrompt) });
    }
    messages.push({ role: 'user', content: String(userPrompt) });

    // Parameter inferensi dibatasi sama seperti Core Engine v1 (model kecil
    // rentan halusinasi/pengulangan tanpa batas ketat): temperature 0.3-0.5,
    // top_p 0.85-0.9, repetition_penalty 1.15.
    const genOptions = {
        max_new_tokens: Number.isInteger(options.maxNewTokens) ? Math.min(options.maxNewTokens, 400) : 220,
        temperature: typeof options.temperature === 'number' ? Math.min(0.5, Math.max(0.3, options.temperature)) : 0.4,
        top_p: typeof options.topP === 'number' ? options.topP : 0.88,
        repetition_penalty: typeof options.repetitionPenalty === 'number' ? options.repetitionPenalty : 1.15,
        do_sample: true,
        return_full_text: false
    };

    let output;
    try {
        output = await generatorPipeline(messages, genOptions);
    } catch (e) {
        // Sebagian model/browser combo belum mendukung chat-template array
        // langsung -- coba lagi dengan prompt string polos sebagai cadangan.
        const plainPrompt = (options.systemPrompt ? options.systemPrompt + '\n\n' : '') + userPrompt;
        output = await generatorPipeline(plainPrompt, genOptions);
    }

    const first = Array.isArray(output) ? output[0] : output;
    let text = '';
    if (first) {
        if (typeof first.generated_text === 'string') {
            text = first.generated_text;
        } else if (Array.isArray(first.generated_text)) {
            const last = first.generated_text[first.generated_text.length - 1];
            text = (last && last.content) || '';
        }
    }
    return { text: text, device: activeDevice, modelId: activeModelId };
}

function disposeEngine() {
    if (generatorPipeline && generatorPipeline.dispose) {
        try { generatorPipeline.dispose(); } catch (e) { /* best-effort */ }
    }
    generatorPipeline = null;
    activeDevice = null;
    activeModelId = null;
    activeModelKey = null;
    activeDtype = null;
}

self.onmessage = async function (e) {
    const id = e.data.id;
    const type = e.data.type;
    const payload = e.data.payload || {};
    try {
        let result;
        switch (type) {
            case 'initialize':
                result = await initializeEngine(payload.modelKey);
                break;
            case 'isReady':
                result = { ready: isReady(), device: activeDevice, modelId: activeModelId, modelKey: activeModelKey };
                break;
            case 'generate':
                result = await generateText(payload.prompt, payload.options);
                break;
            case 'dispose':
                disposeEngine();
                result = { disposed: true };
                break;
            default:
                throw new Error('[TransformersWorker] Tipe pesan tidak dikenal: ' + type);
        }
        self.postMessage({ id: id, success: true, result: result });
    } catch (err) {
        self.postMessage({ id: id, success: false, error: (err && err.message) ? err.message : String(err) });
    }
};
