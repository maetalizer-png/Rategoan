export function verifyClaims(text, facts) {
  const body = String(text || '');
  const issues = [];
  (facts || []).forEach((fact) => {
    if (!fact || !fact.pattern) return;
    if (!new RegExp(fact.pattern, 'i').test(body)) return;
    if (fact.forbid && new RegExp(fact.forbid, 'i').test(body)) issues.push(fact.id || fact.pattern);
  });
  return { ok: issues.length === 0, issues };
}

export function numericConsistent(text) {
  const found = String(text || '').match(/(\d+(?:[.,]\d+)?)\s*%/g) || [];
  const values = found.map((item) => Number(String(item).replace('%', '').replace(',', '.').trim()));
  const bad = values.filter((n) => n > 100);
  return { ok: bad.length === 0, values };
}