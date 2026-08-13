// Static imports (in dependency order) replace the old runtime
// document.createElement('script') loader: the ES module graph itself now
// guarantees kes-dbconfig.js -> kes-helpers.js -> ... -> kes-api-playground.js
// finish evaluating, in this order, before any code below runs.
import './kes-dbconfig.js';
import './kes-helpers.js';
import './kes-security.js';
import './kes-search.js';
import './kes-monitor.js';
import './kes-sync.js';
import { getDatabase } from './kes-api.js';
import './kes-api-playground.js';
import { Utils } from '../js/utils.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

const Logger = Utils.Logger;

function createFallbackDatabase() {
    return {
        _isDummy: true,
        executeQuery: function () {
            return Promise.resolve([]);
        },
        saveQuantumEncrypted: function () {
            return Promise.resolve(null);
        },
        saveReport: function () {
            return Promise.resolve(null);
        },
        getReports: function () {
            return Promise.resolve([]);
        },
        getEncrypted: function () {
            return Promise.resolve(null);
        },
        getAllFromStore: function () {
            return Promise.resolve([]);
        },
        bulkInsert: function () {
            return Promise.resolve(0);
        },
        deleteRecord: function () {
            return Promise.resolve();
        },
        exportAllData: function () {
            return Promise.resolve({});
        },
        importAllData: function () {
            return Promise.resolve();
        },
        getStorageInfoEnhanced: function () {
            return Promise.resolve({
                stores: [],
                storageEstimate: null
            });
        },
        subscribe: function () {
            return function () {};
        },
        selfHeal: function () {
            return Promise.resolve({
                success: false,
                message: 'Database unavailable'
            });
        },
        cleanup: function () {
            return Promise.resolve();
        },
        destroy: function () {
            return Promise.resolve();
        }
    };
}

// ============================================================
// DATABASE READY HANDLER
// ============================================================
function handleDatabaseReady(dbInstance) {
    const safeDb = dbInstance || createFallbackDatabase();

    window.KESDatabase = safeDb;
    window.kesDatabase = safeDb;
    window.db = safeDb;

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('database-ready', {
            detail: safeDb
        }));
    }

    if (typeof window._onDatabaseReady === 'function') {
        window._onDatabaseReady(safeDb);
    }

    Logger.info('DatabaseEntry', 'Database instance exposed');
}

// ============================================================
// DATABASE ERROR HANDLER
// ============================================================
function handleBootstrapError(error) {
    Logger.error('DatabaseEntry', 'Database bootstrap failed: ' + error.message);

    const fallback = createFallbackDatabase();

    window.KESDatabase = fallback;
    window.kesDatabase = fallback;
    window.db = fallback;

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('database-error', {
            detail: error
        }));

        document.dispatchEvent(new CustomEvent('database-ready', {
            detail: fallback
        }));
    }

    if (typeof window._onDatabaseReady === 'function') {
        window._onDatabaseReady(fallback);
    }
}

function bootstrapDatabase() {
    if (typeof getDatabase !== 'function') {
        handleBootstrapError(new Error('Database initializer unavailable'));
        return;
    }

    getDatabase()
        .then(handleDatabaseReady)
        .catch(handleBootstrapError);
}

bootstrapDatabase();