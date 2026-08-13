/* ============================================================
   ai-agent/provider-router.js
   Thin adapter over the existing local-first LLM/provider bridge
   (js/workflow-llm-bridge.js). No provider client is implemented
   here — this only routes to what already exists so a future
   provider never requires changing the Orchestrator/Planner.
   ============================================================ */

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getBridge() {
    return KESEMPATAN.WorkflowLLMBridge || null;
}

// meta: { agent, topic } — passed straight through to callGenerativeEngine
// for its telemetry/caching, which key on (agent, topic) internally.
async function generate(prompt, meta) {
    const bridge = getBridge();
    if (!bridge || typeof bridge.callGenerativeEngine !== 'function') {
        throw new Error('ProviderRouter: WorkflowLLMBridge belum siap');
    }
    meta = meta || {};
    const agent = meta.agent || 'AIAgent';
    const topic = meta.topic || '';
    const { text, engine } = await bridge.callGenerativeEngine(prompt, agent, topic);
    return { text: text, engine: engine };
}

function isReady() {
    const bridge = getBridge();
    return !!(bridge && typeof bridge.callGenerativeEngine === 'function');
}

export const ProviderRouter = Object.freeze({
    generate: generate,
    isReady: isReady
});
