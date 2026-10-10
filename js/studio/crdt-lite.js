function wins(next, prev) {
  if (!prev) return true;
  if (next.clock !== prev.clock) return next.clock > prev.clock;
  return String(next.replica) > String(prev.replica);
}

export function crdtPut(doc, key, value, clock, replica) {
  const next = { value, clock: Number(clock) || 0, replica: String(replica || '') };
  if (wins(next, doc[key])) doc[key] = next;
  return doc;
}

export function crdtMerge(left, right) {
  const out = {};
  Object.keys(left || {}).forEach((key) => {
    const row = left[key];
    crdtPut(out, key, row.value, row.clock, row.replica);
  });
  Object.keys(right || {}).forEach((key) => {
    const row = right[key];
    crdtPut(out, key, row.value, row.clock, row.replica);
  });
  return out;
}
