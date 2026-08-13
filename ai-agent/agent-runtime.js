/* ============================================================
   ai-agent/agent-runtime.js
   Top-level lifecycle state machine for the AI Agent subsystem
   and its single public entry point, runAgentTask(goal, context,
   options). Owns IDLE -> PLANNING -> WAITING_APPROVAL -> EXECUTING
   -> OBSERVING -> EVALUATING -> REPLANNING/COMPLETED/FAILED (spec
   section 3) — orchestrator.js only executes one plan at a time
   and reports back whether to replan.

   This file mounts window.KESEMPATAN.AIAgent, the namespace every
   other ai-agent/ module also assembles onto, but renders no UI
   of its own (spec: "Jangan membuat halaman UI baru").
   ============================================================ */

import { TaskManager } from './task-manager.js';
import { Planner } from './planner.js';
import { Orchestrator } from './orchestrator.js';
import { MemoryBridge } from './memory-bridge.js';
import { AgentRegistry } from './agent-registry.js';
import { ToolRegistry } from './tool-registry.js';
import { ProviderRouter } from './provider-router.js';
import { ObservationLoop } from './observation-loop.js';
import { ApprovalManager } from './approval-manager.js';
import { ExecutionEngine } from './execution-engine.js';
import { ResultEvaluator } from './result-evaluator.js';
import { WorkflowEngineAdapter } from './workflow-engine.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const MAX_REPLANS = 2;

// goal: string task description (from Chat KESEMPATAN OS or any future
// caller). context: { topic, instruction, uploadedData, ... }. options:
// { executionMode: 'AUTO'|'SEQUENTIAL'|'PARALLEL'|'HITL' }.
async function runAgentTask(goal, context, options) {
    context = context || {};
    options = options || {};

    const task = TaskManager.createTask(goal, context, options);
    TaskManager.updateTask(task.id, { status: 'PLANNING' });

    let plan = await Planner.createPlan(goal, context);
    let attempt = 0;
    let outcome = null;

    for (;;) {
        outcome = await Orchestrator.runTask(task, plan, options);
        TaskManager.updateTask(task.id, { stepResults: outcome.stepResults, evaluation: outcome.evaluation });

        if (outcome.evaluation.decision === 'COMPLETE' || attempt >= MAX_REPLANS) break;

        attempt++;
        TaskManager.updateTask(task.id, { status: 'REPLANNING', replanCount: attempt });
        const feedback = goal + '\n\nCatatan: percobaan sebelumnya gagal pada ' + outcome.evaluation.failedCount + ' dari ' + outcome.evaluation.evaluations.length + ' langkah. Buat rencana yang lebih sederhana/berbeda.';
        plan = await Planner.createPlan(feedback, context);
    }

    const finalStatus = outcome.evaluation.decision === 'COMPLETE' ? 'COMPLETED' : 'FAILED';
    TaskManager.updateTask(task.id, { status: finalStatus });

    // Best-effort: save the task outcome to VectorMemory, same as every
    // other analysis result in this app. Never blocks task completion.
    try {
        await MemoryBridge.save('AI Agent task: ' + goal, {
            agent: 'AIAgentRuntime',
            summary: goal,
            score: outcome.evaluation.passedCount,
            taskId: task.id,
            status: finalStatus
        });
    } catch (e) { /* memory save is best-effort */ }

    return TaskManager.getTask(task.id);
}

export const AgentRuntime = Object.freeze({
    runAgentTask: runAgentTask,
    getTask: TaskManager.getTask,
    listTasks: TaskManager.listTasks
});

KESEMPATAN.AIAgent = {
    Runtime: AgentRuntime,
    TaskManager: TaskManager,
    Planner: Planner,
    Orchestrator: Orchestrator,
    ExecutionEngine: ExecutionEngine,
    ResultEvaluator: ResultEvaluator,
    ApprovalManager: ApprovalManager,
    AgentRegistry: AgentRegistry,
    ToolRegistry: ToolRegistry,
    ProviderRouter: ProviderRouter,
    ObservationLoop: ObservationLoop,
    MemoryBridge: MemoryBridge,
    WorkflowEngineAdapter: WorkflowEngineAdapter,
    // Chat KESEMPATAN OS entry point (spec section 18).
    runAgentTask: runAgentTask
};
