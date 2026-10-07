import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LLMAttention } from '../../raget-neural/llm-attention.js';
import { LLMEmbedding } from '../../raget-neural/llm-embedding.js';
import { LLMQuantization } from '../../raget-neural/llm-quantization.js';
import { dequantInt4, executeLayerPasses, DEQUANT_BLOCK_SHADER } from '../../raget-neural/runtime/webgpu-runner.js';
import { downloadModel, memoryStore, planRanges, MODEL_CACHE, MODEL_CHUNK } from '../../raget-neural/runtime/model-downloader.js';
import { reduceStream, chooseDoor } from '../../../js/studio/sse-door.js';
import { embed384, EMBED_DIM, hybridRank, indexRecord, savePostings, loadPostings } from '../../raget-retrieval/rag-index.js';

test('GQA 4:1 berbagi 2 KV untuk 8 query dan cache tidak membesar', () => {
  const dModel = 32;
  const weights = LLMAttention.createAttentionWeights(dModel, 0.02);
  const x = LLMEmbedding.randomMatrix(3, dModel, 0.02);
  const mask = LLMAttention.createCausalMask(3);
  const once = LLMAttention.groupedQueryAttention(x, weights, 8, 2, mask);
  assert.equal(once.output.length, 3);
  assert.equal(once.output[0].length, dModel);
  assert.equal(once.kvHeads, 2);
  const cached = LLMAttention.groupedQueryAttentionCached(x, weights, 8, 2, null);
  assert.equal(cached.cache.K.length, 2);
  assert.equal(cached.cache.V.length, 2);
  const bytes = LLMAttention.gqaKvBytes(2048, 4, 64);
  assert.ok(bytes < 120 * 1024 * 1024);
});

test('dekuantisasi blok 32 lewat runner menyimpang di bawah 1.5 persen', async () => {
  const values = Array.from({ length: 64 }, (_, i) => 1 + ((i % 32) / 31) * 0.02);
  const back = await dequantInt4(values);
  let worst = 0;
  values.forEach((value, i) => {
    worst = Math.max(worst, Math.abs(back.values[i] - value) / value);
  });
  assert.equal(back.device, 'cpu');
  assert.equal(back.packed.block, 32);
  assert.ok(worst < 0.015, String(worst));
  assert.match(DEQUANT_BLOCK_SHADER, /zeros\[block\]/);
  const round = LLMQuantization.dequantizeInt4Blocks(back.packed);
  assert.equal(round.length, values.length);
});

test('lapisan transformer dialirkan satu buffer, puncak tetap 26MB', () => {
  const seen = [];
  const stat = executeLayerPasses(40, (buf) => seen.push(buf.layer));
  assert.equal(stat.passes, 40);
  assert.equal(stat.peak, 26 * 1024 * 1024);
  assert.equal(stat.live, 0);
  assert.equal(seen.length, 40);
  assert.ok(stat.peak < 35 * 1024 * 1024);
});

test('pengunduh model memecah 20MB dan melanjutkan dari cache', async () => {
  const size = MODEL_CHUNK + 8;
  assert.equal(planRanges(size).length, 2);
  const payload = new Uint8Array(size);
  payload[0] = 7;
  payload[size - 1] = 9;
  let calls = 0;
  const store = memoryStore();
  const fetchImpl = async (url, init) => {
    calls += 1;
    const header = init.headers.Range;
    const pair = header.replace('bytes=', '').split('-').map(Number);
    return { arrayBuffer: async () => payload.slice(pair[0], pair[1] + 1).buffer };
  };
  const first = await downloadModel({ url: 'https://model.local/raget.bin', size, fetchImpl, store });
  const second = await downloadModel({ url: 'https://model.local/raget.bin', size, fetchImpl, store });
  assert.equal(first.cache, MODEL_CACHE);
  assert.equal(first.bytes.length, size);
  assert.equal(first.bytes[0], 7);
  assert.equal(first.bytes[size - 1], 9);
  assert.equal(first.fetched, 2);
  assert.equal(second.fetched, 0);
  assert.equal(calls, 2);
});

test('aliran SSE merakit token, jejak alat, dan diff', () => {
  const raw = [
    'event: token',
    'data: {"text":"fungsi "}',
    '',
    'event: tool',
    'data: {"name":"Read","path":"/js/script.js"}',
    '',
    'event: diff',
    'data: {"patch":"+ export function ukur()"}',
    '',
    'event: token',
    'data: {"text":"siap"}',
  ].join('\n');
  const state = reduceStream(raw);
  assert.equal(state.text, 'fungsi siap');
  assert.equal(state.tools[0].name, 'Read');
  assert.match(state.diffs[0].patch, /ukur/);
  assert.equal(chooseDoor(false), 'local');
  assert.equal(chooseDoor(true, 'local'), 'local');
});

test('indeks hibrida 384 dimensi tersimpan dan menemukan dokumen yang tepat', async () => {
  const vector = embed384('studio kode sandboks');
  assert.equal(vector.length, EMBED_DIM);
  const docs = [
    { id: 'a', text: 'studio kode menulis berkas javascript dan css' },
    { id: 'b', text: 'resep sayur bayam dan tomat di dapur' },
  ];
  const ranked = hybridRank('berkas javascript studio', docs);
  assert.equal(ranked[0].id, 'a');
  const record = indexRecord([{ id: 'buku', text: 'k'.repeat(3200) }]);
  assert.ok(record.chunks.length >= 2);
  const mem = {
    row: null,
    async put(value) { this.row = value; },
    async get() { return this.row; },
  };
  assert.equal(await savePostings(record, mem), true);
  const loaded = await loadPostings(mem);
  assert.equal(loaded.id, 'postings');
  assert.ok(loaded.chunks.length >= 2);
});
