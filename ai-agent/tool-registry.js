/* ============================================================
   ai-agent/tool-registry.js
   Capability registration/lookup for the Orchestrator. Only real,
   already-existing capabilities are registered — nothing here
   reimplements a system, and nothing fakes a system that doesn't
   exist yet (Supabase, WebSocket, Public API are registered as
   explicit NOT_IMPLEMENTED stubs, confirmed via repo audit: no
   real Supabase client, no WebSocket connect/send/subscribe
   anywhere, and the Public API server is a separate Node process
   not reachable from browser code without a deployed URL).
   ============================================================ */

import { MemoryBridge } from './memory-bridge.js';
import { ObservationLoop } from './observation-loop.js';
import { AgentRegistry } from './agent-registry.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const NOT_IMPLEMENTED = Object.freeze({ notImplemented: true });

function notImplementedTool(reason) {
    return {
        available: false,
        reason: reason,
        run: async function() { return NOT_IMPLEMENTED; }
    };
}

const registry = new Map();

function register(name, tool) {
    registry.set(name, tool);
}

async function invoke(name, args) {
    const tool = registry.get(name);
    if (!tool) throw new Error('ToolRegistry: capability "' + name + '" tidak terdaftar');
    if (tool.available === false) return { notImplemented: true, reason: tool.reason };
    return tool.run(args);
}

function has(name) {
    return registry.has(name);
}

function list() {
    return Array.from(registry.entries()).map(function([name, tool]) {
        return { name: name, available: tool.available !== false };
    });
}

// --- memory.* (memory/m-index.js via memory-bridge.js) ---
register('memory.save', {
    run: function(args) { return MemoryBridge.save(args.text, args.metadata); }
});
register('memory.search', {
    run: function(args) { return MemoryBridge.search(args.query, args.options); }
});

// --- observation.* (observ/ via observation-loop.js) ---
register('observation.getSignals', {
    run: function() { return ObservationLoop.getSignals(); }
});
register('observation.refresh', {
    run: function() { return ObservationLoop.refreshSignals(); }
});
register('observation.contextForTopic', {
    run: function(args) { return ObservationLoop.getContextForTopic(args.topic, args.limit); }
});

// --- worker.run (55 KESWORKER via window.AIWorkers) ---
register('worker.run', {
    run: async function(args) {
        const workerEntry = AgentRegistry.getWorker(args.workerId);
        if (!workerEntry) throw new Error('ToolRegistry: KESWORKER "' + args.workerId + '" tidak ditemukan');
        if (!window.AIWorkers || typeof window.AIWorkers.runWorker !== 'function') {
            throw new Error('ToolRegistry: window.AIWorkers belum siap');
        }
        return window.AIWorkers.runWorker(workerEntry.config);
    }
});

// --- socialShare.share (js/social-share.js's real SuperSocialShare.shareToPlatform) ---
register('socialShare.share', {
    run: async function(args) {
        if (!window.SuperSocialShare || typeof window.SuperSocialShare.shareToPlatform !== 'function') {
            throw new Error('ToolRegistry: SuperSocialShare belum siap');
        }
        return window.SuperSocialShare.shareToPlatform(args.platformId, args.report);
    }
});

// --- editor.* (js/ai-editor-ultimate.js — UI panel renderers only, no
//     programmatic content-edit API exists to wrap) ---
register('editor.renderEditFoto', {
    run: function() {
        if (KESEMPATAN.AIEditor && typeof KESEMPATAN.AIEditor.renderEditFoto === 'function') {
            KESEMPATAN.AIEditor.renderEditFoto();
            return { rendered: true };
        }
        return { rendered: false };
    }
});
register('editor.renderEditVideo', {
    run: function() {
        if (KESEMPATAN.AIEditor && typeof KESEMPATAN.AIEditor.renderEditVideo === 'function') {
            KESEMPATAN.AIEditor.renderEditVideo();
            return { rendered: true };
        }
        return { rendered: false };
    }
});

// --- crypto.* (js/live-crypto.js's real LiveCrypto) ---
register('crypto.getPrices', {
    run: async function() {
        if (!window.LiveCrypto || typeof window.LiveCrypto.fetchCryptoPrices !== 'function') {
            throw new Error('ToolRegistry: window.LiveCrypto belum siap');
        }
        return window.LiveCrypto.fetchCryptoPrices();
    }
});
register('crypto.marketSummary', {
    run: function() {
        if (!window.LiveCrypto || typeof window.LiveCrypto.marketSummary !== 'function') {
            throw new Error('ToolRegistry: window.LiveCrypto belum siap');
        }
        return window.LiveCrypto.marketSummary();
    }
});

// --- news.fetch (js/news-aggregator.js's real NewsAggregator instance —
//     fetchNews/fetchLokalNews, BUKAN getNews: getNews dipanggil secara
//     guarded di noise/noise-core.js tapi tidak pernah didefinisikan di
//     manapun, jadi itu no-op laten yang sudah ada sebelum AI Agent ini
//     dibangun; adapter ini sengaja memanggil method yang benar-benar ada) ---
register('news.fetch', {
    run: async function(args) {
        if (!window.NewsAggregator || typeof window.NewsAggregator.fetchNews !== 'function') {
            throw new Error('ToolRegistry: window.NewsAggregator belum siap');
        }
        return window.NewsAggregator.fetchNews((args && args.category) || 'teknologi');
    }
});

// --- podcast.generateScript (podcast/podcast-main.js's real PodcastGenerator) ---
register('podcast.generateScript', {
    run: function(args) {
        if (!KESEMPATAN.PodcastGenerator || typeof KESEMPATAN.PodcastGenerator.generate !== 'function') {
            throw new Error('ToolRegistry: PodcastGenerator belum siap');
        }
        return KESEMPATAN.PodcastGenerator.generate(args);
    }
});

// --- Confirmed-unavailable capabilities (repo audit, see file header) ---
register('supabase.read', notImplementedTool('Tidak ada Supabase client nyata di codebase ini (initSupabase() tidak pernah didefinisikan; panel Settings adalah demo UI).'));
register('supabase.query', notImplementedTool('Sama seperti supabase.read.'));
register('supabase.insert', notImplementedTool('Sama seperti supabase.read.'));
register('supabase.update', notImplementedTool('Sama seperti supabase.read.'));
register('websocket.connect', notImplementedTool('js/collab.js hanya berisi renderUI() — tidak ada implementasi WebSocket connect/send/subscribe.'));
register('websocket.send', notImplementedTool('Sama seperti websocket.connect.'));
register('websocket.subscribe', notImplementedTool('Sama seperti websocket.connect.'));
register('publicApi.call', notImplementedTool('api-server.js adalah backend Node/Express terpisah (CommonJS) — tidak bisa dipanggil langsung dari kode browser tanpa URL deployment.'));

export const ToolRegistry = Object.freeze({
    register: register,
    invoke: invoke,
    has: has,
    list: list
});
