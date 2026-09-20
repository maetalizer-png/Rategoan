#!/usr/bin/env node
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { toolsKode } from '../raget-agents/tools-kode.js';
import { syntaxValidator } from '../raget-agents/syntax-validator.js';
import { llmCodeParser } from '../raget-neural/llm-code-parser.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(await readFile(path.join(root, 'bench-kode-cases.json'), 'utf8'));

function hasId(text) {
  return /\b(adalah|fungsi|contoh|pakai|mengembalikan|blok|typo|cuplikan)\b/i.test(text);
}

function detectKode(prompt) {
  return toolsKode.isCodeQuestion(prompt) ? 'kode' : null;
}

const rows = [];
for (const c of cases) {
  const intent = detectKode(c.prompt);
  const out = await toolsKode.compose(c.prompt);
  const text = String(out && out.text ? out.text : '');
  const fences = llmCodeParser.extractFences(text);
  const code = fences.length ? fences[0].code : '';
  const lang = fences.length ? fences[0].lang : '';
  const jsOk = lang !== 'js' || !code || syntaxValidator.validateJs(code).ok;
  const fenceOk = syntaxValidator.validateFence(text).ok;
  const needOk = (c.need || []).every((n) => text.toLowerCase().includes(n.toLowerCase()));
  const explainOk = c.kind !== 'explain' || hasId(text);
  const intentOk = intent === 'kode';
  const pass = intentOk && fenceOk && jsOk && needOk && explainOk && fences.length > 0;
  rows.push({
    id: c.id,
    prompt: c.prompt,
    intent,
    pass,
    intentOk,
    fenceOk,
    jsOk,
    needOk,
    explainOk,
  });
}

const sapaan = ['Selamat malam', 'Halo', 'Bagaimana kabar anda'].map((p) => ({
  prompt: p,
  intent: detectKode(p),
  pass: detectKode(p) !== 'kode',
}));
const organ = detectKode('Apa fungsi jantung');
const organPass = organ !== 'kode';

const nPass = rows.filter((r) => r.pass).length;
const report = {
  pass: nPass,
  total: rows.length,
  ok: nPass >= 8,
  sapaanOk: sapaan.every((s) => s.pass),
  organBukanKode: organPass,
  rows,
  sapaan,
};
console.log(JSON.stringify(report, null, 2));
if (!report.ok) process.exit(2);
