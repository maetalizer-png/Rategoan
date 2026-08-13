import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

export const FederatedLearning = {
    _globalWeights: {
        agentPreferences: {},
        agentWeights: {},
        qTable: {}
    },

    _isInitialized: false,
    _isProcessing: false,
    _hasProcessed: false,
    _isReady: false,
    _batchSize: 25,
    _delay: 300,
    _maxItems: 250,
    _initDelay: 7000,
    _pendingData: [],

    // ============================================================
    // INIT
    // ============================================================
    init: function () {
        if (this._isInitialized) {
            return;
        }

        this._isInitialized = true;

        Logger.info('FederatedLearning', 'Initialized, scheduled to start later');

        setTimeout(function () {
            this._startProcessing();
        }.bind(this), this._initDelay);
    },

    // ============================================================
    // PROCESS DATA
    // ============================================================
    _startProcessing: function () {
        if (this._isProcessing || this._hasProcessed) {
            return;
        }

        this._isProcessing = true;

        Logger.info('FederatedLearning', 'Processing started');

        const allData = this._pendingData.length > 0
            ? this._pendingData
            : this._getLocalData();

        const totalItems = Math.min(allData.length, this._maxItems);

        if (totalItems === 0) {
            this._isProcessing = false;
            this._hasProcessed = true;
            this._isReady = true;

            Logger.info('FederatedLearning', 'No data to process');

            return;
        }

        Logger.info('FederatedLearning', totalItems + ' items queued');

        let processed = 0;

        const processBatch = function () {
            const batch = allData.slice(processed, processed + this._batchSize);

            this._processBatch(batch);

            processed += batch.length;

            const progress = Math.round((processed / totalItems) * 100);

            this._updateProgress(progress, processed, totalItems);

            if (processed < totalItems) {
                setTimeout(processBatch.bind(this), this._delay);
            } else {
                this._isProcessing = false;
                this._hasProcessed = true;
                this._isReady = true;

                Logger.info('FederatedLearning', 'Processing completed');

                this._notifyComplete();

                this._pendingData = [];
            }
        }.bind(this);

        setTimeout(processBatch, 500);
    },

    // ============================================================
    // PROCESS ONE BATCH
    // ============================================================
    _processBatch: function (batch) {
        if (!Array.isArray(batch)) {
            return;
        }

        const preferences = this._globalWeights.agentPreferences;
        const weights = this._globalWeights.agentWeights;

        for (const item of batch) {
            const metadata = item && item.metadata ? item.metadata : {};

            if (metadata.agentPreferences) {
                for (const agent in metadata.agentPreferences) {
                    if (!preferences[agent]) {
                        preferences[agent] = {
                            likes: 0,
                            dislikes: 0
                        };
                    }

                    preferences[agent].likes += metadata.agentPreferences[agent].likes || 0;
                    preferences[agent].dislikes += metadata.agentPreferences[agent].dislikes || 0;
                }
            }

            if (metadata.agentWeights) {
                for (const agent in metadata.agentWeights) {
                    weights[agent] = (weights[agent] || 0) + (metadata.agentWeights[agent] || 0);
                }
            }
        }
    },

    // ============================================================
    // GET LOCAL DATA
    // ============================================================
    _getLocalData: function () {
        try {
            if (window.VectorMemory && Array.isArray(window.VectorMemory.vectors)) {
                return window.VectorMemory.vectors;
            }

            return [];
        } catch (error) {
            return [];
        }
    },

    // ============================================================
    // PROGRESS UPDATE
    // ============================================================
    _updateProgress: function (progress, processed, total) {
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('federated:progress', {
                detail: {
                    progress: progress,
                    processed: processed,
                    total: total
                }
            }));
        }
    },

    // ============================================================
    // COMPLETE NOTIFICATION
    // ============================================================
    _notifyComplete: function () {
        if (typeof document !== 'undefined') {
            document.dispatchEvent(new CustomEvent('federated:complete', {
                detail: {
                    timestamp: Date.now()
                }
            }));
        }

        if (window.Utils && typeof window.Utils.showToast === 'function') {
            window.Utils.showToast('Federated Learning ready', 'success');
        }
    },

    // ============================================================
    // STORAGE HELPERS
    // ============================================================
    _getStorageItem: function (key) {
        try {
            if (typeof localStorage === 'undefined') {
                return null;
            }

            return localStorage.getItem(key);
        } catch (error) {
            return null;
        }
    },

    _setStorageItem: function (key, value) {
        try {
            if (typeof localStorage === 'undefined') {
                return false;
            }

            localStorage.setItem(key, value);

            return true;
        } catch (error) {
            return false;
        }
    },

    // ============================================================
    // PUBLIC API
    // ============================================================
    sync: async function (learningData) {
        if (!Config.FEDERATED_LEARNING_ENABLED) {
            return false;
        }

        if (!this._isInitialized || !this._isReady) {
            this._pendingData.push(learningData);

            if (!this._isInitialized) {
                this.init();
            }

            return true;
        }

        try {
            if (typeof fetch !== 'function') {
                this._pendingData.push(learningData);

                return false;
            }

            const userId = this._getUserId();

            const localWeights = {
                agentPreferences: learningData.agentPreferences || {},
                agentWeights: learningData.agentWeights || {},
                qTable: learningData.qTable || {}
            };

            const apiServerUrl = this._getStorageItem('kes_api_server_url') || 'http://localhost:3456';
            const apiKey = this._getStorageItem('kes_api_key_real') || '';

            if (!apiKey) {
                Logger.warn('FederatedLearning', 'API key unavailable, sync delayed');

                this._pendingData.push(learningData);

                return false;
            }

            const response = await fetch(apiServerUrl + '/federated/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-API-Key': apiKey
                },
                body: JSON.stringify({
                    userId: userId,
                    localWeights: localWeights
                })
            });

            if (!response.ok) {
                Logger.warn('FederatedLearning', 'Sync failed with status ' + response.status);

                return false;
            }

            const cloudData = await response.json();

            if (cloudData && cloudData.success && cloudData.weights) {
                const globalWeights = cloudData.weights;

                const LOCAL_WEIGHT = 0.6;
                const CLOUD_WEIGHT = 0.4;

                if (globalWeights.agentPreferences) {
                    for (const agent in globalWeights.agentPreferences) {
                        if (localWeights.agentPreferences[agent]) {
                            const local = localWeights.agentPreferences[agent];
                            const cloud = globalWeights.agentPreferences[agent];

                            local.likes = local.likes * LOCAL_WEIGHT + cloud.likes * CLOUD_WEIGHT;
                            local.dislikes = local.dislikes * LOCAL_WEIGHT + cloud.dislikes * CLOUD_WEIGHT;
                        }
                    }
                }

                if (globalWeights.qTable) {
                    for (const key in globalWeights.qTable) {
                        if (!localWeights.qTable[key]) {
                            localWeights.qTable[key] = globalWeights.qTable[key];
                        } else {
                            localWeights.qTable[key] = localWeights.qTable[key] * 0.7 + globalWeights.qTable[key] * 0.3;
                        }
                    }
                }

                this._globalWeights = globalWeights;

                Logger.info('FederatedLearning', 'Sync completed');

                return true;
            }

            return false;
        } catch (error) {
            Logger.warn('FederatedLearning', 'Sync failed: ' + error.message);

            this._pendingData.push(learningData);

            return false;
        }
    },

    _getUserId: function () {
        try {
            let userId = this._getStorageItem('kes_user_id');

            if (!userId) {
                userId = 'user_' + Date.now().toString(36);

                this._setStorageItem('kes_user_id', userId);
            }

            return userId;
        } catch (error) {
            return 'anonymous_' + Date.now().toString(36);
        }
    },

    getGlobalWeights: function () {
        return this._globalWeights;
    },

    getStatus: function () {
        return {
            initialized: this._isInitialized,
            processing: this._isProcessing,
            done: this._hasProcessed,
            ready: this._isReady,
            dataCount: this._getLocalData().length,
            pendingData: this._pendingData.length
        };
    },

    forceProcess: function () {
        if (!this._hasProcessed && !this._isProcessing) {
            this._startProcessing();

            return true;
        }

        return false;
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        FederatedLearning.init();
    });
} else {
    FederatedLearning.init();
}

KESEMPATAN.Memory.FederatedLearning = FederatedLearning;

Logger.info('MemoryLearning', 'Federated Learning loaded');
