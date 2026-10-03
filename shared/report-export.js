export function buildReportHtml(spec) {
  const title = (spec && spec.title) || 'Laporan';
  const body = (spec && spec.body) || '';
  const date = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return '<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><title>' + title + '</title><style>'
    + '@page { margin: 18mm; } body { font-family: "Plus Jakarta Sans", sans-serif; color: #111; }'
    + 'h1 { font-family: Fraunces, serif; font-size: 28px; } .kop { border-bottom: 1px solid #111; padding-bottom: 8px; }'
    + 'table { border-collapse: collapse; width: 100%; } td, th { border: 1px solid #ccc; padding: 6px; }'
    + '.page:after { content: "Halaman " counter(page); }'
    + '</style></head><body><header class="kop"><div>RATEGOAN</div><h1>' + title + '</h1><div>' + date + '</div></header><article>' + body + '</article></body></html>';
}

export function printReport(spec) {
  const html = buildReportHtml(spec);
  const frame = window.open('', '_blank');
  if (!frame) return false;
  frame.document.open();
  frame.document.write(html);
  frame.document.close();
  frame.focus();
  frame.print();
  return true;
}
