// KESEMPATAN OS - WORLD LOADER
// Menggabungkan seluruh data statis (country, city, lingo, marplace,
// paluang, sapaan) lewat static import, lalu memilah tiap item ke
// __STATIC_DATA (memori langsung) atau VectorMemory (dinamis) sesuai
// tipenya. Sumber berita (src/global.js, src/international.js,
// src/regional.js) diimpor untuk EFEK SAMPING saja — file-file itu
// mengambil data lewat fetch RSS async dan mendaftarkan hasilnya ke
// window.__DATA_REGISTER sendiri begitu selesai, karena isinya belum
// ada sama sekali pada saat modul dievaluasi (beda dari 38 sumber data
// statis di atas yang isinya sudah pasti ada begitu file diimpor).

import { DATA as SAPAAN_GREETINGS } from './sapaan/greetings.js';
import { DATA as SAPAAN_INTERAKTIF } from './sapaan/interaktif.js';
import { DATA as COUNTRY_ASIAN_TENGGARA } from './country/asian-tenggara.js';
import { DATA as COUNTRY_ASIAN_TIMUR } from './country/asian-timur.js';
import { DATA as COUNTRY_ASIAN_SELATAN } from './country/asian-selatan.js';
import { DATA as COUNTRY_ASIAN_BARAT } from './country/asian-barat.js';
import { DATA as COUNTRY_ASIAN_TENGAH } from './country/asian-tengah.js';
import { DATA as COUNTRY_EROPAN_TIMUR } from './country/eropan-timur.js';
import { DATA as COUNTRY_EROPAN_BARAT } from './country/eropan-barat.js';
import { DATA as COUNTRY_EROPAN_SELATAN } from './country/eropan-selatan.js';
import { DATA as COUNTRY_EROPAN_TENGAH } from './country/eropan-tengah.js';
import { DATA as COUNTRY_EROPAN_UTARA } from './country/eropan-utara.js';
import { DATA as COUNTRY_AMERICAN_UTARA } from './country/american-utara.js';
import { DATA as COUNTRY_AMERICAN_TENGAH } from './country/american-tengah.js';
import { DATA as COUNTRY_AMERICAN_KARIBIA } from './country/american-karibia.js';
import { DATA as COUNTRY_AMERICAN_SELATAN } from './country/american-selatan.js';
import { DATA as COUNTRY_AFRICAN_UTARA } from './country/african-utara.js';
import { DATA as COUNTRY_AFRICAN_TIMUR } from './country/african-timur.js';
import { DATA as COUNTRY_AFRICAN_SELATAN } from './country/african-selatan.js';
import { DATA as COUNTRY_AFRICAN_BARAT } from './country/african-barat.js';
import { DATA as COUNTRY_AFRICAN_TENGAH } from './country/african-tengah.js';
import { DATA as COUNTRY_OSENIAN } from './country/osenian.js';
import { DATA as CITIES_ASIA_TENGGARA } from './cities/asia-tenggara.js';
import { DATA as LINGO_ASEAN_TENGGARA } from './lingo/asean-tenggara.js';
import { DATA as LINGO_ASEAN_TIMUR } from './lingo/asean-timur.js';
import { DATA as LINGO_ASEAN_SELATAN } from './lingo/asean-selatan.js';
import { DATA as LINGO_ASEAN_BARAT } from './lingo/asean-barat.js';
import { DATA as LINGO_ASEAN_TENGAH } from './lingo/asean-tengah.js';
import { DATA as MARPLACE_ECOMMERCE } from './marplace/ecommerce.js';
import { DATA as MARPLACE_PROPERTI } from './marplace/properti.js';
import { DATA as MARPLACE_OTOMOTIF } from './marplace/otomotif.js';
import { DATA as MARPLACE_FREELANCE } from './marplace/freelance.js';
import { DATA as MARPLACE_KARIR } from './marplace/karir.js';
import { DATA as PALUANG_SEKTOR } from './paluang/sektor.js';
import { DATA as PALUANG_PELUANG_DAERAH } from './paluang/peluang-daerah.js';
import { DATA as PALUANG_TREN } from './paluang/tren.js';
import { DATA as PALUANG_KOMPETENSI } from './paluang/kompetensi.js';
import { DATA as PALUANG_INVESTASI } from './paluang/investasi.js';

import './src/regional.js';
import './src/global.js';
import './src/international.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;

// ============================================================
// FALLBACK LOGGER
// Menulis ke console HANYA jika logger terpusat (InternalLogger
// dari helpers.js) belum ada saat file ini jalan. Karena world.js
// biasanya di-load SEBELUM helpers.js, fallback inilah yang
// menampilkan progres load di console. JANGAN di-senyap-kan
// (jangan dijadikan function kosong), karena itu akan menghilangkan
// SELURUH log world.js dari console (ini penyebab log "hilang"
// pada versi sebelumnya). Pada boot normal di mana InternalLogger
// sudah tersedia, objek ini tidak dipakai dan log mengalir ke
// logger terpusat.
// ============================================================
const InternalLogger = window.InternalLogger || {
    _logs: [],
    _maxLogs: 1000,
    _levels: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, CRITICAL: 4 },
    _level: 1,
    _getLevelPrefix: function (level) {
        const prefixes = { 0: '[DEBUG]', 1: '[INFO]', 2: '[WARN]', 3: '[ERROR]', 4: '[CRITICAL]' };
        return prefixes[level] || '[INFO]';
    },
    log: function (level, module, message) {
        if (this._level <= level && typeof console !== 'undefined') {
            const prefix = this._getLevelPrefix(level);
            console.log(prefix + ' [' + module + '] ' + message);
        }
    },
    info: function (module, message) { this.log(this._levels.INFO, module, message); },
    warn: function (module, message) { this.log(this._levels.WARN, module, message); },
    error: function (module, message) { this.log(this._levels.ERROR, module, message); }
};

// ============================================================
// KONFIGURASI
// ============================================================
const CONFIG = Object.freeze({
    BATCH_SIZE: 10,
    DELAY_BETWEEN_BATCH: 100,
    MAX_RETRIES: 2,
    RETRY_DELAY: 2000,
    MAX_DATA_PER_SESSION: 1000,
    STORAGE_KEY: 'kes_world_loader_progress',
    MAX_DYNAMIC_VECTORS: 300
});

// ============================================================
// GABUNGKAN 38 SUMBER DATA STATIS KE __DATA_REGISTER
// Dulu tiap file men-daftarkan dirinya sendiri ke window.__DATA_REGISTER
// sebagai efek samping saat <script> dieksekusi (dynamic loader). Sekarang
// tiap file mengekspor array datanya langsung — penggabungan dilakukan
// di SATU tempat ini. window.__DATA_REGISTER tetap dipertahankan sebagai
// bridge karena masih dibaca konsumen luar (interactive/chat-ai/cai-data-engine.js)
// dan oleh src/global.js dkk. yang menambahkan hasil fetch RSS-nya belakangan.
// ============================================================
window.__DATA_REGISTER = window.__DATA_REGISTER || [];
window.__DATA_REGISTER.push(
    ...SAPAAN_GREETINGS, ...SAPAAN_INTERAKTIF,
    ...COUNTRY_ASIAN_TENGGARA, ...COUNTRY_ASIAN_TIMUR, ...COUNTRY_ASIAN_SELATAN,
    ...COUNTRY_ASIAN_BARAT, ...COUNTRY_ASIAN_TENGAH,
    ...COUNTRY_EROPAN_TIMUR, ...COUNTRY_EROPAN_BARAT, ...COUNTRY_EROPAN_SELATAN,
    ...COUNTRY_EROPAN_TENGAH, ...COUNTRY_EROPAN_UTARA,
    ...COUNTRY_AMERICAN_UTARA, ...COUNTRY_AMERICAN_TENGAH, ...COUNTRY_AMERICAN_KARIBIA,
    ...COUNTRY_AMERICAN_SELATAN,
    ...COUNTRY_AFRICAN_UTARA, ...COUNTRY_AFRICAN_TIMUR, ...COUNTRY_AFRICAN_SELATAN,
    ...COUNTRY_AFRICAN_BARAT, ...COUNTRY_AFRICAN_TENGAH,
    ...COUNTRY_OSENIAN,
    ...CITIES_ASIA_TENGGARA,
    ...LINGO_ASEAN_TENGGARA, ...LINGO_ASEAN_TIMUR, ...LINGO_ASEAN_SELATAN,
    ...LINGO_ASEAN_BARAT, ...LINGO_ASEAN_TENGAH,
    ...MARPLACE_ECOMMERCE, ...MARPLACE_PROPERTI, ...MARPLACE_OTOMOTIF,
    ...MARPLACE_FREELANCE, ...MARPLACE_KARIR,
    ...PALUANG_SEKTOR, ...PALUANG_PELUANG_DAERAH, ...PALUANG_TREN,
    ...PALUANG_KOMPETENSI, ...PALUANG_INVESTASI
);
const STATIC_SOURCE_COUNT = 38;

// ============================================================
// STATE
// ============================================================
let isProcessing = false;
let isPaused = false;
let totalDataItems = 0;
let successItems = 0;
let failedItems = 0;
let currentBatch = 0;
let totalBatches = 0;
let startTime = 0;
let staticCount = 0;
let dynamicCount = 0;

// ============================================================
// SLEEP
// ============================================================
const sleep = function (ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
};

// ============================================================
// CEK TIPE DATA (STATIS ATAU DINAMIS)
// ============================================================
const isStaticData = function (item) {
    const type = item.metadata?.type || '';
    const category = item.metadata?.category || '';
    const subcategory = item.metadata?.subcategory || '';

    // Data statis tidak masuk VectorMemory.
    const STATIC_TYPES = ['country', 'language', 'city', 'source', 'marplace', 'paluang', 'sapaan'];
    const STATIC_CATEGORIES = ['country', 'language', 'city', 'source', 'marplace', 'paluang', 'sapaan'];
    const STATIC_SUBCATEGORIES = ['regional', 'international', 'global'];

    if (STATIC_TYPES.includes(type)) {
        return true;
    }

    if (STATIC_CATEGORIES.includes(category)) {
        return true;
    }

    if (STATIC_SUBCATEGORIES.includes(subcategory)) {
        return true;
    }

    return false;
};

// ============================================================
// SAVE BATCH KE TEMPAT YANG TEPAT
// ============================================================
const saveBatchWithRetry = async function (batch, batchIndex, retryCount) {
    retryCount = retryCount || 0;

    try {
        for (let i = 0; i < batch.length; i++) {
            const item = batch[i];

            // Pilah data statis vs dinamis.
            if (isStaticData(item)) {
                // Statis -> __STATIC_DATA (memori langsung).
                if (typeof window.__STATIC_DATA === 'undefined') {
                    window.__STATIC_DATA = [];
                }

                window.__STATIC_DATA.push(item);
                staticCount++;
            } else {
                // Dinamis -> VectorMemory.
                if (dynamicCount < CONFIG.MAX_DYNAMIC_VECTORS) {
                    await window.VectorMemory.save(item.text, item.metadata);
                    dynamicCount++;
                } else {
                    // Lewat batas dinamis -> jatuh ke statis.
                    if (typeof window.__STATIC_DATA === 'undefined') {
                        window.__STATIC_DATA = [];
                    }

                    window.__STATIC_DATA.push(item);
                    staticCount++;
                    InternalLogger.warn('WorldLoader', 'Dynamic limit reached, storing as static');
                }
            }

            successItems++;
            totalDataItems++;
        }

        return {
            success: true,
            count: batch.length
        };
    } catch (error) {
        if (retryCount < CONFIG.MAX_RETRIES) {
            InternalLogger.warn('WorldLoader', 'Batch ' + batchIndex + ' failed, retrying (' + (retryCount + 1) + '/' + CONFIG.MAX_RETRIES + ')');
            await sleep(CONFIG.RETRY_DELAY);

            return saveBatchWithRetry(batch, batchIndex, retryCount + 1);
        }

        failedItems += batch.length;
        InternalLogger.error('WorldLoader', 'Batch ' + batchIndex + ' failed after ' + CONFIG.MAX_RETRIES + ' retries');

        return {
            success: false,
            count: 0,
            error: error.message
        };
    }
};

// ============================================================
// PROSES DATA DENGAN QUEUE
// ============================================================
const processDataWithQueue = async function (dataItems) {
    if (typeof dataItems === 'undefined' || dataItems.length === 0) {
        return {
            success: 0,
            failed: 0,
            total: 0
        };
    }

    if (typeof window.VectorMemory === 'undefined') {
        InternalLogger.warn('WorldLoader', 'VectorMemory not available, saving all to static memory');

        // Fallback: semua jadi statis.
        if (typeof window.__STATIC_DATA === 'undefined') {
            window.__STATIC_DATA = [];
        }

        for (const item of dataItems) {
            window.__STATIC_DATA.push(item);
            staticCount++;
        }

        return {
            success: dataItems.length,
            failed: 0,
            total: dataItems.length
        };
    }

    const maxData = CONFIG.MAX_DATA_PER_SESSION;
    const limitedData = dataItems.slice(0, maxData);

    if (dataItems.length > maxData) {
        InternalLogger.warn('WorldLoader', 'Data limited to ' + maxData + ' items (total: ' + dataItems.length + ')');
    }

    const total = limitedData.length;
    const batches = [];
    const batchSize = CONFIG.BATCH_SIZE;

    for (let i = 0; i < total; i += batchSize) {
        batches.push(limitedData.slice(i, i + batchSize));
    }

    totalBatches = batches.length;
    currentBatch = 0;

    let totalSuccess = 0;
    let totalFailed = 0;

    InternalLogger.info('WorldLoader', 'Processing ' + total + ' items in ' + totalBatches + ' batches');
    InternalLogger.info('WorldLoader', 'Static data: ' + staticCount + ' | Dynamic data: ' + dynamicCount);

    for (let b = 0; b < batches.length; b++) {
        while (isPaused) {
            InternalLogger.info('WorldLoader', 'Paused, waiting');
            await sleep(1000);
        }

        currentBatch = b + 1;

        const batch = batches[b];
        const result = await saveBatchWithRetry(batch, b + 1);

        if (result.success) {
            totalSuccess += result.count;
        } else {
            totalFailed += batch.length;
        }

        if (b < batches.length - 1) {
            await sleep(CONFIG.DELAY_BETWEEN_BATCH);
        }
    }

    return {
        success: totalSuccess,
        failed: totalFailed,
        total: total
    };
};

// ============================================================
// PROSES SEMUA DATA
// ============================================================
const processAllData = async function () {
    if (isProcessing) {
        return;
    }

    isProcessing = true;
    startTime = Date.now();
    staticCount = 0;
    dynamicCount = 0;

    const register = window.__DATA_REGISTER || [];
    const totalData = register.length;

    InternalLogger.info('WorldLoader', 'Processing ' + totalData + ' data items');
    InternalLogger.info('WorldLoader', 'Static -> Memory | Dynamic -> VectorMemory');

    if (totalData === 0) {
        InternalLogger.warn('WorldLoader', 'No data to process');
        isProcessing = false;

        return;
    }

    const results = await processDataWithQueue(register);
    const elapsed = Math.round((Date.now() - startTime) / 1000);

    InternalLogger.info('WorldLoader', 'Data processing complete (' + elapsed + 's)');
    InternalLogger.info('WorldLoader', '   Success: ' + results.success);
    InternalLogger.info('WorldLoader', '   Failed: ' + results.failed);
    InternalLogger.info('WorldLoader', '   Total: ' + results.total);
    InternalLogger.info('WorldLoader', '   Static: ' + staticCount + ' (Memory)');
    InternalLogger.info('WorldLoader', '   Dynamic: ' + dynamicCount + ' (VectorMemory)');

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('world-data-loaded', {
            detail: {
                success: results.success,
                failed: results.failed,
                total: results.total,
                static: staticCount,
                dynamic: dynamicCount,
                elapsed: elapsed,
                timestamp: Date.now()
            }
        }));
    }

    try {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify({
            timestamp: Date.now(),
            total: results.total,
            success: results.success,
            failed: results.failed,
            static: staticCount,
            dynamic: dynamicCount,
            elapsed: elapsed
        }));
    } catch (e) {
        // silent
    }

    isProcessing = false;
};

// ============================================================
// JALANKAN
// Sumber statis sudah pasti tersedia begitu modul ini dievaluasi (static
// import), jadi tidak perlu lagi menunggu N file dimuat satu per satu
// lewat <script> tag — cukup proses __DATA_REGISTER langsung.
// ============================================================
const runWorldLoader = async function () {
    InternalLogger.info('WorldLoader', 'Sources: ' + STATIC_SOURCE_COUNT + ' static (country/city/lingo/marplace/paluang/sapaan) + 3 dynamic (src/*)');
    InternalLogger.info('WorldLoader', window.__DATA_REGISTER.length + ' static items registered');

    await processAllData();

    if (typeof document !== 'undefined') {
        document.dispatchEvent(new CustomEvent('world-ready', {
            detail: {
                dataCount: (window.__DATA_REGISTER || []).length,
                staticCount: staticCount,
                dynamicCount: dynamicCount,
                timestamp: Date.now()
            }
        }));
    }
};

// ============================================================
// PUBLIC API
// ============================================================
const WorldLoader = Object.freeze({
    load: runWorldLoader,
    pause: function () {
        isPaused = true;
        InternalLogger.info('WorldLoader', 'Paused');
    },
    resume: function () {
        isPaused = false;
        InternalLogger.info('WorldLoader', 'Resumed');
    },
    getStatus: function () {
        return Object.freeze({
            isComplete: !isProcessing,
            isProcessing: isProcessing,
            isPaused: isPaused,
            dataCount: (window.__DATA_REGISTER || []).length,
            staticCount: staticCount,
            dynamicCount: dynamicCount,
            successItems: successItems,
            failedItems: failedItems,
            totalItems: totalDataItems,
            currentBatch: currentBatch,
            totalBatches: totalBatches,
            progress: totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0
        });
    },
    getData: function () {
        return window.__DATA_REGISTER || [];
    },
    getStaticData: function () {
        return window.__STATIC_DATA || [];
    },
    getStats: function () {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE_KEY);

            return saved ? JSON.parse(saved) : null;
        } catch (e) {
            return null;
        }
    },
    reset: function () {
        try {
            localStorage.removeItem(CONFIG.STORAGE_KEY);
            window.__STATIC_DATA = [];
        } catch (e) {
            // silent
        }

        staticCount = 0;
        dynamicCount = 0;
        InternalLogger.info('WorldLoader', 'Reset complete');
    }
});

KESEMPATAN.WorldLoader = WorldLoader;

// Inisialisasi __STATIC_DATA
if (typeof window.__STATIC_DATA === 'undefined') {
    window.__STATIC_DATA = [];
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(runWorldLoader, 500);
    });
} else {
    setTimeout(runWorldLoader, 500);
}

InternalLogger.info('WorldLoader', 'WorldLoader ready');
