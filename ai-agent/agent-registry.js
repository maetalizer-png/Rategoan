/* ============================================================
   ai-agent/agent-registry.js
   Adapter over the app's TWO existing agent pools — no new agents
   are created here:
     1. The ~200-entry analysis-agent roster (agents/agents-config.js
        + the category files that mutate the same AGENTS_CONFIG
        object: agents-general.js, agents-global.js,
        agents-politics.js, agent-science.js). Used for opportunity
        analysis (Workflow, Debate, Tournament, Chat AI/Agent).
     2. The 55 KESWORKER automation tasks (workers/workers-config.js
        AI_WORKERS_LIST, executed via window.AIWorkers).
   Every lookup result is tagged with `pool` so callers never
   confuse the two.
   ============================================================ */

import { AGENTS_CONFIG, getAgentConfig } from '../agents/agents-config.js';
import { WorkersConfig } from '../workers/workers-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

function getAnalysisAgent(name) {
    if (!AGENTS_CONFIG[name]) return null;
    const cfg = getAgentConfig(name);
    return { pool: 'analysis-agent', id: name, name: cfg.name || name, role: cfg.role || '', config: cfg };
}

function listAnalysisAgents() {
    return Object.keys(AGENTS_CONFIG).map(function(name) {
        return getAnalysisAgent(name);
    });
}

function getWorker(id) {
    const worker = WorkersConfig.AI_WORKERS_LIST.find(function(w) { return w.id === id; });
    if (!worker) return null;
    return { pool: 'kesworker', id: worker.id, name: worker.name, category: worker.category, priority: worker.priority, config: worker };
}

function listWorkers(category) {
    const list = WorkersConfig.AI_WORKERS_LIST;
    const filtered = category ? list.filter(function(w) { return w.category === category; }) : list;
    return filtered.map(function(w) {
        return { pool: 'kesworker', id: w.id, name: w.name, category: w.category, priority: w.priority, config: w };
    });
}

function listWorkerCategories() {
    const seen = {};
    WorkersConfig.AI_WORKERS_LIST.forEach(function(w) { seen[w.category] = true; });
    return Object.keys(seen);
}

// Free-text capability search across BOTH pools — matches against role/
// name for analysis agents, and name/category for KESWORKER. Used by the
// Planner when a plan step names a capability rather than an exact id
// (spec section 4/15: agents chosen by role/capability/category/objective/
// task type, not hardcoded).
function findAgent(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) return [];
    const results = [];
    listAnalysisAgents().forEach(function(a) {
        const hay = (a.name + ' ' + a.role).toLowerCase();
        if (hay.includes(q)) results.push(a);
    });
    listWorkers().forEach(function(w) {
        const hay = (w.name + ' ' + w.category).toLowerCase();
        if (hay.includes(q)) results.push(w);
    });
    return results;
}

export const AgentRegistry = Object.freeze({
    getAnalysisAgent: getAnalysisAgent,
    listAnalysisAgents: listAnalysisAgents,
    getWorker: getWorker,
    listWorkers: listWorkers,
    listWorkerCategories: listWorkerCategories,
    findAgent: findAgent
});
