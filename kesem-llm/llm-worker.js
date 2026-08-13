// KESEMPATAN LLM Web Worker — menjalankan seluruh engine KESEMPATAN LLM
// (25 modul) di dalam thread terpisah dari UI, lewat static import,
// sehingga komputasi berat (forward+backward transformer, BPE merge
// korpus besar, dst) tidak pernah membekukan thread utama.
//
// BATASAN YANG PERLU DIKETAHUI:
// 1. localStorage TIDAK ADA di dalam Worker (beda dari window) — save/
//    load checkpoint karena itu dipecah: worker cuma membangun/memulihkan
//    OBJEK checkpoint (murni komputasi), penyimpanan ke localStorage
//    dilakukan thread utama (lihat kesem-llm.js) lewat pesan.
// 2. Retriever RAG (llm-retriever.js) mencari window.VectorMemory/
//    KESDatabase/World — semua itu hidup di thread utama, TIDAK bisa
//    diakses dari dalam worker (scope global benar-benar terpisah).
//    Guard di retriever.js sudah aman (return array kosong, tidak
//    throw), jadi RAG otomatis nonaktif di dalam worker untuk saat ini
//    — perlu jembatan pesan terpisah kalau mau diaktifkan lagi.

// Shim (self.window = self) di-import PALING PERTAMA — lihat
// llm-worker-shim.js untuk kenapa ini harus jadi modul terpisah tanpa
// dependensi, bukan pernyataan biasa di file ini.
import './llm-worker-shim.js';

import './llm-config.js';
import './llm-tokenizer.js';
import './llm-vocabulary.js';
import './llm-embedding.js';
import './llm-gpu.js';
import './llm-attention.js';
import './llm-transformer.js';
import './llm-encoder.js';
import './llm-decoder.js';
import './llm-inference.js';
import './llm-json-grammar.js';
import './llm-sampler.js';
import './llm-runtime.js';
import './llm-knowledge-graph.js';
import './llm-retriever.js';
import './llm-context-builder.js';
import './llm-reasoning.js';
import './llm-tool-router.js';
import './llm-weights.js';
import './llm-checkpoint.js';
import './llm-quantization.js';
import './llm-optimizer.js';
import './llm-scheduler.js';
import './llm-trainer.js';
import './llm-core.js';
import './llm-api.js';
import { KesempatanLLM } from './llm-index.js';

self.postMessage({ type: 'progress', loaded: 1, total: 1 });

// stopSignal BERSAMA untuk panggilan 'generate' yang sedang berjalan —
// pesan 'stop' dari thread utama meng-aktifkannya, menghentikan loop
// generate() SUNGGUHAN (bukan cuma berhenti ditunggu).
// Peta stopSignal per-id request — SEBELUMNYA satu variabel dipakai
// bersama semua request 'generate', menyebabkan sinyal timeout salah
// sasaran kalau 2+ request diproses berdekatan (persis situasi mode
// paralel: beberapa agen kirim 'generate' hampir bersamaan). Sekarang
// tiap request generate dilacak dengan id-nya sendiri.
const stopSignals = new Map();

self.onmessage = async function (e) {
    const id = e.data.id;
    const type = e.data.type;
    const payload = e.data.payload || {};

    try {
        let result;
        switch (type) {
            case 'isReady':
                result = self.KesempatanLLM.isReady();
                break;

            case 'initialize': {
                const model = await self.KesempatanLLM.initialize(payload);
                // Objek model (Map, closure, dll) tidak bisa di-postMessage
                // utuh — cukup kirim ringkasan, model asli tetap tersimpan
                // di dalam worker (di closure llm-core.js).
                result = { vocabSize: model.vocab.size };
                break;
            }

            case 'generate': {
                const signal = { stopped: false };
                stopSignals.set(id, signal);
                const extraOptions = Object.assign({}, payload.extraOptions || {}, { stopSignal: signal });
                try {
                    result = await self.KesempatanLLM.generate(payload.prompt, payload.agentName, payload.topic, extraOptions);
                } finally {
                    stopSignals.delete(id);
                }
                break;
            }

            case 'stop':
                if (payload.targetId && stopSignals.has(payload.targetId)) {
                    stopSignals.get(payload.targetId).stopped = true;
                } else if (!payload.targetId) {
                    // Tidak ada target spesifik — hentikan semua yang sedang
                    // jalan (fallback aman utk pemanggil lama/generik).
                    stopSignals.forEach(function (s) { s.stopped = true; });
                }
                result = { stopped: true };
                break;

            case 'train':
                result = await self.KesempatanLLM.core.train(payload.corpus, payload.options);
                break;

            case 'buildCheckpoint':
                // Bagian PENYIMPANAN (localStorage) sengaja TIDAK di sini —
                // lihat catatan batasan di atas. Ini cuma membangun objek
                // checkpoint (murni komputasi); thread utama yang menyimpan.
                result = self.KesempatanLLM.core.buildCheckpointObject(payload.metadata);
                break;

            case 'restoreFromCheckpoint':
                {
                    const model = self.KesempatanLLM.core.restoreFromCheckpointObject(payload.checkpoint);
                    result = { vocabSize: model.vocab.size };
                }
                break;

            case 'getStats':
                result = self.KesempatanLLM.core.getStats();
                break;

            default:
                throw new Error('[llm-worker] Tipe pesan tidak dikenal: ' + type);
        }
        self.postMessage({ id: id, success: true, result: result });
    } catch (err) {
        self.postMessage({ id: id, success: false, error: err && err.message ? err.message : String(err) });
    }
};
