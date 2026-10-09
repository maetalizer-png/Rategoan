export function draftContract() {
  return { draft: '15M-50M', target: '1.5B', parallel: true, weights: false };
}

export function verifyDraft(step, prefix, draft) {
  const accepted = [];
  const cur = prefix.slice();
  for (let i = 0; i < draft.length; i += 1) {
    const next = step(cur);
    if (next !== draft[i]) break;
    accepted.push(next);
    cur.push(next);
  }
  const bonus = step(cur);
  return { accepted, bonus, tokens: accepted.length + 1 };
}

export function measureThroughput(step, rounds) {
  const n = rounds || 400;
  const t0 = performance.now();
  let tokens = 0;
  let prefix = [1];
  for (let i = 0; i < n; i += 1) {
    const draft = [];
    const cursor = prefix.slice();
    for (let k = 0; k < 4; k += 1) {
      const next = step(cursor);
      draft.push(next);
      cursor.push(next);
    }
    const out = verifyDraft(step, prefix, draft);
    tokens += out.tokens;
    prefix = prefix.concat(out.accepted, [out.bonus]).slice(-8);
  }
  const seconds = Math.max((performance.now() - t0) / 1000, 1e-6);
  return tokens / seconds;
}
