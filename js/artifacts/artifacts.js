import { $ } from '../../shared/dom.js';
import { router } from '../core/router.js';
import { artifact } from '../ui/artifact.js';
import { allArtifacts, exportSlides } from '../../shared/slides-export.js';
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

function paint() {
  const ul = $('artifact-page-list');
  const filters = $('artifact-filters');
  if (!ul) return;
  const list = allArtifacts();
  const present = new Set(list.map((item) => kindOf(item)));
  const tabs = [['semua', 'Semua']].concat([
    ['slide', 'Presentasi'],
    ['document', 'Dokumen'],
    ['code', 'Kode'],
    ['chart', 'Grafik'],
    ['table', 'Tabel'],
  ].filter(([key]) => present.has(key)));
  if (filters) {
    filters.innerHTML = '';
    tabs.forEach(([key, label]) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
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
    li.innerHTML = '<strong>Belum ada artefak</strong><p>Mulai dari salah satu ini.</p>';
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
      li.appendChild(btn);
    });
    ul.appendChild(li);
    return;
  }
  shown.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'artifact-card-page';
    const format = document.createElement('span');
    format.className = 'artifact-format ' + extOf(item).toLowerCase();
    format.textContent = extOf(item);
    const info = document.createElement('div');
    info.className = 'artifact-info';
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
        frame.srcdoc = body;
        return;
      }
      if (item.type === 'code' || item.type === 'document' || item.type === 'table' || item.type === 'chart' || item.type === 'diagram' || item.type === 'report') artifact.open(item);
      else artifact.open(item.outline, item.title, item.fileName);
      router.go('chat');
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
      const rows = Array.isArray(item.rows) ? item.rows : null;
      const body = rows ? rows.map((row) => row.join(',')).join('\n') : String(item.markdown || item.code || '');
      const blob = new Blob([body], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = item.fileName || 'berkas.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    };
    const actions = document.createElement('div');
    actions.className = 'artifact-actions';
    actions.appendChild(open);
    actions.appendChild(save);
    li.appendChild(format);
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
  },
  open() {
    paint();
    router.go('artifacts');
  },
};
