import { InternalLogger, NotificationSystem, generateId } from './kes-helpers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

const Logger = InternalLogger;

const Notify = NotificationSystem;


function createId() {
    if (typeof generateId === 'function') {
        return generateId();
    }

    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================================
// MONITORING DASHBOARD
// ============================================================
class MonitoringDashboard {
    constructor(db) {
        this._db = db;

        this.metrics = {
            queryCount: 0,
            errorCount: 0,
            avgResponseTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            offlineOps: 0,
            p2pMessages: 0
        };

        this._alerts = [];
        this._healthChecks = new Map();
        this._maxAlerts = 100;

        Logger.debug('MonitoringDashboard', 'Initialized');
    }

    registerHealthCheck(name, checkFn) {
        const normalized = typeof checkFn === 'function'
            ? { check: checkFn }
            : checkFn;

        this._healthChecks.set(name, normalized);
    }

    async runHealthChecks() {
        const results = {};

        for (const [name, check] of this._healthChecks) {
            try {
                if (!check || typeof check.check !== 'function') {
                    throw new Error('Invalid health check');
                }

                const result = await check.check();

                results[name] = {
                    status: result.status,
                    details: result.details || {}
                };

                if (result.status === 'error' || result.status === 'critical') {
                    this.addAlert('error', 'Health check failed: ' + name, result);
                }
            } catch (e) {
                results[name] = {
                    status: 'error',
                    error: e.message
                };

                this.addAlert('error', 'Health check error: ' + name, e.message);
            }
        }

        return results;
    }

    addAlert(severity, message, details) {
        const alert = {
            id: createId(),
            severity: severity,
            message: message,
            details: details || null,
            timestamp: Date.now(),
            acknowledged: false
        };

        this._alerts.push(alert);

        if (this._alerts.length > this._maxAlerts) {
            this._alerts.shift();
        }

        const publicAlert = Object.freeze(Object.assign({}, alert));

        const notifyFn = typeof Notify[severity] === 'function'
            ? Notify[severity]
            : Notify.info;

        notifyFn('Alert', message);

        Logger.warn('Monitoring', 'Alert: ' + severity + ' - ' + message);

        return publicAlert;
    }

    acknowledgeAlert(id) {
        const index = this._alerts.findIndex(function (item) {
            return item.id === id;
        });

        if (index === -1) {
            return null;
        }

        const oldAlert = this._alerts[index];

        const updatedAlert = Object.assign({}, oldAlert, {
            acknowledged: true
        });

        this._alerts[index] = updatedAlert;

        return Object.freeze(updatedAlert);
    }

    getAlerts(severity, limit) {
        limit = limit || 50;

        let result = this._alerts.slice();

        if (severity) {
            result = result.filter(function (alert) {
                return alert.severity === severity;
            });
        }

        return result.slice(-limit).map(function (alert) {
            return Object.freeze(Object.assign({}, alert));
        });
    }

    async renderUI(containerId) {
        const container = document.getElementById(containerId);

        if (!container) {
            Logger.warn('MonitoringDashboard', 'Container not found: ' + containerId);
            return;
        }

        const dashboard = await this.getDashboard();

        const healthJson = escapeHtml(JSON.stringify(dashboard.health, null, 2));

        const alertItems = dashboard.alerts.map(function (alert) {
            return '<li>' +
                escapeHtml(alert.severity) + ': ' +
                escapeHtml(alert.message) +
                '</li>';
        }).join('');

        const html = `
            <div style="font-family:sans-serif;padding:1rem;border:1px solid #ccc;border-radius:8px;background:#f9f9f9;">
                <h3>KESEMPATAN OS Dashboard</h3>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem;">
                    <div><strong>Queries</strong> ${dashboard.metrics.queryCount}</div>
                    <div><strong>Errors</strong> ${dashboard.metrics.errorCount}</div>
                    <div><strong>Avg Response</strong> ${dashboard.metrics.avgResponseTime.toFixed(2)}ms</div>
                    <div><strong>Cache Hits</strong> ${dashboard.metrics.cacheHits}</div>
                    <div><strong>Cache Misses</strong> ${dashboard.metrics.cacheMisses}</div>
                    <div><strong>Alerts</strong> ${dashboard.alerts.length}</div>
                    <div><strong>Uptime</strong> ${Math.floor(dashboard.uptime / 1000)}s</div>
                </div>
                <details>
                    <summary>Health Checks</summary>
                    <pre>${healthJson}</pre>
                </details>
                <details>
                    <summary>Alerts</summary>
                    <ul>${alertItems}</ul>
                </details>
            </div>
        `;

        container.innerHTML = html;
    }

    async getDashboard() {
        const health = await this.runHealthChecks();

        let storageInfo = {};

        if (this._db && typeof this._db.getStorageInfoEnhanced === 'function') {
            storageInfo = await this._db.getStorageInfoEnhanced();
        }

        const startTime = this._db && this._db._startTime
            ? this._db._startTime
            : Date.now();

        return Object.freeze({
            metrics: this.metrics,
            alerts: this.getAlerts(null, 10),
            health: health,
            storage: storageInfo,
            uptime: Date.now() - startTime
        });
    }

    getStats() {
        return Object.freeze({
            metrics: this.metrics,
            alerts: this._alerts.length,
            healthChecks: this._healthChecks.size
        });
    }
}

// ============================================================
// AUDIT LOG
// ============================================================
class AuditLog {
    constructor(db) {
        this._db = db;
        this._logs = [];
        this._maxLogs = 10000;

        Logger.debug('AuditLog', 'Initialized');
    }

    async _hash(payload) {
        if (!globalThis.crypto || !globalThis.crypto.subtle) {
            return null;
        }

        const encoder = new TextEncoder();

        const digest = await crypto.subtle.digest(
            'SHA-256',
            encoder.encode(JSON.stringify(payload))
        );

        return Array.from(new Uint8Array(digest));
    }

    async log(action, resource, data, user) {
        const entry = {
            id: createId(),
            timestamp: Date.now(),
            action: action,
            resource: resource,
            data: data || null,
            user: user || 'system',
            signature: null
        };

        const signature = await this._hash(entry);

        const signedEntry = Object.freeze(Object.assign({}, entry, {
            signature: signature
        }));

        this._logs.push(signedEntry);

        if (this._logs.length > this._maxLogs) {
            this._logs.shift();
        }

        await this._persist(signedEntry);

        Logger.info('AuditLog', 'Logged: ' + action + ' on ' + resource);

        return signedEntry;
    }

    async _persist(signedEntry) {
        if (!this._db) {
            return;
        }

        try {
            const canDirectPersist =
                this._db.quantumEncryption &&
                typeof this._db.quantumEncryption.encrypt === 'function' &&
                typeof this._db._putInStore === 'function';

            if (canDirectPersist) {
                const encrypted = await this._db.quantumEncryption.encrypt(signedEntry);

                await this._db._putInStore('audit_log', {
                    id: signedEntry.id,
                    data: encrypted,
                    timestamp: signedEntry.timestamp
                });

                return;
            }

            if (typeof this._db.saveQuantumEncrypted === 'function') {
                await this._db.saveQuantumEncrypted(
                    'audit_log',
                    signedEntry.id,
                    signedEntry,
                    { skipAudit: true }
                );
            }
        } catch (e) {
            Logger.warn('AuditLog', 'Failed to persist audit entry: ' + e.message);
        }
    }

    async getLogs(limit) {
        limit = limit || 100;

        return this._logs.slice(-limit).map(function (entry) {
            return Object.freeze(Object.assign({}, entry));
        });
    }

    async verifyIntegrity(id) {
        const entry = this._logs.find(function (item) {
            return item.id === id;
        });

        if (!entry || !Array.isArray(entry.signature)) {
            return false;
        }

        const payload = {
            id: entry.id,
            timestamp: entry.timestamp,
            action: entry.action,
            resource: entry.resource,
            data: entry.data || null,
            user: entry.user,
            signature: null
        };

        const hash = await this._hash(payload);

        if (!Array.isArray(hash)) {
            return false;
        }

        return hash.length === entry.signature.length &&
            hash.every(function (value, index) {
                return value === entry.signature[index];
            });
    }

    async getStats() {
        return Object.freeze({
            total: this._logs.length,
            max: this._maxLogs
        });
    }
}

// ============================================================
// BENCHMARK SUITE
// ============================================================
class BenchmarkSuite {
    constructor(db) {
        this._db = db;

        Logger.debug('BenchmarkSuite', 'Initialized');
    }

    async run() {
        const results = {};

        try {
            const startWrite = performance.now();

            for (let i = 0; i < 100; i++) {
                await this._db.saveQuantumEncrypted('benchmark', 'test' + i, {
                    value: i
                });
            }

            const writeDuration = performance.now() - startWrite || 1;

            results.writeSpeed = (100 / writeDuration) * 1000;
        } catch (e) {
            results.writeError = e.message;
        }

        try {
            const startRead = performance.now();

            for (let i = 0; i < 100; i++) {
                await this._db.getEncrypted('benchmark', 'test' + i);
            }

            const readDuration = performance.now() - startRead || 1;

            results.readSpeed = (100 / readDuration) * 1000;
        } catch (e) {
            results.readError = e.message;
        }

        try {
            const startQuery = performance.now();

            await this._db.executeQuery('SELECT * FROM benchmark WHERE value > 50');

            const queryDuration = performance.now() - startQuery || 1;

            results.querySpeed = (1 / queryDuration) * 1000;
        } catch (e) {
            results.queryError = e.message;
        }

        if (this._db.fts && typeof this._db.fts.search === 'function') {
            try {
                const startFTS = performance.now();

                await this._db.fts.search('test');

                const ftsDuration = performance.now() - startFTS || 1;

                results.ftsSpeed = (1 / ftsDuration) * 1000;
            } catch (e) {
                results.ftsError = e.message;
            }
        }

        if (this._db.vectorSearch && typeof this._db.vectorSearch.search === 'function') {
            try {
                const vec = Array(1536).fill(0.1);
                const startVector = performance.now();

                await this._db.vectorSearch.search(vec);

                const vectorDuration = performance.now() - startVector || 1;

                results.vectorSpeed = (1 / vectorDuration) * 1000;
            } catch (e) {
                results.vectorError = e.message;
            }
        }

        Logger.info('BenchmarkSuite', 'Benchmark completed');

        Notify.success('Benchmark', 'Benchmark completed');

        return results;
    }
}

export { MonitoringDashboard, AuditLog, BenchmarkSuite };

KESEMPATAN.KesDatabase.MonitoringDashboard = MonitoringDashboard;
KESEMPATAN.KesDatabase.AuditLog = AuditLog;
KESEMPATAN.KesDatabase.BenchmarkSuite = BenchmarkSuite;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('Monitor', 'Loaded');
}
