export function createReplica(actor) {
  return { actor: String(actor || 'a'), clock: 0, chars: [] };
}

export function readDoc(doc) {
  return doc.chars.filter((node) => !node.tomb).map((node) => node.ch).join('');
}

export function insertAt(doc, index, text) {
  const ops = [];
  let at = index;
  Array.from(String(text || '')).forEach((ch) => {
    doc.clock += 1;
    const id = doc.actor + ':' + doc.clock;
    const visible = doc.chars.filter((node) => !node.tomb);
    const left = at <= 0 || !visible.length ? null : visible[Math.min(at, visible.length) - 1].id;
    const node = { id, ch, left, tomb: false };
    const pos = left ? doc.chars.findIndex((item) => item.id === left) + 1 : 0;
    doc.chars.splice(Math.max(0, pos), 0, node);
    ops.push({ type: 'ins', id, ch, left });
    at += 1;
  });
  return ops;
}

export function applyOps(doc, ops) {
  (ops || []).forEach((op) => {
    if (op.type === 'del') {
      const node = doc.chars.find((item) => item.id === op.id);
      if (node) node.tomb = true;
      return;
    }
    if (doc.chars.some((item) => item.id === op.id)) return;
    const pos = op.left ? doc.chars.findIndex((item) => item.id === op.left) + 1 : 0;
    doc.chars.splice(pos < 0 ? doc.chars.length : pos, 0, { id: op.id, ch: op.ch, left: op.left, tomb: false });
  });
}
