/* ============================================================
   ai-agent/observation-loop.js
   Adapter between Agent Runtime and the existing Observation
   Engine (observ/). No new ingestion pipeline — this only reads
   from / triggers a refresh of the signals Observation Engine
   already collects.
   ============================================================ */

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getObservation() {
    return KESEMPATAN.Observation || null;
}

// Cached signals already collected by the Observation Engine (sync).
function getSignals() {
    const obs = getObservation();
    if (!obs || typeof obs.getSignals !== 'function') return [];
    return obs.getSignals() || [];
}

// Triggers a fresh fetch cycle in the Observation Engine itself
// (fetcher.js) rather than duplicating any fetch/RSS/analysis logic here.
async function refreshSignals() {
    const obs = getObservation();
    if (!obs || typeof obs.generateSignals !== 'function') return getSignals();
    try {
        await obs.generateSignals();
    } catch (e) {
        // Observation Engine already logs/handles its own fetch failures;
        // fall back to whatever signals are already cached.
    }
    return getSignals();
}

// Convenience for Planner/Orchestrator: recent signals relevant to a topic,
// used as context the same way js/workflow.js already folds Observation
// data into agent prompts (via world/history sections).
function getContextForTopic(topic, limit) {
    const signals = getSignals();
    if (!topic) return signals.slice(0, limit || 10);
    const q = topic.toLowerCase();
    return signals
        .filter(function(s) {
            const text = ((s.title || '') + ' ' + (s.desc || '')).toLowerCase();
            return text.includes(q);
        })
        .slice(0, limit || 10);
}

export const ObservationLoop = Object.freeze({
    getSignals: getSignals,
    refreshSignals: refreshSignals,
    getContextForTopic: getContextForTopic
});
