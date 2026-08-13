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
// P2P SYNC
// ============================================================
class P2PSync {
    constructor(db) {
        this._db = db;
        this._roomId = null;
        this._broadcastChannel = null;
        this._ws = null;
        this._signalingWs = null;
        this._onMessage = null;
        this._peerConnections = new Map();
        this._dataChannels = new Map();
        this._signalingUrl = Config.signalingServerUrl || 'wss://signaling.kesempatan.com';

        Logger.debug('P2PSync', 'Initialized');
    }

    async connectSignaling() {
        if (this._signalingWs && this._signalingWs.readyState === WebSocket.OPEN) {
            return;
        }

        if (typeof WebSocket === 'undefined') {
            throw new Error('WebSocket unavailable');
        }

        this._signalingWs = new WebSocket(this._signalingUrl);

        this._signalingWs.onmessage = function (e) {
            const msg = JSON.parse(e.data);

            if (msg.type === 'offer' || msg.type === 'answer' || msg.type === 'candidate') {
                this._handleSignalingMessage(msg);
            } else {
                if (this._onMessage) {
                    this._onMessage(msg);
                }
            }
        }.bind(this);

        await new Promise(function (resolve, reject) {
            this._signalingWs.onopen = resolve;
            this._signalingWs.onerror = reject;
        }.bind(this));
    }

    async _handleSignalingMessage(msg) {
        if (typeof RTCPeerConnection === 'undefined') {
            Logger.warn('P2PSync', 'RTCPeerConnection unavailable');
            return;
        }

        if (msg.type === 'offer') {
            const pc = new RTCPeerConnection();

            pc.onicecandidate = function (e) {
                if (e.candidate && this._signalingWs) {
                    this._signalingWs.send(JSON.stringify({
                        type: 'candidate',
                        candidate: e.candidate,
                        room: this._roomId
                    }));
                }
            }.bind(this);

            pc.ondatachannel = function (e) {
                const dc = e.channel;

                dc.onmessage = function (ev) {
                    if (this._onMessage) {
                        this._onMessage(JSON.parse(ev.data));
                    }
                }.bind(this);

                this._dataChannels.set('remote', dc);
            }.bind(this);

            await pc.setRemoteDescription(new RTCSessionDescription(msg.offer));

            const answer = await pc.createAnswer();

            await pc.setLocalDescription(answer);

            this._peerConnections.set('remote', pc);

            if (this._signalingWs) {
                this._signalingWs.send(JSON.stringify({
                    type: 'answer',
                    answer: answer,
                    room: this._roomId
                }));
            }
        } else if (msg.type === 'answer') {
            const pc = this._peerConnections.get('local');

            if (pc) {
                await pc.setRemoteDescription(new RTCSessionDescription(msg.answer));
            }
        } else if (msg.type === 'candidate') {
            const pc = this._peerConnections.get('local') || this._peerConnections.get('remote');

            if (pc) {
                await pc.addIceCandidate(new RTCIceCandidate(msg.candidate));
            }
        }
    }

    async createRoom(roomId) {
        this._roomId = roomId || 'kes_room_' + createId();

        if (typeof BroadcastChannel !== 'undefined') {
            this._broadcastChannel = new BroadcastChannel(this._roomId);

            this._broadcastChannel.onmessage = function (e) {
                if (this._onMessage) {
                    this._onMessage(e.data);
                }
            }.bind(this);
        }

        if (typeof WebSocket !== 'undefined') {
            this._ws = new WebSocket('wss://api.kesempatan.com/sync');

            this._ws.onmessage = function (e) {
                const msg = JSON.parse(e.data);

                if (this._onMessage) {
                    this._onMessage(msg);
                }
            }.bind(this);
        }

        try {
            await this.connectSignaling();

            if (typeof RTCPeerConnection !== 'undefined') {
                const pc = new RTCPeerConnection();
                const dc = pc.createDataChannel('sync');

                dc.onmessage = function (e) {
                    if (this._onMessage) {
                        this._onMessage(JSON.parse(e.data));
                    }
                }.bind(this);

                const offer = await pc.createOffer();

                await pc.setLocalDescription(offer);

                this._peerConnections.set('local', pc);
                this._dataChannels.set('local', dc);

                if (this._signalingWs) {
                    this._signalingWs.send(JSON.stringify({
                        type: 'offer',
                        offer: offer,
                        room: this._roomId
                    }));
                }

                Notify.info('P2P Sync', 'Room created with signaling: ' + this._roomId);
            } else {
                Notify.warning('P2P Sync', 'WebRTC unavailable, using fallback transport');
            }
        } catch (e) {
            Notify.warning('P2P Sync', 'Signaling unavailable, using fallback transport');
        }

        return this._roomId;
    }

    async joinRoom(roomId) {
        this._roomId = roomId;

        if (typeof BroadcastChannel !== 'undefined') {
            this._broadcastChannel = new BroadcastChannel(roomId);

            this._broadcastChannel.onmessage = function (e) {
                if (this._onMessage) {
                    this._onMessage(e.data);
                }
            }.bind(this);

            Notify.info('P2P Sync', 'Joined room: ' + roomId);

            return true;
        }

        return false;
    }

    async broadcast(data) {
        if (this._broadcastChannel) {
            this._broadcastChannel.postMessage(data);
            return;
        }

        if (this._ws && this._ws.readyState === WebSocket.OPEN) {
            this._ws.send(JSON.stringify({
                room: this._roomId,
                payload: data
            }));
            return;
        }

        for (const dc of this._dataChannels.values()) {
            if (dc.readyState === 'open') {
                dc.send(JSON.stringify(data));
            }
        }
    }

    onMessage(callback) {
        this._onMessage = callback;
    }

    disconnect() {
        if (this._broadcastChannel) {
            this._broadcastChannel.close();
            this._broadcastChannel = null;
        }

        if (this._ws) {
            this._ws.close();
            this._ws = null;
        }

        if (this._signalingWs) {
            this._signalingWs.close();
            this._signalingWs = null;
        }

        for (const pc of this._peerConnections.values()) {
            pc.close();
        }

        this._peerConnections.clear();
        this._dataChannels.clear();

        Notify.info('P2P Sync', 'Disconnected');
    }

    getStats() {
        return Object.freeze({
            roomId: this._roomId,
            hasBroadcast: !!this._broadcastChannel,
            hasWebSocket: !!this._ws,
            hasSignaling: !!this._signalingWs,
            peerConnections: this._peerConnections.size,
            dataChannels: this._dataChannels.size
        });
    }
}

// ============================================================
// LIVE QUERY
// ============================================================
class LiveQuery {
    constructor(db) {
        this._db = db;
        this._listeners = new Map();
        this._observers = new Map();

        Logger.debug('LiveQuery', 'Initialized');
    }

    subscribe(query, callback) {
        const id = createId();

        this._listeners.set(id, {
            query: query,
            callback: callback
        });

        this._db.executeQuery(query).then(function (result) {
            callback(result);
        });

        if (typeof MutationObserver !== 'undefined' && typeof document !== 'undefined') {
            const observer = new MutationObserver(function () {
                this._db.executeQuery(query).then(function (result) {
                    callback(result);
                });
            }.bind(this));

            observer.observe(document, {
                childList: true,
                subtree: true,
                attributes: false
            });

            this._observers.set(id, observer);
        } else {
            const interval = setInterval(function () {
                this._db.executeQuery(query).then(function (result) {
                    callback(result);
                });
            }.bind(this), 3000);

            this._observers.set(id, interval);
        }

        return function () {
            if (this._observers.has(id)) {
                const obs = this._observers.get(id);

                if (obs && typeof obs.disconnect === 'function') {
                    obs.disconnect();
                } else if (typeof obs === 'number') {
                    clearInterval(obs);
                }

                this._observers.delete(id);
            }

            this._listeners.delete(id);
        }.bind(this);
    }

    async notifyChange() {
        for (const listener of this._listeners.values()) {
            try {
                const result = await this._db.executeQuery(listener.query);
                listener.callback(result);
            } catch (e) {
                Logger.warn('LiveQuery', 'Listener error: ' + e.message);
            }
        }
    }

    getStats() {
        return Object.freeze({
            active: this._listeners.size
        });
    }
}

// ============================================================
// CLOUD BACKUP
// ============================================================
class CloudBackup {
    constructor(db) {
        this._db = db;

        Logger.debug('CloudBackup', 'Initialized');
    }

    async _exportEncrypted() {
        if (!this._db.quantumEncryption || typeof this._db.quantumEncryption.encrypt !== 'function') {
            throw new Error('Encryption component unavailable');
        }

        const data = await this._db.exportAllData();

        return await this._db.quantumEncryption.encrypt(data);
    }

    async backupToS3(bucket, key, config) {
        try {
            const encrypted = await this._exportEncrypted();
            const json = JSON.stringify(encrypted);

            if (typeof AWS !== 'undefined') {
                const s3 = new AWS.S3(config);

                await s3.putObject({
                    Bucket: bucket,
                    Key: key,
                    Body: json
                }).promise();

                Notify.success('Cloud Backup', 'Backup to S3 successful: ' + bucket + '/' + key);

                return {
                    success: true
                };
            }

            Notify.warning('Cloud Backup', 'AWS SDK not loaded');

            return {
                success: false,
                message: 'AWS SDK not loaded'
            };
        } catch (e) {
            Notify.error('Cloud Backup', 'S3 backup failed: ' + e.message);

            return {
                success: false,
                message: e.message
            };
        }
    }

    async backupToFirebase(collection, config) {
        try {
            const encrypted = await this._exportEncrypted();

            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();

                await db.collection(collection).doc('backup').set({
                    data: encrypted,
                    timestamp: Date.now()
                });

                Notify.success('Cloud Backup', 'Backup to Firebase successful');

                return {
                    success: true
                };
            }

            Notify.warning('Cloud Backup', 'Firebase not available');

            return {
                success: false,
                message: 'Firebase not available'
            };
        } catch (e) {
            Notify.error('Cloud Backup', 'Firebase backup failed: ' + e.message);

            return {
                success: false,
                message: e.message
            };
        }
    }

    async backupToIPFS(config) {
        try {
            const encrypted = await this._exportEncrypted();

            if (typeof IpfsHttpClient !== 'undefined') {
                const ipfs = IpfsHttpClient.create(config);
                const result = await ipfs.add(JSON.stringify(encrypted));

                Notify.success('Cloud Backup', 'Backup to IPFS successful, CID: ' + result.cid);

                return {
                    success: true,
                    cid: result.cid
                };
            }

            Notify.warning('Cloud Backup', 'IPFS client not available');

            return {
                success: false,
                message: 'IPFS client not available'
            };
        } catch (e) {
            Notify.error('Cloud Backup', 'IPFS backup failed: ' + e.message);

            return {
                success: false,
                message: e.message
            };
        }
    }

    async restoreFromCloud(source, config) {
        config = config || {};

        try {
            let encrypted = null;

            if (source === 's3') {
                if (typeof AWS === 'undefined') {
                    Notify.warning('Cloud Backup', 'AWS SDK not loaded');
                    return { success: false, message: 'AWS SDK not loaded' };
                }

                const s3 = new AWS.S3(config);
                const result = await s3.getObject({
                    Bucket: config.bucket,
                    Key: config.key
                }).promise();

                encrypted = JSON.parse(result.Body.toString());
            } else if (source === 'firebase') {
                if (typeof firebase === 'undefined' || !firebase.firestore) {
                    Notify.warning('Cloud Backup', 'Firebase not available');
                    return { success: false, message: 'Firebase not available' };
                }

                const db = firebase.firestore();
                const doc = await db.collection(config.collection).doc('backup').get();

                if (!doc.exists) {
                    Notify.warning('Cloud Backup', 'No backup found in Firebase collection: ' + config.collection);
                    return { success: false, message: 'No backup found' };
                }

                encrypted = doc.data().data;
            } else if (source === 'ipfs') {
                if (typeof IpfsHttpClient === 'undefined') {
                    Notify.warning('Cloud Backup', 'IPFS client not available');
                    return { success: false, message: 'IPFS client not available' };
                }

                const ipfs = IpfsHttpClient.create(config);
                const chunks = [];

                for await (const chunk of ipfs.cat(config.cid)) {
                    chunks.push(chunk);
                }

                encrypted = JSON.parse(new TextDecoder().decode(
                    chunks.reduce(function (acc, chunk) {
                        const merged = new Uint8Array(acc.length + chunk.length);
                        merged.set(acc);
                        merged.set(chunk, acc.length);
                        return merged;
                    }, new Uint8Array(0))
                ));
            } else {
                return { success: false, message: 'Unknown source: ' + source + ' (expected s3, firebase, or ipfs)' };
            }

            if (!this._db.quantumEncryption || typeof this._db.quantumEncryption.decrypt !== 'function') {
                throw new Error('Encryption component unavailable');
            }

            const data = await this._db.quantumEncryption.decrypt(encrypted);

            await this._db.importAllData(data);

            Notify.success('Cloud Backup', 'Restore from ' + source + ' successful');

            return { success: true };
        } catch (e) {
            Notify.error('Cloud Backup', 'Restore from ' + source + ' failed: ' + e.message);

            return {
                success: false,
                message: e.message
            };
        }
    }
}

export { P2PSync, LiveQuery, CloudBackup };

KESEMPATAN.KesDatabase.P2PSync = P2PSync;
KESEMPATAN.KesDatabase.LiveQuery = LiveQuery;
KESEMPATAN.KesDatabase.CloudBackup = CloudBackup;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('Sync', 'Loaded');
}
