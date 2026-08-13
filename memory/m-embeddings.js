import { Utils } from '../js/utils.js';
import { MemoryConfig } from './m-config.js';
import { MemoryUtils } from './m-utilities.js';

const KESEMPATAN = window.KESEMPATAN || {};
window.KESEMPATAN = KESEMPATAN;
KESEMPATAN.Memory = KESEMPATAN.Memory || {};

const Logger = Utils.Logger;
const Config = MemoryConfig;

const TEXT_MODEL = 'Xenova/all-MiniLM-L6-v2';
const TRANSFORMERS_CDN = 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.13.0/dist/transformers.min.js';

// ============================================================
// MULTIMODAL EMBEDDING
// ============================================================
class MultimodalEmbedding {
    constructor() {
        this.isReady = false;
        this.models = {};
    }

    async load() {
        if (this.isReady) {
            return;
        }

        try {
            if (typeof transformers === 'undefined' && typeof document !== 'undefined') {
                try {
                    const script = document.createElement('script');

                    script.src = TRANSFORMERS_CDN;

                    await new Promise(function (resolve, reject) {
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                } catch (error) {
                    Logger.warn('Multimodal', 'Transformers not loaded, using fallback');
                }
            }

            if (typeof transformers !== 'undefined' && typeof transformers.pipeline === 'function') {
                this.models.text = await transformers.pipeline('feature-extraction', TEXT_MODEL);
            }

            this.models.image = this._fallbackImageEmbedding.bind(this);
            this.models.audio = this._fallbackAudioEmbedding.bind(this);

            this.isReady = true;

            Logger.info('Multimodal', 'Models loaded');
        } catch (error) {
            Logger.error('Multimodal', 'Failed to load: ' + error.message);
            this.isReady = false;
        }
    }

    async embedText(text) {
        const safeText = String(text || '');

        if (!this.isReady || !this.models.text) {
            return MemoryUtils.simpleEmbed
                ? MemoryUtils.simpleEmbed(safeText)
                : this._fallbackTextEmbedding(safeText);
        }

        try {
            const result = await this.models.text(safeText, {
                pooling: 'mean',
                normalize: true
            });

            return Array.from(result.data || result || []);
        } catch (error) {
            return MemoryUtils.simpleEmbed
                ? MemoryUtils.simpleEmbed(safeText)
                : this._fallbackTextEmbedding(safeText);
        }
    }

    async embedImage(imageData) {
        if (!this.isReady || !this.models.image) {
            return this._fallbackImageEmbedding(imageData);
        }

        try {
            return await this.models.image(imageData);
        } catch (error) {
            return this._fallbackImageEmbedding(imageData);
        }
    }

    async embedAudio(audioData) {
        if (!this.isReady || !this.models.audio) {
            return this._fallbackAudioEmbedding(audioData);
        }

        try {
            return await this.models.audio(audioData);
        } catch (error) {
            return this._fallbackAudioEmbedding(audioData);
        }
    }

    async embed(text, image, audio) {
        const embeddings = [];

        if (text) {
            const textVec = await this.embedText(text);
            embeddings.push(textVec);
        }

        if (image) {
            const imageVec = await this.embedImage(image);
            embeddings.push(imageVec);
        }

        if (audio) {
            const audioVec = await this.embedAudio(audio);
            embeddings.push(audioVec);
        }

        if (embeddings.length === 0) {
            return MemoryUtils.simpleEmbed
                ? MemoryUtils.simpleEmbed('default')
                : this._fallbackTextEmbedding('default');
        }

        if (embeddings.length === 1) {
            return embeddings[0];
        }

        const dim = embeddings[0].length;
        const result = new Array(dim).fill(0);

        for (const emb of embeddings) {
            if (!Array.isArray(emb)) {
                continue;
            }

            const len = Math.min(dim, emb.length);

            for (let i = 0; i < len; i++) {
                result[i] += emb[i] / embeddings.length;
            }
        }

        return result;
    }

    _fallbackTextEmbedding(text) {
        const dim = Config.DIMENSION || 384;
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

    async _fallbackImageEmbedding(imageData) {
        const dim = Config.DIMENSION || 384;
        const vec = new Array(dim).fill(0);

        if (!imageData || typeof document === 'undefined') {
            return vec;
        }

        try {
            const pixels = await this._getPixels(imageData);
            const step = Math.floor(pixels.length / dim);

            for (let i = 0; i < dim && i * step < pixels.length; i++) {
                vec[i] = pixels[i * step] / 255;
            }
        } catch (error) {
            // fallback aman tanpa pixel
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

    async _fallbackAudioEmbedding(audioData) {
        const dim = Config.DIMENSION || 384;
        const vec = new Array(dim).fill(0);

        if (!audioData) {
            return vec;
        }

        try {
            const samples = await this._getAudioSamples(audioData);
            const step = Math.floor(samples.length / dim);

            for (let i = 0; i < dim && i * step < samples.length; i++) {
                vec[i] = samples[i * step] / 32768;
            }
        } catch (error) {
            // fallback aman tanpa audio sample
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

    _getPixels(imageData) {
        return new Promise(function (resolve, reject) {
            if (typeof Image === 'undefined' || typeof document === 'undefined') {
                reject(new Error('Canvas unavailable'));
                return;
            }

            const img = new Image();
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext ? canvas.getContext('2d') : null;

            if (!ctx) {
                reject(new Error('Canvas context unavailable'));
                return;
            }

            canvas.width = 32;
            canvas.height = 32;

            let settled = false;

            const timeout = setTimeout(function () {
                if (!settled) {
                    settled = true;
                    reject(new Error('Image load timeout'));
                }
            }, 3000);

            img.onload = function () {
                if (settled) {
                    return;
                }

                settled = true;

                clearTimeout(timeout);

                try {
                    ctx.drawImage(img, 0, 0, 32, 32);

                    const data = ctx.getImageData(0, 0, 32, 32).data;
                    const pixels = [];

                    for (let i = 0; i < data.length; i += 4) {
                        pixels.push(data[i]);
                    }

                    resolve(pixels);
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = function () {
                if (settled) {
                    return;
                }

                settled = true;

                clearTimeout(timeout);

                reject(new Error('Image load failed'));
            };

            img.src = imageData;
        });
    }

    _getAudioSamples(audioData) {
        return new Promise(function (resolve, reject) {
            const AudioCtx = (typeof window !== 'undefined')
                ? (window.AudioContext || window.webkitAudioContext)
                : undefined;

            if (typeof AudioCtx === 'undefined') {
                reject(new Error('AudioContext unavailable'));
                return;
            }

            let arrayBuffer;

            try {
                if (audioData instanceof ArrayBuffer) {
                    arrayBuffer = audioData;
                } else if (audioData instanceof Uint8Array) {
                    arrayBuffer = audioData.buffer;
                } else if (typeof audioData === 'string') {
                    // Data URL ("data:audio/...;base64,XXXX") atau base64 mentah.
                    const base64 = audioData.indexOf(',') > -1
                        ? audioData.split(',')[1]
                        : audioData;
                    const binary = atob(base64);
                    const bytes = new Uint8Array(binary.length);

                    for (let i = 0; i < binary.length; i++) {
                        bytes[i] = binary.charCodeAt(i);
                    }

                    arrayBuffer = bytes.buffer;
                } else {
                    reject(new Error('Unsupported audio data format'));
                    return;
                }
            } catch (error) {
                reject(error);
                return;
            }

            const audioCtx = new AudioCtx();

            let settled = false;

            const timeout = setTimeout(function () {
                if (!settled) {
                    settled = true;
                    audioCtx.close();
                    reject(new Error('Audio decode timeout'));
                }
            }, 5000);

            audioCtx.decodeAudioData(
                arrayBuffer,
                function (audioBuffer) {
                    if (settled) {
                        return;
                    }

                    settled = true;

                    clearTimeout(timeout);

                    const channelData = audioBuffer.getChannelData(0);

                    audioCtx.close();

                    resolve(Array.from(channelData).map(function (sample) {
                        return sample * 32768;
                    }));
                },
                function (error) {
                    if (settled) {
                        return;
                    }

                    settled = true;

                    clearTimeout(timeout);
                    audioCtx.close();

                    reject(error || new Error('Audio decode failed'));
                }
            );
        });
    }

    isLoaded() {
        return this.isReady;
    }
}

export { MultimodalEmbedding };

KESEMPATAN.Memory.MultimodalEmbedding = MultimodalEmbedding;

Logger.info('MemoryEmbeddings', 'Multimodal Embedding loaded');
