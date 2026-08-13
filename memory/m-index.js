import { Utils } from '../js/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const Logger = Utils.Logger;

let attempts = 0;
const MAX_ATTEMPTS = 100;

// ============================================================
// WAIT FOR CORE
// ============================================================
function waitForCore() {
    attempts++;

    if (window._memoryClass) {
        Logger.info('MemoryAPI', 'Core detected, initializing API');
        initAPI();
        return;
    }

    if (attempts >= MAX_ATTEMPTS) {
        Logger.error('MemoryAPI', 'Core not found after ' + MAX_ATTEMPTS + ' attempts');
        createFallbackAPI();
        return;
    }

    setTimeout(waitForCore, 50);
}

// ============================================================
// INIT API
// ============================================================
async function initAPI() {
    try {
        const CoreClass = window._memoryClass;
        const core = new CoreClass();

        if (core._readyPromise) {
            await core._readyPromise;
        }

        window._memoryCore = core;

        const api = {
            save: function (text, metadata, image, audio) {
                return core.save(text, metadata, image, audio);
            },
            search: function (query, options) {
                return core.search(query, options);
            },
            get: function (id) {
                return core.get(id);
            },
            delete: function (id) {
                return core.delete(id);
            },
            prune: function () {
                return core.prune();
            },
            clear: function () {
                return core.clear();
            },
            optimize: function () {
                return core.optimize();
            },
            getStats: function () {
                return core.getStats();
            },
            exportJSON: function () {
                return core.exportJSON();
            },
            importJSON: function (json, merge) {
                return core.importJSON(json, merge);
            },
            getAnalytics: function () {
                return core.getAnalytics();
            },
            getFederatedWeights: function () {
                return core.getFederatedWeights();
            },
            syncFederated: function () {
                return core.syncFederated();
            },
            batchSave: function (items) {
                return core.batchSave(items);
            },
            _core: core,
            getCount: function () {
                return core.vectors ? core.vectors.length : 0;
            },
            smartPrune: function () {
                return core.prune();
            },
            _onReady: function () {
                Logger.info('MemoryAPI', 'Memory API is ready');
            }
        };

        // window.VectorMemory/VectorMemoryV5/MemoryAPI are kept as real
        // globals (not KESEMPATAN-only): 18+ files across Podcast, Rap
        // Battle, Debate, Chat AI, Chat Agent, Forum, Tournament, Workflow,
        // Memory Manager and the LLM retriever read (and rap-battle.js also
        // writes) them directly. KESEMPATAN.VectorMemory is the same object,
        // added as the namespaced access point for new code.
        window.VectorMemory = api;
        window.MemoryAPI = api;
        // COMPAT ALIAS — hapus setelah grep seluruh proyek (pages/agent/
        // inline) memastikan tidak ada lagi yang memanggil VectorMemoryV5.
        window.VectorMemoryV5 = api;
        KESEMPATAN.VectorMemory = api;
        KESEMPATAN.MemoryAPI = api;

        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('memory-api-ready'));
        }

        Logger.info('MemoryAPI', 'Memory API ready');

        if (api._onReady) {
            api._onReady();
        }
    } catch (error) {
        Logger.error('MemoryAPI', 'Failed to init API: ' + error.message);
        createFallbackAPI();
    }
}

// ============================================================
// FALLBACK API
// ============================================================
function createFallbackAPI() {
    Logger.warn('MemoryAPI', 'Creating fallback API');

    const fallback = {
        save: function (text) {
            Logger.warn('MemoryAPI', 'Fallback save: ' + String(text || '').slice(0, 50));
            return Promise.resolve({
                id: 'fallback_' + Date.now(),
                text: String(text || '')
            });
        },
        search: function (query) {
            Logger.warn('MemoryAPI', 'Fallback search: ' + String(query || ''));
            return Promise.resolve([]);
        },
        get: function (id) {
            Logger.warn('MemoryAPI', 'Fallback get: ' + String(id || ''));
            return Promise.resolve(null);
        },
        delete: function (id) {
            Logger.warn('MemoryAPI', 'Fallback delete: ' + String(id || ''));
            return Promise.resolve(false);
        },
        prune: function () {
            Logger.warn('MemoryAPI', 'Fallback prune');
            return Promise.resolve();
        },
        clear: function () {
            Logger.warn('MemoryAPI', 'Fallback clear');
            return Promise.resolve();
        },
        optimize: function () {
            Logger.warn('MemoryAPI', 'Fallback optimize');
            return Promise.resolve();
        },
        getStats: function () {
            return Promise.resolve({
                total: 0,
                status: 'fallback',
                message: 'Memory API fallback mode'
            });
        },
        exportJSON: function () {
            return Promise.resolve(JSON.stringify({
                fallback: true
            }));
        },
        importJSON: function () {
            Logger.warn('MemoryAPI', 'Fallback import');
            return Promise.resolve(false);
        },
        getAnalytics: function () {
            return {
                fallback: true
            };
        },
        getCount: function () {
            return 0;
        },
        smartPrune: function () {
            return Promise.resolve();
        },
        _core: null,
        _fallback: true
    };

    window.VectorMemory = fallback;
    window.MemoryAPI = fallback;
    window.VectorMemoryV5 = fallback; // COMPAT ALIAS
    KESEMPATAN.VectorMemory = fallback;
    KESEMPATAN.MemoryAPI = fallback;

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('memory-api-ready', { detail: { fallback: true } }));
    }

    Logger.warn('MemoryAPI', 'Fallback API ready');
}

// ============================================================
// START
// ============================================================
Logger.info('MemoryAPI', 'Waiting for core');

waitForCore();
