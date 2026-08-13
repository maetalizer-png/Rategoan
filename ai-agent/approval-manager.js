/* ============================================================
   ai-agent/approval-manager.js
   Wraps the existing HITL panel (js/hitl.js) and the existing
   Auto-Learning adaptive threshold (js/threshold-learning.js,
   exposed as window.AutoLearning) for the WAITING_APPROVAL
   lifecycle state. No new approval UI is created — this reuses
   the same #hitlPanel the dashboard already renders.
   ============================================================ */

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

// Spec section 17: actions that must go through WAITING_APPROVAL rather
// than auto-executing.
const RISKY_ACTION_KEYWORDS = [
    'publish', 'delete', 'hapus', 'destructive', 'drop', 'truncate',
    'config', 'konfigurasi', 'external', 'eksternal'
];

function isRiskyAction(actionName) {
    const name = (actionName || '').toLowerCase();
    return RISKY_ACTION_KEYWORDS.some(function(kw) { return name.includes(kw); });
}

function getHITL() {
    return KESEMPATAN.HITL || null;
}

// Analysis-agent-shaped results (agent/score/confidence) — delegate to the
// existing per-agent adaptive threshold (window.AutoLearning.getRecommendedThreshold)
// already implemented in HITL.autoApproveResults. Returns null if nothing
// cleared the threshold (caller should fall back to requestManualApproval).
function autoApproveIfEligible(results) {
    const hitl = getHITL();
    if (!hitl || typeof hitl.autoApproveResults !== 'function') return null;
    return hitl.autoApproveResults(results, 'act');
}

// Renders the existing HITL panel and resolves once the human clicks the
// existing confirm button (js/hitl.js's #confirmAggregationBtn) — reuses
// the dashboard's own approval UI rather than creating a new one.
function requestManualApproval(results) {
    const hitl = getHITL();
    if (!hitl || typeof hitl.renderPanel !== 'function' || typeof hitl.setConfirmCallback !== 'function') {
        return Promise.resolve(null);
    }
    return new Promise(function(resolve) {
        hitl.setConfirmCallback(function(approved) { resolve(approved); });
        hitl.renderPanel(results);
    });
}

export const ApprovalManager = Object.freeze({
    isRiskyAction: isRiskyAction,
    autoApproveIfEligible: autoApproveIfEligible,
    requestManualApproval: requestManualApproval
});
