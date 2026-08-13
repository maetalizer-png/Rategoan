import { memoryIndex } from '../raget-memory/memory-index.js';
import { memoryLong } from '../raget-memory/memory-long.js';
import { ragetDb } from '../raget-database/raget-db.js';

const SAFE_EXPR = /^[0-9+\-*/%().\s]+$/;
const NUMBER_RE = /^[0-9.]+$/;
const PRECEDENCE = { '+': 1, '-': 1, '*': 2, '/': 2, '%': 2 };

function tokenize(expr) {
  const tokens = [];
  const re = /([0-9]*\.?[0-9]+|[+\-*/%()])/g;
  let match;
  let cursor = 0;
  while ((match = re.exec(expr)) !== null) {
    const gap = expr.slice(cursor, match.index);
    if (gap.trim() !== '') return null;
    tokens.push(match[1]);
    cursor = match.index + match[1].length;
  }
  if (expr.slice(cursor).trim() !== '') return null;
  return tokens;
}

function toRPN(tokens) {
  const output = [];
  const ops = [];
  let prevToken = null;
  tokens.forEach((token) => {
    if (NUMBER_RE.test(token)) {
      output.push(token);
    } else if (token === '(') {
      ops.push(token);
    } else if (token === ')') {
      while (ops.length && ops[ops.length - 1] !== '(') output.push(ops.pop());
      ops.pop();
    } else {
      if (token === '-' && (prevToken === null || prevToken === '(' || PRECEDENCE[prevToken])) {
        output.push('0');
      }
      while (ops.length && PRECEDENCE[ops[ops.length - 1]] >= PRECEDENCE[token]) {
        output.push(ops.pop());
      }
      ops.push(token);
    }
    prevToken = token;
  });
  while (ops.length) output.push(ops.pop());
  return output;
}

function evalRPN(rpn) {
  const stack = [];
  for (const token of rpn) {
    if (NUMBER_RE.test(token)) {
      stack.push(parseFloat(token));
      continue;
    }
    const b = stack.pop();
    const a = stack.pop();
    if (a === undefined || b === undefined) return null;
    if (token === '+') stack.push(a + b);
    else if (token === '-') stack.push(a - b);
    else if (token === '*') stack.push(a * b);
    else if (token === '/') stack.push(b === 0 ? NaN : a / b);
    else if (token === '%') stack.push(b === 0 ? NaN : a % b);
  }
  return stack.length === 1 ? stack[0] : null;
}

function safeEval(expr) {
  const tokens = tokenize(expr);
  if (!tokens || !tokens.length) return null;
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);
  return typeof result === 'number' && isFinite(result) ? result : null;
}

function trimNum(n) {
  return Math.round(n * 1e6) / 1e6;
}

function ringkas(text) {
  const src = String(text || '').trim();
  if (!src) return 'Tidak ada teks untuk diringkas.';
  const sentences = src.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= 1) return 'Ringkasan: ' + src;
  const head = sentences[0];
  const tail = sentences[sentences.length - 1];
  return 'Ringkasan: ' + head + (tail !== head ? ' ... ' + tail : '');
}

function ringkasPercakapan(messages) {
  const recent = (Array.isArray(messages) ? messages : []).slice(-10).filter((m) => m.role === 'user');
  if (!recent.length) return 'Belum ada percakapan untuk diringkas.';
  const points = recent.map((m) => {
    const sentences = String(m.text || '')
      .split(/(?<=[.!?])\s+/)
      .filter(Boolean);
    return sentences.sort((a, b) => b.length - a.length)[0] || m.text;
  });
  return 'Ringkasan percakapan:\n' + points.map((p, i) => i + 1 + '. ' + p).join('\n');
}

function hitung(text) {
  const src = String(text || '').trim();
  const percentMatch = src.match(/(-?[0-9.]+)\s*%\s*dari\s*(-?[0-9.]+)/i);
  if (percentMatch) {
    const pct = parseFloat(percentMatch[1]);
    const base = parseFloat(percentMatch[2]);
    return pct + '% dari ' + base + ' = ' + trimNum((pct / 100) * base);
  }
  const cleaned = src.replace(/^(hitung|berapa)\s*/i, '').trim();
  if (!cleaned || !SAFE_EXPR.test(cleaned)) return 'Ekspresi tidak valid. Gunakan angka dan operator +, -, *, /, % saja.';
  const result = safeEval(cleaned);
  if (result == null) return 'Tidak bisa menghitung ekspresi itu.';
  return cleaned + ' = ' + trimNum(result);
}

function waktu(text) {
  const t = String(text || '').toLowerCase();
  const now = new Date();
  if (/jam\s+berapa/.test(t)) {
    return 'Sekarang jam ' + now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '.';
  }
  if (/hari\s+apa/.test(t)) {
    return 'Hari ini ' + now.toLocaleDateString('id-ID', { weekday: 'long' }) + '.';
  }
  if (/tanggal\s+berapa/.test(t)) {
    return 'Hari ini tanggal ' + now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) + '.';
  }
  return (
    now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ', pukul ' +
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  );
}

async function cari(query) {
  const q = String(query || '').trim();
  if (!q) return 'Mau cari info tentang apa?';
  const results = await memoryIndex.search(q, 3);
  if (!results.length) return 'Saya belum punya catatan soal "' + q + '". Coba ceritakan, nanti saya ingat.';
  return 'Yang saya tahu soal "' + q + '": ' + results.map((r) => r.text).join(' | ');
}

function ingat(text) {
  const fact = String(text || '')
    .replace(/^ingat\s*(bahwa)?\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya ingat apa?';
  memoryLong.rememberNote(fact);
  return 'Baik, saya ingat: "' + fact + '".';
}

function lupakan(text) {
  const fact = String(text || '')
    .replace(/^lupakan\s*/i, '')
    .trim();
  if (!fact) return 'Mau saya lupakan yang mana?';
  return memoryLong.forgetNote(fact) ? 'Sudah saya lupakan soal "' + fact + '".' : 'Saya tidak menemukan catatan soal "' + fact + '".';
}

function eksporLog() {
  const notes = ragetDb.allNotes();
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'raget-log-' + new Date().toISOString().slice(0, 10) + '.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
  return 'Log percakapan (' + notes.length + ' entri) sudah diunduh.';
}

export const agentTools = Object.freeze({
  ringkas,
  ringkasPercakapan,
  hitung,
  waktu,
  cari,
  ingat,
  lupakan,
  eksporLog,
});
