export function escapeChartText(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nums(data) {
  return (data || []).map((n) => Number(n) || 0);
}

export function buildChartSvg(spec) {
  const type = (spec && spec.type) || 'bar';
  const title = (spec && spec.title) || 'Grafik';
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
    const cx = 210;
    const cy = 195;
    const r = 108;
    data.forEach((value, i) => {
      const slice = (value / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(angle);
      const y1 = cy + r * Math.sin(angle);
      angle += slice;
      const x2 = cx + r * Math.cos(angle);
      const y2 = cy + r * Math.sin(angle);
      const large = slice > Math.PI ? 1 : 0;
      const color = ['#1a4b8c', '#2563eb', '#0d9488', '#d97706', '#7c3aed'][i % 5];
      body += '<path d="M' + cx + ' ' + cy + ' L' + x1 + ' ' + y1 + ' A' + r + ' ' + r + ' 0 ' + large + ' 1 ' + x2 + ' ' + y2 + ' Z" fill="' + color + '" stroke="#ffffff" stroke-width="2"/>';
    });
  } else if (type === 'line') {
    for (let g = 0; g <= 4; g += 1) {
      const gy = 80 + g * 55;
      body += '<line x1="48" y1="' + gy + '" x2="596" y2="' + gy + '" stroke="#e2e8f0" stroke-dasharray="4 4" stroke-width="1"/>';
    }
    const step = data.length > 1 ? 520 / (data.length - 1) : 520;
    const pts = data.map((value, i) => (60 + i * step) + ',' + (300 - (value / max) * 210)).join(' ');
    body += '<polyline fill="none" stroke="#1a4b8c" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" points="' + pts + '"/>';
    data.forEach((value, i) => {
      const px = 60 + i * step;
      const py = 300 - (value / max) * 210;
      body += '<circle cx="' + px + '" cy="' + py + '" r="5" fill="#ffffff" stroke="#1a4b8c" stroke-width="3"/>';
      body += '<text x="' + px + '" y="' + (py - 10) + '" font-size="11.5" font-weight="600" text-anchor="middle" fill="#0f172a">' + escapeChartText(value) + '</text>';
    });
  } else {
    for (let g = 0; g <= 4; g += 1) {
      const gy = 80 + g * 55;
      body += '<line x1="48" y1="' + gy + '" x2="596" y2="' + gy + '" stroke="#e2e8f0" stroke-dasharray="4 4" stroke-width="1"/>';
    }
    const gap = 540 / Math.max(1, data.length);
    const barW = Math.min(72, Math.max(18, gap - 28));
    data.forEach((value, i) => {
      const bh = Math.max(4, (value / max) * 210);
      const x = 54 + i * gap + (gap - barW) / 2;
      const y = 300 - bh;
      body += '<rect x="' + x + '" y="' + y + '" width="' + barW + '" height="' + bh + '" rx="6" fill="#1a4b8c"/>';
      body += '<text x="' + (x + barW / 2) + '" y="' + (y - 8) + '" font-size="12" font-weight="650" text-anchor="middle" fill="#0f172a">' + escapeChartText(value) + '</text>';
    });
  }
  labels.forEach((label, i) => {
    if (type === 'pie') {
      const color = ['#1a4b8c', '#2563eb', '#0d9488', '#d97706', '#7c3aed'][i % 5];
      const ly = 96 + i * 28;
      body += '<rect x="356" y="' + (ly - 10) + '" width="12" height="12" rx="3" fill="' + color + '"/>';
      body += '<text x="376" y="' + ly + '" font-size="12.5" font-weight="500" fill="#1e293b">' + escapeChartText(label) + ' (' + escapeChartText(data[i] != null ? data[i] : '') + ')</text>';
    } else {
      const gap = 540 / Math.max(1, labels.length);
      const lx = type === 'line'
        ? (60 + i * (labels.length > 1 ? 520 / (labels.length - 1) : 520))
        : (54 + i * gap + gap / 2);
      body += '<text x="' + lx + '" y="326" font-size="12" font-weight="550" text-anchor="middle" fill="#334155">' + escapeChartText(label) + '</text>';
    }
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="100%" height="100%" style="font-family:system-ui,-apple-system,sans-serif"><rect width="100%" height="100%" rx="12" fill="#ffffff"/><text x="28" y="38" font-size="16" font-weight="700" fill="#0f172a">' + escapeChartText(title) + '</text>' + body + '</svg>';
}

export function parseChartAsk(text) {
  const raw = String(text || '');
  const type = /lingkaran|pie/i.test(raw) ? 'pie' : /garis|line/i.test(raw) ? 'line' : 'bar';
  const stripped = raw.replace(/^.*?\b(?:buat(?:kan)?|bikin|tampilkan|gambar(?:kan)?)\s+(?:grafik|chart)\s*(?:batang|garis|lingkaran|bar|line|pie)?\s*(?:tentang|untuk|data)?\s*/i, '')
    .replace(/^(?:grafik|chart)\s*(?:batang|garis|lingkaran|bar|line|pie)?\s*(?:tentang|untuk|data)?\s*/i, '');
  const pairs = [];
  const segments = stripped.split(/[,;\n]+/);
  let inferredTitle = 'Grafik';
  segments.forEach((seg, idx) => {
    const m = seg.match(/^\s*([^:=]+?)\s*[:=]\s*(-?\d+(?:[.,]\d+)?)\s*$/);
    if (!m) return;
    let label = m[1].trim();
    if (idx === 0) {
      const titleMatch = label.match(/^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s]{2,20}?)\s+(Q[1-4]|\d{4}|Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Sep|Okt|Nov|Des|\S+)$/i);
      if (titleMatch && segments.length > 1) {
        inferredTitle = 'Grafik ' + titleMatch[1].trim();
        label = titleMatch[2].trim();
      }
    }
    pairs.push([label.slice(0, 24), Number(m[2].replace(',', '.'))]);
  });
  if (pairs.length < 2) {
    const re = /([A-Za-z0-9À-ÿ][\w .-]{0,20}?)\s*[:=]\s*(-?\d+(?:[.,]\d+)?)/g;
    let match = re.exec(stripped);
    while (match) {
      pairs.push([match[1].trim(), Number(match[2].replace(',', '.'))]);
      match = re.exec(stripped);
    }
  }
  if (pairs.length < 2) return null;
  return {
    type,
    title: inferredTitle,
    labels: pairs.map((pair) => pair[0]),
    datasets: [{ label: 'Nilai', data: pairs.map((pair) => pair[1]) }],
  };
}
