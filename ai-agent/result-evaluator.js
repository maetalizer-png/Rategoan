/* ============================================================
   ai-agent/result-evaluator.js
   Scores a completed step/task result against its objective and
   decides whether the Orchestrator should move to EVALUATING->
   COMPLETED or back to REPLANNING.
   ============================================================ */

const DEFAULT_CONFIDENCE_THRESHOLD = 70;

function evaluateStep(stepResult) {
    if (!stepResult || !stepResult.success) {
        return { passed: false, reason: (stepResult && stepResult.error) || 'step gagal dieksekusi' };
    }
    const output = stepResult.output;
    if (output && output.notImplemented) {
        return { passed: false, reason: 'capability belum tersedia: ' + (output.reason || '') };
    }
    // Analysis-agent output shape (agent/score/confidence) — same fields
    // js/hitl.js already scores against.
    if (output && typeof output.confidence === 'number') {
        const threshold = (window.AutoLearning && typeof window.AutoLearning.getRecommendedThreshold === 'function')
            ? window.AutoLearning.getRecommendedThreshold(output.agent)
            : DEFAULT_CONFIDENCE_THRESHOLD;
        const passed = output.confidence >= threshold;
        return { passed: passed, reason: passed ? 'confidence ' + output.confidence + '>=' + threshold : 'confidence ' + output.confidence + '<' + threshold, threshold: threshold };
    }
    return { passed: true, reason: 'ok' };
}

function evaluateTask(stepResults) {
    const evaluations = stepResults.map(evaluateStep);
    const failed = evaluations.filter(function(e) { return !e.passed; });
    return {
        allPassed: failed.length === 0,
        passedCount: evaluations.length - failed.length,
        failedCount: failed.length,
        evaluations: evaluations,
        decision: failed.length === 0 ? 'COMPLETE' : 'REPLAN'
    };
}

export const ResultEvaluator = Object.freeze({
    evaluateStep: evaluateStep,
    evaluateTask: evaluateTask
});
