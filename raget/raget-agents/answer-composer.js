import { translator } from '../../vault/translate/translator.js';

const KEYWORD_DICTIONARY = [
  'ibukota', 'ibukotanya', 'populasi', 'penduduk', 'matauang', 'bahasa',
  'luas', 'merdeka', 'kemerdekaan', 'pemerintahan', 'provinsi', 'kabupaten',
];

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function phoneticNormalize(w) {
  return w
    .replace(/ph/g, 'f')
    .replace(/^qu/g, 'kw')
    .replace(/q/g, 'k')
    .replace(/z/g, 's')
    .replace(/v/g, 'f')
    .replace(/(.)\1+/g, '$1');
}

function correctWord(word) {
  const w = word.toLowerCase();
  if (w.length < 4) return word;
  if (KEYWORD_DICTIONARY.includes(w)) return word;
  const wNorm = phoneticNormalize(w);
  let best = null;
  let bestDist = 3;
  KEYWORD_DICTIONARY.forEach((kw) => {
    if (Math.abs(kw.length - w.length) > 2) return;
    const dist = Math.min(levenshtein(w, kw), levenshtein(wNorm, phoneticNormalize(kw)));
    if (dist < bestDist) {
      bestDist = dist;
      best = kw;
    }
  });
  return best && bestDist <= 2 ? best : word;
}

function correctTypos(text) {
  const src = String(text || '');
  const tokens = src.split(/(\s+)/);
  let changed = false;
  const out = tokens.map((tok) => {
    if (!/^[a-zA-Z]+$/.test(tok)) return tok;
    const corrected = correctWord(tok);
    if (corrected.toLowerCase() !== tok.toLowerCase()) {
      changed = true;
      return corrected;
    }
    return tok;
  });
  let result = out.join('');
  if (/\bmatauang\b/i.test(result)) {
    result = result.replace(/\bmatauang\b/gi, 'mata uang');
    changed = true;
  }
  return changed ? result : src;
}

export const answerComposer = Object.freeze({
  levenshtein,
  correctWord,
  correctTypos,
  looksEnglish,
  looksIndonesian,
  lockAnswer,
});

const EN_FN = new Set(['the', 'of', 'and', 'to', 'in', 'is', 'that', 'for', 'with', 'on', 'as', 'by', 'this', 'from', 'are', 'was', 'be', 'or', 'an', 'it']);
const ID_FN = new Set(['yang', 'dan', 'di', 'ke', 'dari', 'untuk', 'dengan', 'ini', 'itu', 'adalah', 'tidak', 'pada', 'atau', 'juga', 'akan', 'ada', 'dalam', 'sudah', 'bisa']);

function functionHits(text, vocab) {
  const words = String(text || '').toLowerCase().split(/[^\p{L}]+/u).filter(Boolean).slice(0, 80);
  let n = 0;
  words.forEach((w) => { if (vocab.has(w)) n += 1; });
  return n;
}

function looksEnglish(text) {
  const en = functionHits(text, EN_FN);
  const id = functionHits(text, ID_FN);
  return en >= 4 && en > id * 2;
}

function looksIndonesian(text) {
  const en = functionHits(text, EN_FN);
  const id = functionHits(text, ID_FN);
  return id >= 3 && id >= en;
}

async function lockAnswer(question, answer) {
  const src = String(answer || '');
  if (!src.trim() || /```/.test(src)) return src;
  if (!looksEnglish(src) || looksIndonesian(src)) return src;
  const q = String(question || '');
  if (q && looksEnglish(q) && !looksIndonesian(q)) return src;
  if (translator.state !== 'ready') return src;
  const tr = await translator.translate(src, 'id');
  return tr.ok && tr.text ? tr.text : src;
}
