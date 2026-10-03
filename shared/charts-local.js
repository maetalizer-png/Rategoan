function esc(value) {
  return String(value || '').replace(/[&<>"]/g, (ch) => ({ '&': '&', '<': '<', '>': '>', '"': '"' }[ch]));
}

function nums(data) {
  return (data || []).map((n) => Number(n) || 0);
}

export function buildChartSvg(spec) {
  const type = spec && spec.type || 'bar';
  const title = spec && spec.title || 'Grafik';
  const labels = (spec && spec.labels) || [];
  const series = (spec && spec.datasets && spec.datasets[0]) || { label: '', data: [] };
  const data = nums(series.data);
  const w = 640;
  const h = 360;
  const max = Math.max(1, ...data);
  let body = '';
  if (type === 'pie') {
    const total = data.reduce((a, b) => a + b, 0) || 1;
    let angle = -Math.PI / 2;
    const cx = 220;
    const cy = 190;
    const r = 110;
    data.forEach((value, i) => {
      const slice = (value / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      angle += slice;
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      const large = slice > Math.PI ? 1 : 0;
      const color = ['#184e9e', '#3d7a4a', '#b36b2c', '#6b4c9a', '#9a3d55'][i % 5];
      body += '<path d="M' + cx + ' ' + cy + ' L' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + color + '"/>';
    });
  } else if (type === 'line') {
    const step = data.length > 1 ? 520 / (data.length - 1) : 520;
    const pts = data.map((value, i) => (60 + i * step) + ',' + (300 - (value / max) * 220)).join(' ');
    body += '<polyline fill="none" stroke="#184e9e" stroke-width="3" points="' + pts + '"/>';
  } else {
    const gap = 560 / Math.max(1, data.length);
    data.forEach((value, i) => {
      const bh = (value / max) * 220;
      const x = 50 + i * gap;
      body += '<rect x="' + x + '" y="' + (300 - bh) + '" width="' + Math.max(8, gap - 16) + '" height="' + bh + '" fill="#184e9e"/>';
    });
  }
  labels.forEach((label, i) => {
    const x = type === 'pie' ? 360 : 50 + i * (560 / Math.max(1, labels.length));
    const y = type === 'pie' ? 70 + i * 22 : 330;
    body += '<text x="' + x + '" y="' + y + '" font-size="12" fill="#243040">' + esc(label) + '</text>';
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%"><rect width="100%" height="100%" fill="#fff"/><text x="24" y="32" font-size="16" font-weight="700" fill="#111">' + esc(title) + '</text>' + body + '</svg>';
}

export function parseChartAsk(text) {
  const raw = String(text || '');
  const type = /lingkaran|pie/i.test(raw) ? 'pie' : /garis|line/i.test(raw) ? 'line' : 'bar';
  const pairs = [];
  const re = /([A-Za-zÀ-ÿ][\w .]{0,24}?)\s*[:=]\s*(\d+(?:[.,]\d+)?)/g;
  let match = re.exec(raw);
  while (match) {
    pairs.push([match[1].trim(), Number(match[2].replace(',', '.'))]);
    match = re.exec(raw);
  }
  if (pairs.length < 2) return null;
  return {
    type,
    title: 'Grafik',
    labels: pairs.map((pair) => pair[0]),
    datasets: [{ label: 'Nilai', data: pairs.map((pair) => pair[1]) }],
  };
}
