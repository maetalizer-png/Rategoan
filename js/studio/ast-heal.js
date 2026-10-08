import { syntaxValidator } from '../../raget/raget-agents/syntax-validator.js';

function closer(src, open, close) {
  const left = (src.match(new RegExp('\\' + open, 'g')) || []).length;
  const right = (src.match(new RegExp('\\' + close, 'g')) || []).length;
  return right < left ? close.repeat(left - right) : '';
}

export function healSyntax(code) {
  let src = String(code || '');
  let report = syntaxValidator.validateJs(src);
  if (report.ok) return { ok: true, code: src, healed: false, issues: [] };
  if (report.issues.some((item) => item.indexOf('kurung') === 0)) {
    src += closer(src, '{', '}');
    src += closer(src, '(', ')');
    src += closer(src, '[', ']');
    report = syntaxValidator.validateJs(src);
    if (report.ok) return { ok: true, code: src, healed: true, issues: [] };
  }
  return { ok: false, code: src, healed: false, issues: report.issues };
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
