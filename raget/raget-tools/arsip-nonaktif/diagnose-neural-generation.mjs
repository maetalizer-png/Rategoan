// vNext Fase C - diagnostik TANPA FIX: kenapa generasi preset tiny masih
// degenerate/terpotong padahal held-out perplexity turun signifikan
// (8.072 -> 2.401)? Skrip ini HANYA mengukur dan melaporkan - tidak
// mengubah kode neural apa pun.
//
// Yang diukur untuk tiap kombinasi (greedy/sampling x beberapa
// temperature) dan tiap prompt:
// - posisi step EOS diemisikan (atau "tidak pernah" kalau mentok
//   maxNewTokens)
// - tingkat repetisi: rasio token BERURUTAN yang sama persis (mis. "X X
//   X"), dan type-token ratio (token unik / total token, makin rendah =
//   makin repetitif)
//
// Pakai checkpoint SafeTensors preset tiny yang sudah dilatih
// (raget-neural-tiny.safetensors, hasil BLOK 1-3) - bukan model baru.
//
// Pakai: node raget/raget-tools/diagnose-neural-generation.mjs

import { readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { RATEGOAN } from '../raget-neural/llm-core.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..', '..');
const CHECKPOINT_FILE = path.join(ROOT, 'raget', 'raget-data', 'neural', 'raget-neural-tiny.safetensors');
const REPORT_FILE = path.join(ROOT, 'raget', 'raget-devlog', 'neural', 'diagnose-neural-generation-report.json');

const PROMPTS = [
  'Apa ibu kota Indonesia?',
  'Siapa itu Albert Einstein?',
  'Ceritakan tentang Rategoan',
  'Halo, apa kabar?',
  'Apa itu localStorage?',
];

const CONFIGS = [
  { label: 'greedy', greedy: true },
  { label: 'sampling-t0.5', greedy: false, temperature: 0.5 },
  { label: 'sampling-t0.7', greedy: false, temperature: 0.7 },
  { label: 'sampling-t0.9', greedy: false, temperature: 0.9 },
  { label: 'sampling-t1.2', greedy: false, temperature: 1.2 },
];

function analyzeTokenIds(tokenIds) {
  if (tokenIds.length === 0) {
    return { consecutiveRepeatRate: null, typeTokenRatio: null };
  }
  let repeats = 0;
  for (let i = 1; i < tokenIds.length; i++) {
    if (tokenIds[i] === tokenIds[i - 1]) repeats++;
  }
  const consecutiveRepeatRate = tokenIds.length > 1 ? repeats / (tokenIds.length - 1) : 0;
  const uniqueCount = new Set(tokenIds).size;
  const typeTokenRatio = uniqueCount / tokenIds.length;
  return { consecutiveRepeatRate: Number(consecutiveRepeatRate.toFixed(4)), typeTokenRatio: Number(typeTokenRatio.toFixed(4)) };
}

async function main() {
  console.log('Memuat checkpoint SafeTensors preset tiny:', path.relative(ROOT, CHECKPOINT_FILE));
  const bytes = readFileSync(CHECKPOINT_FILE);
  const buffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  RATEGOAN.restoreFromCheckpointSafetensors(buffer);
  console.log('Stats:', JSON.stringify(RATEGOAN.getStats()));

  const results = [];
  for (const config of CONFIGS) {
    console.log('\n=== Konfigurasi:', config.label, '===');
    for (const prompt of PROMPTS) {
      const out = await RATEGOAN.generateText(prompt, {
        maxNewTokens: 40,
        greedy: config.greedy,
        temperature: config.temperature,
      });
      const analysis = analyzeTokenIds(out.tokenIds);
      const eosStep = out.stoppedAtEos ? out.tokensGenerated : null;
      console.log(
        '  "' + prompt + '" -> "' + out.text.slice(0, 60) + (out.text.length > 60 ? '...' : '') + '"',
        '| tokensGenerated:', out.tokensGenerated,
        '| eosStep:', eosStep === null ? 'tidak pernah (mentok maxNewTokens)' : eosStep,
        '| repeatRate:', analysis.consecutiveRepeatRate,
        '| typeTokenRatio:', analysis.typeTokenRatio
      );
      results.push({
        config: config.label,
        prompt,
        text: out.text,
        tokensGenerated: out.tokensGenerated,
        stoppedAtEos: out.stoppedAtEos,
        eosStep,
        consecutiveRepeatRate: analysis.consecutiveRepeatRate,
        typeTokenRatio: analysis.typeTokenRatio,
      });
    }
  }

  const byConfig = {};
  for (const c of CONFIGS) {
    const rows = results.filter((r) => r.config === c.label);
    const eosHits = rows.filter((r) => r.stoppedAtEos);
    byConfig[c.label] = {
      n: rows.length,
      eosHitRate: Number((eosHits.length / rows.length).toFixed(4)),
      avgEosStep: eosHits.length ? Number((eosHits.reduce((s, r) => s + r.eosStep, 0) / eosHits.length).toFixed(2)) : null,
      avgTokensGenerated: Number((rows.reduce((s, r) => s + r.tokensGenerated, 0) / rows.length).toFixed(2)),
      avgConsecutiveRepeatRate: Number((rows.reduce((s, r) => s + r.consecutiveRepeatRate, 0) / rows.length).toFixed(4)),
      avgTypeTokenRatio: Number((rows.reduce((s, r) => s + r.typeTokenRatio, 0) / rows.length).toFixed(4)),
    };
  }

  console.log('\n=== RINGKASAN PER KONFIGURASI ===');
  console.log(JSON.stringify(byConfig, null, 2));

  writeFileSync(REPORT_FILE, JSON.stringify({ generatedAt: new Date().toISOString(), byConfig, results }, null, 2), 'utf8');
  console.log('\nLaporan ditulis:', path.relative(ROOT, REPORT_FILE));
}

main().catch((e) => {
  console.error('GAGAL:', e.stack || e.message);
  process.exit(1);
});
