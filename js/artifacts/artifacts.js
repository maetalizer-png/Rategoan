import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { allArtifacts, exportSlides } from '../../shared/slides-export.js';
import { sanitizeReportBody } from '../../shared/report-export.js';
import { buildDocxBytes } from '../../shared/docx-local.js';
import { buildXlsxBytes, sheetFromText } from '../../shared/xlsx-local.js';
import { drawer } from '../ui/drawer.js';

let filter = 'semua';

function kindOf(item) {
  const type = item.type || 'slide';
  if (type === 'slide' || item.outline) return 'slide';
  if (type === 'document' || type === 'report') return 'document';
  if (type === 'code') return 'code';
  if (type === 'chart' || type === 'diagram') return 'chart';
  if (type === 'table') return 'table';
  return type;
}

function extOf(item) {
  const name = String(item.fileName || '');
  const match = name.match(/\.([a-z0-9]+)$/i);
  if (match) return match[1].toUpperCase();
  const kind = kindOf(item);
  if (kind === 'slide') return 'PPTX';
  if (kind === 'code') return 'CODE';
  if (kind === 'document') return 'DOCX';
  if (kind === 'chart') return 'SVG';
  if (kind === 'table') return 'CSV';
  return 'FILE';
}

function relTime(time) {
  if (!time) return '';
  const delta = Date.now() - time;
  if (delta < 60000) return 'Baru saja';
  if (delta < 3600000) return Math.floor(delta / 60000) + ' mnt lalu';
  return new Date(time).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function previewMark(kind) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 280 110');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '110');
  svg.setAttribute('aria-hidden', 'true');
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', '18');
  rect.setAttribute('y', '22');
  rect.setAttribute('width', '244');
  rect.setAttribute('height', '66');
  rect.setAttribute('rx', '8');
  rect.setAttribute('fill', 'none');
  rect.setAttribute('stroke', 'currentColor');
  svg.appendChild(rect);
  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  label.setAttribute('x', '32');
  label.setAttribute('y', '62');
  label.setAttribute('fill', 'currentColor');
  label.setAttribute('font-size', '16');
  label.textContent = kind;
  svg.appendChild(label);
  return svg;
}

function paint() {
  const ul = $('artifact-page-list');
  const filters = $('artifact-filters');
  if (!ul) return;
  const list = allArtifacts();
  const tabs = [
    ['semua', 'Semua'],
    ['slide', 'Presentasi'],
    ['document', 'Dokumen'],
    ['code', 'Kode'],
    ['chart', 'Grafik'],
    ['table', 'Tabel'],
  ];
  if (filters) {
    filters.innerHTML = '';
    tabs.forEach(([key, label]) => {
      const count = key === 'semua' ? list.length : list.filter((item) => kindOf(item) === key).length;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = count > 0 ? (label + ' (' + count + ')') : label;
      btn.className = filter === key ? 'on' : '';
      btn.onclick = () => { filter = key; paint(); };
      filters.appendChild(btn);
    });
  }
  ul.innerHTML = '';
  const shown = list.filter((item) => filter === 'semua' || kindOf(item) === filter);
  if (!shown.length) {
    const li = document.createElement('li');
    li.className = 'coll-empty-card';
    li.innerHTML =
      '<div class="coll-empty-ico"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg></div>' +
      '<strong>Belum ada artefak</strong>' +
      '<p>Mulai dari salah satu ini untuk membuat dokumen, presentasi, atau tabel data.</p>';
    const actionsRow = document.createElement('div');
    actionsRow.className = 'artifact-empty-actions';
    [['Buat dokumen Word', 'Buatkan dokumen Word: '], ['Buat presentasi', 'Buatkan slide: '], ['Buat tabel data', 'Buatkan tabel: ']].forEach(([label, text]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'starter-chip';
      btn.textContent = label;
      btn.onclick = () => {
        const box = $('chat-input');
        if (box) box.value = text;
        router.go('chat');
      };
      actionsRow.appendChild(btn);
    });
    li.appendChild(actionsRow);
    ul.appendChild(li);
    return;
  }
  shown.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'artifact-card-page';
    const preview = document.createElement('div');
    preview.className = 'artifact-preview';
    const format = document.createElement('span');
    format.className = 'artifact-format ' + extOf(item).toLowerCase();
    format.textContent = extOf(item);
    const rawBody = String(item.markdown || '');
    if ((item.type === 'chart' || item.type === 'diagram') && /<svg\b/i.test(rawBody)) {
      const thumb = document.createElement('div');
      thumb.className = 'artifact-preview-svg';
      thumb.innerHTML = sanitizeReportBody(rawBody);
      preview.appendChild(thumb);
    } else {
      preview.appendChild(previewMark(extOf(item)));
    }
    preview.appendChild(format);
    const info = document.createElement('div');
    info.className = 'artifact-card-body';
    const title = document.createElement('strong');
    title.textContent = item.title || item.fileName || 'Berkas';
    const time = document.createElement('span');
    time.className = 'artifact-time';
    const names = { slide: 'Presentasi', document: 'Dokumen', code: 'Kode', chart: 'Grafik', table: 'Tabel' };
    time.textContent = [relTime(item.time), names[kindOf(item)] || ''].filter(Boolean).join(' · ');
    info.appendChild(title);
    info.appendChild(time);
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'btn-art-open';
    open.textContent = 'Pratinjau';
    open.onclick = () => {
      const body = String(item.markdown || item.code || '');
      const frame = $('artifact-inline');
      if (frame && /<\s*(svg|html|div|p|table)\b/i.test(body)) {
        frame.hidden = false;
        frame.srcdoc = '<!doctype html><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src \'none\'; style-src \'unsafe-inline\'; img-src data: blob:;">' + sanitizeReportBody(body);
        return;
      }
      router.go('chat');
      if (item.type === 'code' || item.type === 'document' || item.type === 'table' || item.type === 'chart' || item.type === 'diagram' || item.type === 'report') artifact.open(item);
      else artifact.open(item.outline, item.title, item.fileName);
    };
    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'btn-art-save';
    save.textContent = 'Unduh';
    save.onclick = () => {
      if (item.outline) {
        exportSlides(item.outline, item.fileName || 'slide.pptx');
        return;
      }
      const fileName = item.fileName || 'berkas.txt';
      const rows = Array.isArray(item.rows) ? item.rows : null;
      const body = rows ? rows.map((row) => row.join(',')).join('\n') : String(item.markdown || item.code || '');
      let blob;
      if (item.type === 'docx' || /\.docx$/i.test(fileName)) {
        blob = new Blob([buildDocxBytes(body)], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      } else if (/\.xlsx$/i.test(fileName)) {
        blob = new Blob([buildXlsxBytes(rows || sheetFromText(body), 'jumlah')], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      } else {
        blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
      }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };
    const actions = document.createElement('div');
    actions.className = 'artifact-actions';
    actions.appendChild(open);
    actions.appendChild(save);
    li.appendChild(preview);
    li.appendChild(info);
    li.appendChild(actions);
    ul.appendChild(li);
  });
}

export const artifactsPage = {
  paint,
  bind() {
    const back = $('artifact-page-back');
    if (back) back.onclick = () => router.go('chat');
    const side = $('btn-artifact');
    if (side) side.onclick = () => {
      drawer.close();
      this.open();
    };
    window.addEventListener('hashchange', () => {
      if ((location.hash || '').indexOf('artifacts') >= 0) paint();
    });
    window.addEventListener('rategoan:route', (ev) => {
      if (ev && ev.detail && ev.detail.view === 'artifacts') paint();
    });
    paint();
  },
  open() {
    paint();
    router.go('artifacts');
  },
};
