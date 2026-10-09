import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { onlineAttention, standardAttention } from '../../raget-neural/runtime/flash-decoding.js';
import { ternaryDot } from '../../raget-neural/runtime/bitnet-ternary.js';
import { schedulePhase } from '../../raget-neural/runtime/prefill-scheduler.js';
import { subgroupCaps } from '../../raget-neural/runtime/subgroup-caps.js';
import { createKvWindow } from '../../raget-neural/core/kv-policy.js';
import { measureThroughput } from '../../raget-neural/runtime/speculative-engine.js';

const root = new URL('../../../', import.meta.url);

test('softmax daring menyimpang di bawah 1.25e-8 tanpa matriks penuh', () => {
  const q = [0.2, -0.4, 0.8, 0.1];
  const keys = [[0.2, 0.1, 0.0, -0.2], [0.5, -0.3, 0.4, 0.2], [-0.1, 0.6, 0.2, 0.0], [0.3, 0.3, -0.5, 0.4]];
  const values = [[1, 0], [0, 1], [0.5, 0.5], [0.2, 0.8]];
  const online = onlineAttention(q, keys, values);
  const standard = standardAttention(q, keys, values);
  online.forEach((value, index) => {
    assert.ok(Math.abs(value - standard[index]) < 1.25e-8);
  });
  const wgsl = readFileSync(new URL('raget/raget-neural/runtime/flash-decoding.wgsl', root), 'utf8');
  assert.match(wgsl, /online_step/);
  const runner = readFileSync(new URL('raget/raget-neural/runtime/webgpu-runner.js', root), 'utf8');
  assert.doesNotMatch(runner, /flash-decoding/);
});

test('bitnet ternary menambah dan mengurangi, bukan mengalikan FP16', () => {
  assert.equal(ternaryDot([2, 3, 4, 5], [1, 0, -1, 1]), 2 + 0 - 4 + 5);
  const wgsl = readFileSync(new URL('raget/raget-neural/runtime/bitnet-ternary.wgsl', root), 'utf8');
  assert.match(wgsl, /ternary_dot/);
});

test('prefill dan decode memakai workgroup berbeda, subgroup hanya di perangkat yang dikenal', () => {
  assert.equal(schedulePhase('prefill').bound, 'compute');
  assert.equal(schedulePhase('decode').bound, 'bandwidth');
  assert.notDeepEqual(schedulePhase('prefill').workgroup, schedulePhase('decode').workgroup);
  assert.equal(subgroupCaps('Apple M3').subgroups, true);
  assert.equal(subgroupCaps('llvmpipe').subgroups, false);
});

test('jendela KV menahan 10000 token tanpa menyimpan semuanya dan draf melewati 30 token per detik', () => {
  const kv = createKvWindow({ sinks: 4, span: 32 });
  for (let i = 0; i < 10000; i += 1) kv.push(i);
  assert.equal(kv.seen(), 10000);
  assert.equal(kv.stored().length, 36);
  assert.deepEqual(kv.stored().slice(0, 4), [0, 1, 2, 3]);
  const rate = measureThroughput((prefix) => (prefix[prefix.length - 1] + 1) % 97, 80);
  assert.ok(rate > 30);
});
