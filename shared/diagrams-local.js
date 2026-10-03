function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (ch) => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[ch]));
}

export function buildDiagramSvg(spec) {
  const nodes = (spec && spec.nodes) || [];
  const edges = (spec && spec.edges) || [];
  const type = spec && spec.type || 'flowchart';
  const w = 720;
  const h = Math.max(220, 80 + nodes.length * 72);
  let body = '';
  const pos = {};
  nodes.forEach((node, index) => {
    const x = type === 'mindmap' ? 360 : 80;
    const y = 48 + index * 72;
    pos[node.id] = { x, y };
    if (node.shape === 'diamond') {
      body += '<polygon points="' + (x + 70) + ',' + y + ' ' + (x + 140) + ',' + (y + 22) + ' ' + (x + 70) + ',' + (y + 44) + ' ' + x + ',' + (y + 22) + '" fill="#fff" stroke="#184e9e"/>';
    } else if (node.shape === 'pill' || type === 'mindmap') {
      body += '<rect x="' + x + '" y="' + y + '" rx="18" width="140" height="36" fill="#fff" stroke="#184e9e"/>';
    } else {
      body += '<rect x="' + x + '" y="' + y + '" width="140" height="40" fill="#fff" stroke="#184e9e"/>';
    }
    body += '<text x="' + (x + 70) + '" y="' + (y + 24) + '" text-anchor="middle" font-size="13" fill="#111">' + esc(node.label || node.id) + '</text>';
  });
  edges.forEach((edge) => {
    const a = pos[edge.from];
    const b = pos[edge.to];
    if (!a || !b) return;
    body += '<line x1="' + (a.x + 140) + '" y1="' + (a.y + 20) + '" x2="' + b.x + '" y2="' + (b.y + 20) + '" stroke="#5c6570"/>';
    if (edge.label) body += '<text x="' + ((a.x + b.x) / 2 + 70) + '" y="' + ((a.y + b.y) / 2 + 16) + '" font-size="11" fill="#5c6570">' + esc(edge.label) + '</text>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" class="rategoan-diagram" viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%">' + body + '</svg>';
}

export function parseDiagramAsk(text) {
  const raw = String(text || '');
  if (!/\b(diagram|alur|flowchart|mindmap|peta pikiran)\b/i.test(raw)) return null;
  const bits = raw.split(/->|→|lalu|kemudian/i).map((part) => part.replace(/buat(kan)?|diagram|alur|flowchart|mindmap|peta pikiran/ig, '').trim()).filter((part) => part.length > 1).slice(0, 6);
  if (bits.length < 2) return null;
  const nodes = bits.map((label, index) => ({ id: 'n' + index, label: label.slice(0, 28), shape: index === 0 || index === bits.length - 1 ? 'pill' : 'rect' }));
  const edges = nodes.slice(1).map((node, index) => ({ from: nodes[index].id, to: node.id, label: '' }));
  return { type: /mindmap|peta pikiran/i.test(raw) ? 'mindmap' : 'flowchart', nodes, edges };
}
