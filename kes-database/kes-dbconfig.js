const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.KesDatabase = KESEMPATAN.KesDatabase || {};

export const DB_CONFIG = Object.freeze({
    // ============================================================
    // KONTRAK FROZEN — penahan data IndexedDB
    // JANGAN rename 'name' tanpa migration antar-database
    // (data lama tidak ikut pindah otomatis).
    // 'version' = skema IndexedDB; naikkan HANYA lewat
    // onupgradeneeded, jangan untuk alasan kosmetik.
    // ============================================================
    name: 'KESEMPATAN_OS_DB',
    // v13: added stores for the localStorage->IndexedDB write-behind
    // mirror (report/podcast/rap-battle/observation/social-share/
    // prediction history, worker logs/stats/knowledge, theme analytics,
    // support tickets, and learning data) — see DB_STORES in kes-api.js.
    version: 13,
    capacity: '10GB+',
    cacheTTL: 3600000,
    maxRetries: 5,
    retryDelay: 100,
    bulkSize: 5000,
    // ============================================================
    // === ZONA MERAH ===
    // JANGAN ganti string ini sembarangan. Karena salt+key diturunkan
    // dari string ini, menggantinya = SEMUA data terenkripsi lama
    // tidak bisa didekripsi (bukan sekadar "pindah alamat" — datanya
    // jadi sampah tak terbaca). Untuk production: jangan hard-code
    // di source; derive dari secret user/device, dan rotasi lewat
    // keyVersion per-record (field keyVersion sudah ada di payload
    // enkripsi), bukan dengan mengganti string ini.
    // ============================================================
    encryptionKey: 'KESEMPATAN_OS_SECURE_KEY',
    syncInterval: 30000,
    maxOfflineQueue: 50000,
    compressionThreshold: 1024,
    autoBackupInterval: 86400000,
    maxBackups: 30,
    ftsEnabled: true,
    vectorEnabled: true,
    graphEnabled: true,
    geoEnabled: true,
    timeseriesEnabled: true,
    mlEnabled: true,
    p2pEnabled: true,
    biometricEnabled: true,
    quantumResistant: true,
    edgeEnabled: true,
    versioningEnabled: true,
    snapshotEnabled: true,
    multiTenantEnabled: true,
    streamingEnabled: true,
    lazyLoad: true,
    ftsLanguage: 'id',
    keyRotationInterval: 86400000 * 30,
    auditLogEnabled: true,
    pluginSystemEnabled: true,
    liveQueryEnabled: true,
    transactionEnabled: true,
    webWorkerEnabled: true,
    signalingServerUrl: 'wss://signaling.kesempatan.com'
});

KESEMPATAN.KesDatabase.DB_CONFIG = DB_CONFIG;

if (window.Utils && window.Utils.Logger) {
    window.Utils.Logger.info('DBConfig', 'Loaded');
}