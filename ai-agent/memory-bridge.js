/* ============================================================
   ai-agent/memory-bridge.js
   Thin adapter over the existing VectorMemory (memory/m-index.js).
   Not a second memory system — reads/writes the same store every
   other module in the app already uses.
   ============================================================ */

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getMemory() {
    return window.VectorMemory || KESEMPATAN.VectorMemory || null;
}

async function save(text, metadata) {
    const memory = getMemory();
    if (!memory || typeof memory.save !== 'function') return null;
    return memory.save(text, metadata || {});
}

async function search(query, options) {
    const memory = getMemory();
    if (!memory || typeof memory.search !== 'function') return [];
    const results = await memory.search(query, options || { topK: 5 });
    return results || [];
}

async function getStats() {
    const memory = getMemory();
    if (!memory || typeof memory.getStats !== 'function') return null;
    return memory.getStats();
}

function isReady() {
    const memory = getMemory();
    return !!(memory && typeof memory.save === 'function' && typeof memory.search === 'function');
}

export const MemoryBridge = Object.freeze({
    save: save,
    search: search,
    getStats: getStats,
    isReady: isReady
});
