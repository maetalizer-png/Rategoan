import { DB_CONFIG } from './kes-dbconfig.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

export function generateId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }

    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

export function sleep(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

export class SmartCache {
    constructor(options) {
        options = options || {};
        this._store = new Map();
        this._maxSize = options.maxSize || 1000;
        this._ttl = options.ttl || DB_CONFIG.cacheTTL || 3600000;
        this._hits = 0;
        this._misses = 0;
    }

    get(key) {
        const entry = this._store.get(key);

        if (!entry) {
            this._misses++;
            return undefined;
        }

        if (Date.now() - entry.timestamp > this._ttl) {
            this._store.delete(key);
            this._misses++;
            return undefined;
        }

        // Refresh posisi (LRU) — Map di JS mempertahankan urutan insersi.
        this._store.delete(key);
        this._store.set(key, entry);
        this._hits++;

        return entry.value;
    }

    set(key, value) {
        if (this._store.has(key)) {
            this._store.delete(key);
        } else if (this._store.size >= this._maxSize) {
            const oldestKey = this._store.keys().next().value;
            this._store.delete(oldestKey);
        }

        this._store.set(key, { value: value, timestamp: Date.now() });
    }

    has(key) {
        return this.get(key) !== undefined;
    }

    delete(key) {
        return this._store.delete(key);
    }

    clear() {
        this._store.clear();
        this._hits = 0;
        this._misses = 0;
    }

    getStats() {
        const total = this._hits + this._misses;

        return Object.freeze({
            size: this._store.size,
            maxSize: this._maxSize,
            hits: this._hits,
            misses: this._misses,
            hitRate: total > 0 ? Math.round((this._hits / total) * 100) : 0
        });
    }
}

export const InternalLogger = (function () {
    const state = {
        logs: [],
        listeners: [],
        level: 1,
        maxLogs: 1000
    };

    const levels = Object.freeze({
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3,
        CRITICAL: 4
    });

    function log(level, module, message, data) {
        const entry = Object.freeze({
            id: generateId(),
            timestamp: Date.now(),
            level: level,
            module: module,
            message: message,
            data: data === undefined ? null : data
        });

        state.logs.push(entry);

        if (state.logs.length > state.maxLogs) {
            state.logs.shift();
        }

        for (const listener of state.listeners.slice()) {
            try {
                listener(entry);
            } catch (_) {
                // silent
            }
        }

        return entry;
    }

    return Object.freeze({
        _levels: levels,

        log: log,

        debug: function (module, message, data) {
            return log(levels.DEBUG, module, message, data);
        },

        info: function (module, message, data) {
            return log(levels.INFO, module, message, data);
        },

        warn: function (module, message, data) {
            return log(levels.WARN, module, message, data);
        },

        error: function (module, message, data) {
            return log(levels.ERROR, module, message, data);
        },

        critical: function (module, message, data) {
            return log(levels.CRITICAL, module, message, data);
        },

        subscribe: function (listener) {
            state.listeners.push(listener);

            return function () {
                const index = state.listeners.indexOf(listener);

                if (index > -1) {
                    state.listeners.splice(index, 1);
                }
            };
        },

        getLogs: function (level, limit) {
            const safeLimit = limit || 100;
            let result = state.logs;

            if (level !== undefined) {
                result = result.filter(function (entry) {
                    return entry.level >= level;
                });
            }

            return result.slice(-safeLimit);
        },

        clear: function () {
            state.logs.length = 0;
        },

        setLevel: function (level) {
            state.level = level;
        },

        getLevel: function () {
            return state.level;
        }
    });
})();

export const NotificationSystem = (function () {
    const state = {
        notifications: [],
        listeners: [],
        maxNotifications: 100
    };

    const types = Object.freeze({
        SUCCESS: 'success',
        INFO: 'info',
        WARNING: 'warning',
        ERROR: 'error',
        CRITICAL: 'critical'
    });

    function notify(type, title, message, details) {
        const notification = {
            id: generateId(),
            type: type,
            title: title,
            message: message,
            details: details === undefined ? null : details,
            timestamp: Date.now(),
            read: false
        };

        state.notifications.push(notification);

        if (state.notifications.length > state.maxNotifications) {
            state.notifications.shift();
        }

        const publicNotification = Object.freeze(Object.assign({}, notification));

        for (const listener of state.listeners.slice()) {
            try {
                listener(publicNotification);
            } catch (_) {
                // silent
            }
        }

        const levelMap = {
            success: 1,
            info: 1,
            warning: 2,
            error: 3,
            critical: 4
        };

        InternalLogger.log(
            levelMap[type] || 1,
            'Notification',
            title + ': ' + message
        );

        return publicNotification;
    }

    return Object.freeze({
        _types: types,

        notify: notify,

        success: function (title, message, details) {
            return notify(types.SUCCESS, title, message, details);
        },

        info: function (title, message, details) {
            return notify(types.INFO, title, message, details);
        },

        warning: function (title, message, details) {
            return notify(types.WARNING, title, message, details);
        },

        error: function (title, message, details) {
            return notify(types.ERROR, title, message, details);
        },

        critical: function (title, message, details) {
            return notify(types.CRITICAL, title, message, details);
        },

        subscribe: function (listener) {
            state.listeners.push(listener);

            return function () {
                const index = state.listeners.indexOf(listener);

                if (index > -1) {
                    state.listeners.splice(index, 1);
                }
            };
        },

        getNotifications: function (unreadOnly, limit) {
            const safeLimit = limit || 50;
            let result = state.notifications.slice();

            if (unreadOnly) {
                result = result.filter(function (notification) {
                    return !notification.read;
                });
            }

            return result.slice(-safeLimit).map(function (notification) {
                return Object.freeze(Object.assign({}, notification));
            });
        },

        markAsRead: function (id) {
            const notification = state.notifications.find(function (item) {
                return item.id === id;
            });

            if (notification) {
                notification.read = true;
            }
        },

        markAllAsRead: function () {
            for (const notification of state.notifications) {
                notification.read = true;
            }
        },

        clear: function () {
            state.notifications.length = 0;
        },

        getStats: function () {
            const total = state.notifications.length;

            const unread = state.notifications.filter(function (notification) {
                return !notification.read;
            }).length;

            const byType = {};

            for (const type of Object.values(types)) {
                byType[type] = state.notifications.filter(function (notification) {
                    return notification.type === type;
                }).length;
            }

            return Object.freeze({
                total: total,
                unread: unread,
                byType: byType
            });
        }
    });
})();

KESEMPATAN.KesDatabase.NotificationSystem = NotificationSystem;
KESEMPATAN.KesDatabase.SmartCache = SmartCache;
KESEMPATAN.KesDatabase.InternalLogger = InternalLogger;
KESEMPATAN.KesDatabase._dbUtils = Object.freeze({
    generateId: generateId,
    sleep: sleep
});

// Bare (not KESEMPATAN.InternalLogger, which is a separate logger owned by
// js/utils.js): dozens of unrelated files (country/data loaders, hitl.js,
// response-cache.js, etc.) read window.InternalLogger directly as a shared
// cross-cutting logger.
window.InternalLogger = InternalLogger;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('Helpers', 'Loaded');
}