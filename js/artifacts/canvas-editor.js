export function createReplica(actor) {
  return { actor: String(actor || 'a'), clock: 0, chars: [] };
}

export function readDoc(doc) {
  return doc.chars.filter((node) => !node.tomb).map((node) => node.ch).join('');
}

function integrate(doc, node) {
  if (doc.chars.some((item) => item.id === node.id)) return;
  const byId = new Map(doc.chars.map((item) => [item.id, item]));
  let pos = 0;
  if (node.left) {
    const at = doc.chars.findIndex((item) => item.id === node.left);
    pos = at < 0 ? doc.chars.length : at + 1;
  }
  while (pos < doc.chars.length) {
    const other = doc.chars[pos];
    if (other.left === node.left && other.id < node.id) {
      pos += 1;
      continue;
    }
    if (underSmallerSibling(other, node, byId)) {
      pos += 1;
      continue;
    }
    break;
  }
  doc.chars.splice(pos, 0, node);
}

function underSmallerSibling(other, node, byId) {
  let cur = other;
  const seen = new Set();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    if (!cur.left) return false;
    if (cur.left === node.left) return cur.id < node.id;
    cur = byId.get(cur.left);
  }
  return false;
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
    integrate(doc, node);
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
    integrate(doc, { id: op.id, ch: op.ch, left: op.left, tomb: false });
  });
}

export function deleteAt(doc, index) {
  const visible = doc.chars.filter((node) => !node.tomb);
  const node = visible[index];
  if (!node) return [];
  node.tomb = true;
  return [{ type: 'del', id: node.id }];
}

export function pendingOps(doc) {
  const ops = [];
  doc.chars.forEach((node) => {
    ops.push({ type: 'ins', id: node.id, ch: node.ch, left: node.left });
    if (node.tomb) ops.push({ type: 'del', id: node.id });
  });
  return ops;
}

export function syncPair(left, right) {
  const map = new Map();
  left.chars.concat(right.chars).forEach((node) => {
    const prev = map.get(node.id);
    map.set(node.id, {
      id: node.id,
      ch: node.ch,
      left: node.left,
      tomb: !!((prev && prev.tomb) || node.tomb),
    });
  });
  const nodes = Array.from(map.values());
  function lay(doc) {
    doc.chars = [];
    const pending = nodes.slice();
    let guard = pending.length * pending.length + 1;
    while (pending.length && guard > 0) {
      guard -= 1;
      const next = pending.findIndex((node) => !node.left || doc.chars.some((item) => item.id === node.left));
      if (next < 0) break;
      const node = pending.splice(next, 1)[0];
      integrate(doc, { id: node.id, ch: node.ch, left: node.left, tomb: false });
      if (node.tomb) {
        const placed = doc.chars.find((item) => item.id === node.id);
        if (placed) placed.tomb = true;
      }
    }
  }
  lay(left);
  lay(right);
  return { left: readDoc(left), right: readDoc(right) };
}
