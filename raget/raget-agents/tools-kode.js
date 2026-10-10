import { llmCodeParser } from '../raget-neural/llm-code-parser.js';
import { syntaxValidator } from './syntax-validator.js';

const PACK_URL = new URL('../raget-data/jsonl/kode/code-pack.jsonl', import.meta.url);

let packCache = null;

const CODE_LANG_RE =
  /\b(javascript|ecmascript|\bjs\b|python|\bpy\b|html5?|\bcss\b|typescript|node\.?js)\b/i;
const CODE_TOKEN_RE =
  /\b(kode|coding|ngoding|pemrograman|programmer|syntax|sintaks|console\.log|consle\.log|document\.|queryselector|json\.parse|array\.map|async\s+await|const\s+|let\s+|var\s+|function\b|def\s+\w+\s*\(|<\/?[a-z][\s>]|npm\b)\b/i;
const CODE_ASK_RE =
  /\b(tulis\s+(fungsi|function|kode|script)|buat(kan)?\s+(fungsi|function|kode|script)|perbaiki\s+(kode|bug|syntax|sintaks)|refactor|cuplikan)\b/i;
const BIO_RE = /\b(organ|jantung|paru|hati|ginjal|otak\s+manusia|tumbuhan)\b/i;

function isCodeQuestion(prompt) {
  const t = String(prompt || '');
  if (!t.trim()) return false;
  if (/^(selamat|halo|hai|pagi|siang|sore|malam|apa\s+kabar|kabar)\b/i.test(t.trim())) return false;
  if (BIO_RE.test(t) && !CODE_LANG_RE.test(t) && !CODE_TOKEN_RE.test(t)) return false;
  return CODE_LANG_RE.test(t) || CODE_TOKEN_RE.test(t) || CODE_ASK_RE.test(t);
}

function detectLang(prompt) {
  return llmCodeParser.detectLang(prompt, prompt);
}

async function loadPack() {
  if (packCache) return packCache;
  try {
    const res = await fetch(PACK_URL);
    const raw = res.ok ? await res.text() : '';
    packCache = raw
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => {
        try {
          return JSON.parse(l);
        } catch (e) {
          return null;
        }
      })
      .filter(Boolean);
  } catch (e) {
    packCache = [];
  }
  return packCache;
}

function scoreHit(q, row) {
  const hay = (
    (row.instruction || '') +
    ' ' +
    (row.text || '') +
    ' ' +
    (row.code || '') +
    ' ' +
    (row.lang || '')
  ).toLowerCase();
  const words = String(q || '')
    .toLowerCase()
    .split(/[^a-z0-9_]+/)
    .filter((w) => w.length > 2);
  let n = 0;
  words.forEach((w) => {
    if (hay.includes(w)) n++;
  });
  return n;
}

async function retrieve(prompt, limit) {
  const pack = await loadPack();
  const ranked = pack
    .map((row) => ({ row, score: scoreHit(prompt, row) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit || 3)
    .map((x) => x.row);
  return ranked;
}

function fence(lang, code) {
  const tag = lang === 'py' ? 'python' : lang === 'html' ? 'html' : lang === 'css' ? 'css' : 'javascript';
  return '```' + tag + '\n' + String(code || '').replace(/\s+$/, '') + '\n```';
}

async function compose(prompt) {
  const hits = await retrieve(prompt, 2);
  const lang = detectLang(prompt);
  if (!(hits.length && hits[0].code)) {
    return {
      text: 'Sintesis kode tidak memakai tabel tetap. Bobot neural belum terpasang.',
      engine: 'kode',
      lang,
      table: false,
    };
  }
  const text = hits[0].text || hits[0].instruction || 'Contoh dari pack kode Raget.';
  const code = hits[0].code;
  const usedLang = hits[0].lang || lang;
  const body = text.trim() + '\n\n' + fence(usedLang, code);
  const qc = syntaxValidator.validateFence(body);
  const jsQc = usedLang === 'js' ? syntaxValidator.validateJs(code) : { ok: true, issues: [] };
  if (!qc.ok || !jsQc.ok) {
    return {
      text: text.trim() + '\n\n(Cuplikan ditahan: ' + (qc.issues.concat(jsQc.issues).join(', ') || 'qc') + '.)',
      engine: 'kode',
      qc: { fence: qc, js: jsQc },
    };
  }
  return { text: body, engine: 'kode', lang: usedLang, qc: { fence: qc, js: jsQc } };
}

async function run(kind, prompt) {
  if (kind !== 'kode' && !isCodeQuestion(prompt)) return null;
  const out = await compose(prompt);
  return out && out.text;
}

function source() {
  return { table: false, weights: false, download: false };
}

export const toolsKode = Object.freeze({
  isCodeQuestion,
  detectLang,
  retrieve,
  compose,
  run,
  source,
  handles: (kind) => kind === 'kode',
});
