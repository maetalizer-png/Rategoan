export function renderMermaid(src) {
  const edges = [];
  String(src || '').split('\n').forEach((line) => {
    const match = line.trim().match(/^([A-Za-z0-9_]+)\s*-->\s*([A-Za-z0-9_]+)/);
    if (match) edges.push([match[1], match[2]]);
  });
  const nodes = Array.from(new Set(edges.flat()));
  const body = nodes.map((name, index) => '<text x="16" y="' + (28 + index * 28) + '">' + name + '</text>').join('');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 160">' + body + '</svg>';
}

export function mermaidScale(scale) {
  const zoom = Math.max(0.5, Math.min(3, Number(scale) || 1));
  return { zoom, pan: true };
}
