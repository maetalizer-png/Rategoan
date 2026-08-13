import { LLMConfig } from './llm-config.js';
import { LLMTokenizer } from './llm-tokenizer.js';
import { LLMVocabulary } from './llm-vocabulary.js';
import { LLMEmbedding } from './llm-embedding.js';
import { LLMAttention } from './llm-attention.js';
import { LLMTransformer } from './llm-transformer.js';
import { LLMEncoder } from './llm-encoder.js';
import { LLMDecoder } from './llm-decoder.js';
import { LLMInference } from './llm-inference.js';
import { LLMSampler } from './llm-sampler.js';
import { LLMRuntime } from './llm-runtime.js';
import { LLMKnowledgeGraph } from './llm-knowledge-graph.js';
import { LLMRetriever } from './llm-retriever.js';
import { LLMContextBuilder } from './llm-context-builder.js';
import { LLMReasoning } from './llm-reasoning.js';
import { LLMToolRouter } from './llm-tool-router.js';
import { LLMWeights } from './llm-weights.js';
import { LLMCheckpoint } from './llm-checkpoint.js';
import { LLMQuantization } from './llm-quantization.js';
import { LLMOptimizer } from './llm-optimizer.js';
import { LLMScheduler } from './llm-scheduler.js';
import { LLMTrainer } from './llm-trainer.js';
import { LLMApi } from './llm-api.js';
import { LLMCore } from './llm-core.js';

const Logger = window.Utils?.Logger || {
    info: function () { /* silent */ },
    warn: function () { /* silent */ },
    error: function (mod, msg) { console.error('[ERROR] [' + mod + '] ' + msg); }
};

export const KesempatanLLM = {
    config: LLMConfig,
    tokenizer: LLMTokenizer,
    vocabulary: LLMVocabulary,
    embedding: LLMEmbedding,
    attention: LLMAttention,
    transformer: LLMTransformer,
    encoder: LLMEncoder,
    decoder: LLMDecoder,
    inference: LLMInference,
    sampler: LLMSampler,
    runtime: LLMRuntime,
    knowledgeGraph: LLMKnowledgeGraph,
    retriever: LLMRetriever,
    contextBuilder: LLMContextBuilder,
    reasoning: LLMReasoning,
    toolRouter: LLMToolRouter,
    weights: LLMWeights,
    checkpoint: LLMCheckpoint,
    quantization: LLMQuantization,
    optimizer: LLMOptimizer,
    scheduler: LLMScheduler,
    trainer: LLMTrainer,
    api: LLMApi,
    core: LLMCore,

    // Jalan pintas paling sering dipakai konsumen luar (workflow.js) —
    // langsung ke LLMCore/LLMApi tanpa perlu tahu strukturnya di dalam.
    initialize: LLMCore.initialize,
    isReady: LLMApi.isReady,
    generate: LLMApi.generate
};

window.KesempatanLLM = KesempatanLLM;

Logger.info('LLMIndex', '✅ Engine termuat — 24 modul siap dipakai, window.KesempatanLLM tersedia (CATATAN: ini BUKAN berarti model sudah bisa generate — cek window.KesempatanLLM.isReady() dulu, panggil .initialize() kalau masih false)');

if (typeof document !== 'undefined') {
    document.dispatchEvent(new CustomEvent('kesempatan-llm-ready'));
}
if (window._onKesempatanLLMReady && typeof window._onKesempatanLLMReady === 'function') {
    window._onKesempatanLLMReady();
}
