import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;

export function generateId() {
    if (globalThis.crypto && typeof globalThis.crypto.randomUUID === 'function') {
        return globalThis.crypto.randomUUID();
    }

    return Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
}

export function getConfig() {
    return MemoryConfig;
}

function simpleEmbed(text) {
    const config = getConfig();
    const dim = config.DIMENSION || 384;
    const vec = new Array(dim).fill(0);

    const safeText = String(text || '');

    if (!safeText) {
        return vec;
    }

    const words = safeText
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, '')
        .split(/\s+/)
        .filter(function (word) {
            return word.length > 0;
        });

    if (words.length === 0) {
        return vec;
    }

    for (const word of words) {
        let hash = 0;

        for (let i = 0; i < word.length; i++) {
            hash = ((hash << 5) - hash) + word.charCodeAt(i);
            hash |= 0;
        }

        const idx = Math.abs(hash) % dim;

        vec[idx] += 1 / words.length;
    }

    const norm = Math.sqrt(vec.reduce(function (sum, value) {
        return sum + value * value;
    }, 0));

    if (norm > 0) {
        for (let i = 0; i < dim; i++) {
            vec[i] /= norm;
        }
    }

    return vec;
}

function loadFromStorage(key) {
    try {
        if (typeof localStorage === 'undefined') {
            return null;
        }

        const data = localStorage.getItem(key);

        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

function saveToStorage(key, data) {
    try {
        if (typeof localStorage === 'undefined') {
            return false;
        }

        localStorage.setItem(key, JSON.stringify(data));

        return true;
    } catch (error) {
        return false;
    }
}

export { simpleEmbed, loadFromStorage, saveToStorage };

export const MemoryUtils = Object.freeze({
    generateId: generateId,
    getConfig: getConfig,
    simpleEmbed: simpleEmbed,
    loadFromStorage: loadFromStorage,
    saveToStorage: saveToStorage
});

KESEMPATAN.Memory.MemoryUtils = MemoryUtils;

Logger.info('MemoryUtils', 'Loaded');
