import { test } from 'node:test';
import assert from 'node:assert/strict';
import { craftInstruction } from '../../../js/studio/studio-agent.js';
import { LLMQuantization } from '../../raget-neural/llm-quantization.js';
import { LLMAttention } from '../../raget-neural/llm-attention.js';
import { chunkText, buildPostings } from '../../raget-retrieval/chunk-text.js';
import { parseSseBlock, chooseDoor } from '../../../js/studio/sse-door.js';
import { planLayerPasses, DEQUANT_BLOCK_SHADER } from '../../raget-neural/runtime/webgpu-runner.js';

test('teks acak tidak merakit berkas dan tidak memalsukan jejak', () => {
  const before = { 'index.html': '<p>tetap</p>' };
  const plan = craftInstruction('hvgyfkvhjnn', before);
  assert.equal(plan.ok, false);
  assert.equal(plan.error, 'unrecognized_instruction');
  assert.equal(plan.steps.length, 0);
  assert.equal(plan.files['index.html'], '<p>tetap</p>');
  assert.equal(/Ketuk|Web app/.test(plan.reply), false);
});

test('kuantisasi int4 per blok 32 menyimpang di bawah 1.5 persen', () => {
  const values = Array.from({ length: 32 }, (_, i) => 1 + (i / 31) * 0.02);
  const packed = LLMQuantization.quantizeInt4Blocks(values);
  const back = LLMQuantization.dequantizeInt4Blocks(packed);
  let worst = 0;
  values.forEach((value, i) => {
    worst = Math.max(worst, Math.abs(back[i] - value) / value);
  });
  assert.ok(worst < 0.015, String(worst));
  assert.equal(packed.block, 32);
});

test('GQA 4:1 memetakan 16 query ke 4 kv dan cache di bawah 120MB', () => {
  assert.equal(LLMAttention.kvHeadForQuery(0, 16, 4), 0);
  assert.equal(LLMAttention.kvHeadForQuery(4, 16, 4), 1);
  assert.equal(LLMAttention.kvHeadForQuery(15, 16, 4), 3);
  const bytes = LLMAttention.gqaKvBytes(2048, 4, 64);
  assert.ok(bytes < 120 * 1024 * 1024);
  const full = LLMAttention.gqaKvBytes(2048, 16, 64);
  assert.ok(bytes <= full * 0.25);
});

test('cacah dokumen 1500 dengan tumpang tindih 150', () => {
  const parts = chunkText('a'.repeat(3000));
  assert.equal(parts.length, 3);
  assert.equal(parts[0].length, 1500);
  assert.equal(parts[1].length, 1500);
  const postings = buildPostings(['kode studio', 'studio kode']);
  assert.deepEqual(postings.studio, [0, 1]);
});

test('aliran sse dan pintu lokal', () => {
  const token = parseSseBlock('event: token\ndata: {"text":"hai"}');
  assert.equal(token.event, 'token');
  assert.equal(token.payload.text, 'hai');
  assert.equal(chooseDoor(false), 'local');
  assert.equal(chooseDoor(true), 'center');
  const passes = planLayerPasses(2);
  assert.equal(passes.length, 2);
  assert.equal(passes[0].bytes, 26 * 1024 * 1024);
  assert.match(DEQUANT_BLOCK_SHADER, /scales/);
});
