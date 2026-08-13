import { Utils } from '../js/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;

// ============================================================
// KONTRAK PENYIMPANAN — FROZEN
// JANGAN rename STORAGE_KEY sembarangan (mereset kuota/tier).
// State governance bukan data mahal, tapi ganti hanya lewat
// migration jika benar-benar perlu.
// ============================================================
const GOV_CONFIG = {
    STORAGE_KEY: 'kes_memory_governance',
    NOVELTY_THRESHOLD: 0.92,
    DAILY_BUDGET_FIXED: {
        static: 500,
        general: 300
    },
    DAILY_BUDGET_PERCENT: {
        'auto-learn': 0.02,
        federated: 0.01
    },
    MIN_DAILY_BUDGET: 10,
    CYCLE_COOLDOWN_MS: {
        'auto-learn': 30 * 60 * 1000,
        federated: 6 * 60 * 60 * 1000
    },
    PROMOTE_TO_VERIFIED_HITS: 3,
    PROMOTE_TO_PERMANENT_DAYS: 3,
    MAX_HISTORY_EVENTS: 150
};

// ============================================================
// STATE
// ============================================================
let state = {
    dayStamp: new Date().toDateString(),
    budgetUsed: {},
    lastCycle: {},
    lastCycleHitBudget: {},
    tierData: {},
    acceptedCount: 0,
    rejectedCount: {
        budget: 0,
        duplicate: 0,
        'emergency-stop': 0
    },
    history: [],
    emergencyStop: false
};

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function loadState() {
    try {
        if (typeof localStorage === 'undefined') {
            return;
        }

        const raw = localStorage.getItem(GOV_CONFIG.STORAGE_KEY);

        if (raw) {
            const parsed = JSON.parse(raw);

            state = Object.assign({}, state, parsed);
        }
    } catch (_) {
        // start clean
    }
}

function saveState() {
    try {
        if (typeof localStorage === 'undefined') {
            return;
        }

        localStorage.setItem(GOV_CONFIG.STORAGE_KEY, JSON.stringify(state));
    } catch (_) {
        // ignore storage error
    }
}

function resetDailyIfNeeded() {
    const today = new Date().toDateString();

    if (state.dayStamp !== today) {
        state.dayStamp = today;
        state.budgetUsed = {};

        saveState();
    }
}

// ============================================================
// NOVELTY CHECK
// ============================================================
async function checkNovelty(text) {
    const core = window._memoryCore;

    if (!core || !Array.isArray(core.vectors) || core.vectors.length === 0) {
        return {
            novel: true,
            similarity: 0
        };
    }

    try {
        const results = await core.search(text, {
            topK: 1,
            useCache: false
        });

        const top = results && results[0];
        const similarity = top ? (top.similarity || 0) : 0;

        return {
            novel: similarity < GOV_CONFIG.NOVELTY_THRESHOLD,
            similarity: similarity
        };
    } catch (_) {
        return {
            novel: true,
            similarity: 0
        };
    }
}

// ============================================================
// BUDGET GOVERNOR
// ============================================================
function getDailyBudgetFor(source) {
    if (GOV_CONFIG.DAILY_BUDGET_FIXED[source] !== undefined) {
        return GOV_CONFIG.DAILY_BUDGET_FIXED[source];
    }

    if (GOV_CONFIG.DAILY_BUDGET_PERCENT[source] !== undefined) {
        const core = window._memoryCore;
        const total = (core && Array.isArray(core.vectors) && core.vectors.length) || 0;

        return Math.max(
            GOV_CONFIG.MIN_DAILY_BUDGET,
            Math.floor(total * GOV_CONFIG.DAILY_BUDGET_PERCENT[source])
        );
    }

    return GOV_CONFIG.DAILY_BUDGET_FIXED.general;
}

function checkBudget(source) {
    resetDailyIfNeeded();

    const used = state.budgetUsed[source] || 0;
    const budget = getDailyBudgetFor(source);

    if (used >= budget) {
        return {
            allowed: false,
            reason: 'daily-budget-exceeded',
            used: used,
            budget: budget
        };
    }

    const cooldown = GOV_CONFIG.CYCLE_COOLDOWN_MS[source];

    if (cooldown) {
        const last = state.lastCycle[source] || 0;

        if (
            used === 0 &&
            (Date.now() - last) < cooldown &&
            state.lastCycleHitBudget &&
            state.lastCycleHitBudget[source]
        ) {
            return {
                allowed: false,
                reason: 'cooldown-active',
                retryAfterMs: cooldown - (Date.now() - last)
            };
        }
    }

    return {
        allowed: true,
        used: used,
        budget: budget
    };
}

function consumeBudget(source) {
    state.budgetUsed[source] = (state.budgetUsed[source] || 0) + 1;

    const budget = getDailyBudgetFor(source);

    if (state.budgetUsed[source] >= budget) {
        state.lastCycle[source] = Date.now();
        state.lastCycleHitBudget = state.lastCycleHitBudget || {};
        state.lastCycleHitBudget[source] = true;
    }
}

// ============================================================
// TIERING
// ============================================================
function recordAccess(id) {
    const entry = state.tierData[id];

    if (!entry) {
        return;
    }

    entry.hits = (entry.hits || 0) + 1;

    if (entry.tier === 'candidate' && entry.hits >= GOV_CONFIG.PROMOTE_TO_VERIFIED_HITS) {
        entry.tier = 'verified';
        entry.verifiedAt = Date.now();
    } else if (
        entry.tier === 'verified' &&
        entry.verifiedAt &&
        (Date.now() - entry.verifiedAt) > GOV_CONFIG.PROMOTE_TO_PERMANENT_DAYS * 86400000
    ) {
        entry.tier = 'permanent';
    }

    saveState();
}

function getTier(id) {
    const entry = state.tierData[id];

    return entry ? entry.tier : null;
}

// ============================================================
// HISTORY & STATS
// ============================================================
function recordEvent(type, source, text, extra) {
    state.history.unshift(Object.assign({
        type: type,
        source: source,
        snippet: String(text || '').slice(0, 70),
        ts: Date.now()
    }, extra || {}));

    if (state.history.length > GOV_CONFIG.MAX_HISTORY_EVENTS) {
        state.history = state.history.slice(0, GOV_CONFIG.MAX_HISTORY_EVENTS);
    }
}

function getStats() {
    resetDailyIfNeeded();

    const core = window._memoryCore;
    const total = (core && Array.isArray(core.vectors) && core.vectors.length) || 0;

    const tiers = {
        candidate: 0,
        verified: 0,
        permanent: 0
    };

    Object.keys(state.tierData).forEach(function (id) {
        const tier = state.tierData[id].tier;

        tiers[tier] = (tiers[tier] || 0) + 1;
    });

    const totalRejected =
        state.rejectedCount.budget +
        state.rejectedCount.duplicate +
        state.rejectedCount['emergency-stop'];

    const totalAttempts = state.acceptedCount + totalRejected;

    return {
        totalVectors: total,
        tiers: tiers,
        budgetToday: {
            static: {
                used: state.budgetUsed.static || 0,
                budget: getDailyBudgetFor('static')
            },
            general: {
                used: state.budgetUsed.general || 0,
                budget: getDailyBudgetFor('general')
            },
            'auto-learn': {
                used: state.budgetUsed['auto-learn'] || 0,
                budget: getDailyBudgetFor('auto-learn')
            },
            federated: {
                used: state.budgetUsed.federated || 0,
                budget: getDailyBudgetFor('federated')
            }
        },
        acceptedCount: state.acceptedCount,
        rejectedCount: Object.assign({}, state.rejectedCount),
        rejectionRate: totalAttempts > 0 ? (totalRejected / totalAttempts) : 0,
        recentHistory: state.history.slice(0, 30),
        emergencyStopActive: state.emergencyStop === true
    };
}

function setEmergencyStop(active) {
    state.emergencyStop = !!active;

    saveState();

    Logger.info(
        'MemoryGovernance',
        active ? 'Emergency stop active' : 'Emergency stop disabled'
    );
}

// ============================================================
// MAIN GATE
// ============================================================
async function ingest(text, metadata, image, audio) {
    metadata = metadata || {};

    const source = metadata.source || 'general';

    if (state.emergencyStop) {
        state.rejectedCount['emergency-stop']++;

        recordEvent('rejected', source, text, {
            reason: 'emergency-stop'
        });

        saveState();

        return {
            accepted: false,
            reason: 'emergency-stop'
        };
    }

    const budgetCheck = checkBudget(source);

    if (!budgetCheck.allowed) {
        state.rejectedCount.budget++;

        recordEvent('rejected', source, text, {
            reason: budgetCheck.reason
        });

        saveState();

        return {
            accepted: false,
            reason: budgetCheck.reason,
            budget: budgetCheck
        };
    }

    const noveltyResult = await checkNovelty(text);

    if (!noveltyResult.novel) {
        state.rejectedCount.duplicate++;

        recordEvent('rejected', source, text, {
            reason: 'duplicate',
            similarity: noveltyResult.similarity
        });

        saveState();

        return {
            accepted: false,
            reason: 'duplicate',
            similarity: noveltyResult.similarity
        };
    }

    const taggedMetadata = Object.assign({}, metadata, {
        tier: 'candidate'
    });

    let originalSave = window.__MemoryGovernanceOriginalSave;

    if (!originalSave && window._memoryCore && typeof window._memoryCore.save === 'function') {
        originalSave = window._memoryCore.save.bind(window._memoryCore);
    }

    if (!originalSave) {
        return {
            accepted: false,
            reason: 'memory-core-unavailable'
        };
    }

    const vector = await originalSave(text, taggedMetadata, image, audio);

    if (vector && vector.id) {
        state.tierData[vector.id] = {
            tier: 'candidate',
            hits: 0,
            firstSeen: Date.now()
        };
    }

    consumeBudget(source);

    state.acceptedCount++;

    recordEvent('accepted', source, text, {
        similarity: noveltyResult.similarity
    });

    saveState();

    return {
        accepted: true,
        vector: vector
    };
}

// ============================================================
// INSTALL GATE
// ============================================================
function installGate() {
    const mem = window.VectorMemory || window._memoryCore;

    // Guard GLOBAL (bukan per-objek) supaya gate tidak pernah
    // terbungkus dua kali meski install dipanggil pada objek
    // berbeda di timing berbeda.
    if (!mem || typeof mem.save !== 'function' || window.__MemoryGovernanceInstalled) {
        return false;
    }

    window.__MemoryGovernanceOriginalSave = mem.save.bind(mem);

    mem.save = function (text, metadata, image, audio) {
        return ingest(text, metadata, image, audio);
    };

    window.__MemoryGovernanceInstalled = true;
    mem.__governanceInstalled = true;

    Logger.info('MemoryGovernance', 'Ingestion gate installed');

    return true;
}

let installAttempts = 0;

// MODERNISASI ASYNC (Juli 2026, risiko rendah): sebelumnya cuma polling
// setInterval 500ms x40 percobaan (bisa nunggu sia-sia sampai 20 detik
// kalau VectorMemory lambat siap) — sekarang dengarkan event
// 'memory-api-ready' yang SUDAH di-dispatch m-index.js begitu
// window.VectorMemory benar-benar siap (sukses ATAU fallback). Polling
// TETAP disertakan sbg jaring pengaman (kalau listener terpasang
// SETELAH event sempat terlanjur ter-dispatch duluan, akibat urutan
// modul yang tidak selalu sama), tapi jadi jalur cadangan yang jarang
// terpakai, bukan mekanisme utama lagi.
if (typeof document !== 'undefined') {
    document.addEventListener('memory-api-ready', function onReady() {
        document.removeEventListener('memory-api-ready', onReady);
        installGate();
    });
}

const installTimer = setInterval(function () {
    installAttempts++;

    if (installGate() || installAttempts > 40) {
        clearInterval(installTimer);
    }
}, 500);

loadState();
resetDailyIfNeeded();

// ============================================================
// DASHBOARD
// ============================================================
function renderDashboard(containerId) {
    const container = document.getElementById(containerId || 'memoryGovernanceDashboard');

    if (!container) {
        return;
    }

    const stats = getStats();

    const barWidth = function (used, budget) {
        return budget > 0 ? Math.min(100, Math.round((used / budget) * 100)) : 0;
    };

    const sourceRow = function (label, key) {
        const budgetItem = stats.budgetToday[key];
        const pct = barWidth(budgetItem.used, budgetItem.budget);
        const color = pct >= 90 ? '#ff4444' : (pct >= 60 ? '#FFD700' : '#00FFA3');

        return '<div style="margin-bottom:8px;">' +
            '<div style="display:flex; justify-content:space-between; font-size:11px; color:#A0B3C9; margin-bottom:2px;">' +
            '<span>' + escapeHtml(label) + '</span>' +
            '<span>' + budgetItem.used + ' / ' + budgetItem.budget + '</span>' +
            '</div>' +
            '<div style="height:5px; background:rgba(255,255,255,0.06); border-radius:4px; overflow:hidden;">' +
            '<div style="height:100%; width:' + pct + '%; background:' + color + ';"></div>' +
            '</div>' +
            '</div>';
    };

    const historyHTML = stats.recentHistory.slice(0, 10).map(function (item) {
        const icon = item.type === 'accepted' ? '[accepted]' : '[rejected]';

        const reasonText = item.reason
            ? ' - ' + escapeHtml(item.reason) + (item.similarity ? ' (' + Math.round(item.similarity * 100) + '%)' : '')
            : '';

        return '<div style="font-size:10px; color:#A0B3C9; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05);">' +
            icon + ' [' + escapeHtml(item.source) + '] ' +
            escapeHtml(item.snippet || '') +
            reasonText +
            '</div>';
    }).join('');

    const totalRejected =
        stats.rejectedCount.budget +
        stats.rejectedCount.duplicate +
        stats.rejectedCount['emergency-stop'];

    container.innerHTML =
        '<div style="padding:16px; background:rgba(0,0,0,0.2); border-radius:14px; border:1px solid rgba(0,255,163,0.15);">' +
        '<h4 style="color:#00FFA3; margin:0 0 12px 0;">Memory Governance</h4>' +
        '<div style="display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap;">' +
        '<div style="flex:1; text-align:center; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px;">' +
        '<div style="font-size:18px; font-weight:700; color:#00FFA3;">' + stats.totalVectors + '</div>' +
        '<div style="font-size:9px; color:#A0B3C9;">Total Memory</div>' +
        '</div>' +
        '<div style="flex:1; text-align:center; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px;">' +
        '<div style="font-size:18px; font-weight:700; color:#FFD700;">' + stats.tiers.candidate + '</div>' +
        '<div style="font-size:9px; color:#A0B3C9;">Candidate</div>' +
        '</div>' +
        '<div style="flex:1; text-align:center; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px;">' +
        '<div style="font-size:18px; font-weight:700; color:#00D4FF;">' + stats.tiers.verified + '</div>' +
        '<div style="font-size:9px; color:#A0B3C9;">Verified</div>' +
        '</div>' +
        '<div style="flex:1; text-align:center; background:rgba(255,255,255,0.03); border-radius:10px; padding:8px;">' +
        '<div style="font-size:18px; font-weight:700; color:#9B59B6;">' + stats.tiers.permanent + '</div>' +
        '<div style="font-size:9px; color:#A0B3C9;">Permanent</div>' +
        '</div>' +
        '</div>' +
        '<div style="margin-bottom:14px;">' +
        sourceRow('Static today', 'static') +
        sourceRow('General today', 'general') +
        sourceRow('Auto-learning today', 'auto-learn') +
        sourceRow('Federated today', 'federated') +
        '</div>' +
        '<div style="font-size:11px; color:#A0B3C9; margin-bottom:8px;">' +
        'Accepted: <b style="color:#00FFA3;">' + stats.acceptedCount + '</b> ' +
        'Rejected: <b style="color:#ff4444;">' + totalRejected + '</b> ' +
        '(budget: ' + stats.rejectedCount.budget + ', duplicate: ' + stats.rejectedCount.duplicate + ') ' +
        'Rejection rate: ' + Math.round(stats.rejectionRate * 100) + '%' +
        '</div>' +
        '<div style="max-height:150px; overflow-y:auto; margin-bottom:12px;">' +
        (historyHTML || '<div style="color:#666; font-size:11px;">No activity yet.</div>') +
        '</div>' +
        '<button id="memGovEmergencyBtn" class="execute-btn secondary" style="width:100%; ' +
        (stats.emergencyStopActive ? 'background:#ff4444; color:#fff;' : '') + '">' +
        (stats.emergencyStopActive ? 'Emergency Stop Active - click to disable' : 'Enable Emergency Stop') +
        '</button>' +
        '</div>';

    const btn = document.getElementById('memGovEmergencyBtn');

    if (btn) {
        btn.onclick = function () {
            setEmergencyStop(!stats.emergencyStopActive);

            renderDashboard(containerId);
        };
    }
}

export const MemoryGovernance = {
    ingest: ingest,
    recordAccess: recordAccess,
    getTier: getTier,
    getStats: getStats,
    setEmergencyStop: setEmergencyStop,
    renderDashboard: renderDashboard,
    CONFIG: GOV_CONFIG
};

KESEMPATAN.Memory.MemoryGovernance = MemoryGovernance;
