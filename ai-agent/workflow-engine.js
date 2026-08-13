/* ============================================================
   ai-agent/workflow-engine.js
   Adapter between the Orchestrator and the existing analysis
   pipeline in js/workflow.js. Not a second workflow engine —
   WorkflowEngine.start() itself stays untouched (still reads the
   dashboard's checked checkboxes); this only drives the same
   per-agent path (WorkflowEngine.runSingleAgent, added alongside
   start() specifically for headless callers) with an agent list
   the Agent Runtime already decided on, and reuses
   WorkflowParallel's existing batch-size heuristic for parallel
   runs instead of reimplementing one.
   ============================================================ */

import { WorkflowEngine } from '../js/workflow.js';
import { WorkflowParallel } from '../js/workflow-parallel.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

async function runOneAgent(agentName, topic, instruction, uploadedData) {
    return WorkflowEngine.runSingleAgent(agentName, topic, instruction, uploadedData);
}

async function runSequential(agentNames, topic, instruction, uploadedData) {
    const results = [];
    for (let i = 0; i < agentNames.length; i++) {
        results.push(await runOneAgent(agentNames[i], topic, instruction, uploadedData));
    }
    return results;
}

async function runParallel(agentNames, topic, instruction, uploadedData) {
    const batchSize = (WorkflowParallel && typeof WorkflowParallel.getOptimalBatchSize === 'function')
        ? WorkflowParallel.getOptimalBatchSize()
        : 3;
    const results = [];
    for (let i = 0; i < agentNames.length; i += batchSize) {
        const batch = agentNames.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(function(agent) { return runOneAgent(agent, topic, instruction, uploadedData); })
        );
        results.push.apply(results, batchResults);
    }
    return results;
}

// mode: 'sequential' | 'parallel' | undefined (auto, via WorkflowParallel.selectMode
// when available — the same heuristic the dashboard itself uses).
async function runAnalysisAgents(agentNames, topic, instruction, uploadedData, mode) {
    let resolvedMode = mode;
    if (!resolvedMode) {
        resolvedMode = (WorkflowParallel && typeof WorkflowParallel.selectMode === 'function')
            ? WorkflowParallel.selectMode(agentNames.length)
            : (agentNames.length > 1 ? 'parallel' : 'sequential');
    }
    return resolvedMode === 'parallel'
        ? runParallel(agentNames, topic, instruction, uploadedData)
        : runSequential(agentNames, topic, instruction, uploadedData);
}

export const WorkflowEngineAdapter = Object.freeze({
    runAnalysisAgents: runAnalysisAgents,
    runOneAgent: runOneAgent
});
