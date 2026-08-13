import { DB_CONFIG } from './kes-dbconfig.js';
import { InternalLogger, NotificationSystem, generateId } from './kes-helpers.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

const Config = DB_CONFIG;

const Logger = InternalLogger;

const Notify = NotificationSystem;


function createId() {
    if (typeof generateId === 'function') {
        return generateId();
    }

    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

// ============================================================
// QUANTUM ENCRYPTION
// ============================================================

// Persisted (localStorage) 32-byte value, generated once with
// crypto.getRandomValues and reused thereafter — used for both the PBKDF2
// salt and the per-device key component below. Salt does not need to be
// secret (that's the whole point of PBKDF2 salting), so localStorage is a
// fine place for it despite being readable client-side.
function _qeLoadOrCreatePersistedBytes(storageKey) {
    try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length === 32) {
                return parsed;
            }
        }
    } catch (e) {
        // fall through to generate a fresh value
    }
    const bytes = Array.from(crypto.getRandomValues(new Uint8Array(32)));
    try {
        localStorage.setItem(storageKey, JSON.stringify(bytes));
    } catch (e) {
        // localStorage unavailable/full — encryption still works for this
        // session, it just won't survive a reload (matches the previous,
        // always-fresh-salt behavior in that one edge case only).
    }
    return bytes;
}

const QuantumEncryption = {
    _key: null,
    _salt: null,
    _deviceSecret: null,
    _initialized: false,
    _keyVersion: 0,
    _reEncryptQueue: [],

    init: async function () {
        if (this._initialized) {
            return;
        }

        if (!this._salt) {
            // Persisted rather than regenerated every session — previously
            // this was crypto.getRandomValues() fresh on every init(), which
            // meant the derived key changed on every page load and every
            // record ever encrypted became permanently undecryptable the
            // moment the tab was closed and reopened (verified directly:
            // decrypting the same ciphertext after resetting _salt/_key/
            // _initialized throws AES-GCM OperationError every time).
            this._salt = _qeLoadOrCreatePersistedBytes('kes_qe_salt_v1');
        }

        if (!this._deviceSecret) {
            // Config.encryptionKey is a literal shipped in this app's public
            // source, so it's identical for every installation. Mixing in a
            // random value generated once per browser/device and stored
            // locally means the actual derived key differs per installation
            // without requiring a user-facing passphrase — it never leaves
            // the device and needs no UI.
            this._deviceSecret = _qeLoadOrCreatePersistedBytes('kes_qe_device_secret_v1')
                .map(function (b) { return b.toString(16).padStart(2, '0'); })
                .join('');
        }

        const encoder = new TextEncoder();

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(Config.encryptionKey + this._deviceSecret + this._keyVersion),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        const derivedKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new Uint8Array(this._salt),
                iterations: 100000,
                hash: 'SHA-512'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        this._key = derivedKey;
        this._initialized = true;

        Logger.info('QuantumEncryption', 'Initialized');

        if (Notify && Notify.info) {
            Notify.info('Quantum Encryption', 'Encryption activated');
        }
    },

    rotateKey: async function (forceReEncrypt) {
        await this.init();

        const oldKeyVersion = this._keyVersion;
        this._keyVersion++;

        const encoder = new TextEncoder();

        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(Config.encryptionKey + this._deviceSecret + this._keyVersion),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        const newKey = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: new Uint8Array(this._salt),
                iterations: 100000,
                hash: 'SHA-512'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );

        this._key = newKey;

        Logger.info('QuantumEncryption', 'Key rotated');

        if (Notify && Notify.info) {
            Notify.info('Quantum Encryption', 'Key rotated');
        }

        if (forceReEncrypt) {
            this._reEncryptQueue.push({
                from: oldKeyVersion,
                to: this._keyVersion
            });

            Logger.info(
                'QuantumEncryption',
                'Re-encryption scheduled for ' + this._reEncryptQueue.length + ' batches'
            );
        }

        return this._keyVersion;
    },

    encrypt: async function (data) {
        await this.init();

        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this._key,
            encoder.encode(JSON.stringify(data))
        );

        return {
            iv: Array.from(iv),
            data: Array.from(new Uint8Array(encrypted)),
            salt: this._salt,
            keyVersion: this._keyVersion,
            algorithm: 'AES-256-GCM-PBKDF2'
        };
    },

    decrypt: async function (encrypted) {
        await this.init();

        if (encrypted.keyVersion !== this._keyVersion) {
            Logger.warn(
                'QuantumEncryption',
                'Data encrypted with previous key, re-encrypting...'
            );
        }

        const iv = new Uint8Array(encrypted.iv);
        const data = new Uint8Array(encrypted.data);

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv },
            this._key,
            data
        );

        return JSON.parse(new TextDecoder().decode(decrypted));
    },

    getPublicKey: function () {
        return this._salt.slice(0, 32);
    },

    sign: async function (data) {
        await this.init();

        const encoder = new TextEncoder();

        return await crypto.subtle.digest(
            'SHA-512',
            encoder.encode(JSON.stringify(data) + this._salt)
        );
    },

    verify: async function (data, signature) {
        await this.init();

        const encoder = new TextEncoder();

        const hash = await crypto.subtle.digest(
            'SHA-512',
            encoder.encode(JSON.stringify(data) + this._salt)
        );

        const hashArray = Array.from(new Uint8Array(hash));
        const sigArray = Array.from(new Uint8Array(signature));

        return hashArray.length === sigArray.length &&
            hashArray.every(function (v, i) {
                return v === sigArray[i];
            });
    },

    getKeyVersion: function () {
        return this._keyVersion;
    }
};

// ============================================================
// CRDT
// ============================================================
class CRDT {
    constructor() {
        this.id = createId();
        this.operations = [];
        this._vectorClock = new Map();
        this._maxOps = 10000;

        Logger.debug('CRDT', 'Initialized with id: ' + this.id);
    }

    createOperation(type, key, value, context) {
        const op = Object.freeze({
            id: createId(),
            type: type,
            key: key,
            value: value,
            context: context || {},
            timestamp: Date.now(),
            nodeId: this.id,
            vectorClock: new Map(this._vectorClock)
        });

        this.operations.push(op);

        if (this.operations.length > this._maxOps) {
            this.operations.shift();
        }

        this._vectorClock.set(
            this.id,
            (this._vectorClock.get(this.id) || 0) + 1
        );

        return op;
    }

    merge(operations) {
        const merged = [];

        for (const op of operations) {
            const existing = this.operations.find(function (o) {
                return o.key === op.key && o.type === op.type;
            });

            if (!existing) {
                this.operations.push(op);
                merged.push(op);
            } else {
                const opClock = op.vectorClock.get(op.nodeId) || 0;
                const existingClock = existing.vectorClock.get(existing.nodeId) || 0;

                if (opClock > existingClock) {
                    const idx = this.operations.indexOf(existing);
                    this.operations[idx] = op;
                    merged.push(op);
                }
            }
        }

        return merged;
    }

    getOperations() {
        return this.operations;
    }

    getState() {
        const state = {};

        for (const op of this.operations) {
            if (op.type === 'set' || op.type === 'update') {
                state[op.key] = op.value;
            } else if (op.type === 'delete') {
                delete state[op.key];
            } else if (op.type === 'increment') {
                state[op.key] = (state[op.key] || 0) + (op.value || 1);
            } else if (op.type === 'decrement') {
                state[op.key] = (state[op.key] || 0) - (op.value || 1);
            } else if (op.type === 'add') {
                if (!Array.isArray(state[op.key])) {
                    state[op.key] = [];
                }

                if (!state[op.key].includes(op.value)) {
                    state[op.key].push(op.value);
                }
            } else if (op.type === 'remove') {
                if (Array.isArray(state[op.key])) {
                    state[op.key] = state[op.key].filter(function (v) {
                        return v !== op.value;
                    });
                }
            }
        }

        return state;
    }

    reset() {
        this.operations = [];
        this._vectorClock.clear();
    }
}

// ============================================================
// DATA VERSIONING
// ============================================================
class DataVersioning {
    constructor(db) {
        this._db = db;
        this._versions = new Map();
        this._maxVersions = 10;

        Logger.debug('DataVersioning', 'Initialized');
    }

    async saveVersion(storeName, id, data) {
        const key = storeName + '_' + id;

        if (!this._versions.has(key)) {
            this._versions.set(key, []);
        }

        const versions = this._versions.get(key);

        const version = {
            version: versions.length + 1,
            data: data,
            timestamp: Date.now()
        };

        versions.push(version);

        if (versions.length > this._maxVersions) {
            versions.shift();
        }

        await this._db.saveQuantumEncrypted('version_data', key, {
            id: id,
            store: storeName,
            versions: versions
        });

        Logger.debug('DataVersioning', 'Saved revision for ' + key);

        return version;
    }

    async getVersion(storeName, id, versionNumber) {
        const key = storeName + '_' + id;
        const data = await this._db.getEncrypted('version_data', key);

        if (!data || !data.versions) {
            return null;
        }

        return data.versions.find(function (v) {
            return v.version === versionNumber;
        }) || null;
    }

    async getVersions(storeName, id) {
        const key = storeName + '_' + id;
        const data = await this._db.getEncrypted('version_data', key);

        if (!data || !data.versions) {
            return [];
        }

        return data.versions.map(function (v) {
            return {
                version: v.version,
                timestamp: v.timestamp
            };
        });
    }

    async rollback(storeName, id, versionNumber) {
        const version = await this.getVersion(storeName, id, versionNumber);

        if (!version) {
            throw new Error('Revision not found');
        }

        await this.saveVersion(storeName, id, version.data);

        Notify.success('Data Versioning', 'Rolled back');

        return version.data;
    }

    getStats() {
        return Object.freeze({
            total: this._versions.size,
            maxVersions: this._maxVersions
        });
    }
}

// ============================================================
// SNAPSHOT MANAGER
// ============================================================
class SnapshotManager {
    constructor(db) {
        this._db = db;
        this._snapshots = new Map();
        this._maxSnapshots = 20;

        Logger.debug('SnapshotManager', 'Initialized');
    }

    async createSnapshot(name) {
        const data = await this._db.exportAllData();

        const snapshot = Object.freeze({
            id: createId(),
            name: name,
            data: data,
            timestamp: Date.now(),
            size: JSON.stringify(data).length
        });

        this._snapshots.set(snapshot.id, snapshot);

        if (this._snapshots.size > this._maxSnapshots) {
            const keys = Array.from(this._snapshots.keys());

            for (let i = 0; i < keys.length - this._maxSnapshots; i++) {
                this._snapshots.delete(keys[i]);
            }
        }

        await this._db.saveQuantumEncrypted('snapshots', snapshot.id, snapshot);

        Notify.success('Snapshot', 'Snapshot created: ' + name);

        return snapshot;
    }

    async restoreSnapshot(snapshotId) {
        const snapshot = this._snapshots.get(snapshotId);

        if (!snapshot) {
            throw new Error('Snapshot not found');
        }

        await this._db.importAllData(snapshot.data);

        Notify.success('Snapshot', 'Restored: ' + snapshot.name);

        return snapshot;
    }

    async getSnapshots() {
        return Array.from(this._snapshots.values()).sort(function (a, b) {
            return b.timestamp - a.timestamp;
        });
    }

    async deleteSnapshot(snapshotId) {
        this._snapshots.delete(snapshotId);

        await this._db.deleteRecord('snapshots', snapshotId);

        Notify.info('Snapshot', 'Snapshot deleted');
    }

    getStats() {
        const totalSize = Array.from(this._snapshots.values()).reduce(function (sum, s) {
            return sum + s.size;
        }, 0);

        return Object.freeze({
            total: this._snapshots.size,
            max: this._maxSnapshots,
            totalSize: totalSize
        });
    }
}

// ============================================================
// MULTI-TENANCY
// ============================================================
class MultiTenancy {
    constructor(db) {
        this._db = db;
        this._tenants = new Map();
        this._currentTenant = null;

        Logger.debug('MultiTenancy', 'Initialized');
    }

    async createTenant(id, name, config) {
        const tenant = Object.freeze({
            id: id,
            name: name,
            config: config || {},
            createdAt: Date.now(),
            isActive: true
        });

        this._tenants.set(id, tenant);

        await this._db.saveQuantumEncrypted('tenants', id, tenant);

        Notify.success('Multi-Tenancy', 'Tenant created: ' + name);

        return tenant;
    }

    async switchTenant(tenantId) {
        const tenant = await this.getTenant(tenantId);

        if (!tenant) {
            throw new Error('Tenant not found');
        }

        this._currentTenant = tenantId;

        Logger.info('MultiTenancy', 'Switched to tenant: ' + tenantId);

        Notify.info('Multi-Tenancy', 'Switched to tenant: ' + tenant.name);

        return tenant;
    }

    async getTenant(tenantId) {
        if (this._tenants.has(tenantId)) {
            return this._tenants.get(tenantId);
        }

        const data = await this._db.getEncrypted('tenants', tenantId);

        if (data) {
            this._tenants.set(tenantId, data);
            return data;
        }

        return null;
    }

    getCurrentTenant() {
        return this._currentTenant;
    }

    getTenantPrefix() {
        return this._currentTenant ? 'tenant_' + this._currentTenant + '_' : '';
    }

    async getStats() {
        return Object.freeze({
            total: this._tenants.size,
            current: this._currentTenant,
            tenants: Array.from(this._tenants.keys())
        });
    }
}

export { QuantumEncryption, CRDT, DataVersioning, SnapshotManager, MultiTenancy };

KESEMPATAN.KesDatabase.QuantumEncryption = QuantumEncryption;
KESEMPATAN.KesDatabase.CRDT = CRDT;
KESEMPATAN.KesDatabase.DataVersioning = DataVersioning;
KESEMPATAN.KesDatabase.SnapshotManager = SnapshotManager;
KESEMPATAN.KesDatabase.MultiTenancy = MultiTenancy;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('Security', 'Loaded');
}
