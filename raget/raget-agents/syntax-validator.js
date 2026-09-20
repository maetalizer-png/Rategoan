/** QC cuplikan kode sebelum tampil. Setara web-qc.js untuk hasil generate. */

function stripFence(src) {
  const s = String(src || '').trim();
  const m = s.match(/^```(?:javascript|js|python|py|html|css)?\s*\n([\s\S]*?)\n```$/i);
  return m ? m[1] : s;
}

function countPair(s, open, close) {
  let n = 0;
  let inStr = null;
  let esc = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inStr) {
      if (esc) {
        esc = false;
        continue;
      }
      if (c === '\\') {
        esc = true;
        continue;
      }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') {
      inStr = c;
      continue;
    }
    if (c === open) n++;
    else if (c === close) n--;
    if (n < 0) return n;
  }
  return n;
}

function validateJs(src) {
  const code = stripFence(src);
  const issues = [];
  if (countPair(code, '{', '}') !== 0) issues.push('kurung-kurawal');
  if (countPair(code, '(', ')') !== 0) issues.push('kurung-biasa');
  if (countPair(code, '[', ']') !== 0) issues.push('kurung-siku');
  if (/<\s*script[\s>]/i.test(code)) issues.push('script-tag');
  return { ok: issues.length === 0, issues, lang: 'js' };
}

function validateFence(text) {
  const t = String(text || '');
  if (/<script[\s>]/i.test(t) && !/```/.test(t)) {
    return { ok: false, issues: ['html-bocor'] };
  }
  const fences = t.match(/```/g);
  if (fences && fences.length % 2 !== 0) return { ok: false, issues: ['fence-ganjil'] };
  return { ok: true, issues: [] };
}

export const syntaxValidator = Object.freeze({
  stripFence,
  validateJs,
  validateFence,
});
