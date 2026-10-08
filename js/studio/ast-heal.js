import { syntaxValidator } from '../../raget/raget-agents/syntax-validator.js';

const PAIRS = { '(': ')', '[': ']', '{': '}' };

export function scanDelimiters(code) {
  const src = String(code || '');
  const stack = [];
  let i = 0;
  let inStr = null;
  let inLine = false;
  let inBlock = false;
  let inRegex = false;
  let escaped = false;
  while (i < src.length) {
    const c = src[i];
    const n = src[i + 1];
    if (inLine) {
      if (c === '\n') inLine = false;
      i += 1;
      continue;
    }
    if (inBlock) {
      if (c === '*' && n === '/') { inBlock = false; i += 2; continue; }
      i += 1;
      continue;
    }
    if (inStr) {
      if (escaped) { escaped = false; i += 1; continue; }
      if (c === '\\') { escaped = true; i += 1; continue; }
      if (c === inStr) inStr = null;
      i += 1;
      continue;
    }
    if (inRegex) {
      if (escaped) { escaped = false; i += 1; continue; }
      if (c === '\\') { escaped = true; i += 1; continue; }
      if (c === '/') inRegex = false;
      i += 1;
      continue;
    }
    if (c === '/' && n === '/') { inLine = true; i += 2; continue; }
    if (c === '/' && n === '*') { inBlock = true; i += 2; continue; }
    if (c === '"' || c === "'" || c === '`') { inStr = c; i += 1; continue; }
    if (c === '/' && /[=([,;!&|?:{]\s*$/.test(src.slice(Math.max(0, i - 8), i))) {
      inRegex = true;
      i += 1;
      continue;
    }
    if (PAIRS[c]) stack.push(c);
    else if (c === ')' || c === ']' || c === '}') {
      const top = stack[stack.length - 1];
      if (top && PAIRS[top] === c) stack.pop();
    }
    i += 1;
  }
  return stack;
}

export function healSyntax(code) {
  const src = String(code || '');
  const report = syntaxValidator.validateJs(src);
  if (report.ok) return { ok: true, code: src, healed: false, issues: [] };
  const stack = scanDelimiters(src);
  if (!stack.length || !report.issues.some((item) => item.indexOf('kurung') === 0)) {
    return { ok: false, code: src, healed: false, issues: report.issues };
  }
  let next = src;
  for (let i = stack.length - 1; i >= 0; i -= 1) next += PAIRS[stack[i]];
  const again = syntaxValidator.validateJs(next);
  if (again.ok) return { ok: true, code: next, healed: true, issues: [] };
  return { ok: false, code: next, healed: false, issues: again.issues };
}

export function prepareSource(path, content) {
  if (!/\.js$/i.test(String(path || ''))) return { ok: true, code: String(content == null ? '' : content), healed: false };
  const healed = healSyntax(content);
  if (!healed.ok) {
    const err = new Error('Sintaks tidak sah: ' + (healed.issues || []).join(','));
    err.issues = healed.issues;
    throw err;
  }
  return healed;
}
