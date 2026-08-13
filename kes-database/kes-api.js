import { DB_CONFIG } from './kes-dbconfig.js';
import { InternalLogger, NotificationSystem } from './kes-helpers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

const Config = DB_CONFIG;

const Logger = InternalLogger;

const Notify = NotificationSystem;

const utils = KESEMPATAN.KesDatabase._dbUtils || {};

const generateId = utils.generateId;

const sleep = utils.sleep || function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};

function createId() {
    if (typeof generateId === 'function') {
        return generateId();
    }

    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

async function getComponentStats(component) {
    if (!component || typeof component.getStats !== 'function') {
        return {};
    }

    const result = component.getStats();

    if (result && typeof result.then === 'function') {
        return await result;
    }

    return result;
}

function createCrdt() {
    if (typeof KESEMPATAN.KesDatabase.CRDT === 'function') {
        try {
            return new KESEMPATAN.KesDatabase.CRDT();
        } catch (_) {
            // fallback below
        }
    }

    return {
        id: createId(),
        operations: [],
        merge: function () {},
        getOperations: function () {
            return [];
        },
        getState: function () {
            return {};
        },
        reset: function () {}
    };
}

const DB_STORES = Object.freeze([
    'locations',
    'vector_memory',
    'version_data',
    'tenants',
    'snapshots',
    'graph_nodes',
    'graph_edges',
    'fts_index',
    'audit_log',
    'test_users',
    'users',
    'benchmark',
    'api_cache',
    'reports',
    'workflow_state',

    // ============================================================
    // v13 — write-behind mirror stores for growth-prone localStorage
    // keys (see mirrorHistoryItem/migrateLegacyArrayOnce below). Each
    // store just needs a record shape of { id, timestamp, ...payload }.
    // ============================================================
    'podcast_history',
    'rap_battle_history',
    'obs_trigger_history',
    'super_share_history',
    'prediction_history',
    'worker_logs',
    'optimizations',
    'support_tickets',
    'worker_stats',
    'theme_analytics',
    'predictions',
    'ai_core_knowledge',
    'rap_learning_data',
    'learning_data'
]);

// ============================================================
// FRAMEWORK HELPERS
// ============================================================
const FrameworkHelpers = Object.freeze({
    getDB: function () {
        return getDatabase();
    }
});

// ============================================================
// KESDATABASE - MAIN CLASS
// ============================================================
class KESDatabase {
    constructor() {
        this._dbName = Config.name || 'KESEMPATAN_OS_DB';
        this._version = Config.version || 1;
        this._db = null;
        this._isReady = false;
        this._initError = null;
        this._pendingQueue = [];
        this._offlineQueue = [];
        this._subscribers = [];
        this._startTime = Date.now();
        this._lazyLoaded = {};
        this._intervals = [];

        this._crdt = createCrdt();

        this._components = {
            quantumEncryption: KESEMPATAN.KesDatabase.QuantumEncryption || null,
            crdt: this._crdt,
            dataVersioning: null,
            snapshotManager: null,
            multiTenancy: null,
            vectorSearch: null,
            graphQuery: null,
            fts: null,
            geoQuery: null,
            timeSeries: null,
            queryParser: null,
            queryOptimizer: null,
            indexOptimizer: null,
            queryStream: null,
            monitoring: null,
            auditLog: null,
            benchmark: null,
            p2pSync: null,
            liveQuery: null,
            cloudBackup: null,
            graphQL: null,
            queryBuilder: null,
            playground: null,
            smartCache: null
        };

        this._startAutoBackup();
        this._startSync();
        this._startHealthChecks();

        Logger.info('KESDatabase', 'Constructed');
    }

    // ============================================================
    // LAZY LOADING
    // ============================================================
    _lazyLoad(name) {
        if (this._lazyLoaded[name]) {
            return this._components[name];
        }

        if (!Config.lazyLoad) {
            this._initComponent(name);
            this._lazyLoaded[name] = true;

            return this._components[name];
        }

        if (!this._components[name]) {
            this._initComponent(name);
            this._lazyLoaded[name] = true;
        }

        return this._components[name];
    }

    _initComponent(name) {
        switch (name) {
            case 'smartCache':
                if (!this._components.smartCache && typeof KESEMPATAN.KesDatabase.SmartCache === 'function') {
                    this._components.smartCache = new KESEMPATAN.KesDatabase.SmartCache();
                }
                break;

            case 'dataVersioning':
                if (!this._components.dataVersioning && typeof KESEMPATAN.KesDatabase.DataVersioning === 'function') {
                    this._components.dataVersioning = new KESEMPATAN.KesDatabase.DataVersioning(this);
                }
                break;

            case 'snapshotManager':
                if (!this._components.snapshotManager && typeof KESEMPATAN.KesDatabase.SnapshotManager === 'function') {
                    this._components.snapshotManager = new KESEMPATAN.KesDatabase.SnapshotManager(this);
                }
                break;

            case 'multiTenancy':
                if (!this._components.multiTenancy && typeof KESEMPATAN.KesDatabase.MultiTenancy === 'function') {
                    this._components.multiTenancy = new KESEMPATAN.KesDatabase.MultiTenancy(this);
                }
                break;

            case 'vectorSearch':
                if (!this._components.vectorSearch && typeof KESEMPATAN.KesDatabase.VectorSearch === 'function') {
                    this._components.vectorSearch = new KESEMPATAN.KesDatabase.VectorSearch(this);
                }
                break;

            case 'graphQuery':
                if (!this._components.graphQuery && typeof KESEMPATAN.KesDatabase.GraphQuery === 'function') {
                    this._components.graphQuery = new KESEMPATAN.KesDatabase.GraphQuery(this);
                }
                break;

            case 'fts':
                if (!this._components.fts && typeof KESEMPATAN.KesDatabase.FullTextSearch === 'function') {
                    this._components.fts = new KESEMPATAN.KesDatabase.FullTextSearch(this);
                }
                break;

            case 'geoQuery':
                if (!this._components.geoQuery && typeof KESEMPATAN.KesDatabase.GeospatialQuery === 'function') {
                    this._components.geoQuery = new KESEMPATAN.KesDatabase.GeospatialQuery(this, 'locations');
                }
                break;

            case 'timeSeries':
                if (!this._components.timeSeries && typeof KESEMPATAN.KesDatabase.TimeSeriesAnalytics === 'function') {
                    this._components.timeSeries = new KESEMPATAN.KesDatabase.TimeSeriesAnalytics(this);
                }
                break;

            case 'queryParser':
                if (!this._components.queryParser && typeof KESEMPATAN.KesDatabase.QueryParser === 'function') {
                    this._components.queryParser = new KESEMPATAN.KesDatabase.QueryParser(this);
                }
                break;

            case 'queryOptimizer':
                if (!this._components.queryOptimizer && typeof KESEMPATAN.KesDatabase.AIQueryOptimizer === 'function') {
                    this._components.queryOptimizer = new KESEMPATAN.KesDatabase.AIQueryOptimizer(this);
                }
                break;

            case 'indexOptimizer':
                if (!this._components.indexOptimizer && typeof KESEMPATAN.KesDatabase.IndexOptimizer === 'function') {
                    this._components.indexOptimizer = new KESEMPATAN.KesDatabase.IndexOptimizer(this);
                }
                break;

            case 'queryStream':
                if (!this._components.queryStream && typeof KESEMPATAN.KesDatabase.QueryStream === 'function') {
                    this._components.queryStream = new KESEMPATAN.KesDatabase.QueryStream(this);
                }
                break;

            case 'monitoring':
                if (!this._components.monitoring && typeof KESEMPATAN.KesDatabase.MonitoringDashboard === 'function') {
                    this._components.monitoring = new KESEMPATAN.KesDatabase.MonitoringDashboard(this);

                    this._components.monitoring.registerHealthCheck('database', {
                        check: async function () {
                            const info = await this.getStorageInfoEnhanced();

                            return {
                                status: 'ok',
                                details: info
                            };
                        }.bind(this)
                    });

                    this._components.monitoring.registerHealthCheck('cache', {
                        check: async function () {
                            const stats = this._components.smartCache
                                ? this._components.smartCache.getStats()
                                : { hitRate: 0 };

                            return {
                                status: stats.hitRate > 50 ? 'ok' : 'warning',
                                details: stats
                            };
                        }.bind(this)
                    });
                }
                break;

            case 'auditLog':
                if (!this._components.auditLog && typeof KESEMPATAN.KesDatabase.AuditLog === 'function') {
                    this._components.auditLog = new KESEMPATAN.KesDatabase.AuditLog(this);
                }
                break;

            case 'benchmark':
                if (!this._components.benchmark && typeof KESEMPATAN.KesDatabase.BenchmarkSuite === 'function') {
                    this._components.benchmark = new KESEMPATAN.KesDatabase.BenchmarkSuite(this);
                }
                break;

            case 'p2pSync':
                if (!this._components.p2pSync && typeof KESEMPATAN.KesDatabase.P2PSync === 'function') {
                    this._components.p2pSync = new KESEMPATAN.KesDatabase.P2PSync(this);
                }
                break;

            case 'liveQuery':
                if (!this._components.liveQuery && typeof KESEMPATAN.KesDatabase.LiveQuery === 'function') {
                    this._components.liveQuery = new KESEMPATAN.KesDatabase.LiveQuery(this);
                }
                break;

            case 'cloudBackup':
                if (!this._components.cloudBackup && typeof KESEMPATAN.KesDatabase.CloudBackup === 'function') {
                    this._components.cloudBackup = new KESEMPATAN.KesDatabase.CloudBackup(this);
                }
                break;

            case 'graphQL':
                if (!this._components.graphQL && typeof KESEMPATAN.KesDatabase.GraphQLAPI === 'function') {
                    this._components.graphQL = new KESEMPATAN.KesDatabase.GraphQLAPI(this);
                }
                break;

            case 'queryBuilder':
                if (!this._components.queryBuilder && typeof KESEMPATAN.KesDatabase.QueryBuilder === 'function') {
                    this._components.queryBuilder = new KESEMPATAN.KesDatabase.QueryBuilder(this);
                }
                break;

            case 'playground':
                if (!this._components.playground && typeof KESEMPATAN.KesDatabase.Playground === 'function') {
                    this._components.playground = new KESEMPATAN.KesDatabase.Playground(this);
                }
                break;

            default:
                Logger.warn('KESDatabase', 'Unknown component: ' + name);
        }
    }

    // ============================================================
    // PUBLIC ACCESSORS
    // ============================================================
    get quantumEncryption() {
        return this._components.quantumEncryption;
    }

    get crdt() {
        return this._crdt;
    }

    get smartCache() {
        return this._lazyLoad('smartCache');
    }

    get dataVersioning() {
        return this._lazyLoad('dataVersioning');
    }

    get snapshotManager() {
        return this._lazyLoad('snapshotManager');
    }

    get multiTenancy() {
        return this._lazyLoad('multiTenancy');
    }

    get vectorSearch() {
        return this._lazyLoad('vectorSearch');
    }

    get graphQuery() {
        return this._lazyLoad('graphQuery');
    }

    get fts() {
        return this._lazyLoad('fts');
    }

    get geoQuery() {
        return this._lazyLoad('geoQuery');
    }

    get timeSeries() {
        return this._lazyLoad('timeSeries');
    }

    get queryParser() {
        return this._lazyLoad('queryParser');
    }

    get queryOptimizer() {
        return this._lazyLoad('queryOptimizer');
    }

    get indexOptimizer() {
        return this._lazyLoad('indexOptimizer');
    }

    get queryStream() {
        return this._lazyLoad('queryStream');
    }

    get monitoring() {
        return this._lazyLoad('monitoring');
    }

    get auditLog() {
        return this._lazyLoad('auditLog');
    }

    get benchmark() {
        return this._lazyLoad('benchmark');
    }

    get p2pSync() {
        return this._lazyLoad('p2pSync');
    }

    get liveQuery() {
        return this._lazyLoad('liveQuery');
    }

    get cloudBackup() {
        return this._lazyLoad('cloudBackup');
    }

    get graphQL() {
        return this._lazyLoad('graphQL');
    }

    get queryBuilder() {
        return this._lazyLoad('queryBuilder');
    }

    get playground() {
        return this._lazyLoad('playground');
    }

    // ============================================================
    // INIT
    // ============================================================
    async init() {
        if (this._isReady) {
            return;
        }

        return new Promise(function (resolve, reject) {
            const request = indexedDB.open(this._dbName, this._version);

            request.onerror = function () {
                const error = request.error;

                this._initError = error;

                Logger.error('KESDatabase', 'Init failed: ' + error.message);
                Notify.error('Database Error', error.message);

                reject(error);
            }.bind(this);

            request.onblocked = function () {
                const error = new Error('Database open blocked');

                this._initError = error;

                Logger.error('KESDatabase', 'Database open blocked');
                Notify.error('Database Error', 'Database open blocked');

                reject(error);
            }.bind(this);

            request.onsuccess = function () {
                this._db = request.result;
                this._isReady = true;

                Logger.info('KESDatabase', 'Database ready');
                Notify.success('Database', 'Database ready');

                this._processQueue();

                resolve();
            }.bind(this);

            request.onupgradeneeded = function (event) {
                const db = event.target.result;

                for (const storeName of DB_STORES) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, {
                            keyPath: 'id'
                        });

                        store.createIndex('timestamp', 'timestamp');
                    }
                }

                Logger.info('KESDatabase', 'Database upgraded');
            }.bind(this);
        }.bind(this));
    }

    // ============================================================
    // CORE OPERATIONS
    // ============================================================
    _processQueue() {
        while (this._pendingQueue.length > 0) {
            const item = this._pendingQueue.shift();

            item.operation()
                .then(item.resolve)
                .catch(item.reject);
        }
    }

    async _waitForReady(timeout) {
        if (this._isReady) {
            return;
        }

        if (this._initError) {
            throw this._initError;
        }

        const safeTimeout = timeout || 10000;

        return new Promise(function (resolve, reject) {
            const started = Date.now();

            const timer = setInterval(function () {
                if (this._isReady) {
                    clearInterval(timer);
                    resolve();
                    return;
                }

                if (this._initError) {
                    clearInterval(timer);
                    reject(this._initError);
                    return;
                }

                if (Date.now() - started > safeTimeout) {
                    clearInterval(timer);
                    reject(new Error('Database initialization timeout'));
                }
            }.bind(this), 50);
        }.bind(this));
    }

    async _executeWithRetry(operation, context) {
        let lastError = null;

        for (let attempt = 1; attempt <= Config.maxRetries; attempt++) {
            try {
                await this._waitForReady();

                return await operation();
            } catch (error) {
                lastError = error;

                Logger.warn('KESDatabase', 'Attempt ' + attempt + ' failed: ' + error.message);

                if (this._components.monitoring) {
                    this._components.monitoring.metrics.errorCount++;
                }

                if (attempt < Config.maxRetries) {
                    await sleep(Config.retryDelay * attempt);
                }
            }
        }

        if (this._components.monitoring) {
            this._components.monitoring.addAlert('critical', 'Operation failed after retries', {
                context: context,
                error: lastError ? lastError.message : 'Unknown error'
            });
        }

        throw lastError;
    }

    async _executeQuery(query, params) {
        const parser = this._components.queryParser || this._lazyLoad('queryParser');

        if (!parser || typeof parser.parseAndExecute !== 'function') {
            return [];
        }

        return await parser.parseAndExecute(query, params || []);
    }

    // ============================================================
    // REPORTS — convenience wrapper di atas saveQuantumEncrypted()
    // ============================================================
    // FIX: dipanggil workflow.js sebagai appDatabase.saveReport(topic,
    // score, data) setelah agregasi selesai — method ini sebelumnya
    // TIDAK ADA sama sekali di kelas ini (store 'reports' sudah lama
    // terdaftar di DB_STORES, tapi belum pernah ada cara menulis ke
    // sana). Dibangun di atas saveQuantumEncrypted() yang sudah ada
    // supaya laporan ikut terenkripsi+audit log+live query notify,
    // konsisten dengan semua operasi tulis lain di kelas ini.
    async saveReport(topic, score, reportData) {
        const id = createId();
        const record = Object.assign({}, reportData || {}, {
            topic: topic,
            score: score
        });

        return await this.saveQuantumEncrypted('reports', id, record);
    }

    async getReports(limit) {
        // FIX: getAllFromStore() mengembalikan record MENTAH (field
        // `data` masih terenkripsi, karena saveReport() menulis lewat
        // saveQuantumEncrypted()) — didekripsi dulu di sini, meniru pola
        // yang sama persis dengan getEncrypted().
        const raw = await this.getAllFromStore('reports');
        const sorted = raw.sort(function (a, b) {
            return (b.timestamp || 0) - (a.timestamp || 0);
        });
        const limited = typeof limit === 'number' ? sorted.slice(0, limit) : sorted;

        if (!this.quantumEncryption || typeof this.quantumEncryption.decrypt !== 'function') {
            throw new Error('Encryption component unavailable');
        }

        const decrypted = [];
        for (const record of limited) {
            decrypted.push(await this.quantumEncryption.decrypt(record.data));
        }

        return decrypted;
    }

    // ============================================================
    // RESPONSE CACHE — convenience wrapper di atas saveQuantumEncrypted()
    // ============================================================
    // FIX: response-cache.js mengharapkan 5 method ini di appDatabase
    // (getCachedResponse/setCachedResponse/deleteCachedResponse/
    // clearCache/getAllCache) — sebelumnya TIDAK SATUPUN ada di kelas
    // ini (store 'api_cache' sudah lama terdaftar di DB_STORES, tapi
    // belum pernah ada cara baca/tulis ke sana), jadi getStats() yang
    // dipanggil auto-refresh tiap 10 detik selalu gagal. Dibangun
    // persis pola saveReport/getReports di atas — saveQuantumEncrypted/
    // getEncrypted/getAllFromStore/deleteRecord/_clearStore yang sudah
    // ada, supaya cache ikut terenkripsi+audit log, konsisten dgn
    // operasi tulis lain di kelas ini.
    async setCachedResponse(key, agentName, response) {
        const record = {
            agent: agentName,
            response: response,
            timestamp: Date.now()
        };

        return await this.saveQuantumEncrypted('api_cache', key, record);
    }

    async getCachedResponse(key) {
        // getEncrypted() sudah mengembalikan null kalau record tidak
        // ada — response-cache.js baca field `.response` dari hasilnya.
        const record = await this.getEncrypted('api_cache', key);
        return record ? record.response : null;
    }

    async deleteCachedResponse(key) {
        return await this.deleteRecord('api_cache', key);
    }

    async clearCache() {
        return await this._clearStore('api_cache');
    }

    async getAllCache() {
        // Sama pola dgn getReports(): getAllFromStore() mengembalikan
        // record MENTAH (field `data` masih terenkripsi), didekripsi
        // dulu di sini. `key` & `timestamp` dari wrapper luar ikut
        // disertakan (bukan cuma payload) — dipakai response-cache.js
        // utk tampilkan daftar cache & hitung statistik (total/valid/
        // ukuran/daftar agen).
        const raw = await this.getAllFromStore('api_cache');

        if (!this.quantumEncryption || typeof this.quantumEncryption.decrypt !== 'function') {
            throw new Error('Encryption component unavailable');
        }

        const result = [];
        for (const record of raw) {
            const decrypted = await this.quantumEncryption.decrypt(record.data);
            result.push(Object.assign({}, decrypted, {
                key: record.id,
                timestamp: decrypted.timestamp || record.timestamp
            }));
        }

        return result;
    }

    async saveQuantumEncrypted(storeName, id, data, options) {
        const opts = options || {};

        return this._executeWithRetry(async function () {
            if (!this.quantumEncryption || typeof this.quantumEncryption.encrypt !== 'function') {
                throw new Error('Encryption component unavailable');
            }

            const encrypted = await this.quantumEncryption.encrypt(data);

            const record = Object.freeze({
                id: id,
                data: encrypted,
                timestamp: Date.now()
            });

            await this._putInStore(storeName, record);

            const shouldAudit =
                Config.auditLogEnabled &&
                !opts.skipAudit &&
                storeName !== 'audit_log';

            if (shouldAudit) {
                const auditLog = this._components.auditLog || this._lazyLoad('auditLog');

                if (auditLog && typeof auditLog.log === 'function') {
                    await auditLog.log('create', storeName, { id: id }, 'system');
                }
            }

            if (Config.liveQueryEnabled && storeName !== 'audit_log') {
                const liveQuery = this._components.liveQuery || this._lazyLoad('liveQuery');

                if (liveQuery && typeof liveQuery.notifyChange === 'function') {
                    await liveQuery.notifyChange();
                }
            }

            return record;
        }.bind(this), 'saveQuantumEncrypted');
    }

    async getEncrypted(storeName, id) {
        return this._executeWithRetry(async function () {
            const record = await this._getFromStore(storeName, id);

            if (!record) {
                return null;
            }

            if (!this.quantumEncryption || typeof this.quantumEncryption.decrypt !== 'function') {
                throw new Error('Encryption component unavailable');
            }

            if (Config.auditLogEnabled && storeName !== 'audit_log') {
                const auditLog = this._components.auditLog || this._lazyLoad('auditLog');

                if (auditLog && typeof auditLog.log === 'function') {
                    await auditLog.log('read', storeName, { id: id }, 'system');
                }
            }

            return await this.quantumEncryption.decrypt(record.data);
        }.bind(this), 'getEncrypted');
    }

    async _putInStore(storeName, record) {
        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            store.put(record);

            tx.oncomplete = function () {
                resolve(record);
            };

            tx.onerror = function () {
                reject(tx.error);
            };

            tx.onabort = function () {
                reject(tx.error);
            };
        }.bind(this));
    }

    async _getFromStore(storeName, id) {
        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.get(id);

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        }.bind(this));
    }

    async getAllFromStore(storeName) {
        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeName, 'readonly');
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = function () {
                resolve(request.result);
            };

            request.onerror = function () {
                reject(request.error);
            };
        }.bind(this));
    }

    async bulkInsert(storeName, records) {
        return this._executeWithRetry(async function () {
            const tx = this._db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            for (const record of records) {
                store.put(record);
            }

            await new Promise(function (resolve, reject) {
                tx.oncomplete = function () {
                    resolve();
                };

                tx.onerror = function () {
                    reject(tx.error);
                };

                tx.onabort = function () {
                    reject(tx.error);
                };
            });

            if (Config.auditLogEnabled && storeName !== 'audit_log') {
                const auditLog = this._components.auditLog || this._lazyLoad('auditLog');

                if (auditLog && typeof auditLog.log === 'function') {
                    await auditLog.log('create', storeName, { count: records.length }, 'system');
                }
            }

            return records.length;
        }.bind(this), 'bulkInsert');
    }

    async deleteRecord(storeName, id) {
        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);

            store.delete(id);

            tx.oncomplete = async function () {
                if (Config.auditLogEnabled && storeName !== 'audit_log') {
                    const auditLog = this._components.auditLog || this._lazyLoad('auditLog');

                    if (auditLog && typeof auditLog.log === 'function') {
                        try {
                            await auditLog.log('delete', storeName, { id: id }, 'system');
                        } catch (_) {
                            // silent
                        }
                    }
                }

                resolve();
            }.bind(this);

            tx.onerror = function () {
                reject(tx.error);
            };

            tx.onabort = function () {
                reject(tx.error);
            };
        }.bind(this));
    }

    async exportAllData() {
        const stores = Array.from(this._db.objectStoreNames);
        const data = {};

        for (const store of stores) {
            data[store] = await this.getAllFromStore(store);
        }

        return data;
    }

    async importAllData(data) {
        for (const [store, records] of Object.entries(data)) {
            if (this._db.objectStoreNames.contains(store)) {
                await this.bulkInsert(store, records);
            }
        }
    }

    async _getStorageInfo() {
        return Object.freeze({
            name: this._dbName,
            schemaVersion: this._version,
            stores: Array.from(this._db.objectStoreNames)
        });
    }

    async getStorageInfoEnhanced() {
        const base = await this._getStorageInfo();

        const cacheStats = this._components.smartCache
            ? this._components.smartCache.getStats()
            : {};

        const vectorStats = await getComponentStats(this._components.vectorSearch);
        const graphStats = await getComponentStats(this._components.graphQuery);
        const optimizerStats = await getComponentStats(this._components.queryOptimizer);
        const indexStats = await getComponentStats(this._components.indexOptimizer);
        const versionStats = await getComponentStats(this._components.dataVersioning);
        const tenantStats = await getComponentStats(this._components.multiTenancy);
        const snapshotStats = await getComponentStats(this._components.snapshotManager);
        const monitorStats = await getComponentStats(this._components.monitoring);
        const p2pStats = await getComponentStats(this._components.p2pSync);
        const streamStats = await getComponentStats(this._components.queryStream);
        const tsStats = await getComponentStats(this._components.timeSeries);
        const geoStats = await getComponentStats(this._components.geoQuery);
        const ftsStats = await getComponentStats(this._components.fts);
        const auditStats = await getComponentStats(this._components.auditLog);
        const liveStats = await getComponentStats(this._components.liveQuery);

        let storageEstimate = null;

        if (navigator.storage && navigator.storage.estimate) {
            try {
                const estimate = await navigator.storage.estimate();

                storageEstimate = {
                    usage: Math.round(estimate.usage / 1024 / 1024 * 100) / 100,
                    quota: Math.round(estimate.quota / 1024 / 1024 * 100) / 100,
                    percentage: Math.round((estimate.usage / estimate.quota) * 100)
                };
            } catch (_) {
                // silent
            }
        }

        return Object.freeze({
            name: base.name,
            schemaVersion: base.schemaVersion,
            stores: base.stores,
            storageEstimate: storageEstimate,
            offlineQueue: this._offlineQueue.length,
            subscribers: this._subscribers.length,
            pendingQueue: this._pendingQueue.length,
            crdtId: this._crdt.id,
            crdtOperations: this._crdt.operations.length,
            encryption: 'PBKDF2 + AES-256-GCM',
            compression: 'RLE-Advanced',
            fts: Config.ftsEnabled,
            vector: Config.vectorEnabled,
            graph: Config.graphEnabled,
            geo: Config.geoEnabled,
            timeseries: Config.timeseriesEnabled,
            ml: Config.mlEnabled,
            p2p: Config.p2pEnabled,
            biometric: Config.biometricEnabled,
            quantumResistant: Config.quantumResistant,
            edge: Config.edgeEnabled,
            versioning: Config.versioningEnabled,
            snapshot: Config.snapshotEnabled,
            multiTenant: Config.multiTenantEnabled,
            streaming: Config.streamingEnabled,
            lazyLoad: Config.lazyLoad,
            auditLog: Config.auditLogEnabled,
            liveQuery: Config.liveQueryEnabled,
            transaction: Config.transactionEnabled,
            webWorker: Config.webWorkerEnabled,
            cache: cacheStats,
            vectorStats: vectorStats,
            graphStats: graphStats,
            timeSeriesStats: tsStats,
            geoStats: geoStats,
            optimizer: optimizerStats,
            indexOptimizer: indexStats,
            versioningStats: versionStats,
            tenantStats: tenantStats,
            snapshotStats: snapshotStats,
            monitorStats: monitorStats,
            p2pStats: p2pStats,
            streamStats: streamStats,
            ftsStats: ftsStats,
            auditStats: auditStats,
            liveStats: liveStats,
            uptime: Date.now() - this._startTime
        });
    }

    // ============================================================
    // AUTO-BACKUP, SYNC, HEALTH CHECKS
    // ============================================================
    _startAutoBackup() {
        const intervalId = setInterval(async function () {
            if (!this._isReady) {
                return;
            }

            try {
                if (!this.quantumEncryption || typeof this.quantumEncryption.encrypt !== 'function') {
                    throw new Error('Encryption component unavailable');
                }

                const backup = await this.exportAllData();
                const encrypted = await this.quantumEncryption.encrypt(backup);
                const backupKey = 'kes_auto_backup_' + Date.now();

                localStorage.setItem(backupKey, JSON.stringify(encrypted));

                const keys = Object.keys(localStorage).filter(function (key) {
                    return key.indexOf('kes_auto_backup_') === 0;
                });

                if (keys.length > Config.maxBackups) {
                    keys.sort();

                    const toDelete = keys.slice(0, keys.length - Config.maxBackups);

                    for (const key of toDelete) {
                        localStorage.removeItem(key);
                    }
                }

                Logger.info('KESDatabase', 'Auto-backup completed');
            } catch (error) {
                Logger.warn('KESDatabase', 'Auto-backup failed: ' + error.message);

                if (this._components.monitoring) {
                    this._components.monitoring.addAlert('warning', 'Auto-backup failed: ' + error.message);
                }
            }
        }.bind(this), Config.autoBackupInterval || 86400000);

        this._intervals.push(intervalId);
    }

    _startSync() {
        if (typeof WebSocket === 'undefined') {
            return;
        }

        const intervalId = setInterval(function () {
            this._sync();
        }.bind(this), Config.syncInterval || 30000);

        this._intervals.push(intervalId);
    }

    async _sync() {
        if (this._offlineQueue.length === 0) {
            return;
        }

        try {
            if (Config.p2pEnabled && this._components.p2pSync && this._components.p2pSync._roomId) {
                await this._components.p2pSync.broadcast({
                    type: 'sync',
                    operations: this._offlineQueue.splice(0, 100)
                });

                return;
            }

            if (typeof WebSocket === 'undefined') {
                return;
            }

            const syncUrl = Config.syncServerUrl || 'wss://api.kesempatan.com/sync';
            const ws = new WebSocket(syncUrl);
            const ops = this._offlineQueue.splice(0, 100);

            ws.onopen = function () {
                ws.send(JSON.stringify({
                    type: 'sync',
                    operations: ops,
                    clientId: this._crdt.id
                }));
            }.bind(this);

            ws.onmessage = function (event) {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch (error) {
                    Logger.warn('KESDatabase', 'Malformed sync frame ignored: ' + error.message);
                    return;
                }

                if (data.type === 'sync_ack') {
                    this._crdt.merge(data.operations || []);
                    this._notify('sync', {
                        source: 'server',
                        data: data.operations
                    });

                    ws.close();
                }
            }.bind(this);

            ws.onerror = function () {
                this._offlineQueue.unshift.apply(this._offlineQueue, ops);

                Logger.warn('KESDatabase', 'Sync failed, requeued');
            }.bind(this);
        } catch (error) {
            Logger.warn('KESDatabase', 'Sync error: ' + error.message);
        }
    }

    _startHealthChecks() {
        const intervalId = setInterval(async function () {
            const monitoring = this._components.monitoring || this._lazyLoad('monitoring');

            if (monitoring && typeof monitoring.runHealthChecks === 'function') {
                await monitoring.runHealthChecks();
            }
        }.bind(this), 60000);

        this._intervals.push(intervalId);
    }

    // ============================================================
    // SUBSCRIPTION
    // ============================================================
    _notify(event, data) {
        for (const subscriber of this._subscribers) {
            if (subscriber.event === event) {
                try {
                    subscriber.callback(data);
                } catch (error) {
                    Logger.warn('KESDatabase', 'Subscriber error: ' + error.message);
                }
            }
        }
    }

    subscribe(event, callback) {
        this._subscribers.push({
            event: event,
            callback: callback
        });

        return function () {
            const index = this._subscribers.findIndex(function (subscriber) {
                return subscriber.callback === callback;
            });

            if (index > -1) {
                this._subscribers.splice(index, 1);
            }
        }.bind(this);
    }

    // ============================================================
    // PUBLIC HELPERS
    // ============================================================
    async executeQuery(query, params) {
        const parser = this._components.queryParser || this._lazyLoad('queryParser');

        if (!parser || typeof parser.parseAndExecute !== 'function') {
            throw new Error('Query parser unavailable');
        }

        // SAMBUNGKAN SmartCache ke jalur query sungguhan (Juli 2026 — kelas
        // sudah ada dari sesi sebelumnya, tapi cuma getStats()/clear() yang
        // dipanggil, TIDAK PERNAH get()/set() — jadi statistiknya SELALU 0
        // hit, tidak ada manfaat nyata). HANYA query SELECT (baca) yang
        // di-cache — INSERT/UPDATE/DELETE (tulis) SENGAJA TIDAK PERNAH
        // di-cache, supaya operasi tulis selalu benar-benar dieksekusi,
        // tidak pernah "dilewati" krn kena entri cache lama (itu akan jadi
        // bug kehilangan data yang serius kalau sampai terjadi).
        const trimmed = (query || '').trim().toUpperCase();
        const isCacheable = trimmed.startsWith('SELECT');
        const cache = this._components.smartCache || this._lazyLoad('smartCache');

        if (isCacheable && cache && typeof cache.get === 'function') {
            const cacheKey = query + '|' + JSON.stringify(params || []);
            const cached = cache.get(cacheKey);
            if (cached !== undefined) {
                return cached;
            }
            const result = await parser.parseAndExecute(query, params || []);
            cache.set(cacheKey, result);
            return result;
        }

        return await parser.parseAndExecute(query, params || []);
    }

    getLogs(level, limit) {
        if (window.InternalLogger && typeof window.InternalLogger.getLogs === 'function') {
            return window.InternalLogger.getLogs(level, limit);
        }

        return [];
    }

    getNotifications(unreadOnly, limit) {
        if (KESEMPATAN.KesDatabase.NotificationSystem && typeof KESEMPATAN.KesDatabase.NotificationSystem.getNotifications === 'function') {
            return KESEMPATAN.KesDatabase.NotificationSystem.getNotifications(unreadOnly, limit);
        }

        return [];
    }

    // ============================================================
    // SELF-HEALING
    // ============================================================
    async selfHeal() {
        try {
            const warnings = [];

            for (const store of DB_STORES) {
                try {
                    await this.getAllFromStore(store);
                } catch (error) {
                    warnings.push(store);

                    Logger.warn('KESDatabase', 'Store check failed: ' + store);

                    if (this._components.monitoring) {
                        this._components.monitoring.addAlert('warning', 'Store check failed: ' + store);
                    }
                }
            }

            if (this._pendingQueue.length > 1000) {
                this._pendingQueue.length = 0;
            }

            if (this._offlineQueue.length > Config.maxOfflineQueue) {
                this._offlineQueue = this._offlineQueue.slice(-Config.maxOfflineQueue);
            }

            if (this._components.monitoring) {
                await this._components.monitoring.runHealthChecks();
            }

            Notify.success('Self-Healing', 'Self-healing completed');

            return {
                success: warnings.length === 0,
                message: 'Self-healing completed',
                warnings: warnings
            };
        } catch (error) {
            Notify.error('Self-Healing', 'Failed: ' + error.message);

            return {
                success: false,
                error: error.message
            };
        }
    }

    // ============================================================
    // CLEANUP & DESTROY
    // ============================================================
    async cleanup() {
        if (this._components.smartCache && typeof this._components.smartCache.clear === 'function') {
            this._components.smartCache.clear();
        }

        this._offlineQueue.length = 0;
        this._pendingQueue.length = 0;
        this._subscribers.length = 0;

        if (KESEMPATAN.KesDatabase.NotificationSystem && typeof KESEMPATAN.KesDatabase.NotificationSystem.clear === 'function') {
            KESEMPATAN.KesDatabase.NotificationSystem.clear();
        }

        if (window.InternalLogger && typeof window.InternalLogger.clear === 'function') {
            window.InternalLogger.clear();
        }

        if (this._components.monitoring && Array.isArray(this._components.monitoring._alerts)) {
            this._components.monitoring._alerts.length = 0;
        }

        Logger.info('KESDatabase', 'Cleanup completed');

        Notify.success('Cleanup', 'Database cleanup completed');
    }

    async destroy() {
        await this.cleanup();

        for (const intervalId of this._intervals) {
            clearInterval(intervalId);
        }

        this._intervals.length = 0;

        if (this._db) {
            const stores = Array.from(this._db.objectStoreNames);

            for (const store of stores) {
                await this._clearStore(store);
            }

            this._db.close();

            this._db = null;
            this._isReady = false;
        }

        Logger.info('KESDatabase', 'Database destroyed');

        Notify.warning('Destroy', 'Database has been destroyed');
    }

    async _clearStore(storeName) {
        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeName, 'readwrite');
            const store = tx.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = function () {
                resolve();
            };

            request.onerror = function () {
                reject(request.error);
            };
        }.bind(this));
    }

    // ============================================================
    // TRANSACTION & BATCH
    // ============================================================
    async transaction(storeNames, callback) {
        if (!Config.transactionEnabled) {
            throw new Error('Transactions disabled');
        }

        return new Promise(function (resolve, reject) {
            const tx = this._db.transaction(storeNames, 'readwrite');

            Promise.resolve()
                .then(function () {
                    return callback(tx);
                })
                .then(function (result) {
                    tx.oncomplete = function () {
                        resolve(result);
                    };

                    tx.onerror = function () {
                        reject(tx.error);
                    };

                    tx.onabort = function () {
                        reject(tx.error);
                    };
                })
                .catch(function (error) {
                    try {
                        tx.abort();
                    } catch (_) {
                        // ignore
                    }

                    reject(error);
                });
        }.bind(this));
    }

    async batch(operations) {
        const results = [];

        for (const op of operations) {
            if (op.type === 'save') {
                results.push(await this.saveQuantumEncrypted(op.store, op.id, op.data));
            } else if (op.type === 'delete') {
                results.push(await this.deleteRecord(op.store, op.id));
            } else if (op.type === 'query') {
                results.push(await this.executeQuery(op.query, op.params));
            }
        }

        return results;
    }
}

// ============================================================
// SINGLETON
// ============================================================
let dbInstance = null;

async function getDatabase() {
    if (!dbInstance) {
        dbInstance = new KESDatabase();

        await dbInstance.init();
    }

    return dbInstance;
}

// ============================================================
// LOCALSTORAGE -> INDEXEDDB WRITE-BEHIND MIRROR
//
// localStorage stays the source of truth for every existing
// synchronous read — nothing about those call sites changes.
// These two helpers only ever ADD a durable, effectively-unbounded
// copy in IndexedDB on top:
//   - mirrorHistoryItem(): call right after a localStorage write,
//     fire-and-forget. Never throws; a failure here just means
//     that one entry didn't get backed up, localStorage is
//     unaffected either way.
//   - migrateLegacyArrayOnce(): run once (per storeName) to copy
//     whatever's already sitting in localStorage into IndexedDB the
//     first time this code runs on a given browser, guarded by a
//     localStorage flag so it never re-runs.
// ============================================================
async function mirrorHistoryItem(storeName, item) {
    if (!window.KESDatabase || window.KESDatabase._isDummy || typeof window.KESDatabase.bulkInsert !== 'function') {
        return;
    }
    try {
        const record = Object.assign({ id: createId(), timestamp: Date.now() }, item);
        await window.KESDatabase.bulkInsert(storeName, [record]);
    } catch (error) {
        Logger.warn('KesDatabase', 'Mirror to "' + storeName + '" failed: ' + error.message);
    }
}

// For data that's a single evolving snapshot (worker stats, learning
// weights, etc.) rather than an append-only history — always writes to
// the same fixed id, so it stays one record instead of growing forever.
async function mirrorSnapshot(storeName, data) {
    if (!window.KESDatabase || window.KESDatabase._isDummy || typeof window.KESDatabase.bulkInsert !== 'function') {
        return;
    }
    try {
        const record = Object.assign({ id: 'current', timestamp: Date.now() }, data);
        await window.KESDatabase.bulkInsert(storeName, [record]);
    } catch (error) {
        Logger.warn('KesDatabase', 'Snapshot mirror to "' + storeName + '" failed: ' + error.message);
    }
}

// Lower-level variant for callers who already have the array in memory
// (e.g. a module whose "legacy" data lives inside a combined state blob
// rather than directly under one localStorage key).
async function migrateArrayOnce(storeName, items) {
    const flagKey = 'kes_idb_migrated_' + storeName;
    if (localStorage.getItem(flagKey)) {
        return;
    }
    if (!window.KESDatabase || window.KESDatabase._isDummy || typeof window.KESDatabase.bulkInsert !== 'function') {
        return;
    }
    try {
        if (items && items.length > 0) {
            const records = items.map(function (item) {
                return Object.assign({ id: createId(), timestamp: Date.now() }, item);
            });
            await window.KESDatabase.bulkInsert(storeName, records);
            Logger.info('KesDatabase', 'Migrated ' + records.length + ' legacy entries into "' + storeName + '"');
        }
        localStorage.setItem(flagKey, '1');
    } catch (error) {
        Logger.warn('KesDatabase', 'Legacy migration for "' + storeName + '" failed: ' + error.message);
    }
}

async function migrateLegacyArrayOnce(storeName, localStorageKey, extractItems) {
    const flagKey = 'kes_idb_migrated_' + storeName;
    if (localStorage.getItem(flagKey)) {
        return;
    }
    if (!window.KESDatabase || window.KESDatabase._isDummy || typeof window.KESDatabase.bulkInsert !== 'function') {
        return;
    }
    try {
        const raw = localStorage.getItem(localStorageKey);
        const items = raw ? extractItems(JSON.parse(raw)) : [];
        if (items.length > 0) {
            const records = items.map(function (item) {
                return Object.assign({ id: createId(), timestamp: Date.now() }, item);
            });
            await window.KESDatabase.bulkInsert(storeName, records);
            Logger.info('KesDatabase', 'Migrated ' + records.length + ' legacy entries into "' + storeName + '"');
        }
        localStorage.setItem(flagKey, '1');
    } catch (error) {
        Logger.warn('KesDatabase', 'Legacy migration for "' + storeName + '" failed: ' + error.message);
    }
}

async function migrateLegacySnapshotOnce(storeName, localStorageKey) {
    const flagKey = 'kes_idb_migrated_' + storeName;
    if (localStorage.getItem(flagKey)) {
        return;
    }
    if (!window.KESDatabase || window.KESDatabase._isDummy || typeof window.KESDatabase.bulkInsert !== 'function') {
        return;
    }
    try {
        const raw = localStorage.getItem(localStorageKey);
        if (raw) {
            await mirrorSnapshot(storeName, JSON.parse(raw));
            Logger.info('KesDatabase', 'Migrated legacy snapshot into "' + storeName + '"');
        }
        localStorage.setItem(flagKey, '1');
    } catch (error) {
        Logger.warn('KesDatabase', 'Legacy snapshot migration for "' + storeName + '" failed: ' + error.message);
    }
}

export {
    KESDatabase, getDatabase, FrameworkHelpers,
    mirrorHistoryItem, mirrorSnapshot,
    migrateLegacyArrayOnce, migrateArrayOnce, migrateLegacySnapshotOnce
};

KESEMPATAN.KesDatabase.KESDatabaseEngine = KESDatabase;
KESEMPATAN.KesDatabase.getDatabase = getDatabase;
KESEMPATAN.KesDatabase.FrameworkHelpers = FrameworkHelpers;
// GraphQLAPI/QueryBuilder/Playground now live in kes-api-playground.js —
// they attach themselves to KESEMPATAN.KesDatabase the same way, so the
// lazy-load checks above (typeof KESEMPATAN.KesDatabase.GraphQLAPI ===
// 'function') keep working unchanged regardless of which file set them.
KESEMPATAN.KesDatabase.mirrorHistoryItem = mirrorHistoryItem;
KESEMPATAN.KesDatabase.mirrorSnapshot = mirrorSnapshot;
KESEMPATAN.KesDatabase.migrateLegacyArrayOnce = migrateLegacyArrayOnce;
KESEMPATAN.KesDatabase.migrateArrayOnce = migrateArrayOnce;
KESEMPATAN.KesDatabase.migrateLegacySnapshotOnce = migrateLegacySnapshotOnce;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('API', 'Loaded');
}
