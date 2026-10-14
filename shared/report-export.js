function escapeReportText(raw) {
  return String(raw == null ? '' : raw)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function sanitizeReportBody(raw) {
  return String(raw == null ? '' : raw)
    .replace(/<(?:script|iframe|object|embed|base|meta|link|form)[\s\S]*?>[\s\S]*?<\/(?:script|iframe|object|embed|base|meta|link|form)>/gi, '')
    .replace(/<\/?(?:script|iframe|object|embed|base|meta|link|form)\b[^>]*>/gi, '')
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(?:href|src|xlink:href|action|formaction)\s*=\s*(['"]?)\s*(?:javascript|vbscript|data\s*:\s*text\/html)[^\s>'"]*\1/gi, 'href="#"');
}

export function buildReportHtml(spec) {
  const title = escapeReportText((spec && spec.title) || 'Laporan');
  const body = sanitizeReportBody((spec && spec.body) || '');
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: blob:;"><title>' + title + '</title><style>'
    + '@page { margin: 18mm; } body { font-family: "Plus Jakarta Sans", sans-serif; color: #111; }'
    + 'h1 { font-family: Fraunces, serif; font-size: 28px; } .kop { border-bottom: 1px solid #111; padding-bottom: 8px; }'
    + 'table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ccc; padding: 6px; }'
    + '.page:after { content: "Halaman " counter(page); }'
    + '</style></head><body><header class="kop"><div>RATEGOAN</div><h1>' + title + '</h1><div>' + date + '</div></header><article>' + body + '</article></body></html>';
}

export function printReport(spec) {
  const html = buildReportHtml(spec);
  const frame = window.open('', '_blank', 'noopener,noreferrer');
  if (!frame) return false;
  frame.document.open();
  frame.document.write(html);
  frame.document.close();
  frame.focus();
  frame.print();
  return true;
}
