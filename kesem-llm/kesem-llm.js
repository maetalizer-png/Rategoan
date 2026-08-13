// KESEMPATAN LLM entry point (Web Worker bridge) — window.KesempatanLLM
// here is a MESSAGE BRIDGE to the module worker running llm-index.js
// (see llm-worker.js), with the exact same API shape (isReady/
// initialize/generate/core.save/core.load/core.train) callers already
// expect.
//
// localStorage does not exist inside the Worker, so checkpoint storage
// is split: the worker only builds/restores the checkpoint OBJECT
// (pure computation), this main-thread file reads/writes localStorage.

const Logger = window.Utils?.Logger || {
    info: function() { /* silent — pakai window.Utils.Logger kalau tersedia */ },
    warn: function() { /* silent */ },
    error: function(mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

// ============================================================
// 1. BUAT WORKER + JEMBATAN PESAN (request/response berbasis id)
// ============================================================
let worker = null;
let nextId = 1;
const pending = new Map();
let modelReady = false;

// ============================================================
// LIFECYCLE — bebaskan RAM/Wasm Worker kalau tidak dipakai cukup
// lama, supaya ~50 juta parameter model tidak terus menempati
// memori padahal user sedang di halaman lain. Worker dibuat ulang
// LAZY (ensureWorker()) di panggilan berikutnya kalau dibutuhkan
// lagi — modelReady jadi false, jadi ensureKesempatanLLMReady() di
// workflow-llm-bridge.js otomatis memulihkan dari checkpoint.
// ============================================================
let lastActivityAt = Date.now();
const IDLE_DESTROY_MS = 10 * 60 * 1000;
let idleWatcherInterval = null;

function touchActivity() {
    lastActivityAt = Date.now();
}

function destroy() {
    if (worker) {
        worker.terminate();
        worker = null;
    }
    pending.forEach(function (entry) {
        entry.reject(new Error('[KesempatanLLM] Worker dihentikan (destroy/idle cleanup)'));
    });
    pending.clear();
    modelReady = false;
    Logger.info('KesemLLMEntry', 'Worker dihentikan, RAM/Wasm dibebaskan — akan dibuat ulang otomatis di panggilan berikutnya');
}

function ensureIdleWatcher() {
    if (idleWatcherInterval) {
        return;
    }
    idleWatcherInterval = setInterval(function () {
        if (worker && pending.size === 0 && (Date.now() - lastActivityAt) > IDLE_DESTROY_MS) {
            destroy();
        }
    }, 60000);
}

function ensureWorker() {
    if (worker) {
        return worker;
    }
    worker = new Worker('kesem-llm/llm-worker.js', { type: 'module' });
    ensureIdleWatcher();
    worker.onmessage = function(e) {
        if (e.data && e.data.type === 'progress') {
            Logger.info('KesemLLMEntry', '✅ KESEMPATAN LLM worker modules loaded');
            return;
        }
        const id = e.data.id;
        const entry = pending.get(id);
        if (!entry) {
            return; // pesan tanpa pending request (tidak seharusnya terjadi)
        }
        pending.delete(id);
        if (e.data.success) {
            entry.resolve(e.data.result);
        } else {
            entry.reject(new Error(e.data.error || 'Worker error tanpa pesan'));
        }
    };
    worker.onerror = function(err) {
        Logger.error('KesemLLMEntry', 'Worker error: ' + (err && err.message ? err.message : String(err)));
        pending.forEach(function(entry) {
            entry.reject(new Error('Worker crash: ' + (err && err.message ? err.message : String(err))));
        });
        pending.clear();
    };
    return worker;
}

function callWorker(type, payload) {
    touchActivity();
    return new Promise(function(resolve, reject) {
        const id = nextId++;
        pending.set(id, { resolve: resolve, reject: reject });
        ensureWorker().postMessage({ id: id, type: type, payload: payload || {} });
    });
}

// ============================================================
// 2. PENYIMPANAN CHECKPOINT (localStorage cuma ada di thread ini)
// ============================================================
// MIGRASI KE INDEXEDDB (Juli 2026) — root cause SEBENARNYA kenapa
// model tidak pernah mengingat training antar sesi: localStorage
// cuma ~5-10MB, checkpoint model besar puluhan MB — SELALU
// QuotaExceededError, diam-diam gagal. IndexedDB kuotanya jauh
// lebih besar. Sama seperti llm-checkpoint.js, tapi file INI yang
// benar-benar dipanggil workflow.js lewat window.KesempatanLLM.
const IDB_NAME = 'kesempatan_llm_checkpoints';
const IDB_VERSION = 1;
const IDB_STORE = 'checkpoints';

function openCheckpointDB() {
    return new Promise(function (resolve, reject) {
        const request = indexedDB.open(IDB_NAME, IDB_VERSION);
        request.onupgradeneeded = function () {
            const db = request.result;
            if (!db.objectStoreNames.contains(IDB_STORE)) {
                db.createObjectStore(IDB_STORE, { keyPath: 'name' });
            }
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { reject(request.error || new Error('Gagal membuka IndexedDB')); };
    });
}

async function saveCheckpointObjectToStorage(checkpointObj, name) {
    try {
        const db = await openCheckpointDB();
        await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readwrite');
            tx.objectStore(IDB_STORE).put({ name: name, checkpoint: checkpointObj, savedAt: Date.now() });
            tx.oncomplete = function () { resolve(); };
            tx.onerror = function () { reject(tx.error || new Error('Gagal menulis checkpoint')); };
        });
        db.close();
        return { success: true, key: name, sizeBytes: JSON.stringify(checkpointObj).length };
    } catch (e) {
        return { success: false, error: e.message || String(e) };
    }
}

async function loadCheckpointObjectFromStorage(name) {
    try {
        const db = await openCheckpointDB();
        const result = await new Promise(function (resolve, reject) {
            const tx = db.transaction(IDB_STORE, 'readonly');
            const req = tx.objectStore(IDB_STORE).get(name);
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error || new Error('Gagal membaca checkpoint')); };
        });
        db.close();
        return result ? result.checkpoint : null;
    } catch (e) {
        return null;
    }
}

// ============================================================
// 3. window.KesempatanLLM — BENTUK API PERSIS SAMA SEPERTI SEBELUM
//    MIGRASI WORKER, supaya workflow.js/api.js tidak perlu berubah
// ============================================================
async function initialize(options) {
    options = options || {};

    if (options.fromCheckpoint) {
        const saved = await loadCheckpointObjectFromStorage(options.fromCheckpoint);
        if (!saved) {
            throw new Error('[KesempatanLLM] Checkpoint "' + options.fromCheckpoint + '" tidak ditemukan');
        }
        const result = await callWorker('restoreFromCheckpoint', { checkpoint: saved });
        modelReady = true;
        Logger.info('KesempatanLLM', 'Dipulihkan dari checkpoint "' + options.fromCheckpoint + '" (vocab: ' + result.vocabSize + ')');
        return result;
    }

    if (!options.corpus) {
        throw new Error('[KesempatanLLM] initialize butuh options.corpus (kalau tidak ada fromCheckpoint)');
    }

    const result = await callWorker('initialize', {
        corpus: options.corpus,
        configOptions: options.configOptions,
        skipAutoTrain: options.skipAutoTrain,
        autoTrainMaxSequences: options.autoTrainMaxSequences,
        autoTrainEpochs: options.autoTrainEpochs,
        autoTrainLearningRate: options.autoTrainLearningRate,
        yieldEvery: options.yieldEvery
    });
    modelReady = true;
    return result;
}

function isReady() {
    return modelReady;
}

function generate(prompt, agentName, topic, extraOptions) {
    const promise = callWorker('generate', { prompt: prompt, agentName: agentName, topic: topic, extraOptions: extraOptions });
    // Id dipakai callWorker() SEBELUM promise ini dibuat (nextId sudah
    // bertambah di dalamnya) — ambil dari nextId-1 supaya pemanggil
    // bisa targetkan stop() ke request YANG BENAR, bukan "yang sedang
    // aktif" (root cause bug: 1 agen di mode paralel bisa tersasar
    // sinyal stop milik agen lain).
    promise.requestId = nextId - 1;
    return promise;
}

function stop(targetId) {
    if (worker) {
        worker.postMessage({ id: 0, type: 'stop', payload: { targetId: targetId } });
    }
}

async function coreSave(name, metadata) {
    const checkpointObj = await callWorker('buildCheckpoint', { metadata: metadata });
    return saveCheckpointObjectToStorage(checkpointObj, name);
}

async function coreLoad(name) {
    const saved = await loadCheckpointObjectFromStorage(name);
    if (!saved) {
        throw new Error('[KesempatanLLM] Checkpoint "' + name + '" tidak ditemukan');
    }
    const result = await callWorker('restoreFromCheckpoint', { checkpoint: saved });
    modelReady = true;
    return result;
}

function coreTrain(corpus, options) {
    return callWorker('train', { corpus: corpus, options: options });
}

function coreGetStats() {
    return callWorker('getStats');
}

export const KesempatanLLM = {
    isReady: isReady,
    initialize: initialize,
    generate: generate,
    stop: stop,
    destroy: destroy,
    core: {
        save: coreSave,
        load: coreLoad,
        train: coreTrain,
        getStats: coreGetStats
    }
};

window.KesempatanLLM = KesempatanLLM;

// ============================================================
// 4. SIAP — Worker dibuat LAZY (baru benar-benar start di panggilan
//    pertama lewat ensureWorker()), jadi event ini bisa langsung
//    dipancarkan tanpa menunggu apa pun.
// ============================================================
Logger.info('KesemLLMEntry', '✅ KESEMPATAN LLM siap (mode Web Worker — UI tidak akan pernah beku karenanya)');
if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('kesem-llm-ready'));
}
if (window._onKesemLLMReady && typeof window._onKesemLLMReady === 'function') {
    window._onKesemLLMReady();
}
