import { sanitizeReportBody } from '../../shared/report-export.js';
function downloadBlob(content, mime, filename) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function openPrintable(html) {
  const win = window.open('', '_blank', 'noopener,noreferrer');
  if (!win) return false;
  win.document.write(sanitizeReportBody(html));
  win.document.close();
  return true;
}

function whatsappShareText(text) {
  const url = 'https://wa.me/?text=' + encodeURIComponent(text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

export const exportShare = Object.freeze({
  downloadBlob,
  openPrintable,
  whatsappShareText,
});
