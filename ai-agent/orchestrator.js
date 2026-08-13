/* ============================================================
   ai-agent/orchestrator.js
   Walks ONE plan (produced by planner.js) and executes it via
   execution-engine.js, honoring the AUTO/SEQUENTIAL/PARALLEL/HITL
   execution modes from spec section 14. Gates risky steps (spec
   section 17) behind approval-manager.js before running them.
   Does not decide REPLANNING vs COMPLETE itself — that decision
   belongs to agent-runtime.js, which owns the full lifecycle and
   calls back into planner.js if this plan's evaluation says REPLAN.
   ============================================================ */

import { TaskManager } from './task-manager.js';
import { ExecutionEngine } from './execution-engine.js';
import { ResultEvaluator } from './result-evaluator.js';
import { ApprovalManager } from './approval-manager.js';

async function runStepsSequentially(plan, task) {
    const results = [];
    for (let i = 0; i < plan.length; i++) {
        const step = plan[i];
        if (ApprovalManager.isRiskyAction(step.name)) {
            TaskManager.updateTask(task.id, { status: 'WAITING_APPROVAL' });
            const approved = await ApprovalManager.requestManualApproval([
                { agent: step.name, summary: step.description, score: 0, confidence: 0 }
            ]);
            TaskManager.updateTask(task.id, { status: 'EXECUTING' });
            if (!approved || approved.length === 0) {
                results.push({ stepId: step.id, success: false, output: null, error: 'Aksi ditolak/tidak disetujui: ' + step.name });
                continue;
            }
        }
        results.push(await ExecutionEngine.executeStep(step, task.context));
    }
    return results;
}

async function runStepsInParallel(plan, task) {
    // Risky steps still go through sequential approval-gating first; the
    // rest run concurrently.
    const risky = plan.filter(function(step) { return ApprovalManager.isRiskyAction(step.name); });
    const safe = plan.filter(function(step) { return !ApprovalManager.isRiskyAction(step.name); });
    const riskyResults = await runStepsSequentially(risky, task);
    const safeResults = await Promise.all(safe.map(function(step) { return ExecutionEngine.executeStep(step, task.context); }));
    return riskyResults.concat(safeResults);
}

async function handleHITLApproval(task, stepResults) {
    const analysisOutputs = stepResults
        .filter(function(r) { return r.success && r.output && typeof r.output.confidence === 'number'; })
        .map(function(r) { return r.output; });
    if (analysisOutputs.length === 0) return null;
    const autoApproved = ApprovalManager.autoApproveIfEligible(analysisOutputs);
    if (autoApproved) return autoApproved;
    TaskManager.updateTask(task.id, { status: 'WAITING_APPROVAL' });
    const manual = await ApprovalManager.requestManualApproval(analysisOutputs);
    TaskManager.updateTask(task.id, { status: 'EXECUTING' });
    return manual;
}

async function runTask(task, plan, options) {
    options = options || {};
    const mode = (options.executionMode || 'AUTO').toUpperCase();

    TaskManager.updateTask(task.id, { status: 'EXECUTING', plan: plan });

    const stepResults = mode === 'PARALLEL'
        ? await runStepsInParallel(plan, task)
        : await runStepsSequentially(plan, task);

    TaskManager.updateTask(task.id, { status: 'OBSERVING', stepResults: stepResults });

    let approvalOutcome = null;
    if (mode === 'HITL') {
        approvalOutcome = await handleHITLApproval(task, stepResults);
    }

    TaskManager.updateTask(task.id, { status: 'EVALUATING' });
    const evaluation = ResultEvaluator.evaluateTask(stepResults);

    return { stepResults: stepResults, evaluation: evaluation, approvalOutcome: approvalOutcome };
}

export const Orchestrator = Object.freeze({
    runTask: runTask
});
